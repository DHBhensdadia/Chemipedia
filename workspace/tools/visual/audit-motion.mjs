/**
 * The motion layer's own gate.
 *
 * `tests/lib/motion.test.js` holds the reveal sheet's structure from the file it is written in, and
 * the modules' own tests hold their arithmetic. This audit is the other half, and it can only be
 * this: the light, the frost, the reveals, the cross-fade and the depth are composited by a
 * browser, so their claims are claims about pixels and about what the frame clock did.
 *
 * Its questions, in the order the phase asked them. Does the light follow the pointer, lifting the
 * field and spending nothing — and is it absent where it should be, under a stillness preference
 * and on a touch screen? Does the frosted masthead still meet AA over the content it is actually
 * frosting, on both of its paths? Does every family's walk settle every reveal, and does a page
 * under reduced motion run exactly zero animations? Does a cross-fade land at the top of the right
 * page with focus on the content, does a history move stay a cut and put the reader's place back?
 * Does every lift read its rung of the ladder back, to both hands? And what does a drifting page
 * cost the clock, turning and still?
 *
 * Usage: `node audit-motion.mjs` against a running dev server, or `BASE=... node audit-motion.mjs`.
 * It exits non-zero if any claim fails, and prints every claim it made.
 */

import { chromium } from "playwright";
import { PNG } from "pngjs";
import { contrastRatio, AA_TEXT } from "../../../source/scripts/lib/contrast.js";
import { asHex, close, pixelAt, stripMode } from "./lib/pixels.mjs";

const BASE = process.env.BASE ?? "http://127.0.0.1:4180";
const DESKTOP = { width: 1280, height: 900 };

/** How far a target must be inside the fold before the design promises it is settled. */
const TRAVEL = 320;

/** One page per family, the same set the field's audit walks. */
const PAGES = [
  { path: "/" },
  { path: "/about/" },
  { path: "/elements/" },
  { path: "/elements/hydrogen/" },
  { path: "/element-groups/noble-gases/" },
  { path: "/periodic-table/properties-and-states/" },
  { path: "/periodic-table/orbitals/" },
  { path: "/properties/melting-point/" },
  { path: "/calculators/temperature/" },
  { path: "/glossary/" },
  { path: "/periodic-table/evolution/" },
  { path: "/downloads/" },
];

/** The reveal sheet's selectors, verbatim: the audit counts what the sheet reveals, not its own list. */
const REVEALS = 'main section, main ul[class$="-list"], main ul[class$="-grid"], main ul[class$="-cards"]';

/** The animations the design declares: the reveals, the two drifting sheets, the frost. */
const DESIGNED = ["field-drift-a", "field-drift-b", "masthead-frost", "reveal"];

const claims = [];
const fail = (claim, detail) => {
  claims.push({ claim, ok: false, detail });
};
const pass = (claim) => claims.push({ claim, ok: true });

const browser = await chromium.launch({ channel: "chrome" });

/** Every reveal target of a page, as the browser currently draws it. */
const targets = (page) =>
  page.evaluate((selector) => {
    return [...document.querySelectorAll(selector)].map((el) => {
      const style = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      return { opacity: Number(style.opacity), transform: style.transform, top: box.top };
    });
  }, REVEALS);

/** Settled: fully drawn and back where it belongs. */
const settled = (target) =>
  target.opacity >= 0.999 && (target.transform === "none" || target.transform === "matrix(1, 0, 0, 1, 0, 0)");

/** Walk a page top to bottom in viewport-sized steps, then let the last frame land. */
const walk = (page) =>
  page.evaluate(async () => {
    for (let y = 0; y <= document.documentElement.scrollHeight; y += 600) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
    await new Promise((resolve) => setTimeout(resolve, 150));
  });

/** A screenshot as a PNG. */
const shot = async (page) => PNG.sync.read(await page.screenshot());

/** How two screenshots differ below the masthead: samples lifted, samples dropped, the extremes. */
const difference = (before, after, step = 4) => {
  let lifted = 0;
  let dropped = 0;
  let maxLift = 0;
  let worstDrop = 0;
  for (let y = 72; y < before.height - 8; y += step) {
    for (let x = 8; x < before.width - 8; x += step) {
      const one = pixelAt(before, x, y);
      const other = pixelAt(after, x, y);
      const up = Math.max(other.r - one.r, other.g - one.g, other.b - one.b);
      const down = Math.min(other.r - one.r, other.g - one.g, other.b - one.b);
      if (up >= 1) lifted += 1;
      if (down <= -2) dropped += 1;
      maxLift = Math.max(maxLift, up);
      worstDrop = Math.min(worstDrop, down);
    }
  }
  return { lifted, dropped, maxLift, worstDrop };
};

/** The light's three properties as the page reads them: the inline writes, and the token's own 0. */
const lightVars = (page) =>
  page.evaluate(() => {
    const root = document.documentElement;
    return {
      inline: root.style.getPropertyValue("--pointer-light-live"),
      live: getComputedStyle(root).getPropertyValue("--pointer-light-live").trim(),
      x: root.style.getPropertyValue("--pointer-light-x"),
      y: root.style.getPropertyValue("--pointer-light-y"),
    };
  });

// — the light follows: at rest nothing is written; under the pointer the field lifts, and only lifts
{
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(`${BASE}/elements/hydrogen/`, { waitUntil: "load" });
  await page.waitForTimeout(400);

  const resting = await lightVars(page);
  if (resting.inline === "" && resting.live === "0") {
    pass("the light at rest · nothing written, nothing live");
  } else {
    fail("the light at rest", `inline "${resting.inline}", live ${resting.live}`);
  }

  // Hover would move ink without any light, so every hit target goes deaf for this reading, and the
  // drift is paused: the only thing between the two screenshots is the light itself.
  await page.addStyleTag({ content: "a, button, summary { pointer-events: none !important; }" });
  await page.addStyleTag({ content: "html::before, body::before { animation-play-state: paused !important; }" });
  await page.waitForTimeout(200);
  const before = await shot(page);

  await page.mouse.move(24, 150);
  // The slowest axis — 150px at damping 8 — arrives in ~0.92s; the margin is for frames.
  await page.waitForTimeout(1400);
  const following = await lightVars(page);
  const after = await shot(page);
  const lifted = difference(before, after);

  if (following.inline === "1.000" && Math.abs(Number.parseFloat(following.x) - 24) <= 1) {
    pass(`the light follows the pointer · live 1.000 at ${following.x}/${following.y}`);
  } else {
    fail("the light follows", `vars read "${following.inline}" at ${following.x}/${following.y}`);
  }

  if (lifted.lifted >= 400 && lifted.dropped === 0 && lifted.maxLift >= 1 && lifted.maxLift <= 8) {
    pass(
      `the light lifts the field and nothing else · ${lifted.lifted} samples lifted, ${lifted.maxLift} LSB at most, no drop`,
    );
  } else {
    fail("the light's pixels", `${lifted.lifted} lifted (max ${lifted.maxLift}), ${lifted.dropped} dropped by ${lifted.worstDrop}`);
  }
  await context.close();
}

// — absent where it should be, I: stillness. The pointer may move; nothing may answer it.
{
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(`${BASE}/glossary/`, { waitUntil: "load" });
  await page.waitForTimeout(400);

  await page.addStyleTag({ content: "a, button, summary { pointer-events: none !important; }" });
  const before = await shot(page);
  await page.mouse.move(320, 400);
  await page.waitForTimeout(600);
  const after = await shot(page);
  const touched = difference(before, after);
  const vars = await lightVars(page);

  if (vars.inline === "" && vars.live === "0" && touched.lifted === 0 && touched.dropped === 0) {
    pass("stillness · the pointer changes nothing: no properties written, no pixel moved");
  } else {
    fail("stillness", `inline "${vars.inline}", live ${vars.live}, ${touched.lifted} pixels lifted`);
  }
  await context.close();
}

// — absent where it should be, II: a touch screen. Even pointed at, the light never wakes.
{
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1, hasTouch: true });
  const page = await context.newPage();
  await page.goto(`${BASE}/glossary/`, { waitUntil: "load" });
  await page.waitForTimeout(300);

  const media = await page.evaluate(() => ({
    fine: matchMedia("(pointer: fine)").matches,
    coarse: matchMedia("(pointer: coarse)").matches,
  }));
  await page.evaluate(() => {
    for (let i = 0; i < 8; i += 1) {
      document.documentElement.dispatchEvent(
        new PointerEvent("pointermove", { clientX: 200 + i * 40, clientY: 300, pointerType: "mouse", bubbles: true }),
      );
    }
  });
  await page.touchscreen.tap(300, 400);
  await page.waitForTimeout(400);
  const vars = await lightVars(page);

  if (media.coarse && vars.inline === "" && vars.live === "0") {
    pass("a touch screen · the pointer is coarse and the light never wakes");
  } else {
    fail("touch", `fine ${media.fine}, coarse ${media.coarse}, inline "${vars.inline}", live ${vars.live}`);
  }
  await context.close();
}

// — the frost: AA over real scrolled content, on both of its paths
let liveBand = null;
{
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(`${BASE}/atoms/`, { waitUntil: "load" });
  await page.waitForTimeout(400);

  const paper = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const paperPixel = { r: Number(paper.match(/\d+/g)[0]), g: Number(paper.match(/\d+/g)[1]), b: Number(paper.match(/\d+/g)[2]) };
  const reading = async (scroll) => {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), scroll);
    await page.waitForTimeout(500);
    return stripMode(await shot(page), 29);
  };

  const atRest = await reading(0);
  if (close(atRest, paperPixel, 1)) pass(`at rest the masthead band is bare paper (${asHex(atRest)})`);
  else fail("the band at rest", `${asHex(atRest)} against paper ${paper}`);

  liveBand = await reading(520);
  const engaged = Math.max(
    Math.abs(liveBand.r - paperPixel.r),
    Math.abs(liveBand.g - paperPixel.g),
    Math.abs(liveBand.b - paperPixel.b),
  );
  const faint = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--ink-faint").trim(),
  );
  const ratio = contrastRatio(faint, asHex(liveBand));
  const klass = await page.evaluate(() => document.querySelector(".masthead").className);

  if (engaged >= 4) pass(`the frost is engaged over the stage (${asHex(liveBand)}, ${engaged} LSB under paper)`);
  else fail("the frost engaged", `band ${asHex(liveBand)} only ${engaged} off paper`);
  if (ratio >= AA_TEXT) pass(`faint ink over the frosted band measures ${ratio.toFixed(2)} : 1`);
  else fail("frost AA", `faint over ${asHex(liveBand)} measures ${ratio.toFixed(2)} : 1`);
  if (klass === "masthead") pass("the timeline path needs no class");
  else fail("timeline class", `class reads "${klass}"`);

  const back = await reading(0);
  if (close(back, paperPixel, 1)) pass("the frost leaves when the content does, at rest again");
  else fail("frost revert", `band back at top reads ${asHex(back)}`);
  await context.close();
}

// — the fallback path, on the same page and the same content: the class draws the same frost
{
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(`${BASE}/atoms/`, { waitUntil: "load" });
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo({ top: 520, behavior: "instant" }));
  await page.waitForTimeout(500);

  const band = stripMode(await shot(page), 29);
  const klass = await page.evaluate(() => document.querySelector(".masthead").className);

  if (klass.includes("is-frosted") && close(band, liveBand, 2)) {
    pass(`the fallback draws the same frost — class on, band ${asHex(band)} against the timeline's ${asHex(liveBand)}`);
  } else {
    fail("the fallback frost", `class "${klass}", band ${asHex(band)} vs live ${asHex(liveBand)}`);
  }
  await context.close();
}

// — the reveals, every family: nothing inside the settled zone waits, and the walk settles everything
{
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1 });
  const page = await context.newPage();
  for (const { path } of PAGES) {
    await page.goto(`${BASE}${path}`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);

    const atLoad = await targets(page);
    const inZone = atLoad.filter((target) => target.top < DESKTOP.height - TRAVEL);
    const waited = inZone.filter((target) => !settled(target));
    if (waited.length === 0) {
      pass(`${path} · nothing inside the settled zone is waiting (${inZone.length} target(s) there)`);
    } else {
      fail(
        `${path} · at load`,
        `${waited.length}/${inZone.length} unsettled inside the zone (first at ${waited[0].top.toFixed(0)}px, opacity ${waited[0].opacity.toFixed(2)})`,
      );
    }

    await walk(page);
    const after = await targets(page);
    const still = after.filter((target) => !settled(target));
    if (still.length === 0) pass(`${path} · the walk settles ${after.length}/${after.length} reveals`);
    else fail(`${path} · walk`, `${still.length}/${after.length} still not settled`);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  }
  await context.close();
}

// — the rise is a movement, not a fade: a mid-rise section is displaced and fully opaque
{
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(`${BASE}/elements/hydrogen/`, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);

  const rise = await page.evaluate(() =>
    Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--rise-sm")),
  );

  let midrise = null;
  for (let top = 0; top <= 1000 && midrise === null; top += 40) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top);
    await page.waitForTimeout(60);
    midrise = await page.evaluate(
      ({ selector, travel }) => {
        for (const el of document.querySelectorAll(selector)) {
          const style = getComputedStyle(el);
          const moved = style.transform.match(/^matrix\(1, 0, 0, 1, 0, ([0-9.]+)\)$/);
          if (moved && Number(moved[1]) > 0.5 && Number(moved[1]) < travel - 0.5) {
            return { shift: Number(moved[1]), opacity: Number(style.opacity) };
          }
        }
        return null;
      },
      { selector: REVEALS, travel: rise },
    );
  }

  if (midrise && midrise.opacity === 1) {
    pass(
      `the rise is a movement, not a fade · a section caught mid-rise sits ${midrise.shift.toFixed(1)}px low and fully opaque`,
    );
  } else if (midrise) {
    fail("the rise's ink", `a mid-rise section reads opacity ${midrise.opacity}`);
  } else {
    fail("the rise's ink", "no section was caught mid-rise");
  }
  await context.close();
}

// — the census: every animation at rest is one of the designed kinds, in the designed counts
{
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(`${BASE}/elements/hydrogen/`, { waitUntil: "load" });
  await page.waitForTimeout(400);

  const census = await page.evaluate((selector) => {
    const counts = {};
    for (const animation of document.getAnimations()) {
      counts[animation.animationName] = (counts[animation.animationName] ?? 0) + 1;
    }
    return { counts, targets: document.querySelectorAll(selector).length };
  }, REVEALS);

  const designed =
    census.counts.reveal === census.targets &&
    census.counts["field-drift-a"] === 1 &&
    census.counts["field-drift-b"] === 1 &&
    census.counts["masthead-frost"] === 1 &&
    Object.keys(census.counts).length === DESIGNED.length;

  if (designed) {
    pass(
      `hydrogen at rest · the page runs exactly its designed animations: ${census.targets} reveals, two drifts, one frost`,
    );
  } else {
    fail("the census", `${JSON.stringify(census.counts)} over ${census.targets} targets`);
  }
  await context.close();
}

// — reduced motion, every family: everything settled at load, and exactly zero animations
{
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await context.newPage();
  for (const { path } of PAGES) {
    await page.goto(`${BASE}${path}`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);

    const state = await page.evaluate((selector) => {
      const all = [...document.querySelectorAll(selector)];
      return {
        settled: all.filter((el) => Number(getComputedStyle(el).opacity) >= 0.999).length,
        total: all.length,
        animations: document.getAnimations().length,
      };
    }, REVEALS);

    if (state.settled === state.total && state.animations === 0) {
      pass(`${path} · reduce: ${state.settled}/${state.total} settled at load, 0 animations`);
    } else {
      fail(`${path} · reduce`, `${state.settled}/${state.total} settled, ${state.animations} animations`);
    }
  }
  await context.close();
}

// — print: nothing waits for a scroll that will never come
{
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1 });
  const page = await context.newPage();
  for (const path of ["/glossary/", "/elements/hydrogen/"]) {
    await page.goto(`${BASE}${path}`, { waitUntil: "load" });
    await page.emulateMedia({ media: "print" });
    await page.waitForTimeout(250);

    const state = await page.evaluate((selector) => {
      const all = [...document.querySelectorAll(selector)];
      return {
        settled: all.filter((el) => Number(getComputedStyle(el).opacity) >= 0.999).length,
        total: all.length,
      };
    }, REVEALS);

    if (state.settled === state.total) pass(`print · ${path} settles ${state.total}/${state.total} on the paper`);
    else fail(`print · ${path}`, `${state.settled}/${state.total} settled`);
    await page.emulateMedia({ media: "screen" });
  }
  await context.close();
}

/** Count the transitions the router starts on this page. */
const countFades = () => {
  window.__fades = 0;
  const original = document.startViewTransition?.bind(document);
  if (original) {
    document.startViewTransition = (update) => {
      window.__fades += 1;
      return original(update);
    };
  }
};

/** Read a running view transition while it exists: the old snapshot's own animation, and its length. */
const watchFade = (page) =>
  page.evaluate(async () => {
    const start = performance.now();
    while (performance.now() - start < 900) {
      const style = getComputedStyle(document.documentElement, "::view-transition-old(root)");
      if (style.animationName !== "none") {
        return { name: style.animationName, duration: style.animationDuration, opacity: style.opacity };
      }
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    return null;
  });

// — the cross-fade: one transition forward, the house's timing, and a landing at the top in focus
{
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.addInitScript(countFades);
  await page.goto(`${BASE}/glossary/`, { waitUntil: "load" });
  await page.waitForTimeout(300);

  const watched = watchFade(page);
  await page.click('a[href="/elements/"]');
  const midFade = await watched;
  await page.waitForTimeout(700);

  const landed = await page.evaluate(() => ({
    url: location.pathname,
    fades: window.__fades,
    scrollY,
    focus: document.activeElement?.id || document.activeElement?.tagName,
  }));

  if (landed.fades === 1) pass("a move forward cross-fades once");
  else fail("forward fade", `${landed.fades} transitions`);
  if (landed.url === "/elements/" && landed.scrollY === 0 && landed.focus === "main") {
    pass("the fade lands at the top of the right page, focus on the content");
  } else {
    fail("the landing", JSON.stringify(landed));
  }
  if (midFade && midFade.duration === "0.3s") {
    pass(`the fade runs the house's ${midFade.duration}, not the platform's default`);
  } else {
    fail("the fade's timing", midFade ? `duration ${midFade.duration}` : "the transition ended before it could be read");
  }
  await context.close();
}

// — a stillness preference keeps the cut
{
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.addInitScript(countFades);
  await page.goto(`${BASE}/glossary/`, { waitUntil: "load" });
  await page.waitForTimeout(300);

  await page.click('a[href="/elements/"]');
  await page.waitForTimeout(700);
  const landed = await page.evaluate(() => ({
    url: location.pathname,
    fades: window.__fades,
    focus: document.activeElement?.id || document.activeElement?.tagName,
  }));

  if (landed.fades === 0 && landed.url === "/elements/" && landed.focus === "main") {
    pass("stillness · the cut is instant and lands the same");
  } else {
    fail("stillness move", JSON.stringify(landed));
  }
  await context.close();
}

// — a history move is instant, and the reader's place comes back
{
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.addInitScript(countFades);
  await page.goto(`${BASE}/elements/`, { waitUntil: "load" });
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo({ top: 800, behavior: "instant" }));
  await page.waitForTimeout(300);

  await page.click('a[href="/glossary/"]');
  await page.waitForTimeout(700);
  await page.goBack();
  await page.waitForTimeout(700);

  const back = await page.evaluate(() => ({ url: location.pathname, fades: window.__fades, scrollY }));
  if (back.fades === 1 && back.url === "/elements/" && Math.abs(back.scrollY - 800) <= 2) {
    pass("history · one fade in all, and the reader's place back at 800px");
  } else {
    fail("history", JSON.stringify(back));
  }
  await context.close();
}

// — the ladder, read back: every lift its rung, and the keyboard an equal of the pointer
{
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1 });
  const page = await context.newPage();

  const rungs = () =>
    page.evaluate(() => {
      const probe = document.createElement("div");
      document.body.appendChild(probe);
      const read = (token) => {
        probe.style.boxShadow = `var(${token})`;
        return getComputedStyle(probe).boxShadow;
      };
      const out = { sm: read("--shadow-sm"), md: read("--shadow-md"), lg: read("--shadow-lg") };
      probe.remove();
      return out;
    });

  await page.goto(`${BASE}/elements/`, { waitUntil: "load" });
  await page.waitForTimeout(300);
  const steps = await rungs();

  const card = page.locator(".card__link").first();
  await card.hover();
  await page.waitForTimeout(350);
  const cardHover = await card.evaluate((el) => getComputedStyle(el).boxShadow);
  await page.mouse.move(6, 850);
  await page.waitForTimeout(350);
  await card.evaluate((el) => el.focus());
  await page.waitForTimeout(350);
  const cardFocus = await card.evaluate((el) => getComputedStyle(el).boxShadow);
  if (cardHover === steps.lg && cardFocus === steps.lg) {
    pass(`a card lifts to the ladder's top for both hands (${cardHover})`);
  } else {
    fail("the card's lift", `hover ${cardHover}, focus ${cardFocus}, top ${steps.lg}`);
  }

  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await page.waitForTimeout(300);
  const tile = page.locator(".tile").first();
  await tile.hover();
  await page.waitForTimeout(350);
  const tileHover = await tile.evaluate((el) => getComputedStyle(el).boxShadow);
  if (tileHover === steps.lg) pass(`a tile lifts to the same top (${tileHover})`);
  else fail("the tile's lift", `${tileHover} against top ${steps.lg}`);

  await page.evaluate(() => document.querySelector(".chip").classList.add("is-active"));
  await page.waitForTimeout(350);
  const pinned = await page.evaluate(() => getComputedStyle(document.querySelector(".chip")).boxShadow);
  if (pinned === steps.md) pass(`the pinned chip holds a step under the pointer's own lift (${pinned})`);
  else fail("the pinned chip", `${pinned} against md ${steps.md}`);

  await page.goto(`${BASE}/element-groups/noble-gases/`, { waitUntil: "load" });
  await page.waitForTimeout(300);
  const member = page.locator(".grp-member").first();
  await member.hover();
  await page.waitForTimeout(350);
  const memberHover = await member.evaluate((el) => getComputedStyle(el).boxShadow);
  await page.mouse.move(6, 850);
  await page.waitForTimeout(350);
  await member.evaluate((el) => el.focus());
  await page.waitForTimeout(350);
  const memberFocus = await member.evaluate((el) => getComputedStyle(el).boxShadow);
  if (memberHover === steps.sm && memberFocus === steps.sm) {
    pass(`a member row whispers at the ladder's floor for both hands (${memberHover})`);
  } else {
    fail("the member's lift", `hover ${memberHover}, focus ${memberFocus}, floor ${steps.sm}`);
  }
  await context.close();
}

// — the frame cost, turning and still: a drifting window, then one with the light moving through it
let stillMedian = 0;
{
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await page.waitForTimeout(400);

  const still = await page.evaluate(async () => {
    const long = [];
    new PerformanceObserver((list) => long.push(...list.getEntries().map((entry) => entry.duration))).observe({
      type: "longtask",
      buffered: true,
    });
    const frames = [];
    let last = performance.now();
    await new Promise((resolve) => {
      let count = 0;
      const tick = () => {
        const now = performance.now();
        frames.push(now - last);
        last = now;
        count += 1;
        if (count < 120) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    frames.sort((a, b) => a - b);
    return { long: long.length, median: frames[frames.length >> 1] };
  });

  stillMedian = still.median;
  if (still.long === 0) {
    pass(`still · a drifting window costs no long task (median gap ${still.median.toFixed(1)}ms)`);
  } else {
    fail("still", `${still.long} long task(s) during the drift`);
  }
  await context.close();
}

{
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await page.waitForTimeout(400);

  const turning = await page.evaluate(async () => {
    const long = [];
    new PerformanceObserver((list) => long.push(...list.getEntries().map((entry) => entry.duration))).observe({
      type: "longtask",
      buffered: true,
    });
    const root = document.documentElement;
    const frames = [];
    let x = 160;
    let y = 240;
    let last = performance.now();
    await new Promise((resolve) => {
      let count = 0;
      const tick = () => {
        const now = performance.now();
        frames.push(now - last);
        last = now;
        if (count % 6 === 0) {
          x = 60 + ((x + 127) % 1080);
          y = 140 + ((y + 89) % 620);
          root.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: y, pointerType: "mouse", bubbles: true }));
        }
        count += 1;
        if (count < 120) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    await new Promise((resolve) => setTimeout(resolve, 250));
    frames.sort((a, b) => a - b);
    return {
      long: long.length,
      median: frames[frames.length >> 1],
      live: getComputedStyle(root).getPropertyValue("--pointer-light-live").trim(),
    };
  });

  if (turning.long === 0 && Number(turning.live) >= 0.9) {
    pass(
      `turning · the light follows across a drifting page and still no long task (live ${turning.live}, median gap ${turning.median.toFixed(1)}ms against ${stillMedian.toFixed(1)}ms still)`,
    );
  } else {
    fail("turning", `live ${turning.live}, ${turning.long} long task(s), median ${turning.median.toFixed(1)}ms`);
  }
  await context.close();
}

await browser.close();

for (const { claim, ok, detail } of claims) {
  console.log(`${ok ? " hold" : " FAIL"}  ${claim}${ok ? "" : ` — ${detail}`}`);
}

const held = claims.filter((claim) => claim.ok).length;

console.log(`\n${held} of ${claims.length} claims hold.`);

if (held < claims.length) {
  process.exitCode = 1;
}
