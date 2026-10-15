/**
 * The living paper's own gate.
 *
 * `tests/lib/backdrop.test.js` holds the field's *arithmetic* from the files it is written in. This
 * audit is the other half, and it can only be this: the field is composited by a browser, at a
 * viewport, in a colour space, under a drift — so its claims are claims about pixels. One page per
 * family, and four readings per page: the still composition a reduced-motion reader gets, the drift
 * frozen at each of its two extremes, and the two states that are not screenshots of a scroll —
 * print and scripting off. In every state it samples what actually sits behind text and asks the
 * WCAG question of it, samples the family bloom's anchor and asks whether that family's own hue is
 * what reaches the page, and samples an opaque surface to prove the field stays under it. A phone
 * frame checks the bled sheets cannot scroll the page sideways, and a lived-in window checks a
 * drift cycle costs no long task and shifts nothing.
 *
 * The family anchor's expectation is computed with the site's own contrast library and the very
 * geometry tokens the stylesheet draws with, so what is compared is the browser's composite against
 * the derivation's, not against a remembered colour.
 *
 * Usage: `node audit-atmosphere.mjs` against a running dev server, or `BASE=... node audit-atmosphere.mjs`.
 * It exits non-zero if any claim fails, and prints every claim it made.
 */

import { chromium } from "playwright";
import { PNG } from "pngjs";
import { compositeOver, contrastRatio, AA_LARGE, AA_TEXT } from "../../../source/scripts/lib/contrast.js";

const BASE = process.env.BASE ?? "http://127.0.0.1:4180";
const DESKTOP = { width: 1280, height: 900 };
const PHONE = { width: 375, height: 812 };

/** Where the family bloom is read: the shell's left margin, below the masthead's own paper. */
const ANCHOR = { x: 24, y: 150 };

/** One page per family; `null` means the page keeps the default pair. */
const PAGES = [
  { path: "/", family: null },
  { path: "/about/", family: null },
  { path: "/elements/", family: "table" },
  { path: "/elements/hydrogen/", family: "element" },
  { path: "/element-groups/noble-gases/", family: "table" },
  { path: "/periodic-table/properties-and-states/", family: "states" },
  { path: "/periodic-table/orbitals/", family: "scene" },
  { path: "/properties/melting-point/", family: "ranking" },
  { path: "/calculators/temperature/", family: "calculator" },
  { path: "/glossary/", family: "glossary" },
  { path: "/periodic-table/evolution/", family: "evolution" },
  { path: "/downloads/", family: "downloads" },
];

const claims = [];
const fail = (claim, detail) => {
  claims.push({ claim, ok: false, detail });
};
const pass = (claim) => claims.push({ claim, ok: true });

const browser = await chromium.launch({ channel: "chrome" });

const asHex = ({ r, g, b }) => "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
const hexOf = (hex) => ({ r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) });
const pixelAt = (png, x, y) => {
  const i = (y * png.width + x) * 4;
  return { r: png.data[i], g: png.data[i + 1], b: png.data[i + 2] };
};

/** The middle of a small patch — the reading that survives one lattice hairline or a glyph's edge. */
const patchMedian = (png, x, y, size = 3) => {
  const channels = [[], [], []];
  for (let dy = -size; dy <= size; dy += 1) {
    for (let dx = -size; dx <= size; dx += 1) {
      const px = pixelAt(png, Math.max(0, Math.min(png.width - 1, x + dx)), Math.max(0, Math.min(png.height - 1, y + dy)));
      channels[0].push(px.r);
      channels[1].push(px.g);
      channels[2].push(px.b);
    }
  }
  const median = channels.map((list) => list.sort((a, b) => a - b)[(list.length - 1) >> 1]);
  return { r: median[0], g: median[1], b: median[2] };
};

const close = (a, b, tolerance) =>
  Math.abs(a.r - b.r) <= tolerance && Math.abs(a.g - b.g) <= tolerance && Math.abs(a.b - b.b) <= tolerance;

/** Runs in the page: the text that actually sits on the field — nothing between it and body paints. */
const onFieldText = () =>
  [...document.querySelectorAll("main h1, main h2, main h3, main p, main a, main li, main label, main summary")]
    .filter((el) => {
      const box = el.getBoundingClientRect();
      if (box.width < 8 || box.height < 8 || box.top < 110 || box.bottom > innerHeight - 40) return false;
      for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (style.backgroundColor !== "rgba(0, 0, 0, 0)" || style.backgroundImage !== "none") return false;
      }
      const own = getComputedStyle(el);
      return own.backgroundColor === "rgba(0, 0, 0, 0)" || el.tagName === "LI";
    })
    .slice(0, 24)
    .map((el) => {
      const box = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        text: (el.textContent ?? "").trim().slice(0, 28),
        colour: style.color,
        size: parseFloat(style.fontSize),
        weight: parseInt(style.fontWeight, 10) || 400,
        box: { left: box.left, right: box.right, top: box.top, bottom: box.bottom },
      };
    });

/** Contrast of a text colour against a sampled background pixel. */
const textOn = (colour, pixel) => {
  const rgb = colour.match(/[\d.]+/g).slice(0, 3).map((c) => Math.round(Number(c)));
  return contrastRatio(asHex({ r: rgb[0], g: rgb[1], b: rgb[2] }), asHex(pixel));
};

/** Just outside each edge of a text box: the field the text reads as its ground, untouched by glyphs. */
const samplePoints = (box) => [
  [box.left - 5, (box.top + box.bottom) / 2],
  [box.right + 5, (box.top + box.bottom) / 2],
  [(box.left + box.right) / 2, box.top - 5],
];

/** One state's reading: every on-field text run, its ground sampled, the worst one decided. */
async function readState(page, path, state) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(120);
  const candidates = await page.evaluate(onFieldText);
  const shot = PNG.sync.read(await page.screenshot());
  let worst = null;

  for (const candidate of candidates) {
    const required = candidate.size >= 24 || (candidate.size >= 18.66 && candidate.weight >= 700) ? AA_LARGE : AA_TEXT;
    for (const [x, y] of samplePoints(candidate.box)) {
      if (x < 2 || y < 2 || x > shot.width - 3 || y > shot.height - 3) continue;
      const ratio = textOn(candidate.colour, patchMedian(shot, Math.round(x), Math.round(y)));
      if (worst === null || ratio < worst.ratio) {
        worst = { ratio, required, who: `${candidate.tag} "${candidate.text}" at ${Math.round(x)},${Math.round(y)}` };
      }
    }
  }

  const label = `${path} · ${state} · ${candidates.length} runs on the field`;
  if (worst === null) {
    pass(`${label} — nothing on the field to read here`);
  } else if (worst.ratio >= worst.required) {
    pass(`${label} — worst ${worst.ratio.toFixed(2)} : 1 (${worst.who})`);
  } else {
    fail(label, `${worst.who} measures ${worst.ratio.toFixed(2)} : 1, needs ${worst.required}`);
  }
}

/** Freezes both drifting sheets: a mid-cycle delay means one of the two extremes. */
const frozen = (delay) =>
  `html::before { animation-delay: ${delay} !important; animation-play-state: paused !important; }\n` +
  `body::before { animation-delay: ${delay} !important; animation-play-state: paused !important; }`;

for (const { path, family } of PAGES) {
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${BASE}${path}`, { waitUntil: "load" });
  await page.waitForTimeout(200);

  // — the four sheets exist, fixed, behind, deaf, and each carries an image
  const sheets = await page.evaluate(() =>
    ["html", "body"].flatMap((root) =>
      ["before", "after"].map((side) => {
        const style = getComputedStyle(document.querySelector(root), `::${side}`);
        return { name: `${root}::${side}`, content: style.content, position: style.position, zIndex: style.zIndex, pointerEvents: style.pointerEvents, image: style.backgroundImage };
      }),
    ),
  );
  const broken = sheets.filter((s) => s.content === "none" || s.position !== "fixed" || s.zIndex !== "-1" || s.pointerEvents !== "none" || s.image === "none");
  if (broken.length === 0) pass(`${path} · four sheets, fixed behind everything and deaf`);
  else fail(`${path} · four sheets`, broken.map((s) => `${s.name}: ${s.position}/${s.zIndex}/${s.pointerEvents}/${s.image === "none" ? "no image" : "ok"}`).join("; "));

  // — the family claim: body's hue is the token its family name points at
  const read = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    return {
      page: document.body.dataset.page,
      hue: body.getPropertyValue("--field-family-hue").trim(),
      alpha: Number.parseFloat(body.getPropertyValue("--field-family-alpha")),
      defaultHue: getComputedStyle(document.documentElement).getPropertyValue("--field-family-hue").trim(),
    };
  });
  if (family) {
    const expected = await page.evaluate((name) => getComputedStyle(document.documentElement).getPropertyValue(`--field-family-${name}-hue`).trim(), family);
    if (read.hue === expected && read.alpha > 0) pass(`${path} · ${read.page} wears ${family}`);
    else fail(`${path} · family`, `body wears ${read.hue} @ ${read.alpha}; expected ${family}'s ${expected}`);
  } else if (read.hue === read.defaultHue) {
    pass(`${path} · ${read.page} keeps the default pair`);
  } else {
    fail(`${path} · default family`, `body wears ${read.hue}; expected ${read.defaultHue}`);
  }

  // — the anchor: the family's own hue is what reaches the frame at the bloom's corner
  const geometry = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    return {
      x: Number.parseFloat(body.getPropertyValue("--field-bloom-1-x")) / 100,
      y: Number.parseFloat(body.getPropertyValue("--field-bloom-1-y")) / 100,
      radius: Number.parseFloat(body.getPropertyValue("--field-bloom-radius")),
      fade: Number.parseFloat(body.getPropertyValue("--field-bloom-fade")) / 100,
      alpha: Number.parseFloat(body.getPropertyValue("--field-family-alpha")),
      focus: Number.parseFloat(body.getPropertyValue("--field-wash-focus")),
      hue: body.getPropertyValue("--field-family-hue").trim(),
      paper: getComputedStyle(document.body).backgroundColor,
    };
  });
  const anchorShot = PNG.sync.read(await page.screenshot());
  const sample = patchMedian(anchorShot, ANCHOR.x, ANCHOR.y);
  const vmax = Math.max(DESKTOP.width, DESKTOP.height);
  const reach = (geometry.radius / 100) * vmax * geometry.fade;
  const distance = Math.hypot(ANCHOR.x - geometry.x * DESKTOP.width, ANCHOR.y - geometry.y * DESKTOP.height);
  const alpha = geometry.alpha * geometry.focus * Math.max(0, 1 - distance / reach);
  const paper = geometry.paper.match(/[\d.]+/g).slice(0, 3);
  const paperHex = "#" + paper.map((c) => Number(c).toString(16).padStart(2, "0")).join("");
  const expectedPixel = hexOf(compositeOver(geometry.hue, paperHex, alpha));
  if (close(sample, expectedPixel, 3)) {
    pass(`${path} · the anchor shows ${geometry.hue}: ${asHex(sample)} vs derived ${asHex(expectedPixel)}`);
  } else {
    fail(`${path} · anchor`, `sampled ${asHex(sample)}, derived ${asHex(expectedPixel)} for ${geometry.hue} @ ${alpha.toFixed(4)}`);
  }

  // — the kill switch: kill the family pair and require the pixels to move. Without this a pale
  //   family's anchor would pass on a field with no family bloom at all, since its composite is
  //   nearly paper to begin with; with it, "the family reaches the frame" is held for every hue.
  const killPage = await browser.newPage({ viewport: DESKTOP, deviceScaleFactor: 1, reducedMotion: "reduce" });
  await killPage.goto(`${BASE}${path}`, { waitUntil: "load" });
  await killPage.addStyleTag({ content: "body { --field-family-alpha: 0 !important; }" });
  await killPage.waitForTimeout(150);
  const dark = patchMedian(PNG.sync.read(await killPage.screenshot()), ANCHOR.x, ANCHOR.y);
  await killPage.close();
  const moved = Math.max(Math.abs(sample.r - dark.r), Math.abs(sample.g - dark.g), Math.abs(sample.b - dark.b));
  if (moved >= 2) pass(`${path} · the family pair reaches the pixels (${moved} off its dark)`);
  else fail(`${path} · family pixels`, `with the pair killed the anchor moves only ${moved}`);

  // — an opaque surface: the field stays under it. The largest one in frame is sampled on a grid,
  //   and the claim is that most of its samples are its own fill: a surface that let the field
  //   through would tint *all* of them, while the text and rules inside a card only move a few.
  const surface = await page.evaluate(() => {
    let best = null;
    for (const el of document.querySelectorAll("main *")) {
      const style = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      const opaque = style.backgroundColor !== "rgba(0, 0, 0, 0)" && !style.backgroundColor.startsWith("rgba");
      if (!opaque || box.top < 110 || box.bottom > innerHeight || box.width < 120 || box.height < 60) continue;
      const area = box.width * box.height;
      if (best === null || area > best.area) {
        best = { area, el, box: { left: box.left, top: box.top, width: box.width, height: box.height } };
      }
    }
    if (!best) return null;
    const fractions = [0.15, 0.325, 0.5, 0.675, 0.85];
    return {
      name: `${best.el.tagName.toLowerCase()}.${String(best.el.className).split(" ")[0] || "-"}`,
      bg: getComputedStyle(best.el).backgroundColor,
      points: fractions.flatMap((fy) =>
        fractions.map((fx) => [Math.round(best.box.left + best.box.width * fx), Math.round(best.box.top + best.box.height * fy)]),
      ),
    };
  });
  if (surface) {
    const bg = surface.bg.match(/[\d.]+/g).slice(0, 3).map(Number);
    const checked = surface.points.filter(([x, y]) => x >= 0 && y >= 0 && x < anchorShot.width && y < anchorShot.height);
    const matches = checked.filter(([x, y]) => close(pixelAt(anchorShot, x, y), { r: bg[0], g: bg[1], b: bg[2] }, 4)).length;
    if (matches >= Math.ceil(checked.length * 0.6)) {
      pass(`${path} · ${surface.name} keeps its own fill under the field (${matches}/${checked.length} samples)`);
    } else {
      fail(`${path} · surface`, `${surface.name} matches its ${surface.bg} at only ${matches}/${checked.length} samples`);
    }
  } else {
    pass(`${path} · no opaque surface in frame to check`);
  }

  // — the field behind text: still, then the drift frozen at each extreme
  await readState(page, path, "still");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addStyleTag({ content: frozen("-180s") });
  await readState(page, path, "drift east");
  await page.addStyleTag({ content: frozen("0s") });
  await readState(page, path, "drift west");

  await context.close();
}

// — print: the whole field comes off, and the paper that prints is the paper
{
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(`${BASE}/glossary/`, { waitUntil: "load" });
  await page.emulateMedia({ media: "print" });
  await page.waitForTimeout(150);
  const display = await page.evaluate(() =>
    ["html", "body"].flatMap((root) => ["before", "after"].map((side) => getComputedStyle(document.querySelector(root), `::${side}`).display)),
  );
  const shot = PNG.sync.read(await page.screenshot());
  const paper = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const rgb = paper.match(/[\d.]+/g).slice(0, 3).map(Number);
  if (display.every((d) => d === "none")) pass("print · all four sheets are display: none");
  else fail("print · sheets", `displays read ${display.join(", ")}`);
  if (close(pixelAt(shot, 640, 60), { r: rgb[0], g: rgb[1], b: rgb[2] }, 1)) pass("print · the ground is bare paper");
  else fail("print · paper", `samples ${asHex(pixelAt(shot, 640, 60))}, not ${paper}`);
  await context.close();
}

// — scripting off: the field is CSS, so it is the same field
{
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1, javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await page.waitForTimeout(150);
  const shot = PNG.sync.read(await page.screenshot());
  const sheets = await page.evaluate(() =>
    ["html::before", "html::after", "body::before", "body::after"].map((name) => {
      const [root, side] = name.split("::");
      return getComputedStyle(document.querySelector(root), `::${side}`).backgroundImage;
    }),
  );
  if (sheets.every((image) => image !== "none")) pass("no-js · four sheets render without scripting");
  else fail("no-js · sheets", `reads ${sheets.map((s) => (s === "none" ? "none" : "ok")).join(", ")}`);
  const paper = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const rgb = paper.match(/[\d.]+/g).slice(0, 3).map(Number);
  const corner = patchMedian(shot, ANCHOR.x, ANCHOR.y);
  const tint = Math.max(Math.abs(corner.r - rgb[0]), Math.abs(corner.g - rgb[1]), Math.abs(corner.b - rgb[2]));
  if (tint >= 3) pass(`no-js · the anchor is tinted without scripting (${asHex(corner)}, ${tint} off paper)`);
  else fail("no-js · anchor", `samples ${asHex(corner)} — paper, not the family bloom`);
  await context.close();
}

// — a phone frame: the bled sheets cannot scroll the page sideways
{
  const context = await browser.newContext({ viewport: PHONE, deviceScaleFactor: 1 });
  const page = await context.newPage();
  for (const path of ["/", "/glossary/", "/elements/hydrogen/"]) {
    await page.goto(`${BASE}${path}`, { waitUntil: "load" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow <= 1) pass(`phone · ${path} does not scroll sideways (${overflow}px)`);
    else fail(`phone · ${path}`, `overflows by ${overflow}px`);
  }
  await context.close();
}

// — a lived-in window: a drift cycle costs no long task, shifts nothing, and does move
{
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  const lived = await page.evaluate(async () => {
    const long = [];
    const shifts = [];
    new PerformanceObserver((list) => long.push(...list.getEntries().length ? [list.getEntries()[0].duration] : [])).observe({ type: "longtask", buffered: true });
    new PerformanceObserver((list) => shifts.push(...list.getEntries().filter((e) => !e.hadRecentInput).map((e) => e.value))).observe({ type: "layout-shift", buffered: true });
    const transform = () => getComputedStyle(document.querySelector("html"), "::before").transform;
    const before = transform();
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
    return { bonus: long.length, shifts: shifts.reduce((a, b) => a + b, 0), moved: before !== transform(), frames: frames.length, medianGap: frames.sort((a, b) => a - b)[frames.length >> 1] };
  });
  if (lived.bonus === 0) pass("lived-in · a drift window runs no long task");
  else fail("lived-in · long task", `${lived.bonus} long task(s) during the drift`);
  if (lived.shifts === 0) pass("lived-in · the field shifts nothing");
  else fail("lived-in · shift", `layout shift ${lived.shifts}`);
  if (lived.moved) pass(`lived-in · the sheets moved under the reader (${lived.frames} frames, median gap ${lived.medianGap.toFixed(1)}ms)`);
  else fail("lived-in · still", "the transform did not change across the window");
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
