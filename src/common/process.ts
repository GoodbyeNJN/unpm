import { exec as $ } from "@goodbyenjn/utils/exec";

import type { ResolvedCommand } from "@/types";

export type Terminator = (message: string) => never;
export type Executor = (cmd: ResolvedCommand) => any;

export const die: Terminator = (message: string) => {
    if (message) {
        console.log(message);
    }

    process.exit(1);
};

export const exec: Executor = async (cmd: ResolvedCommand) => {
    const { command, args, dryRun } = cmd;

    if (dryRun) {
        console.log(`[DRY_RUN] ${command} ${args.join(" ")}`);
        process.exit(0);
    }

    const proc = $(command, args, {
        spawnOptions: { stdio: "inherit", cwd: process.cwd() },
        // throwOnError: true,
    });

    process.once("SIGINT", async () => {
        // Ensure the proc finishes cleanup before exiting
        proc.kill("SIGINT");
        await proc;

        process.exit(proc.exitCode);
    });

    await proc;
    process.exit(proc.exitCode);
};
