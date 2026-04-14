/* eslint-disable no-empty-pattern */

import { unindent } from "@goodbyenjn/utils";
import { describe } from "vitest";

import { CONFIG_PROPERTIES } from "@/constants";

import { test } from "./helpers/tester";

describe("Load config file", () => {
    const validConfigContent = unindent`
        ${CONFIG_PROPERTIES.localPm} = yarn-classic
        ${CONFIG_PROPERTIES.globalPm} = npm
        ${CONFIG_PROPERTIES.runner} = node
        ${CONFIG_PROPERTIES.autoDetect} = no
    `;

    test("From default paths", async ({
        defaultConfigFile,
        mock: { fs },
        unpm: { cmd, exec },
        expect,
    }) => {
        fs.fromJSON({ [defaultConfigFile]: validConfigContent });

        const { errorMessage } = await exec();

        expect(errorMessage).toBeUndefined();
        expect(cmd.localPm).toBe("yarn-classic");
        expect(cmd.globalPm).toBe("npm");
        expect(cmd.runner).toBe("node");
        expect(cmd.autoDetect).toBe(false);
    });

    test("From CLI option", async ({
        userConfigFile,
        mock: { fs },
        unpm: { cmd, exec },
        expect,
    }) => {
        fs.fromJSON({ [userConfigFile]: validConfigContent });

        const { errorMessage } = await exec("-c", userConfigFile);

        expect(errorMessage).toBeUndefined();
        expect(cmd.localPm).toBe("yarn-classic");
        expect(cmd.globalPm).toBe("npm");
        expect(cmd.runner).toBe("node");
        expect(cmd.autoDetect).toBe(false);
    });

    test("From environment variable", async ({
        userConfigFile,
        mock: { envs, fs },
        unpm: { cmd, exec },
        expect,
    }) => {
        fs.fromJSON({ [userConfigFile]: validConfigContent });
        envs.configFile(userConfigFile);

        const { errorMessage } = await exec();

        expect(errorMessage).toBeUndefined();
        expect(cmd.localPm).toBe("yarn-classic");
        expect(cmd.globalPm).toBe("npm");
        expect(cmd.runner).toBe("node");
        expect(cmd.autoDetect).toBe(false);
    });

    test("Invalid config file", async ({
        invalidConfigFile,
        mock: { fs },
        unpm: { cmd, exec },
        expect,
    }) => {
        fs.fromJSON({ [invalidConfigFile]: "invalid content" });

        const { errorMessage } = await exec("-c", invalidConfigFile);

        expect(errorMessage).toBeUndefined();
        expect(cmd.localPm).toBe(undefined);
        expect(cmd.globalPm).toBe(undefined);
        expect(cmd.runner).toBe(undefined);
        expect(cmd.autoDetect).toBe(undefined);
    });

    test("Non-existent config file", async ({
        nonExistentConfigFile,
        mock: {},
        unpm: { cmd, exec },
        expect,
    }) => {
        const { errorMessage } = await exec("-c", nonExistentConfigFile);

        expect(errorMessage).not.toBeUndefined();
        expect(cmd.localPm).toBe(undefined);
        expect(cmd.globalPm).toBe(undefined);
        expect(cmd.runner).toBe(undefined);
        expect(cmd.autoDetect).toBe(undefined);
    });

    test("Override config file with CLI options and environment variables", async ({
        userConfigFile,
        mock: { envs, fs },
        unpm: { cmd, exec },
        expect,
    }) => {
        fs.fromJSON({ [userConfigFile]: validConfigContent });
        envs.localPm("pnpm");
        envs.globalPm("bun");

        const { errorMessage } = await exec("-c", userConfigFile, "--no-auto-detect");

        expect(errorMessage).toBeUndefined();
        expect(cmd.localPm).toBe("pnpm");
        expect(cmd.globalPm).toBe("bun");
        expect(cmd.runner).toBe("node");
        expect(cmd.autoDetect).toBe(false);
    });
});

describe("Resolve package manager", () => {
    test("From detector", async ({ mock: { fs }, unpm: { cmd, exec }, expect }) => {
        fs.mount("yarn-berry");

        const { errorMessage } = await exec();

        expect(errorMessage).toBeUndefined();
        expect(cmd.localPm).toBe("yarn-berry");
    });

    test("From CLI option", async ({ mock: {}, unpm: { cmd, exec }, expect }) => {
        const { errorMessage } = await exec("--pm", "pnpm");

        expect(errorMessage).toBeUndefined();
        expect(cmd.localPm).toBe("pnpm");
        expect(cmd.globalPm).toBe("pnpm");
    });

    test("From environment variable", async ({ mock: { envs }, unpm: { cmd, exec }, expect }) => {
        envs.localPm("npm");
        envs.globalPm("yarn-classic");

        const { errorMessage } = await exec();

        expect(errorMessage).toBeUndefined();
        expect(cmd.localPm).toBe("npm");
        expect(cmd.globalPm).toBe("yarn-classic");
    });

    test("Disable auto-detection", async ({ mock: { fs }, unpm: { cmd, exec }, expect }) => {
        fs.mount("yarn-classic");

        const { errorMessage } = await exec("--no-auto-detect");

        expect(errorMessage).toBeUndefined();
        expect(cmd.localPm).toBe(undefined);
        expect(cmd.globalPm).toBe(undefined);
        expect(cmd.autoDetect).toBe(false);
    });

    test("Disable prompt-selection", async ({ mock: { fs }, unpm: { cmd, exec }, expect }) => {
        fs.mount("yarn-classic");

        const { errorMessage } = await exec("--no-prompt-select");

        expect(errorMessage).toBeUndefined();
        expect(cmd.localPm).toBe("yarn-classic");
        expect(cmd.globalPm).toBe(undefined);
        expect(cmd.promptSelect).toBe(false);
    });

    test("Override auto-detection with CLI options and environment variables", async ({
        mock: { envs, fs },
        unpm: { cmd, exec },
        expect,
    }) => {
        fs.mount("yarn-classic");
        envs.localPm("pnpm");
        envs.globalPm("npm");

        const { errorMessage } = await exec("--pm", "bun");

        expect(errorMessage).toBeUndefined();
        expect(cmd.localPm).toBe("bun");
        expect(cmd.globalPm).toBe("bun");
    });
});

describe("Runner", () => {
    test("From detector", async ({ mock: { fs }, unpm: { cmd, exec }, expect }) => {
        fs.mount("yarn-berry");

        const { errorMessage } = await exec();

        expect(errorMessage).toBeUndefined();
        expect(cmd.runner).toBe("yarn-berry");
    });

    test("From CLI option", async ({ mock: {}, unpm: { cmd, exec }, expect }) => {
        const { errorMessage } = await exec("--runner", "node");

        expect(errorMessage).toBeUndefined();
        expect(cmd.runner).toBe("node");
    });

    test("From environment variable", async ({ mock: { envs }, unpm: { cmd, exec }, expect }) => {
        envs.runner("node");

        const { errorMessage } = await exec();

        expect(errorMessage).toBeUndefined();
        expect(cmd.runner).toBe("node");
    });

    test("Disable auto-detection", async ({ mock: { fs }, unpm: { cmd, exec }, expect }) => {
        fs.mount("npm");

        const { errorMessage } = await exec("--no-auto-detect");

        expect(errorMessage).toBeUndefined();
        expect(cmd.runner).toBe(undefined);
        expect(cmd.autoDetect).toBe(false);
    });

    test("Disable prompt-selection", async ({ mock: { fs }, unpm: { cmd, exec }, expect }) => {
        fs.mount("yarn-classic");

        const { errorMessage } = await exec("--no-prompt-select");

        expect(errorMessage).toBeUndefined();
        expect(cmd.localPm).toBe("yarn-classic");
        expect(cmd.globalPm).toBe(undefined);
        expect(cmd.promptSelect).toBe(false);
    });

    test("Override auto-detection with CLI options and environment variables", async ({
        mock: { envs, fs },
        unpm: { cmd, exec },
        expect,
    }) => {
        fs.mount("npm");
        envs.runner("pnpm");

        const { errorMessage } = await exec("--runner", "node");

        expect(errorMessage).toBeUndefined();
        expect(cmd.runner).toBe("node");
    });
});
