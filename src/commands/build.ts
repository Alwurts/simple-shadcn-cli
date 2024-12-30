import type { CliConfig } from "../types/cli.js";
import fs from "fs-extra";
import path from "node:path";

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

export async function buildCommand(): Promise<void> {
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
