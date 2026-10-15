import { test } from "node:test";
import assert from "node:assert/strict";

import {
  ARRIVED,
  DEFAULT_DAMPING,
  approach,
  createPointerLight,
  startPointerLight,
  wantsLight,
} from "../../scripts/components/pointer-light.js";

/** A media query the test owns: it answers, it changes, and it says who is listening. */
function createMedia(matches) {
  const listeners = new Set();

  return {
    matches,
    addEventListener: (type, listener) => listeners.add(listener),
    removeEventListener: (type, listener) => listeners.delete(listener),
    set(next) {
      this.matches = next;

      for (const listener of [...listeners]) {
        listener({ matches: next });
      }
    },
    listeners: () => listeners.size,
  };
}

/**
 * The light with a window, a root and a frame loop the test owns.
 *
 * @param {{ fine?: boolean, reduce?: boolean, damping?: number }} [options]
 */
function createHarness({ fine = true, reduce = false, damping = 8 } = {}) {
  const media = {
    "(pointer: fine)": createMedia(fine),
    "(prefers-reduced-motion: reduce)": createMedia(reduce),
  };
  const rootListeners = new Map();
  const props = new Map();

  let step = null;
  let running = false;

  const root = {
    style: {
      setProperty: (name, value) => props.set(name, value),
      removeProperty: (name) => props.delete(name),
    },
    addEventListener(type, listener) {
      const set = rootListeners.get(type) ?? new Set();

      set.add(listener);
      rootListeners.set(type, set);
    },
    removeEventListener(type, listener) {
      rootListeners.get(type)?.delete(listener);
    },
  };

  const loop = {
    start(next) {
      step = next;
      running = true;
    },
    stop() {
      running = false;
      step = null;
    },
    running: () => running,
  };

  const light = createPointerLight({
    window: { matchMedia: (query) => media[query] },
    root,
    damping,
    createLoop: () => loop,
  });

  function fire(type, event) {
    for (const listener of [...(rootListeners.get(type) ?? [])]) {
      listener(event);
    }
  }

  return {
    light,
    media,
    props,
    listeners: (type) => rootListeners.get(type)?.size ?? 0,
    running: () => running,

    move: (x, y, pointerType = "mouse") => fire("pointermove", { clientX: x, clientY: y, pointerType }),
    leave: () => fire("pointerleave", {}),

    frame(delta = 1 / 60) {
      if (!running) {
        return false;
      }

      step(delta);

      return true;
    },

    /** Run frames until the light arrives, for whatever it was last asked to do. */
    settle(max = 600) {
      for (let i = 0; i < max && running; i += 1) {
        this.frame();
      }
    },
  };
}

test("the easing is frame-rate-independent: two small steps equal one big one", () => {
  const once = approach(0, 100, 8, 0.016);
  const twice = approach(approach(0, 100, 8, 0.008), 100, 8, 0.008);

  assert.ok(Math.abs(once - twice) < 1e-9, `${once} and ${twice} should agree`);
});

test("the damping must be a finite number greater than zero", () => {
  const window = { matchMedia: () => createMedia(false) };
  const root = { style: {}, addEventListener: () => {}, removeEventListener: () => {} };

  assert.throws(
    () => createPointerLight({ window, root, damping: 0 }),
    /greater than zero/,
  );
  assert.throws(
    () => createPointerLight({ window, root, damping: -1 }),
    /greater than zero/,
  );
  assert.throws(
    () => createPointerLight({ window, root, damping: Number.NaN }),
    /finite number/,
  );
});

test("the light wants a fine pointer and no reduced-motion preference", () => {
  const win = (fine, reduce) => ({
    matchMedia: (query) =>
      createMedia(query === "(pointer: fine)" ? fine : reduce),
  });

  assert.equal(wantsLight(win(true, false)), true);
  assert.equal(wantsLight(win(true, true)), false, "reduced motion rules the light out");
  assert.equal(wantsLight(win(false, false)), false, "a coarse pointer has nothing to follow");
  assert.equal(wantsLight(win(false, true)), false);
});

test("nothing is written and no frame is asked for before the pointer moves", () => {
  const harness = createHarness();

  assert.equal(harness.props.size, 0);
  assert.equal(harness.running(), false);
});

test("the light follows the pointer, arrives exactly, and then stops", () => {
  const harness = createHarness();

  harness.move(400, 300);
  assert.equal(harness.running(), true, "a move should wake the loop");

  let frames = 0;

  while (harness.running()) {
    harness.frame();
    frames += 1;
  }

  assert.equal(harness.props.get("--pointer-light-x"), "400.0px");
  assert.equal(harness.props.get("--pointer-light-y"), "300.0px");
  assert.equal(harness.props.get("--pointer-light-live"), "1.000");
  assert.ok(frames > 1, "the light should have taken more than one frame to arrive");
  assert.equal(harness.running(), false, "the loop should have stopped once arrived");
});

test("the light eases towards the pointer rather than jumping to it", () => {
  const harness = createHarness();

  harness.move(400, 300);
  harness.settle();

  harness.move(600, 300);
  harness.frame();

  const between = Number.parseFloat(harness.props.get("--pointer-light-x"));

  assert.ok(between > 400 && between < 600, `${between} should lie between the two positions`);
});

test("a touch does not drive the light, even where one is live", () => {
  const harness = createHarness();

  harness.move(100, 100, "touch");

  assert.equal(harness.running(), false);
  assert.equal(harness.props.size, 0);
});

test("leaving the window fades the light where it was rather than freezing it bright", () => {
  const harness = createHarness();

  harness.move(400, 300);
  harness.settle();
  harness.leave();
  harness.settle();

  assert.equal(harness.props.get("--pointer-light-live"), "0.000");
  assert.equal(harness.props.get("--pointer-light-x"), "400.0px", "the light should not move while it fades");
  assert.equal(harness.running(), false);
});

test("a reduced-motion preference turned on takes the light away, and off brings it back", () => {
  const harness = createHarness();

  harness.move(400, 300);
  harness.settle();
  harness.media["(prefers-reduced-motion: reduce)"].set(true);

  assert.equal(harness.props.size, 0, "the written properties should be gone");
  assert.equal(harness.running(), false, "the loop should be stopped");
  assert.equal(harness.listeners("pointermove"), 0, "the pointer should no longer be followed");

  harness.media["(prefers-reduced-motion: reduce)"].set(false);
  harness.move(420, 320);

  assert.equal(harness.running(), true, "the light should be back");

  harness.settle();

  assert.equal(harness.props.get("--pointer-light-live"), "1.000");
});

test("no fine pointer means no light at all, and no pointer listener", () => {
  const harness = createHarness({ fine: false });

  harness.move(400, 300);

  assert.equal(harness.running(), false);
  assert.equal(harness.props.size, 0);
  assert.equal(harness.listeners("pointermove"), 0);
  assert.equal(harness.listeners("pointerleave"), 0);
});

test("a coarse pointer later turned fine is followed, and a fine one later turned coarse is not", () => {
  const harness = createHarness({ fine: false });

  harness.move(400, 300);
  assert.equal(harness.listeners("pointermove"), 0);

  harness.media["(pointer: fine)"].set(true);
  harness.move(500, 400);
  harness.settle();

  assert.equal(harness.props.get("--pointer-light-x"), "500.0px");
  assert.equal(harness.listeners("pointermove"), 1);

  harness.media["(pointer: fine)"].set(false);

  assert.equal(harness.props.size, 0, "losing the fine pointer loses the light");
});

test("re-enabling does not sweep the light in from the origin", () => {
  const harness = createHarness();

  harness.move(400, 300);
  harness.settle();
  harness.media["(prefers-reduced-motion: reduce)"].set(true);
  harness.media["(prefers-reduced-motion: reduce)"].set(false);
  harness.move(420, 300);
  harness.frame();

  const x = Number.parseFloat(harness.props.get("--pointer-light-x"));

  assert.ok(x >= 400 && x < 420, `the light should ease from where it was, not from zero (${x})`);
  assert.equal(harness.listeners("pointermove"), 1);
});

test("stop() lets go of the listeners, the loop and the light", () => {
  const harness = createHarness();

  harness.move(400, 300);
  harness.settle();
  harness.light.stop();

  assert.equal(harness.props.size, 0);
  assert.equal(harness.running(), false);
  assert.equal(harness.listeners("pointermove"), 0);

  harness.move(100, 100);

  assert.equal(harness.running(), false, "a stopped light should not answer");
});

test("startPointerLight reads the damping from the token layer", () => {
  const media = {
    "(pointer: fine)": createMedia(true),
    "(prefers-reduced-motion: reduce)": createMedia(false),
  };
  const rootListeners = new Map();
  const props = new Map();
  let step = null;
  let running = false;

  const documentElement = {
    style: {
      setProperty: (name, value) => props.set(name, value),
      removeProperty: (name) => props.delete(name),
    },
    addEventListener(type, listener) {
      const set = rootListeners.get(type) ?? new Set();

      set.add(listener);
      rootListeners.set(type, set);
    },
    removeEventListener(type, listener) {
      rootListeners.get(type)?.delete(listener);
    },
  };
  const loop = {
    start(next) {
      step = next;
      running = true;
    },
    stop() {
      running = false;
      step = null;
    },
    running: () => running,
  };
  const win = {
    matchMedia: (query) => media[query],
    getComputedStyle: () => ({ getPropertyValue: () => " 4 " }),
  };

  const light = startPointerLight({ document: { documentElement }, window: win, createLoop: () => loop });

  for (const listener of [...(rootListeners.get("pointermove") ?? [])]) {
    listener({ clientX: 100, clientY: 0, pointerType: "mouse" });
  }

  step(1 / 60);

  // The declared token is 4, not the fallback 8: one sixtieth of a second of
  // the ease covers 1 - e^(-4/60) of the way to a point 100px away — 6.4px at
  // one decimal, where the default rate would have covered 12.5px.
  assert.equal(props.get("--pointer-light-x"), "6.4px");

  light.stop();
});

test("startPointerLight falls back to the documented damping when the token is missing", () => {
  const media = {
    "(pointer: fine)": createMedia(true),
    "(prefers-reduced-motion: reduce)": createMedia(false),
  };
  const rootListeners = new Map();
  const props = new Map();
  let step = null;

  const documentElement = {
    style: {
      setProperty: (name, value) => props.set(name, value),
      removeProperty: (name) => props.delete(name),
    },
    addEventListener(type, listener) {
      const set = rootListeners.get(type) ?? new Set();

      set.add(listener);
      rootListeners.set(type, set);
    },
    removeEventListener(type, listener) {
      rootListeners.get(type)?.delete(listener);
    },
  };
  const win = {
    matchMedia: (query) => media[query],
    getComputedStyle: () => ({ getPropertyValue: () => "" }),
  };

  const light = startPointerLight({
    document: { documentElement },
    window: win,
    createLoop: () => ({
      start: (next) => {
        step = next;
      },
      stop: () => {},
      running: () => false,
    }),
  });

  for (const listener of [...(rootListeners.get("pointermove") ?? [])]) {
    listener({ clientX: 100, clientY: 0, pointerType: "mouse" });
  }

  step(1 / 60);

  assert.equal(props.get("--pointer-light-x"), "12.5px", "the fallback should have covered 1 - e^(-8/60)");

  light.stop();
});

test("the arrived threshold is small and positive in both measures", () => {
  assert.ok(ARRIVED.position > 0 && ARRIVED.position <= 0.5);
  assert.ok(ARRIVED.presence > 0 && ARRIVED.presence <= 0.01);
});
