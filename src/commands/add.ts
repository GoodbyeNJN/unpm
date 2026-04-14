import { err, ok } from "@goodbyenjn/utils/result";
import { Command as BaseCmd, Option } from "commander";

import { SubCmd } from "@/common/command";
import { unsupported } from "@/common/error";

import type { Operations, Pm } from "@/types";

export class AddCmd extends SubCmd {
    override sub = new BaseCmd()
        .name("add")
        .alias("a")
        .description("Install packages to the project or globally.")
        .argument(
            "<package...>",
            "Packages to install (name, name@version, tarball, git repo, etc.).",
        )
        .addOption(
            new Option("-g, --global", "Install as global package.").conflicts([
                "dev",
                "optional",
                "peer",
            ]),
        )
        .addOption(
            new Option("-d, --dev", "Install as dev dependency.").conflicts([
                "global",
                "optional",
                "peer",
            ]),
        )
        .addOption(
            new Option("--optional", "Install as optional dependency.").conflicts([
                "global",
                "dev",
                "peer",
            ]),
        )
        .addOption(
            new Option("--peer", "Install as peer dependency.").conflicts([
                "global",
                "dev",
                "optional",
            ]),
        )
        .option("--exact", "Install exact versions without version ranges.")
        .addHelpText(
            "after",
            `
Note:
  Unknown options will be passed through to package manager by default, which is sufficient for most cases.
  For complex scenarios where package names might conflict with option values, use '--' as a separator:
    - Before '--': package manager options
    - After '--': package names

Examples:
  $ unpm add lodash@latest
  $ unpm add -d typescript @types/node
  $ unpm add --dry-run express                  # '--dry-run' to package manager
  $ unpm add --optional --os linux -- lodash    # '--os linux' to package manager, 'lodash' as package
`,
        )
        .allowUnknownOption();

    override get pm() {
        const isGlobal = this.sub.getOptionValue("global");

        return isGlobal ? this.main.globalPm : this.main.localPm;
    }

    override get operation(): Operations {
        const isGlobal = this.sub.getOptionValue("global");

        return isGlobal ? "global-add" : "add";
    }

    // eslint-disable-next-line complexity
    override resolveArgs(pm: Pm) {
        const { dev, optional, peer, exact } = this.sub.opts();

        const args: string[] = [];

        if (dev) {
            switch (pm) {
                case "npm":
                case "pnpm": {
                    args.push("--save-dev");
                    break;
                }
                case "yarn-classic":
                case "yarn-berry":
                case "bun": {
                    args.push("--dev");
                    break;
                }
                default: {
                    return err(unsupported(pm, "Option '-d/--dev'"));
                }
            }
        } else if (optional) {
            switch (pm) {
                case "npm":
                case "pnpm": {
                    args.push("--save-optional");
                    break;
                }
                case "yarn-classic":
                case "yarn-berry":
                case "bun": {
                    args.push("--optional");
                    break;
                }
                default: {
                    return err(unsupported(pm, "Option '--optional'"));
                }
            }
        } else if (peer) {
            switch (pm) {
                case "npm":
                case "pnpm": {
                    args.push("--save-peer");
                    break;
                }
                case "yarn-classic":
                case "yarn-berry":
                case "bun": {
                    args.push("--peer");
                    break;
                }
                default: {
                    return err(unsupported(pm, "Option '--peer'"));
                }
            }
        }

        if (exact) {
            switch (pm) {
                case "npm":
                case "pnpm": {
                    args.push("--save-exact");
                    break;
                }
                case "yarn-classic":
                case "yarn-berry":
                case "bun": {
                    args.push("--exact");
                    break;
                }
                default: {
                    return err(unsupported(pm, "Option '--exact'"));
                }
            }
        }

        args.push(...this.sub.args);

        return ok(args);
    }
}
