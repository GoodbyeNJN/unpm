import { Command as BaseCmd } from "commander";

import { SubCmd } from "@/common/command";

import type { Operations } from "@/types";

export class RunCmd extends SubCmd {
    override sub = new BaseCmd()
        .name("run")
        .description("Run a script from package.json.")
        .argument("<script>", "Script to run.")
        .argument("[arguments...]", "Arguments to pass to the script.")
        .addHelpText(
            "after",
            `
Note:
  By default, all arguments and options will be passed to package manager as script and its arguments.
  To pass options to package manager itself, use '--' as a separator:
    - Before '--': package manager options
    - After '--': script and its arguments

Examples:
  $ unpm run dev
  $ unpm run build --watch
  $ unpm run --parallel -- test --coverage    # '--parallel' to package manager, 'test --coverage' to be run
`,
        )
        .allowUnknownOption();

    override get pm() {
        return this.main.runner;
    }

    override readonly operation: Operations = "run";
}
