import { indent } from "@goodbyenjn/utils";

const ERROR_MESSAGE_REGEX = /^error:\s*(.+)$/im;

export const choicesToString = (choices: readonly string[]) =>
    choices.map(x => `'${x}'`).join(", ");

export const fmtChoices = (choices: readonly string[]) =>
    `Valid choices are: ${choicesToString(choices)}.`;

// TODO: maybe no need to format as using Result
export const fmtErrorMessage = (str: string) => {
    let output = `Error:\n`;

    const match = ERROR_MESSAGE_REGEX.exec(str);
    if (match && match[1]) {
        const message = match[1].slice(0, 1).toUpperCase() + match[1].slice(1);
        output += indent(2)(message);
    } else {
        output += indent(2)(str);
    }

    return output;
};

export const unsupported = (pm: string, what: string) =>
    `${what} is not supported for package manager '${pm}'.`;
