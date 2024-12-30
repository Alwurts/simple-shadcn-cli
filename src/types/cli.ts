import type { z } from "zod";
import type { registryItemTypeSchema } from "./registry.js";

export interface TransformOptions {
	outputDir: string;
}

export interface CliConfig {
	outputDir: string;
	registryDirectory: string;
}
