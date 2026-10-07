/**
 * What the atom scene's tests are built from.
 *
 * Not a test file — `node --test source/tests` runs files named as tests, and this is the half the
 * scene's two test files share. Everything here stands in for a browser without pretending to be one:
 *
 * - **a token layer over `tokens.css` itself**, so a scene that reads a value the stylesheet no longer
 *   declares fails here rather than on a page;
 * - **a canvas that records instead of drawing**, with the context stub beside it in `webgl-stub.js`;
 * - **a recorder for what each frame was told**, because the layer uploads from scratch arrays it
 *   reuses — the matrices in a transcript are only the last frame's until it writes again, so every
 *   measurement has to copy what it needs the moment that frame has been stepped.
 *
 * The same reason `webgl-stub.js` is a module rather than a block copied twice.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { buildAtom } from "../../scripts/lib/atom-model.js";
import { atomScale, createAtomScene } from "../../scripts/components/atom-scene.js";
import { channels } from "../../scripts/lib/contrast.js";
import { multiply } from "../../scripts/lib/matrix4.js";
import { createAtomView } from "../../scripts/components/atom-view.js";
import { callsOf, createCanvas, createGlStub } from "./webgl-stub.js";

/** The records the site publishes. */
const records = JSON.parse(await readFile(new URL("../../data/elements.json", import.meta.url), "utf8"));

/** Every custom property `tokens.css` declares, by name. */
const declared = new Map(
  [...(await readFile(new URL("../../styles/tokens.css", import.meta.url), "utf8")).matchAll(
    /(--[a-z0-9-]+)\s*:\s*([^;]+);/g,
  )].map((match) => [match[1], match[2].trim()]),
);

/** The names the scene has asked the token layer for, in the order it asked. */
export const asked = [];

/**
 * A token's value as a number, refusing a name the stylesheet does not declare.
 *
 * @param {string} name
 * @returns {number}
 */
export function token(name) {
  assert.ok(declared.has(name), `tokens.css declares no ${name}`);

  return Number.parseFloat(declared.get(name));
}

/**
 * A colour token's channels, at the precision the layer stores them in.
 *
 * The layer widens each channel to a 0-to-1 number for its shader and then writes it into a
 * `Float32Array`, so this is the same rounding a transcript will hold.
 *
 * @param {string} name
 * @returns {number[]}
 */
export function colourOf(name) {
  assert.ok(declared.has(name), `tokens.css declares no ${name}`);

  return channels(declared.get(name)).map((channel) => Math.fround(channel / 255));
}

/**
 * The token layer, as `getComputedStyle` hands it over on the page.
 *
 * @returns {object}
 */
export function tokenReader() {
  /**
   * @param {string} name
   * @returns {string}
   */
  function text(name) {
    asked.push(name);

    if (!declared.has(name)) {
      throw new Error(`the token layer declares no ${name}`);
    }

    return declared.get(name);
  }

  return {
    number: (name) => Number.parseFloat(text(name)),
    list: (name) => text(name).split(/\s+/).map(Number),
    colour: (name) => channels(text(name)).map((channel) => channel / 255),
  };
}

/** The view's own configuration, in the shape the layer takes it. */
export const VIEW_CONFIG = {
  sphere: { segments: 8, rings: 6 },
  pixelRatioLimit: 2,
  lighting: { lightDirection: [10, 10, 5], lightStrength: 1, ambient: 0.35 },
  clearColour: [0.03, 0.13, 0.12, 1],
};

/**
 * @param {number} atomicNumber
 * @returns {object}
 */
export function recordFor(atomicNumber) {
  const record = records.find((entry) => entry.atomicNumber === atomicNumber);

  assert.ok(record, `no record for ${atomicNumber} protons`);

  return record;
}

/**
 * A model, built the way the page builds one.
 *
 * @param {number} protons
 * @param {number} neutrons
 * @param {number} electrons
 * @returns {object}
 */
export function modelOf(protons, neutrons, electrons) {
  return buildAtom({
    record: recordFor(protons),
    protons,
    neutrons,
    electrons,
    scale: atomScale(tokenReader()),
  });
}

/**
 * A scene on a canvas that records instead of drawing.
 *
 * @param {object} [options]
 * @param {object} [options.atom]
 * @param {number} [options.speed]
 * @returns {{ scene: object, view: object, gl: object, canvas: object }}
 */
export function sceneFor({ atom, speed } = {}) {
  const gl = createGlStub();
  const canvas = createCanvas({ context: gl, clientWidth: 800, clientHeight: 600 });
  const view = createAtomView(canvas, VIEW_CONFIG);
  const scene = createAtomScene({
    view,
    tokens: tokenReader(),
    atom: atom ?? modelOf(6, 6, 6),
    ...(speed === undefined ? {} : { speed }),
  });

  return { scene, view, gl, canvas };
}

/**
 * The same scene on a machine that gives the browser no WebGL2 context at all.
 *
 * @param {object} atom
 * @returns {{ scene: object, view: object }}
 */
export function sceneWithoutWebGL(atom) {
  const canvas = createCanvas({ context: null, clientWidth: 800, clientHeight: 600 });
  const view = createAtomView(canvas, VIEW_CONFIG);

  return { view, scene: createAtomScene({ view, tokens: tokenReader(), atom }) };
}

/**
 * What the last frame uploaded, in the order the layer's four attributes go up.
 *
 * @param {object} gl
 * @returns {{ positions: Float32Array, radii: Float32Array, colours: Float32Array, glows: Float32Array }}
 */
export function uploaded(gl) {
  const writes = gl.calls.filter((call) => call.method === "bufferSubData");
  const last = writes.slice(-4);

  assert.equal(last.length, 4, "a frame should upload one buffer per attribute");

  return {
    positions: last[0].data,
    radii: last[1].data,
    colours: last[2].data,
    glows: last[3].data,
  };
}

/**
 * The last matrix a frame gave one of the layer's uniforms.
 *
 * @param {object} gl
 * @param {string} name
 * @returns {number[]}
 */
export function lastUniform(gl, name) {
  return callsOf(gl, "uniformMatrix4fv").filter((call) => call.uniform === name).at(-1).value;
}

/**
 * Step a scene, keeping a copy of what each frame was told.
 *
 * The copies are the point: the layer's uniforms are filled from arrays it reuses, so a transcript read
 * after the fact holds the last frame's matrix sixteen times over.
 *
 * @param {object} scene
 * @param {object} gl
 * @param {number} frames
 * @param {number} [delta]
 * @returns {{ models: number[][], views: number[][] }}
 */
export function run(scene, gl, frames, delta = 1 / 60) {
  const models = [];
  const views = [];

  for (let frame = 0; frame < frames; frame += 1) {
    scene.step(delta);
    models.push([...lastUniform(gl, "uModel")]);
    views.push([...lastUniform(gl, "uView")]);
  }

  return { models, views };
}

/**
 * @param {number[]} matrix
 * @returns {number[]}
 */
function transpose(matrix) {
  const turned = [];

  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      turned[column * 4 + row] = matrix[row * 4 + column];
    }
  }

  return turned;
}

/**
 * How far the atom turned between two of its own matrices.
 *
 * A rotation matrix's trace is `1 + 2·cos θ`, so a product of one frame's matrix and another's
 * inverse reads the angle between them in one line — and, from float32 matrices, to about a
 * millionth of a radian, which is why every test that wants a distance measures the two ends of its
 * window rather than adding up sixty small steps.
 *
 * Only an angle below half a turn is readable this way, so the windows below are chosen to stay there.
 *
 * @param {number[]} from
 * @param {number[]} to
 * @returns {number}
 */
export function turnedBetween(from, to) {
  const difference = multiply(transpose(from), to);
  const half = (difference[0] + difference[5] + difference[10] - 1) / 2;

  return Math.acos(Math.min(1, Math.max(-1, half)));
}

/**
 * How far the atom turned over a run of frames.
 *
 * @param {number[][]} models
 * @returns {number}
 */
export function swept(models) {
  return turnedBetween(models[0], models.at(-1));
}

/**
 * How far an angle has come round from where it started, in radians, whichever way it wrapped.
 *
 * @param {number} angle
 * @param {number} start
 * @returns {number}
 */
export function turnedFrom(angle, start) {
  let moved = (angle - start) % (Math.PI * 2);

  if (moved > Math.PI) {
    moved -= Math.PI * 2;
  }

  if (moved < -Math.PI) {
    moved += Math.PI * 2;
  }

  return moved;
}

/** A view that keeps what it is handed, for the questions the graphics card cannot be asked. */
function fakeView() {
  const seen = { particles: [], rings: [], frames: [], resizes: 0 };

  return {
    seen,

    setParticles(list) {
      seen.particles.push(list);
    },

    setRings(list) {
      seen.rings.push(list);
    },

    draw(frame) {
      seen.frames.push(frame);

      return true;
    },

    resize() {
      seen.resizes += 1;

      return false;
    },
  };
}

/**
 * A scene on a view that keeps what it is handed.
 *
 * The stub answers "what did the layer do"; this answers "what did the scene ask it to do", which is
 * the other half of the seam — the rings' radii, the particle lists, the matrix of a frame.
 *
 * @param {object} atom
 * @returns {object}
 */
export function fakeSceneFor(atom) {
  const view = fakeView();

  return { view, seen: view.seen, scene: createAtomScene({ view, tokens: tokenReader(), atom }) };
}
