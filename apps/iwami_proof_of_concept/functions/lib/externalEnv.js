"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readExternalEnvValue = readExternalEnvValue;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const ENV_RELATIVE_PATHS = [
    "apps/kyudai-dictionary-mvp-mobile/.env.local",
    "apps/kyudai-dictionary-mvp-mobile/.env",
    "apps/admin-console/.env.local",
    "apps/admin-console/.env",
];
let cachedExternalEnv = null;
function listCandidateRepoRoots() {
    const roots = new Set();
    roots.add(node_path_1.default.resolve(__dirname, "../../../../"));
    roots.add(node_path_1.default.resolve(process.cwd(), "../../.."));
    roots.add(node_path_1.default.resolve(process.cwd(), "../.."));
    roots.add(node_path_1.default.resolve(process.cwd(), ".."));
    roots.add(node_path_1.default.resolve(process.cwd()));
    return Array.from(roots);
}
function stripInlineComment(value) {
    let inSingle = false;
    let inDouble = false;
    for (let i = 0; i < value.length; i += 1) {
        const ch = value[i];
        if (ch === "'" && !inDouble) {
            inSingle = !inSingle;
            continue;
        }
        if (ch === '"' && !inSingle) {
            inDouble = !inDouble;
            continue;
        }
        if (ch === "#" && !inSingle && !inDouble) {
            return value.slice(0, i).trimEnd();
        }
    }
    return value.trimEnd();
}
function unquote(value) {
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
        return value.slice(1, -1);
    }
    return value;
}
function parseEnvFile(filePath) {
    const parsed = new Map();
    const text = node_fs_1.default.readFileSync(filePath, "utf8");
    const lines = text.split(/\r?\n/);
    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#"))
            continue;
        const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
        if (!match)
            continue;
        const key = match[1];
        const value = unquote(stripInlineComment(match[2]).trim());
        parsed.set(key, value);
    }
    return parsed;
}
function loadExternalEnv() {
    if (cachedExternalEnv)
        return cachedExternalEnv;
    const merged = new Map();
    const seenPaths = new Set();
    const roots = listCandidateRepoRoots();
    for (const root of roots) {
        for (const relativePath of ENV_RELATIVE_PATHS) {
            const fullPath = node_path_1.default.resolve(root, relativePath);
            if (seenPaths.has(fullPath) || !node_fs_1.default.existsSync(fullPath))
                continue;
            seenPaths.add(fullPath);
            const parsed = parseEnvFile(fullPath);
            for (const [key, value] of parsed.entries()) {
                if (!value)
                    continue;
                if (!merged.has(key))
                    merged.set(key, value);
            }
        }
    }
    cachedExternalEnv = merged;
    return merged;
}
function readExternalEnvValue(keys) {
    const env = loadExternalEnv();
    for (const key of keys) {
        const value = env.get(key)?.trim();
        if (value)
            return value;
    }
    return null;
}
//# sourceMappingURL=externalEnv.js.map