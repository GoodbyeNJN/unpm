import { describe } from "vitest";

import { test } from "./helpers/tester";

import type { Pm } from "@/types";

const PmCmd = () => import("@/commands/pm").then(mod => mod.PmCmd);

const makeCase = <T extends string[] | null>(pm: Pm, execArgs: string[], expectedArgs: T) =>
    [pm, execArgs, pm.replace(/-.*/, ""), expectedArgs] as const;

describe("Pass arguments to package manager", () => {
    const cmd = ["create", "react-app", "my-app"];

    test.for([
        makeCase("npm", cmd, cmd),
        makeCase("pnpm", cmd, cmd),
        makeCase("yarn-classic", cmd, cmd),
        makeCase("yarn-berry", cmd, cmd),
        makeCase("bun", cmd, cmd),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await PmCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec("pm", ...execArgs);

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);
            expect(resolvedArgs).toMatchObject(args);
        },
    );
});

describe("Pass arguments to global package manager", () => {
    const cmd = ["outdated", "-g"];
    const global = ["-g", "--"];

    test.for([
        makeCase("npm", [...global, ...cmd], cmd),
        makeCase("pnpm", [...global, ...cmd], cmd),
        makeCase("yarn-classic", [...global, ...cmd], cmd),
        makeCase("yarn-berry", [...global, ...cmd], cmd),
        makeCase("bun", [...global, ...cmd], cmd),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { envs }, unpm: { exec, register }, expect },
        ) => {
            envs.globalPm(pm);

            register(await PmCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec("pm", ...execArgs);

            if (args === null) {
                expect(errorMessage).toBeDefined();
                return;
            }

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);
            expect(resolvedArgs).toMatchObject(args);
        },
    );
});
