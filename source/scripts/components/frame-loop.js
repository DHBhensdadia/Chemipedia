/**
 * The frame loop: how a viewer gets called once per frame, and how it stops being called.
 *
 * A `requestAnimationFrame` loop looks like three lines and is not. The time since the last frame has
 * to be **clamped**, because a tab the reader left in the background for a minute hands the next frame
 * a minute-long step and the scene jumps instead of easing. A frame that arrives while the page is
 * hidden has to be **skipped**, because nothing is being looked at and the work would be paid for
 * nothing. And a step that stops the loop — a pause button, a reduced-motion preference — has to take
 * effect on the frame it was asked on, not the one after it.
 *
 * The clock, the scheduler and the visibility rule are injectable, and their defaults are the
 * browser's own. That is what lets all three behaviours above be held still in Node: no canvas, no
 * window, no graphics card.
 *
 * Nothing here has an opinion about what a frame contains. It hands out a number and asks for the next
 * turn.
 */

/** A frame that arrives after a pause is worth this many seconds at most. */
export const LONGEST_STEP = 0.1;

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
 * A loop that calls a step with the time since the previous frame.
 *
 * @param {object} [options]
 * @param {number} [options.longestStep] the most time one frame may carry, in seconds
 * @param {(callback: (time: number) => void) => number} [options.requestFrame]
 * @param {(handle: number) => void} [options.cancelFrame]
 * @param {() => number} [options.now] a monotonic clock in seconds
 * @param {() => boolean} [options.isVisible] whether the page is on screen and awake
 * @returns {object} the loop
 * @throws {TypeError} when the clamp is not a positive number
 */
export function createFrameLoop({
  longestStep = LONGEST_STEP,
  requestFrame = (callback) => window.requestAnimationFrame(callback),
  cancelFrame = (handle) => window.cancelAnimationFrame(handle),
  now = () => performance.now() / 1000,
  isVisible = () => document.visibilityState === "visible",
} = {}) {
  const clamp = asNumber(longestStep, "longestStep");

  if (clamp <= 0) {
    throw new TypeError("longestStep must be greater than zero, or no frame could move anything");
  }

  let handle = 0;
  let step = null;
  let last = 0;

  /** Stop asking for frames. A stopped loop can be started again. */
  function stop() {
    if (handle) {
      cancelFrame(handle);
      handle = 0;
    }

    step = null;
  }

  /**
   * One turn: work out how much time passed, step the scene, ask for another frame.
   *
   * @param {number} time the scheduler's own timestamp for this frame, in milliseconds
   */
  function tick(time) {
    handle = 0;

    const seconds = Number.isFinite(time) ? time / 1000 : last;
    const delta = Math.min(Math.max(seconds - last, 0), clamp);
    const wanted = step;

    last = seconds;

    if (isVisible()) {
      wanted(delta);
    }

    // What runs next is whatever is current *now*, not what was current when the frame began: a step
    // that stopped the loop or replaced it has already said what it wants, and asking for a frame on
    // top of that would leave two loops running or none.
    if (step === wanted) {
      handle = requestFrame(tick);
    }
  }

  return {
    /**
     * Begin calling a step every frame, from the clock's current reading.
     *
     * @param {(deltaSeconds: number) => void} onFrame
     * @returns {void}
     * @throws {TypeError} when the step is not a function
     */
    start(onFrame) {
      if (typeof onFrame !== "function") {
        throw new TypeError("the loop needs a step function");
      }

      stop();
      step = onFrame;
      last = now();
      handle = requestFrame(tick);
    },

    /** Stop, which also clears the step. */
    stop,

    /** Whether frames are being asked for. */
    running: () => Boolean(step),
  };
}
