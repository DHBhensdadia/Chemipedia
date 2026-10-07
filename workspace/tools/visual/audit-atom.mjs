/**
 * The atoms page, judged in a browser.
 *
 * The unit tests hold the page's markup and the scene's arithmetic. What they cannot hold is whether
 * the page a reader actually opens draws, whether its controls change what is drawn, and whether the
 * three paths that are not the happy path — no WebGL2, no scripting, a reduced-motion preference —
 * leave a reader with a page rather than a blank stage.
 *
 * Seven claims, all measured:
 *
 *   1. **The stage paints, in the token layer's colours.** The drawing buffer is read inside a frame
 *      and classified against the same custom properties the renderer reads, so a scene that uploaded
 *      the wrong buffers cannot pass.
 *   2. **Every control changes the render.** Steppers, fields, the picker, the speed, the camera drag
 *      and the wheel: each is used and the frame is hashed before and after.
 *   3. **The page says what it is drawing.** The card, the element link and the canvas' accessible
 *      name follow the counts, and the live region announces each change once.
 *   4. **Paused is paused.** With the loop stopped, two frames are byte-identical.
 *   5. **A reduced-motion reader gets a still frame and a Play control** — and pressing Play animates.
 *   6. **A reader with no WebGL2 gets the diagram**, the counts, and a line saying why.
 *   7. **The bar is usable by the keyboard alone.** Tabbed through and asked where it went: every
 *      control in the bar receives focus in document order, the focused control carries the stage's
 *      own ring rather than the site's ink, and a reader can type a count and watch the atom become
 *      that element without touching a mouse.
 *   8. **The fragment chooses the element, and the element pages lead here.** `/atoms/#uranium`
 *      opens on uranium with its counts, and the one link an element page carries opens the viewer
 *      on that element — followed with a real click, through the router, the way a reader does it.
 *   9. **The page keeps the browser's cadence on its heaviest atom.** The frame's cost is measured on
 *      the page rather than inferred from the style guide: the browser's own frame times over ninety
 *      frames with the heaviest atom the controls allow turning, and again with the loop stopped, so
 *      the scene is judged against the same page doing nothing. Long tasks are counted in the same
 *      window. What this is not is an isolated per-frame cost — Phase 13 measured that separately,
 *      0.258 ms for this atom on the same machine.
 *  10. **Three widths, no console message and no failed request** at any of them.
 *
 * Usage: with a dev server running, `BASE=http://127.0.0.1:4188 node audit-atom.mjs`.
 * It exits non-zero on a failed claim, a console error or a failed request.
 */

import { createHash } from "node:crypto";

import { chromium } from "playwright";

import { paintedShare } from "./atom-pixels.mjs";

const BASE = process.env.BASE ?? "http://127.0.0.1:4188";
const PAGE = `${BASE}/atoms/`;
const STAGE = "#atom-canvas";
const READOUT = "#atom-readout";
const ANNOUNCE = "#atom-announce";
const NAME = "#atom-name";
const LINK = "#atom-element-link";

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

/** What the page says about the atom it is drawing. */
async function said() {
  return page.evaluate(
    ({ readout, announce, name, link }) => ({
      readout: document.querySelector(readout).textContent,
      announce: document.querySelector(announce).textContent,
      name: document.querySelector(name).textContent,
      link: document.querySelector(link).getAttribute("href"),
      label: document.querySelector("#atom-canvas").getAttribute("aria-label"),
      drawn: document.querySelector("#atom-canvas").hidden === false,
      fallback: document.querySelector("#atom-fallback").hidden,
    }),
    { readout: READOUT, announce: ANNOUNCE, name: NAME, link: LINK },
  );
}

/**
 * The browser's own frame times over the next frames, in milliseconds, with any long task in the same
 * window. `requestAnimationFrame` is the browser's clock, so this measures what a reader experiences
 * rather than what the scene thinks it spent.
 *
 * @param {number} count
 * @returns {Promise<{ frames: number, median: number, mean: number, worst: number, longTasks: number }>}
 */
async function cadence(count) {
  return page.evaluate(
    (frames) =>
      new Promise((resolve) => {
        const deltas = [];
        const tasks = [];
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            tasks.push(entry.duration);
          }
        });

        observer.observe({ type: "longtask", buffered: false });

        let last = performance.now();
        let seen = 0;

        const tick = (now) => {
          deltas.push(now - last);
          last = now;
          seen += 1;

          if (seen < frames) {
            requestAnimationFrame(tick);

            return;
          }

          observer.disconnect();

          const sorted = [...deltas].sort((one, other) => one - other);

          resolve({
            frames: deltas.length,
            median: sorted[Math.floor(sorted.length / 2)],
            mean: deltas.reduce((sum, delta) => sum + delta, 0) / deltas.length,
            worst: sorted[sorted.length - 1],
            longTasks: tasks.length,
          });
        };

        requestAnimationFrame(tick);
      }),
    count,
  );
}

/** A count, set the way a reader sets it. */
async function type(field, value) {
  await page.fill(field, String(value));
  await page.dispatchEvent(field, "change");
  await page.waitForTimeout(120);
}

console.log(`\nThe atoms page, on ${PAGE}\n`);
await page.goto(PAGE, { waitUntil: "networkidle" });
await page.waitForSelector(`${STAGE}:not([hidden])`, { timeout: 20000 });
await page.waitForTimeout(200);

const opening = await said();

console.log(`\n  the page opens on ${opening.readout}\n  readout: ${JSON.stringify(opening)}\n`);

check(/particles/.test(opening.readout), "the stage reports what it is drawing");
check(opening.drawn && opening.fallback, "the canvas replaced the fallback diagram once it drew");
check(/Carbon/.test(opening.label), "the canvas' accessible name states the atom");

const painted = await paintedShare(page, STAGE);

check(painted.lit > 100, "the stage holds a drawn picture rather than an empty panel");
for (const [particle, count] of Object.entries(painted.palette)) {
  check(count > 0, `the ${particle} colour from the token layer is on the stage`);
}

console.log("\nThe bar changes the atom\n");
const before = await frameHash();

await page.click('button[data-atom-step="protons"][data-atom-by="1"]');
await page.waitForTimeout(200);

const protoned = await said();
const afterProton = await frameHash();

check(/Nitrogen/.test(protoned.name), `one proton more names the next element (${protoned.name})`);
check(/Nitrogen/.test(protoned.label), "and the canvas' name follows it");
check(afterProton !== before, "one proton more is a different picture");
check(protoned.link === "/elements/nitrogen/", "the element link follows the counts");

await type("#atom-electrons", 0);
await page.waitForTimeout(200);

const stripped = await said();

check(/a charge of \+7/.test(stripped.announce), `taking the electrons away is announced (${stripped.announce})`);

await page.selectOption("#atom-picker", "92");
await page.waitForTimeout(300);

const uranium = await said();

check(/Uranium/.test(uranium.name) && /7 shells/.test(uranium.readout), `uranium draws seven shells (${uranium.readout})`);
check(uranium.link === "/elements/uranium/", "and the card links to its page");

await page.selectOption("#atom-picker", "118");
await page.waitForTimeout(300);

const heaviest = await said();

console.log(`\n  the heaviest atom: ${heaviest.readout}\n`);

check(/Oganesson/.test(heaviest.name), "the last element draws too");

console.log("\nThe camera and the clock\n");
const still = await frameHash();

await page.mouse.move(640, 400);
await page.mouse.wheel(0, -240);
await page.waitForTimeout(400);

check((await frameHash()) !== still, "the wheel brings the camera closer");

await page.click("#atom-reset");
await page.waitForTimeout(400);

const box = await page.locator(STAGE).boundingBox();

await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2 + 50, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(400);

check((await frameHash()) !== still, "a drag swings the view");

await page.fill("#atom-speed", "5");
await page.dispatchEvent("#atom-speed", "input");
await page.waitForTimeout(200);

check((await said()).readout === heaviest.readout, "the speed changes the electrons and not the atom");

await page.click("#atom-shake");
await page.waitForTimeout(200);

check((await said()).drawn, "Shake leaves the scene drawing");

await page.click("#atom-motion");
await page.waitForTimeout(250);

const paused = await frameHash();

await page.waitForTimeout(400);

check((await frameHash()) === paused, "with the loop stopped, nothing changes");
check(/Play/.test(await page.textContent("#atom-motion")), "and the control offers to start it again");

await page.click("#atom-motion");
await page.waitForTimeout(300);

check((await frameHash()) !== paused, "pressing it starts the atom moving again");

console.log("\nThe frame-time budget\n");

// The heaviest atom the controls allow, at the size the plan asks to be measured at.
await page.selectOption("#atom-picker", "118");
await page.waitForTimeout(400);

const turning = await cadence(90);

await page.click("#atom-motion");
await page.waitForTimeout(300);

const stopped = await cadence(90);

await page.click("#atom-motion");
await page.waitForTimeout(200);

console.log(
  `\n  oganesson, 1280 x 800: median ${turning.median.toFixed(2)} ms, mean ${turning.mean.toFixed(2)} ms, ` +
    `worst ${turning.worst.toFixed(2)} ms over ${turning.frames} frames, ${turning.longTasks} long task(s)\n` +
    `  the same page held still: median ${stopped.median.toFixed(2)} ms, worst ${stopped.worst.toFixed(2)} ms\n`,
);

check(turning.longTasks === 0, "the heaviest atom draws without a long task");
check(
  turning.median < stopped.median * 1.5 + 1,
  `and the page keeps the cadence it has when nothing is moving (${turning.median.toFixed(2)} vs ` +
    `${stopped.median.toFixed(2)} ms a frame)`,
);
check(
  turning.worst < 50,
  `no frame of the heaviest atom runs away (worst ${turning.worst.toFixed(2)} ms)`,
);

console.log("\nThree widths\n");
for (const width of [375, 768, 1280]) {
  await page.setViewportSize({ width, height: 800 });
  await page.waitForTimeout(400);

  const fitted = await page.evaluate(() => {
    const stage = document.querySelector("#atom-stage");
    const bar = document.querySelector("#atom-bar");

    return {
      stage: stage.getBoundingClientRect().width,
      bar: bar.getBoundingClientRect(),
      viewport: document.documentElement.clientWidth,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  check(fitted.overflow <= 0, `at ${width}px the page does not overflow (${fitted.overflow}px)`);
  check(
    fitted.bar.left >= 0 && fitted.bar.right <= width + 1,
    `at ${width}px the bar stays inside the stage (${Math.round(fitted.bar.left)}–${Math.round(fitted.bar.right)})`,
  );
}

console.log("\nA reader who asked for reduced motion\n");
const stillContext = await context.browser().newContext({
  viewport: { width: 1280, height: 800 },
  reducedMotion: "reduce",
});
const stillPage = await stillContext.newPage();

stillPage.on("pageerror", (error) => trouble.push(`reduced-motion page error: ${error.message}`));
await stillPage.goto(PAGE, { waitUntil: "networkidle" });
await stillPage.waitForSelector(`${STAGE}:not([hidden])`, { timeout: 20000 });
await stillPage.waitForTimeout(500);

const held = await stillPage.locator(STAGE).screenshot();
const heldAgain = await stillPage.locator(STAGE).screenshot();
const heldHash = createHash("sha256").update(held).digest("hex").slice(0, 16);

check(held.equals(heldAgain), "the still frame does not move");
check(/Play/.test(await stillPage.textContent("#atom-motion")), "and the control offers to play it");

await stillPage.click("#atom-motion");
await stillPage.waitForTimeout(400);
check((await stillPage.locator(STAGE).screenshot()).equals(held) === false, "pressing Play starts it");
await stillPage.screenshot({ path: "/tmp/atoms-reduced-motion.png", fullPage: false });
await stillContext.close();

console.log("\nA reader with no WebGL2\n");
const plainContext = await context.browser().newContext({ viewport: { width: 1280, height: 800 } });
const plainPage = await plainContext.newPage();

await plainPage.addInitScript(() => {
  const original = HTMLCanvasElement.prototype.getContext;

  HTMLCanvasElement.prototype.getContext = function getContext(kind, ...rest) {
    if (kind === "webgl2") {
      return null;
    }

    return original.call(this, kind, ...rest);
  };
});
await plainPage.goto(PAGE, { waitUntil: "networkidle" });
await plainPage.waitForTimeout(500);

const without = await plainPage.evaluate(() => ({
  said: document.querySelector("#atom-readout").textContent,
  canvas: document.querySelector("#atom-canvas").hidden,
  fallback: document.querySelector("#atom-fallback").hidden,
  diagram: document.querySelector("#atom-fallback svg") !== null,
  counts: document.querySelector(".at-stage__counts").textContent,
}));

check(/cannot draw the three-dimensional view/.test(without.said), "the page says why there is no scene");
check(without.canvas && !without.fallback, "and the diagram is the picture it keeps");
check(without.diagram, "with the element's shells drawn in it");
check(/protons/.test(without.counts), "and the counts written out beside it");
await plainPage.screenshot({ path: "/tmp/atoms-no-webgl.png" });
await plainContext.close();

console.log("\nA reader with no scripting\n");
const scriptless = await context.browser().newContext({ viewport: { width: 1280, height: 800 }, javaScriptEnabled: false });
const bare = await scriptless.newPage();

await bare.goto(PAGE, { waitUntil: "domcontentloaded" });

const built = await bare.evaluate(() => ({
  diagram: document.querySelector("#atom-fallback svg") !== null,
  counts: /protons/.test(document.querySelector(".at-stage__counts")?.textContent ?? ""),
  bar: document.querySelector("#atom-picker")?.options.length ?? 0,
  steppers: document.querySelectorAll("[data-atom-step]").length,
  legend: document.querySelectorAll(".at-bar__legend-item").length,
  title: document.title,
}));

check(built.diagram && built.counts, "the diagram and the counts are in the built page");
check(built.bar === 118 && built.steppers === 6, `the whole bar is built too (${built.bar} elements, ${built.steppers} step buttons)`);
check(built.legend === 4, "and the legend with it");
await bare.screenshot({ path: "/tmp/atoms-no-script.png", fullPage: true });
await scriptless.close();

console.log("\nThe keyboard alone\n");

/** What the document says has focus, named the way this page names its own controls. */
async function focused() {
  return page.evaluate(() => {
    const active = document.activeElement;

    if (!active || active === document.body) {
      return "body";
    }

    if (active.id) {
      return `#${active.id}`;
    }

    if (active.dataset?.atomStep) {
      return `${active.dataset.atomStep}${Number(active.dataset.atomBy) > 0 ? "+" : "\u2212"}`;
    }

    return active.tagName.toLowerCase();
  });
}

// The bar's own controls, in the order the built page puts them in.
const BAR_ORDER = [
  "#atom-element-link",
  "protons\u2212",
  "#atom-protons",
  "protons+",
  "neutrons\u2212",
  "#atom-neutrons",
  "neutrons+",
  "electrons\u2212",
  "#atom-electrons",
  "electrons+",
  "#atom-speed",
  "#atom-shake",
  "#atom-reset",
  "#atom-motion",
  "#atom-picker",
];

await page.goto(PAGE, { waitUntil: "networkidle" });
await page.waitForSelector(`${STAGE}:not([hidden])`, { timeout: 20000 });
await page.waitForTimeout(200);

const walked = [];

await page.keyboard.press("Tab");

for (let press = 0; press < 40 && !walked.includes("#atom-picker"); press += 1) {
  walked.push(await focused());
  await page.keyboard.press("Tab");
}

const inBar = walked.slice(walked.indexOf("#atom-element-link"));

check(inBar.includes("#atom-element-link"), "the keyboard reaches the bar at all");
check(
  JSON.stringify(inBar) === JSON.stringify(BAR_ORDER),
  `every control in the bar is reached, in the order the page puts them (${inBar.length} of ${BAR_ORDER.length})`,
);

// Backwards, to be sure the order is the document's and not a one-way street — and to sit on a
// control in the bar for the ring check below, since the bar is the surface that has the problem.
await page.keyboard.press("Shift+Tab");

const back = await focused();

check(back === "#atom-picker", `and Shift+Tab walks the same order backwards (to ${back})`);

// The ring has to be the stage's own: the site's is the ink, which is invisible on this surface.
const ring = await page.evaluate(() => {
  const style = getComputedStyle(document.activeElement);

  return {
    style: style.outlineStyle,
    width: style.outlineWidth,
    colour: style.outlineColor,
    ink: getComputedStyle(document.querySelector(".at-stage")).color,
  };
});

check(
  ring.style !== "none" && ring.width !== "0px" && ring.colour !== ring.ink,
  `the focused control carries a ring a reader can see (${ring.width} ${ring.colour})`,
);

// And the keyboard does not only move focus: it changes the atom. Twelve presses back from the
// chooser is the protons field, which is also where the order in the other direction is checked.
let presses = 0;

while ((await focused()) !== "#atom-protons" && presses < 40) {
  await page.keyboard.press("Shift+Tab");
  presses += 1;
}

check((await focused()) === "#atom-protons", "the protons field can be reached with the keyboard alone");

await page.keyboard.press("Meta+a");
await page.keyboard.type("26");
await page.keyboard.press("Enter");
await page.waitForTimeout(300);

const ironed = await said();

check(/Iron/.test(ironed.name), `typing 26 and pressing Enter turns the stage into iron (${ironed.name})`);
check(/Iron/.test(ironed.announce), "and the live region says so");
check(/Iron/.test(ironed.label), "and the canvas' name follows it");

await page.keyboard.press("Tab");
await page.keyboard.press("Enter");
await page.waitForTimeout(300);

check(/Cobalt/.test((await said()).name), "and the step buttons work from the keyboard too");

console.log("\nThe fragment, and the way in from an element page\n");
const linked = await context.newPage();

linked.on("console", (message) => {
  if (message.type() === "error" || message.type() === "warning") {
    trouble.push(`element page console ${message.type()}: ${message.text()}`);
  }
});
linked.on("pageerror", (error) => trouble.push(`element page error: ${error.message}`));
linked.on("requestfailed", (request) => failures.push(`${request.url()} — ${request.failure()?.errorText}`));

await linked.goto(`${PAGE}#uranium`, { waitUntil: "networkidle" });
await linked.waitForSelector(`${STAGE}:not([hidden])`, { timeout: 20000 });
await linked.waitForTimeout(200);

const deep = await linked.evaluate(() => ({
  name: document.querySelector("#atom-name").textContent,
  readout: document.querySelector("#atom-readout").textContent,
  protons: document.querySelector("#atom-protons").value,
  picker: document.querySelector("#atom-picker").value,
}));

check(/Uranium/.test(deep.name), `a fragment opens the page on that element (${deep.name})`);
check(deep.protons === "92" && deep.picker === "92", "and the counts and the picker are set to it");

await linked.goto(`${BASE}/elements/iron/`, { waitUntil: "networkidle" });

// The masthead links to the viewer too, because it is a page of the site. The claim is about the
// content: one link from the element a reader is reading into that element's own atom.
const viewer = await linked.evaluate(() => {
  const links = [...document.querySelectorAll("main a")].filter((anchor) =>
    (anchor.getAttribute("href") ?? "").startsWith("/atoms/"),
  );

  return { count: links.length, href: links[0]?.getAttribute("href"), text: links[0]?.textContent };
});

check(viewer.count === 1, `the element's content carries one link into the viewer (${viewer.count})`);
check(viewer.href === "/atoms/#iron", `and it names the element it is on (${viewer.href})`);

await linked.click("main a[href^='/atoms/']");
await linked.waitForSelector(`${STAGE}:not([hidden])`, { timeout: 20000 });
await linked.waitForTimeout(200);

const arrived = await linked.evaluate(() => ({
  name: document.querySelector("#atom-name").textContent,
  protons: document.querySelector("#atom-protons").value,
  url: `${location.pathname}${location.hash}`,
}));

check(/Iron/.test(arrived.name), `following it opens iron, not the built element (${arrived.name})`);
check(arrived.protons === "26", "with iron's own counts");
check(arrived.url === "/atoms/#iron", `and the URL it landed on is the one it asked for (${arrived.url})`);
await linked.screenshot({ path: "/tmp/atoms-from-iron.png" });
await linked.close();

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
