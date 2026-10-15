/**
 * The masthead's scrolled state, where the platform cannot scroll-animate it.
 *
 * site-header.css frosts the masthead with the platform's own scroll timeline: paper at the
 * derived minimum opacity (tokens §23) behind a small blur, settling over the first 160 pixels of
 * a scroll. Two readers never see that animation — a browser without scroll-driven animations,
 * and a browser whose reader has asked for less motion, because the stylesheet's animation lives
 * inside `prefers-reduced-motion: no-preference` — and the design's answer for both is the same:
 * the frost itself, applied instantly, with no transition to watch, because the frost is a state
 * and only its ramping is motion.
 *
 * This module is that answer. It decides which reader it is looking at, keeps the decision
 * current as the preference changes, and toggles the one class the stylesheet draws the frost
 * from. Where the timeline runs, it does nothing at all: no listener, no class, no opinion.
 */

/** The class site-header.css draws the frost from. Exported so the two halves cannot drift. */
export const FROSTED = "is-frosted";

/**
 * Whether this environment needs the class: anything the stylesheet's own gate does not cover.
 * The gate is `@supports (animation-timeline: scroll())` inside
 * `prefers-reduced-motion: no-preference`, and this must say the same thing.
 *
 * @param {Window} win
 * @returns {boolean}
 */
export function needsFallback(win) {
  const timelines = win.CSS && win.CSS.supports ? win.CSS.supports("animation-timeline: scroll()") : false;

  return !(timelines && !win.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

/**
 * The masthead's scrolled state, live on a page.
 *
 * @param {object} options
 * @param {Window} options.window
 * @param {HTMLElement | null} options.masthead
 * @returns {{ stop: () => void }}
 */
export function createMastheadFrost({ window: win, masthead }) {
  if (!masthead) {
    return { stop() {} };
  }

  const stillness = win.matchMedia("(prefers-reduced-motion: reduce)");
  let watching = false;

  /** The scrolled state, as the class: any scroll at all is a page that has left its top. */
  const apply = () => {
    masthead.classList.toggle(FROSTED, win.scrollY > 0);
  };

  /** Answer the environment as it is now: shed to the timeline, or take the class over. */
  function sync() {
    const fallback = needsFallback(win);

    if (fallback === watching) {
      if (fallback) {
        apply();
      }

      return;
    }

    watching = fallback;

    if (watching) {
      win.addEventListener("scroll", apply, { passive: true });
      apply();
    } else {
      win.removeEventListener("scroll", apply);
      // The class goes before the timeline takes over, because the timeline draws the frost the
      // same way and its own progress picks up from the scroll position that is already there.
      masthead.classList.remove(FROSTED);
    }
  }

  stillness.addEventListener("change", sync);
  sync();

  return {
    /** Let go of everything: the preference's listener, the scroll's, and the class. */
    stop() {
      stillness.removeEventListener("change", sync);

      if (watching) {
        watching = false;
        win.removeEventListener("scroll", apply);
      }

      masthead.classList.remove(FROSTED);
    },
  };
}

/**
 * The masthead's scrolled state on the page.
 *
 * @param {{ document?: Document, window?: Window }} [options]
 * @returns {{ stop: () => void }}
 */
export function startMastheadFrost({
  document: doc = globalThis.document,
  window: win = globalThis.window,
} = {}) {
  return createMastheadFrost({ window: win, masthead: doc.querySelector(".masthead") });
}
