import path from "node:path";

import xdgAppPaths from "xdg-app-paths";

import type { Pm, Runner } from "./types";

export const PM_NAMES: readonly Pm[] = ["npm", "pnpm", "yarn-classic", "yarn-berry", "bun"];

export const RUNNER_NAMES: readonly Runner[] = ["node"];

export const CONFIG_PROPERTIES = {
    localPm: "LOCAL_PM",
    globalPm: "GLOBAL_PM",
    runner: "RUNNER",
    autoDetect: "AUTO_DETECT",
    promptSelect: "PROMPT_SELECT",
} as const;

export const ENV_NAMES = {
    configFile: "UNPM_CONFIG_FILE",
    localPm: `UNPM_${CONFIG_PROPERTIES.localPm}`,
    globalPm: `UNPM_${CONFIG_PROPERTIES.globalPm}`,
    runner: `UNPM_${CONFIG_PROPERTIES.runner}`,
    autoDetect: `UNPM_${CONFIG_PROPERTIES.autoDetect}`,
    promptSelect: `UNPM_${CONFIG_PROPERTIES.promptSelect}`,
} as const;

export const DEFAULT_CONFIG_FILE_PATHS = (): readonly string[] =>
    xdgAppPaths("unpm")
        .configDirs()
        .map(dir => path.join(dir, "unpmrc"));
