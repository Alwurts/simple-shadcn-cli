import type { Registry } from "@/types/registry.js";
import { ui } from "./registry-ui.js";
import { hooks } from "./registry-hooks.js";

export const registry: Registry = [...ui, ...hooks];
