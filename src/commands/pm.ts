import { Command as BaseCmd } from "commander";

import { SubCmd } from "@/common/command";

import type { Operations } from "@/types";

export class PmCmd extends SubCmd {
    override sub = new BaseCmd()
        .name("pm")
        .description("Pass arguments directly to package manager.")
        .argument("[arguments...]", "Arguments to pass to package manager.")
        .option("-g, --global", "Use global package manager.")
        .addHelpText(
            "after",
            `
Note:
  Unknown options will be passed through to package manager by default, which is sufficient for most cases.
  For complex scenarios where package names might conflict with option values, use '--' as a separator:
    - Before '--': package manager options
    - After '--': package names

Examples:
  $ unpm pm audit
  $ unpm pm -g -- outdated -g    # 'outdated -g' to package manager, '-g' to use global package manager
`,
        )
        .allowUnknownOption();

    override get pm() {
        const isGlobal = this.sub.getOptionValue("global");

        return isGlobal ? this.main.globalPm : this.main.localPm;
    }

    override readonly operation: Operations = "pm";
}
