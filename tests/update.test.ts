import { describe } from "vitest";

import { test } from "./helpers/tester";

import type { Pm } from "@/types";

const UpdateCmd = () => import("@/commands/update").then(mod => mod.UpdateCmd);

const makeCase = <T extends string[] | null>(pm: Pm, execArgs: string[], expectedArgs: T) =>
    [pm, execArgs, pm.replace(/-.*/, ""), expectedArgs] as const;

describe("Update dependencies", () => {
    const empty: string[] = [];

    test.for([
        makeCase("npm", empty, ["update"]),
        makeCase("pnpm", empty, ["update"]),
        makeCase("yarn-classic", empty, ["upgrade"]),
        makeCase("yarn-berry", empty, ["up"]),
        makeCase("bun", empty, ["update"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await UpdateCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "update",
                ...execArgs,
            );

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);
            expect(resolvedArgs).toMatchObject([...args]);
        },
    );
});

describe("Update production dependencies", () => {
    const prod = ["-p"];

    test.for([
        makeCase("npm", prod, ["update", "--omit=dev"]),
        makeCase("pnpm", prod, ["update", "--prod"]),
        makeCase("yarn-classic", prod, null),
        makeCase("yarn-berry", prod, null),
        makeCase("bun", prod, ["update", "--omit=dev"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await UpdateCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "update",
                ...execArgs,
            );

            if (args === null) {
                expect(errorMessage).not.toBeUndefined();
                return;
            }

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);
            expect(resolvedArgs).toMatchObject([...args]);
        },
    );
});

describe("Update without optional dependencies", () => {
    const noOptional = ["--no-optional"];

    test.for([
        makeCase("npm", noOptional, ["update", "--omit=optional"]),
        makeCase("pnpm", noOptional, ["update", "--no-optional"]),
        makeCase("yarn-classic", noOptional, null),
        makeCase("yarn-berry", noOptional, null),
        makeCase("bun", noOptional, ["update", "--omit=optional"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await UpdateCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "update",
                ...execArgs,
            );

            if (args === null) {
                expect(errorMessage).not.toBeUndefined();
                return;
            }

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);
            expect(resolvedArgs).toMatchObject([...args]);
        },
    );
});

describe("Update without peer dependencies", () => {
    const noPeer = ["--no-peer"];

    test.for([
        makeCase("npm", noPeer, ["update", "--omit=peer"]),
        makeCase("pnpm", noPeer, null),
        makeCase("yarn-classic", noPeer, null),
        makeCase("yarn-berry", noPeer, null),
        makeCase("bun", noPeer, ["update", "--omit=peer"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await UpdateCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "update",
                ...execArgs,
            );

            if (args === null) {
                expect(errorMessage).not.toBeUndefined();
                return;
            }

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);
            expect(resolvedArgs).toMatchObject([...args]);
        },
    );
});

describe("Update global dependencies", () => {
    const global = ["-g"];

    test.for([
        makeCase("npm", global, ["update", "--global"]),
        makeCase("pnpm", global, ["update", "--global"]),
        makeCase("yarn-classic", global, ["global", "upgrade"]),
        makeCase("yarn-berry", global, null),
        makeCase("bun", global, ["update", "--global"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { envs }, unpm: { exec, register }, expect },
        ) => {
            envs.globalPm(pm);

            register(await UpdateCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "update",
                ...execArgs,
            );

            if (args === null) {
                expect(errorMessage).not.toBeUndefined();
                return;
            }

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);
            expect(resolvedArgs).toMatchObject([...args]);
        },
    );
});

describe("Update with interactive mode", () => {
    const interactive = ["-i"];

    test.for([
        makeCase("npm", interactive, null),
        makeCase("pnpm", interactive, ["update", "--interactive"]),
        makeCase("yarn-classic", interactive, ["upgrade-interactive"]),
        makeCase("yarn-berry", interactive, ["upgrade-interactive"]),
        makeCase("bun", interactive, ["update", "--interactive"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await UpdateCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "update",
                ...execArgs,
            );

            if (args === null) {
                expect(errorMessage).not.toBeUndefined();
                return;
            }

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);
            expect(resolvedArgs).toMatchObject([...args]);
        },
    );
});

describe("Update global dependencies with interactive mode", () => {
    const globalInteractive = ["-g", "-i"];

    test.for([
        makeCase("npm", globalInteractive, null),
        makeCase("pnpm", globalInteractive, ["update", "--global", "--interactive"]),
        makeCase("yarn-classic", globalInteractive, ["global", "upgrade-interactive"]),
        makeCase("yarn-berry", globalInteractive, null),
        makeCase("bun", globalInteractive, ["update", "--global", "--interactive"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { envs }, unpm: { exec, register }, expect },
        ) => {
            envs.globalPm(pm);

            register(await UpdateCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "update",
                ...execArgs,
            );

            if (args === null) {
                expect(errorMessage).not.toBeUndefined();
                return;
            }

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);
            expect(resolvedArgs).toMatchObject([...args]);
        },
    );
});

describe("Update dependencies with unknown options", () => {
    const unknown = ["--no-save"];
    const unknownDoubleDash = ["--no-save", "--", "is-number"];

    test.for([
        makeCase("npm", unknown, ["update", "--no-save"]),
        makeCase("pnpm", unknown, ["update", "--no-save"]),
        makeCase("yarn-classic", unknown, ["upgrade", "--no-save"]),
        makeCase("yarn-berry", unknown, ["up", "--no-save"]),
        makeCase("bun", unknown, ["update", "--no-save"]),

        makeCase("npm", unknownDoubleDash, ["update", "--no-save", "is-number"]),
        makeCase("pnpm", unknownDoubleDash, ["update", "--no-save", "is-number"]),
        makeCase("yarn-classic", unknownDoubleDash, ["upgrade", "--no-save", "is-number"]),
        makeCase("yarn-berry", unknownDoubleDash, ["up", "--no-save", "is-number"]),
        makeCase("bun", unknownDoubleDash, ["update", "--no-save", "is-number"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await UpdateCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "update",
                ...execArgs,
            );

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);
            expect(resolvedArgs).toMatchObject([...args]);
        },
    );
});
