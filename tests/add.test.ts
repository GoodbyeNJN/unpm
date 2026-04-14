import { describe } from "vitest";

import { test } from "./helpers/tester";

import type { Pm } from "@/types";

const AddCmd = () => import("@/commands/add").then(mod => mod.AddCmd);

const makeCase = <T extends string[] | null>(pm: Pm, execArgs: string[], expectedArgs: T) =>
    [pm, execArgs, pm.replace(/-.*/, ""), expectedArgs] as const;

const pkg = "is-number";

describe("Add dependencies", () => {
    const empty: string[] = [];
    const exact = ["--exact"];

    test.for([
        makeCase("npm", empty, ["add"]),
        makeCase("pnpm", empty, ["add"]),
        makeCase("yarn-classic", empty, ["add"]),
        makeCase("yarn-berry", empty, ["add"]),
        makeCase("bun", empty, ["add"]),

        makeCase("npm", exact, ["add", "--save-exact"]),
        makeCase("pnpm", exact, ["add", "--save-exact"]),
        makeCase("yarn-classic", exact, ["add", "--exact"]),
        makeCase("yarn-berry", exact, ["add", "--exact"]),
        makeCase("bun", exact, ["add", "--exact"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await AddCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "add",
                ...execArgs,
                pkg,
            );

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);
            expect(resolvedArgs).toMatchObject([...args, pkg]);
        },
    );
});

describe("Add dev dependencies", () => {
    const dev = ["--dev"];
    const devExact = ["--dev", "--exact"];

    test.for([
        makeCase("npm", dev, ["add", "--save-dev"]),
        makeCase("pnpm", dev, ["add", "--save-dev"]),
        makeCase("yarn-classic", dev, ["add", "--dev"]),
        makeCase("yarn-berry", dev, ["add", "--dev"]),
        makeCase("bun", dev, ["add", "--dev"]),

        makeCase("npm", devExact, ["add", "--save-dev", "--save-exact"]),
        makeCase("pnpm", devExact, ["add", "--save-dev", "--save-exact"]),
        makeCase("yarn-classic", devExact, ["add", "--dev", "--exact"]),
        makeCase("yarn-berry", devExact, ["add", "--dev", "--exact"]),
        makeCase("bun", devExact, ["add", "--dev", "--exact"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await AddCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "add",
                ...execArgs,
                pkg,
            );

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);
            expect(resolvedArgs).toMatchObject([...args, pkg]);
        },
    );
});

describe("Add optional dependencies", () => {
    const optional = ["--optional"];
    const optionalExact = ["--optional", "--exact"];

    test.for([
        makeCase("npm", optional, ["add", "--save-optional"]),
        makeCase("pnpm", optional, ["add", "--save-optional"]),
        makeCase("yarn-classic", optional, ["add", "--optional"]),
        makeCase("yarn-berry", optional, ["add", "--optional"]),
        makeCase("bun", optional, ["add", "--optional"]),

        makeCase("npm", optionalExact, ["add", "--save-optional", "--save-exact"]),
        makeCase("pnpm", optionalExact, ["add", "--save-optional", "--save-exact"]),
        makeCase("yarn-classic", optionalExact, ["add", "--optional", "--exact"]),
        makeCase("yarn-berry", optionalExact, ["add", "--optional", "--exact"]),
        makeCase("bun", optionalExact, ["add", "--optional", "--exact"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await AddCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "add",
                ...execArgs,
                pkg,
            );

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);
            expect(resolvedArgs).toMatchObject([...args, pkg]);
        },
    );
});

describe("Add peer dependencies", () => {
    const peer = ["--peer"];
    const peerExact = ["--peer", "--exact"];

    test.for([
        makeCase("npm", peer, ["add", "--save-peer"]),
        makeCase("pnpm", peer, ["add", "--save-peer"]),
        makeCase("yarn-classic", peer, ["add", "--peer"]),
        makeCase("yarn-berry", peer, ["add", "--peer"]),
        makeCase("bun", peer, ["add", "--peer"]),

        makeCase("npm", peerExact, ["add", "--save-peer", "--save-exact"]),
        makeCase("pnpm", peerExact, ["add", "--save-peer", "--save-exact"]),
        makeCase("yarn-classic", peerExact, ["add", "--peer", "--exact"]),
        makeCase("yarn-berry", peerExact, ["add", "--peer", "--exact"]),
        makeCase("bun", peerExact, ["add", "--peer", "--exact"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await AddCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "add",
                ...execArgs,
                pkg,
            );

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);
            expect(resolvedArgs).toMatchObject([...args, pkg]);
        },
    );
});

describe("Add global dependencies", () => {
    const global = ["-g"];
    const globalExact = ["-g", "--exact"];

    test.for([
        makeCase("npm", global, ["add", "--global"]),
        makeCase("pnpm", global, ["add", "--global"]),
        makeCase("yarn-classic", global, ["global", "add"]),
        makeCase("yarn-berry", global, null),
        makeCase("bun", global, ["add", "--global"]),

        makeCase("npm", globalExact, ["add", "--global", "--save-exact"]),
        makeCase("pnpm", globalExact, ["add", "--global", "--save-exact"]),
        makeCase("yarn-classic", globalExact, ["global", "add", "--exact"]),
        makeCase("yarn-berry", globalExact, null),
        makeCase("bun", globalExact, ["add", "--global", "--exact"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { envs }, unpm: { exec, register }, expect },
        ) => {
            envs.globalPm(pm);

            register(await AddCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "add",
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

describe("Add dependencies with unknown options", () => {
    const unknown = ["-d", "--dry-run"];
    const unknownDoubleDash = ["-d", "--dry-run", "--os", "linux", "--"];

    test.for([
        makeCase("npm", unknown, ["add", "--save-dev", "--dry-run"]),
        makeCase("pnpm", unknown, ["add", "--save-dev", "--dry-run"]),
        makeCase("yarn-classic", unknown, ["add", "--dev", "--dry-run"]),
        makeCase("yarn-berry", unknown, ["add", "--dev", "--dry-run"]),
        makeCase("bun", unknown, ["add", "--dev", "--dry-run"]),

        makeCase("npm", unknownDoubleDash, ["add", "--save-dev", "--dry-run", "--os", "linux"]),
        makeCase("pnpm", unknownDoubleDash, ["add", "--save-dev", "--dry-run", "--os", "linux"]),
        makeCase("yarn-classic", unknownDoubleDash, ["add", "--dev", "--dry-run", "--os", "linux"]),
        makeCase("yarn-berry", unknownDoubleDash, ["add", "--dev", "--dry-run", "--os", "linux"]),
        makeCase("bun", unknownDoubleDash, ["add", "--dev", "--dry-run", "--os", "linux"]),
    ])(
        "%s",
        async (
            [pm, execArgs, command, args],
            { mock: { fs }, unpm: { exec, register }, expect },
        ) => {
            fs.mount(pm);

            register(await AddCmd());
            const { errorMessage, resolvedCommand, resolvedArgs } = await exec(
                "add",
                ...execArgs,
                pkg,
            );

            expect(errorMessage).toBeUndefined();
            expect(resolvedCommand).toBe(command);
            expect(resolvedArgs).toMatchObject([...args, pkg]);
        },
    );
});
