import { Command as BaseCmd } from "commander";

import { SubCmd } from "@/common/command";

import type { Operations } from "@/types";

export class DlxCmd extends SubCmd {
    override sub = new BaseCmd()
        .name("dlx")
        .description(
            "Execute a package command without installing. Can also use 'unpx' command directly.",
        )
        .argument("<command>", "Command to execute.")
        .argument("[arguments...]", "Arguments to pass to the command.")
        .addHelpText(
            "after",
            `
Note:
  By default, configured global package manager is used to execute the command.
  This can be overridden by specifying a package manager with '--pm=<package-manager>' in main command options or by manually selecting one when prompted.

  By default, all arguments and options will be passed to package manager as command and its arguments.
  To pass options to package manager itself, use '--' as a separator:
    - Before '--': package manager options
    - After '--': command and its arguments

Examples:
  $ unpm dlx prettier --write .
  $ unpm dlx eslint --fix src/
  $ unpm dlx --parallel -- tsc --noEmit    # '--parallel' to package manager, 'tsc --noEmit' to be executed
`,
        )
        .allowUnknownOption();

    override get pm() {
        return this.main.globalPm;
    }

    override readonly operation: Operations = "dlx";
}
