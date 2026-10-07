/**
 * The camera, the machine without WebGL, and the things the scene refuses.
 *
 * A reader meets the scene through three settings they can change at any moment — a drag, a wheel, and
 * a count — and through one they cannot change at all: whether their browser will give it a graphics
 * context. This is the half that holds those four doors.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { memoryOf } from "./webgl-stub.js";
import { modelOf, run, sceneFor, sceneWithoutWebGL, token } from "./atom-harness.js";

test("a machine without WebGL gets a scene that draws nothing rather than one that throws", () => {
  const { view, scene } = sceneWithoutWebGL(modelOf(2, 2, 2));

  assert.equal(view.available(), false);
  assert.equal(scene.step(1 / 60), false);
  assert.equal(view.hasDrawn(), false);

  // And it still keeps its own time and answers its own questions.
  scene.shake();
  scene.setSpeed(2);
  scene.setAtom(modelOf(6, 6, 6));
  assert.equal(scene.atom().protons, 6);
  assert.equal(scene.running(), false);
});

test("the camera is eased home rather than jumped there", () => {
  const { scene, gl } = sceneFor();

  const home = run(scene, gl, 240).views.at(-1);

  scene.orbit({ azimuth: 1, polar: 0 });

  const swung = run(scene, gl, 30).views.at(-1);

  assert.notDeepEqual(swung, home);
  scene.resetView();

  // One frame after asking for home the camera is on its way, not back: the same ease as everything
  // else in this scene.
  const onItsWay = run(scene, gl, 1).views.at(-1);

  assert.notDeepEqual(onItsWay, swung);
  assert.notDeepEqual(onItsWay, home);

  const arrived = run(scene, gl, 300).views.at(-1);

  for (const [at, value] of arrived.entries()) {
    assert.ok(Math.abs(value - home[at]) < 1e-6, `the camera came home on ${at}`);
  }
});

test("the camera's own numbers come from the token layer", () => {
  const { scene } = sceneFor();
  const camera = scene.camera();
  const wanted = token("--atom-camera-distance");

  /**
   * How far the camera is from the point it is looking at: the view matrix's own translation.
   *
   * @returns {number}
   */
  function distance() {
    const view = camera.viewMatrix();

    return Math.hypot(view[12], view[13], view[14]);
  }

  assert.ok(Math.abs(distance() - wanted) < 1e-6, `the camera opened at ${distance()}`);

  scene.zoom(2);
  scene.step(1 / 60);

  // A zoom moves the aim, and the camera eases toward it: one frame in it has started and is not there.
  const started = distance();
  const most = token("--atom-camera-max-distance");

  assert.ok(started > wanted, `the camera should have set off, and it is at ${started}`);
  assert.ok(started <= most + 1e-6, `and it should not have overshot, and it is at ${started}`);

  for (let frame = 0; frame < 240; frame += 1) {
    scene.step(1 / 60);
  }

  assert.ok(Math.abs(distance() - Math.min(wanted * 2, most)) < 1e-3, `it arrived at ${distance()}`);
});

test("the scene refuses a speed or a step that is not one", () => {
  assert.throws(() => sceneFor({ speed: -1 }), /a speed must be a number, zero or more/);
  assert.throws(() => sceneFor({ speed: Number.NaN }), /a speed must be a number/);

  const { scene } = sceneFor();

  assert.throws(() => scene.setSpeed("2"), /a speed must be a number/);
  assert.throws(() => scene.setSpeed(-0.5), /a speed must be a number/);
  assert.throws(() => scene.step("now"), /must be a number of seconds, zero or more/);
  assert.throws(() => scene.step(Number.NaN), /must be a number of seconds/);
  assert.throws(() => scene.step(-1), /must be a number of seconds/);
});

test("a scene and its view give every buffer back when they are finished with", () => {
  const { scene, view, gl } = sceneFor();

  scene.step(1 / 60);
  view.destroy();

  const memory = memoryOf(gl);

  assert.ok(memory.created > 0);
  assert.equal(memory.outstanding.length, 0, "a viewer that keeps its buffers grows until the tab closes");
});
