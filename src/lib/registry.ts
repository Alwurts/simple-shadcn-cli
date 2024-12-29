import type { z } from "zod";
import {
	registryItemSchema,
	type RegistryItem,
	type registryItemTypeSchema,
} from "../types/registry.js";
import fs from "fs-extra";

const REGISTRY_INDEX_WHITELIST: z.infer<typeof registryItemTypeSchema>[] = [
	"registry:ui",
	"registry:lib",
	"registry:hook",
	"registry:block",
];

export async function buildFileIntoRegistry(registryItem: RegistryItem) {
	if (!REGISTRY_INDEX_WHITELIST.includes(registryItem.type)) {
		return;
	}

	let files: RegistryItem["files"];
	if (registryItem.files) {
		files = await Promise.all(
			registryItem.files.map(async (file) => {
				const fileContent = await fs.readFile(file.path, "utf8");

				return {
					path: file.path,
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
}
