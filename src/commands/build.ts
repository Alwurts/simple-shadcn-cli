import type { CliConfig } from "../types/cli.js";
import { registrySchema, type Registry } from "../types/registry.js";
import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import * as esbuild from "esbuild";
import { parseContentOfRegistryFile } from "../lib/registry.js";
import { checkAndCreateDirectory } from "../lib/utils.js";

async function loadConfig(): Promise<CliConfig | null> {
	const configPath = path.join(process.cwd(), "simple-shadcn.json");
	try {
		if (await fs.pathExists(configPath)) {
			const configContent = await fs.readFile(configPath, "utf-8");
			return JSON.parse(configContent);
		}

		console.error(
			"Configuration file not found. Please create a simple-shadcn.json file in your project root with the following structure:",
		);
		console.error(`{
                "outputDir": "path/to/your/output/directory",
                "registryDirectory": "path/to/your/registry/directory"
            }`);
		process.exit(1);
	} catch (error) {
		console.error("Error reading config file:", error);
		return null;
	}
}

async function importRegistry(registryDirectory: string): Promise<Registry> {
	try {
		// Look for both TypeScript and JavaScript index files
		const possibleIndexFiles = [
			path.join(registryDirectory, "index.ts"),
			path.join(registryDirectory, "index.js"),
		];

		const indexFiles = await Promise.all(
			possibleIndexFiles.map(async (file) => ({
				path: file,
				exists: await fs.pathExists(file),
			})),
		);

		const indexPath = indexFiles.find((file) => file.exists)?.path;

		if (!indexPath) {
			console.error(
				"Registry index file not found. Please create either index.ts or index.js in your registry directory.",
			);
			process.exit(1);
		}

		// Create a temporary directory for the compiled output
		const tmpDir = path.join(process.cwd(), ".simple-shadcn-tmp");
		await fs.ensureDir(tmpDir);

		const outfile = path.join(tmpDir, "registry.js");

		// Compile the TypeScript file
		await esbuild.build({
			entryPoints: [indexPath],
			bundle: true,
			platform: "node",
			format: "esm",
			outfile,
			target: "node16",
		});

		// Import the compiled file
		const registryModule = await import(pathToFileURL(outfile).href);

		// Clean up
		await fs.remove(tmpDir);

		if (!registryModule.registry) {
			throw new Error("Registry module must export a 'registry' property");
		}

		return registryModule.registry;
	} catch (error) {
		console.error("Error importing registry:", error);
		process.exit(1);
	}
}

async function parseRegistry(registry: Registry, registryDirectory: string) {
	const parsedRegistry: Registry = [];
	for (const item of registry) {
		const parsedItem = await parseContentOfRegistryFile(
			item,
			registryDirectory,
		);
		parsedRegistry.push(parsedItem);
	}
	return parsedRegistry;
}

async function saveRegistry(registry: Registry, outputDir: string) {
	await checkAndCreateDirectory(outputDir);
	for (const item of registry) {
		const outputPath = path.join(outputDir, `${item.name}.json`);
		await fs.writeFile(outputPath, JSON.stringify(item, null, 2));
	}
}

export async function buildCommand(): Promise<void> {
	const config = await loadConfig();
	if (!config) return;

	console.log("Found file with config:", config);

	const registry = await importRegistry(config.registryDirectory);
	const safeRegistry = registrySchema.safeParse(registry);

	if (!safeRegistry.success) {
		console.error(safeRegistry.error);
		process.exit(1);
	}

	//console.log("Loaded registry:", JSON.stringify(safeRegistry.data, null, 2));
	const parsedRegistry = await parseRegistry(
		safeRegistry.data,
		config.registryDirectory,
	);

	await saveRegistry(parsedRegistry, config.outputDir);

	console.log("Registry saved to", config.outputDir);
}
