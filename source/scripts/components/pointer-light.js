/**
 * The pointer light.
 *
 * A soft white light that follows the pointer across the field. It is the one
 * piece of the living paper written in script, and it is deliberately the
 * least of it: the light is one more background layer on the field's near
 * sheet — `body::before` in atmosphere.css, tokens §23 — and this module
 * writes exactly three custom properties: where the light is in the viewport,
 * and how present it is.
 *
 * Three rules decide everything else. It is white-based, so it can only
 * raise the field's luminance and spends nothing of the contrast budget
 * (docs/research/06 §6). It is fine pointers only and absent under a
 * reduced-motion preference, because it is motion. And it eases with the
 * orbit camera's own frame-rate-independent damping — the `1 - e^(-rate·dt)`
 * shape — so a fast flick and a slow drift both land smoothly.
 *
 * At rest it does nothing at all: the frame loop stops the moment the light
 * has arrived, so a page nobody is pointing at runs no frames and writes no
 * styles. Both of the environment's answers are read at start and watched
 * afterwards, so a reader who turns reduced motion on, or unplugs the mouse,
 * loses the light the moment the platform says so — and gets it back when
 * the platform says that too.
 */

import { createFrameLoop } from "./frame-loop.js";

/** How close counts as arrived: pixels for the position, presence on the 0–1 scale. */
export const ARRIVED = { position: 0.1, presence: 0.005 };

/** The damping that stands in if the token layer cannot be read. */
export const DEFAULT_DAMPING = 8;

/**
 * The fraction of the distance from `current` to `target` covered in `delta`
 * seconds at `rate` per second — the frame-rate-independent form of easing,
 * the same shape the orbit camera uses (§21's `--atom-camera-damping`).
 *
 * @param {number} current
 * @param {number} target
 * @param {number} rate how quickly the gap closes, per second
 * @param {number} delta seconds since the previous frame
 * @returns {number}
 */
export function approach(current, target, rate, delta) {
  return current + (target - current) * (1 - Math.exp(-rate * delta));
}

/**
 * Whether this environment gets a light at all: a fine pointer to follow and
 * no reduced-motion preference to honour.
 *
 * @param {Window} win
 * @returns {boolean}
 */
export function wantsLight(win) {
  return (
    win.matchMedia("(pointer: fine)").matches &&
    !win.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * The light, live on a page.
 *
 * @param {object} options
 * @param {Window} options.window
 * @param {HTMLElement} options.root the element the properties are written to — the root element
 * @param {number} [options.damping]
 * @param {() => object} [options.createLoop]
 * @returns {{ stop: () => void }}
 */
export function createPointerLight({
  window: win,
  root,
  damping = DEFAULT_DAMPING,
  createLoop = createFrameLoop,
}) {
  if (!Number.isFinite(damping) || damping <= 0) {
    throw new Error("The pointer light's damping must be a finite number greater than zero");
  }

  const loop = createLoop();
  const fine = win.matchMedia("(pointer: fine)");
  const stillness = win.matchMedia("(prefers-reduced-motion: reduce)");
  const at = { x: 0, y: 0, live: 0 };
  const to = { x: 0, y: 0, live: 0 };
  let attached = false;

  const write = () => {
    root.style.setProperty("--pointer-light-x", `${at.x.toFixed(1)}px`);
    root.style.setProperty("--pointer-light-y", `${at.y.toFixed(1)}px`);
    root.style.setProperty("--pointer-light-live", at.live.toFixed(3));
  };

  const clear = () => {
    root.style.removeProperty("--pointer-light-x");
    root.style.removeProperty("--pointer-light-y");
    root.style.removeProperty("--pointer-light-live");
  };

  /** One frame: ease towards what was asked, write it, and stop once arrived. */
  function step(delta) {
    at.x = approach(at.x, to.x, damping, delta);
    at.y = approach(at.y, to.y, damping, delta);
    at.live = approach(at.live, to.live, damping, delta);

    const arrived =
      Math.abs(at.x - to.x) < ARRIVED.position &&
      Math.abs(at.y - to.y) < ARRIVED.position &&
      Math.abs(at.live - to.live) < ARRIVED.presence;

    if (arrived) {
      at.x = to.x;
      at.y = to.y;
      at.live = to.live;
    }

    write();

    if (arrived) {
      loop.stop();
    }
  }

  function wake() {
    if (!loop.running()) {
      loop.start(step);
    }
  }

  function onPointerMove(event) {
    // A touch is not a pointer this light follows, even on a machine whose
    // primary pointer is fine. A pen is: it is a fine pointer like the mouse.
    if (event.pointerType === "touch") {
      return;
    }

    to.x = event.clientX;
    to.y = event.clientY;
    to.live = 1;
    wake();
  }

  /** The pointer left the window: the light fades where it was rather than freezing bright. */
  function onPointerLeave() {
    to.live = 0;
    wake();
  }

  /** Keep the listeners and the light itself answering to the environment as it changes. */
  function sync() {
    const should = wantsLight(win);

    if (should !== attached) {
      attached = should;

      for (const [type, listener] of [
        ["pointermove", onPointerMove],
        ["pointerleave", onPointerLeave],
      ]) {
        if (should) {
          root.addEventListener(type, listener);
        } else {
          root.removeEventListener(type, listener);
        }
      }
    }

    if (!should) {
      loop.stop();
      clear();

      // The position is kept, so re-enabling does not sweep the light in from
      // a corner; the presence is not, so it fades in where it left from.
      at.live = 0;
      to.live = 0;
    }
  }

  fine.addEventListener("change", sync);
  stillness.addEventListener("change", sync);
  sync();

  return {
    /** Let go of everything: the listeners, the loop, and the light itself. */
    stop() {
      fine.removeEventListener("change", sync);
      stillness.removeEventListener("change", sync);

      if (attached) {
        attached = false;
        root.removeEventListener("pointermove", onPointerMove);
        root.removeEventListener("pointerleave", onPointerLeave);
      }

      loop.stop();
      clear();
    },
  };
}

/**
 * The pointer light on the page, at the damping the token layer declares.
 *
 * @param {{ document?: Document, window?: Window, createLoop?: () => object }} [options]
 * @returns {{ stop: () => void }}
 */
export function startPointerLight({
  document: doc = globalThis.document,
  window: win = globalThis.window,
  createLoop,
} = {}) {
  const declared = Number.parseFloat(
    win.getComputedStyle(doc.documentElement).getPropertyValue("--pointer-light-damping"),
  );

  return createPointerLight({
    window: win,
    root: doc.documentElement,
    damping: Number.isFinite(declared) && declared > 0 ? declared : DEFAULT_DAMPING,
    ...(createLoop ? { createLoop } : {}),
  });
}
