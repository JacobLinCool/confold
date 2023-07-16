import path from "node:path";
import fs from "fs-extra";
import type { CheckResult } from "./check";
import { map } from "./utils";

/**
 * Sync from project root to confold directory.
 * @param dir project root directory
 * @param checked check result
 */
export function sync(dir: string, checked: CheckResult) {
	const tracked = checked.items.filter((item) => item.ignored && item.added);

	for (const item of tracked) {
		const [name, target] = map(item.name);
		if (item.uptodate === false) {
			fs.copySync(path.join(dir, name), path.join(dir, target));
		}
	}
}
