import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The brand scan, as a test rather than a command someone has to remember.
 *
 * `docs/TESTING_STRATEGY.md` already asks for the scan before a phase closes, and a scan that is
 * remembered is a scan that is skipped. This one walks the whole of `source/` and fails the suite
 * if either reference's name appears anywhere in it — code, comment, page title, data record or
 * prose. The phase log's separate scan output exists so the check is visible in the record; this
 * exists so that it cannot be forgotten.
 *
 * **Two references, not one.** The site was planned against the first, and the atom viewer — the one
 * page that comes from somewhere else — against the second, whose palette, copy, data and assets are
 * recorded in `docs/research/04-reference-atom-viewer-audit.md` as measurements rather than shipped.
 * The second name was checked by hand until this list held it, which is exactly the kind of check
 * that survives until someone writes it down.
 *
 * `tests/` is skipped because this file has to name the things it forbids.
 */

const SOURCE = fileURLToPath(new URL("../..", import.meta.url));

/**
 * What may not appear, in the spellings each is written in.
 *
 * The second pattern is deliberately loose about the separator: the name is written as one word, as
 * two, and hyphenated, and every one of those is the same name. The words on their own — "atom
 * animation" typed by a person describing the page — would be caught too, which is the right side to
 * err on: the scan is cheap and the alternative is shipping a brand.
 */
const PROHIBITED = [
  { name: "the reference's name", pattern: /breaking[ _-]?atom/i },
  { name: "the second reference's name", pattern: /atom[ _-]?animation/i },
];

/**
 * Every file under `source/`, apart from the tests.
 *
 * @param {string} directory
 * @returns {Promise<string[]>} paths
 */
async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const found = [];

  for (const entry of entries) {
    const full = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (entry.name !== "tests" && entry.name !== "node_modules") {
        found.push(...(await filesUnder(full)));
      }
    } else {
      found.push(full);
    }
  }

  return found;
}

test("neither reference's name appears in the shipped tree", async () => {
  const files = await filesUnder(SOURCE);

  for (const { name, pattern } of PROHIBITED) {
    const offenders = [];

    for (const file of files) {
      const contents = await readFile(file, "utf8");

      if (pattern.test(contents)) {
        offenders.push(path.relative(SOURCE, file));
      }
    }

    assert.deepEqual(offenders, [], `${name} appears in: ${offenders.join(", ")}`);
  }
});

test("the scan is looking at the tree it thinks it is", async () => {
  const files = await filesUnder(SOURCE);

  assert.ok(files.length > 30, `the scan found only ${files.length} files`);
  assert.ok(files.some((file) => file.endsWith("styles/tokens.css")));
  assert.ok(files.some((file) => file.endsWith("data/elements.json")));
});
