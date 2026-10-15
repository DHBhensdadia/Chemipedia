import { test } from "node:test";
import assert from "node:assert/strict";

import {
  FROSTED,
  createMastheadFrost,
  needsFallback,
  startMastheadFrost,
} from "../../scripts/components/masthead-frost.js";

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
  };
}

/**
 * The frost with a window and a masthead the test owns.
 *
 * @param {{ timelines?: boolean, reduce?: boolean, scrollY?: number, masthead?: boolean }} [options]
 */
function createHarness({ timelines = true, reduce = false, scrollY = 0, masthead = true } = {}) {
  const stillness = createMedia(reduce);
  const listeners = new Map();
  const classes = new Set();

  const win = {
    CSS: { supports: () => timelines },
    matchMedia: (query) => (query === "(prefers-reduced-motion: reduce)" ? stillness : createMedia(false)),
    addEventListener(type, listener) {
      const set = listeners.get(type) ?? new Set();

      set.add(listener);
      listeners.set(type, set);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    scrollY,
  };

  const element = masthead
    ? {
        classList: {
          toggle: (name, force) => (force ? classes.add(name) : classes.delete(name)),
          remove: (name) => classes.delete(name),
          contains: (name) => classes.has(name),
        },
      }
    : null;

  const frost = createMastheadFrost({ window: win, masthead: element });

  /** Scroll the page and tell whoever is listening. */
  function scrollTo(next) {
    win.scrollY = next;

    for (const listener of [...(listeners.get("scroll") ?? [])]) {
      listener({});
    }
  }

  return {
    frost,
    win,
    stillness,
    scrollTo,
    classes,
    listenerCount: (type) => listeners.get(type)?.size ?? 0,
  };
}

test("the fallback answers exactly what the stylesheet's gate does not cover", () => {
  const win = (timelines, reduce) => ({
    CSS: { supports: () => timelines },
    matchMedia: () => createMedia(reduce),
  });

  assert.equal(needsFallback(win(true, false)), false, "the timeline runs and motion is welcome");
  assert.equal(needsFallback(win(false, false)), true, "no scroll timelines");
  assert.equal(needsFallback(win(true, true)), true, "a reduced-motion reader is outside the gate");
  assert.equal(needsFallback(win(false, true)), true);
});

test("no CSS.supports at all is no scroll timelines", () => {
  const win = { matchMedia: () => createMedia(false) };

  assert.equal(needsFallback(win), true);
});

test("where the timeline runs, the module does nothing: no listener, no class", () => {
  const harness = createHarness({ timelines: true });

  harness.scrollTo(400);

  assert.equal(harness.listenerCount("scroll"), 0);
  assert.equal(harness.classes.size, 0);
});

test("the fallback frosts once the page has scrolled and reverts at the top", () => {
  const harness = createHarness({ timelines: false });

  assert.equal(harness.classes.has(FROSTED), false, "a page at its top is not frosted");

  harness.scrollTo(120);
  assert.equal(harness.classes.has(FROSTED), true);

  harness.scrollTo(0);
  assert.equal(harness.classes.has(FROSTED), false, "back at the top the frost reverts");
});

test("a page restored mid-scroll is frosted from the first answer", () => {
  const harness = createHarness({ timelines: false, scrollY: 900 });

  assert.equal(harness.classes.has(FROSTED), true);
});

test("a reduced-motion preference turned on hands the frost over immediately", () => {
  const harness = createHarness({ timelines: true });

  harness.scrollTo(300);
  assert.equal(harness.classes.size, 0, "the timeline was in charge and keeps the class off");

  harness.stillness.set(true);

  assert.equal(harness.classes.has(FROSTED), true, "the same scroll position, now frosted by class");
  assert.equal(harness.listenerCount("scroll"), 1);

  harness.stillness.set(false);

  assert.equal(harness.classes.has(FROSTED), false, "the timeline takes the frost back");
  assert.equal(harness.listenerCount("scroll"), 0);
});

test("a reduced-motion reader who is already scrolled gets the frost at start", () => {
  const harness = createHarness({ timelines: true, reduce: true, scrollY: 200 });

  assert.equal(harness.classes.has(FROSTED), true);
  assert.equal(harness.listenerCount("scroll"), 1);
});

test("a page with no masthead is left alone", () => {
  const harness = createHarness({ timelines: false, masthead: false });

  assert.equal(typeof harness.frost.stop, "function");
  harness.frost.stop();
});

test("stop() lets go of the listeners and the class", () => {
  const harness = createHarness({ timelines: false, scrollY: 300 });

  assert.equal(harness.classes.has(FROSTED), true);

  harness.frost.stop();

  assert.equal(harness.classes.has(FROSTED), false);
  assert.equal(harness.listenerCount("scroll"), 0);

  harness.scrollTo(500);

  assert.equal(harness.classes.has(FROSTED), false, "a stopped module should not answer");
});

test("startMastheadFrost takes the masthead the document has, or none", () => {
  const classes = new Set();
  const win = {
    CSS: { supports: () => false },
    matchMedia: () => createMedia(false),
    addEventListener: () => {},
    removeEventListener: () => {},
    scrollY: 50,
  };
  const document = {
    querySelector: (selector) => {
      assert.equal(selector, ".masthead");

      return {
        classList: {
          toggle: (name, force) => (force ? classes.add(name) : classes.delete(name)),
          remove: (name) => classes.delete(name),
        },
      };
    },
  };

  const frost = startMastheadFrost({ document, window: win });

  assert.equal(classes.has(FROSTED), true);
  frost.stop();
  assert.equal(classes.has(FROSTED), false);

  const none = startMastheadFrost({ document: { querySelector: () => null }, window: win });

  assert.equal(typeof none.stop, "function");
});
