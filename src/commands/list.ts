import { err, ok } from "@goodbyenjn/utils/result";
import { Command as BaseCmd } from "commander";

import { SubCmd } from "@/common/command";
import { unsupported } from "@/common/error";

import type { Operations, Pm } from "@/types";

export class ListCmd extends SubCmd {
    override sub = new BaseCmd()
        .name("list")
        .alias("ls")
        .description("List installed packages.")
        .argument("[package...]", "Packages to filter (optional).")
        .option("-g, --global", "List global packages.")
        .option("-p, --prod", "List production dependencies only.")
        .option("-d, --dev", "List dev dependencies only.")
        .option("--no-optional", "Exclude optional dependencies.")
        .option("--no-peer", "Exclude peer dependencies.")
        .addHelpText(
            "after",
            `
Note:
  Unknown options will be passed through to package manager by default, which is sufficient for most cases.
  For complex scenarios where package names might conflict with option values, use '--' as a separator:
    - Before '--': package manager options
    - After '--': package names

Examples:
  $ unpm list
  $ unpm list -g
  $ unpm list --no-peer -- --json lodash    # '--json' to package manager, 'lodash' to filter
`,
        )
        .allowUnknownOption();

    override get pm() {
        const isGlobal = this.sub.getOptionValue("global");

        return isGlobal ? this.main.globalPm : this.main.localPm;
    }

    override get operation(): Operations {
        const isGlobal = this.sub.getOptionValue("global");

        return isGlobal ? "global-list" : "list";
    }

    // eslint-disable-next-line complexity
    override resolveArgs = (pm: Pm) => {
        const { prod, dev, optional, peer } = this.sub.opts();

        const args: string[] = [];

        if (prod) {
            switch (pm) {
                case "npm": {
                    args.push("--omit=dev");
                    break;
                }
                case "pnpm": {
                    args.push("--prod");
                    break;
                }
                case "yarn-classic":
                case "yarn-berry":
                case "bun":
                default: {
                    return err(unsupported(pm, "Option '-p/--prod'"));
                }
            }
        }
        if (dev) {
            switch (pm) {
                case "npm": {
                    args.push("--include=dev");
                    break;
                }
                case "pnpm": {
                    args.push("--dev");
                    break;
                }
                case "yarn-classic":
                case "yarn-berry":
                case "bun":
                default: {
                    return err(unsupported(pm, "Option '-d/--dev'"));
                }
            }
        }
        if (optional === false) {
            switch (pm) {
                case "npm": {
                    args.push("--omit=optional");
                    break;
                }
                case "pnpm": {
                    args.push("--no-optional");
                    break;
                }
                case "yarn-classic":
                case "yarn-berry":
                case "bun":
                default: {
                    return err(unsupported(pm, "Option '--no-optional'"));
                }
            }
        }
        if (peer === false) {
            switch (pm) {
                case "npm": {
                    args.push("--omit=peer");
                    break;
                }
                case "pnpm": {
                    args.push("--exclude-peers");
                    break;
                }
                case "yarn-classic":
                case "yarn-berry":
                case "bun":
                default: {
                    return err(unsupported(pm, "Option '--no-peer'"));
                }
            }
        }

        args.push(...this.sub.args);

        return ok(args);
    };
}
