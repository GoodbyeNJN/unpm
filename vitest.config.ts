import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [
        tsconfigPaths({
            projectDiscovery: "lazy",
        }),
    ],
    test: {
        include: ["tests/**/*.test.ts"],
        chaiConfig: {
            truncateThreshold: 0,
        },
        server: {
            deps: {
                inline: ["@goodbyenjn/utils", "package-manager-detector"],
            },
        },
    },
});
