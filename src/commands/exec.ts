import { Command as BaseCmd } from "commander";

import { SubCmd } from "@/common/command";

import type { Operations } from "@/types";

export class ExecCmd extends SubCmd {
    override sub = new BaseCmd()
        .name("exec")
        .alias("x")
        .description("Execute a command in the project context.")
        .argument("<command>", "Command to execute.")
        .argument("[arguments...]", "Arguments to pass to the command.")
        .addHelpText(
            "after",
            `
Note:
  By default, all arguments and options will be passed to package manager as command and its arguments.
  To pass options to package manager itself, use '--' as a separator:
    - Before '--': package manager options
    - After '--': command and its arguments

Examples:
  $ unpm exec prettier --write .
  $ unpm exec eslint --fix src/
  $ unpm exec --parallel -- tsc --noEmit    # '--parallel' to package manager, 'tsc --noEmit' to be executed
`,
        )
        .allowUnknownOption();

    override get pm() {
        return this.main.localPm;
    }

    override readonly operation: Operations = "exec";
}
