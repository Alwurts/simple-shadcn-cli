#!/usr/bin/env node

import { Command } from "commander";
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "node:path";
import { registryItemSchema, registryItemTypeSchema, type RegistryItem, type registryItemFileSchema } from "./types/registry.js";
import { buildFileIntoRegistry } from "./lib/registry.js";
import type { z } from "zod";

const program = new Command();

interface TransformOptions {
	outputDir: string;
}

interface FileAnswer {
	path: string;
	type: z.infer<typeof registryItemTypeSchema>;
}

async function checkAndCreateDirectory(dirPath: string): Promise<void> {
	try {
		await fs.ensureDir(dirPath);
	} catch (error) {
		console.error("Error creating directory:", error);
		process.exit(1);
	}
}

async function checkFileExists(filePath: string): Promise<boolean> {
	try {
		return await fs.pathExists(filePath);
	} catch (error) {
		console.error("Error checking file existence:", error);
		process.exit(1);
	}
}

async function collectRegistryItem(): Promise<RegistryItem> {
	const questions = [
		{
			type: "input",
			name: "name",
			message: "Enter the name of the registry item:",
			validate: (input: string) => input.length > 0 || "Name is required",
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
			filter: (input: string) => input ? input.split(",").map(d => d.trim()) : undefined,
		},
		{
			type: "input",
			name: "devDependencies",
			message: "Enter npm dev dependencies (comma-separated, optional):",
			filter: (input: string) => input ? input.split(",").map(d => d.trim()) : undefined,
		},
		{
			type: "input",
			name: "registryDependencies",
			message: "Enter shadcn-cli registry dependencies (comma-separated, optional):",
			filter: (input: string) => input ? input.split(",").map(d => d.trim()) : undefined,
		},
	];

	const answers = await inquirer.prompt(questions);
	
	// Collect files (at least one is required)
	const files: FileAnswer[] = [];
	let addMoreFiles = true;

	do {
		const fileAnswers = await inquirer.prompt<FileAnswer>([
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

	const registryItem = {
		...answers,
		files,
	};

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

		const outputPath = path.join(options.outputDir, `${registryItem.name}.json`);

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

async function main() {
	program
		.name("simple-shadcn-cli")
		.description("CLI tool for creating registry items")
		.version("1.0.0");

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

main().catch((error) => {
	console.error("An error occurred:", error);
	process.exit(1);
});
