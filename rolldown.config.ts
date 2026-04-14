import { defineConfig } from "rolldown";

import pkgJson from "./package.json";

export default defineConfig([
    {
        input: ["src/unpm.ts", "src/unpx.ts"],

        output: {
            dir: "bin",
            format: "esm",
            cleanDir: true,
            hashCharacters: "hex",
            entryFileNames: "[name].mjs",
            chunkFileNames: "chunks/chunk-[hash].mjs",
            intro: chunk => (chunk.isEntry ? "#!/usr/bin/env node" : ""),
        },

        platform: "node",

        transform: {
            define: {
                "import.meta.env": JSON.stringify({}),
                "import.meta.env.PKG_NAME": JSON.stringify(pkgJson.name),
                "import.meta.env.PKG_DESCRIPTION": JSON.stringify(pkgJson.description),
                "import.meta.env.PKG_VERSION": JSON.stringify(pkgJson.version),
            },
        },
    },
]);
