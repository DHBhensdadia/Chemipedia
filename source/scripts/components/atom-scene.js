/**
 * The atom, alive on the layer.
 *
 * `atom-model.js` says where everything is at rest and `atom-view.js` draws one frame of a scene it
 * knows nothing about. This is what stands between them: it turns a model into the two lists the
 * layer takes — one sphere per nucleon and electron, one ring per shell — and then, once a frame,
 * moves the electrons along their rings, turns the whole atom, and hands the layer a matrix.
 *
 * Four decisions worth the reading:
 *
 * 1. **The scene owns the clock, not the model.** An electron's place is its ring's phase plus its
 *    ring's angular speed times a time the scene accumulates; nothing in the model knows what time it
 *    is. That is what lets the same model be drawn at any speed, and it is why changing the speed
 *    setting mid-flight does not make the electrons jump: the scene speeds up its own accumulation
 *    rather than re-pointing the model at a different moment.
 * 2. **A shake is an impulse, and its decay is exponential.** Clicking shake adds angular speed to the
 *    atom's turn, and that extra speed decays as `e^(−decay · dt)` — the frame-rate-independent form of
 *    the reference's `× 0.99` per frame, which on a faster machine would decay faster. The atom always
 *    eases back to its own slow turn rather than stopping.
 * 3. **The particles are re-uploaded every frame, and that is deliberate.** The buffer is between two
 *    and four hundred particles, which is a few kilobytes a frame, and it buys one code path for the
 *    still particles and the moving ones instead of two. The audit measures what it costs; if that ever
 *    becomes the wrong trade the measurement will say so.
 * 4. **The scene is not the page.** It never touches the document, never reads a token by name of its
 *    own, and never decides what the reader sees when there is no WebGL. It is handed a view, a way to
 *    read the token layer, and a model; the page owns everything else.
 */

import { placeElectrons, PROTON } from "../lib/atom-model.js";
import { createOrbitCamera } from "../lib/orbit-camera.js";
import { rotationAbout } from "../lib/matrix4.js";

/**
 * The scene's own numbers, read out of the token layer.
 *
 * Exported because the caller needs the same numbers to build the model that this needs to draw it: a
 * model built against one nucleon radius and drawn against another would be a nucleus of the wrong
 * size in a cluster of the right one. One reader, one scale.
 *
 * @param {{ number: (name: string) => number }} tokens
 * @returns {{ nucleonRadius: number, nucleusPacking: number, orbitBase: number, orbitStep: number,
 *   orbitSpeed: number }}
 */
export function atomScale(tokens) {
  return {
    nucleonRadius: tokens.number("--atom-nucleon-radius"),
    nucleusPacking: tokens.number("--atom-nucleus-packing"),
    orbitBase: tokens.number("--atom-orbit-base"),
    orbitStep: tokens.number("--atom-orbit-step"),
    orbitSpeed: tokens.number("--atom-orbit-speed"),
  };
}

/**
 * @param {unknown} value
 * @param {string} name
 * @returns {number}
 * @throws {TypeError} when the value is not a finite number of zero or more
 */
function asSpeed(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new TypeError(`${name} must be a number, zero or more`);
  }

  return value;
}

/**
 * @param {unknown} value
 * @param {string} name
 * @returns {number}
 * @throws {TypeError} when the value is not a positive finite number of seconds
 */
function asSeconds(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new TypeError(`${name} must be a number of seconds, zero or more`);
  }

  return value;
}

/**
 * Bring a model to life on a view.
 *
 * @param {object} options
 * @param {object} options.view a view from `createAtomView`
 * @param {{ number: (name: string) => number, colour: (name: string) => number[],
 *   list: (name: string) => number[] }} options.tokens the token layer, read once
 * @param {object} options.atom a model from `buildAtom`
 * @param {number} [options.speed] how many times faster than the token's own rate the electrons move
 * @returns {object} the scene
 * @throws {TypeError} when the speed is not a number of zero or more
 */
export function createAtomScene({ view, tokens, atom, speed = 1 }) {
  const nucleonRadius = tokens.number("--atom-nucleon-radius");
  const electronRadius = tokens.number("--atom-electron-radius");
  const electronGlow = tokens.number("--atom-electron-glow");
  const ring = {
    tube: tokens.number("--atom-orbit-tube"),
    segments: tokens.number("--atom-ring-segments"),
    tubeSegments: tokens.number("--atom-ring-tube-segments"),
    colour: tokens.colour("--atom-orbit"),
    opacity: tokens.number("--atom-orbit-opacity"),
  };
  const colours = {
    proton: tokens.colour("--atom-proton"),
    neutron: tokens.colour("--atom-neutron"),
    electron: tokens.colour("--atom-electron"),
  };
  const turn = {
    speed: tokens.number("--atom-spin"),
    axis: tokens.list("--atom-spin-axis"),
    shakeSpeed: tokens.number("--atom-shake-speed"),
    shakeDecay: tokens.number("--atom-shake-decay"),
  };
  const camera = createOrbitCamera({
    distance: tokens.number("--atom-camera-distance"),
    azimuth: tokens.number("--atom-camera-azimuth"),
    polar: tokens.number("--atom-camera-polar"),
    damping: tokens.number("--atom-camera-damping"),
    fieldOfView: (tokens.number("--atom-camera-fov") * Math.PI) / 180,
    near: tokens.number("--atom-camera-near"),
    far: tokens.number("--atom-camera-far"),
    minDistance: tokens.number("--atom-camera-min-distance"),
    maxDistance: tokens.number("--atom-camera-max-distance"),
    minPolar: tokens.number("--atom-camera-tilt-limit"),
    maxPolar: Math.PI - tokens.number("--atom-camera-tilt-limit"),
  });

  let model = atom;
  let rate = asSpeed(speed, "a speed");
  let particles = null;
  let rings = [];

  /** Seconds of orbiting the electrons have done: the scene's clock, not the wall's. */
  let orbited = 0;

  /** How far the whole atom has turned, and how much of that is the shake's to give back. */
  let angle = 0;
  let shaken = 0;

  /**
   * One sphere per particle: the nucleons from the model, then the electrons on their rings.
   *
   * The electrons are written at the offset the nucleons end at, so the list is one flat run of
   * particles and the layer's one instanced draw covers the whole atom.
   *
   * @param {object} next a model
   * @returns {object}
   */
  function particlesFor(next) {
    const count = next.particleCount;
    const positions = new Float32Array(count * 3);
    const radii = new Float32Array(count);
    const list = new Float32Array(count * 3);
    const glows = new Float32Array(count);

    positions.set(next.nucleons.positions, 0);

    for (let index = 0; index < next.nucleonCount; index += 1) {
      radii[index] = nucleonRadius;
      list.set(next.nucleons.kinds[index] === PROTON ? colours.proton : colours.neutron, index * 3);
    }

    for (let index = next.nucleonCount; index < count; index += 1) {
      radii[index] = electronRadius;
      list.set(colours.electron, index * 3);
      glows[index] = electronGlow;
    }

    placeElectrons(next, orbited, positions, next.nucleonCount * 3);

    return { count, positions, radii, colours: list, glows };
  }

  /**
   * One ring per shell, each at the shell's own radius.
   *
   * @param {object} next a model
   * @returns {object[]}
   */
  function ringsFor(next) {
    return next.shells.map((shell) => ({ radius: shell.radius, ...ring }));
  }

  /**
   * Put a new model on the layer, by path and by hand.
   *
   * Called when the reader changes the element or any of the three counts — and not once per frame,
   * because a mesh built inside a draw is a hitch at exactly the wrong moment. The reader's view is
   * deliberately left where it is: a new element should not move the camera.
   *
   * @param {object} next a model from `buildAtom`
   * @returns {void}
   */
  function setAtom(next) {
    model = next;
    particles = particlesFor(next);
    rings = ringsFor(next);
    view.setParticles(particles);
    view.setRings(rings);
  }

  setAtom(model);

  /**
   * Draw one frame and move the scene on by the time since the last one.
   *
   * @param {number} delta seconds since the previous frame
   * @returns {boolean} whether anything was drawn
   * @throws {TypeError} when the step is not a number of seconds
   */
  function step(delta) {
    const spent = asSeconds(delta, "a frame's step");

    orbited += spent * rate;
    shaken *= Math.exp(-turn.shakeDecay * spent);
    angle += (turn.speed + shaken) * spent;

    camera.update(spent);
    view.resize();
    placeElectrons(model, orbited, particles.positions, model.nucleonCount * 3);
    view.setParticles(particles);

    return view.draw({ model: rotationAbout(turn.axis, angle), camera });
  }

  return {
    step,

    /**
     * Change the element or any of the counts.
     *
     * @param {object} next a model from `buildAtom`
     * @returns {void}
     */
    setAtom,

    /**
     * How many times faster than the token's own rate the electrons move.
     *
     * The scene's own clock is what scales, not the model's, so a reader can move the slider at any
     * moment without the electrons jumping to a different place in their orbits.
     *
     * @param {number} multiplier
     * @returns {void}
     * @throws {TypeError} when the multiplier is not a number of zero or more
     */
    setSpeed(multiplier) {
      rate = asSpeed(multiplier, "a speed");
    },

    /**
     * Set the atom turning, as the reference's own shake does.
     *
     * A shake is a kick rather than a setting: it adds to whatever turning is left over, and the
     * exponential decay takes it back to the atom's own slow turn. Shaking twice kicks twice.
     *
     * @returns {void}
     */
    shake() {
      shaken += turn.shakeSpeed;
    },

    /** Aim the camera from a drag: radians to swing the aim by. */
    orbit: (movement) => camera.orbit(movement),

    /** Bring the camera in or push it out: a factor, greater than one to go further away. */
    zoom: (factor) => camera.zoom(factor),

    /** Aim the camera back where it started, which is the same ease rather than a jump. */
    resetView: () => camera.reset(),

    /** Run the frame loop, calling `step` with the time each frame carries. */
    start: () => view.start(step),

    /** Stop the loop; a stopped scene can be started again. */
    stop: () => view.stop(),

    /** Whether the loop is running. */
    running: () => view.running(),

    /** The model currently drawn. */
    atom: () => model,

    /** The scene's camera, for a caller that wants to read where it is looking. */
    camera: () => camera,
  };
}
