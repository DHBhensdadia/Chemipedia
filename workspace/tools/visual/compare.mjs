/**
 * ChemiPedia visual verification harness — Track B of `docs/research/02-tooling-and-visual-verification.md`.
 *
 * Development only. It is not part of the site, is never loaded by a browser, and the site runs
 * without it. Its job is the one thing an agent without a compositing preview cannot do: put the
 * reference and our build in the same headless browser, capture both, and say exactly where they
 * differ — in pixels and in computed measurements.
 *
 * Usage:
 *   node compare.mjs --ours http://127.0.0.1:4180/ --reference https://example.com/ \
 *                    --label home --widths 1280,768,375
 *
 * Output (in `workspace/screenshots/<label>/`):
 *   ours-<w>.png, reference-<w>.png, diff-<w>.png, table-ours-<w>.png, table-reference-<w>.png …
 *   report.json — the measurements, the pixel mismatch per band, and the region crops
 *
 * The browser is the system Chrome (`channel: "chrome"`), so no browser download is needed and
 * both pages are rendered by the same engine on the same machine — the reproducibility caveat the
 * research note records.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_ROOT = resolve(HERE, "..", "..", "screenshots");

/** Every width a phase's visual gate runs at. */
const DEFAULT_WIDTHS = [1280, 768, 375];
const VIEWPORT_HEIGHT = 900;

/**
 * The measurement probe, run in both pages.
 *
 * Every metric names a list of candidate selectors and reports the first one that matched, so the
 * same probe works on our markup and on the reference's. A metric that matched nothing is reported
 * as `null` rather than silently omitted — a missing metric is a finding, not a gap.
 */
const PROBE = `(() => {
  const rect = (el) => {
    const b = el.getBoundingClientRect();
    return { w: +b.width.toFixed(2), h: +b.height.toFixed(2), x: +b.x.toFixed(2), y: +b.y.toFixed(2) };
  };
  const first = (selectors) => {
    for (const selector of selectors) {
      try { const el = document.querySelector(selector); if (el) return el; } catch {}
    }
    return null;
  };
  const style = (selectors, properties) => {
    const el = first(selectors);
    if (!el) return null;
    const computed = getComputedStyle(el);
    const out = { rect: rect(el) };
    for (const property of properties) out[property] = computed[property];
    return out;
  };
  const widest = (selector) => {
    const all = [...document.querySelectorAll(selector)];
    return all.sort((one, other) => other.getBoundingClientRect().width - one.getBoundingClientRect().width)[0] || null;
  };
  const finderInput = widest("input[type=search]") || widest("input[type=text]");
  const finderForm = finderInput ? finderInput.form : null;
  const finderButton = finderForm ? finderForm.querySelector("button, input[type=submit]") : null;
  const twoColumn = [...document.querySelectorAll("main section, main > div, section")]
    .filter((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length === 2 && el.getBoundingClientRect().width > 300)
    .map((el) => ({ cls: String(el.className).slice(0, 40), columns: getComputedStyle(el).gridTemplateColumns, gap: getComputedStyle(el).columnGap, padding: getComputedStyle(el).padding, height: +el.getBoundingClientRect().height.toFixed(2) }))
    .slice(0, 4);

  return {
    viewport: { width: innerWidth, height: innerHeight },
    document: { height: document.documentElement.scrollHeight, scrollWidth: document.documentElement.scrollWidth },
    h1: style(["h1"], ["fontSize", "fontFamily", "lineHeight", "fontWeight", "letterSpacing", "color", "marginTop", "marginBottom"]),
    lede: style([".home-hero__lead", ".intro__lede", "h1 + p"], ["fontSize", "lineHeight", "color", "maxWidth", "marginTop"]),
    table: style([".pt__grid"], ["width", "marginLeft", "paddingLeft", "containerType"]),
    grid: style([".pt__grid", "[data-pt-grid]"], ["columnGap", "rowGap", "gridTemplateColumns", "gridTemplateRows", "minWidth"]),
    tile: style([".pt__grid a[href*=hydrogen]"], ["aspectRatio", "borderRadius", "padding", "backgroundColor", "color", "fontSize", "transitionDuration"]),
    symbol: style([".pt__grid a[href*=hydrogen] [class*=sym]"], ["fontSize", "fontWeight", "letterSpacing", "lineHeight", "fontFamily"]),
    number: style([".pt__grid a[href*=hydrogen] [class*=__z]"], ["fontSize", "opacity"]),
    name: style([".pt__grid a[href*=hydrogen] [class*=__name]"], ["fontSize", "opacity", "display"]),
    chip: style([".legend .chip", ".chip"], ["fontSize", "fontWeight", "padding", "borderRadius"]),
    sections: [...document.querySelectorAll("main > section, body > section.shell, section.shell")].map((el) => ({
      cls: String(el.className).replace(/^.*?(home-|shell )/, "").slice(0, 28),
      paddingTop: getComputedStyle(el).paddingTop,
      paddingBottom: getComputedStyle(el).paddingBottom,
      marginTop: getComputedStyle(el).marginTop,
      borderTop: getComputedStyle(el).borderTopWidth + " " + getComputedStyle(el).borderTopStyle,
      height: +el.getBoundingClientRect().height.toFixed(2),
    })).slice(0, 12),
    finder: finderInput
      ? {
          input: { ...rect(finderInput), ...(() => { const c = getComputedStyle(finderInput); return { fontSize: c.fontSize, padding: c.padding, borderRadius: c.borderRadius, border: c.borderWidth + " " + c.borderStyle + " " + c.borderColor, background: c.backgroundColor, lineHeight: c.lineHeight }; })() },
          button: finderButton ? { ...rect(finderButton), ...(() => { const c = getComputedStyle(finderButton); return { padding: c.padding, background: c.backgroundColor, color: c.color, borderRadius: c.borderRadius, fontSize: c.fontSize, lineHeight: c.lineHeight }; })() } : null,
          formDisplay: finderForm ? getComputedStyle(finderForm).display : null,
          formGap: finderForm ? getComputedStyle(finderForm).gap : null,
        }
      : null,
    twoColumn,
    legend: style([".legend"], ["marginTop", "marginBottom", "padding", "columnGap", "rowGap", "marginLeft"]),
    legendToGrid: (() => {
      const legend = first([".legend"]);
      const grid = first([".pt__grid", "[data-pt-grid]"]);
      if (!legend || !grid) return null;
      const a = legend.getBoundingClientRect();
      const b = grid.getBoundingClientRect();
      return +((b.top + scrollY) - (a.bottom + scrollY)).toFixed(2);
    })(),
    hydrogen: (() => {
      const tile = first([".pt__grid a[href*=hydrogen]"]);
      if (!tile) return null;
      const symbol = tile.querySelector("[class*=sym]");
      const number = tile.querySelector("[class*=__z]");
      const name = tile.querySelector("[class*=__name]");
      const computed = getComputedStyle(tile);
      const symbolStyle = symbol ? getComputedStyle(symbol) : null;
      return {
        rect: rect(tile),
        padding: computed.padding,
        borderRadius: computed.borderRadius,
        background: computed.backgroundColor,
        color: computed.color,
        gridColumn: computed.gridColumnStart,
        gridRow: computed.gridRowStart,
        symbol: symbolStyle ? { rect: rect(symbol), fontSize: symbolStyle.fontSize, fontWeight: symbolStyle.fontWeight, letterSpacing: symbolStyle.letterSpacing, lineHeight: symbolStyle.lineHeight, fontFamily: symbolStyle.fontFamily } : null,
        number: number ? rect(number) : null,
        name: name ? rect(name) : null,
      };
    })(),
    structure: (() => {
      const legend = first([".legend"]);
      const grid = first([".pt__grid", "[data-pt-grid]"]);
      const chain = [];
      let node = grid;
      for (let depth = 0; depth < 3 && node; depth += 1) {
        const computed = getComputedStyle(node);
        chain.push({ tag: node.tagName, cls: String(node.className).slice(0, 44), y: +(node.getBoundingClientRect().top + scrollY).toFixed(1), h: +node.getBoundingClientRect().height.toFixed(2), padTop: computed.paddingTop, marginTop: computed.marginTop, marginBottom: computed.marginBottom, display: computed.display });
        node = node.parentElement;
      }
      const siblings = legend ? [...legend.parentElement.children].map((el) => ({ tag: el.tagName, cls: String(el.className).slice(0, 32), y: +(el.getBoundingClientRect().top + scrollY).toFixed(1), h: +el.getBoundingClientRect().height.toFixed(2) })) : null;
      return { chain, legendParent: legend ? String(legend.parentElement.className).slice(0, 40) : null, siblings };
    })(),
    fonts: {
      families: ["Inter", "Work Sans", "Faktum", "Helvetica Neue"].filter((family) => document.fonts.check('16px "' + family + '"')),
      body: getComputedStyle(document.body).fontFamily,
    },
    counts: {
      tiles: document.querySelectorAll(".pt__grid > *").length,
      chips: document.querySelectorAll(".chip").length,
      sections: document.querySelectorAll("main > section").length,
      h1: document.querySelectorAll("h1").length,
      headings: document.querySelectorAll("h2").length,
    },
  };
})()`;

/** The region crops taken from both pages, by the box each page's own element occupies. */
const REGIONS = [
  { name: "table", selectors: [".pt__grid", ".pt"] },
  { name: "hero", selectors: ["h1", ".intro__lede"] },
  { name: "finder", selectors: [".element-search", "section.find form", "form"] },
];

/** Every measurement field the probe returns, so the report can compare them one by one. */
const MEASUREMENTS = [
  "document",
  "h1",
  "lede",
  "table",
  "grid",
  "legend",
  "legendToGrid",
  "tile",
  "symbol",
  "number",
  "name",
  "hydrogen",
  "structure",
  "chip",
  "finder",
  "fonts",
  "counts",
];

/**
 * Parse the command line.
 *
 * @param {string[]} argv
 * @returns {{ours: string, reference: string, label: string, widths: number[]}}
 */
function options(argv) {
  const flags = { label: "page", widths: DEFAULT_WIDTHS };

  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index].replace(/^--/, "");
    const value = argv[index + 1];

    flags[key] = key === "widths" ? value.split(",").map(Number) : value;
  }

  if (!flags.ours || !flags.reference) {
    throw new Error("Both --ours and --reference are required");
  }

  return flags;
}

/**
 * Capture one page at one width and read its measurements.
 *
 * @param {import("playwright").Browser} browser
 * @param {string} url
 * @param {number} width
 * @param {string} directory
 * @param {string} prefix
 * @returns {Promise<object>}
 */
async function capture(browser, url, width, directory, prefix) {
  const context = await browser.newContext({
    viewport: { width, height: VIEWPORT_HEIGHT },
    deviceScaleFactor: 1,
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [];

  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });

  await page.goto(url, { waitUntil: "load", timeout: 60_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  const measurements = await page.evaluate(PROBE);
  const viewport = join(directory, `${prefix}-${width}.png`);
  const full = join(directory, `${prefix}-${width}-full.png`);

  await page.screenshot({ path: viewport });
  await page.screenshot({ path: full, fullPage: true });

  const regions = {};

  for (const region of REGIONS) {
    for (const selector of region.selectors) {
      try {
        const locator = page.locator(selector).first();

        if ((await locator.count()) === 0) continue;

        const box = await locator.boundingBox();

        if (!box || box.width < 4 || box.height < 4) continue;

        const file = join(directory, `${region.name}-${prefix}-${width}.png`);

        await locator.screenshot({ path: file });

        const documentBox = await locator.evaluate((element) => {
          const rect = element.getBoundingClientRect();

          return { x: rect.x + scrollX, y: rect.y + scrollY, width: rect.width, height: rect.height };
        });

        regions[region.name] = {
          selector,
          box: {
            x: +documentBox.x.toFixed(2),
            y: +documentBox.y.toFixed(2),
            width: +documentBox.width.toFixed(2),
            height: +documentBox.height.toFixed(2),
          },
          file,
        };
        break;
      } catch (error) {
        regions[region.name] = { selector, error: String(error).split("\n")[0].slice(0, 140) };
        break;
      }
    }
  }

  await context.close();

  return { url, width, measurements, errors, files: { viewport, full }, regions };
}

/**
 * Compare two PNG files pixel by pixel and report the worst horizontal bands.
 *
 * @param {string} oursPath
 * @param {string} theirsPath
 * @param {string} diffPath
 * @returns {Promise<object>}
 */
async function compareImages(oursPath, theirsPath, diffPath) {
  const ours = PNG.sync.read(await readFile(oursPath));
  const theirs = PNG.sync.read(await readFile(theirsPath));
  const width = Math.min(ours.width, theirs.width);
  const height = Math.min(ours.height, theirs.height);
  const crop = (image) => {
    if (image.width === width && image.height === height) return image;

    const out = new PNG({ width, height });

    for (let y = 0; y < height; y += 1) {
      const from = (image.width * y) << 2;
      image.data.copy(out.data, (width * y) << 2, from, from + (width << 2));
    }

    return out;
  };
  const oursCropped = crop(ours);
  const theirsCropped = crop(theirs);
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(oursCropped.data, theirsCropped.data, diff.data, width, height, { threshold: 0.1 });

  await writeFile(diffPath, PNG.sync.write(diff));

  const bandHeight = 45;
  const bands = [];

  for (let top = 0; top < height; top += bandHeight) {
    const bandHeightHere = Math.min(bandHeight, height - top);
    let band = 0;

    for (let y = top; y < top + bandHeightHere; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = (width * y + x) << 2;
        const same =
          Math.abs(oursCropped.data[index] - theirsCropped.data[index]) <= 12 &&
          Math.abs(oursCropped.data[index + 1] - theirsCropped.data[index + 1]) <= 12 &&
          Math.abs(oursCropped.data[index + 2] - theirsCropped.data[index + 2]) <= 12;

        if (!same) band += 1;
      }
    }

    bands.push({ fromY: top, toY: top + bandHeightHere, mismatchPercent: +((band / (width * bandHeightHere)) * 100).toFixed(1) });
  }

  return {
    ours: { width: ours.width, height: ours.height },
    reference: { width: theirs.width, height: theirs.height },
    sizeDelta: { width: ours.width - theirs.width, height: ours.height - theirs.height },
    comparedArea: { width, height },
    mismatchedPixels: mismatched,
    mismatchPercent: +((mismatched / (width * height)) * 100).toFixed(2),
    worstBands: bands.sort((one, other) => other.mismatchPercent - one.mismatchPercent).slice(0, 6),
    diff: diffPath,
  };
}

/**
 * The measurements that differ between the two pages, as rows a person can read.
 *
 * @param {object} ours
 * @param {object} reference
 * @returns {string[]}
 */
function differences(ours, reference) {
  const rows = [];
  const walk = (path, one, other) => {
    if (one && other && typeof one === "object" && typeof other === "object" && !Array.isArray(one)) {
      for (const key of new Set([...Object.keys(one), ...Object.keys(other)])) {
        walk(path ? `${path}.${key}` : key, one[key], other[key]);
      }

      return;
    }

    if (Array.isArray(one) || Array.isArray(other)) {
      rows.push(`${path}: ours ${JSON.stringify(one)} · reference ${JSON.stringify(other)}`);

      return;
    }

    if (typeof one === "number" && typeof other === "number") {
      if (Math.abs(one - other) > 0.5) rows.push(`${path}: ours ${one} · reference ${other} (${one - other > 0 ? "+" : ""}${+(one - other).toFixed(2)})`);

      return;
    }

    if (String(one) !== String(other)) rows.push(`${path}: ours ${one} · reference ${other}`);
  };

  for (const metric of MEASUREMENTS) walk(metric, ours[metric], reference[metric]);

  return rows;
}

const flags = options(process.argv.slice(2));
const directory = join(OUT_ROOT, flags.label);

await mkdir(directory, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const report = { label: flags.label, ours: flags.ours, reference: flags.reference, widths: [], generatedAt: new Date().toISOString() };

for (const width of flags.widths) {
  const ours = await capture(browser, flags.ours, width, directory, "ours");
  const reference = await capture(browser, flags.reference, width, directory, "reference");
  const pixels = await compareImages(ours.files.viewport, reference.files.viewport, join(directory, `diff-${width}.png`));
  const regions = {};

  for (const name of Object.keys(ours.regions)) {
    if (reference.regions[name]) {
      regions[name] = {
        ours: ours.regions[name].box,
        reference: reference.regions[name].box,
        pixels: await compareImages(ours.regions[name].file, reference.regions[name].file, join(directory, `${name}-diff-${width}.png`)),
      };
    }
  }

  report.widths.push({ width, ours: ours.measurements, reference: reference.measurements, errors: { ours: ours.errors, reference: reference.errors }, pixels, regions });
}

await browser.close();
await writeFile(join(directory, "report.json"), JSON.stringify(report, null, 2));

for (const entry of report.widths) {
  console.log(`\n=== ${entry.width}px — viewport ${entry.pixels.mismatchPercent}% different ===`);

  for (const [name, region] of Object.entries(entry.regions)) {
    const size = region.pixels?.sizeDelta ?? {};

    console.log(
      `  ${name}: ours ${region.ours.width}×${region.ours.height} at y${region.ours.y} · reference ${region.reference.width}×${region.reference.height} at y${region.reference.y}` +
        (region.pixels ? ` · ${size.width || size.height ? `size differs by ${size.width}×${size.height}` : "same size"} · pixels ${region.pixels.mismatchPercent}%` : ` · ${region.error}`),
    );

    for (const band of region.pixels?.worstBands ?? []) {
      console.log(`      band y ${band.fromY}–${band.toY}: ${band.mismatchPercent}% different`);
    }
  }

  const rows = differences(entry.ours, entry.reference);

  console.log(`  measurements that differ (${rows.length}):`);

  for (const row of rows) console.log(`    ${row}`);

  if (entry.errors.ours.length || entry.errors.reference.length) {
    console.log(`  errors — ours: ${JSON.stringify(entry.errors.ours)} reference: ${JSON.stringify(entry.errors.reference)}`);
  }
}

console.log(`\nReport: ${join(directory, "report.json")}`);
