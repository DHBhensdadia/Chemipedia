import { test } from "node:test";
import assert from "node:assert/strict";

import { pointSphere } from "../../scripts/lib/point-sphere.js";

/**
 * The points as an array of triples, for the tests that read them one at a time.
 *
 * @param {Float32Array} packed
 * @returns {number[][]}
 */
function unpack(packed) {
  const points = [];

  for (let at = 0; at < packed.length; at += 3) {
    points.push([packed[at], packed[at + 1], packed[at + 2]]);
  }

  return points;
}

/**
 * @param {number[]} one
 * @param {number[]} other
 * @returns {number}
 */
function distance(one, other) {
  return Math.hypot(one[0] - other[0], one[1] - other[1], one[2] - other[2]);
}

/**
 * The distances from the origin, and the centroid, of a set of points.
 *
 * @param {number[][]} points
 * @returns {{ radii: number[], centroid: number[] }}
 */
function shape(points) {
  return {
    radii: points.map((point) => Math.hypot(...point)),
    centroid: [0, 1, 2].map(
      (axis) => points.reduce((total, point) => total + point[axis], 0) / points.length,
    ),
  };
}

/**
 * The closest and furthest nearest-neighbour distances, which is what "evenly spread" means here.
 *
 * @param {number[][]} points
 * @returns {{ closest: number, furthest: number }}
 */
function spacing(points) {
  let closest = Number.POSITIVE_INFINITY;
  let furthest = 0;

  for (let one = 0; one < points.length; one += 1) {
    let nearest = Number.POSITIVE_INFINITY;

    for (let other = 0; other < points.length; other += 1) {
      if (one !== other) {
        nearest = Math.min(nearest, distance(points[one], points[other]));
      }
    }

    if (Number.isFinite(nearest)) {
      closest = Math.min(closest, nearest);
      furthest = Math.max(furthest, nearest);
    }
  }

  return { closest, furthest };
}

/** The counts a nucleus actually has: the lightest elements, and the heaviest a page can ask for. */
const COUNTS = [1, 2, 3, 4, 12, 26, 79, 118, 200];

test("a count of points comes back as a count of points", () => {
  for (const count of COUNTS) {
    const placed = pointSphere({ count, radius: 1 });

    assert.equal(placed.length, count * 3, `${count} points`);
    assert.ok(placed instanceof Float32Array, "the points should be packed for a graphics card");
  }
});

test("no points is not an error, it is an empty set", () => {
  assert.equal(pointSphere({ count: 0, radius: 2 }).length, 0);
});

test("the radius is the cluster's outer edge, and nothing is outside it", () => {
  for (const count of COUNTS.slice(1)) {
    const { radii } = shape(unpack(pointSphere({ count, radius: 2.5 })));

    // The furthest point is the radius to the last float the buffer can hold, and every other point is
    // at or inside it — which is what lets the model above place its orbits against this number.
    assert.ok(Math.abs(Math.max(...radii) - 2.5) < 1e-5, `the furthest of ${count} points is off the edge`);
    assert.ok(Math.min(...radii) <= 2.5 + 1e-5, `a point of ${count} is outside the radius`);
  }
});

test("the cluster sits on the origin, whatever the count", () => {
  for (const count of COUNTS) {
    const points = unpack(pointSphere({ count, radius: 4 }));

    if (count === 1) {
      // One nucleon — hydrogen-1's — is a single point at the centre, and there is no edge to scale to.
      assert.deepEqual(points[0], [0, 0, 0]);

      continue;
    }

    for (const axis of shape(points).centroid) {
      assert.ok(Math.abs(axis) < 1e-5, `the centroid of ${count} points is off by ${axis}`);
    }
  }
});

test("two nucleons are as far apart as two points on a sphere can be", () => {
  const [one, other] = unpack(pointSphere({ count: 2, radius: 3 }));

  // Not a coincidence worth leaving implicit: the two-point case is a deuterium nucleus, and an even
  // arrangement of two points is a pair of opposite ones.
  assert.ok(Math.abs(distance(one, other) - 6) < 1e-5);
  assert.ok(Math.abs(one[0] + other[0]) < 1e-5);
});

test("no two points land on top of each other", () => {
  for (const count of COUNTS.slice(1)) {
    const { closest } = spacing(unpack(pointSphere({ count, radius: 1 })));

    assert.ok(closest > 0.2, `at ${count} points the closest pair is ${closest} apart`);
  }
});

test("the points are spread evenly rather than clumped", () => {
  for (const count of [3, 4, 12, 26, 79, 118, 200]) {
    const { closest, furthest } = spacing(unpack(pointSphere({ count, radius: 1 })));

    // An even arrangement has every point as far from its nearest neighbour as every other. The golden
    // spiral is not the perfect packing — no closed form is — and it measures within 14% of itself.
    assert.ok(furthest / closest < 1.2, `at ${count} points the spacing varies by ${furthest / closest}`);
  }
});

test("the counts an element actually has fill the sphere rather than its shell", () => {
  for (const count of [12, 26, 79, 118, 200]) {
    const { radii } = shape(unpack(pointSphere({ count, radius: 1 })));
    const mean = radii.reduce((total, radius) => total + radius, 0) / count;

    // Measured: 0.980 at twelve points, 0.9999 at a hundred and eighteen. A cluster whose points all sat
    // on the surface would average 1.0; one that was hollow would look it.
    assert.ok(mean > 0.97, `at ${count} points the mean distance from the centre is ${mean}`);
  }
});

test("the cluster's shape does not depend on how large it is drawn", () => {
  const small = unpack(pointSphere({ count: 26, radius: 1 }));
  const large = unpack(pointSphere({ count: 26, radius: 2.5 }));

  for (const [at, point] of large.entries()) {
    for (const [axis, value] of point.entries()) {
      assert.ok(Math.abs(value - small[at][axis] * 2.5) < 1e-5, `point ${at}, axis ${axis}`);
    }
  }
});

test("the same count gives the same points, on every call", () => {
  assert.deepEqual([...pointSphere({ count: 26, radius: 1 })], [...pointSphere({ count: 26, radius: 1 })]);
});

test("a count or a radius that is not a sphere is refused", () => {
  assert.throws(() => pointSphere({ count: -1, radius: 1 }), /whole number, 0 or more/);
  assert.throws(() => pointSphere({ count: 2.5, radius: 1 }), /whole number/);
  assert.throws(() => pointSphere({ count: Number.NaN, radius: 1 }), /whole number/);
  assert.throws(() => pointSphere({ count: "12", radius: 1 }), /whole number/);
  assert.throws(() => pointSphere({ count: undefined, radius: 1 }), /whole number/);
  assert.throws(() => pointSphere({ count: 12, radius: 0 }), /positive number/);
  assert.throws(() => pointSphere({ count: 12, radius: -1 }), /positive number/);
  assert.throws(() => pointSphere({ count: 12, radius: Number.NaN }), /positive number/);
  assert.throws(() => pointSphere({ count: 12 }), /positive number/);
});
