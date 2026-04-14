import { describe } from "vitest";

import { test } from "./helpers/tester";

import type { Pm } from "@/types";

const DlxCmd = () => import("@/commands/dlx").then(mod => mod.DlxCmd);

const makeCase = <T extends string[] | null>(pm: Pm, execArgs: string[], expectedArgs: T) =>
    [pm, execArgs, (pm === "npm" ? "npx" : pm).replace(/-.*/, ""), expectedArgs] as const;

const prettier = ["prettier", "--write", "."];

describe("Dlx command", () => {
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

            register(await DlxCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec("dlx", ...execArgs);

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

describe("Dlx command with unknown arguments", () => {
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

            register(await DlxCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "dlx",
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
