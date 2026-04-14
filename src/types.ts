export type Pm = "npm" | "yarn-classic" | "yarn-berry" | "pnpm" | "bun";

export type Runner = "node";

export type Operations =
    | "pm"
    | "add"
    | "global-add"
    | "remove"
    | "global-remove"
    | "list"
    | "global-list"
    | "install"
    | "frozen-install"
    | "update"
    | "global-update"
    | "interactive-update"
    | "global-interactive-update"
    | "dlx"
    | "exec"
    | "run";

export interface ResolvedCommand {
    command: string;
    args: string[];
    dryRun: boolean;
}
