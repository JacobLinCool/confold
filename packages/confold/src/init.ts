import path from "node:path";
import fs from "fs-extra";
import { CONFOLD_DIR, CONFOLD_FILE } from "./constants";

const DOT_CONFOLD = [
	`# You can add files to this file to add them to confold targets.`,
	`# This file uses the same syntax as .gitignore.`,
	"",
].join("\n");

export function init(dir: string): void {
	const confold_dir = path.join(dir, CONFOLD_DIR);
	const confold_file = path.join(dir, CONFOLD_FILE);

	fs.ensureDirSync(confold_dir);

	if (fs.existsSync(confold_file)) {
		throw new Error(`${CONFOLD_FILE} already exists`);
	}

	// create .confold/.confold file
	fs.writeFileSync(confold_file, DOT_CONFOLD);
}
