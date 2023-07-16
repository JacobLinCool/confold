#!/usr/bin/env node
import path from "node:path";
import chalk from "chalk";
import { program } from "commander";
import { check } from "./check";
import { init } from "./init";
import { pkg } from "./pkg";
import { retrieve } from "./retrieve";
import { sync } from "./sync";

program.name(pkg.name).description(pkg.description).version(pkg.version);

program
	.command("check")
	.description("check confold status")
	.argument("[dir]", "Directory to check", process.cwd())
	.action((dir: string) => {
		const result = check(dir);

		console.log("confold initialized:", chalk.yellow(result.init ? "yes" : "no"));

		if (result.init) {
			console.group("tracked by confold:");
			const tracked = result.items.filter((item) => item.ignored && item.added);
			if (tracked.length === 0) {
				console.log(chalk.yellow("No tracked files"));
			}

			for (const item of tracked) {
				if (item.exists === false) {
					console.log(
						chalk.red(path.relative(dir, item.name)),
						chalk.red("(missing or ignored)"),
					);
				} else if (item.uptodate === false) {
					console.log(
						chalk.yellow(path.relative(dir, item.name)),
						chalk.yellow("(outdated)"),
					);
				} else {
					console.log(chalk.green(path.relative(dir, item.name)));
				}
			}
			console.groupEnd();
		}
	});

program
	.command("init")
	.description("initialize confold")
	.argument("[dir]", "Directory to initialize", process.cwd())
	.action((dir: string) => {
		try {
			init(dir);
			console.log(chalk.green("confold initialized successfully in", dir));
		} catch (e) {
			if (e instanceof Error) {
				console.error(chalk.red(e.message));
			}
			process.exit(1);
		}
	});

program
	.command("sync")
	.alias("track")
	.description("sync configuration files to confold")
	.argument("[dir]", "Directory to sync", process.cwd())
	.action((dir: string) => {
		try {
			const result = check(dir);
			if (result.init === false) {
				console.log(chalk.yellow("confold not initialized, nothing to sync"));
				return;
			}

			sync(dir, result);
			console.log(chalk.green("configuration files synced successfully to confold"));
		} catch (e) {
			if (e instanceof Error) {
				console.error(chalk.red(e.message));
			}
			process.exit(1);
		}
	});

program
	.command("retrieve")
	.alias("restore")
	.description("retrieve configuration files from confold")
	.argument("[dir]", "Directory to retrieve", process.cwd())
	.action((dir: string) => {
		try {
			const result = check(dir);
			if (result.init === false) {
				console.log(chalk.yellow("confold not initialized, nothing to retrieve"));
				return;
			}

			retrieve(dir, result);
			console.log(chalk.green("configuration files retrieved successfully from confold"));
		} catch (e) {
			if (e instanceof Error) {
				console.error(chalk.red(e.message));
			}
			process.exit(1);
		}
	});

program.parse(process.argv);
