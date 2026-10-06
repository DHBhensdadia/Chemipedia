/**
 * The WebGL2 layer: one canvas, two programs, and every frame the atom is drawn in.
 *
 * This is the only file in the project that talks to a graphics card, and it is deliberately dumb
 * about what it draws. It owns the context, the programs, the lighting, the frame loop and the sizing
 * rules; it owns no opinion about how many protons carbon has, where an electron is at a given moment,
 * or what any of it means. Those are the model's business and they arrive as arrays. The vertices and
 * the buffers they live in are `atom-meshes.js`'s business, and they arrive as two objects.
 *
 * Four decisions worth the reading:
 *
 * 1. **Everything hangs on `available()`.** A machine without WebGL2, a context a browser refuses, a
 *    shader that will not compile — each makes the view unavailable rather than fatal, and every other
 *    method becomes a no-op. The page around it has a diagram to fall back to; a viewer that threw on
 *    load would take the page down with it.
 * 2. **The particles are instanced, the rings are not.** A sphere is uploaded once at unit radius and
 *    each instance carries its own offset, radius, colour and glow, so every particle in the atom is
 *    one draw call. The rings are at most seven and each has its own radius: each is its own small
 *    mesh, and instancing them would be machinery for no gain.
 * 3. **The orbits are blended and do not write depth.** A ring is a hint of a path, drawn at a
 *    fraction of full opacity; if it wrote depth it would hide the nucleons behind it, and without
 *    blending its transparency would be ignored and the shells would look like wire hoops.
 * 4. **The loop is somebody else's business.** When to draw, how much time a frame carries and whether
 *    the page is even visible all live in `frame-loop.js`, injectable and tested without a canvas. This
 *    layer says what one frame does and nothing about when the next one comes.
 */

import { createProgram, RING_PROGRAM, SPHERE_PROGRAM } from "./atom-shaders.js";
import { createRingShapes, createSphereInstances } from "./atom-meshes.js";
import { createFrameLoop } from "./frame-loop.js";

/**
 * @param {unknown} value
 * @param {string} name
 * @returns {number}
 * @throws {TypeError} when the value is not a finite number
 */
function asNumber(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }

  return value;
}

/**
 * @param {unknown} value
 * @param {string} name
 * @param {number} least
 * @returns {number}
 * @throws {TypeError} when the value is not a whole number at least this large
 */
function asCount(value, name, least) {
  if (!Number.isInteger(value) || value < least) {
    throw new TypeError(`${name} must be a whole number, ${least} or more`);
  }

  return value;
}

/**
 * Create the viewer's drawing layer on a canvas.
 *
 * Every configuration value is checked here, before a context is asked for, so that a mistake in the
 * scene is refused the same way on a machine with a graphics card and one without.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {object} options
 * @param {{ segments: number, rings: number }} options.sphere how round the unit sphere is
 * @param {number} options.pixelRatioLimit the most pixels per CSS pixel the surface may use
 * @param {{ lightDirection: number[], lightStrength: number, ambient: number }} options.lighting
 * @param {number[]} [options.clearColour] what the stage is cleared to, with its alpha
 * @param {object} [options.loop] the clock, the scheduler and the visibility rule, as the frame loop
 *   takes them; the browser's own unless a caller says otherwise
 * @returns {object} the view
 * @throws {TypeError} when a configuration value is not usable
 */
export function createAtomView(canvas, options) {
  const {
    sphere,
    pixelRatioLimit,
    lighting,
    clearColour = [0, 0, 0, 0],
    loop: loopOptions,
  } = options ?? {};

  if (!canvas || typeof canvas.getContext !== "function") {
    throw new TypeError("the view needs a canvas");
  }

  const limit = asNumber(pixelRatioLimit, "pixelRatioLimit");

  // A cap of zero is not a small surface, it is a surface one pixel across: the box is multiplied by
  // the ratio, and everything drawn on it would be drawn where nobody can see it.
  if (limit <= 0) {
    throw new TypeError("pixelRatioLimit must be greater than zero");
  }

  const loop = createFrameLoop(loopOptions);
  const light = {
    direction: lighting?.lightDirection,
    strength: asNumber(lighting?.lightStrength, "lighting.lightStrength"),
    ambient: asNumber(lighting?.ambient, "lighting.ambient"),
  };
  const segments = asCount(sphere?.segments, "sphere.segments", 3);
  const ringBands = asCount(sphere?.rings, "sphere.rings", 2);

  if (!Array.isArray(light.direction) || light.direction.length !== 3) {
    throw new TypeError("lighting.lightDirection must be three numbers");
  }

  if (!Array.isArray(clearColour) || clearColour.length !== 4) {
    throw new TypeError("clearColour must be four numbers");
  }

  /** The context, or null when this machine cannot draw the atom. */
  let gl = null;

  try {
    gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      depth: true,
      premultipliedAlpha: false,
    });
  } catch {
    // A browser that refuses the context outright is the same case as one that has none.
    gl = null;
  }

  const sphereSlot = { program: null, attribs: {}, uniforms: {} };
  const ringSlot = { program: null, attribs: {}, uniforms: {} };
  let particleMesh = null;
  let ringShapes = null;
  let ringsDrawn = [];
  let particleCount = 0;
  let drawn = false;

  // Reused every frame. A scene that allocated its matrices afresh sixty times a second would still
  // work; it would just hand the collector a hundred small objects a second for no reason.
  const projection = new Float32Array(16);
  const view = new Float32Array(16);
  const model = new Float32Array(16);
  const direction = new Float32Array(3);
  const tint = new Float32Array(3);
  const background = new Float32Array(4);

  /**
   * Compile and link one program, and look up every name it declares.
   *
   * @param {object} slot
   * @param {{ vertex: string, fragment: string, attributes: string[], uniforms: string[] }} source
   * @returns {void}
   */
  function buildProgram(slot, source) {
    slot.program = createProgram(gl, source);

    for (const name of source.attributes) {
      slot.attribs[name] = gl.getAttribLocation(slot.program, name);
    }

    for (const name of source.uniforms) {
      slot.uniforms[name] = gl.getUniformLocation(slot.program, name);
    }
  }

  /** Everything that only exists once there is a context to build it in. */
  function build() {
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    buildProgram(sphereSlot, SPHERE_PROGRAM);
    buildProgram(ringSlot, RING_PROGRAM);

    particleMesh = createSphereInstances(gl, { attribs: sphereSlot.attribs, segments, rings: ringBands });
    ringShapes = createRingShapes(gl, { attribs: ringSlot.attribs });
  }

  /** Give back whatever of the drawing resources exist, in any state of construction. */
  function disposeResources() {
    if (!gl) {
      return;
    }

    if (particleMesh) {
      particleMesh.dispose();
      particleMesh = null;
    }

    if (ringShapes) {
      ringShapes.dispose();
      ringShapes = null;
    }

    ringsDrawn = [];

    for (const slot of [sphereSlot, ringSlot]) {
      if (slot.program) {
        gl.deleteProgram(slot.program);
        slot.program = null;
      }
    }

    drawn = false;
  }

  if (gl) {
    try {
      build();
    } catch {
      // A device that cannot compile the shaders is a device that cannot draw the atom, which is a case
      // the page already has an answer for. Releasing what was built and marking the view unavailable
      // keeps a missing feature from becoming a broken page; the GLSL itself stays in the module above,
      // where a refusal is loud in the style guide and in the tests.
      disposeResources();
      gl = null;
    }
  }

  return {
    /** Whether this machine can draw the atom at all. */
    available: () => Boolean(gl),

    /** Whether a frame has been drawn, which is what a page waits for before hiding a fallback. */
    hasDrawn: () => drawn,

    /** The drawing surface's own size, in the pixels it is actually made of. */
    size: () => ({ width: canvas.width, height: canvas.height }),

    /**
     * Make the drawing surface follow the canvas' box, within the pixel-ratio limit.
     *
     * @param {number} [deviceRatio] the device's own ratio, injected so the rule can be tested
     * @returns {boolean} whether the surface changed, so a caller can redraw a still frame
     */
    resize(deviceRatio = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1) {
      const ratio = Math.min(asNumber(deviceRatio, "deviceRatio"), limit);
      const width = Math.max(1, Math.round((canvas.clientWidth || canvas.width || 1) * ratio));
      const height = Math.max(1, Math.round((canvas.clientHeight || canvas.height || 1) * ratio));

      // Assigning to a canvas' width clears it — even when the value is the one it already has — so a
      // resize that changes nothing must not touch it, or every call blanks a still frame.
      if (width === canvas.width && height === canvas.height) {
        return false;
      }

      canvas.width = width;
      canvas.height = height;

      if (gl) {
        gl.viewport(0, 0, width, height);
      }

      return true;
    },

    /**
     * Upload the particles: one offset, radius, colour and glow per sphere.
     *
     * @param {{ positions: ArrayLike<number>, radii: ArrayLike<number>, colours: ArrayLike<number>,
     *   glows: ArrayLike<number>, count: number }} next
     * @returns {void}
     * @throws {TypeError} when a list is shorter than the count needs, which would draw garbage
     */
    setParticles(next) {
      const count = next?.count;

      if (!Number.isInteger(count) || count < 0) {
        throw new TypeError("a particle count must be a whole number, zero or more");
      }

      for (const [name, list, width] of [
        ["positions", next.positions, 3],
        ["radii", next.radii, 1],
        ["colours", next.colours, 3],
        ["glows", next.glows, 1],
      ]) {
        if (!list || list.length < count * width) {
          throw new TypeError(`${name} must hold at least ${count * width} numbers`);
        }
      }

      particleCount = count;
      particleMesh?.set(next);
    },

    /**
     * Declare the rings: one per shell, each with its own radius, colour and transparency.
     *
     * The meshes are resolved here rather than inside a frame, because a mesh built mid-draw is a hitch
     * the reader feels at exactly the wrong moment. A ring whose numbers are not a ring is refused here
     * too, which is the earliest moment anyone can be told.
     *
     * @param {{ radius: number, tube: number, segments: number, tubeSegments: number,
     *   colour: number[], opacity: number }[]} list
     * @returns {void}
     * @throws {TypeError} when a ring's geometry is not a ring
     */
    setRings(list) {
      ringsDrawn = ringShapes ? ringShapes.prepare(Array.isArray(list) ? list : []) : [];
    },

    /**
     * Draw one frame.
     *
     * @param {{ model: number[], camera: { projectionMatrix: Function, viewMatrix: Function } }} frame
     * @returns {boolean} whether anything was drawn, which is false on a machine without a context
     */
    draw({ model: matrix, camera }) {
      if (!gl || !camera) {
        return false;
      }

      const aspect = Math.max(1, canvas.width) / Math.max(1, canvas.height);

      projection.set(camera.projectionMatrix(aspect));
      view.set(camera.viewMatrix());
      model.set(matrix);
      direction.set(light.direction);
      background.set(clearColour);

      gl.clearColor(...background);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      if (ringsDrawn.length > 0) {
        gl.useProgram(ringSlot.program);
        gl.uniformMatrix4fv(ringSlot.uniforms.uProjection, false, projection);
        gl.uniformMatrix4fv(ringSlot.uniforms.uView, false, view);
        gl.uniformMatrix4fv(ringSlot.uniforms.uModel, false, model);
        gl.uniform3fv(ringSlot.uniforms.uLightDirection, direction);
        gl.uniform1f(ringSlot.uniforms.uLightStrength, light.strength);
        gl.uniform1f(ringSlot.uniforms.uAmbient, light.ambient);
        gl.depthMask(false);

        for (const ring of ringsDrawn) {
          tint.set(ring.colour);
          gl.uniform3fv(ringSlot.uniforms.uColour, tint);
          gl.uniform1f(ringSlot.uniforms.uOpacity, ring.opacity);
          ringShapes.draw(ring.shape);
        }

        gl.depthMask(true);
      }

      if (particleCount > 0) {
        gl.useProgram(sphereSlot.program);
        gl.uniformMatrix4fv(sphereSlot.uniforms.uProjection, false, projection);
        gl.uniformMatrix4fv(sphereSlot.uniforms.uView, false, view);
        gl.uniformMatrix4fv(sphereSlot.uniforms.uModel, false, model);
        gl.uniform3fv(sphereSlot.uniforms.uLightDirection, direction);
        gl.uniform1f(sphereSlot.uniforms.uLightStrength, light.strength);
        gl.uniform1f(sphereSlot.uniforms.uAmbient, light.ambient);
        particleMesh.draw(particleCount);
      }

      gl.bindVertexArray(null);
      drawn = true;

      return true;
    },

    /**
     * Run the frame loop.
     *
     * @param {(deltaSeconds: number) => void} onFrame called once per frame while the page is visible
     * @returns {void}
     * @throws {TypeError} when the step is not a function
     */
    start: (onFrame) => loop.start(onFrame),

    /** Stop the loop; a stopped view can be started again. */
    stop: () => loop.stop(),

    /** Whether the loop is running. */
    running: () => loop.running(),

    /** Stop, and give the graphics card everything back. */
    destroy() {
      loop.stop();
      disposeResources();
    },
  };
}
