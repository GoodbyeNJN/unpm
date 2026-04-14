import { describe } from "vitest";

import { test } from "./helpers/tester";

import type { Pm } from "@/types";

const InstallCmd = () => import("@/commands/install").then(mod => mod.InstallCmd);

const makeCase = <T extends string[] | null>(pm: Pm, execArgs: string[], expectedArgs: T) =>
    [pm, execArgs, pm.replace(/-.*/, ""), expectedArgs] as const;

describe("Install dependencies", () => {
    const empty: string[] = [];

    test.for([
        makeCase("npm", empty, ["install"]),
        makeCase("pnpm", empty, ["install"]),
        makeCase("yarn-classic", empty, ["install"]),
        makeCase("yarn-berry", empty, ["install"]),
        makeCase("bun", empty, ["install"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await InstallCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "install",
                ...execArgs,
            );

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);
            expect(resolvedArgs).toMatchObject([...args]);
        },
    );
});

describe("Install production dependencies", () => {
    const prod = ["-p"];

    test.for([
        makeCase("npm", prod, ["install", "--omit=dev"]),
        makeCase("pnpm", prod, ["install", "--prod"]),
        makeCase("yarn-classic", prod, ["install", "--production"]),
        makeCase("yarn-berry", prod, null),
        makeCase("bun", prod, ["install", "--omit=dev"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await InstallCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "install",
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

describe("Install without optional dependencies", () => {
    const noOptional = ["--no-optional"];

    test.for([
        makeCase("npm", noOptional, ["install", "--omit=optional"]),
        makeCase("pnpm", noOptional, ["install", "--no-optional"]),
        makeCase("yarn-classic", noOptional, ["install", "--ignore-optional"]),
        makeCase("yarn-berry", noOptional, null),
        makeCase("bun", noOptional, ["install", "--omit=optional"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await InstallCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "install",
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

describe("Install without peer dependencies", () => {
    const noPeer = ["--no-peer"];

    test.for([
        makeCase("npm", noPeer, ["install", "--omit=peer"]),
        makeCase("pnpm", noPeer, null),
        makeCase("yarn-classic", noPeer, null),
        makeCase("yarn-berry", noPeer, null),
        makeCase("bun", noPeer, ["install", "--omit=peer"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await InstallCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "install",
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

describe("Install dependencies with frozen lockfile", () => {
    const frozen = ["--frozen"];
    const frozenProd = ["--frozen", "-p"];

    test.for([
        makeCase("npm", frozen, ["ci"]),
        makeCase("pnpm", frozen, ["install", "--frozen-lockfile"]),
        makeCase("yarn-classic", frozen, ["install", "--frozen-lockfile"]),
        makeCase("yarn-berry", frozen, ["install", "--immutable"]),
        makeCase("bun", frozen, ["install", "--frozen-lockfile"]),

        makeCase("npm", frozenProd, ["ci", "--omit=dev"]),
        makeCase("pnpm", frozenProd, ["install", "--frozen-lockfile", "--prod"]),
        makeCase("yarn-classic", frozenProd, ["install", "--frozen-lockfile", "--production"]),
        makeCase("yarn-berry", frozenProd, null),
        makeCase("bun", frozenProd, ["install", "--frozen-lockfile", "--omit=dev"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await InstallCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "install",
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

describe("Install dependencies with unknown options", () => {
    const unknown = ["--ignore-scripts"];
    const unknownDoubleDash = ["--ignore-scripts", "--", "--os", "linux"];

    test.for([
        makeCase("npm", unknown, ["install", "--ignore-scripts"]),
        makeCase("pnpm", unknown, ["install", "--ignore-scripts"]),
        makeCase("yarn-classic", unknown, ["install", "--ignore-scripts"]),
        makeCase("yarn-berry", unknown, ["install", "--ignore-scripts"]),
        makeCase("bun", unknown, ["install", "--ignore-scripts"]),

        makeCase("npm", unknownDoubleDash, ["install", "--ignore-scripts", "--os", "linux"]),
        makeCase("pnpm", unknownDoubleDash, ["install", "--ignore-scripts", "--os", "linux"]),
        makeCase("yarn-classic", unknownDoubleDash, [
            "install",
            "--ignore-scripts",
            "--os",
            "linux",
        ]),
        makeCase("yarn-berry", unknownDoubleDash, ["install", "--ignore-scripts", "--os", "linux"]),
        makeCase("bun", unknownDoubleDash, ["install", "--ignore-scripts", "--os", "linux"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await InstallCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "install",
                ...execArgs,
            );

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);
            expect(resolvedArgs).toMatchObject([...args]);
        },
    );
});
