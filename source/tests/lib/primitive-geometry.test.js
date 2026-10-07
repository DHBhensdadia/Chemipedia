import { test } from "node:test";
import assert from "node:assert/strict";

import { sphereGeometry, torusGeometry } from "../../scripts/lib/primitive-geometry.js";

/**
 * @param {number} actual
 * @param {number} expected
 * @param {number} [tolerance]
 */
function close(actual, expected, tolerance = 1e-6) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} is not within ${tolerance} of ${expected}`,
  );
}

/**
 * @param {Float32Array} positions
 * @param {number} at
 * @returns {number[]}
 */
function vertexAt(positions, at) {
  return [positions[at * 3], positions[at * 3 + 1], positions[at * 3 + 2]];
}

/**
 * @param {number[]} vector
 * @returns {number}
 */
function length(vector) {
  return Math.sqrt(vector[0] ** 2 + vector[1] ** 2 + vector[2] ** 2);
}

/**
 * The signed area direction of one triangle, as a geometric normal.
 *
 * @param {Float32Array} positions
 * @param {number[]} corners
 * @returns {number[]}
 */
function geometricNormal(positions, corners) {
  const [a, b, c] = corners.map((corner) => vertexAt(positions, corner));
  const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];

  return [
    ab[1] * ac[2] - ab[2] * ac[1],
    ab[2] * ac[0] - ab[0] * ac[2],
    ab[0] * ac[1] - ab[1] * ac[0],
  ];
}

test("a sphere is a sheet of rings and segments, with both vertices and triangles counted", () => {
  const sphere = sphereGeometry({ radius: 2, segments: 8, rings: 4 });

  assert.equal(sphere.vertexCount, (4 + 1) * (8 + 1));
  assert.equal(sphere.positions.length, sphere.vertexCount * 3);
  assert.equal(sphere.normals.length, sphere.vertexCount * 3);
  assert.equal(sphere.indexCount, 4 * 8 * 6);
  assert.equal(sphere.indices.length, sphere.indexCount);
  assert.equal(sphere.indexType, "uint16");
});

test("every vertex of a sphere is on its surface and its normal is a direction, not a vector", () => {
  const sphere = sphereGeometry({ radius: 1.5, segments: 12, rings: 6 });

  for (let vertex = 0; vertex < sphere.vertexCount; vertex += 1) {
    close(length(vertexAt(sphere.positions, vertex)), 1.5);
    close(length(vertexAt(sphere.normals, vertex)), 1);
  }
});

test("a sphere is closed: its poles are single points and its seam meets itself", () => {
  const sphere = sphereGeometry({ radius: 3, segments: 6, rings: 4 });

  for (let segment = 0; segment < 6; segment += 1) {
    const north = vertexAt(sphere.positions, segment);
    const south = vertexAt(sphere.positions, 4 * 7 + segment);

    close(north[1], 3, 1e-6);
    close(south[1], -3, 1e-6);
  }

  // The last column is the first one again, which is what stops the surface having a scar.
  for (let ring = 0; ring <= 4; ring += 1) {
    const first = vertexAt(sphere.positions, ring * 7);
    const last = vertexAt(sphere.positions, ring * 7 + 6);

    for (let axis = 0; axis < 3; axis += 1) {
      close(first[axis], last[axis], 1e-6);
    }
  }
});

test("every sphere triangle faces outwards, which is what lets the viewer cull back faces", () => {
  // Winding is the classic silent defect: the mesh is right, the surface is inside out, and the
  // sphere is drawn as its own lining. Each triangle's geometric normal is compared with the
  // direction from the centre to the triangle's own corners, and the poles' degenerate triangles
  // have no area to point anywhere, so they are skipped.
  const sphere = sphereGeometry({ radius: 2, segments: 10, rings: 5 });

  for (let triangle = 0; triangle < sphere.indexCount; triangle += 3) {
    const corners = [...sphere.indices.slice(triangle, triangle + 3)];
    const normal = geometricNormal(sphere.positions, corners);

    if (length(normal) < 1e-9) {
      continue;
    }

    for (const corner of corners) {
      const outwards = vertexAt(sphere.positions, corner);

      assert.ok(
        normal[0] * outwards[0] + normal[1] * outwards[1] + normal[2] * outwards[2] > 0,
        `triangle ${triangle / 3} faces inwards`,
      );
    }
  }
});

test("every index of a sphere is a vertex that exists", () => {
  const sphere = sphereGeometry({ radius: 1, segments: 7, rings: 3 });

  for (const index of sphere.indices) {
    assert.ok(index < sphere.vertexCount, `${index} is past the end of ${sphere.vertexCount} vertices`);
  }
});

test("a ring is a tube, thick enough to be seen from the side and lying in the orbit's own plane", () => {
  const ring = torusGeometry({ radius: 5, tube: 0.05, segments: 24, tubeSegments: 8 });

  assert.equal(ring.vertexCount, (24 + 1) * (8 + 1));
  assert.equal(ring.indexCount, 24 * 8 * 6);

  for (let vertex = 0; vertex < ring.vertexCount; vertex += 1) {
    const [x, y, z] = vertexAt(ring.positions, vertex);
    // The cross-section is a circle of the tube's radius around the ring's own circle, which is the
    // whole claim: a point on the surface is out along the ring by `cos` and across it by `sin`.
    close((Math.hypot(x, z) - 5) ** 2 + y ** 2, 0.05 ** 2, 1e-6);
    close(length(vertexAt(ring.normals, vertex)), 1, 1e-6);
  }
});

test("a ring's surface stays within the tube of the circle it traces", () => {
  const radius = 4;
  const tube = 0.2;
  const ring = torusGeometry({ radius, tube, segments: 20, tubeSegments: 6 });

  for (let vertex = 0; vertex < ring.vertexCount; vertex += 1) {
    const [x, y, z] = vertexAt(ring.positions, vertex);
    const fromCentre = Math.hypot(x, y, z);

    assert.ok(fromCentre >= radius - tube - 1e-6, `${fromCentre} is inside the ring`);
    assert.ok(fromCentre <= radius + tube + 1e-6, `${fromCentre} is outside the ring`);
  }
});

test("every ring triangle winds the same way as the normals it carries", () => {
  // The same defect the sphere's winding test guards against, checked the direct way: a triangle's
  // geometric normal has to agree with the normals its own vertices declare, or half the tube is
  // lit from inside and culled away.
  const ring = torusGeometry({ radius: 3, tube: 0.2, segments: 12, tubeSegments: 6 });

  for (let triangle = 0; triangle < ring.indexCount; triangle += 3) {
    const corners = [...ring.indices.slice(triangle, triangle + 3)];
    const normal = geometricNormal(ring.positions, corners);
    const declared = corners.reduce(
      (sum, corner) => {
        const vertex = vertexAt(ring.normals, corner);

        return [sum[0] + vertex[0], sum[1] + vertex[1], sum[2] + vertex[2]];
      },
      [0, 0, 0],
    );

    assert.ok(
      normal[0] * declared[0] + normal[1] * declared[1] + normal[2] * declared[2] > 0,
      `triangle ${triangle / 3} winds against its own normals`,
    );
  }
});

test("a mesh too large for sixteen-bit indices says so instead of truncating", () => {
  const big = sphereGeometry({ radius: 1, segments: 300, rings: 300 });

  assert.ok(big.vertexCount > 65536);
  assert.equal(big.indexType, "uint32");
  assert.ok(big.indices instanceof Uint32Array);

  // Read one at a time: a quarter of a million arguments would overflow the stack long before it
  // said anything about the mesh.
  let highest = 0;

  for (const index of big.indices) {
    highest = Math.max(highest, index);
  }

  assert.ok(highest < big.vertexCount, `${highest} is past the end of ${big.vertexCount} vertices`);
});

test("a shape that cannot be built is refused rather than drawn wrong", () => {
  assert.throws(() => sphereGeometry({ radius: 0, segments: 8, rings: 4 }), TypeError);
  assert.throws(() => sphereGeometry({ radius: 1, segments: 2, rings: 4 }), TypeError);
  assert.throws(() => sphereGeometry({ radius: 1, segments: 8, rings: 1 }), TypeError);
  assert.throws(() => sphereGeometry({ radius: 1, segments: 8.5, rings: 4 }), TypeError);
  assert.throws(() => sphereGeometry({ radius: Number.NaN, segments: 8, rings: 4 }), TypeError);
  assert.throws(() => torusGeometry({ radius: 1, tube: 1, segments: 16, tubeSegments: 8 }), TypeError);
  assert.throws(() => torusGeometry({ radius: 1, tube: 0, segments: 16, tubeSegments: 8 }), TypeError);
  assert.throws(() => torusGeometry({ radius: 1, tube: 0.1, segments: 2, tubeSegments: 8 }), TypeError);
  assert.throws(() => torusGeometry({ radius: 1, tube: 0.1, segments: 16, tubeSegments: 2 }), TypeError);
});
