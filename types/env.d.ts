interface ImportMetaEnv {
    readonly PKG_NAME: string;
    readonly PKG_VERSION: string;
    readonly PKG_DESCRIPTION: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
