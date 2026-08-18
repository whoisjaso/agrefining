import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const requiredAssets = [
  "assets/ag-silver-hero-1600.webp",
  "assets/ag-silver-hero-mobile.webp",
  "assets/material-dental-1280.webp",
  "assets/material-dental-800.webp",
  "assets/material-scrap-silver-1280.webp",
  "assets/material-scrap-silver-800.webp",
  "assets/material-watch-batteries-1280.webp",
  "assets/material-watch-batteries-800.webp",
  "assets/material-xray-film-1280.webp",
  "assets/material-xray-film-800.webp",
  "assets/fonts/newsreader-latin-opsz.woff2",
  "assets/fonts/manrope-latin-wght.woff2"
];

function freshArchive() {
  const target = mkdtempSync(join(tmpdir(), "ag-assets-contract-"));
  const archive = join(target, "source.tar");
  const tree = execFileSync("git", ["write-tree"], { cwd: root, encoding: "utf8" }).trim();
  let bytes;
  try {
    bytes = execFileSync("git", [
      "archive",
      "--format=tar",
      tree,
      "scripts/fetch-assets.mjs",
      ...requiredAssets
    ], { cwd: root, maxBuffer: 8 * 1024 * 1024 });
  } catch (error) {
    assert.fail(`Fresh Git archive is missing required production inputs:\n${String(error.stderr)}`);
  }
  writeFileSync(archive, bytes);
  execFileSync("tar", ["-xf", archive, "-C", target]);
  unlinkSync(archive);
  const preload = join(target, "forbid-network.mjs");
  writeFileSync(preload, 'globalThis.fetch = async () => { throw new Error("NETWORK_FORBIDDEN"); };\n');
  return { target, preload };
}

function runVerifier(target, preload) {
  return spawnSync(process.execPath, ["--import", preload, "scripts/fetch-assets.mjs"], {
    cwd: target,
    encoding: "utf8"
  });
}

test("production asset verification succeeds from a fresh Git archive without network access", () => {
  const fixture = freshArchive();
  try {
    const result = runVerifier(fixture.target, fixture.preload);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Verified 12 production assets/);
  } finally {
    rmSync(fixture.target, { recursive: true, force: true });
  }
});

test("a missing committed asset fails locally instead of downloading from production", () => {
  const fixture = freshArchive();
  try {
    unlinkSync(join(fixture.target, "assets/ag-silver-hero-1600.webp"));
    const result = runVerifier(fixture.target, fixture.preload);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Missing required committed asset ag-silver-hero-1600\.webp/);
    assert.doesNotMatch(result.stderr, /NETWORK_FORBIDDEN/);
  } finally {
    rmSync(fixture.target, { recursive: true, force: true });
  }
});
