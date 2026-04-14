import { describe } from "vitest";

import { test } from "./helpers/tester";

import type { Pm } from "@/types";

const ExecCmd = () => import("@/commands/exec").then(mod => mod.ExecCmd);

const makeCase = <T extends string[] | null>(pm: Pm, execArgs: string[], expectedArgs: T) =>
    [pm, execArgs, pm.replace(/-.*/, ""), expectedArgs] as const;

const prettier = ["prettier", "--write", "."];

describe("Exec command", () => {
    test.for([
        makeCase("npm", prettier, ["exec"]),
        makeCase("pnpm", prettier, ["exec"]),
        makeCase("yarn-classic", prettier, ["exec", "prettier", "--", "--write", "."]),
        makeCase("yarn-berry", prettier, ["exec"]),
        makeCase("bun", prettier, ["x"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await ExecCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec("exec", ...execArgs);

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);

            if (pm === "yarn-classic") {
                expect(resolvedArgs).toMatchObject([...args]);
            } else {
                expect(resolvedArgs).toMatchObject([...args, ...prettier]);
            }
        },
    );
});

describe("Exec command with unknown arguments", () => {
    const unknownDoubleDash = ["--parallel", "--"];

    test.for([
        makeCase("npm", unknownDoubleDash, ["exec", "--parallel"]),
        makeCase("pnpm", unknownDoubleDash, ["exec", "--parallel"]),
        makeCase("yarn-classic", unknownDoubleDash, [
            "exec",
            "--parallel",
            "prettier",
            "--",
            "--write",
            ".",
        ]),
        makeCase("yarn-berry", unknownDoubleDash, ["exec", "--parallel"]),
        makeCase("bun", unknownDoubleDash, ["x", "--parallel"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await ExecCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "exec",
                ...execArgs,
                ...prettier,
            );

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);

            if (pm === "yarn-classic") {
                expect(resolvedArgs).toMatchObject([...args]);
            } else {
                expect(resolvedArgs).toMatchObject([...args, ...prettier]);
            }
        },
    );
});
