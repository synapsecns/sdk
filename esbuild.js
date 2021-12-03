import esbuild from "esbuild";

import path from "path";

import {dtsPlugin} from "esbuild-plugin-d.ts";
import {nodeExternalsPlugin} from "esbuild-node-externals";

const
    SRC_PATH        = path.resolve("./src"),
    OUT_PATH        = path.resolve("./dist"),
    TSCONFIG_PATH   = path.resolve("./tsconfig.json"),
    ENTRYPOINT_PATH = path.resolve(SRC_PATH, "./index.ts");

let ESBUILD_CONFIG = {
    entryPoints: [ENTRYPOINT_PATH],
    outdir:      OUT_PATH,
    bundle:      true,
    minify:      true,
    // sourcemap:   true,
    platform:    "neutral",
    format:      "esm",
    plugins: [
        dtsPlugin({
            tsconfig: TSCONFIG_PATH
        }),
        nodeExternalsPlugin(),
    ]
}

esbuild.build(ESBUILD_CONFIG).catch((err) => {
    console.error(err);
    process.exit(1);
})