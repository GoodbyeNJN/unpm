import { Command as BaseCmd } from "commander";

import { SubCmd } from "@/common/command";

import type { Operations } from "@/types";

export class RemoveCmd extends SubCmd {
    override sub = new BaseCmd()
        .name("remove")
        .alias("rm")
        .description("Remove packages from the project or globally.")
        .argument("<package...>", "Packages to remove.")
        .option("-g, --global", "Remove from global packages.")
        .addHelpText(
            "after",
            `
Note:
  Unknown options will be passed through to package manager by default, which is sufficient for most cases.
  For complex scenarios where package names might conflict with option values, use '--' as a separator:
    - Before '--': package manager options
    - After '--': package names

Examples:
  $ unpm remove lodash
  $ unpm remove -g typescript
  $ unpm remove --recursive -- express    # '--recursive' to package manager, 'express' as package
`,
        )
        .allowUnknownOption();

    override get pm() {
        const isGlobal = this.sub.getOptionValue("global");

        return isGlobal ? this.main.globalPm : this.main.localPm;
    }

    override get operation(): Operations {
        const isGlobal = this.sub.getOptionValue("global");

        return isGlobal ? "global-remove" : "remove";
    }
}
