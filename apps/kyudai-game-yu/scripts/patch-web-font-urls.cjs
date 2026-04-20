const fs = require("fs");
const path = require("path");

const webJsDir = path.resolve(__dirname, "..", "dist", "_expo", "static", "js", "web");
if (!fs.existsSync(webJsDir)) {
  throw new Error(`Web bundle directory not found: ${webJsDir}`);
}

const jsFiles = fs
  .readdirSync(webJsDir)
  .filter((name) => name.endsWith(".js"))
  .map((name) => path.join(webJsDir, name));

if (jsFiles.length === 0) {
  throw new Error(`No JS bundle files found in: ${webJsDir}`);
}

const cacheTag = process.env.FONT_CACHE_BUSTER || Date.now().toString(36);
const fontUrlPattern =
  /\/assets\/node_modules\/@expo\/vector-icons\/build\/vendor\/react-native-vector-icons\/Fonts\/[A-Za-z0-9_.-]+\.ttf/g;

let totalReplaced = 0;

for (const filePath of jsFiles) {
  const original = fs.readFileSync(filePath, "utf8");
  let replacedCountInFile = 0;
  const patched = original.replace(fontUrlPattern, (url) => {
    replacedCountInFile += 1;
    if (url.includes("?")) return url;
    return `${url}?v=${cacheTag}`;
  });

  if (replacedCountInFile > 0) {
    fs.writeFileSync(filePath, patched, "utf8");
    totalReplaced += replacedCountInFile;
    console.log(`[patch-web-font-urls] patched ${replacedCountInFile} URLs in ${path.basename(filePath)}`);
  }
}

if (totalReplaced === 0) {
  throw new Error("No vector-icon font URLs were found to patch.");
}

console.log(`[patch-web-font-urls] done. total patched URLs: ${totalReplaced}, cache tag: ${cacheTag}`);
