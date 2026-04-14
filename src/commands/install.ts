import { err, ok } from "@goodbyenjn/utils/result";
import { Command as BaseCmd } from "commander";

import { SubCmd } from "@/common/command";
import { unsupported } from "@/common/error";

import type { Operations, Pm } from "@/types";

export class InstallCmd extends SubCmd {
    override sub = new BaseCmd()
        .name("install")
        .alias("i")
        .description("Install project dependencies.")
        .option("-p, --prod", "Install production dependencies only.")
        .option("--no-optional", "Exclude optional dependencies.")
        .option("--no-peer", "Exclude peer dependencies.")
        .option("--frozen", "Disallow lockfile modifications.")
        .addHelpText(
            "after",
            `
Note:
  Unknown options will be passed through to package manager by default.

Examples:
  $ unpm install
  $ unpm install --frozen
  $ unpm install -p --ignore-scripts     # '--ignore-scripts' to package manager
  $ unpm install --no-peer --os linux    # '--os linux' to package manager
`,
        )
        .allowUnknownOption()
        .allowExcessArguments();

    override get pm() {
        return this.main.localPm;
    }

    override get operation(): Operations {
        const isFrozen = this.sub.getOptionValue("frozen");

        return isFrozen ? "frozen-install" : "install";
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
                case "yarn-classic": {
                    args.push("--production");
                    break;
                }
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
                case "yarn-classic": {
                    args.push("--ignore-optional");
                    break;
                }
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
