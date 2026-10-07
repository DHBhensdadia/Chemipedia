import { test } from "node:test";
import assert from "node:assert/strict";

import { createOrbitCamera } from "../../scripts/lib/orbit-camera.js";

/** A camera whose numbers are round, so a failure reads as a direction rather than as a decimal. */
const OPENING = {
  distance: 10,
  azimuth: 0,
  polar: Math.PI / 2,
  damping: 10,
  fieldOfView: Math.PI / 4,
  near: 0.1,
  far: 100,
  minDistance: 4,
  maxDistance: 20,
  minPolar: 0.2,
  maxPolar: Math.PI - 0.2,
};

/**
 * @param {object} [overrides]
 * @returns {ReturnType<typeof createOrbitCamera>}
 */
function camera(overrides = {}) {
  return createOrbitCamera({ ...OPENING, ...overrides });
}

/**
 * @param {number} actual
 * @param {number} expected
 * @param {number} [tolerance]
 */
function close(actual, expected, tolerance = 1e-9) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} is not within ${tolerance} of ${expected}`,
  );
}

test("the camera opens where it was told, and says so", () => {
  const view = camera();

  assert.deepEqual(view.state(), { distance: 10, azimuth: 0, polar: Math.PI / 2, target: [0, 0, 0] });
  assert.deepEqual(view.aim(), view.state(), "nothing has been asked for yet");
});

test("the eye stands on the sphere the state describes, with up as y", () => {
  // Azimuth is measured from +z and polar down from +y, so the equator at azimuth zero is straight
  // out along +z and a quarter turn of azimuth is straight out along +x.
  const position = camera({ distance: 8, azimuth: 0, polar: Math.PI / 2 }).position();
  const quarterTurn = camera({ distance: 8, azimuth: Math.PI / 2, polar: Math.PI / 2 }).position();
  const above = camera({ distance: 8, azimuth: 0, polar: 0.5 }).position();

  close(position[0], 0, 1e-12);
  close(position[1], 0, 1e-12);
  close(position[2], 8, 1e-12);

  close(quarterTurn[0], 8, 1e-12);
  close(quarterTurn[2], 0, 1e-12);

  close(above[1], 8 * Math.cos(0.5), 1e-12);
  close(above[2], 8 * Math.sin(0.5), 1e-12);
});

test("the camera looks at its target, which means the target lands ahead of it on the view axis", () => {
  const view = camera();
  const [x, y, z] = view.toCameraSpace([0, 0, 0]);
  const [bx, by, bz] = view.toCameraSpace([0, 0, 4]);

  close(x, 0, 1e-12);
  close(y, 0, 1e-12);
  close(z, -10, 1e-12); // ten units away, down the camera's own negative z
  close(bx, 0, 1e-12);
  close(by, 0, 1e-12);
  close(bz, -6, 1e-12); // four units nearer the eye, so four closer to zero
});

test("a swing moves the aim, and the polar angle cannot reach the poles", () => {
  const view = camera();

  view.orbit({ azimuth: 0.5, polar: 0.25 });
  close(view.aim().azimuth, 0.5, 1e-12);
  close(view.aim().polar, Math.PI / 2 + 0.25, 1e-12);

  view.orbit({ polar: 100 });
  close(view.aim().polar, OPENING.maxPolar, 1e-12);
  assert.ok(view.aim().polar < Math.PI, "the pole is where the view would flip over");

  view.orbit({ polar: -100 });
  close(view.aim().polar, OPENING.minPolar, 1e-12);
});

test("a zoom is multiplicative, which is what makes the last stretch in controllable", () => {
  const view = camera();

  view.zoom(0.5);
  close(view.aim().distance, 5, 1e-12);

  view.zoom(0.5);
  close(view.aim().distance, 4, 1e-12, "the near limit stops it");

  view.zoom(0.001);
  close(view.aim().distance, OPENING.minDistance, 1e-12);

  view.zoom(1000);
  close(view.aim().distance, OPENING.maxDistance, 1e-12);
});

test("the camera travels toward its aim instead of jumping to it", () => {
  const view = camera();

  view.zoom(0.5);

  assert.equal(view.update(1 / 60), true, "it has somewhere to be");
  const afterOneFrame = view.state().distance;

  assert.ok(afterOneFrame < 10 && afterOneFrame > 5, `${afterOneFrame} should be partway to 5`);

  for (let frame = 0; frame < 600; frame += 1) {
    view.update(1 / 60);
  }

  close(view.state().distance, 5, 1e-6);
  assert.equal(view.update(1 / 60), false, "and then it is still");
});

test("damping covers the same distance in the same time at any frame rate", () => {
  // Otherwise the camera would feel different on a slower machine, which is the one thing a viewer
  // cannot afford: the motion is the interface.
  const quick = camera();
  const slow = camera();

  quick.zoom(0.4);
  slow.zoom(0.4);

  for (let frame = 0; frame < 60; frame += 1) {
    quick.update(1 / 60);
  }

  slow.update(1);

  close(quick.state().distance, slow.state().distance, 1e-9);
});

test("a reset aims back at the opening view and the camera comes home", () => {
  const view = camera();

  view.orbit({ azimuth: 1.2, polar: -0.3 });
  view.zoom(1.5);

  for (let frame = 0; frame < 300; frame += 1) {
    view.update(1 / 60);
  }

  view.reset();
  assert.deepEqual(
    { distance: view.aim().distance, azimuth: view.aim().azimuth, polar: view.aim().polar },
    { distance: OPENING.distance, azimuth: OPENING.azimuth, polar: OPENING.polar },
  );

  for (let frame = 0; frame < 600; frame += 1) {
    view.update(1 / 60);
  }

  close(view.state().distance, OPENING.distance, 1e-6);
  close(view.state().azimuth, OPENING.azimuth, 1e-6);
  close(view.state().polar, OPENING.polar, 1e-6);
});

test("the projection is the one the configuration describes", () => {
  const view = camera();
  const wide = view.projectionMatrix(2);
  const square = view.projectionMatrix(1);

  close(square[5], 1 / Math.tan(OPENING.fieldOfView / 2), 1e-12);
  close(wide[0], square[0] / 2, 1e-12);
  assert.throws(() => view.projectionMatrix(0), TypeError);
});

test("a camera that cannot be built is refused rather than drawn", () => {
  assert.throws(() => camera({ damping: 0 }), TypeError, "a camera that never arrives");
  assert.throws(() => camera({ minDistance: 0 }), TypeError, "it would stand inside the nucleus");
  assert.throws(() => camera({ maxDistance: 4 }), TypeError, "the limits must have a range");
  assert.throws(() => camera({ minPolar: 0 }), TypeError, "the pole is not a viewpoint");
  assert.throws(() => camera({ maxPolar: Math.PI }), TypeError);
  assert.throws(() => camera({ distance: 100 }), TypeError, "the opening view is outside its limits");
  assert.throws(() => camera({ polar: 0.1 }), TypeError);
  assert.throws(() => camera({ target: [1, 2] }), TypeError);
  assert.throws(() => camera({ distance: Number.NaN }), TypeError);
  assert.throws(() => camera().orbit({ azimuth: Number.POSITIVE_INFINITY }), TypeError);
  assert.throws(() => camera().zoom(0), TypeError);
  assert.throws(() => camera().update(-1), TypeError);
});
