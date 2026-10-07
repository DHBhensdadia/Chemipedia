import { test } from "node:test";
import assert from "node:assert/strict";

import { placeElectrons } from "../../scripts/lib/atom-orbit.js";
import { atom, recordFor } from "./atom-fixtures.js";

/**
 * Where the electrons are, and what they do as time passes.
 *
 * The model's structure — nucleons, the nucleus, the shells and the labels — is `atom-model.test.js`.
 * This is the other half of the same module: the phases a ring's electrons start at, and the one
 * function the scene calls every frame to ask where they are now. It is pure, so it is all testable
 * here, with no clock and no canvas.
 */

test("the electrons on a ring are spread around it", () => {
  const neon = atom({ record: recordFor(10), protons: 10, neutrons: 10, electrons: 10 });

  assert.equal(neon.shells[0].electrons, 2);
  assert.equal(neon.shells[1].electrons, 8);
  assert.ok(Math.abs(neon.shells[1].phases[1] - neon.shells[1].phases[0] - Math.PI / 4) < 1e-9);

  const second = neon.shells[1];

  for (let index = 1; index < second.electrons; index += 1) {
    const gap = second.phases[index] - second.phases[index - 1];

    assert.ok(Math.abs(gap - (Math.PI * 2) / second.electrons) < 1e-9, `electrons ${index} and ${index + 1}`);
  }

  // And one ring's pattern is not another's: the offset is the golden angle, so no two rings line up.
  assert.ok(Math.abs(neon.shells[0].phases[0] - neon.shells[1].phases[0]) > 1e-6);
});

/**
 * Where a place is in its own ring's plane rather than in the atom.
 *
 * A plane is a rotation, and its transpose is the turn back: an electron that is on its ring lands with
 * no distance out of the plane's own x/z, whatever plane the shell turned out to be in. This is how the
 * tests below say "on the ring" without knowing which way that ring is tipped.
 *
 * @param {object} shell
 * @param {number} at
 * @param {Float32Array} where
 * @returns {number[]}
 */
function inPlane(shell, at, where) {
  const plane = shell.orientation;
  const [x, y, z] = [where[at], where[at + 1], where[at + 2]];

  return [
    plane[0] * x + plane[1] * y + plane[2] * z,
    plane[4] * x + plane[5] * y + plane[6] * z,
    plane[8] * x + plane[9] * y + plane[10] * z,
  ];
}

test("an electron is on its ring, in its ring's plane", () => {
  const helium = atom({ record: recordFor(2), protons: 2, neutrons: 2, electrons: 2 });
  const where = new Float32Array(helium.electrons * 3);
  const placed = placeElectrons(helium, 0, where);

  assert.equal(placed, 2);

  for (let electron = 0; electron < helium.electrons; electron += 1) {
    const at = electron * 3;
    const radius = Math.hypot(where[at], where[at + 1], where[at + 2]);
    const local = inPlane(helium.shells[0], at, where);

    assert.ok(Math.abs(radius - helium.shells[0].radius) < 1e-6);
    assert.ok(Math.abs(local[1]) < 1e-6, "an electron is never off its own ring's plane");
    assert.ok(Math.abs(Math.hypot(local[0], local[2]) - helium.shells[0].radius) < 1e-6);
  }

  // Half a turn apart, because there are two of them.
  assert.ok(Math.abs(where[0] + where[3]) < 1e-6);
  assert.ok(Math.abs(where[2] + where[5]) < 1e-6);
});

test("two rings of the same atom carry their electrons in two different planes", () => {
  const iron = atom({ record: recordFor(26), protons: 26, neutrons: 30, electrons: 26 });
  const where = electronsAt(iron, 0.3);
  const innermost = inPlane(iron.shells[0], 0, where);
  const second = inPlane(iron.shells[1], iron.shells[0].electrons * 3, where);

  // Each electron is in its *own* ring's plane and not in the other's: if the model placed them all in
  // one plane, one of these two would be off its ring.
  assert.ok(Math.abs(innermost[1]) < 1e-6);
  assert.ok(Math.abs(second[1]) < 1e-6);

  let furthest = 0;

  for (let electron = 0; electron < iron.shells[0].electrons; electron += 1) {
    furthest = Math.max(furthest, Math.abs(inPlane(iron.shells[1], electron * 3, where)[1]));
  }

  assert.ok(furthest > 1, `the second ring's plane is not the first ring's: ${furthest}`);
});

/**
 * Step one electron list forward in whole frames, the way the scene does.
 *
 * @param {object} built
 * @param {number} seconds
 * @returns {Float32Array}
 */
function electronsAt(built, seconds) {
  const where = new Float32Array(built.electrons * 3);

  placeElectrons(built, seconds, where, 0);

  return where;
}

test("an electron keeps its ring's speed and the ring's own phase", () => {
  const iron = atom({ record: recordFor(26), protons: 26, neutrons: 30, electrons: 26 });
  const shell = iron.shells[2];
  const at = iron.shells[0].electrons + iron.shells[1].electrons;
  const started = electronsAt(iron, 0);
  const period = (Math.PI * 2) / shell.angularSpeed;
  const turned = electronsAt(iron, period);

  // A full period later the electron is where it began, which is what makes the speed a speed rather
  // than a rotation applied to the whole atom.
  for (let axis = 0; axis < 3; axis += 1) {
    assert.ok(Math.abs(started[(at + 0) * 3 + axis] - turned[(at + 0) * 3 + axis]) < 1e-4, `axis ${axis}`);
  }

  // And a quarter of a period is a quarter turn, on this ring's own radius — measured inside the
  // ring's own plane, because the ring is tipped and the atom's axes are not it.
  const quarter = electronsAt(iron, period / 4);
  const before = inPlane(shell, at * 3, started);
  const after = inPlane(shell, at * 3, quarter);
  let swept = Math.atan2(after[2], after[0]) - Math.atan2(before[2], before[0]);

  while (swept <= -Math.PI) {
    swept += Math.PI * 2;
  }

  assert.ok(Math.abs(swept - Math.PI / 2) < 1e-4, `swept ${swept}`);
  assert.ok(Math.abs(Math.hypot(after[0], after[2]) - shell.radius) < 1e-4);
  assert.ok(Math.abs(after[1]) < 1e-6, "the quarter turn left the ring's plane");
});

test("the electrons come out in the order the rings hold them", () => {
  const neon = atom({ record: recordFor(10), protons: 10, neutrons: 10, electrons: 10 });
  const where = electronsAt(neon, 0.4);
  const distance = (at) => Math.hypot(where[at], where[at + 1], where[at + 2]);

  for (let electron = 0; electron < 2; electron += 1) {
    assert.ok(Math.abs(distance(electron * 3) - neon.shells[0].radius) < 1e-5);
  }

  for (let electron = 2; electron < 10; electron += 1) {
    assert.ok(Math.abs(distance(electron * 3) - neon.shells[1].radius) < 1e-5);
  }
});

test("the time an electron is placed at is written into the caller's own array", () => {
  const lithium = atom({ record: recordFor(3), protons: 3, neutrons: 4, electrons: 3 });
  const where = new Float32Array(3 + lithium.electrons * 3).fill(0.5);
  const written = placeElectrons(lithium, 1.25, where, 3);

  assert.equal(written, 3);
  assert.deepEqual([...where.slice(0, 3)], [0.5, 0.5, 0.5]);
  assert.notEqual(where[3], 0.5);
});

test("placing an electron needs a time and room to write into", () => {
  const carbon = atom({ record: recordFor(6), protons: 6, neutrons: 6, electrons: 6 });

  assert.throws(() => placeElectrons(carbon, "now", new Float32Array(18)), /finite number/);
  assert.throws(() => placeElectrons(carbon, Number.NaN, new Float32Array(18)), /finite number/);
  assert.throws(() => placeElectrons(carbon, 0, new Float32Array(17)), /must hold 18 numbers/);
  assert.throws(() => placeElectrons(carbon, 0, new Float32Array(18), 1), /must hold 18 numbers/);
  assert.equal(placeElectrons(carbon, 0, new Float32Array(18), 0), 6);
});
