/**
 * The camera: where it is, what it looks at, and how it gets there.
 *
 * The viewer's camera does one thing — it stands on a sphere around a point and looks at it — and it
 * never moves instantly. A drag swings the aim, a wheel changes the distance, and the view then
 * *travels* toward what was asked for, which is the difference between a scene that feels handled and
 * one that jerks. Both halves are arithmetic, so both live here: no DOM, no canvas, no WebGL, and
 * therefore no browser needed to hold the camera's behaviour still.
 *
 * The state is spherical rather than a matrix: a distance, an azimuth around the up axis and a polar
 * angle down from it. That is the shape of the movement a reader makes — swing and zoom — and it
 * means the pole is a place the limits can refuse rather than a place the view flips over. Azimuth is
 * deliberately **not** wrapped: wrapping would fight the damping, and `sin` and `cos` do not care how
 * many turns a reader has spun.
 *
 * Nothing here has a default that is a design decision. The distance, the angles, the field of view,
 * the clip planes, the damping and the limits all arrive from the scene, which reads them from the
 * token layer; a camera carrying its own idea of how fast to move would be a second place to change.
 */

import { lookAt, perspective, transformPoint } from "./matrix4.js";

/** Up is the y axis, which is the convention every part of this viewer is built on. */
const UP = [0, 1, 0];

/** How close two numbers have to be to count as the same place. Structure, not a design decision. */
const SETTLED = 1e-6;

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
 * @param {number} value
 * @param {number} low
 * @param {number} high
 * @returns {number}
 */
function clamp(value, low, high) {
  return Math.min(high, Math.max(low, value));
}

/**
 * A camera that orbits a point and eases toward wherever it has been asked to go.
 *
 * @param {object} configuration every value is the scene's to decide, read from the token layer
 * @param {number} configuration.distance how far from the target it opens
 * @param {number} configuration.azimuth the angle around the up axis it opens at, in radians
 * @param {number} configuration.polar the angle down from the up axis it opens at, in radians
 * @param {number} configuration.damping how quickly it reaches its aim: larger is quicker, per second
 * @param {number} configuration.fieldOfView the vertical field of view, in radians
 * @param {number} configuration.near the nearest plane drawn
 * @param {number} configuration.far the furthest plane drawn
 * @param {number} configuration.minDistance the closest it may come to the target
 * @param {number} configuration.maxDistance the furthest it may go
 * @param {number} configuration.minPolar the highest it may look from, above the equator
 * @param {number} configuration.maxPolar the lowest
 * @param {number[]} [configuration.target] the point it looks at; the origin by default
 * @returns {object} the camera
 * @throws {TypeError} when a value is not usable, or the opening view is outside its own limits
 */
export function createOrbitCamera({
  distance,
  azimuth,
  polar,
  damping,
  fieldOfView,
  near,
  far,
  minDistance,
  maxDistance,
  minPolar,
  maxPolar,
  target = [0, 0, 0],
}) {
  const opening = {
    distance: asNumber(distance, "distance"),
    azimuth: asNumber(azimuth, "azimuth"),
    polar: asNumber(polar, "polar"),
  };

  const rate = asNumber(damping, "damping");
  const fov = asNumber(fieldOfView, "fieldOfView");
  const nearPlane = asNumber(near, "near");
  const farPlane = asNumber(far, "far");
  if (!Array.isArray(target) || target.length !== 3 || !target.every(Number.isFinite)) {
    throw new TypeError("target must be three finite numbers");
  }

  const focus = [...target];

  if (rate <= 0) {
    throw new TypeError("damping must be greater than zero, or the camera would never arrive");
  }

  if (minDistance <= 0) {
    throw new TypeError("minDistance must be greater than zero, so the camera cannot enter the target");
  }

  if (maxDistance <= minDistance) {
    throw new TypeError("maxDistance must be beyond minDistance");
  }

  if (minPolar <= 0 || maxPolar >= Math.PI || minPolar >= maxPolar) {
    throw new TypeError("the polar limits must sit strictly inside the poles, above and below");
  }

  if (opening.distance < minDistance || opening.distance > maxDistance) {
    throw new TypeError("the camera opens outside its own distance limits");
  }

  if (opening.polar < minPolar || opening.polar > maxPolar) {
    throw new TypeError("the camera opens outside its own polar limits");
  }

  /** What the camera is *aiming* at. Every interaction moves this, and nothing else moves. */
  const aim = { ...opening };

  /** Where it actually is, which eases toward the aim and is what a frame is drawn from. */
  const current = { ...opening };

  /**
   * The eye: the spherical position as a point, with the up axis as y.
   *
   * @returns {number[]}
   */
  function eyePosition() {
    const horizontal = Math.sin(current.polar) * current.distance;

    return [
      focus[0] + horizontal * Math.sin(current.azimuth),
      focus[1] + Math.cos(current.polar) * current.distance,
      focus[2] + horizontal * Math.cos(current.azimuth),
    ];
  }

  /** @returns {number[]} the view matrix for where the camera is right now */
  function view() {
    return lookAt(eyePosition(), focus, UP);
  }

  return {
    /** Where the camera is now. */
    state: () => ({ ...current, target: [...focus] }),

    /** Where it has been asked to go, which is what the damping is closing on. */
    aim: () => ({ ...aim, target: [...focus] }),

    /** The eye itself, for a caller that needs to place something relative to it. */
    position: eyePosition,

    /**
     * Swing the aim, as a drag does.
     *
     * @param {{ azimuth?: number, polar?: number }} [delta] radians to add to each angle
     * @returns {void}
     * @throws {TypeError} when a delta is not a finite number
     */
    orbit({ azimuth: turn = 0, polar: tilt = 0 } = {}) {
      aim.azimuth += asNumber(turn, "azimuth");
      aim.polar = clamp(aim.polar + asNumber(tilt, "polar"), minPolar, maxPolar);
    },

    /**
     * Move closer or further, as a wheel does.
     *
     * The step is multiplicative because that is what feels even: one notch takes the same
     * proportion off whatever the distance is, so the last stretch in is as controllable as the first.
     *
     * @param {number} factor how much of the distance to keep: below one comes closer
     * @returns {void}
     * @throws {TypeError} when the factor is not a positive number
     */
    zoom(factor) {
      const keep = asNumber(factor, "factor");

      if (keep <= 0) {
        throw new TypeError("a zoom factor must be greater than zero");
      }

      aim.distance = clamp(aim.distance * keep, minDistance, maxDistance);
    },

    /** Aim back at the opening view; the damping brings the camera home the way it moves anywhere. */
    reset() {
      aim.distance = opening.distance;
      aim.azimuth = opening.azimuth;
      aim.polar = opening.polar;
    },

    /**
     * Let time pass, which is the only thing that moves the camera.
     *
     * @param {number} deltaSeconds how much time, in seconds
     * @returns {boolean} whether the camera moved, so a still scene can skip a frame
     * @throws {TypeError} when the time is negative
     */
    update(deltaSeconds) {
      const delta = asNumber(deltaSeconds, "deltaSeconds");

      if (delta < 0) {
        throw new TypeError("time does not run backwards");
      }

      // A frame-rate-independent approach: the same damping covers the same proportion of the
      // remaining distance in the same wall-clock time, whether that arrived as one long frame or
      // sixty short ones. Without this the feel of the camera would depend on the machine.
      const approach = 1 - Math.exp(-rate * delta);
      let moved = false;

      for (const key of ["distance", "azimuth", "polar"]) {
        const difference = aim[key] - current[key];

        if (Math.abs(difference) <= SETTLED) {
          current[key] = aim[key];

          continue;
        }

        current[key] += difference * approach;
        moved = true;
      }

      return moved;
    },

    /** The view matrix: what turns the scene into what the camera sees. */
    viewMatrix: view,

    /**
     * The projection this camera sees through, for a canvas of a given shape.
     *
     * @param {number} aspect width divided by height
     * @returns {number[]}
     * @throws {TypeError} when the aspect is not a positive number
     */
    projectionMatrix(aspect) {
      const ratio = asNumber(aspect, "aspect");

      if (ratio <= 0) {
        throw new TypeError("the aspect must be greater than zero");
      }

      return perspective(fov, ratio, nearPlane, farPlane);
    },

    /**
     * Where a point in the scene lands in the camera's own space.
     *
     * Not on the drawing path — the graphics card does that — but it is how a test says "the camera
     * is looking at the target" in one line, and how a caller places something relative to the view.
     *
     * @param {number[]} point
     * @returns {number[]}
     */
    toCameraSpace: (point) => transformPoint(view(), point),
  };
}
