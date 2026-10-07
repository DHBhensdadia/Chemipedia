import { test } from "node:test";
import assert from "node:assert/strict";

import { drawField, fieldFor } from "../../scripts/components/atom-field.js";

import { callsOf, createCanvas, createGlStub } from "./webgl-stub.js";

/**
 * Whether two lists of numbers are the same to the precision a graphics card is given them at.
 *
 * The pass uploads `Float32Array`s — that is what a uniform is — so a colour written as `0.11` comes
 * back as the nearest single-precision number to it, which is not the same double.
 */
function sameNumbers(actual, expected) {
  assert.equal(actual.length, expected.length);

  for (const [at, value] of expected.entries()) {
    assert.ok(Math.abs(actual[at] - value) < 1e-6, `${actual[at]} is not ${value}`);
  }
}

/** A grid as `tokens.css` declares it, in the shape the scene hands it over. */
const GRID = {
  colour: [0.11, 0.26, 0.23],
  pitch: 28,
  major: 4,
  majorStrength: 1.9,
  fade: 0.55,
};

/** The slot the view keeps a program in, with the names its uniforms answer to. */
function slot() {
  return {
    program: { kind: "program", id: 1 },
    uniforms: Object.fromEntries(
      ["uResolution", "uPitch", "uLine", "uStage", "uMajor", "uMajorStrength", "uFade"].map((name) => [
        name,
        { name },
      ]),
    ),
  };
}

test("a grid is normalised into the numbers the pass uploads", () => {
  const field = fieldFor(GRID);

  assert.equal(field.pitch, 28);
  assert.equal(field.major, 4);
  assert.equal(field.majorStrength, 1.9);
  assert.equal(field.fade, 0.55);
  assert.equal(field.colour.length, 3);
});

test("no grid is a stage without a field, not an error", () => {
  assert.equal(fieldFor(null), null);
  assert.equal(fieldFor(undefined), null);
});

test("a grid that is not a grid is refused where it is declared", () => {
  const cases = {
    "a pitch of nothing": { ...GRID, pitch: 0 },
    "a pitch that is not a number": { ...GRID, pitch: "28px" },
    "a strong line every no lines": { ...GRID, major: 0 },
    "a strength of nothing": { ...GRID, majorStrength: 0 },
    "a fade past everything": { ...GRID, fade: 2 },
    "a negative fade": { ...GRID, fade: -0.1 },
    "two numbers for a colour": { ...GRID, colour: [1, 0] },
    "a colour that is not a list": { ...GRID, colour: "#1c423b" },
  };

  for (const [name, grid] of Object.entries(cases)) {
    assert.throws(() => fieldFor(grid), TypeError, name);
  }
});

test("the pass paints the whole surface once, and leaves depth and blending as it found them", () => {
  const gl = createGlStub();
  const canvas = createCanvas({ context: gl, clientWidth: 700, clientHeight: 544 });

  canvas.width = 1400;
  canvas.height = 1088;

  drawField(gl, slot(), { canvas, field: fieldFor(GRID), stage: [0.05, 0.17, 0.16, 1] });

  const order = gl.calls.map((call) => call.method);

  assert.deepEqual(order, [
    "disable",
    "disable",
    "useProgram",
    "uniform2fv",
    "uniform1f",
    "uniform3fv",
    "uniform3fv",
    "uniform1f",
    "uniform1f",
    "uniform1f",
    "drawArrays",
    "enable",
    "enable",
  ]);
  assert.deepEqual(
    callsOf(gl, "disable").map((call) => call.args[0]),
    [gl.DEPTH_TEST, gl.BLEND],
    "nothing is under the field to test against or behind it to blend with",
  );
  assert.deepEqual(
    callsOf(gl, "enable").map((call) => call.args[0]),
    [gl.DEPTH_TEST, gl.BLEND],
    "the field changed how the rest of the frame would be drawn",
  );
  assert.deepEqual(callsOf(gl, "drawArrays")[0], {
    method: "drawArrays",
    mode: gl.TRIANGLES,
    first: 0,
    count: 3,
    // Three corners and no buffer: the triangle is built from the vertex' own index.
  });
});

test("the pitch is the stylesheet's, in the surface's own pixels", () => {
  const gl = createGlStub();
  const canvas = createCanvas({ context: gl, clientWidth: 700, clientHeight: 544 });

  canvas.width = 1400;
  canvas.height = 1088;

  drawField(gl, slot(), { canvas, field: fieldFor(GRID), stage: [0, 0, 0, 1] });

  const pitch = callsOf(gl, "uniform1f").find((call) => call.uniform === "uPitch");

  assert.equal(pitch.value, 56, "28 CSS pixels on a surface drawn at twice that");

  const resolution = callsOf(gl, "uniform2fv")[0];

  assert.deepEqual(resolution.value, [1400, 1088]);
});

test("a surface with no box to measure is its own ratio, and one drawn smaller than its box keeps the stylesheet's pitch", () => {
  const gl = createGlStub();
  const canvas = createCanvas({ context: gl, clientWidth: 0, clientHeight: 0 });

  canvas.width = 300;
  canvas.height = 200;

  drawField(gl, slot(), { canvas, field: fieldFor(GRID), stage: [0, 0, 0, 1] });

  assert.equal(
    callsOf(gl, "uniform1f").find((call) => call.uniform === "uPitch").value,
    28,
    "a canvas with no box is one CSS pixel per pixel",
  );

  // A surface drawn smaller than its own box is the case a device ratio below one makes: the grid must
  // stay 28 CSS pixels apart, which means fewer device pixels between its lines rather than more.
  const smaller = createCanvas({ context: gl, clientWidth: 400, clientHeight: 200 });

  smaller.width = 300;
  smaller.height = 150;

  drawField(gl, slot(), { canvas: smaller, field: fieldFor(GRID), stage: [0, 0, 0, 1] });

  assert.equal(
    callsOf(gl, "uniform1f")
      .filter((call) => call.uniform === "uPitch")
      .at(-1).value,
    21,
  );
});

test("the field takes the stage's own colour, so the panel and its clear agree", () => {
  const gl = createGlStub();
  const canvas = createCanvas({ context: gl });
  const stage = [0.05, 0.17, 0.16, 1];

  canvas.width = 100;
  canvas.height = 100;

  drawField(gl, slot(), { canvas, field: fieldFor(GRID), stage });

  sameNumbers(callsOf(gl, "uniform3fv").find((call) => call.uniform === "uStage").value, stage.slice(0, 3));
  sameNumbers(callsOf(gl, "uniform3fv").find((call) => call.uniform === "uLine").value, GRID.colour);
});
