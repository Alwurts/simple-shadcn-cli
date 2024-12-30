import fs from "fs-extra";

export async function checkAndCreateDirectory(dirPath: string): Promise<void> {
	try {
		await fs.ensureDir(dirPath);
	} catch (error) {
		console.error("Error creating directory:", error);
		process.exit(1);
	}
}

export async function checkFileExists(filePath: string): Promise<boolean> {
	try {
		return await fs.pathExists(filePath);
	} catch (error) {
		console.error("Error checking file existence:", error);
		process.exit(1);
	}
} 