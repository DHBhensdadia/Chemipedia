/**
 * What the scene puts on the layer: the tokens it reads, the particles it uploads, the rings it asks
 * for.
 *
 * The pages a reader sees this on are drawn by a graphics card, but every number that decides what
 * those pages look like is decided here, in a transcript, without one. The clock and the camera live in
 * `atom-motion.test.js` and `atom-camera.test.js`; what the three files share is `atom-harness.js`.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { PROTON } from "../../scripts/lib/atom-model.js";
import { atomScale } from "../../scripts/components/atom-scene.js";
import { callsOf } from "./webgl-stub.js";
import {
  asked,
  colourOf,
  fakeSceneFor,
  modelOf,
  sceneFor,
  token,
  tokenReader,
  uploaded,
} from "./atom-harness.js";

test("the scene reads the token layer for every value it needs, and they are all declared", () => {
  const atom = modelOf(6, 6, 6);

  asked.length = 0;
  fakeSceneFor(atom);

  assert.deepEqual(
    [...new Set(asked)].sort(),
    [
      "--atom-camera-azimuth",
      "--atom-camera-damping",
      "--atom-camera-distance",
      "--atom-camera-far",
      "--atom-camera-fov",
      "--atom-camera-max-distance",
      "--atom-camera-min-distance",
      "--atom-camera-near",
      "--atom-camera-polar",
      "--atom-camera-tilt-limit",
      "--atom-electron",
      "--atom-electron-glow",
      "--atom-electron-radius",
      "--atom-neutron",
      "--atom-nucleon-radius",
      "--atom-orbit",
      "--atom-orbit-opacity",
      "--atom-orbit-tube",
      "--atom-proton",
      "--atom-ring-segments",
      "--atom-ring-tube-segments",
      "--atom-shake-decay",
      "--atom-shake-speed",
      "--atom-spin",
      "--atom-spin-axis",
    ],
    "the tokens the scene reads, and no others",
  );
});

test("the scale the model is built with is the scale the scene draws it at", () => {
  asked.length = 0;

  assert.deepEqual(atomScale(tokenReader()), {
    nucleonRadius: 0.2,
    nucleusPacking: 1.5,
    orbitBase: 2,
    orbitStep: 1.2,
    orbitSpeed: 0.9,
  });
});

test("one frame draws every particle in one call and every ring in one of its own", () => {
  const { scene, gl } = sceneFor();
  const before = gl.calls.length;

  assert.equal(scene.step(1 / 60), true);
  assert.equal(callsOf(gl, "drawElementsInstanced").length, 1);
  assert.equal(callsOf(gl, "drawElementsInstanced")[0].instances, 12 + 6);
  assert.equal(callsOf(gl, "drawElements").length, 2, "carbon's two shells, two rings");
  assert.ok(gl.calls.length > before);
});

test("the particles that go up are the atom's: a radius and a colour per kind", () => {
  const atom = modelOf(6, 6, 6);
  const { scene, gl } = sceneFor({ atom });

  scene.step(0);

  const { positions, radii, colours, glows } = uploaded(gl);

  assert.equal(positions.length, atom.particleCount * 3);
  assert.equal(radii[0], Math.fround(token("--atom-nucleon-radius")));
  assert.equal(radii[atom.nucleonCount], Math.fround(token("--atom-electron-radius")));

  // Each nucleon is drawn in its own kind's colour, which is the model's decision and not the
  // scene's: this is where a nucleus that gathered its protons into one half would show up.
  for (let index = 0; index < atom.nucleonCount; index += 1) {
    const wanted = atom.nucleons.kinds[index] === PROTON ? "--atom-proton" : "--atom-neutron";

    assert.deepEqual([...colours.slice(index * 3, index * 3 + 3)], colourOf(wanted), `nucleon ${index}`);
  }

  assert.notDeepEqual([...colours.slice(0, 3)], [...colours.slice(3, 6)]);
  assert.deepEqual(
    [...colours.slice(atom.nucleonCount * 3, atom.nucleonCount * 3 + 3)],
    colourOf("--atom-electron"),
  );
  assert.equal(glows[0], 0, "a nucleon does not glow");
  assert.equal(glows[atom.nucleonCount], Math.fround(token("--atom-electron-glow")));
});

test("an electron is on its ring, in the ring's plane, and moves while its nucleus does not", () => {
  const atom = modelOf(10, 10, 10);
  const { scene, gl } = sceneFor({ atom });
  const offset = atom.nucleonCount * 3;

  scene.step(0);

  const first = uploaded(gl).positions.slice(offset);
  const shell = atom.shells[0];

  assert.ok(Math.abs(Math.hypot(first[0], first[2]) - shell.radius) < 1e-5);
  assert.equal(first[1], 0);

  scene.step(0.5);

  const later = [...uploaded(gl).positions];
  const nucleons = later.slice(0, offset);

  for (const [at, value] of nucleons.entries()) {
    if (value !== 0) {
      assert.equal(value, atom.nucleons.positions[at], `nucleon ${at} moved`);
    }
  }

  const moved = later.slice(offset);
  let apart = 0;

  for (let electron = 0; electron < atom.electrons; electron += 1) {
    apart = Math.max(
      apart,
      Math.hypot(moved[electron * 3] - first[electron * 3], moved[electron * 3 + 2] - first[electron * 3 + 2]),
    );
  }

  assert.ok(apart > 0.1, `half a second moved an electron only ${apart}`);
});

test("the rings are one per occupied shell, at the shell's own radius", () => {
  for (const [protons, electrons] of [[1, 1], [2, 2], [6, 6], [26, 26], [118, 118]]) {
    const atom = modelOf(protons, protons, electrons);
    const { seen } = fakeSceneFor(atom);
    const rings = seen.rings.at(-1);

    assert.equal(rings.length, atom.shells.length, `${protons}: ring count`);
    assert.deepEqual(
      rings.map((ring) => ring.radius),
      atom.shells.map((shell) => shell.radius),
      `${protons}: ring radii`,
    );
    assert.equal(rings[0].colour.length, 3, "a ring's colour is a colour, ready for the layer");
    assert.equal(rings[0].opacity, token("--atom-orbit-opacity"));
    assert.equal(rings[0].tube, token("--atom-orbit-tube"));
  }
});

test("the scene hands the layer the whole atom in the two lists it takes", () => {
  const atom = modelOf(26, 30, 26);
  const { seen, scene } = fakeSceneFor(atom);

  assert.equal(seen.particles.length, 1, "a scene uploads once when it is built");
  assert.equal(seen.rings.length, 1);
  assert.equal(seen.particles[0].count, atom.particleCount);
  assert.equal(seen.particles[0].positions.length, atom.particleCount * 3);

  scene.step(0.1);

  assert.equal(seen.frames.length, 1, "a frame is one draw");
  assert.equal(seen.resizes, 1, "and the surface follows the canvas' box every frame");
  assert.equal(seen.frames[0].camera, scene.camera());
  assert.equal(seen.frames[0].model.length, 16, "a frame carries a 4x4 matrix");
});
