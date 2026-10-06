import { test } from "node:test";
import assert from "node:assert/strict";

import { createAtomView } from "../../scripts/components/atom-view.js";
import { createOrbitCamera } from "../../scripts/lib/orbit-camera.js";
import { identity } from "../../scripts/lib/matrix4.js";
import { callsOf, createGlStub, memoryOf } from "./webgl-stub.js";

/**
 * A canvas that counts what is written to it.
 *
 * The surface's size is set by assigning to `width` and `height`, and assigning to either clears what
 * was drawn — so a test has to count the writes rather than read the value back.
 *
 * @param {object} [options]
 * @param {object | null} [options.context] what the canvas should hand back for `webgl2`
 * @param {boolean} [options.refuses] whether asking for a context should throw instead
 * @returns {object}
 */
function createCanvas({ context = null, refuses = false, clientWidth = 400, clientHeight = 200 } = {}) {
  const writes = { width: 0, height: 0 };
  const surface = { width: 0, height: 0 };

  return {
    writes,
    clientWidth,
    clientHeight,

    get width() {
      return surface.width;
    },

    set width(value) {
      surface.width = value;
      writes.width += 1;
    },

    get height() {
      return surface.height;
    },

    set height(value) {
      surface.height = value;
      writes.height += 1;
    },

    getContext: (kind) => {
      if (refuses) {
        throw new Error("this browser will not give out a context");
      }

      return kind === "webgl2" ? context : null;
    },
  };
}

/** The scene's own numbers, in the shape the view expects them. */
const CONFIG = {
  sphere: { segments: 8, rings: 6 },
  pixelRatioLimit: 2,
  lighting: { lightDirection: [10, 10, 5], lightStrength: 1, ambient: 0.35 },
  clearColour: [0.06, 0.12, 0.1, 1],
};

/**
 * @param {number} count
 * @returns {object}
 */
function particles(count) {
  return {
    count,
    positions: Array.from({ length: count * 3 }, (unused, at) => at / 10),
    radii: Array.from({ length: count }, () => 0.2),
    colours: Array.from({ length: count * 3 }, (unused, at) => (at % 3) / 2),
    glows: Array.from({ length: count }, () => 0),
  };
}

/**
 * @param {object} [own]
 * @returns {object}
 */
function ring(own = {}) {
  return {
    radius: 2,
    tube: 0.007,
    segments: 32,
    tubeSegments: 8,
    colour: [0.2, 0.8, 1],
    opacity: 0.15,
    ...own,
  };
}

/**
 * A colour as the shader will receive it: whatever a 32-bit float makes of the number that was written.
 *
 * @param {number[]} values
 * @returns {number[]}
 */
const toFloat32 = (values) => values.map((value) => Number(value.toFixed(5)));

/** A camera, as the page will hand one over. */
function camera() {
  return createOrbitCamera({
    distance: 16.8,
    azimuth: 0,
    polar: 1.35,
    damping: 8,
    fieldOfView: (50 * Math.PI) / 180,
    near: 0.1,
    far: 120,
    minDistance: 4,
    maxDistance: 40,
    minPolar: 0.2,
    maxPolar: Math.PI - 0.2,
  });
}

test("a machine without a context is a viewer that does nothing rather than one that fails", () => {
  const view = createAtomView(createCanvas(), { ...CONFIG, loop: { requestFrame: () => 1, cancelFrame: () => {} } });

  assert.equal(view.available(), false);
  assert.equal(view.hasDrawn(), false);
  assert.equal(view.draw({ model: identity(), camera: camera() }), false);
  assert.equal(view.resize(1), true, "a surface can still be sized without a context");

  view.setParticles(particles(4));
  view.setRings([ring()]);
  view.start(() => {});
  view.stop();
  view.destroy();

  assert.equal(view.hasDrawn(), false);
  assert.equal(view.running(), false);
});

test("a browser that refuses a context outright is treated as one that has none", () => {
  const view = createAtomView(createCanvas({ refuses: true }), CONFIG);

  assert.equal(view.available(), false);
});

test("the surface follows the canvas' box and stops at the ratio the scene allows", () => {
  const canvas = createCanvas({ clientWidth: 400, clientHeight: 200 });
  const view = createAtomView(canvas, CONFIG);

  assert.equal(view.resize(1), true);
  assert.deepEqual(view.size(), { width: 400, height: 200 });
  assert.equal(view.resize(1), false, "a resize that changes nothing should say so");
  assert.equal(canvas.writes.width, 1, "and must not touch the surface, because that clears it");

  assert.equal(view.resize(3), true);
  assert.deepEqual(view.size(), { width: 800, height: 400 }, "three is more ratio than the scene allows");
  assert.equal(view.resize(1), true, "and coming back down is a change like any other");
  assert.deepEqual(view.size(), { width: 400, height: 200 });
});

test("the view refuses a scene it could not draw with, before asking for a context", () => {
  const canvas = createCanvas();

  assert.throws(() => createAtomView(null, CONFIG), /needs a canvas/);
  assert.throws(() => createAtomView({}, CONFIG), /needs a canvas/);
  assert.throws(() => createAtomView(canvas, {}), /pixelRatioLimit must be a finite number/);
  assert.throws(() => createAtomView(canvas, { ...CONFIG, pixelRatioLimit: "two" }), /finite number/);
  assert.throws(() => createAtomView(canvas, { ...CONFIG, pixelRatioLimit: 0 }), /greater than zero/);
  assert.throws(() => createAtomView(canvas, { ...CONFIG, lighting: undefined }), /lighting\.lightStrength/);
  assert.throws(
    () => createAtomView(canvas, { ...CONFIG, lighting: { ...CONFIG.lighting, lightDirection: [1, 2] } }),
    /lightDirection must be three numbers/,
  );
  assert.throws(() => createAtomView(canvas, { ...CONFIG, clearColour: [0, 0, 0] }), /four numbers/);
  assert.throws(() => createAtomView(canvas, { ...CONFIG, sphere: { segments: 2, rings: 6 } }), /3 or more/);
  assert.throws(() => createAtomView(canvas, { ...CONFIG, sphere: { segments: 8, rings: 1 } }), /2 or more/);
  assert.throws(() => createAtomView(canvas, { ...CONFIG, sphere: undefined }), /sphere\.segments/);
  assert.throws(() => createAtomView(canvas, { ...CONFIG, loop: { longestStep: 0 } }), /greater than zero/);
});

test("the particles are refused unless there is one of everything for every one of them", () => {
  const view = createAtomView(createCanvas(), CONFIG);
  const good = particles(2);

  assert.throws(() => view.setParticles(), /whole number/);
  assert.throws(() => view.setParticles({}), /whole number/);
  assert.throws(() => view.setParticles({ ...good, count: -1 }), /whole number/);
  assert.throws(() => view.setParticles({ ...good, count: 1.5 }), /whole number/);
  assert.throws(() => view.setParticles({ ...good, positions: [1, 2, 3] }), /positions must hold at least 6/);
  assert.throws(() => view.setParticles({ ...good, radii: [0.2] }), /radii must hold at least 2/);
  assert.throws(() => view.setParticles({ ...good, colours: [] }), /colours must hold at least 6/);
  assert.throws(() => view.setParticles({ ...good, glows: null }), /glows must hold at least 2/);

  // Nothing to draw is a legitimate state — an atom with no electrons — and not a refusal.
  view.setParticles({ count: 0, positions: [], radii: [], colours: [], glows: [] });
  view.setRings(null);
});

test("the context is set up for a scene with depth, back faces culled and translucent rings", () => {
  const gl = createGlStub();

  createAtomView(createCanvas({ context: gl }), CONFIG);

  assert.deepEqual(
    callsOf(gl, "enable").map((call) => call.args[0]),
    [gl.DEPTH_TEST, gl.CULL_FACE, gl.BLEND],
  );
  assert.deepEqual(callsOf(gl, "cullFace")[0].args, [gl.BACK]);
  assert.deepEqual(callsOf(gl, "blendFunc")[0].args, [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA]);
  assert.equal(callsOf(gl, "createProgram").length, 2, "the sphere and the ring programs");
});

test("a frame draws the rings first, from behind, and then every particle in one call", () => {
  const gl = createGlStub();
  const canvas = createCanvas({ context: gl });
  const view = createAtomView(canvas, CONFIG);

  view.resize(1);
  view.setParticles(particles(90));
  view.setRings([
    ring({ radius: 2 }),
    ring({ radius: 3.2, colour: [1, 0, 0], opacity: 0.5 }),
  ]);

  assert.equal(view.hasDrawn(), false, "nothing has been drawn yet");

  assert.equal(view.draw({ model: identity(), camera: camera() }), true);
  assert.equal(view.hasDrawn(), true);

  const instanced = callsOf(gl, "drawElementsInstanced");

  assert.equal(instanced.length, 1, "ninety particles should be one call");
  assert.equal(instanced[0].instances, 90);
  assert.equal(callsOf(gl, "drawElements").length, 2, "one ring, one call");

  const methods = gl.calls.map((call) => call.method);

  assert.ok(
    methods.indexOf("drawElements") < methods.indexOf("drawElementsInstanced"),
    "the translucent rings belong behind the particles",
  );
  assert.deepEqual(
    callsOf(gl, "depthMask").map((call) => call.args[0]),
    [false, true],
    "a ring that wrote depth would hide the nucleons inside it",
  );
  assert.deepEqual(callsOf(gl, "viewport").at(-1), { method: "viewport", x: 0, y: 0, width: 400, height: 200 });
});

test("each ring carries its own colour and transparency, and the particles their own glow", () => {
  const gl = createGlStub();
  const view = createAtomView(createCanvas({ context: gl }), CONFIG);

  view.setParticles(particles(3));
  view.setRings([ring({ colour: [0.2, 0.8, 1], opacity: 0.15 }), ring({ colour: [1, 0, 0], opacity: 0.5 })]);
  view.draw({ model: identity(), camera: camera() });

  assert.deepEqual(
    callsOf(gl, "uniform3fv")
      .filter((call) => call.uniform === "uColour")
      .map((call) => toFloat32(call.value)),
    [
      [0.2, 0.8, 1],
      [1, 0, 0],
    ],
  );
  assert.deepEqual(
    callsOf(gl, "uniform1f")
      .filter((call) => call.uniform === "uOpacity")
      .map((call) => call.value),
    [0.15, 0.5],
  );

  const model = callsOf(gl, "uniformMatrix4fv").filter((call) => call.uniform === "uModel");

  assert.equal(model.length, 2, "both programs are given the frame's model matrix");
  assert.deepEqual([...model[0].value], identity());
  assert.equal(callsOf(gl, "clear").length, 1, "one frame, one clear");
});

test("the frame's own size is what the projection is asked for", () => {
  const gl = createGlStub();
  const canvas = createCanvas({ context: gl, clientWidth: 300, clientHeight: 600 });
  const view = createAtomView(canvas, CONFIG);
  const asked = [];
  const stub = {
    projectionMatrix: (aspect) => {
      asked.push(aspect);

      return identity();
    },
    viewMatrix: () => identity(),
  };

  view.resize(1, 1);
  view.draw({ model: identity(), camera: stub });

  assert.deepEqual(asked, [0.5], "a tall canvas is a narrow view");
});

test("a program that will not build leaves a viewer that says so instead of one that throws", () => {
  const gl = createGlStub({ fails: "compile" });
  const view = createAtomView(createCanvas({ context: gl }), CONFIG);

  assert.equal(view.available(), false);
  assert.equal(view.hasDrawn(), false);
  assert.equal(view.draw({ model: identity(), camera: camera() }), false);
  assert.equal(callsOf(gl, "drawElementsInstanced").length, 0);

  view.destroy();

  assert.deepEqual(memoryOf(gl).outstanding, [], "the shader that failed should not be left behind");
});

test("the loop is started, stepped and stopped through the view", () => {
  // Whether a frame should be stepped at all is the frame loop's own subject and tested there. What
  // this holds is that the viewer hands the loop over rather than keeping a second one of its own.
  let waiting = null;
  let seconds = 0;
  const view = createAtomView(createCanvas({ context: createGlStub() }), {
    ...CONFIG,
    loop: {
      requestFrame: (callback) => (waiting = callback),
      cancelFrame: () => (waiting = null),
      now: () => seconds,
      isVisible: () => true,
    },
  });
  const deltas = [];

  assert.equal(view.running(), false, "a viewer should not be drawing before it is asked to");

  view.start((delta) => deltas.push(delta));

  assert.equal(view.running(), true);

  seconds = 0.02;

  const frame = waiting;

  waiting = null;
  frame(20);

  assert.deepEqual(deltas.map((delta) => Number(delta.toFixed(3))), [0.02]);

  view.stop();

  assert.equal(view.running(), false);
  assert.equal(waiting, null, "a stopped view should not be holding a frame");
  assert.throws(() => view.start("every frame"), /step function/);
});

test("disposing the view gives back every program, buffer and array it made", () => {
  const gl = createGlStub();
  const view = createAtomView(createCanvas({ context: gl }), CONFIG);

  view.setParticles(particles(60));
  view.setRings([ring(), ring({ radius: 3.2 })]);
  view.draw({ model: identity(), camera: camera() });
  view.destroy();

  assert.equal(view.hasDrawn(), false);
  assert.equal(callsOf(gl, "deleteProgram").length, 2);
  assert.deepEqual(memoryOf(gl).outstanding, []);
});

test("rings are built when they are declared, and never in the middle of a frame", () => {
  const gl = createGlStub();
  const view = createAtomView(createCanvas({ context: gl }), CONFIG);

  assert.throws(() => view.setRings([ring({ radius: 1, tube: 1 })]), /thinner than the ring/);

  const before = callsOf(gl, "createBuffer").length;

  view.setRings([ring(), ring({ radius: 3.2 })]);
  view.setParticles(particles(10));

  const declared = callsOf(gl, "createBuffer").length;

  assert.ok(declared > before, "the rings should have been built when they were declared");
  assert.equal(callsOf(gl, "drawElements").length, 0, "and nothing should have been drawn yet");

  view.draw({ model: identity(), camera: camera() });

  assert.equal(
    callsOf(gl, "createBuffer").length,
    declared,
    "a frame should not be building anything",
  );
});
