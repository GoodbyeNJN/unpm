import { describe } from "vitest";

import { test } from "./helpers/tester";

import type { Pm, Runner } from "@/types";

const RunCmd = () => import("@/commands/run").then(mod => mod.RunCmd);

const makeCase = <T extends string[] | null>(
    pm: Pm | Runner,
    execArgs: string[],
    expectedArgs: T,
) => [pm, execArgs, pm.replace(/-.*/, ""), expectedArgs] as const;

const script = ["build", "--watch"];

describe("Run script", () => {
    test.for([
        makeCase("npm", script, ["run", "build", "--", "--watch"]),
        makeCase("pnpm", script, ["run"]),
        makeCase("yarn-classic", script, ["run"]),
        makeCase("yarn-berry", script, ["run"]),
        makeCase("bun", script, ["run"]),
        makeCase("node", script, ["--run"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { envs, fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm === "node" ? "npm" : pm);
            pm === "node" && envs.runner("node");

            register(await RunCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec("run", ...execArgs);

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);

            if (pm === "npm") {
                expect(resolvedArgs).toMatchObject([...args]);
            } else {
                expect(resolvedArgs).toMatchObject([...args, ...script]);
            }
        },
    );
});

describe("Run script with unknown arguments", () => {
    const unknownDoubleDash = ["--parallel", "--"];

    test.for([
        makeCase("npm", unknownDoubleDash, ["run", "--parallel", "build", "--", "--watch"]),
        makeCase("pnpm", unknownDoubleDash, ["run", "--parallel"]),
        makeCase("yarn-classic", unknownDoubleDash, ["run", "--parallel"]),
        makeCase("yarn-berry", unknownDoubleDash, ["run", "--parallel"]),
        makeCase("bun", unknownDoubleDash, ["run", "--parallel"]),
        makeCase("node", unknownDoubleDash, ["--run", "--parallel"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { envs, fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm === "node" ? "npm" : pm);
            pm === "node" && envs.runner("node");

            register(await RunCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "run",
                ...execArgs,
                ...script,
            );

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);

            if (pm === "npm") {
                expect(resolvedArgs).toMatchObject([...args]);
            } else {
                expect(resolvedArgs).toMatchObject([...args, ...script]);
            }
        },
    );
});
