/**
 * The responsive sweep, over one page per family at four widths.
 *
 * The failure this is built to catch is a page that scrolls sideways: a grid track whose minimum is
 * its content, a table that will not shrink, an image with no max-width, a fixed dimension that
 * only fits a desktop. It reports the page's own overflow, and then the elements whose right edge
 * leaves the viewport, so a finding names the culprit rather than the symptom.
 *
 * The periodic table is deliberately not one of them: it keeps its eighteen columns and scrolls
 * inside its own `.pt__scroller`, which is the recorded exception in `docs/DESIGN_SYSTEM.md`. What
 * is checked is that the *page* does not scroll: the scroller's own overflow is the design.
 *
 * Usage: `node audit-responsive.mjs` against a running dev server, or `BASE=... node audit-responsive.mjs`.
 * It exits non-zero if any page overflows at any width.
 */

import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://127.0.0.1:4180";
const WIDTHS = [375, 768, 1024, 1440];

const PAGES = [
  "/",
  "/elements/",
  "/elements/hydrogen/",
  "/elements/uranium/",
  "/properties/melting-point/",
  "/properties/boiling-point/",
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
];

const browser = await chromium.launch({ channel: "chrome" });
const findings = [];

for (const width of WIDTHS) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await context.newPage();

  for (const path of PAGES) {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });

    const measured = await page.evaluate(() => {
      const scroller = document.querySelector(".pt__scroller");
      const root = document.documentElement;
      const overflow = root.scrollWidth - root.clientWidth;
      const offenders = [];

      for (const element of document.querySelectorAll("body *")) {
        const box = element.getBoundingClientRect();

        if (box.width === 0 || box.height === 0) {
          continue;
        }

        // Inside the table's own scroller, and inside anything that scrolls on purpose.
        if (scroller && scroller.contains(element)) {
          continue;
        }

        if (element.closest("[class*=scroller]")) {
          continue;
        }

        if (box.right > root.clientWidth + 1) {
          const name = `${element.tagName.toLowerCase()}.${String(element.className).split(" ")[0] || "-"}`;

          if (!offenders.some((found) => found.name === name)) {
            offenders.push({ name, right: Math.round(box.right), width: Math.round(box.width) });
          }
        }
      }

      return { overflow, offenders: offenders.slice(0, 4), scroller: scroller ? Math.round(scroller.scrollWidth) : null };
    });

    findings.push({
      path,
      width,
      overflow: measured.overflow,
      offenders: measured.offenders,
      scroller: measured.scroller,
    });

    if (measured.overflow > 1) {
      console.error(
        `${path} at ${width}: the page overflows by ${measured.overflow}px` +
          (measured.offenders.length > 0 ? ` — ${measured.offenders.map((o) => `${o.name} to ${o.right}`).join(", ")}` : ""),
      );
    }
  }

  await context.close();
}

await browser.close();

for (const finding of findings) {
  console.log(
    `${String(finding.width).padStart(4)}  ${finding.path.padEnd(38)} overflow ${String(finding.overflow).padStart(3)}` +
      (finding.scroller === null ? "" : `  (its table scrolls to ${finding.scroller})`),
  );
}

const overflowing = findings.filter((finding) => finding.overflow > 1);

console.log(`\n${findings.length - overflowing.length} of ${findings.length} page-and-width combinations fit their viewport.`);

if (overflowing.length > 0) {
  process.exitCode = 1;
}
