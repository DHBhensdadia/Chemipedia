/**
 * The meshes the atom viewer draws, and the buffers that hold them.
 *
 * The layer above this one decides how many protons carbon has and where an electron is at a given
 * moment. This one knows only how to put vertices on a graphics card and how to hand them back to a
 * draw call, which makes it the only place in the project a WebGL buffer is created, replaced or
 * deleted — and lets the view above be read as a scene rather than as bookkeeping.
 *
 * Three decisions worth stating:
 *
 * 1. **One sphere, many instances.** The sphere is uploaded once at unit radius and never changes;
 *    every particle arrives as its own offset, radius, colour and glow. A sphere per particle would
 *    be a mesh per particle, and two hundred nucleons would be two hundred uploads of the same thing.
 * 2. **Each instance attribute is its own tightly packed buffer.** An offset is three floats, a radius
 *    is one, and each buffer is exactly as wide as the attribute it carries — no padding, and no
 *    shared stride that has to be kept in step with a shader that might change.
 * 3. **Capacity only grows, and never by less than it already had.** Growing means replacing every
 *    buffer, the one expensive thing here, so room is made for twice what there was or for what was
 *    asked for, whichever is larger: an atom whose particle count climbs one proton at a time
 *    reallocates a handful of times rather than once per change.
 *
 * The ring shapes are a cache keyed by their geometry, not by the shell they belong to: switching from
 * carbon to silicon changes which rings are drawn but not how many radii the site will ever ask for,
 * so the second element drawn shares most of the first one's meshes. What a ring's *plane* is does not
 * enter that key, and should not: two shells of the same radius are the same tube turned differently,
 * and turning one is a uniform the draw is given rather than a mesh to build.
 */

import { sphereGeometry, torusGeometry } from "../lib/primitive-geometry.js";

/** The smallest instance capacity, so a hydrogen atom does not reallocate on its first grow. */
const LEAST_CAPACITY = 16;

/**
 * The attributes the per-particle buffers are bound to, in the order their buffers are kept.
 *
 * `from` names the caller's own array: one particle occupies exactly `size` numbers in it, which is
 * what lets a buffer be written without a stride the caller has to agree about.
 *
 * @type {{ name: string, from: string, size: number }[]}
 */
export const INSTANCE_ATTRIBUTES = [
  { name: "aOffset", from: "positions", size: 3 },
  { name: "aRadius", from: "radii", size: 1 },
  { name: "aColour", from: "colours", size: 3 },
  { name: "aGlow", from: "glows", size: 1 },
];

/** The attributes both meshes are made of: a vertex, and the direction out of its surface. */
export const MESH_ATTRIBUTES = ["aPosition", "aNormal"];

/**
 * @param {WebGL2RenderingContext} gl
 * @param {Float32Array} values
 * @param {number} usage
 * @returns {WebGLBuffer}
 */
function uploadFloats(gl, values, usage) {
  const buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, values, usage);

  return buffer;
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {Uint16Array | Uint32Array} indices
 * @returns {WebGLBuffer}
 */
function uploadIndex(gl, indices) {
  const buffer = gl.createBuffer();

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return buffer;
}

/**
 * The constant WebGL wants for a mesh's own index type.
 *
 * @param {WebGL2RenderingContext} gl
 * @param {"uint16" | "uint32"} indexType
 * @returns {number}
 */
function indexConstant(gl, indexType) {
  return indexType === "uint16" ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT;
}

/**
 * A vertex array object: one buffer per attribute, bound where the program says that name belongs.
 *
 * Nothing is assumed about where an attribute landed. A shader's attribute indices are the driver's
 * to choose, so each is looked up by name, and an attribute the driver dropped — because the shader
 * never reads it — is skipped rather than bound at a negative location.
 *
 * @param {WebGL2RenderingContext} gl
 * @param {Record<string, number>} attribs the locations this program gave its attributes
 * @param {{ name: string, size: number, buffer: WebGLBuffer, stride: number, divisor: number }[]} layout
 * @returns {WebGLVertexArrayObject}
 */
function makeVao(gl, attribs, layout) {
  const vao = gl.createVertexArray();

  gl.bindVertexArray(vao);

  for (const part of layout) {
    const at = attribs[part.name];

    if (at === undefined || at < 0) {
      continue;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, part.buffer);
    gl.enableVertexAttribArray(at);
    gl.vertexAttribPointer(at, part.size, gl.FLOAT, false, part.stride, 0);
    gl.vertexAttribDivisor(at, part.divisor);
  }

  gl.bindVertexArray(null);

  return vao;
}

/**
 * The unit sphere every particle is an instance of, with room for however many arrive.
 *
 * @param {WebGL2RenderingContext} gl
 * @param {object} options
 * @param {Record<string, number>} options.attribs where the sphere program binds its attributes
 * @param {number} options.segments how round the unit sphere is, across
 * @param {number} options.rings how many bands from pole to pole
 * @returns {object} the mesh, its buffers, and the two things a caller does with them
 * @throws {TypeError} when the sphere's own numbers do not make a shape
 */
export function createSphereInstances(gl, { attribs, segments, rings }) {
  const mesh = sphereGeometry({ radius: 1, segments, rings });
  const positionBuffer = uploadFloats(gl, mesh.positions, gl.STATIC_DRAW);
  const normalBuffer = uploadFloats(gl, mesh.normals, gl.STATIC_DRAW);
  const indexBuffer = uploadIndex(gl, mesh.indices);
  const indexType = indexConstant(gl, mesh.indexType);

  let capacity = 0;
  let buffers = [];
  let staging = [];
  let vao = null;

  /**
   * Give back the instance buffers and the vertex array that pointed at them, keeping the sphere.
   *
   * The sphere's own attributes live in that same array rather than in one of their own, which is the
   * whole of the next decision; either way, replacing it means replacing this.
   */
  function release() {
    for (const buffer of buffers) {
      gl.deleteBuffer(buffer);
    }

    if (vao) {
      gl.deleteVertexArray(vao);
      vao = null;
    }

    buffers = [];
    staging = [];
    capacity = 0;
  }

  /**
   * Make room for this many particles, without ever shrinking.
   *
   * @param {number} count
   * @returns {void}
   */
  function reserve(count) {
    if (count <= capacity) {
      return;
    }

    const previous = capacity;

    release();
    capacity = Math.max(count, previous * 2, LEAST_CAPACITY);
    buffers = INSTANCE_ATTRIBUTES.map((part) =>
      uploadFloats(gl, new Float32Array(capacity * part.size), gl.DYNAMIC_DRAW),
    );
    staging = INSTANCE_ATTRIBUTES.map((part) => new Float32Array(capacity * part.size));

    // **One vertex array, carrying the sphere and the instances together.** The sphere's own vertices
    // and the per-particle numbers are two halves of one draw, and a vertex array is the whole of what
    // an attribute binding belongs to: pointing the instance buffers in an array of their own leaves
    // the shader's `aPosition` unbound, which reads as zero, which collapses every sphere to a point at
    // its own centre — a draw call that succeeds and paints nothing. The unit tests pass either way,
    // because the call is made either way; this was found by reading the pixels in a browser.
    vao = makeVao(gl, attribs, [
      { name: "aPosition", size: 3, buffer: positionBuffer, stride: 0, divisor: 0 },
      { name: "aNormal", size: 3, buffer: normalBuffer, stride: 0, divisor: 0 },
      ...INSTANCE_ATTRIBUTES.map((part, at) => ({
        name: part.name,
        size: part.size,
        buffer: buffers[at],
        stride: part.size * Float32Array.BYTES_PER_ELEMENT,
        divisor: 1,
      })),
    ]);
  }

  return {
    /** How many particles the buffers can currently hold. */
    capacity: () => capacity,

    /**
     * Upload the particles.
     *
     * @param {{ count: number } & Record<string, ArrayLike<number>>} list
     * @returns {void}
     */
    set(list) {
      reserve(list.count);

      if (list.count === 0) {
        return;
      }

      INSTANCE_ATTRIBUTES.forEach((part, at) => {
        const source = list[part.from];
        const target = staging[at];

        // The caller packs each particle at its own width, so this is a copy rather than a gather:
        // three floats in, three floats out, one particle at a time.
        for (let particle = 0; particle < list.count; particle += 1) {
          const start = particle * part.size;

          for (let number = 0; number < part.size; number += 1) {
            target[start + number] = source[start + number];
          }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[at]);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, target);
      });
    },

    /**
     * Draw the instances, in the one call they were built for.
     *
     * The program that draws them has to be bound, with its uniforms set, before this is called.
     *
     * @param {number} count
     * @returns {boolean} whether a call was issued
     */
    draw(count) {
      if (!vao || count <= 0) {
        return false;
      }

      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.drawElementsInstanced(gl.TRIANGLES, mesh.indexCount, indexType, 0, count);

      return true;
    },

    /** Give everything back. */
    dispose() {
      release();
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(normalBuffer);
      gl.deleteBuffer(indexBuffer);
    },
  };
}

/**
 * The rings every shell is drawn as, built once per radius and kept.
 *
 * @param {WebGL2RenderingContext} gl
 * @param {object} options
 * @param {Record<string, number>} options.attribs where the ring program binds its attributes
 * @returns {object} the cache
 */
export function createRingShapes(gl, { attribs }) {
  const shapes = new Map();

  /**
   * The key a ring's geometry is cached under: two rings that agree about these agree about the mesh.
   *
   * @param {object} ring
   * @returns {string}
   */
  function keyOf(ring) {
    return `${ring.radius}:${ring.tube}:${ring.segments}:${ring.tubeSegments}`;
  }

  /**
   * @param {object} ring
   * @returns {object}
   */
  function build(ring) {
    const mesh = torusGeometry({
      radius: ring.radius,
      tube: ring.tube,
      segments: ring.segments,
      tubeSegments: ring.tubeSegments,
    });
    const positionBuffer = uploadFloats(gl, mesh.positions, gl.STATIC_DRAW);
    const normalBuffer = uploadFloats(gl, mesh.normals, gl.STATIC_DRAW);

    return {
      vao: makeVao(gl, attribs, [
        { name: "aPosition", size: 3, buffer: positionBuffer, stride: 0, divisor: 0 },
        { name: "aNormal", size: 3, buffer: normalBuffer, stride: 0, divisor: 0 },
      ]),
      indexBuffer: uploadIndex(gl, mesh.indices),
      indexCount: mesh.indexCount,
      indexType: indexConstant(gl, mesh.indexType),
      buffers: [positionBuffer, normalBuffer],
    };
  }

  return {
    /** How many distinct radii have been built. */
    size: () => shapes.size,

    /**
     * Resolve a list of rings into meshes, building whatever is new.
     *
     * Called when the scene changes rather than per frame: building a mesh inside a draw is how a
     * viewer gains a hitch the moment a reader picks a heavier element.
     *
     * @param {{ radius: number, tube: number, segments: number, tubeSegments: number,
     *   colour: number[], opacity: number, orientation?: number[] }[]} list
     * @returns {{ shape: object, colour: number[], opacity: number, orientation: number[] | null }[]}
     * @throws {TypeError} when a ring's geometry is not a ring
     */
    prepare(list) {
      return list.map((ring) => {
        const key = keyOf(ring);

        if (!shapes.has(key)) {
          shapes.set(key, build(ring));
        }

        // The colour, the transparency and the plane belong to the shell rather than to the mesh, so
        // two shells that shared a radius would still draw in their own colours, on their own planes.
        return {
          shape: shapes.get(key),
          colour: ring.colour,
          opacity: ring.opacity,
          orientation: ring.orientation ?? null,
        };
      });
    },

    /**
     * Draw one prepared ring.
     *
     * @param {object} shape
     * @returns {void}
     */
    draw(shape) {
      gl.bindVertexArray(shape.vao);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.indexBuffer);
      gl.drawElements(gl.TRIANGLES, shape.indexCount, shape.indexType, 0);
    },

    /** Give every cached radius back. */
    dispose() {
      shapes.forEach((shape) => {
        gl.deleteVertexArray(shape.vao);
        gl.deleteBuffer(shape.indexBuffer);
        shape.buffers.forEach((buffer) => gl.deleteBuffer(buffer));
      });
      shapes.clear();
    },
  };
}
