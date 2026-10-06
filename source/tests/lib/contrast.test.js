import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  AA_TEXT,
  ON_FILL_DARK,
  ON_FILL_LIGHT,
  contrastRatio,
  meetsAA,
  normaliseHex,
  readableForeground,
  relativeLuminance,
} from "../../scripts/lib/contrast.js";

const tokens = await readFile(new URL("../../styles/tokens.css", import.meta.url), "utf8");
const chips = await readFile(
  new URL("../../styles/components/legend-chips.css", import.meta.url),
  "utf8",
);

/** Every `--g-*` value declared in the token layer, read from the file itself. */
function groupColours() {
  const found = new Map();
  const pattern = /--(g-[a-z-]+):\s*(#[0-9a-fA-F]{3,6})\s*;/g;

  for (const [, name, value] of tokens.matchAll(pattern)) {
    found.set(name, value);
  }

  return found;
}

/** The value of a single token, as written in the stylesheet. */
function tokenValue(name) {
  const match = tokens.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,6})\\s*;`));

  assert.ok(match, `tokens.css does not declare --${name}`);
  return match[1];
}

test("a hex colour is normalised to six digits", () => {
  assert.equal(normaliseHex("#abc"), "aabbcc");
  assert.equal(normaliseHex("ABC"), "aabbcc");
  assert.equal(normaliseHex("#AABBCC"), "aabbcc");
  assert.equal(normaliseHex("  #15403d  "), "15403d");
});

test("a value that is not a hex colour is rejected", () => {
  assert.throws(() => normaliseHex("rebeccapurple"), TypeError);
  assert.throws(() => normaliseHex("#12345"), TypeError);
  assert.throws(() => normaliseHex(""), TypeError);
  assert.throws(() => normaliseHex(null), TypeError);
});

test("relative luminance runs from black to white", () => {
  assert.equal(relativeLuminance("#000000"), 0);
  assert.equal(relativeLuminance("#ffffff"), 1);
  assert.ok(relativeLuminance("#15403d") > 0 && relativeLuminance("#15403d") < 1);
});

test("black on white is the maximum contrast ratio", () => {
  assert.equal(Math.round(contrastRatio("#000000", "#ffffff")), 21);
});

test("a contrast ratio does not depend on the order of its arguments", () => {
  assert.equal(contrastRatio("#15403d", "#fdfbfa"), contrastRatio("#fdfbfa", "#15403d"));
});

test("the AA thresholds are the WCAG ones", () => {
  assert.equal(meetsAA(AA_TEXT), true);
  assert.equal(meetsAA(4.4), false);
  assert.equal(meetsAA(4.4, { large: true }), true);
  assert.equal(meetsAA(2.9, { large: true }), false);
});

test("every element group colour takes a foreground that passes AA for text", () => {
  const colours = groupColours();

  assert.ok(colours.size >= 11, `expected at least the eleven group colours, found ${colours.size}`);

  for (const [name, fill] of colours) {
    const foreground = readableForeground(fill);
    const ratio = contrastRatio(fill, foreground);

    assert.ok(
      meetsAA(ratio),
      `--${name} (${fill}) with ${foreground} is ${ratio.toFixed(2)}:1, below AA`,
    );
  }
});

test("a pale fill takes the dark foreground and a dark fill takes the cream one", () => {
  assert.equal(readableForeground("#efce69").toLowerCase(), ON_FILL_DARK);
  assert.equal(readableForeground("#15403d").toLowerCase(), ON_FILL_LIGHT);
  assert.equal(readableForeground("#ffffff").toLowerCase(), ON_FILL_DARK);
  assert.equal(readableForeground("#000000").toLowerCase(), ON_FILL_LIGHT);
});

test("the chosen foreground is the better of the two candidates, not merely acceptable", () => {
  for (const fill of groupColours().values()) {
    const chosen = contrastRatio(fill, readableForeground(fill));
    const other = [ON_FILL_DARK, ON_FILL_LIGHT].find(
      (candidate) => candidate !== readableForeground(fill),
    );

    assert.ok(chosen >= contrastRatio(fill, other), `${fill} chose the weaker foreground`);
  }
});

test("the foreground constants match the values the stylesheet declares", () => {
  assert.equal(ON_FILL_DARK.toLowerCase(), tokenValue("on-fill-dark").toLowerCase());
  assert.equal(ON_FILL_LIGHT.toLowerCase(), tokenValue("on-fill-light").toLowerCase());
});

test("every ink reaches AA on every surface it is written on", () => {
  // The tertiary ink failed this on the paper and on the sunken surface: 3.06:1 and 2.84:1 at the
  // 13.6px a caption is actually set at. The values are read from the stylesheet rather than
  // repeated here, so a palette change is held to the requirement rather than to a memory of it.
  for (const ink of ["ink", "ink-body", "ink-soft", "ink-faint"]) {
    for (const surface of ["bg", "surface", "surface-sunk"]) {
      const ratio = contrastRatio(tokenValue(ink), tokenValue(surface));

      assert.ok(
        meetsAA(ratio),
        `--${ink} on --${surface} is ${ratio.toFixed(2)}:1, below AA's ${AA_TEXT}:1`,
      );
    }
  }
});

test("the pill behind a legend chip's count is drawn by a ring, not a wash", () => {
  // Anything painted under the count moves the background toward the text: a wash of the text
  // colour left the count at 3.6:1 on the dark chips and 3.9:1 on the mid-tone ones. A ring leaves
  // the count on the fill whose foreground the palette already verifies.
  assert.match(tokens, /--ring-chip-count:/, "tokens.css does not declare the pill's ring");
  assert.doesNotMatch(
    tokens,
    /--mix-chip-count:|--alpha-chip-count:/,
    "a token for the count's wash is still declared",
  );
  assert.match(
    chips,
    /\.chip__n\s*\{[^}]*box-shadow:\s*inset 0 0 0 var\(--ring-chip-count\)/,
    "a chip's count is not ringed rather than washed",
  );
});
