import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { AA_TEXT, compositeOver, contrastRatio } from "../../scripts/lib/contrast.js";
import { routes } from "../../scripts/router/routes.js";

const tokens = await readFile(new URL("../../styles/tokens.css", import.meta.url), "utf8");
const atmosphere = await readFile(new URL("../../styles/atmosphere.css", import.meta.url), "utf8");
const build = await readFile(new URL("../../tools/build.js", import.meta.url), "utf8");
const styleguide = await readFile(new URL("../../styleguide/index.html", import.meta.url), "utf8");

/**
 * Every custom property the token layer declares, by name, with its comments and whitespace
 * stripped. This test reads the file rather than importing it for the reason the atom tests do:
 * a token is a fact about the stylesheet, and the stylesheet is what the browser reads.
 */
const declared = new Map(
  [...tokens.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gim)].map(([, name, value]) => [
    name,
    value.replace(/\/\*[\s\S]*?\*\//g, "").trim(),
  ]),
);

/** The value of a token, refusing to guess when the token layer does not declare it. */
function valueOf(name) {
  const value = declared.get(name);

  assert.ok(value, `tokens.css declares no ${name}`);
  return value;
}

/** Every `--g-*` colour declared in the token layer, read from the file itself. */
const groupColours = new Map(
  [...tokens.matchAll(/--(g-[a-z-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map(([, name, value]) => [
    name,
    value,
  ]),
);

/** Follows `var()` references until a colour token is reached, at most four hops deep. */
function resolve(name) {
  let token = valueOf(name);

  for (let hop = 0; hop < 4 && token.startsWith("var("); hop += 1) {
    token = valueOf(token.match(/var\((--[a-z0-9-]+)\)/)[1]);
  }

  return token;
}

/** A field hue token (`var(--g-noble-gases)`) as the colour it resolves to. */
function resolvedHue(hue) {
  return resolve(hue.slice(hue.indexOf("(") + 1, hue.lastIndexOf(")")));
}

const PAPER = valueOf("--bg");
const FAINT = valueOf("--ink-faint");

/**
 * The largest alpha at which one hue over the paper still keeps the faintest ink at AA. This is
 * the ceiling tokens §22's alphas are cut from; the derivation is in
 * docs/research/06-living-background-and-motion-audit.md and the same function decides every
 * family's pair below.
 */
function ceilingAlpha(hue, target = AA_TEXT) {
  let best = 0;

  for (let alpha = 0; alpha <= 1; alpha += 1 / 2000) {
    if (contrastRatio(FAINT, compositeOver(hue, PAPER, alpha)) >= target) {
      best = alpha;
    } else {
      break;
    }
  }

  return best;
}

/** Reads a numeric token — `0.055`, `72%` or `180s` — as the number it starts with. */
function numberToken(name) {
  const match = valueOf(name).match(/-?[\d.]+/);

  assert.ok(match, `--${name} is not a number: ${valueOf(name)}`);
  return Number.parseFloat(match[0]);
}

/** The hue-and-alpha pairs a bloom or a family may wear, as [name, hue token, alpha]. */
function huePairs() {
  const pairs = [];

  for (const name of ["2", "3", "4"]) {
    pairs.push([
      `bloom ${name}`,
      valueOf(`--field-bloom-${name}-hue`),
      numberToken(`--field-bloom-${name}-alpha`),
    ]);
  }

  for (const token of declared.keys()) {
    const family = token.match(/^--field-family-([a-z]+)-hue$/);

    if (family) {
      pairs.push([
        `family ${family[1]}`,
        valueOf(token),
        numberToken(`--field-family-${family[1]}-alpha`),
      ]);
    }
  }

  pairs.push(["family default", valueOf("--field-family-hue"), numberToken("--field-family-alpha")]);

  return pairs;
}

/** Every rule in the atmosphere sheet, as [selectors, body], for the structural checks below. */
const rules = [
  ...atmosphere.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g),
]
  .map(([, selectors, body]) => [selectors.trim(), body])
  .filter(([selectors]) => !selectors.startsWith("@"));

test("every field hue resolves to a declared --g-* token", () => {
  const families = huePairs();

  assert.equal(
    families.length,
    13,
    "three numbered blooms, nine family pairs and the default pair — a fourth bloom is the family's",
  );

  for (const [name, hue, alpha] of families) {
    const resolved = resolve(hue.slice(hue.indexOf("(") + 1, hue.lastIndexOf(")")));

    assert.match(resolved, /^#[0-9a-f]{6}$/i, `${name}: ${hue} does not resolve to a colour`);
    assert.ok(
      [...groupColours.values()].includes(resolved),
      `${name}: ${hue} resolves to ${resolved}, which is no group colour`,
    );
    assert.ok(alpha > 0, `${name} carries no alpha`);
  }

  const lattice = resolve("--field-lattice-hue");

  assert.equal(lattice, valueOf("--ink"), "the lattice is not the ink's own colour");
});

test("no hue may carry more than its own ceiling allows", () => {
  for (const [name, hue, alpha] of huePairs()) {
    const colour = resolve(hue.slice(hue.indexOf("(") + 1, hue.lastIndexOf(")")));
    const ceiling = ceilingAlpha(colour);

    assert.ok(ceiling >= 0.05, `${name}: ceiling ${ceiling} is too low to try (check --bg)`);
    assert.ok(
      alpha <= ceiling * 0.85,
      `${name}: alpha ${alpha} is past 85% of ${hue}'s ceiling (${(ceiling * 0.85).toFixed(4)})`,
    );
  }
});

test("the texture alone still leaves the faintest ink at AA", () => {
  const grain = numberToken("--field-grain-alpha") * numberToken("--field-grain-sample-opacity");
  const composite = compositeOver(
    "#000000",
    compositeOver(resolve("--field-lattice-hue"), PAPER, numberToken("--field-lattice-alpha")),
    grain,
  );

  assert.ok(
    contrastRatio(FAINT, composite) >= AA_TEXT,
    `lattice and grain alone measure ${contrastRatio(FAINT, composite).toFixed(2)} : 1`,
  );
});

test("no overlap of the blooms leaves the faintest ink below AA", () => {
  // The plan's bound: the deepest composite the tokens can draw, for every family, at every
  // reference viewport, still clears AA for --ink-faint. The geometry is read from the same
  // tokens atmosphere.css paints from, and the model charges the texture at its worst on every
  // sample. The browser audit holds the rendered pixels; this holds the numbers they come from.
  const baseFocus = Number(tokens.match(/--field-wash-focus:\s*([\d.]+)/)[1]);
  const narrowFocus = Number(
    tokens.match(/@media \(max-width: 45rem\)[\s\S]*?--field-wash-focus:\s*([\d.]+)/)?.[1],
  );

  assert.equal(baseFocus, 1, "the desktop wash factor is no longer 1");
  assert.ok(narrowFocus > 0 && narrowFocus < 1, "the narrow query no longer steps the wash back");

  const radius = numberToken("--field-bloom-radius") / 100; // `68vmax` — 0.68 of the longer side
  const fade = numberToken("--field-bloom-fade") / 100;
  const lattice = numberToken("--field-lattice-alpha");
  const grain = numberToken("--field-grain-alpha") * numberToken("--field-grain-sample-opacity");
  const ink = resolve("--field-lattice-hue");

  const layer = (name, hue, alpha) => ({
    hue,
    alpha,
    x: numberToken(`--field-bloom-${name}-x`) / 100,
    y: numberToken(`--field-bloom-${name}-y`) / 100,
  });

  // The paint order, bottom to top: sheet one's amber then its coral, sheet two's blue, and the
  // family bloom last — the order atmosphere.css lays them down.
  const sheets = [
    layer("4", resolvedHue(valueOf("--field-bloom-4-hue")), numberToken("--field-bloom-4-alpha")),
    layer("2", resolvedHue(valueOf("--field-bloom-2-hue")), numberToken("--field-bloom-2-alpha")),
    layer("3", resolvedHue(valueOf("--field-bloom-3-hue")), numberToken("--field-bloom-3-alpha")),
  ];

  const families = huePairs()
    .filter(([name]) => name.startsWith("family"))
    .map(([name, hue, alpha]) => ({
      name: name.replace("family ", ""),
      ...layer("1", resolvedHue(hue), alpha),
    }));

  assert.equal(families.length, 10, "nine families and the default pair");

  const viewports = [
    [1280, 900],
    [1920, 1080],
    [768, 1024],
    [375, 812],
  ];

  let floor = Number.POSITIVE_INFINITY;
  let where = "";

  for (const [width, height] of viewports) {
    const focus = width < 720 ? narrowFocus : baseFocus;
    const reach = radius * Math.max(width, height) * fade;
    const step = width < 720 ? 12 : 20;

    for (const family of families) {
      for (let y = 0; y <= height; y += step) {
        for (let x = 0; x <= width; x += step) {
          let colour = PAPER;

          for (const bloom of [...sheets, family]) {
            const distance = Math.hypot(x - bloom.x * width, y - bloom.y * height);

            if (distance < reach) {
              colour = compositeOver(bloom.hue, colour, bloom.alpha * focus * (1 - distance / reach));
            }
          }

          colour = compositeOver(ink, colour, lattice);
          colour = compositeOver("#000000", colour, grain);

          const ratio = contrastRatio(FAINT, colour);

          if (ratio < floor) {
            floor = ratio;
            where = `${family.name} at ${width}×${height}`;
          }
        }
      }
    }
  }

  assert.ok(
    floor >= AA_TEXT,
    `the darkest composite measures ${floor.toFixed(3)} : 1 — ${where}`,
  );
});

test("the grain's tile says the alpha the test charged for", () => {
  const image = valueOf("--field-grain-image");
  const tile = Number(image.match(/opacity='([\d.]+)'/)?.[1]);

  assert.ok(!Number.isNaN(tile), "the grain tile carries no opacity");
  assert.equal(tile, numberToken("--field-grain-sample-opacity"));
});

test("every bloom anchor sits in the frame's outer band", () => {
  for (const name of ["1", "2", "3", "4"]) {
    const x = numberToken(`--field-bloom-${name}-x`);
    const y = numberToken(`--field-bloom-${name}-y`);

    assert.ok(x <= 15 || x >= 85, `bloom ${name} sits at x ${x}% — inside the reading column`);
    assert.ok(y <= 20 || y >= 80, `bloom ${name} sits at y ${y}% — inside the reading column`);
  }
});

test("the drift is slow, small, and can never open an edge", () => {
  assert.ok(numberToken("--field-drift-duration-a") >= 90, "sheet A turns too fast");
  assert.ok(numberToken("--field-drift-duration-b") >= 90, "sheet B turns too fast");
  assert.ok(numberToken("--field-drift-duration-a") < numberToken("--field-drift-duration-b"));

  const bleed = numberToken("--field-sheet-bleed");

  assert.ok(numberToken("--field-drift-x") <= bleed, "the drift can travel past the bleed");
  assert.ok(numberToken("--field-drift-y") <= bleed, "the drift can travel past the bleed");
});

test("the sheets' scale is the bleed, doubled and returned", () => {
  const bleed = numberToken("--field-sheet-bleed");
  const scale = numberToken("--field-sheet-scale");

  assert.ok(Math.abs(scale - (1 + (2 * bleed) / 100)) <= 0.001, `scale ${scale} corrects no bleed`);
});

test("the four sheets are fixed, behind, and deaf", () => {
  const sheets = rules.find(([selectors]) => selectors.startsWith("html::before,"));

  assert.ok(sheets, "the sheets' base rule is missing");
  const [, body] = sheets;

  for (const line of ["position: fixed", "z-index: -1", "pointer-events: none", "inset: 0"]) {
    assert.ok(body.includes(line), `the sheets' rule does not carry \`${line}\``);
  }

  for (const selector of ["html::before", "html::after", "body::before", "body::after"]) {
    assert.ok(sheets[0].includes(selector), `the base rule does not name ${selector}`);
  }
});

test("the family map is exhaustive, declared, and exclusive", () => {
  const mapped = new Map();

  for (const [selectors, body] of rules) {
    if (!selectors.includes("body[data-page=")) {
      continue;
    }

    const names = new Set(
      [...body.matchAll(/--field-family-hue:\s*var\(--field-family-([a-z]+)-hue\)/g)].map(([, n]) => n),
    );

    assert.equal(names.size, 1, `one family per rule: ${selectors}`);

    const [family] = names;

    assert.ok(declared.has(`--field-family-${family}-hue`), `${family} has no hue token`);
    assert.ok(declared.has(`--field-family-${family}-alpha`), `${family} has no alpha token`);
    assert.ok(
      body.includes(`var(--field-family-${family}-alpha)`),
      `${family} changes hue but not its alpha`,
    );

    for (const [, page] of selectors.matchAll(/body\[data-page="([^"]+)"\]/g)) {
      assert.ok(!mapped.has(page), `page ${page} wears two families`);
      mapped.set(page, family);
    }
  }

  assert.equal(new Set(mapped.values()).size, 9, "the map names nine families");

  const defaults = new Set(["home", "about", "contact", "404"]);
  const templates = new Set([...routes.map((route) => route.template), "404"]);

  for (const template of templates) {
    assert.ok(
      mapped.has(template) || defaults.has(template),
      `template ${template} wears no family and is not one of the defaults`,
    );
  }
});

test("the family pair is read where it is overridden, not through a root alias", () => {
  assert.ok(
    !declared.has("--field-bloom-1-hue") && !declared.has("--field-bloom-1-alpha"),
    "an alias at the root would freeze the family's pair before a page could override it",
  );

  const sheet = rules.find(([selectors]) => selectors === "body::before");

  assert.ok(sheet, "the family sheet is missing");
  assert.ok(
    sheet[1].includes("var(--field-family-hue)"),
    "the family bloom does not read the family hue on its own sheet",
  );
  assert.ok(
    sheet[1].includes("var(--field-family-alpha)"),
    "the family bloom does not read the family alpha on its own sheet",
  );
});

test("print takes the whole field off", () => {
  const print = atmosphere.match(/@media print\s*\{([\s\S]*)\}\s*$/);

  assert.ok(print, "the print block is missing");

  for (const selector of ["html::before", "html::after", "body::before", "body::after"]) {
    assert.ok(print[1].includes(selector), `print leaves ${selector} on`);
  }

  assert.ok(print[1].includes("display: none"), "print hides the field with something other than none");
});

test("the drift is gated on the motion preference", () => {
  const animations = [...atmosphere.matchAll(/animation\s*:/g)];
  const gate = atmosphere.indexOf("@media (prefers-reduced-motion: no-preference)");

  assert.ok(gate > -1, "the no-preference gate is missing");
  assert.equal(animations.length, 2, "the field moves with more than the two sheets");
  assert.ok(animations[0].index > gate, "an animation runs outside the gate");
});

test("every page links the field, after the layout it sits under", () => {
  const sheets = build.match(/GLOBAL_STYLESHEETS = \[([^\]]+)\]/);

  assert.ok(sheets, "the build declares no global sheets");
  const order = [...sheets[1].matchAll(/"([^"]+)"/g)].map(([, sheet]) => sheet);

  assert.ok(order.includes("styles/atmosphere.css"), "the build does not ship the field");
  assert.ok(
    order.indexOf("styles/atmosphere.css") > order.indexOf("styles/layout.css"),
    "the field loads before the layout",
  );
  assert.ok(styleguide.includes("/styles/atmosphere.css"), "the styleguide does not show the field");
});
