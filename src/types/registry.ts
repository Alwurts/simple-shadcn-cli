import { z } from "zod";

export const registryItemTypeSchema = z.enum([
	"registry:ui",
	"registry:lib",
	"registry:hook",
]);

export const registryItemFileSchema = z.object({
	path: z.string(),
	content: z.string().optional(),
	type: registryItemTypeSchema,
	target: z.string().optional(),
});

export const registryItemSchema = z.object({
	name: z.string().optional(),
	type: registryItemTypeSchema.default("registry:ui"),
	description: z.string().optional(),
	dependencies: z.array(z.string()).optional().describe("npm dependencies"),
	devDependencies: z
		.array(z.string())
		.optional()
		.describe("npm dev dependencies"),
	registryDependencies: z
		.array(z.string())
		.optional()
		.describe("shadcn-cli registry dependencies"),
	files: z
		.array(registryItemFileSchema)
		.optional()
		.describe(
			"The files that constitute this registry item, it can be for example a registry:ui file and a registry:hook file",
		),
});

export type RegistryItem = z.infer<typeof registryItemSchema>;

export const registrySchema = z.array(registryItemSchema);

export type Registry = z.infer<typeof registrySchema>;
