import type { Registry } from "@/types/registry.js";

export const hooks: Registry = [
	{
		name: "use-textarea-resize",
		type: "registry:hook",
		files: [
			{
				path: "hooks/use-textarea-resize.ts",
				type: "registry:hook",
			},
		],
	},
	{
		name: "use-scroll-to-bottom",
		type: "registry:hook",
		files: [
			{
				path: "hooks/use-scroll-to-bottom.ts",
				type: "registry:hook",
			},
		],
	},
];
