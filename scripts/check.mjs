import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const required = ["package.json", "vercel.json", "src/style.css", "src/site.js", "scripts/build.mjs", "assets/ag-mark.svg", "assets/ag-silver-hero.png"];
const failures = required.filter((file) => !existsSync(join(root, file))).map((file) => `Missing ${file}`);
const banned = [/\u2014/u, /[\u{1F300}-\u{1FAFF}]/u];

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

for (const path of files(root).filter((path) => !path.includes("/.git/") && !path.endsWith(".png"))) {
  const source = readFileSync(path, "utf8");
  if (banned.some((pattern) => pattern.test(source))) failures.push(`Banned character in ${path.replace(root, "")}`);
}
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log("AG_REFINING_CHECK_OK");
