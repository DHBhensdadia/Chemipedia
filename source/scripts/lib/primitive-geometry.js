/**
 * The two shapes the viewer draws: the sphere every particle is, and the ring every shell is.
 *
 * Both are generated rather than loaded, because a mesh in a file would be an asset with no author,
 * no test and no reason to be the size it is, and because the numbers that matter here are the ones a
 * caller chooses: how round a sphere is, how many faces a ring's tube has. Both are also pure — a
 * list of vertices, normals and indices and nothing else — so every claim about them is asserted in
 * Node, without a graphics card.
 *
 * **A sphere** is a latitude/longitude sheet: `rings` bands from pole to pole and `segments` columns
 * around. The seam column is written twice, at both ends of the longitude sweep, so the last column's
 * vertices are the first column's again — which is what keeps a mesh from having a diagonal scar
 * where the numbers wrap. Both poles are written once per column as well, and the degenerate
 * triangles that produces are left in: they cost a few indices and remove an entire class of
 * off-by-one in the band loop.
 *
 * **A ring** is a torus, not a band. A flat annulus vanishes when the camera looks along the plane of
 * an orbit, and the camera in this viewer orbits: an orbit you can see from the front and not from the
 * side would make the shells appear and disappear as the reader turns the atom. A tube a few
 * thousandths of the orbit's radius thick is visible from everywhere, which is the whole job.
 *
 * **Index width is the caller's problem, and this module says which it got.** A mesh of 2 145 vertices
 * indexes fine in sixteen bits; one of 300 000 does not. Rather than silently truncating, the indices
 * come back as the narrowest type that holds them and `indexType` names it, so the layer that talks to
 * WebGL picks the matching constant instead of guessing.
 */

/**
 * The number of vertices a latitude/longitude sheet has.
 *
 * @param {number} segments
 * @param {number} rings
 * @returns {number}
 */
function sphereVertexCount(segments, rings) {
  return (rings + 1) * (segments + 1);
}

/**
 * Whether a value is a whole number count this module can build from.
 *
 * @param {unknown} value
 * @param {number} least the smallest that makes a shape
 * @returns {boolean}
 */
function isCount(value, least) {
  return Number.isInteger(value) && value >= least;
}

/**
 * The narrowest index type a mesh of this size fits in.
 *
 * @param {number} vertices
 * @returns {"uint16" | "uint32"}
 */
function indexWidthFor(vertices) {
  return vertices <= 65536 ? "uint16" : "uint32";
}

/**
 * A sphere centred on the origin, as vertices, normals and triangles.
 *
 * @param {object} options
 * @param {number} options.radius greater than zero
 * @param {number} options.segments how many columns around the sphere; three or more
 * @param {number} options.rings how many bands from pole to pole; two or more
 * @returns {{ positions: Float32Array, normals: Float32Array, indices: Uint16Array | Uint32Array,
 *   indexType: "uint16" | "uint32", vertexCount: number, indexCount: number }}
 * @throws {TypeError} when the radius is not positive or a count is too small to be a shape
 */
export function sphereGeometry({ radius, segments, rings }) {
  if (typeof radius !== "number" || !Number.isFinite(radius) || radius <= 0) {
    throw new TypeError("a sphere's radius must be a positive number");
  }

  if (!isCount(segments, 3)) {
    throw new TypeError("a sphere needs at least three segments to have a surface");
  }

  if (!isCount(rings, 2)) {
    throw new TypeError("a sphere needs at least two rings to close from pole to pole");
  }

  const vertexCount = sphereVertexCount(segments, rings);
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);

  for (let ring = 0; ring <= rings; ring += 1) {
    const polar = (ring / rings) * Math.PI;
    const sinPolar = Math.sin(polar);
    const cosPolar = Math.cos(polar);

    for (let segment = 0; segment <= segments; segment += 1) {
      const azimuth = (segment / segments) * Math.PI * 2;
      const x = sinPolar * Math.sin(azimuth);
      const y = cosPolar;
      const z = sinPolar * Math.cos(azimuth);
      const at = (ring * (segments + 1) + segment) * 3;

      positions[at] = x * radius;
      positions[at + 1] = y * radius;
      positions[at + 2] = z * radius;

      // A sphere centred on the origin is its own normal field: the direction out of the surface at a
      // point is the point, with the radius divided out.
      normals[at] = x;
      normals[at + 1] = y;
      normals[at + 2] = z;
    }
  }

  const indexType = indexWidthFor(vertexCount);
  const IndexArray = indexType === "uint16" ? Uint16Array : Uint32Array;
  const indices = new IndexArray(rings * segments * 6);
  let index = 0;

  for (let ring = 0; ring < rings; ring += 1) {
    for (let segment = 0; segment < segments; segment += 1) {
      const top = ring * (segments + 1) + segment;
      const bottom = top + segments + 1;

      indices[index] = top;
      indices[index + 1] = bottom;
      indices[index + 2] = top + 1;
      indices[index + 3] = top + 1;
      indices[index + 4] = bottom;
      indices[index + 5] = bottom + 1;
      index += 6;
    }
  }

  return {
    positions,
    normals,
    indices,
    indexType,
    vertexCount,
    indexCount: indices.length,
  };
}

/**
 * A ring around the origin in the x/z plane, as a tube: the shape an orbit is drawn as.
 *
 * @param {object} options
 * @param {number} options.radius the orbit's own radius, greater than the tube's
 * @param {number} options.tube how thick the ring is drawn
 * @param {number} options.segments how many faces around the ring; three or more
 * @param {number} options.tubeSegments how many faces around the tube; three or more
 * @returns {{ positions: Float32Array, normals: Float32Array, indices: Uint16Array | Uint32Array,
 *   indexType: "uint16" | "uint32", vertexCount: number, indexCount: number }}
 * @throws {TypeError} when a value is not usable, including a ring thicker than it is wide
 */
export function torusGeometry({ radius, tube, segments, tubeSegments }) {
  if (typeof radius !== "number" || !Number.isFinite(radius) || radius <= 0) {
    throw new TypeError("a ring's radius must be a positive number");
  }

  if (typeof tube !== "number" || !Number.isFinite(tube) || tube <= 0) {
    throw new TypeError("a ring's tube must be a positive number");
  }

  if (tube >= radius) {
    throw new TypeError("a ring's tube must be thinner than the ring, or it is a disc");
  }

  if (!isCount(segments, 3)) {
    throw new TypeError("a ring needs at least three segments");
  }

  if (!isCount(tubeSegments, 3)) {
    throw new TypeError("a ring's tube needs at least three segments to be round");
  }

  const vertexCount = (segments + 1) * (tubeSegments + 1);
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);

  for (let segment = 0; segment <= segments; segment += 1) {
    const around = (segment / segments) * Math.PI * 2;
    const outX = Math.cos(around);
    const outZ = Math.sin(around);

    for (let around2 = 0; around2 <= tubeSegments; around2 += 1) {
      const through = (around2 / tubeSegments) * Math.PI * 2;
      const sinThrough = Math.sin(through);
      const cosThrough = Math.cos(through);

      // The ring lies in the x/z plane, the same plane an electron orbits in, so the tube's local
      // frame is the ring's own outward direction and the plane's normal.
      const normalX = cosThrough * outX;
      const normalY = sinThrough;
      const normalZ = cosThrough * outZ;
      const at = (segment * (tubeSegments + 1) + around2) * 3;

      positions[at] = (radius + tube * cosThrough) * outX;
      positions[at + 1] = tube * sinThrough;
      positions[at + 2] = (radius + tube * cosThrough) * outZ;

      normals[at] = normalX;
      normals[at + 1] = normalY;
      normals[at + 2] = normalZ;
    }
  }

  const indexType = indexWidthFor(vertexCount);
  const IndexArray = indexType === "uint16" ? Uint16Array : Uint32Array;
  const indices = new IndexArray(segments * tubeSegments * 6);
  let index = 0;

  for (let segment = 0; segment < segments; segment += 1) {
    for (let around = 0; around < tubeSegments; around += 1) {
      const near = segment * (tubeSegments + 1) + around;
      const far = near + tubeSegments + 1;

      indices[index] = near;
      indices[index + 1] = near + 1;
      indices[index + 2] = far;
      indices[index + 3] = near + 1;
      indices[index + 4] = far + 1;
      indices[index + 5] = far;
      index += 6;
    }
  }

  return {
    positions,
    normals,
    indices,
    indexType,
    vertexCount,
    indexCount: indices.length,
  };
}
