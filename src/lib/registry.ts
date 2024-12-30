import type { z } from "zod";
import {
	registryItemSchema,
	type RegistryItem,
	type registryItemTypeSchema,
} from "../types/registry.js";
import fs from "fs-extra";
import path from "node:path";

export async function parseContentOfRegistryFile(registryItem: RegistryItem) {
	try {
		let files: RegistryItem["files"];
		if (registryItem.files) {
			files = await Promise.all(
				registryItem.files.map(async (file) => {
					const fileContent = await fs.readFile(file.path, "utf8");

					const fileName = path.basename(file.path);

					let parsedPath: string;
					switch (file.type) {
						case "registry:ui":
							parsedPath = `ui/${fileName}`;
							break;
						case "registry:lib":
							parsedPath = `lib/${fileName}`;
							break;
						case "registry:hook":
							parsedPath = `hooks/${fileName}`;
							break;
						/* case "registry:block":
						parsedPath = `blocks/${fileName}`;
						break; */
						default:
							parsedPath = fileName;
							break;
					}

					return {
						path: parsedPath,
						type: file.type,
						content: fileContent,
					};
				}),
			);
		}

		const registryItemWithContent = registryItemSchema.safeParse({
			...registryItem,
			files,
		});

		const outputJson = JSON.stringify(registryItemWithContent.data, null, 2);

		return outputJson;
	} catch (error) {
		console.error("Error during file transformation:", error);
		process.exit(1);
	}
}
