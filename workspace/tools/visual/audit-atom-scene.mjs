/**
 * The atom model and its scene, judged on the style guide rather than in a stub.
 *
 * The unit tests hold the model's arithmetic and the scene's decisions. What they cannot hold is
 * whether a *record* becomes a picture, whether every record in the dataset does, and what that costs
 * on a real graphics card at the size a page will draw it. That is what this checks, against the
 * development-only stage on `/styleguide/`, before any page depends on the model.
 *
 * Five claims, all measured:
 *
 *   1. **Every element draws as itself.** All 118 records are put through the page's own picker and
 *      the readout is held against the record: its symbol, one ring per shell the record actually has,
 *      and a particle for every proton, neutron and electron.
 *   2. **Every extreme draws too.** No protons, no electrons, no neutrons, and more neutrons and
 *      electrons than any element has — each renders, each says which kind of thing it is, and each is
 *      a different picture from the element it was changed from.
 *   3. **A new element is a new picture, and a new count is a new picture.** Frames are hashed before
 *      and after, which is the phase's own exit criterion: the picture changes, measured rather than
 *      read off the code.
 *   4. **The stage paints in the token layer's colours.** Every particle colour is classified in the
 *      frame, so a scene that uploaded the wrong buffers — or none — cannot pass.
 *   5. **The numbers are recorded.** The heaviest atom the feature allows, at 1280 × 800, with the
 *      scene's own frame time and the browser's frame cadence beside it.
 *
 * It also checks the graceful path: a page whose canvas refuses a WebGL2 context must say so and leave
 * the rest of the page alone, because that is what a reader without WebGL2 will see.
 *
 * Usage: with a dev server running, `BASE=http://127.0.0.1:4188 node audit-atom-scene.mjs`.
 * It exits non-zero on a failed claim, a console error or a failed request.
 */

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import { chromium } from "playwright";

import { paintedShare } from "./atom-pixels.mjs";

const BASE = process.env.BASE ?? "http://127.0.0.1:4188";
const STAGE = "#atom-demo-canvas";
const READOUT = "#atom-demo-readout";
const PICKER = "#atom-demo-element";
const COUNTS = {
  protons: "#atom-demo-protons",
  neutrons: "#atom-demo-neutrons",
  electrons: "#atom-demo-electrons",
};

/** The records, read here as well as in the page: a claim about data has to name the data. */
const records = JSON.parse(
  await readFile(new URL("../../../source/data/elements.json", import.meta.url), "utf8"),
);

/** The heaviest atom the feature allows: 118 protons, and the neutrons of uranium's own weight. */
const HEAVY = { protons: 118, neutrons: 146, electrons: 118 };

/** The guide's own ceilings, which are higher than the page's: one more thing worth knowing. */
const CEILING = { protons: 118, neutrons: 300, electrons: 200 };

const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
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

/** What the scene wrote about itself. */
async function readout() {
  return page.evaluate((selector) => {
    const element = document.querySelector(selector);

    return { ...element.dataset, text: element.textContent };
  }, READOUT);
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

/**
 * Type three counts into the page's own controls and wait for the scene to have drawn them.
 *
 * @param {{ protons: number, neutrons: number, electrons: number }} counts
 * @returns {Promise<object>} the readout
 */
async function putCounts(counts) {
  for (const [name, field] of Object.entries(COUNTS)) {
    await page.fill(field, String(counts[name]));
  }

  await page.waitForFunction(
    (wanted) => document.querySelector("#atom-demo-readout")?.dataset.particles === wanted,
    String(counts.protons + counts.neutrons + counts.electrons),
  );

  return readout();
}

/**
 * Choose one element from the picker, the way a reader would.
 *
 * @param {number} atomicNumber
 * @returns {Promise<object>} the readout
 */
async function pick(atomicNumber) {
  await page.selectOption(PICKER, String(atomicNumber));
  await page.waitForFunction(
    (wanted) => document.querySelector("#atom-demo-readout")?.dataset.protons === wanted,
    String(atomicNumber),
  );

  return readout();
}

console.log(`\nThe atom model and its scene, on ${BASE}/styleguide/\n`);
await page.goto(`${BASE}/styleguide/`, { waitUntil: "networkidle" });
await page.waitForFunction(
  (selector) => Number(document.querySelector(selector)?.dataset.frames ?? 0) > 30,
  READOUT,
  { timeout: 20000 },
);

const options = await page.evaluate((selector) => document.querySelector(selector).options.length, PICKER);

check(options === records.length, `the picker offers all ${records.length} elements (${options} found)`);

const opening = await readout();

console.log(
  `\n  the stage opens on ${opening.text}\n  readout: ${JSON.stringify({
    element: opening.element,
    particles: opening.particles,
    orbits: opening.orbits,
    calls: opening.calls,
    frameMs: opening.frameMs,
    averageMs: opening.averageMs,
  })}\n`,
);

const drawn = await paintedShare(page, STAGE);

check(drawn.lit > 100, "the stage holds a drawn picture rather than an empty ground");
for (const [name, count] of Object.entries(drawn.palette)) {
  check(count > 0, `the ${name} colour from the token layer is on the stage`);
}

console.log("\nEvery element draws as itself\n");
let wrong = [];

for (const record of records) {
  const seen = await pick(record.atomicNumber);
  const neutrons = Math.max(0, Math.round(record.atomicWeight) - record.atomicNumber);
  const wanted = record.atomicNumber + neutrons + record.atomicNumber;
  const faults = [];

  if (seen.element !== record.symbol) {
    faults.push(`symbol ${seen.element} for ${record.symbol}`);
  }

  if (Number(seen.orbits) !== record.shells.length) {
    faults.push(`${seen.orbits} rings for ${record.shells.length} shells`);
  }

  if (Number(seen.particles) !== wanted) {
    faults.push(`${seen.particles} particles for ${wanted}`);
  }

  if (Number(seen.neutrons) !== neutrons) {
    faults.push(`${seen.neutrons} neutrons for the weight's ${neutrons}`);
  }

  if (seen.kind !== "element" || seen.charge !== "0") {
    faults.push(`kind ${seen.kind}, charge ${seen.charge}`);
  }

  if (faults.length > 0) {
    wrong.push(`${record.symbol}: ${faults.join("; ")}`);
  }
}

check(wrong.length === 0, `all ${records.length} elements draw as themselves`);
wrong.forEach((entry) => console.log(`        ${entry}`));

console.log("\nA new element is a new picture\n");
const hashes = new Map();

for (const atomicNumber of [1, 6, 26, 92, 118]) {
  await pick(atomicNumber);
  await page.waitForTimeout(160);
  hashes.set(atomicNumber, await frameHash());
}

const distinct = new Set(hashes.values()).size;

check(distinct === hashes.size, `five elements are five different frames (${distinct} distinct)`);

console.log("\nA new count is a new picture\n");
await pick(6);
await page.waitForTimeout(160);

const beforeCounts = await frameHash();

await putCounts({ protons: 6, neutrons: 30, electrons: 6 });
await page.waitForTimeout(160);

const afterNeutrons = await frameHash();

check(afterNeutrons !== beforeCounts, "thirty neutrons are a different picture from six");

await putCounts({ protons: 6, neutrons: 6, electrons: 0 });
await page.waitForTimeout(160);

const afterElectrons = await frameHash();

check(afterElectrons !== afterNeutrons, "taking the electrons away is a different picture again");

console.log("\nEvery extreme draws too\n");
const extremes = [
  { counts: { protons: 0, neutrons: 0, electrons: 0 }, kind: "no-protons", note: "no protons, nothing at all" },
  { counts: { protons: 6, neutrons: 0, electrons: 6 }, kind: "element", note: "a nucleus with no neutrons" },
  { counts: { protons: 6, neutrons: 6, electrons: 0 }, kind: "element", note: "a carbon ion with no electrons" },
  { counts: { protons: 119, neutrons: 176, electrons: 119 }, kind: "not-an-element", note: "one proton too many" },
  { counts: CEILING, kind: "element", note: "the guide's own ceilings" },
];

let previous = afterElectrons;

for (const extreme of extremes) {
  const seen = await putCounts(extreme.counts);

  await page.waitForTimeout(160);

  const hash = await frameHash();
  const wanted =
    extreme.counts.protons + extreme.counts.neutrons + extreme.counts.electrons;

  check(
    seen.kind === extreme.kind && Number(seen.particles) === wanted,
    `${extreme.note}: ${seen.kind}, ${seen.particles} particles, ${seen.orbits} orbits`,
  );
  check(hash !== previous, `${extreme.note}: a different picture from the one before it`);

  previous = hash;
}

console.log("\nCounts that name no element\n");
const nameless = await putCounts({ protons: 119, neutrons: 176, electrons: 119 });
const selected = await page.evaluate((selector) => document.querySelector(selector).selectedIndex, PICKER);

check(nameless.kind === "not-an-element", "119 protons is drawn as a picture of the counts, not as an element");
check(nameless.element === "", "and it claims no symbol");
check(selected === -1, "the picker shows nothing rather than an element that is not there");

console.log("\nThe heaviest atom, at 1280 x 800\n");
await page.click("#atom-demo-heavy");
await page.waitForTimeout(1500);

const heavy = await readout();
const heavyTimings = await frameTimings();
const heavyPainted = await paintedShare(page, STAGE);

check(Number(heavy.particles) === HEAVY.protons + HEAVY.neutrons + HEAVY.electrons, "the heaviest atom is 382 particles");
check(Number(heavy.orbits) === 7, "seven rings");
check(Number(heavy.calls) === 8, "eight draw calls: one for every particle and one per ring");
check(heavyPainted.palette.proton > 0 && heavyPainted.palette.neutron > 0 && heavyPainted.palette.electron > 0, "all three particle colours are painted");

console.log(
  `\n  ${heavy.text}\n` +
    `  scene: ${heavy.frameMs} ms this frame, ${heavy.averageMs} ms averaged over ${heavy.window} frames\n` +
    `  browser: median ${heavyTimings.median.toFixed(2)} ms, mean ${heavyTimings.mean.toFixed(2)} ms, ` +
    `worst ${heavyTimings.worst.toFixed(2)} ms over ${heavyTimings.frames} frames\n`,
);

check(Number(heavy.averageMs) < 8, `the scene's own work stays under 8 ms a frame (${heavy.averageMs})`);

console.log("The guide's own ceiling, for the record\n");
await putCounts(CEILING);
await page.waitForTimeout(1200);

const ceiling = await readout();

console.log(`\n  ${ceiling.text}\n  scene: ${ceiling.frameMs} ms this frame, ${ceiling.averageMs} ms averaged\n`);

console.log("\nControls that move the view\n");
const centre = await page.locator(STAGE).boundingBox();
const wasDrawn = await frameHash();

await page.mouse.move(centre.x + centre.width / 2, centre.y + centre.height / 2);
await page.mouse.down();
await page.mouse.move(centre.x + centre.width / 2 + 140, centre.y + centre.height / 2 + 60, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(500);

check((await frameHash()) !== wasDrawn, "a drag swings the camera");

await page.click("#atom-demo-reset");
await page.waitForTimeout(500);

// The turn a shake adds is held by the scene's own tests; what a browser can add is that the button is
// wired at all, which is the defect this page had when the layer first arrived on it.
await page.click("#atom-demo-shake");
await page.waitForTimeout(200);

const afterShake = await readout();

check(Number(afterShake.frames) > 0, "pressing Shake leaves the scene drawing rather than stopped");

await page.click("#atom-demo-pause");
await page.waitForTimeout(200);

const paused = await frameHash();

await page.waitForTimeout(400);

check((await frameHash()) === paused, "with the loop stopped, nothing changes");

await page.click("#atom-demo-pause");

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

const fallback = await withoutGl.evaluate(
  (selector) => ({
    said: document.querySelector(selector).textContent,
    calls: document.querySelector(selector).dataset.calls,
    frames: document.querySelector(selector).dataset.frames,
    note: document.querySelector(".atom-demo__fallback")?.textContent ?? null,
  }),
  READOUT,
);

check(/No WebGL2 context/.test(fallback.said), "the stage says it could not be drawn");
check(fallback.calls === "0" && fallback.frames === "0", "and reports no frames rather than a stuck counter");
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

console.log(
  `\n${failures.length === 0 ? "All claims held" : `${failures.length} claim(s) failed`}, ` +
    `${trouble.length} console message(s)\n`,
);

await browser.close();
process.exit(failures.length + trouble.length === 0 ? 0 : 1);
