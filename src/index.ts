#!/usr/bin/env node

import { Command } from "commander";
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "node:path";
import {
	registryItemSchema,
	registryItemTypeSchema,
	type RegistryItemFile,
	type RegistryItem,
} from "./types/registry.js";
import type { TransformOptions, CliConfig } from "./types/cli.js";
import { buildFileIntoRegistry } from "./lib/registry.js";
import { checkAndCreateDirectory, checkFileExists } from "./lib/utils.js";

const program = new Command();

async function loadConfig(): Promise<CliConfig | null> {
	const configPath = path.join(process.cwd(), "simple-shadcn.json");
	try {
		if (await fs.pathExists(configPath)) {
			const configContent = await fs.readFile(configPath, "utf-8");
			return JSON.parse(configContent);
		}
		return null;
	} catch (error) {
		console.error("Error reading config file:", error);
		return null;
	}
}

async function collectRegistryItem(): Promise<RegistryItem> {
	const questions = [
		{
			type: "input",
			name: "name",
			message:
				"Enter the name of the registry item (optional, will use first file name if not specified):",
		},
		{
			type: "list",
			name: "type",
			message: "What type of registry item is this?",
			choices: registryItemTypeSchema.options,
			default: "registry:ui",
		},
		{
			type: "input",
			name: "description",
			message: "Enter a description (optional):",
		},
		{
			type: "input",
			name: "dependencies",
			message: "Enter npm dependencies (comma-separated, optional):",
			filter: (input: string) =>
				input ? input.split(",").map((d) => d.trim()) : undefined,
		},
		{
			type: "input",
			name: "devDependencies",
			message: "Enter npm dev dependencies (comma-separated, optional):",
			filter: (input: string) =>
				input ? input.split(",").map((d) => d.trim()) : undefined,
		},
		{
			type: "input",
			name: "registryDependencies",
			message:
				"Enter shadcn-cli registry dependencies (comma-separated, optional):",
			filter: (input: string) =>
				input ? input.split(",").map((d) => d.trim()) : undefined,
		},
	];

	const answers = await inquirer.prompt(questions);

	// Collect files (at least one is required)
	const files: RegistryItemFile[] = [];
	let addMoreFiles = true;

	do {
		const fileAnswers = await inquirer.prompt<RegistryItemFile>([
			{
				type: "input",
				name: "path",
				message: `Enter the path for file ${files.length + 1}:`,
				validate: (input: string) => input.length > 0 || "Path is required",
			},
			{
				type: "list",
				name: "type",
				message: "What type of file is this?",
				choices: registryItemTypeSchema.options,
			},
		]);

		files.push(fileAnswers);

		if (files.length >= 1) {
			const { addAnother } = await inquirer.prompt({
				type: "confirm",
				name: "addAnother",
				message: "Do you want to add another file?",
				default: false,
			});
			addMoreFiles = addAnother;
		}
	} while (addMoreFiles);

	let registryItem = {
		...answers,
		files,
	};

	// If name is not provided, derive it from the first file
	if (!registryItem.name && files.length > 0) {
		const firstFilePath = files[0].path;
		const fileName = path.basename(firstFilePath, path.extname(firstFilePath));
		registryItem = {
			...registryItem,
			name: fileName,
		};
	}

	const parsedItem = registryItemSchema.safeParse(registryItem);

	if (!parsedItem.success) {
		console.error("Invalid registry item:", parsedItem.error);
		process.exit(1);
	}

	return parsedItem.data;
}

async function transformFile(options: TransformOptions): Promise<void> {
	try {
		await checkAndCreateDirectory(options.outputDir);

		const registryItem = await collectRegistryItem();
		const outputJson = await buildFileIntoRegistry(registryItem);

		if (!outputJson) {
			console.error("Failed to build registry item");
			process.exit(1);
		}

		const outputPath = path.join(
			options.outputDir,
			`${registryItem.name}.json`,
		);

		// Check if output file exists
		const outputExists = await checkFileExists(outputPath);
		if (outputExists) {
			const { overwrite } = await inquirer.prompt<{ overwrite: boolean }>([
				{
					type: "confirm",
					name: "overwrite",
					message: "Output file already exists. Do you want to overwrite it?",
					default: false,
				},
			]);

			if (!overwrite) {
				console.log("Operation cancelled by user.");
				process.exit(0);
			}
		}

		await fs.writeFile(outputPath, outputJson);
		console.log(`Registry item successfully saved to ${outputPath}!`);
	} catch (error) {
		console.error("Error during file transformation:", error);
		process.exit(1);
	}
}

async function createCommand(): Promise<void> {
	const defaultOutputDir = "public/registry";

	const answers = await inquirer.prompt<TransformOptions>([
		{
			type: "input",
			name: "outputDir",
			message: `Enter the directory path where to save the JSON file (default: ${defaultOutputDir}):`,
			default: defaultOutputDir,
			validate: (input: string) =>
				input.length > 0 || "Please enter a valid directory path",
		},
	]);

	await transformFile(answers);
}

async function buildCommand(): Promise<void> {
	const config = await loadConfig();

	if (!config) {
		console.error(
			"Configuration file not found. Please create a simple-shadcn.json file in your project root with the following structure:",
		);
		console.error(`{
  "registryDirectory": "path/to/your/registry/directory"
}`);
		process.exit(1);
	}

	console.log(`Using registry directory: ${config.registryDirectory}`);
	// Future implementation will scan for files and build registry items
}

async function main() {
	program
		.name("simple-shadcn-cli")
		.description("CLI tool for creating registry items")
		.version("1.0.0");

	program
		.command("create")
		.description("Create a new registry item")
		.action(createCommand);

	program
		.command("build")
		.description("Build registry items from configuration")
		.action(buildCommand);

	await program.parseAsync();
}

main().catch((error) => {
	console.error("An error occurred:", error);
	process.exit(1);
});
