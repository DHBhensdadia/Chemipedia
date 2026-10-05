import { test } from "node:test";
import assert from "node:assert/strict";

import { buildContext } from "../../tools/build-context.js";
import { SIZE, shellDiagram, shellGeometry, shellSummary } from "../../scripts/components/shell-diagram.js";

const context = await buildContext();
const byNumber = (atomicNumber) =>
  context.elements.find((element) => element.atomicNumber === atomicNumber);

/** The five the phase's exit criteria name, plus the two ends of the table. */
const CASES = [1, 6, 26, 79, 92];

test("the geometry draws one ring per shell and one dot per electron", () => {
  for (const atomicNumber of CASES) {
    const element = byNumber(atomicNumber);
    const { rings } = shellGeometry(element.shells);

    assert.equal(rings.length, element.shells.length, `${element.symbol} has the wrong ring count`);
    assert.deepEqual(
      rings.map((ring) => ring.dots.length),
      element.shells,
      `${element.symbol}'s dots do not match its shells`,
    );
    assert.equal(
      rings.flatMap((ring) => ring.dots).length,
      atomicNumber,
      `${element.symbol}'s diagram does not account for every electron`,
    );
  }
});

test("the rings run outwards from the centre and stay inside the drawing", () => {
  const { rings } = shellGeometry(byNumber(92).shells);
  const radii = rings.map((ring) => ring.radius);

  assert.deepEqual(radii, [...radii].sort((one, other) => one - other), "the rings are out of order");
  assert.equal(radii.at(-1), 90, "the outermost ring should reach the drawing's own edge");

  for (const dot of rings.flatMap((ring) => ring.dots)) {
    assert.ok(dot.cx >= 0 && dot.cx <= SIZE, "a dot is outside the drawing");
    assert.ok(dot.cy >= 0 && dot.cy <= SIZE, "a dot is outside the drawing");
    assert.ok(dot.r > 0, "a dot has no radius");
  }
});

test("a shell with one electron gets one dot, not a filled ring", () => {
  const { rings } = shellGeometry([1]);

  assert.equal(rings.length, 1);
  assert.equal(rings[0].dots.length, 1);
  assert.equal(rings[0].dots[0].cx, 100);
  assert.equal(rings[0].dots[0].cy, 10, "the first electron belongs at the top of its ring");
});

test("shells that are not counts are left out rather than drawn as rings", () => {
  assert.deepEqual(
    shellGeometry([2, 0, null, 8, Number.NaN]).rings.map((ring) => ring.dots.length),
    [2, 8],
  );
  assert.deepEqual(shellGeometry(null).rings, []);
  assert.deepEqual(shellGeometry(undefined).rings, []);
  assert.equal(shellSummary([2, 8, null, 0]), "2, 8");
  assert.equal(shellSummary(null), "");
});

test("the diagram is one SVG with a ring per shell, a dot per electron and a nucleus", () => {
  const element = byNumber(26);
  const markup = shellDiagram({
    shells: element.shells,
    label: `Electron shell diagram for ${element.name}`,
  });

  assert.match(markup, /<svg class="shells" viewBox="0 0 200 200" role="img"/);
  assert.equal([...markup.matchAll(/class="shells__ring"/g)].length, element.shells.length);
  assert.equal([...markup.matchAll(/class="shells__dot"/g)].length, 26);
  assert.equal([...markup.matchAll(/class="shells__nucleus"/g)].length, 1);
  assert.ok(markup.includes('aria-label="Electron shell diagram for Iron"'));
});

test("an element with no shells gets no diagram rather than an empty picture", () => {
  assert.equal(shellDiagram({ shells: [], label: "Electron shells for nothing" }), "");
  assert.equal(shellDiagram({ shells: null, label: "Electron shells for nothing" }), "");
});

test("the diagram's name is escaped before it reaches the attribute", () => {
  const markup = shellDiagram({ shells: [1], label: 'Shells for "X" & <b>' });

  assert.ok(markup.includes("&quot;X&quot; &amp; &lt;b&gt;"));
  assert.equal(markup.includes("<b>"), false);
});
