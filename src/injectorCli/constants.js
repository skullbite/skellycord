const { existsSync, mkdirSync } = require("fs");
const { homedir } = require("os");
const { join } = require("path");
const { env, platform } = require("process");

// whats chalk
const makeLog = (string, color, bold=false, prefix="|") => console.log(`${bold ? "\x1b[1m" : ""}\x1b[${color}m${prefix}\x1b[0m${bold ? "\x1b[1m" : ""} ${string} ${bold ? "\x1b[0m" : ""}`);
exports.green = (string, bold=false, prefix="|") => makeLog(string, "32", bold, prefix);
exports.red = (string, bold=false, prefix="|") => makeLog(string, "31", bold, prefix);
exports.blue = (string, bold=false, prefix="|") => makeLog(string, "34", bold, prefix);
exports.yellow = (string, bold=false, prefix="|") => makeLog(string, "33", bold, prefix);

exports.injectorJoin = (...strings) => join(__dirname, "..", ...strings);

exports.makeDirIfNonExistent = path => {
    if (!existsSync(path)) mkdirSync(path);
};

exports.TYPE_FLAGS = ["-stable", "-ptb", "-canary"];

const MACOS_PARTIAL_PATH = ["Library", "Application Support"];
const LINUX_PARTIAL_PATH = [".config"];

function findPath(target) {
    let suffix = target !== "stable" ? target : "";
    switch (platform) {
        case "win32": 
            const suffixSplit = suffix.split("");
            suffixSplit[0] = suffixSplit[0].toUpperCase(0);
            suffix = suffixSplit.join("");
            return join(env.LOCALAPPDATA, "Discord" + suffix);
        case "darwin": return join(homedir(), ...MACOS_PARTIAL_PATH, "discord" + suffix);
        case "linux": return join(homedir(), ...LINUX_PARTIAL_PATH, "discord" + suffix);
    }
}

exports.findPath = findPath;