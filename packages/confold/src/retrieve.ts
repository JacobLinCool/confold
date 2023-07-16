import path from "node:path";
import fs from "fs-extra";
import type { CheckResult } from "./check";
import { map } from "./utils";

/**
 * Retrieve from confold directory to project root.
 * @param dir project root directory
 * @param checked check result
 */
export function retrieve(dir: string, checked: CheckResult): void {
	const retrievables = checked.items.filter((item) => item.ignored && item.added && item.exists);

	for (const item of retrievables) {
		const [name, target] = map(item.name);
		if (item.uptodate === true) {
			fs.copySync(path.join(dir, target), path.join(dir, name));
		}
	}
}
