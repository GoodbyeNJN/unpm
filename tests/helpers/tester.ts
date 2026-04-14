import { createFsFromVolume } from "memfs";
import { test as baseTest, vi } from "vitest";

import { ENV_NAMES } from "@/constants";

import { Volume } from "./volume";

import type { SubCmd } from "@/common/command";
import type { ResolvedCommand } from "@/types";
import type { Constructor } from "@goodbyenjn/utils/types";
import type { TestContext as BaseTestContext, TestAPI } from "vitest";

export type TestContext = typeof test extends TestAPI<infer T> ? BaseTestContext & T : never;

export const test = baseTest
    .extend("userConfigFile", "/home/user/.unpmrc")
    .extend("defaultConfigFile", "/home/user/.config/unpm/unpmrc")
    .extend("invalidConfigFile", "/home/invalid/.unpmrc")
    .extend("nonExistentConfigFile", "/home/non-existent/.unpmrc")
    .extend("appDir", "/app")
    .extend("mock", async ({ appDir }, { onCleanup }) => {
        const setters: Record<keyof typeof ENV_NAMES, (value: string | undefined) => void> =
            Object.fromEntries(
                Object.entries(ENV_NAMES).map(([key, name]) => [
                    key,
                    value => vi.stubEnv(name, value),
                ]),
            );

        for (const set of Object.values(setters)) {
            set(undefined);
        }
        vi.stubEnv("XDG_CONFIG_HOME", "/home/user/.config");

        const volume = new Volume(appDir);
        const fs = createFsFromVolume(volume);

        vi.doMock("node:fs", () => Object.assign(fs, { default: fs }));
        vi.doMock("node:fs/promises", () => Object.assign(fs.promises, { default: fs.promises }));
        vi.doMock("node:process", async importOriginal => ({
            ...(await importOriginal()),
            cwd: () => appDir,
        }));
        vi.spyOn(process, "cwd").mockReturnValue(appDir);

        onCleanup(() => {
            vi.unstubAllEnvs();

            vi.doUnmock("node:fs");
            vi.doUnmock("node:fs/promises");
            vi.doUnmock("node:process");
            vi.resetAllMocks();
            vi.resetModules();
        });

        return { envs: setters, fs: volume };
    })
    .extend("unpm", async () => {
        const executor = vi.fn(x => x);
        const terminator = vi.fn(x => x as never);

        const { UnpmCmd } = await import("@/commands/unpm");
        const cmd = new UnpmCmd(executor, terminator);

        const exec = async (...args: readonly string[]) => {
            try {
                await cmd.exec(args, { from: "user" });
            } catch {}

            const errorMessage: string | undefined = terminator.mock.results[0]?.value;
            const resolvedCommand: ResolvedCommand | undefined =
                executor.mock.results[0]?.value || {};

            return {
                errorMessage: errorMessage,
                resolvedCommand: resolvedCommand?.command,
                resolvedArgs: resolvedCommand?.args,
            };
        };

        const register = (SubCmd: Constructor<SubCmd>, defaults?: boolean) => {
            new SubCmd(cmd).register(defaults);
        };

        return { cmd, exec, register };
    })
    .extend("unpx", async () => {
        const executor = vi.fn(x => x);
        const terminator = vi.fn(x => x as never);

        const { UnpxCmd } = await import("@/commands/unpx");
        const cmd = new UnpxCmd(executor, terminator);

        const exec = async (...args: readonly string[]) => {
            try {
                await cmd.exec(args, { from: "user" });
            } catch {}

            const errorMessage: string | undefined = terminator.mock.results[0]?.value;
            const resolvedCommand: ResolvedCommand | undefined =
                executor.mock.results[0]?.value || {};

            return {
                errorMessage: errorMessage,
                resolvedCommand: resolvedCommand?.command,
                resolvedArgs: resolvedCommand?.args,
            };
        };

        const register = (SubCmd: Constructor<SubCmd>, defaults?: boolean) => {
            new SubCmd(cmd).register(defaults);
        };

        return { cmd, exec, register };
    });
