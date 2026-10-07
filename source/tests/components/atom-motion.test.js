/**
 * What the scene does with time: the atom's own slow turn, the kick a shake gives it, and how the
 * speed setting scales the electrons without moving the thing they are drawn on.
 *
 * This is the half that needs a clock. Everything is measured from the matrices the layer was handed,
 * one frame at a time, because a rotation matrix's trace reports the angle between two frames exactly —
 * and because the layer reuses the arrays behind those matrices, so a reading has to be taken while the
 * frame that produced it is still the last one.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { callsOf } from "./webgl-stub.js";
import { lastUniform, modelOf, run, sceneFor, swept, token, turnedFrom, uploaded } from "./atom-harness.js";

test("the atom turns on its own, slowly", () => {
  const { scene, gl } = sceneFor();
  const idle = token("--atom-spin");

  // Sixty frames of a sixtieth of a second is one second, and the run's first two matrices are one
  // step apart, so this is the turn over exactly one second.
  const { models } = run(scene, gl, 61);

  assert.ok(Math.abs(swept(models) - idle) < idle * 0.05, `turned ${swept(models)} radians`);
});

test("a shake spins the atom up and then settles back to its own turn", () => {
  const { scene, gl } = sceneFor();
  const idle = token("--atom-spin");

  scene.shake();

  const kicked = swept(run(scene, gl, 46).models);

  assert.ok(kicked > idle * 4, `a shake turned the atom ${kicked} radians`);
  assert.ok(kicked < Math.PI, "the window a shake is measured over has to stay inside half a turn");

  // Four seconds later the extra speed has decayed away and the atom is turning at its own rate again.
  run(scene, gl, 240);

  const settled = swept(run(scene, gl, 61).models);

  assert.ok(Math.abs(settled - idle) < idle * 0.05, `settled at ${settled}`);
});

test("shaking twice kicks twice", () => {
  const once = sceneFor();
  const twice = sceneFor();

  once.scene.shake();
  twice.scene.shake();
  twice.scene.shake();

  const one = swept(run(once.scene, once.gl, 16).models);
  const two = swept(run(twice.scene, twice.gl, 16).models);

  assert.ok(one > 0, "a shake turns the atom");
  assert.ok(two > one * 1.5, `one kick turned ${one} radians, two turned ${two}`);
});

test("the speed setting scales the electrons and leaves the atom's own turn alone", () => {
  const slow = sceneFor({ speed: 1 });
  const fast = sceneFor({ speed: 3 });
  const atom = slow.scene.atom();
  const offset = atom.nucleonCount * 3;
  const start = atom.shells[0].phases[0];

  run(slow.scene, slow.gl, 15);

  const slowWhere = uploaded(slow.gl).positions;
  const slowMoved = turnedFrom(Math.atan2(slowWhere[offset + 2], slowWhere[offset]), start);

  run(fast.scene, fast.gl, 15);

  const fastWhere = uploaded(fast.gl).positions;
  const fastMoved = turnedFrom(Math.atan2(fastWhere[offset + 2], fastWhere[offset]), start);

  // Three times the speed is three times as far round in the same quarter of a second, and the
  // angles are small enough that neither has wrapped.
  assert.ok(fastMoved > slowMoved, `slow moved ${slowMoved}, fast moved ${fastMoved}`);
  assert.ok(Math.abs(fastMoved / slowMoved - 3) < 0.02, `the ratio was ${fastMoved / slowMoved}`);
  assert.ok(Math.abs(fastMoved) < Math.PI / 2);
});

test("changing the speed does not move the electrons at the moment it changes", () => {
  const { scene, gl } = sceneFor();
  const atom = scene.atom();
  const offset = atom.nucleonCount * 3;

  scene.step(0.25);

  const before = [...uploaded(gl).positions.slice(offset)];

  scene.setSpeed(0);
  scene.step(0);

  assert.ok(before.length > 0);
  assert.deepEqual([...uploaded(gl).positions.slice(offset)], before);
});

test("at zero speed the electrons hold still and the atom keeps its own slow turn", () => {
  const { scene, gl } = sceneFor({ speed: 0 });
  const atom = scene.atom();
  const offset = atom.nucleonCount * 3;

  scene.step(1);

  const before = [...uploaded(gl).positions.slice(offset)];
  const { models } = run(scene, gl, 11);

  assert.ok(before.length > 0);
  assert.deepEqual([...uploaded(gl).positions.slice(offset)], before);
  assert.ok(swept(models) > 0, "the atom itself should still be turning");
});

test("a new element is a new picture on the same view", () => {
  const { scene, gl } = sceneFor({ atom: modelOf(1, 0, 1) });
  const { views } = run(scene, gl, 240);

  assert.equal(callsOf(gl, "drawElementsInstanced")[0].instances, 2);
  assert.equal(callsOf(gl, "drawElements").length, 240, "hydrogen's one shell, one ring a frame");

  const home = views.at(-1);
  const from = gl.calls.length;

  scene.setAtom(modelOf(92, 146, 92));
  scene.step(0);

  assert.equal(callsOf(gl, "drawElementsInstanced").at(-1).instances, 92 + 146 + 92);
  assert.equal(callsOf(gl, "drawElements").length - 240, 7, "uranium's seven shells, seven rings");

  for (const [at, value] of [...lastUniform(gl, "uView")].entries()) {
    assert.equal(value, home[at], "changing the atom moved the camera");
  }

  assert.ok(gl.calls.length > from);
});
