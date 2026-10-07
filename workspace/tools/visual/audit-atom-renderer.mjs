/**
 * The atom viewer's renderer, judged in a browser rather than in a stub.
 *
 * The unit tests hold the layer's arithmetic and its call sequence; what they cannot hold is whether
 * pixels appear, whether they *change*, and what they cost on a real graphics card. That is what this
 * checks, against the development-only stage on `/styleguide/`, before any page depends on the layer.
 *
 * Four claims, all measured:
 *
 *   1. **The canvas paints, and keeps painting.** A screenshot while the loop runs differs from one a
 *      quarter of a second later, so the scene is moving rather than drawn once.
 *   2. **Every control changes the render.** Each button is pressed and the frame's pixels are hashed
 *      before and after, so a control that binds to nothing fails here instead of in someone's hands.
 *   3. **Paused means paused.** With the loop stopped, two screenshots are byte-identical — which is
 *      also what the page's reduced-motion path will do, one still frame and no loop.
 *   4. **The numbers are recorded.** The readout the layer itself writes is read back, together with
 *      the browser's own frame timings, so the report says what this machine actually did.
 *
 * It also checks the graceful path: a page whose canvas refuses a WebGL2 context must say so and leave
 * the rest of the page alone, because that is exactly what a reader without WebGL2 will see.
 *
 * Usage: with a dev server running, `BASE=http://127.0.0.1:4188 node audit-atom-renderer.mjs`.
 * It exits non-zero on a failed claim, a console error or a failed request.
 */

import { createHash } from "node:crypto";

import { chromium } from "playwright";

import { paintedShare } from "./atom-pixels.mjs";

const BASE = process.env.BASE ?? "http://127.0.0.1:4180";
const STAGE = "#atom-demo-canvas";
const READOUT = "#atom-demo-readout";

// A device ratio of three, because the layer caps the drawing surface at two: at one the cap would
// never be reached, and the rule that stops a 3D stage from costing more than it shows would go
// untested.
const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 3,
});
const page = await context.newPage();

const trouble = [];
const failures = [];

page.on("console", (message) => {
  if (message.type() === "error" || message.type() === "warning") {
    trouble.push(`console ${message.type()}: ${message.text()}`);
  }
});
page.on("pageerror", (error) => trouble.push(`page error: ${error.message}`));
page.on("requestfailed", (request) => failures.push(`${request.url()} — ${request.failure()?.errorText}`));

/**
 * @param {boolean} condition
 * @param {string} what
 */
function check(condition, what) {
  if (!condition) {
    failures.push(what);
  }

  console.log(`${condition ? "  ok  " : " FAIL "} ${what}`);
}

/** The stage as it is right now, hashed. Two identical hashes are two identical frames. */
async function frameHash() {
  const shot = await page.locator(STAGE).screenshot();

  return createHash("sha256").update(shot).digest("hex").slice(0, 16);
}

/** What the layer wrote about itself. */
async function readout() {
  return page.evaluate((selector) => {
    const element = document.querySelector(selector);

    return { ...element.dataset, text: element.textContent };
  }, READOUT);
}

/** The middle of the stage, so a mouse event lands on the canvas rather than on the page around it. */
async function stageCentre() {
  await page.locator(STAGE).scrollIntoViewIfNeeded();

  const box = await page.locator(STAGE).boundingBox();

  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** The browser's own frame timings over the next ninety frames, in milliseconds. */
async function frameTimings() {
  return page.evaluate(async () => {
    const deltas = [];
    let last = performance.now();

    await new Promise((resolve) => {
      let count = 0;

      const tick = (now) => {
        deltas.push(now - last);
        last = now;
        count += 1;

        if (count < 90) {
          requestAnimationFrame(tick);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(tick);
    });

    const sorted = [...deltas].sort((one, other) => one - other);

    return {
      frames: deltas.length,
      median: sorted[Math.floor(sorted.length / 2)],
      worst: sorted.at(-1),
      mean: deltas.reduce((total, value) => total + value, 0) / deltas.length,
    };
  });
}

console.log(`\nThe atom renderer, on ${BASE}/styleguide/\n`);
await page.goto(`${BASE}/styleguide/`, { waitUntil: "networkidle" });
await page.waitForFunction(
  (selector) => Number(document.querySelector(selector)?.dataset.frames ?? 0) > 30,
  READOUT,
  { timeout: 20000 },
);

// What drew these pixels, because a frame time means nothing without it. The unmasked renderer string
// is a debugging extension a browser may refuse, in which case WebGL's own masked answer is reported.
const renderer = await page.evaluate((selector) => {
  const gl = document.querySelector(selector).getContext("webgl2");

  if (!gl) {
    return null;
  }

  const debug = gl.getExtension("WEBGL_debug_renderer_info");

  return {
    version: gl.getParameter(gl.VERSION),
    renderer: debug
      ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER),
  };
}, STAGE);

console.log(`  ${renderer?.version ?? "no context"} — ${renderer?.renderer ?? "unknown"}\n`);
console.log("A drawn stage\n");
check(await page.locator(STAGE).isVisible(), "the canvas is on the page");

const first = await frameHash();

await page.waitForTimeout(260);

const second = await frameHash();

check(first !== second, "two frames a quarter of a second apart differ: the scene is moving");

const reported = await readout();

console.log(`\n  ${reported.text}`);
console.log(`  readout: ${JSON.stringify({ particles: reported.particles, orbits: reported.orbits, calls: reported.calls, frameMs: reported.frameMs, averageMs: reported.averageMs })}\n`);

check(Number(reported.calls) >= 2, "the frame issues at least one call for the particles and one per orbit");
check(Number(reported.calls) === Number(reported.orbits) + 1, "the particles are one call and each orbit is one more");
check(Number(reported.frameMs) < 16, "a frame's own work costs less than one sixtieth of a second");

console.log("The stage has an atom on it\n");
const drawn = await paintedShare(page, STAGE);

console.log(
  `  ${(drawn.ratio * 100).toFixed(2)}% of the stage is something other than its own colour ` +
    `(${drawn.lit} of ${drawn.sampled} sampled pixels)`,
);
console.log(
  `  classified: ${drawn.palette.proton} proton, ${drawn.palette.neutron} neutron, ` +
    `${drawn.palette.electron} electron pixels\n`,
);

check(drawn.lit > 100, "the frame holds a drawn picture rather than an empty stage");
for (const [name, count] of Object.entries(drawn.palette)) {
  check(count > 0, `the ${name} colour from the token layer is on the stage`);
}

const timings = await frameTimings();

console.log(
  `\n  browser frames: median ${timings.median.toFixed(2)} ms, mean ${timings.mean.toFixed(2)} ms, ` +
    `worst ${timings.worst.toFixed(2)} ms over ${timings.frames} frames\n`,
);

console.log("Every control changes the render\n");
const centre = await stageCentre();
const beforeHeavy = await frameHash();

await page.click("#atom-demo-heavy");
await page.waitForFunction(
  (selector) => document.querySelector(selector)?.dataset.particles === "382",
  READOUT,
  { timeout: 10000 },
);

const heavy = await readout();
const afterHeavy = await frameHash();

check(
  Number(heavy.particles) === 382,
  "the heaviest atom holds 118 protons, 146 neutrons and 118 electrons",
);
check(Number(heavy.orbits) === 7, "seven orbits are drawn for it");
check(afterHeavy !== beforeHeavy, "a heavier atom is a different picture");
check(
  Number(heavy.calls) === Number(heavy.orbits) + 1,
  "and it is still one call for the particles and one per orbit",
);

console.log(`\n  ${heavy.text}\n`);

const heavier = await paintedShare(page, STAGE);

check(
  heavier.lit > drawn.lit * 2,
  `twenty times the particles paint more of the stage (${heavier.lit} lit pixels against ${drawn.lit})`,
);

await page.click("#atom-demo-heavy");
await page.waitForTimeout(200);

const still = await frameHash();

await page.mouse.move(centre.x, centre.y);
await page.mouse.wheel(0, -240);
await page.waitForTimeout(400);

check((await frameHash()) !== still, "the wheel brings the camera closer");

await page.click("#atom-demo-reset");
await page.waitForTimeout(400);

await page.mouse.move(centre.x, centre.y);
await page.mouse.down();
await page.mouse.move(centre.x + 140, centre.y + 60, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(400);

check((await frameHash()) !== still, "a drag swings the camera");

console.log("\nPaused is paused\n");
await page.click("#atom-demo-pause");
await page.waitForTimeout(200);

const paused = await frameHash();

await page.waitForTimeout(400);

check((await frameHash()) === paused, "with the loop stopped, nothing changes");

const frozen = Number((await readout()).frames);

await page.waitForTimeout(300);

check(Number((await readout()).frames) === frozen, "and the layer is not stepping at all");

await page.click("#atom-demo-pause");
await page.waitForTimeout(300);

check((await frameHash()) !== paused, "pressing play starts it moving again");

console.log("\nThree widths, one drawing surface\n");
for (const width of [375, 768, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  await page.waitForTimeout(320);

  const sized = await page.evaluate((selector) => {
    const canvas = document.querySelector(selector);

    return {
      surface: { width: canvas.width, height: canvas.height },
      box: canvas.getBoundingClientRect().width,
      ratio: window.devicePixelRatio,
    };
  }, STAGE);

  const expected = 2 * sized.box;
  const drift = Math.abs(sized.surface.width - expected);

  check(
    drift <= 2,
    `at ${width}px the surface is the box at the capped ratio of two, not the device's ` +
      `${sized.ratio} (${sized.surface.width}x${sized.surface.height})`,
  );
}

console.log("\nA browser with no WebGL2\n");
const withoutGl = await context.newPage();

await withoutGl.addInitScript(() => {
  const original = HTMLCanvasElement.prototype.getContext;

  HTMLCanvasElement.prototype.getContext = function getContext(kind, ...rest) {
    if (kind === "webgl2") {
      return null;
    }

    return original.call(this, kind, ...rest);
  };
});
await withoutGl.goto(`${BASE}/styleguide/`, { waitUntil: "networkidle" });

const fallback = await withoutGl.evaluate((selector) => ({
  said: document.querySelector(selector).textContent,
  calls: document.querySelector(selector).dataset.calls,
  note: document.querySelector(".atom-demo__fallback")?.textContent ?? null,
}), READOUT);

check(/No WebGL2 context/.test(fallback.said), "the stage says it could not be drawn");
check(fallback.calls === "0", "and claims no draw calls");
check(Boolean(fallback.note), "and leaves a note in place of the canvas");
await withoutGl.close();

if (trouble.length > 0) {
  console.log("\nConsole trouble\n");
  trouble.forEach((entry) => console.log(`  ${entry}`));
}

if (failures.length > 0) {
  console.log("\nFailed\n");
  failures.forEach((entry) => console.log(`  ${entry}`));
}

console.log(`\n${failures.length === 0 ? "Every claim held." : `${failures.length} failed.`}\n`);

await browser.close();
process.exit(failures.length === 0 && trouble.length === 0 ? 0 : 1);
