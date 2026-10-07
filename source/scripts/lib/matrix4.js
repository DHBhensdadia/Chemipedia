/**
 * The 4x4 arithmetic the viewer needs, and nothing else.
 *
 * A three-dimensional scene is, underneath, five operations: multiply two matrices, build the
 * perspective, build the view, move something, and turn something. Each is a handful of
 * multiplications and each is easy to get subtly wrong — a column where a row belongs gives a
 * picture that looks plausible and is not the one that was meant — so they live in one file with
 * tests that hold them to the definition rather than to a screenshot.
 *
 * **A matrix is sixteen numbers in column-major order**: `m[column * 4 + row]`, the order WebGL
 * uploads a `Float32Array` in and the order every graphics text writes out. Nothing here hides that
 * — the tests read the entries by name.
 *
 * Matrices are ordinary arrays rather than `Float32Array`s because that is what the arithmetic reads
 * best as (`m[12]` is the translation's x) and because a plain array is what a test can compare with
 * `deepEqual`; the layer that talks to WebGL converts in one place, at the GPU boundary.
 *
 * `multiply(a, b)` is `a * b`, so `b` is applied to a column vector first: a model matrix built as
 * `multiply(translation, rotationAbout(axis, angle))` turns the object and then moves it, which is
 * the order a reader expects from left to right.
 */

/** How many numbers a matrix is. Named, because it is checked in more than one place. */
const MATRIX_LENGTH = 16;

/**
 * The two shapes this module accepts, checked where they enter.
 *
 * `name` is what the caller called the argument, so a failure names the argument rather than the
 * file — which is the difference between a usable message and a hunt.
 *
 * @param {unknown} matrix
 * @param {string} name
 * @returns {number[]}
 * @throws {TypeError} when the value is not sixteen finite numbers
 */
function asMatrix(matrix, name) {
  const sixteen = (value) => typeof value === "number" && Number.isFinite(value);

  if (!Array.isArray(matrix) || matrix.length !== MATRIX_LENGTH || !matrix.every(sixteen)) {
    throw new TypeError(`${name} must be sixteen finite numbers in column-major order`);
  }

  return matrix;
}

/**
 * @param {unknown} vector
 * @param {string} name
 * @returns {number[]}
 * @throws {TypeError} when the value is not three finite numbers
 */
function asVector(vector, name) {
  const three = (value) => typeof value === "number" && Number.isFinite(value);

  if (!Array.isArray(vector) || vector.length !== 3 || !vector.every(three)) {
    throw new TypeError(`${name} must be three finite numbers`);
  }

  return vector;
}

/**
 * The matrix that changes nothing.
 *
 * @returns {number[]}
 */
export function identity() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

/**
 * The product of two matrices: `b` applies first, then `a`.
 *
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 * @throws {TypeError} when either argument is not a matrix
 */
export function multiply(a, b) {
  const first = asMatrix(a, "a");
  const second = asMatrix(b, "b");
  const out = new Array(MATRIX_LENGTH).fill(0);

  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      let sum = 0;

      for (let k = 0; k < 4; k += 1) {
        sum += first[k * 4 + row] * second[column * 4 + k];
      }

      out[column * 4 + row] = sum;
    }
  }

  return out;
}

/**
 * The perspective projection: what makes distance small.
 *
 * @param {number} fieldOfViewRadians the vertical field of view, in radians
 * @param {number} aspect width divided by height
 * @param {number} near the nearest plane that is drawn, greater than zero
 * @param {number} far the furthest plane, beyond `near`
 * @returns {number[]}
 * @throws {TypeError} when a value is not usable, which is a camera no projection can rescue
 */
export function perspective(fieldOfViewRadians, aspect, near, far) {
  const values = { fieldOfViewRadians, aspect, near, far };

  for (const [name, value] of Object.entries(values)) {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
      throw new TypeError(`${name} must be a positive number`);
    }
  }

  if (far <= near) {
    throw new TypeError("the far plane must be further away than the near plane");
  }

  const f = 1 / Math.tan(fieldOfViewRadians / 2);
  const out = new Array(MATRIX_LENGTH).fill(0);

  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) / (near - far);
  out[11] = -1;
  out[14] = (2 * far * near) / (near - far);

  return out;
}

/**
 * The view matrix: the camera's own position and aim, written the other way round.
 *
 * The camera looks down its own negative z, so this is the inverse of placing a camera at `eye`
 * looking at `target` — built directly, as three orthonormal axes and the eye's offset, which is
 * cheaper and steadier than inverting.
 *
 * @param {number[]} eye where the camera is
 * @param {number[]} target what it looks at
 * @param {number[]} up which way is up, roughly — it is made perpendicular to the view
 * @returns {number[]}
 * @throws {TypeError} when the camera stands on its target, or `up` is parallel to the view
 */
export function lookAt(eye, target, up) {
  const position = asVector(eye, "eye");
  const focus = asVector(target, "target");
  const upwards = asVector(up, "up");

  const z = subtract(position, focus);
  const zLength = length(z);

  if (zLength === 0) {
    throw new TypeError("the camera cannot look at the point it is standing on");
  }

  const forward = scale(z, 1 / zLength);
  const x = cross(upwards, forward);
  const xLength = length(x);

  if (xLength === 0) {
    throw new TypeError("up cannot be parallel to the camera's own direction");
  }

  const right = scale(x, 1 / xLength);
  const y = cross(forward, right);

  return [
    right[0],
    y[0],
    forward[0],
    0,
    right[1],
    y[1],
    forward[1],
    0,
    right[2],
    y[2],
    forward[2],
    0,
    -dot(right, position),
    -dot(y, position),
    -dot(forward, position),
    1,
  ];
}

/**
 * Movement by a vector.
 *
 * @param {number[]} offset
 * @returns {number[]}
 * @throws {TypeError} when the offset is not three finite numbers
 */
export function translation(offset) {
  const [x, y, z] = asVector(offset, "offset");
  const out = identity();

  out[12] = x;
  out[13] = y;
  out[14] = z;

  return out;
}

/**
 * Resizing along the axes, or uniformly when given one number.
 *
 * @param {number | number[]} factor
 * @returns {number[]}
 * @throws {TypeError} when a factor is not a positive number
 */
export function scaling(factor) {
  const factors = typeof factor === "number" ? [factor, factor, factor] : factor;

  if (!Array.isArray(factors) || factors.length !== 3) {
    throw new TypeError("scaling takes one number or three");
  }

  for (const value of factors) {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
      throw new TypeError("a scale must be a positive number");
    }
  }

  const out = identity();

  out[0] = factors[0];
  out[5] = factors[1];
  out[10] = factors[2];

  return out;
}

/**
 * A turn about one axis.
 *
 * The axis is a direction rather than a vector to travel along, so it is normalised: an axis written
 * as a ray of any length must mean the same turn, or a caller's units would silently become the speed
 * of a rotation.
 *
 * @param {number[]} axis three numbers, not all zero
 * @param {number} radians
 * @returns {number[]}
 * @throws {TypeError} when the axis has no direction, or the angle is not a number
 */
export function rotationAbout(axis, radians) {
  const direction = asVector(axis, "axis");
  const axisLength = length(direction);

  if (axisLength === 0) {
    throw new TypeError("an axis has to point somewhere");
  }

  if (typeof radians !== "number" || !Number.isFinite(radians)) {
    throw new TypeError("an angle must be a finite number of radians");
  }

  const [x, y, z] = scale(direction, 1 / axisLength);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const one = 1 - cos;

  return [
    cos + x * x * one,
    y * x * one + z * sin,
    z * x * one - y * sin,
    0,
    x * y * one - z * sin,
    cos + y * y * one,
    z * y * one + x * sin,
    0,
    x * z * one + y * sin,
    y * z * one - x * sin,
    cos + z * z * one,
    0,
    0,
    0,
    0,
    1,
  ];
}

/**
 * A turn about each axis at once, given as three angles.
 *
 * The axes are applied in the order x, then y, then z, which is the order every graphics text writes
 * an "XYZ" rotation in and the order the viewer's reference does the same sum in. Three separate
 * turns are three separate matrices and a product, and the product is written out here rather than
 * left to a caller because a caller who gets the order wrong gets a picture that looks plausible and
 * is not the one that was meant.
 *
 * @param {number[]} angles three radians
 * @returns {number[]}
 * @throws {TypeError} when the angles are not three finite numbers
 */
export function eulerRotation(angles) {
  const [x, y, z] = asVector(angles, "angles");

  return multiply(rotationX(x), multiply(rotationY(y), rotationZ(z)));
}

/**
 * @param {number} radians
 * @returns {number[]}
 */
export function rotationX(radians) {
  return rotationAbout([1, 0, 0], radians);
}

/**
 * @param {number} radians
 * @returns {number[]}
 */
export function rotationY(radians) {
  return rotationAbout([0, 1, 0], radians);
}

/**
 * @param {number} radians
 * @returns {number[]}
 */
export function rotationZ(radians) {
  return rotationAbout([0, 0, 1], radians);
}

/**
 * Where a point lands once a matrix has been applied to it.
 *
 * The viewer places its particles on the processor and lets the graphics card move them, so this is
 * not on the drawing path: it is here because it is how a test says "this matrix does what it
 * claims" in one line, and because a caller that needs to know where something lands should ask
 * rather than re-derive the arithmetic.
 *
 * @param {number[]} matrix
 * @param {number[]} point
 * @returns {number[]} the point in the matrix's space
 * @throws {TypeError} when either argument is malformed
 */
export function transformPoint(matrix, point) {
  const m = asMatrix(matrix, "matrix");
  const [x, y, z] = asVector(point, "point");

  return [
    m[0] * x + m[4] * y + m[8] * z + m[12],
    m[1] * x + m[5] * y + m[9] * z + m[13],
    m[2] * x + m[6] * y + m[10] * z + m[14],
  ];
}

/**
 * Where a direction points once a matrix has been applied to it.
 *
 * A direction moves by the matrix' turn and not by its place: the translation a point picks up is
 * deliberately left out, which is the whole difference between the two. The viewer needs it for one
 * thing — carrying the light's direction out of the world's frame and into the camera's, so that the
 * shaders can name a direction the same way the surface they light does.
 *
 * @param {number[]} matrix
 * @param {number[]} direction
 * @returns {number[]}
 * @throws {TypeError} when either argument is malformed
 */
export function transformDirection(matrix, direction) {
  const m = asMatrix(matrix, "matrix");
  const [x, y, z] = asVector(direction, "direction");

  return [
    m[0] * x + m[4] * y + m[8] * z,
    m[1] * x + m[5] * y + m[9] * z,
    m[2] * x + m[6] * y + m[10] * z,
  ];
}

/** The five vector operations `lookAt` and `rotationAbout` are built from. They are private because
 * a caller with a vector problem is not looking for the matrix module. */
function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

/**
 * @param {number[]} vector
 * @param {number} factor
 * @returns {number[]}
 */
function scale(vector, factor) {
  return [vector[0] * factor, vector[1] * factor, vector[2] * factor];
}

/**
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

/**
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * @param {number[]} vector
 * @returns {number}
 */
function length(vector) {
  return Math.sqrt(dot(vector, vector));
}
