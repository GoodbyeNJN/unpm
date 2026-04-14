import { version } from "../../package.json";

export const getCmdVersion = () => {
    if (!import.meta.env) return version;

    return import.meta.env.PKG_VERSION || "";
};
