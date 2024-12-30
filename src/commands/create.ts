import inquirer from "inquirer";
import fs from "fs-extra";
import path from "node:path";
import {
	registryItemSchema,
	registryItemTypeSchema,
	type RegistryItemFile,
	type RegistryItem,
} from "../types/registry.js";
import { parseContentOfRegistryFile } from "../lib/registry.js";
import { checkAndCreateDirectory, checkFileExists } from "../lib/utils.js";

async function collectAnswers(): Promise<{
	registryItem: RegistryItem;
	outputDir: string;
}> {
	const defaultOutputDir = "public/registry";
	const questionsOutputDir = [
		{
			type: "input",
			name: "outputDir",
			message: `Enter the directory path where to save the JSON file (default: ${defaultOutputDir}):`,
			default: defaultOutputDir,
			validate: (input: string) =>
				input.length > 0 || "Please enter a valid directory path",
		},
	];
	const answersOutputDir = await inquirer.prompt<{ outputDir: string }>(
		questionsOutputDir,
	);

	const questionsRegistryItem = [
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

	const answersRegistryItem = await inquirer.prompt<RegistryItem>(
		questionsRegistryItem,
	);

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
		...answersRegistryItem,
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

	return {
		registryItem: parsedItem.data,
		outputDir: answersOutputDir.outputDir,
	};
}

async function saveRegistryCreated({
	outputDir,
	registryItemWithContent,
}: {
	outputDir: string;
	registryItemWithContent: RegistryItem;
}): Promise<void> {
	try {
		await checkAndCreateDirectory(outputDir);

		const outputPath = path.join(
			outputDir,
			`${registryItemWithContent.name}.json`,
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

		await fs.writeFile(
			outputPath,
			JSON.stringify(registryItemWithContent, null, 2),
		);
		console.log(`\nRegistry item successfully saved to ${outputPath}!`);
	} catch (error) {
		console.error("Error during file transformation:", error);
		process.exit(1);
	}
}

export async function createCommand(): Promise<void> {
	const { registryItem, outputDir } = await collectAnswers();
	const registryItemParsed = await parseContentOfRegistryFile(registryItem);
	await saveRegistryCreated({
		registryItemWithContent: registryItemParsed,
		outputDir,
	});
}
