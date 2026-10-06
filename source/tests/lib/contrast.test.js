import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  AA_TEXT,
  ON_FILL_DARK,
  ON_FILL_LIGHT,
  compositeOver,
  contrastRatio,
  lowestAlphaForAA,
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

/** The value of a single numeric token, as written in the stylesheet, unit and all. */
function numericToken(name) {
  const match = tokens.match(new RegExp(`--${name}:\\s*([\\d.]+)`));

  assert.ok(match, `tokens.css does not declare --${name}`);
  return Number(match[1]);
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

test("fading an ink moves it towards the fill it sits on", () => {
  assert.equal(compositeOver("#000000", "#ffffff", 1), "#000000");
  assert.equal(compositeOver("#000000", "#ffffff", 0), "#ffffff");
  assert.equal(compositeOver("#000000", "#ffffff", 0.5), "#808080");
  assert.equal(compositeOver("#12211f", "#559982"), "#12211f", "a full-strength ink is its own colour");
});

test("the ceiling is the alpha where AA stops, and there is none when the ink cannot reach it", () => {
  assert.equal(lowestAlphaForAA("#12211f", "#559982"), 0.93, "the actinide sage is the tight pairing");
  assert.equal(lowestAlphaForAA("#fdfbfa", "#477f6c"), 1, "a pairing with no margin affords no fade");
  assert.equal(lowestAlphaForAA("#ffffff", "#ffffff"), null, "an ink that fails at full strength has no ceiling");
  assert.ok(
    contrastRatio(compositeOver("#12211f", "#559982", 0.93), "#559982") >= AA_TEXT,
    "the ceiling is derived from the threshold it claims to meet",
  );
});

test("a tile's faded ink stays inside AA on every fill a tile is painted with", () => {
  // The atomic number and the name are the symbol's own colour at a fraction of it, and that
  // fraction is the tightest thing in the palette: 0.9 of the dark ink over the actinide sage came
  // out at 4.32:1 at the 8.8px an atomic number is set at, which is an AA failure Lighthouse found
  // and the accessibility sweep's own compositing did not. The ceiling is derived from the eleven
  // pairings a tile is really painted with — not their deeper second values, which no tile ever
  // sits on — so a fill can be adjusted without the fade quietly breaking it.
  const fills = [...groupColours()].filter(([name]) => !name.endsWith("-deep"));

  assert.equal(fills.length, 11, "a tile is painted with the eleven group fills");

  for (const token of ["opacity-tile-number", "opacity-tile-name", "opacity-card-z"]) {
    const alpha = numericToken(token);

    assert.ok(alpha < 1, `--${token} is ${alpha}: a tile's hierarchy is the fade itself`);

    for (const [name, fill] of fills) {
      const ink = readableForeground(fill);
      const allowed = lowestAlphaForAA(ink, fill);
      const ratio = contrastRatio(compositeOver(ink, fill, alpha), fill);

      assert.ok(
        allowed !== null && alpha >= allowed,
        `--${token} at ${alpha} leaves ${ink} on --${name} at ${ratio.toFixed(2)}:1, below AA's ${AA_TEXT}:1 (that fill affords ${allowed})`,
      );
    }
  }
});

test("an isolated table drains its fill, and the ink on the drained fill reaches AA", () => {
  // The group pages are written with one key isolated, so this is a resting state rather than a
  // hover: fading the whole tile to 0.22 of an ink over 0.22 of a fill converges on the paper and
  // came out at 1.5:1. The drain is a mix towards the paper instead, and the text stays at full
  // strength on what that leaves — which is a pale tint, so the dark ink is the one that holds.
  const mix = numericToken("mix-tile-dim") / 100;
  const paper = tokenValue("bg");

  assert.match(tokens, /--mix-tile-dim:/, "tokens.css does not declare the drain");
  assert.doesNotMatch(
    tokens,
    /--dim-tile:|--drain-tile:/,
    "a token that fades the whole tile is still declared",
  );

  for (const [name, fill] of [...groupColours()].filter(([key]) => !key.endsWith("-deep"))) {
    const drained = compositeOver(fill, paper, mix);
    const ratio = contrastRatio(ON_FILL_DARK, drained);

    assert.ok(
      meetsAA(ratio),
      `--${name} drained to ${drained} leaves the ink at ${ratio.toFixed(2)}:1, below AA`,
    );
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
