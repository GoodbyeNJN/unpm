import { isArray } from "@goodbyenjn/utils/remeda";
import { err, ok } from "@goodbyenjn/utils/result";
import { detect as baseDetect } from "package-manager-detector";

import { unsupported } from "./error";

import type { Operations, Pm, Runner } from "@/types";
import type { Err } from "@goodbyenjn/utils/result";

type NormalizedArgs = [string, ...string[]];
type ArgsTemplate = [string, ...(string | typeof ARGS | typeof DOUBLE_DASH_ARGS)[]];
type OperationToArgsMap = Record<Operations, ArgsTemplate | Err<string>>;

const DOUBLE_DASH_ARGS = Symbol("double-dash-args");
const ARGS = Symbol("args");

const npm = {
    pm: ["npm", ARGS],
    add: ["npm", "add", ARGS],
    "global-add": ["npm", "add", "--global", ARGS],
    remove: ["npm", "remove", ARGS],
    "global-remove": ["npm", "remove", "--global", ARGS],
    list: ["npm", "list", ARGS],
    "global-list": ["npm", "list", "--global", ARGS],
    install: ["npm", "install", ARGS],
    "frozen-install": ["npm", "ci", ARGS],
    update: ["npm", "update", ARGS],
    "global-update": ["npm", "update", "--global", ARGS],
    "interactive-update": err(unsupported("npm", "Interactive update packages")),
    "global-interactive-update": err(unsupported("npm", "Interactive update global packages")),
    dlx: ["npx", ARGS],
    exec: ["npm", "exec", ARGS],
    run: ["npm", "run", DOUBLE_DASH_ARGS],
} satisfies OperationToArgsMap;
const pnpm = {
    pm: ["pnpm", ARGS],
    add: ["pnpm", "add", ARGS],
    "global-add": ["pnpm", "add", "--global", ARGS],
    remove: ["pnpm", "remove", ARGS],
    "global-remove": ["pnpm", "remove", "--global", ARGS],
    list: ["pnpm", "list", ARGS],
    "global-list": ["pnpm", "list", "--global", ARGS],
    install: ["pnpm", "install", ARGS],
    "frozen-install": ["pnpm", "install", "--frozen-lockfile", ARGS],
    update: ["pnpm", "update", ARGS],
    "global-update": ["pnpm", "update", "--global", ARGS],
    "interactive-update": ["pnpm", "update", "--interactive", ARGS],
    "global-interactive-update": ["pnpm", "update", "--global", "--interactive", ARGS],
    dlx: ["pnpm", "dlx", ARGS],
    exec: ["pnpm", "exec", ARGS],
    run: ["pnpm", "run", ARGS],
} satisfies OperationToArgsMap;
const yarnClassic = {
    pm: ["yarn", ARGS],
    add: ["yarn", "add", ARGS],
    "global-add": ["yarn", "global", "add", ARGS],
    remove: ["yarn", "remove", ARGS],
    "global-remove": ["yarn", "global", "remove", ARGS],
    list: ["yarn", "list", ARGS],
    "global-list": ["yarn", "global", "list", ARGS],
    install: ["yarn", "install", ARGS],
    "frozen-install": ["yarn", "install", "--frozen-lockfile", ARGS],
    update: ["yarn", "upgrade", ARGS],
    "global-update": ["yarn", "global", "upgrade", ARGS],
    "interactive-update": ["yarn", "upgrade-interactive", ARGS],
    "global-interactive-update": ["yarn", "global", "upgrade-interactive", ARGS],
    dlx: err(unsupported("yarn-classic", "Run commands from remote packages")),
    exec: ["yarn", "exec", DOUBLE_DASH_ARGS],
    run: ["yarn", "run", ARGS],
} satisfies OperationToArgsMap;
const yarnBerry = {
    ...yarnClassic,
    "global-add": err(unsupported("yarn-berry", "Add global packages")),
    "global-remove": err(unsupported("yarn-berry", "Remove global packages")),
    list: ["yarn", "info", "--name-only", ARGS],
    "global-list": err(unsupported("yarn-berry", "List global packages")),
    "frozen-install": ["yarn", "install", "--immutable", ARGS],
    update: ["yarn", "up", ARGS],
    "global-update": err(unsupported("yarn-berry", "Update global packages")),
    "global-interactive-update": err(
        unsupported("yarn-berry", "Interactive update global packages"),
    ),
    dlx: ["yarn", "dlx", ARGS],
    exec: ["yarn", "exec", ARGS],
} satisfies OperationToArgsMap;
const bun = {
    pm: ["bun", ARGS],
    add: ["bun", "add", ARGS],
    "global-add": ["bun", "add", "--global", ARGS],
    remove: ["bun", "remove", ARGS],
    "global-remove": ["bun", "remove", "--global", ARGS],
    list: ["bun", "list", ARGS],
    "global-list": err(unsupported("bun", "List global packages")),
    install: ["bun", "install", ARGS],
    "frozen-install": ["bun", "install", "--frozen-lockfile", ARGS],
    update: ["bun", "update", ARGS],
    "global-update": ["bun", "update", "--global", ARGS],
    "interactive-update": ["bun", "update", "--interactive", ARGS],
    "global-interactive-update": ["bun", "update", "--global", "--interactive", ARGS],
    dlx: ["bun", "x", ARGS],
    exec: ["bun", "x", ARGS],
    run: ["bun", "run", ARGS],
} satisfies OperationToArgsMap;
const node = {
    run: ["node", "--run", ARGS] as ArgsTemplate,
};

const commands = {
    npm,
    pnpm,
    "yarn-classic": yarnClassic,
    "yarn-berry": yarnBerry,
    bun,
};

export interface ResolveOptions {
    pm: Pm | Runner;
    operation: Operations;
    pmArgs: string[];
    passthroughArgs: string[];
}

export const resolveCommand = (pm: Pm | Runner, operation: Operations, args: string[]) => {
    const command: ArgsTemplate | Err<string> = pm === "node" ? node.run : commands[pm][operation];
    if (!isArray(command)) return command;

    let pmArgs: string[];
    let passthroughArgs: string[];
    const doubleDashIndex = args.indexOf("--");
    if (doubleDashIndex === -1) {
        pmArgs = [];
        passthroughArgs = args;
    } else {
        pmArgs = args.slice(0, doubleDashIndex);
        passthroughArgs = args.slice(doubleDashIndex + 1);
    }

    const normalized: NormalizedArgs = [command[0]];
    for (const arg of command.slice(1)) {
        switch (arg) {
            case DOUBLE_DASH_ARGS: {
                normalized.push(...pmArgs);
                if (passthroughArgs.length > 1) {
                    normalized.push(
                        ...passthroughArgs.slice(0, 1),
                        "--",
                        ...passthroughArgs.slice(1),
                    );
                } else {
                    normalized.push(...passthroughArgs);
                }
                break;
            }
            case ARGS: {
                normalized.push(...pmArgs, ...passthroughArgs);
                break;
            }
            default: {
                normalized.push(arg);
            }
        }
    }

    const resolved = {
        command: normalized[0],
        args: normalized.slice(1),
    };

    return ok(resolved);
};

export const detect = async (...args: Parameters<typeof baseDetect>) => {
    const { agent } = (await baseDetect(...args)) || {};
    if (!agent) return ok(undefined);

    let pm: Pm;
    switch (agent) {
        case "yarn": {
            pm = "yarn-classic";
            break;
        }
        case "yarn@berry": {
            pm = "yarn-berry";
            break;
        }
        case "pnpm@6": {
            pm = "pnpm";
            break;
        }
        default: {
            pm = agent as Pm;
        }
    }

    return ok(pm);
};
