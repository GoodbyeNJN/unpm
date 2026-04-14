import { describe } from "vitest";

import { test } from "./helpers/tester";

import type { Pm } from "@/types";

const RemoveCmd = () => import("@/commands/remove").then(mod => mod.RemoveCmd);

const makeCase = <T extends string[] | null>(pm: Pm, execArgs: string[], expectedArgs: T) =>
    [pm, execArgs, pm.replace(/-.*/, ""), expectedArgs] as const;

const pkg = "is-number";

describe("Remove dependencies", () => {
    const empty: string[] = [];

    test.for([
        makeCase("npm", empty, ["remove"]),
        makeCase("pnpm", empty, ["remove"]),
        makeCase("yarn-classic", empty, ["remove"]),
        makeCase("yarn-berry", empty, ["remove"]),
        makeCase("bun", empty, ["remove"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await RemoveCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "remove",
                ...execArgs,
                pkg,
            );

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);
            expect(resolvedArgs).toMatchObject([...args, pkg]);
        },
    );
});

describe("Remove global dependencies", () => {
    const global = ["-g"];

    test.for([
        makeCase("npm", global, ["remove", "--global"]),
        makeCase("pnpm", global, ["remove", "--global"]),
        makeCase("yarn-classic", global, ["global", "remove"]),
        makeCase("yarn-berry", global, null),
        makeCase("bun", global, ["remove", "--global"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { envs }, unpm: { exec, register }, expect },
        ) => {
            envs.globalPm(pm);

            register(await RemoveCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "remove",
                ...execArgs,
                pkg,
            );

            if (args === null) {
                expect(errorMessage).not.toBeUndefined();
                return;
            }

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);
            expect(resolvedArgs).toMatchObject([...args, pkg]);
        },
    );
});

describe("Remove dependencies with unknown options", () => {
    const unknown = ["--recursive"];
    const unknownDoubleDash = ["--recursive", "--"];

    test.for([
        makeCase("npm", unknown, ["remove", "--recursive"]),
        makeCase("pnpm", unknown, ["remove", "--recursive"]),
        makeCase("yarn-classic", unknown, ["remove", "--recursive"]),
        makeCase("yarn-berry", unknown, ["remove", "--recursive"]),
        makeCase("bun", unknown, ["remove", "--recursive"]),

        makeCase("npm", unknownDoubleDash, ["remove", "--recursive"]),
        makeCase("pnpm", unknownDoubleDash, ["remove", "--recursive"]),
        makeCase("yarn-classic", unknownDoubleDash, ["remove", "--recursive"]),
        makeCase("yarn-berry", unknownDoubleDash, ["remove", "--recursive"]),
        makeCase("bun", unknownDoubleDash, ["remove", "--recursive"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await RemoveCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "remove",
                ...execArgs,
                pkg,
            );

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);
            expect(resolvedArgs).toMatchObject([...args, pkg]);
        },
    );
});
