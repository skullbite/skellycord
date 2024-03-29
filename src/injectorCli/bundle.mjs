import { build } from "esbuild";
import { argv } from "process";
import constants, { red } from "./constants.js";
const { injectorJoin, green } = constants;
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import ts from "typescript";
import packageFile from "../../package.json" assert { type: "json" };

const releaseState = argv.find(f => f.startsWith("--releaseState="))?.split("=")[1] ?? "dev";
const githubSha = argv.find(f => f.startsWith("--ghSha="))?.split("=")[1] ?? null;
const makeTypes = argv.find(f => f === "--types") != undefined;
// const watchMode = argv.includes("--watch");

async function _build() {
    if (!existsSync(injectorJoin("..", "dist"))) mkdirSync(injectorJoin("..", "dist"));
    buildFile("electron", [{ out: "patcher.min", in: injectorJoin("electron", "patcher") }]);

    buildFile("electron", [{ out: "preload.min", in: injectorJoin("electron", "preload") }]);

    buildFile("mod", [{ out: "skellycord.min", in: injectorJoin("skellycord") }]);

    if (makeTypes) {
        const program = ts.createProgram([injectorJoin("skellycord", "index")], {
            rootNames: [injectorJoin("skellycord", "index")],
            outFile: "./dist/skellycord.d.ts",
            declaration: true,
            emitDeclarationOnly: true,
            jsx: "react",
            types: ["discord-types", "react", "react-dom"]
        });

        program.emit(null, (fn, txt) => {
            // replace boring module paths with cool @ ones
            txt = txt.replace(
                /(declare module|from) "(index|webpack|apis|utils)(\/*.*)"/g,
                "$1 \"@skellycord/$2$3\""
            );
            txt = txt.replace(
                /\/index"/g,
                "\""
            );

            // adds css.d.ts to the types because i don't know how to bundle it otherwise :D
            const cssThing = readFileSync(injectorJoin("css.d.ts"), "utf8");
            txt += cssThing;
        
            /*let globalsThing = readFileSync(injectorJoin("globals.d.ts"), "utf8");
            globalsThing = globalsThing.replace("./", "@");
            txt += "\n" + globalsThing;*/

            try {
                writeFileSync(fn, txt);
                green("skellycord.d.ts", false, "+");
            }
            catch (e) {
                red("skellycord.d.ts", true, "!");
                console.error(e.stack);
            }
        });
    }
}

async function buildFile(compileTarget, entryPoints) {
    /** @type {import("esbuild").BuildOptions} */
    let extraData = {
        platform: "browser",
        external: ["electron"]
    };
    
    switch (compileTarget) {
        case "electron":
            extraData.platform = "node";
            break;
        case "mod":
            delete extraData.external;
            extraData.keepNames = true;
            extraData.loader = {
                ".ttf": "text"
            };
            extraData.define = {
                __RELEASE_STATE: `"${releaseState}"`,
                __MOD_VERSION: `"${packageFile.version}"`,
                __GH_SHA: !githubSha ? "null" : `"${githubSha}"`
            };
            break;
    }

    try {
        const curBuild = await build({
            outbase: "src",
            outdir: "dist",
            entryPoints,
            write: false,
            minify: true,
            bundle: true,
            ...extraData
        });

        makeFiles(curBuild);
    }
    catch (e) {
        red(entryPoints[0].in.split("/").pop(), true, "!");
        console.error(e.stack);
    }
    
}

function makeFiles(buildRes) {
    if (buildRes.errors?.length) return console.error(buildRes.errors);
    for (const i in buildRes.outputFiles) {
        const out = buildRes.outputFiles[i];
        
        let code = out.text;

        const fatPath = out.path.split("/");
        // const backToDist = fatPath.findIndex(p => p === "dist");
        const filename = fatPath[fatPath.length - 1];
        
        try {
            writeFileSync(out.path, code);
            green(filename, false, "+");
        }
        catch (e) {
            red(filename, true, "!");
            console.error(e.stack);
        }
    }

}

_build();