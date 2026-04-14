import { parseValueToBoolean } from "@goodbyenjn/utils";
import { exists, safeReadFile } from "@goodbyenjn/utils/fs";
import * as R from "@goodbyenjn/utils/remeda";
import { err, ok, Result, ResultError } from "@goodbyenjn/utils/result";
import { Command as BaseCmd, Option } from "commander";
import { parse as safeIniParse } from "ini";

import { choicesToString, fmtChoices, fmtErrorMessage } from "@/common/error";
import { detect, resolveCommand } from "@/common/pm";
import { die, exec } from "@/common/process";
import { promptSelectPm } from "@/common/prompt";
import {
    CONFIG_PROPERTIES,
    DEFAULT_CONFIG_FILE_PATHS,
    ENV_NAMES,
    PM_NAMES,
    RUNNER_NAMES,
} from "@/constants";

import { getCmdVersion } from "./env";

import type { Executor, Terminator } from "@/common/process";
import type { Operations, Pm, ResolvedCommand, Runner } from "@/types";
import type { CommandUnknownOpts } from "commander";

export abstract class MainCmd {
    cmd = new BaseCmd()
        .name("unpm")
        .description("UNified Package Manager for Node.js")
        .version(getCmdVersion())
        .addOption(
            new Option("-c, --config <path>", "Path to the configuration file.").env(
                ENV_NAMES.configFile,
            ),
        )
        .addOption(
            new Option("--pm <package-manager>", "The package manager to use.").choices(PM_NAMES),
        )
        .addOption(
            // Only for environment variable, not exposed as CLI option
            new Option("--global-pm <package-manager>")
                .choices(PM_NAMES)
                .env(ENV_NAMES.globalPm)
                .hideHelp(),
        )
        .addOption(
            // Only for environment variable, not exposed as CLI option
            new Option("--local-pm <package-manager>")
                .choices(PM_NAMES)
                .env(ENV_NAMES.localPm)
                .hideHelp(),
        )
        .addOption(
            new Option("--runner <runner>", "The script runner to use.")
                .choices(RUNNER_NAMES)
                .env(ENV_NAMES.runner),
        )
        .option("--no-auto-detect", "Disable auto-detection of package manager.")
        .option(
            "--no-prompt-select",
            "Disable prompt-selection when no package manager is specified.",
        )
        .option("--dry-run", "Print the command without executing it.")
        .helpCommand("help [command]", "Display help for command.")
        .helpOption(undefined, "Display help for command.")
        .enablePositionalOptions()
        .configureOutput({
            outputError: (str, write) => write(fmtErrorMessage(str) + "\n"),
        })
        .hook("preAction", async () => {
            const result = await this.resolve();
            if (result.isErr()) {
                this.terminator(ResultError.fmt(result));
            }
        })
        .action(() => {});

    localPm: Pm | undefined;
    globalPm: Pm | undefined;
    runner: Pm | Runner | undefined;
    autoDetect: boolean | undefined;
    promptSelect: boolean | undefined;

    readonly executor: Executor = exec;
    readonly terminator: Terminator = die;

    get dryRun() {
        return this.cmd.getOptionValue("dryRun") === true;
    }

    constructor(executor?: Executor, terminator?: Terminator) {
        if (executor) {
            this.executor = executor;
        }
        if (terminator) {
            this.terminator = terminator;
        }
    }

    async exec(...args: Parameters<typeof this.cmd.parseAsync>) {
        await this.cmd.parseAsync(...args);
    }

    resolve() {
        // eslint-disable-next-line complexity
        return Result.gen(async function* () {
            // 1. Resolve cli options
            const { cliPm, cliLocalPm, cliGlobalPm, cliRunner, cliAutoDetect, cliPromptSelect } =
                yield* this.resolveCliOptions();
            this.localPm = cliPm ?? cliLocalPm;
            this.globalPm = cliPm ?? cliGlobalPm;
            this.runner = cliRunner;
            this.autoDetect = cliAutoDetect;
            this.promptSelect = cliPromptSelect;

            // 2. Resolve environment variable options
            if (this.autoDetect === undefined || this.promptSelect === undefined) {
                const { envAutoDetect, envPromptSelect } = this.resolveEnvOptions();
                this.autoDetect ??= envAutoDetect;
                this.promptSelect ??= envPromptSelect;
            }

            // 3. Resolve configs from config file if some options are not specified
            if (
                !this.localPm ||
                !this.globalPm ||
                !this.runner ||
                this.autoDetect === undefined ||
                this.promptSelect === undefined
            ) {
                const {
                    configLocalPm,
                    configGlobalPm,
                    configRunner,
                    configAutoDetect,
                    configPromptSelect,
                } = (yield* await this.resolveConfigFile()) || {};
                this.localPm ??= configLocalPm;
                this.globalPm ??= configGlobalPm;
                this.runner ??= configRunner;
                this.autoDetect ??= configAutoDetect;
                this.promptSelect ??= configPromptSelect;
            }

            // 4. Detect if localPm is not specified by options or config file
            if (!this.localPm && this.autoDetect !== false) {
                this.localPm ??= yield* await this.detectPm();
                this.runner ??= this.localPm;
            }

            return ok();
        }, this);
    }

    async resolveConfigFile() {
        let source: string;
        let configFile = this.cmd.getOptionValue("config");

        // 1. environment variable or cli option
        // 2. default paths
        if (configFile !== undefined) {
            source = `specified via ${this.cmd.getOptionValueSource("config") === "cli" ? "cli option: '-c/--config'" : `environment variable: '${ENV_NAMES.configFile}'`}`;

            if (configFile.length === 0) {
                return err(`Config file path is empty, ${source}.`);
            }
        } else {
            const defaultConfigFiles = DEFAULT_CONFIG_FILE_PATHS();

            [configFile] = await R.pipe(
                defaultConfigFiles,
                R.map(async path => ({
                    path,
                    exists: await exists(path),
                })),
                R.filterP(result => result.exists),
                R.mapP(result => result.path),
                R.awaitAll,
            );
            if (!configFile) return ok(undefined);

            source = `found at '${configFile}' in default paths`;
        }

        return Result.gen(async function* () {
            const content = configFile
                ? yield* (await safeReadFile(configFile)).context(
                      `Failed to read config file '${configFile}', ${source}.`,
                  )
                : undefined;
            const configs = content ? safeIniParse(content) : {};

            const validateConfigValue = <T extends Pm | Runner>(
                property: keyof typeof CONFIG_PROPERTIES,
                choices: readonly T[],
            ): Result<T | undefined, string> => {
                const key = CONFIG_PROPERTIES[property];
                const value: T | undefined = configs[key];
                if (value === undefined) return ok(undefined);

                if (choices.includes(value)) {
                    return ok(value);
                } else {
                    return err(
                        `Invalid value for '${key}': '${value}'. ${fmtChoices(choices)}.`,
                    ).context(`Invalid config file '${configFile}', ${source}.`);
                }
            };

            const configLocalPm = yield* validateConfigValue<Pm>("localPm", PM_NAMES);
            const configGlobalPm = yield* validateConfigValue<Pm>("globalPm", PM_NAMES);
            const configRunner = yield* validateConfigValue<Runner>("runner", RUNNER_NAMES);
            const configAutoDetect = parseValueToBoolean(
                configs[CONFIG_PROPERTIES.autoDetect],
                undefined,
            );
            const configPromptSelect = parseValueToBoolean(
                configs[CONFIG_PROPERTIES.promptSelect],
                undefined,
            );

            return ok({
                configLocalPm,
                configGlobalPm,
                configRunner,
                configAutoDetect,
                configPromptSelect,
            });
        });
    }

    resolveEnvOptions() {
        const envAutoDetect = parseValueToBoolean(process.env[ENV_NAMES.autoDetect], undefined);
        const envPromptSelect = parseValueToBoolean(process.env[ENV_NAMES.promptSelect], undefined);

        return { envAutoDetect, envPromptSelect };
    }

    resolveCliOptions() {
        const validateOptionValue = <T extends Pm | Runner>(
            key: "pm" | keyof typeof CONFIG_PROPERTIES,
            choices: readonly T[],
            context: string,
        ): Result<T | undefined, string> => {
            const value = this.cmd.getOptionValue(key) as T | undefined;
            if (value === undefined) return ok(undefined);

            if (choices.includes(value)) {
                return ok(value);
            } else {
                return err(`Invalid value: '${value}'. ${fmtChoices(choices)}.`).context(context);
            }
        };

        return Result.gen(function* () {
            const cliPm = yield* validateOptionValue(
                "pm",
                PM_NAMES,
                `Invalid package manager, specified via cli option '--pm'.`,
            );
            const cliLocalPm = yield* validateOptionValue(
                "localPm",
                PM_NAMES,
                `Invalid package manager, specified via environment variable '${ENV_NAMES.localPm}'.`,
            );
            const cliGlobalPm = yield* validateOptionValue(
                "globalPm",
                PM_NAMES,
                `Invalid package manager, specified via environment variable '${ENV_NAMES.globalPm}'.`,
            );
            const cliRunner = yield* validateOptionValue(
                "runner",
                RUNNER_NAMES,
                `Invalid script runner, specified via ${this.cmd.getOptionValueSource("runner") === "cli" ? "cli option '--runner'" : `environment variable '${ENV_NAMES.runner}'`}.`,
            );
            const cliAutoDetect =
                this.cmd.getOptionValueSource("autoDetect") === "default"
                    ? undefined
                    : this.cmd.getOptionValue("autoDetect");
            const cliPromptSelect =
                this.cmd.getOptionValueSource("promptSelect") === "default"
                    ? undefined
                    : this.cmd.getOptionValue("promptSelect");

            return ok({
                cliPm,
                cliLocalPm,
                cliGlobalPm,
                cliRunner,
                cliAutoDetect,
                cliPromptSelect,
            });
        }, this);
    }

    async detectPm() {
        return Result.gen(async function* () {
            const pm = yield* await detect();
            if (!pm) return ok(undefined);

            if (PM_NAMES.includes(pm)) {
                return ok(pm);
            } else {
                return err(`Package manager detected in the project.`).context(
                    `Unsupported package manager: '${pm}'. Supported package managers are: ${choicesToString(PM_NAMES)}`,
                );
            }
        }, this);
    }
}

export abstract class SubCmd {
    readonly main: MainCmd;

    resolvedCmd: ResolvedCommand | undefined;

    abstract readonly sub: CommandUnknownOpts;

    abstract get pm(): Pm | Runner | undefined;
    abstract get operation(): Operations;

    constructor(main: MainCmd) {
        this.main = main;
    }

    register(defaults?: boolean) {
        this.sub
            .hook("preAction", async () => {
                const result = await this.resolve();
                if (result.isErr()) {
                    this.main.terminator(ResultError.fmt(result));
                }
            })
            .action(async () => {
                if (this.resolvedCmd) {
                    await this.main.executor(this.resolvedCmd);
                }
            });

        this.main.cmd.addCommand(this.sub, { isDefault: defaults });
    }

    resolve() {
        return Result.gen(async function* () {
            const pm = yield* await this.resolvePm();
            const args = yield* this.resolveArgs(pm);
            const cmd = yield* resolveCommand(pm, this.operation, args);

            this.resolvedCmd = { ...cmd, dryRun: this.main.dryRun };

            return ok();
        }, this);
    }

    resolveArgs(_pm: string): Result<string[], string> {
        return ok(this.sub.args);
    }

    async resolvePm(): Promise<Result<Pm | Runner, string>> {
        if (this.pm) return ok(this.pm);
        if (this.main.promptSelect !== false) return await promptSelectPm();

        return err(
            `No package manager specified and prompt to select package manager is disabled. Please specify package manager.`,
        );
    }
}
