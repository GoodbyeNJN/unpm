import { err, ok } from "@goodbyenjn/utils/result";
import { Command as BaseCmd } from "commander";

import { SubCmd } from "@/common/command";
import { unsupported } from "@/common/error";

import type { Operations, Pm } from "@/types";

export class UpdateCmd extends SubCmd {
    override sub = new BaseCmd()
        .name("update")
        .alias("up")
        .description("Update installed packages.")
        .argument("[package...]", "Packages to update (updates all if not specified).")
        .option("-g, --global", "Update global packages.")
        .option("-p, --prod", "Update production dependencies only.")
        .option("--no-optional", "Exclude optional dependencies.")
        .option("--no-peer", "Exclude peer dependencies.")
        .option("-i, --interactive", "Use interactive mode.")
        .addHelpText(
            "after",
            `
Note:
  Unknown options will be passed through to package manager by default, which is sufficient for most cases.
  For complex scenarios where package names might conflict with option values, use '--' as a separator:
    - Before '--': package manager options
    - After '--': package names

Examples:
  $ unpm update lodash
  $ unpm update -p
  $ unpm update --no-save -- express    # '--no-save' to package manager, 'express' as package
`,
        )
        .allowUnknownOption();

    override get pm() {
        const isGlobal = this.sub.getOptionValue("global");

        return isGlobal ? this.main.globalPm : this.main.localPm;
    }

    override get operation(): Operations {
        const isGlobal = this.sub.getOptionValue("global");
        const isInteractive = this.sub.getOptionValue("interactive");

        if (isGlobal) {
            return isInteractive ? "global-interactive-update" : "global-update";
        } else {
            return isInteractive ? "interactive-update" : "update";
        }
    }

    override resolveArgs = (pm: Pm) => {
        const { prod, optional, peer } = this.sub.opts();

        const args: string[] = [];

        if (prod) {
            switch (pm) {
                case "npm":
                case "bun": {
                    args.push("--omit=dev");
                    break;
                }
                case "pnpm": {
                    args.push("--prod");
                    break;
                }
                case "yarn-classic":
                case "yarn-berry":
                default: {
                    return err(unsupported(pm, "Option '-p/--prod'"));
                }
            }
        }
        if (optional === false) {
            switch (pm) {
                case "npm":
                case "bun": {
                    args.push("--omit=optional");
                    break;
                }
                case "pnpm": {
                    args.push("--no-optional");
                    break;
                }
                case "yarn-classic":
                case "yarn-berry":
                default: {
                    return err(unsupported(pm, "Option '--no-optional'"));
                }
            }
        }
        if (peer === false) {
            switch (pm) {
                case "npm":
                case "bun": {
                    args.push("--omit=peer");
                    break;
                }
                case "pnpm":
                case "yarn-classic":
                case "yarn-berry":
                default: {
                    return err(unsupported(pm, "Option '--no-peer'"));
                }
            }
        }

        args.push(...this.sub.args);

        return ok(args);
    };
}
