import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const motion = await readFile(new URL("../../styles/motion.css", import.meta.url), "utf8");
const tokens = await readFile(new URL("../../styles/tokens.css", import.meta.url), "utf8");

/** The sheet without comments, for the structural checks below. */
const bare = motion.replace(/\/\*[\s\S]*?\*\//g, "");

test("every animation in the sheet runs only where motion is welcome and view timelines exist", () => {
  const gate = bare.indexOf("@media screen and (prefers-reduced-motion: no-preference)");
  const supports = bare.indexOf("@supports (animation-timeline: view())");
  const animation = bare.indexOf("animation: reveal");

  assert.ok(gate >= 0, "the motion sheet has no screen-and-motion gate");
  assert.ok(supports > gate, "the view-timeline gate is not inside the motion gate");
  assert.ok(animation > supports, "an animation runs outside the gates");

  const animations = [...bare.matchAll(/animation:\s*[^;]+;/g)];

  assert.equal(animations.length, 1, "the motion sheet animates more than the reveal");
});

test("the reveals name the page's sections and its lists, grids and card grids, and nothing else", () => {
  const named = [
    "main section",
    'main ul[class$="-list"]',
    'main ul[class$="-grid"]',
    'main ul[class$="-cards"]',
  ];

  for (const selector of named) {
    assert.ok(bare.includes(selector), `the reveals do not name ${selector}`);
  }

  // One selector list, one rule: no other element in the project is revealed.
  const rules = [...bare.matchAll(/([^{}]+)\{/g)].map(([, selectors]) =>
    selectors.trim().replace(/\s+/g, " "),
  );

  assert.deepEqual(
    rules,
    [
      "@media screen and (prefers-reduced-motion: no-preference)",
      "@supports (animation-timeline: view())",
      'main section, main ul[class$="-list"], main ul[class$="-grid"], main ul[class$="-cards"]',
      "::view-transition-old(root), ::view-transition-new(root)",
      "@keyframes reveal",
      "from",
      "to",
    ],
    "the sheet carries a rule the reveals do not explain",
  );
});

test("the route cross-fade is the house's timing, not the platform's default", () => {
  assert.ok(
    bare.includes("animation-duration: var(--dur-base)"),
    "the cross-fade does not read the house duration",
  );
  assert.ok(
    bare.includes("animation-timing-function: var(--ease-soft)"),
    "the cross-fade does not read the house curve",
  );
});

test("the rise and the range come from the token layer, and the scrub is linear", () => {
  assert.ok(bare.includes("translateY(var(--rise-sm))"), "the rise does not read the token layer");
  assert.ok(
    bare.includes("animation-range: entry 0% entry var(--reveal-travel)"),
    "the travel does not read the token layer",
  );
  // Linear on purpose: a scroll timeline is scrubbed by the reader, not
  // played by the clock, so the honest mapping is position — and it is what
  // keeps an element peeking over the fold at load almost invisible instead
  // of a front-loaded ghost.
  assert.ok(bare.includes("animation: reveal linear both"), "the scrub is not linear");
});

test("every token the sheet reads is one the token layer declares", () => {
  const names = [...bare.matchAll(/var\((--[a-z0-9-]+)/gi)].map(([, name]) => name);

  assert.ok(names.length >= 2, "the sheet reads fewer tokens than it was built from");

  for (const name of new Set(names)) {
    assert.ok(tokens.includes(`${name}:`), `tokens.css declares no ${name}`);
  }
});

test("the reveal's last frame is the finished page", () => {
  const from = bare.match(/from\s*\{([^}]*)\}/);
  const to = bare.match(/to\s*\{([^}]*)\}/);

  assert.ok(from, "the keyframes declare no first frame");
  assert.ok(to, "the keyframes declare no last frame");
  assert.ok(/opacity:\s*0\b/.test(from[1]), "the first frame is not absent");
  assert.ok(/opacity:\s*1\b/.test(to[1]), "the last frame is not present");
  assert.ok(/transform:\s*none/.test(to[1]), "the last frame is not settled");
});
