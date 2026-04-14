import { getErrorMessage } from "@goodbyenjn/utils";
import { Result } from "@goodbyenjn/utils/result";
import { AbortPromptError, CancelPromptError, ExitPromptError } from "@inquirer/core";
import { select } from "@inquirer/prompts";

import { PM_NAMES } from "@/constants";

import type { Pm } from "@/types";

const safeSelect = Result.wrap(select, error => {
    if (
        error instanceof AbortPromptError ||
        error instanceof CancelPromptError ||
        error instanceof ExitPromptError
    ) {
        return "No package manager selected. Aborting...";
    }

    return getErrorMessage(error);
});

export const promptSelectPm = (message?: string) =>
    safeSelect<Pm>({
        message:
            message || "No package manager specified nor detected. Please select one to proceed:",
        choices: PM_NAMES,
    });
