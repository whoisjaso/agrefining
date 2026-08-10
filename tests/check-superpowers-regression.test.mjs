import assert from "node:assert/strict";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const scratchDirectory = join(root, ".superpowers", "sdd", "check-regression");
const checkedDirectory = join(root, ".superpowers", "check-regression");
const bannedCharacter = String.fromCodePoint(0x2014);

function runCheck() {
  return spawnSync(process.execPath, ["scripts/check.mjs"], { cwd: root, encoding: "utf8" });
}

test("checker ignores only SDD scratch while still catching banned characters elsewhere in .superpowers", () => {
  rmSync(scratchDirectory, { recursive: true, force: true });
  rmSync(checkedDirectory, { recursive: true, force: true });

  try {
    mkdirSync(scratchDirectory, { recursive: true });
    writeFileSync(join(scratchDirectory, "ignored.txt"), bannedCharacter);
    const scratchResult = runCheck();
    assert.equal(scratchResult.status, 0, scratchResult.stderr);

    mkdirSync(checkedDirectory, { recursive: true });
    const checkedFile = join(checkedDirectory, "banned.txt");
    writeFileSync(checkedFile, bannedCharacter);
    const checkedResult = runCheck();
    assert.notEqual(checkedResult.status, 0, "checker must reject banned characters outside .superpowers/sdd/");
    assert.match(`${checkedResult.stdout}${checkedResult.stderr}`, /Banned character in \/.superpowers\/check-regression\/banned.txt/);
  } finally {
    rmSync(scratchDirectory, { recursive: true, force: true });
    rmSync(checkedDirectory, { recursive: true, force: true });
  }
});
