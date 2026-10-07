/**
 * The accessibility sweep, across one page per family (nineteen of them).
 *
 * It answers the questions a code review cannot: is there one h1 and does the outline ever skip a
 * level, is every landmark present exactly once, does every control have a name, is every table
 * captioned, does every text colour reach WCAG AA against the surface it is actually painted on
 * (compositing every translucent layer, any `opacity` on the text itself, and every `color-mix()`
 * between the text and the page), does the
 * table keep one roving tab stop and move with the arrow keys, and does anything still animate when
 * the reader has asked for reduced motion.
 *
 * Usage: `node audit-a11y.mjs` against a running dev server, or `BASE=... node audit-a11y.mjs`.
 * It exits non-zero if it finds a defect, so it can gate a phase; the informational lines (the HTTP
 * status, the live regions a page declares, the table's roving-stop count) do not fail the run.
 */

import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://127.0.0.1:4180";

const PAGES = [
  "/",
  "/elements/",
  "/elements/hydrogen/",
  "/elements/uranium/",
  "/atoms/",
  "/properties/melting-point/",
  "/properties/orbital-configuration/",
  "/periodic-table/properties-and-states/",
  "/periodic-table/orbitals/",
  "/periodic-table/electronegativity/",
  "/periodic-table/evolution/",
  "/element-groups/",
  "/element-groups/noble-gases/",
  "/glossary/",
  "/glossary/absolute-zero/",
  "/calculators/temperature/",
  "/downloads/",
  "/about/",
  "/contact/",
  "/404.html",
];

const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const findings = [];
const errors = [];

page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
page.on("pageerror", (error) => errors.push(error.message));

const report = (path, kind, detail) => findings.push(`${path}  ${kind}: ${detail}`);

for (const path of PAGES) {
  errors.length = 0;
  const response = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });

  const audit = await page.evaluate(() => {
    const rgb = (value) => {
      const legacy = value.match(/^rgba?\(([^)]+)\)$/);

      if (legacy) {
        const parts = legacy[1].split(/[\s,/]+/).filter(Boolean).map(Number);

        return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
      }

      // `color-mix()` computes to `color(srgb r g b / a)`, with channels from 0 to 1.
      const modern = value.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)$/);

      if (modern) {
        return {
          r: Number(modern[1]) * 255,
          g: Number(modern[2]) * 255,
          b: Number(modern[3]) * 255,
          a: modern[4] === undefined ? 1 : Number(modern[4]),
        };
      }

      return null;
    };
    const over = (front, back) => ({
      r: front.r * front.a + back.r * (1 - front.a),
      g: front.g * front.a + back.g * (1 - front.a),
      b: front.b * front.a + back.b * (1 - front.a),
      a: 1,
    });
    const luminance = ({ r, g, b }) => {
      const channel = (value) => {
        const v = value / 255;

        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      };

      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };
    const contrast = (a, b) => {
      const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);

      return (light + 0.05) / (dark + 0.05);
    };
    /** The colour behind an element: the page's own background with every layer above it painted. */
    const backdrop = (element) => {
      const layers = [];
      let node = element;

      while (node && node !== document.documentElement.parentElement) {
        const { backgroundColor } = getComputedStyle(node);
        const colour = backgroundColor === "transparent" ? null : rgb(backgroundColor);

        if (colour && colour.a > 0) {
          layers.push(colour);

          if (colour.a === 1) {
            break;
          }
        }

        node = node.parentElement;
      }

      return layers.reverse().reduce((behind, layer) => over(layer, behind), { r: 255, g: 255, b: 255, a: 1 });
    };

    const text = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set();

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const content = node.textContent.trim();

      if (content.length === 0) {
        continue;
      }

      const element = node.parentElement;

      if (!element || seen.has(element) || element.closest("[aria-hidden='true']")) {
        continue;
      }

      const style = getComputedStyle(element);

      if (style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0) {
        continue;
      }

      if (style.clipPath !== "none" || (style.position === "absolute" && style.width === "1px")) {
        continue; // the visually hidden pattern: it is for screen readers, not for pixels
      }

      seen.add(element);

      const painted = rgb(style.color);

      if (!painted) {
        continue;
      }

      // An element's own `opacity` fades its text towards whatever is behind it, which is how a
      // tile's atomic number is made secondary — and it is composited before anyone reads the
      // colour, so a sweep that reads `color` alone reports a ratio the reader never sees.
      const colour = { ...painted, a: painted.a * Number(style.opacity) };
      const size = parseFloat(style.fontSize);
      const weight = Number(style.fontWeight) || 400;
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      const behind = backdrop(element);
      const ratio = contrast(colour.a < 1 ? over(colour, behind) : colour, behind);

      if (ratio < (large ? 3 : 4.5)) {
        text.push({ sample: content.slice(0, 40), size, weight, ratio: Math.round(ratio * 100) / 100 });
      }
    }

    const ids = [...document.querySelectorAll("[id]")].map((element) => element.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => Number(h.tagName[1]));
    const unnamed = [...document.querySelectorAll("input, select, textarea, button")].filter(
      (element) =>
        element.textContent.trim() === "" &&
        !element.labels?.length &&
        !element.getAttribute("aria-label") &&
        !element.getAttribute("aria-labelledby"),
    );
    const unlabelledLinks = [...document.querySelectorAll("a")].filter(
      (a) => a.textContent.trim() === "" && !a.getAttribute("aria-label") && !a.querySelector("img[alt]:not([alt=''])"),
    );
    const skip = document.querySelector("a.skip-link");
    const skipTarget = skip ? document.querySelector(skip.getAttribute("href")) : null;
    const tables = [...document.querySelectorAll("table")];

    return {
      lang: document.documentElement.lang,
      h1: document.querySelectorAll("h1").length,
      headings,
      skips: headings.filter((level, index) => index > 0 && level > headings[index - 1] + 1),
      landmarks: ["header", "main", "footer"].filter((tag) => document.querySelector(tag)),
      mains: document.querySelectorAll("main").length,
      duplicates: [...new Set(duplicates)],
      unnamed: unnamed.length,
      unlabelledLinks: unlabelledLinks.length,
      images: [...document.querySelectorAll("img")].filter((image) => !image.hasAttribute("alt")).length,
      skip: skip ? Boolean(skipTarget) : false,
      tables: tables.length,
      captions: tables.filter((table) => table.querySelector("caption")).length,
      liveRegions: [...document.querySelectorAll("[aria-live]")].map(
        (element) => `${element.getAttribute("aria-live")}/${element.getAttribute("role") ?? "none"}`,
      ),
      lowContrast: text,
    };
  });

  report(path, "status", `${response.status()}${errors.length ? ` console: ${errors.join(" | ")}` : ""}`);
  if (audit.skips.length > 0) report(path, "headings", `skip ${JSON.stringify(audit.skips)}`);
  if (audit.h1 !== 1) report(path, "headings", `${audit.h1} h1s`);
  if (audit.landmarks.join(",") !== "header,main,footer") report(path, "landmarks", audit.landmarks.join(","));
  if (audit.mains !== 1) report(path, "landmarks", `${audit.mains} main landmarks`);
  if (audit.duplicates.length > 0) report(path, "ids", `duplicated: ${audit.duplicates.join(", ")}`);
  if (audit.unnamed > 0) report(path, "names", `${audit.unnamed} unnamed control(s)`);
  if (audit.unlabelledLinks > 0) report(path, "names", `${audit.unlabelledLinks} link(s) with no text`);
  if (audit.images > 0) report(path, "images", `${audit.images} with no alt`);
  if (!audit.skip) report(path, "skip link", "no skip link or its target is missing");
  if (audit.lang !== "en") report(path, "lang", String(audit.lang));
  if (audit.tables > 0 && audit.captions !== audit.tables) {
    report(path, "tables", `${audit.tables} table(s), ${audit.captions} caption(s)`);
  }
  for (const low of audit.lowContrast) {
    report(path, "contrast", `${low.ratio}:1 at ${low.size}px/${low.weight} — "${low.sample}"`);
  }
  if (audit.liveRegions.length > 0) {
    report(path, "live", audit.liveRegions.join(" "));
  }

  // The table's own keyboard model: one roving tab stop, and the arrow keys inside it. The
  // miniature table on an element page is deliberately untabbable, so it is not the subject here.
  const grid = await page.$(".pt__grid:not(.pt--mini .pt__grid)");
  if (grid) {
    const stops = await page.$$eval(".pt__grid [tabindex='0']", (elements) => elements.length);
    const withTabIndex = await page.$$eval(".pt__grid a[tabindex]", (elements) => elements.length);
    const first = await page.$(".pt__grid [tabindex='0']");

    await first.focus();
    const before = await page.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 8));
    await page.keyboard.press("ArrowRight");
    const after = await page.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 8));
    const stillOne = await page.$$eval(".pt__grid [tabindex='0']", (elements) => elements.length);

    report(
      path,
      "table keyboard",
      `tiles ${withTabIndex}, roving stops ${stops}, ${JSON.stringify(before)} -> ${JSON.stringify(after)} after ArrowRight, still ${stillOne}`,
    );
  }

  // Reduced motion, on the page as it re-renders for a reader who asked for it.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload({ waitUntil: "networkidle" });

  const animating = await page.evaluate(() =>
    [...document.querySelectorAll("*")]
      .map((element) => getComputedStyle(element))
      .filter((style) => {
        const animation = style.animationDuration === "none" ? 0 : parseFloat(style.animationDuration);
        const transition = style.transitionDuration
          .split(",")
          .reduce((most, value) => Math.max(most, parseFloat(value) || 0), 0);

        return animation > 0.01 || transition > 0.01;
      }).length,
  );

  if (animating > 0) {
    report(path, "reduced motion", `${animating} element(s) still animate`);
  }

  await page.emulateMedia({ reducedMotion: null });
}

await browser.close();

for (const finding of findings) {
  console.log(finding);
}

const defects = findings.filter((finding) => !/  (status|live|table keyboard):/.test(finding));

console.log(`\n${defects.length} defect(s) and ${findings.length - defects.length} informational line(s) across ${PAGES.length} pages.`);

if (defects.length > 0) {
  process.exitCode = 1;
}
