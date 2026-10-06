/**
 * A graphics card that only keeps a transcript, for tests that cannot have a real one.
 *
 * The viewer's two drawing modules are the only code in the project that cannot be judged by comparing
 * numbers they return: they talk to WebGL, and WebGL needs a browser. What they actually do, though, is
 * a short list of things — upload this buffer, bind this vertex array, draw this many instances, delete
 * this object — and that list is what the tests judge. This stub answers the calls, records every one
 * of them in order, and invents an object for every handle, so a test can say "ninety particles in one
 * instanced call" without a canvas ever existing.
 *
 * It is deliberately not an implementation: nothing is rasterised, nothing is validated, and a wrong
 * call is a wrong line in the transcript rather than an error. Two conveniences make that transcript
 * readable:
 *
 * 1. **Locations are named.** Real WebGL hands back opaque integers and an object for a uniform, which
 *    would leave a test reading `uniform1f(3, 0.15)` and guessing. Here a location is an object naming
 *    the program attribute or uniform it belongs to, and the transcript carries that name.
 * 2. **A harness can make things fail.** `fails` turns any shader compilation or any link into a
 *    driver refusal, and `dropped` makes an attribute unavailable, which is how the refusal paths — a
 *    program that will not build, an attribute the driver optimised away — are reached on purpose.
 */

/**
 * The calls that carry nothing but their arguments, recorded as they arrive.
 *
 * @type {string[]}
 */
const VERBATIM = [
  "attachShader",
  "bindBuffer",
  "blendFunc",
  "clear",
  "clearColor",
  "compileShader",
  "cullFace",
  "depthMask",
  "enable",
  "linkProgram",
  "shaderSource",
  "useProgram",
];

/**
 * @param {object} [options]
 * @param {"compile" | "link" | null} [options.fails] which stage of building a program should refuse
 * @param {string[]} [options.dropped] attribute names the driver should claim it dropped
 * @returns {object} the context, whose `calls` transcript holds every handle it has invented and
 *   every one it has been given back
 */
export function createGlStub({ fails = null, dropped = [] } = {}) {
  const calls = [];
  const attribLocations = new Map();
  const uniformLocations = new Map();
  let invented = 0;

  // Which vertex array is bound, carried on every attribute call. An attribute binding belongs to the
  // array that is bound when it is made, so this is what lets a test say "the draw used an array that
  // knew about both the sphere and the particles" — the difference between a call that paints and one
  // that silently reads zeroes.
  let bound = null;

  /**
   * @param {string} kind
   * @returns {object}
   */
  function handle(kind) {
    invented += 1;

    return { kind, id: invented };
  }

  const gl = {
    calls,
    ARRAY_BUFFER: 34962,
    ELEMENT_ARRAY_BUFFER: 34963,
    STATIC_DRAW: 35044,
    DYNAMIC_DRAW: 35048,
    FLOAT: 5126,
    UNSIGNED_SHORT: 5123,
    UNSIGNED_INT: 5125,
    TRIANGLES: 4,
    DEPTH_TEST: 2929,
    CULL_FACE: 2884,
    BACK: 1029,
    BLEND: 3042,
    SRC_ALPHA: 770,
    ONE_MINUS_SRC_ALPHA: 771,
    COLOR_BUFFER_BIT: 16384,
    DEPTH_BUFFER_BIT: 256,
    VERTEX_SHADER: 35633,
    FRAGMENT_SHADER: 35632,
    COMPILE_STATUS: 35713,
    LINK_STATUS: 35714,
  };

  for (const name of VERBATIM) {
    gl[name] = (...args) => {
      calls.push({ method: name, args });
    };
  }

  // Creation is recorded as well as answered, because what a reader most wants to know about a layer
  // that owns graphics memory is whether it gives all of it back.
  for (const [method, kind] of [
    ["createBuffer", "buffer"],
    ["createVertexArray", "vertex-array"],
    ["createShader", "shader"],
    ["createProgram", "program"],
  ]) {
    gl[method] = () => {
      const created = handle(kind);

      calls.push({ method, handle: created });

      return created;
    };
  }

  gl.bufferData = (target, data, usage) => {
    calls.push({ method: "bufferData", target, data, usage });
  };

  gl.bufferSubData = (target, offset, data) => {
    calls.push({ method: "bufferSubData", target, offset, data });
  };

  gl.deleteBuffer = (buffer) => {
    calls.push({ method: "deleteBuffer", handle: buffer });
  };

  gl.bindVertexArray = (vao) => {
    bound = vao ?? null;
    calls.push({ method: "bindVertexArray", vao: bound });
  };

  gl.deleteVertexArray = (vao) => {
    calls.push({ method: "deleteVertexArray", handle: vao });
  };

  gl.deleteProgram = (program) => {
    calls.push({ method: "deleteProgram", handle: program });
  };

  gl.deleteShader = (shader) => {
    calls.push({ method: "deleteShader", handle: shader });
  };

  gl.enableVertexAttribArray = (location) => {
    calls.push({ method: "enableVertexAttribArray", location, vao: bound });
  };

  gl.vertexAttribPointer = (location, size, type, normalized, stride, offset) => {
    calls.push({ method: "vertexAttribPointer", location, size, type, normalized, stride, offset, vao: bound });
  };

  gl.vertexAttribDivisor = (location, divisor) => {
    calls.push({ method: "vertexAttribDivisor", location, divisor, vao: bound });
  };

  gl.viewport = (x, y, width, height) => {
    calls.push({ method: "viewport", x, y, width, height });
  };

  gl.uniform1f = (location, value) => {
    calls.push({ method: "uniform1f", uniform: location?.name ?? null, value });
  };

  gl.uniform3fv = (location, value) => {
    calls.push({ method: "uniform3fv", uniform: location?.name ?? null, value: [...value] });
  };

  gl.uniformMatrix4fv = (location, transpose, value) => {
    calls.push({ method: "uniformMatrix4fv", uniform: location?.name ?? null, transpose, value });
  };

  gl.drawElements = (mode, count, type, offset) => {
    calls.push({ method: "drawElements", mode, count, type, offset });
  };

  gl.drawElementsInstanced = (mode, count, type, offset, instances) => {
    calls.push({ method: "drawElementsInstanced", mode, count, type, offset, instances });
  };

  gl.getShaderParameter = () => fails !== "compile";
  gl.getProgramParameter = () => fails !== "link";
  gl.getShaderInfoLog = () => "0:1(10): error: stub refusal";
  gl.getProgramInfoLog = () => "stub refusal: link failed";

  gl.getAttribLocation = (program, name) => {
    if (dropped.includes(name)) {
      return -1;
    }

    const perProgram = attribLocations.get(program) ?? new Map();

    if (!perProgram.has(name)) {
      perProgram.set(name, perProgram.size);
    }

    attribLocations.set(program, perProgram);

    return { program, name, index: perProgram.get(name) };
  };

  gl.getUniformLocation = (program, name) => {
    const perProgram = uniformLocations.get(program) ?? new Map();

    perProgram.set(name, perProgram.get(name) ?? { program, name });
    uniformLocations.set(program, perProgram);

    return perProgram.get(name);
  };

  return gl;
}

/**
 * Every call of one kind, in the order it arrived.
 *
 * @param {object} gl
 * @param {string} method
 * @returns {object[]}
 */
export function callsOf(gl, method) {
  return gl.calls.filter((call) => call.method === method);
}

/**
 * Whether every handle the context invented has been given back.
 *
 * A layer that owns graphics memory is judged by what it leaves behind, and a viewer that keeps a
 * buffer per element the reader looks at is a viewer that grows until the tab is closed.
 *
 * @param {object} gl
 * @returns {{ created: number, deleted: number, outstanding: object[] }}
 */
export function memoryOf(gl) {
  const created = gl.calls
    .filter((call) => call.method.startsWith("create") && call.handle)
    .map((call) => call.handle);
  const deleted = gl.calls
    .filter((call) => call.method.startsWith("delete") && call.handle)
    .map((call) => call.handle);

  return {
    created: created.length,
    deleted: deleted.length,
    outstanding: created.filter((entry) => !deleted.includes(entry)),
  };
}
