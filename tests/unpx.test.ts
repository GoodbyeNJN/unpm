/* eslint-disable no-empty-pattern */

import { unindent } from "@goodbyenjn/utils";
import { describe } from "vitest";

import { CONFIG_PROPERTIES } from "@/constants";

import { test } from "./helpers/tester";

import type { Pm } from "@/types";

const DlxCmd = () => import("@/commands/dlx").then(mod => mod.DlxCmd);

const makeCase = <T extends string[] | null>(pm: Pm, execArgs: string[], expectedArgs: T) =>
    [pm, execArgs, (pm === "npm" ? "npx" : pm).replace(/-.*/, ""), expectedArgs] as const;

const noPromptSelect = "--no-prompt-select";
const prettier = ["prettier", "--write", "."];

describe("Load config file", () => {
    const validConfigContent = unindent`
        ${CONFIG_PROPERTIES.globalPm} = npm
    `;

    test("From default paths", async ({
        defaultConfigFile,
        mock: { fs },
        unpx: { cmd, exec, register },
        expect,
    }) => {
        fs.fromJSON({ [defaultConfigFile]: validConfigContent });

        register(await DlxCmd(), true);
        const { errorMessage } = await exec(...prettier);

        expect(errorMessage).toBeUndefined();
        expect(cmd.globalPm).toBe("npm");
    });

    test("From CLI option", async ({
        userConfigFile,
        mock: { fs },
        unpx: { cmd, exec, register },
        expect,
    }) => {
        fs.fromJSON({ [userConfigFile]: validConfigContent });

        register(await DlxCmd(), true);
        const { errorMessage } = await exec("-c", userConfigFile, ...prettier);

        expect(errorMessage).toBeUndefined();
        expect(cmd.globalPm).toBe("npm");
    });

    test("From environment variable", async ({
        userConfigFile,
        mock: { envs, fs },
        unpx: { cmd, exec, register },
        expect,
    }) => {
        fs.fromJSON({ [userConfigFile]: validConfigContent });
        envs.configFile(userConfigFile);

        register(await DlxCmd(), true);
        const { errorMessage } = await exec(...prettier);

        expect(errorMessage).toBeUndefined();
        expect(cmd.globalPm).toBe("npm");
    });

    test("Invalid config file", async ({
        invalidConfigFile,
        mock: { fs },
        unpx: { cmd, exec, register },
        expect,
    }) => {
        fs.fromJSON({ [invalidConfigFile]: "invalid content" });

        register(await DlxCmd(), true);
        const { errorMessage } = await exec(noPromptSelect, "-c", invalidConfigFile, ...prettier);

        expect(errorMessage).not.toBeUndefined();
        expect(cmd.globalPm).toBe(undefined);
    });

    test("Non-existent config file", async ({
        nonExistentConfigFile,
        mock: {},
        unpx: { cmd, exec, register },
        expect,
    }) => {
        register(await DlxCmd(), true);
        const { errorMessage } = await exec(
            noPromptSelect,
            "-c",
            nonExistentConfigFile,
            ...prettier,
        );

        expect(errorMessage).not.toBeUndefined();
        expect(cmd.globalPm).toBe(undefined);
    });

    test("Override config file with CLI options and environment variables", async ({
        userConfigFile,
        mock: { envs, fs },
        unpx: { cmd, exec, register },
        expect,
    }) => {
        fs.fromJSON({ [userConfigFile]: validConfigContent }); // globalPm = npm
        envs.globalPm("bun");

        register(await DlxCmd(), true);
        const { errorMessage } = await exec("-c", userConfigFile, ...prettier);

        expect(errorMessage).toBeUndefined();
        expect(cmd.globalPm).toBe("bun");
    });
});

describe("Resolve package manager", () => {
    test("From CLI option", async ({ mock: {}, unpx: { cmd, exec, register }, expect }) => {
        register(await DlxCmd(), true);
        const { errorMessage } = await exec("--pm", "pnpm", ...prettier);

        expect(errorMessage).toBeUndefined();
        expect(cmd.globalPm).toBe("pnpm");
    });

    test("From environment variable", async ({
        mock: { envs },
        unpx: { cmd, exec, register },
        expect,
    }) => {
        envs.globalPm("bun");

        register(await DlxCmd(), true);
        const { errorMessage } = await exec(...prettier);

        expect(errorMessage).toBeUndefined();
        expect(cmd.globalPm).toBe("bun");
    });

    test("Disable prompt-selection", async ({
        mock: {},
        unpx: { cmd, exec, register },
        expect,
    }) => {
        register(await DlxCmd(), true);
        const { errorMessage } = await exec(noPromptSelect, ...prettier);

        expect(errorMessage).not.toBeUndefined();
        expect(cmd.globalPm).toBe(undefined);
        expect(cmd.promptSelect).toBe(false);
    });

    test("Override environment variable with CLI option", async ({
        mock: { envs },
        unpx: { cmd, exec, register },
        expect,
    }) => {
        envs.globalPm("npm");

        register(await DlxCmd(), true);
        const { errorMessage } = await exec("--pm", "pnpm", ...prettier);

        expect(errorMessage).toBeUndefined();
        expect(cmd.globalPm).toBe("pnpm");
    });
});

describe("Unpx command", () => {
    test.for([
        makeCase("npm", prettier, []),
        makeCase("pnpm", prettier, ["dlx"]),
        makeCase("yarn-classic", prettier, null),
        makeCase("yarn-berry", prettier, ["dlx"]),
        makeCase("bun", prettier, ["x"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { envs, fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);
            envs.globalPm(pm);

            register(await DlxCmd(), true);
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(...execArgs);

            if (args === null) {
                expect(errorMessage).not.toBeUndefined();
                return;
            }

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);
            expect(resolvedArgs).toMatchObject([...args, ...prettier]);
        },
    );
});

describe("Unpx command with unknown arguments", () => {
    const unknownDoubleDash = ["--parallel", "--"];

    test.for([
        makeCase("npm", unknownDoubleDash, ["--parallel"]),
        makeCase("pnpm", unknownDoubleDash, ["dlx", "--parallel"]),
        makeCase("yarn-classic", unknownDoubleDash, null),
        makeCase("yarn-berry", unknownDoubleDash, ["dlx", "--parallel"]),
        makeCase("bun", unknownDoubleDash, ["x", "--parallel"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { envs, fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);
            envs.globalPm(pm);

            register(await DlxCmd(), true);
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                ...execArgs,
                ...prettier,
            );

            if (args === null) {
                expect(errorMessage).not.toBeUndefined();
                return;
            }

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);
            expect(resolvedArgs).toMatchObject([...args, ...prettier]);
        },
    );
});
