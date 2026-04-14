import { describe } from "vitest";

import { test } from "./helpers/tester";

import type { Pm } from "@/types";

const ListCmd = () => import("@/commands/list").then(mod => mod.ListCmd);

const makeCase = <T extends string[] | null>(pm: Pm, execArgs: string[], expectedArgs: T) =>
    [pm, execArgs, pm.replace(/-.*/, ""), expectedArgs] as const;

describe("List dependencies", () => {
    const empty: string[] = [];

    test.for([
        makeCase("npm", empty, ["list"]),
        makeCase("pnpm", empty, ["list"]),
        makeCase("yarn-classic", empty, ["list"]),
        makeCase("yarn-berry", empty, ["info", "--name-only"]),
        makeCase("bun", empty, ["list"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await ListCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec("list", ...execArgs);

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);
            expect(resolvedArgs).toMatchObject([...args]);
        },
    );
});

describe("List production dependencies", () => {
    const prod = ["-p"];

    test.for([
        makeCase("npm", prod, ["list", "--omit=dev"]),
        makeCase("pnpm", prod, ["list", "--prod"]),
        makeCase("yarn-classic", prod, null),
        makeCase("yarn-berry", prod, null),
        makeCase("bun", prod, null),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await ListCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec("list", ...execArgs);

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

describe("List dev dependencies", () => {
    const dev = ["--dev"];

    test.for([
        makeCase("npm", dev, ["list", "--include=dev"]),
        makeCase("pnpm", dev, ["list", "--dev"]),
        makeCase("yarn-classic", dev, null),
        makeCase("yarn-berry", dev, null),
        makeCase("bun", dev, null),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await ListCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec("list", ...execArgs);

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

describe("List without optional dependencies", () => {
    const noOptional = ["--no-optional"];

    test.for([
        makeCase("npm", noOptional, ["list", "--omit=optional"]),
        makeCase("pnpm", noOptional, ["list", "--no-optional"]),
        makeCase("yarn-classic", noOptional, null),
        makeCase("yarn-berry", noOptional, null),
        makeCase("bun", noOptional, null),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await ListCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec("list", ...execArgs);

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

describe("List without peer dependencies", () => {
    const noPeer = ["--no-peer"];

    test.for([
        makeCase("npm", noPeer, ["list", "--omit=peer"]),
        makeCase("pnpm", noPeer, ["list", "--exclude-peers"]),
        makeCase("yarn-classic", noPeer, null),
        makeCase("yarn-berry", noPeer, null),
        makeCase("bun", noPeer, null),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await ListCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec("list", ...execArgs);

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

describe("List with unknown options", () => {
    const unknown = ["--json"];
    const unknownDoubleDash = ["--json", "--", "--package-lock-only"];

    test.for([
        makeCase("npm", unknown, ["list", "--json"]),
        makeCase("pnpm", unknown, ["list", "--json"]),
        makeCase("yarn-classic", unknown, ["list", "--json"]),
        makeCase("yarn-berry", unknown, ["info", "--name-only", "--json"]),
        makeCase("bun", unknown, ["list", "--json"]),

        makeCase("npm", unknownDoubleDash, ["list", "--json", "--package-lock-only"]),
        makeCase("pnpm", unknownDoubleDash, ["list", "--json", "--package-lock-only"]),
        makeCase("yarn-classic", unknownDoubleDash, ["list", "--json", "--package-lock-only"]),
        makeCase("yarn-berry", unknownDoubleDash, [
            "info",
            "--name-only",
            "--json",
            "--package-lock-only",
        ]),
        makeCase("bun", unknownDoubleDash, ["list", "--json", "--package-lock-only"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await ListCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec("list", ...execArgs);

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);
            expect(resolvedArgs).toMatchObject([...args]);
        },
    );
});
