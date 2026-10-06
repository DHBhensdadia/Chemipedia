import { test } from "node:test";
import assert from "node:assert/strict";

import { createFrameLoop, LONGEST_STEP } from "../../scripts/components/frame-loop.js";

/**
 * A scheduler that runs a frame only when a test asks for one, so the loop's timing is the test's and
 * not the machine's.
 *
 * @returns {object}
 */
function createScheduler() {
  const waiting = new Map();
  let next = 1;

  return {
    /** How many frames have been asked for and not yet run. */
    pending: () => waiting.size,

    requestFrame(callback) {
      waiting.set(next, callback);
      next += 1;

      return next - 1;
    },

    cancelFrame(handle) {
      waiting.delete(handle);
    },

    /**
     * Run the frame that is waiting, if one is.
     *
     * @param {number} milliseconds the timestamp the browser would have supplied
     * @returns {boolean} whether a frame ran
     */
    frame(milliseconds) {
      const entry = [...waiting.entries()][0];

      if (!entry) {
        return false;
      }

      waiting.delete(entry[0]);
      entry[1](milliseconds);

      return true;
    },
  };
}

/**
 * The loop with a clock and a scheduler the test owns.
 *
 * @param {object} [options]
 * @param {boolean} [options.visible] whether the page is on screen
 * @param {number} [options.longestStep]
 * @returns {object}
 */
function createHarness({ visible = true, longestStep } = {}) {
  const scheduler = createScheduler();
  const deltas = [];
  let seconds = 0;

  const loop = createFrameLoop({
    longestStep,
    requestFrame: (callback) => scheduler.requestFrame(callback),
    cancelFrame: (handle) => scheduler.cancelFrame(handle),
    now: () => seconds,
    isVisible: () => visible,
  });

  return {
    loop,
    scheduler,
    deltas,

    /** Move the clock to this time and run the frame that is waiting for it. */
    advance(to) {
      seconds = to;

      return scheduler.frame(to * 1000);
    },

    start: () => loop.start((delta) => deltas.push(delta)),
  };
}

/** Three decimal places, which is all the arithmetic here is claimed to be exact to. */
const rounded = (values) => values.map((value) => Number(value.toFixed(3)));

test("a frame is stepped with the time since the last one", () => {
  const harness = createHarness();

  harness.start();
  harness.advance(0.02);
  harness.advance(0.05);

  assert.deepEqual(rounded(harness.deltas), [0.02, 0.03]);
});

test("the first frame is measured from the clock's reading when the loop started", () => {
  const harness = createHarness();

  assert.equal(harness.advance(5), false, "a loop that has not started has no frame to run");

  harness.start();
  harness.advance(5.02);

  // A minute of uptime before the loop began is not a frame's worth of elapsed time: the starting
  // point is the moment the loop was started, which is what the injected clock keeps track of.
  assert.deepEqual(rounded(harness.deltas), [0.02]);
});

test("a frame that arrives after a long pause carries no more than the clamp", () => {
  const harness = createHarness();

  harness.start();
  harness.advance(60);

  assert.deepEqual(harness.deltas, [LONGEST_STEP]);
});

test("a scene may set its own clamp, and it must be a positive number", () => {
  const harness = createHarness({ longestStep: 0.5 });

  harness.start();
  harness.advance(60);

  assert.deepEqual(harness.deltas, [0.5]);

  assert.throws(() => createFrameLoop({ longestStep: 0 }), /greater than zero/);
  assert.throws(() => createFrameLoop({ longestStep: -1 }), /greater than zero/);
  assert.throws(() => createFrameLoop({ longestStep: "fast" }), /finite number/);
});

test("time that runs backwards is not handed to the scene as negative time", () => {
  const harness = createHarness();

  harness.start();
  harness.advance(0.02);
  harness.advance(0.01);

  assert.deepEqual(rounded(harness.deltas), [0.02, 0]);
});

test("a frame with no usable timestamp repeats where the clock already was", () => {
  const harness = createHarness();

  harness.start();
  harness.advance(0.02);
  harness.scheduler.frame(Number.NaN);

  assert.deepEqual(rounded(harness.deltas), [0.02, 0]);
});

test("a page that is not being looked at keeps its place in the queue and is not stepped", () => {
  const harness = createHarness({ visible: false });

  harness.start();
  harness.advance(0.02);

  assert.deepEqual(harness.deltas, [], "a hidden page should not have been stepped");
  assert.equal(harness.loop.running(), true, "a hidden page should still be asking for frames");
  assert.equal(harness.scheduler.pending(), 1);
});

test("a step that stops the loop is the last one to be called", () => {
  const harness = createHarness();
  let calls = 0;

  harness.loop.start(() => {
    calls += 1;
    harness.loop.stop();
  });
  harness.advance(0.02);

  assert.equal(calls, 1);
  assert.equal(harness.loop.running(), false);
  assert.equal(harness.scheduler.pending(), 0, "a stopped loop should have cancelled its frame");
});

test("a step that starts a new step leaves exactly one loop running", () => {
  const harness = createHarness();
  const second = () => {};

  harness.loop.start(() => harness.loop.start(second));
  harness.advance(0.02);

  assert.equal(harness.scheduler.pending(), 1, "two loops would ask for two frames a turn");
  assert.equal(harness.loop.running(), true);
});

test("starting a loop twice replaces the step rather than doubling the frames", () => {
  const harness = createHarness();
  const first = [];

  harness.loop.start((delta) => first.push(delta));
  harness.loop.start(() => {});
  harness.advance(0.02);

  assert.deepEqual(first, [], "the replaced step should not still be called");
  assert.equal(harness.scheduler.pending(), 1);
});

test("the loop refuses to start without a step, and waits without one", () => {
  const loop = createFrameLoop();

  assert.equal(loop.running(), false);
  assert.throws(() => loop.start(), /step function/);
  assert.throws(() => loop.start(42), /step function/);
  assert.throws(() => loop.start(null), /step function/);
});

test("stopping a loop that never started is not an error", () => {
  const loop = createFrameLoop();

  loop.stop();
  loop.stop();

  assert.equal(loop.running(), false);
});
