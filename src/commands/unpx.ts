import { MainCmd } from "@/common/command";

import type { Executor, Terminator } from "@/common/process";

export class UnpxCmd extends MainCmd {
    constructor(executor?: Executor, terminator?: Terminator) {
        super(executor, terminator);

        this.cmd
            .helpCommand(false)
            .helpOption(false)
            .enablePositionalOptions(false)
            .allowUnknownOption();

        this.autoDetect = false;
    }
}
