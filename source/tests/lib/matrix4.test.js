import { test } from "node:test";
import assert from "node:assert/strict";

import {
  eulerRotation,
  identity,
  lookAt,
  multiply,
  perspective,
  rotationAbout,
  rotationX,
  rotationY,
  rotationZ,
  scaling,
  transformDirection,
  transformPoint,
  translation,
} from "../../scripts/lib/matrix4.js";

/**
 * Assert that two numbers are the same to within a tolerance.
 *
 * Every value here is a product of cosines and square roots, so exact equality would be a test of
 * the arithmetic's rounding rather than of the mathematics.
 *
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

/**
 * @param {number[]} actual
 * @param {number[]} expected
 * @param {number} [tolerance]
 */
function closeVector(actual, expected, tolerance = 1e-9) {
  assert.equal(actual.length, expected.length);

  for (let index = 0; index < actual.length; index += 1) {
    close(actual[index], expected[index], tolerance);
  }
}

test("a matrix is sixteen numbers in column-major order", () => {
  // The convention the whole layer rests on, asserted rather than assumed: a translation puts its
  // three numbers where every graphics text puts them, and the fourth row stays the identity's.
  const moved = translation([1, 2, 3]);

  assert.equal(moved.length, 16);
  assert.deepEqual(moved.slice(12, 15), [1, 2, 3]);
  assert.deepEqual(moved.slice(0, 4), [1, 0, 0, 0]);
  assert.deepEqual(moved.slice(15), [1]);
});

test("the identity changes nothing, on either side", () => {
  const turn = rotationAbout([1, 2, 3], 0.7);

  assert.deepEqual(multiply(turn, identity()), turn);
  assert.deepEqual(multiply(identity(), turn), turn);
  closeVector(transformPoint(identity(), [4, -5, 6]), [4, -5, 6]);
});

test("the right-hand matrix is applied first", () => {
  // Turning and then moving is not the same as moving and then turning, and the difference is what
  // a model matrix is built out of: `multiply(translation, rotation)` must mean turn, then move.
  const turn = rotationY(Math.PI / 2);
  const move = translation([0, 0, 5]);

  closeVector(transformPoint(multiply(move, turn), [1, 0, 0]), [0, 0, 4], 1e-12);
  // The other order turns the already-moved point, which lands somewhere else entirely.
  closeVector(transformPoint(multiply(turn, move), [1, 0, 0]), [5, 0, -1], 1e-12);
});

test("multiplication is associative, which is what lets a chain be built in any order", () => {
  const a = translation([2, 0, -1]);
  const b = rotationX(0.4);
  const c = scaling([2, 2, 2]);

  closeVector(multiply(multiply(a, b), c), multiply(a, multiply(b, c)), 1e-12);
});

test("the perspective sets its two scales and its divide", () => {
  const matrix = perspective(Math.PI / 2, 2, 1, 100);

  close(matrix[0], 0.5, 1e-12); // the vertical scale over the aspect: 1 / tan(45 degrees) / 2
  close(matrix[5], 1, 1e-12);
  assert.equal(matrix[11], -1, "the depth is divided by it, so it is the fourth coordinate");
  close(matrix[14], (2 * 100 * 1) / (1 - 100), 1e-12);
});

test("the perspective puts the near and far planes where it promises", () => {
  const matrix = perspective(1, 1, 0.5, 20);

  // Clip depth is `m[10] * z + m[14]` and the fourth coordinate is `-z`, so the depth a fragment
  // keeps is the quotient: -1 at the near plane and +1 at the far one.
  for (const [z, expected] of [
    [-0.5, -1],
    [-20, 1],
  ]) {
    close((matrix[10] * z + matrix[14]) / -z, expected, 1e-12);
  }
});

test("the view matrix is the camera, seen from inside the scene", () => {
  const view = lookAt([0, 0, 5], [0, 0, 0], [0, 1, 0]);

  // Standing five units back and looking at the origin means everything moves five units closer.
  closeVector(transformPoint(view, [0, 0, 0]), [0, 0, -5], 1e-12);
  closeVector(transformPoint(view, [0, 0, 5]), [0, 0, 0], 1e-12);
  closeVector(transformPoint(view, [1, 0, 0]), [1, 0, -5], 1e-12);
});

test("a camera cannot look at itself, and it needs an up that is not its own direction", () => {
  assert.throws(() => lookAt([1, 2, 3], [1, 2, 3], [0, 1, 0]), TypeError);
  assert.throws(() => lookAt([0, 0, 5], [0, 0, 0], [0, 0, 1]), TypeError);
});

test("a turn about an axis is the same turn whatever the axis was written as", () => {
  const unit = rotationAbout([0, 1, 0], Math.PI / 3);
  const long = rotationAbout([0, 9, 0], Math.PI / 3);

  closeVector(unit, long, 1e-12);
  closeVector(transformPoint(unit, [1, 2, 3]), transformPoint(long, [1, 2, 3]), 1e-12);
});

test("a quarter turn about y sends x to minus z, which is the convention WebGL keeps", () => {
  closeVector(transformPoint(rotationY(Math.PI / 2), [1, 0, 0]), [0, 0, -1], 1e-12);
  closeVector(transformPoint(rotationX(Math.PI / 2), [0, 1, 0]), [0, 0, 1], 1e-12);
  closeVector(transformPoint(rotationZ(Math.PI / 2), [1, 0, 0]), [0, 1, 0], 1e-12);
});

test("a turn preserves length, which is the whole reason it is a rotation", () => {
  const point = [0.3, -1.7, 2.4];
  const turned = transformPoint(rotationAbout([1, -2, 0.5], 1.234), point);
  const length = (vector) => Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));

  close(length(turned), length(point), 1e-12);
});

test("three angles at once is the three turns, applied in the order they are written", () => {
  const angles = [0.4, -1.1, 0.85];
  const together = eulerRotation(angles);
  const oneAtATime = multiply(rotationX(angles[0]), multiply(rotationY(angles[1]), rotationZ(angles[2])));

  closeVector(together, oneAtATime, 1e-12);

  // And the order is not commutative, which is the whole reason it has to be stated: y then x is a
  // different turn from x then y, and a reader handed the wrong one gets a picture that looks fine.
  const other = multiply(rotationY(angles[1]), multiply(rotationX(angles[0]), rotationZ(angles[2])));

  assert.ok(
    Math.abs(together[1] - other[1]) > 1e-3,
    "the order of the axes made no difference, which cannot be right",
  );
});

test("a direction is turned by a matrix and never moved by it", () => {
  const turn = multiply(translation([10, -4, 2.5]), rotationZ(0.7));

  closeVector(transformDirection(turn, [1, 0, 0]), transformPoint(rotationZ(0.7), [1, 0, 0]), 1e-12);
  // The same point, carried by the same matrix, does pick the movement up — which is the difference.
  closeVector(transformPoint(turn, [1, 0, 0]), [10 + Math.cos(0.7), -4 + Math.sin(0.7), 2.5], 1e-12);
  closeVector(transformDirection(turn, [0, 0, 0]), [0, 0, 0], 1e-12);
});

test("scaling resizes by axis or all at once", () => {
  closeVector(transformPoint(scaling(3), [1, 1, 1]), [3, 3, 3], 1e-12);
  closeVector(transformPoint(scaling([1, 2, 4]), [1, 1, 1]), [1, 2, 4], 1e-12);
});

test("a malformed matrix, axis, scale or vector is refused rather than drawn wrong", () => {
  // A wrong number of entries multiplies into nonsense silently, and nonsense reaches the screen.
  assert.throws(() => multiply([1, 2, 3], identity()), TypeError);
  assert.throws(
    () => multiply(identity(), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]),
    TypeError,
  );
  assert.throws(() => rotationAbout([0, 0, 0], 1), TypeError);
  assert.throws(() => rotationAbout([1, 0, 0], Number.NaN), TypeError);
  assert.throws(() => scaling(0), TypeError);
  assert.throws(() => scaling([1, 2]), TypeError);
  assert.throws(() => translation([1, 2]), TypeError);
  assert.throws(() => transformPoint(identity(), [1, 2]), TypeError);
  assert.throws(() => transformDirection(identity(), [1, 2]), TypeError);
  assert.throws(() => transformDirection([1, 2, 3], [1, 2, 3]), TypeError);
  assert.throws(() => eulerRotation([1, 2]), TypeError);
  assert.throws(() => eulerRotation([1, 2, Number.NaN]), TypeError);
  assert.throws(() => perspective(1, 0, 1, 10), TypeError, "an aspect of zero cannot be divided into");
  assert.throws(() => perspective(1, 1, 10, 10), TypeError, "the far plane must be beyond the near one");
});
