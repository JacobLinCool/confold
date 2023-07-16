import path from "node:path";
import { CONFOLDED_PREFIX, CONFOLD_DIR } from "./constants";

/**
 *
 * @param name
 * @returns The relative path of the original file and the confolded file.
 */
export function map(name: string): [original: string, confolded: string] {
	const original = name;
	const confolded = path.join(CONFOLD_DIR, `${CONFOLDED_PREFIX}${name}`);
	return [original, confolded];
}
