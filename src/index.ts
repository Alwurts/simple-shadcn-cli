#!/usr/bin/env node

import { Command } from "commander";
import { createCommand } from "./commands/create.js";
import { buildCommand } from "./commands/build.js";

const program = new Command();

async function main() {
	program
		.name("simple-shadcn-cli")
		.description("CLI tool for creating registry items");

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
