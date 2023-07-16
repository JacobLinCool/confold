import path from "node:path";
import fs from "fs-extra";
import ignore from "ignore";
import { CONFOLD_DIR, CONFOLD_FILE, GITIGNORE_FILE, CONFOLDED_PREFIX } from "./constants";
import { map } from "./utils";

export interface CheckResult {
	/**
	 * Is .confold/.confold exists?
	 */
	init: boolean;
	items: ConfigItem[];
}

export interface ConfigItem {
	/**
	 * The name (relative path) of the item.
	 */
	name: string;
	/**
	 * Is this item has been ignored by git? (defined in .gitignore)
	 */
	ignored: boolean;
	/**
	 * Is this item added to the confold targets? (defined in .confold/.confold)
	 */
	added: boolean;
	/**
	 * Does this item exists (and not ignored) in confold directory?
	 */
	exists: boolean;
	/**
	 * Does this item is up-to-date?
	 */
	uptodate: boolean;
}

export function check(dir: string): CheckResult {
	const confold_dir = path.join(dir, CONFOLD_DIR);
	const confold_file = path.join(dir, CONFOLD_FILE);
	const gitignore_file = path.join(dir, GITIGNORE_FILE);

	const result: CheckResult = {
		init: false,
		items: [],
	};

	// check confold file
	if (fs.existsSync(confold_file)) {
		result.init = true;
	}

	// add all top-level files to items
	const files = fs.readdirSync(dir);
	for (const file of files) {
		const stat = fs.statSync(path.join(dir, file));
		if (stat.isFile() || stat.isDirectory()) {
			const item: ConfigItem = {
				name: file,
				ignored: false,
				added: false,
				exists: false,
				uptodate: false,
			};
			result.items.push(item);
		}
	}

	// check confold file and mark added items
	if (fs.existsSync(confold_file)) {
		const confold = ignore().add(fs.readFileSync(confold_file, "utf8"));
		for (const item of result.items) {
			item.added = confold.ignores(item.name);
		}

		// add all added files to items
		const targets = fs
			.readdirSync(confold_dir)
			.filter(
				(file) =>
					file.startsWith(CONFOLDED_PREFIX) &&
					confold.ignores(file.slice(CONFOLDED_PREFIX.length)),
			);
		for (const file of targets) {
			const original = file.slice(CONFOLDED_PREFIX.length);
			if (!result.items.some((item) => item.name === original)) {
				const item: ConfigItem = {
					name: original,
					ignored: false,
					added: true,
					exists: false,
					uptodate: false,
				};
				result.items.push(item);
			}
		}
	}

	const gitignore = fs.existsSync(gitignore_file)
		? ignore().add(fs.readFileSync(gitignore_file, "utf8"))
		: null;

	// check gitignore file and mark ignored items
	if (gitignore) {
		for (const item of result.items) {
			item.ignored = gitignore.ignores(item.name);
		}
	}

	// check items exists in confold directory and not ignored by git
	for (const item of result.items) {
		const [original, confolded] = map(item.name);
		const ignored = gitignore ? gitignore.ignores(confolded) : false;
		item.exists = !ignored && fs.existsSync(path.join(dir, confolded));

		if (item.exists) {
			if (!fs.existsSync(path.join(dir, original))) {
				item.uptodate = true;
			} else {
				const confolded_stat = fs.statSync(path.join(dir, confolded));
				const original_stat = fs.statSync(path.join(dir, original));
				item.uptodate = confolded_stat.mtimeMs >= original_stat.mtimeMs;
			}
		}
	}

	return result;
}
