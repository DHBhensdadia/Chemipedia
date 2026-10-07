/**
 * The performance measurement, on a cold cache and a fresh context per page.
 *
 * What it records is what the browser saw rather than what a file size suggests: the navigation
 * timings, the bytes actually transferred by initiator, the element count, how much the page moved
 * after paint (cumulative layout shift, which is where a table of 118 tiles would show a badly
 * sequenced render), and every long task the main thread ran. The table is written at build time,
 * so the question this answers is not "does the JS render it" but "does the page arrive, draw once,
 * and stay still".
 *
 * Usage: `node audit-performance.mjs`, or `BASE=... node audit-performance.mjs`. Like the two
 * other sweeps it is a gate: it exits non-zero on a page that moves more than a tenth of a viewport
 * after paint or that takes longer than two seconds to load, so a phase can hold a budget rather
 * than an impression. Long tasks are printed and do not fail the run — one 60ms task on a slow
 * machine is noise, while a shift is the page's own sequencing being wrong.
 */

import { chromium } from "playwright";

/** Cumulative layout shift's "good" boundary, which is what a reader experiences as still. */
const SHIFT_BUDGET = 0.1;

/** Milliseconds a cold load over loopback may take; the recorded baseline is under 40. */
const LOAD_BUDGET = 2000;

const BASE = process.env.BASE ?? "http://127.0.0.1:4180";
const PAGES = [
  "/",
  "/elements/",
  "/elements/hydrogen/",
  "/atoms/",
  "/periodic-table/properties-and-states/",
  "/glossary/",
  "/calculators/temperature/",
];

const browser = await chromium.launch({ channel: "chrome" });
const rows = [];

for (const path of PAGES) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });

  await context.addInitScript(() => {
    window.__perf = { shift: 0, longTasks: [] };

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          window.__perf.shift += entry.value;
        }
      }
    }).observe({ type: "layout-shift", buffered: true });

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__perf.longTasks.push(Math.round(entry.duration));
      }
    }).observe({ type: "longtask", buffered: true });
  });

  const page = await context.newPage();
  await page.goto(`${BASE}${path}`, { waitUntil: "load" });
  await page.waitForTimeout(400); // let the behaviour attach and the observers flush

  const stats = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource");
    const byType = new Map();

    for (const resource of resources) {
      const kind = resource.initiatorType || "other";
      const running = byType.get(kind) ?? { count: 0, bytes: 0 };

      running.count += 1;
      running.bytes += resource.transferSize || 0;
      byType.set(kind, running);
    }

    const stylesheets = [...document.querySelectorAll("link[rel=stylesheet]")];
    const headScripts = [...document.querySelectorAll("head script")];

    return {
      responseEnd: Math.round(navigation.responseEnd),
      firstPaint: Math.round(performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0),
      domContentLoaded: Math.round(navigation.domContentLoadedEventEnd),
      load: Math.round(navigation.loadEventEnd),
      elements: document.querySelectorAll("*").length,
      tiles: document.querySelectorAll(".tile").length,
      stylesheets: stylesheets.length,
      headScripts: headScripts.length,
      resources: resources.length,
      bytes: resources.reduce((total, resource) => total + (resource.transferSize || 0), 0),
      byType: Object.fromEntries(byType),
      shift: Math.round(window.__perf.shift * 1000) / 1000,
      longTasks: window.__perf.longTasks,
      html: Math.round(document.documentElement.outerHTML.length),
    };
  });

  rows.push({ path, ...stats });
  await context.close();
}

await browser.close();

console.log("page                                     response  paint   DCL   load   KB  elements  tiles  shift  longtasks  css  head-js");
for (const row of rows) {
  const kb = Math.round(row.bytes / 1024);

  console.log(
    `${row.path.padEnd(40)} ${String(row.responseEnd).padStart(6)}  ${String(row.firstPaint).padStart(5)}  ${String(row.domContentLoaded).padStart(4)}  ${String(row.load).padStart(4)}  ${String(kb).padStart(4)}  ${String(row.elements).padStart(8)}  ${String(row.tiles).padStart(5)}  ${String(row.shift).padStart(5)}  ${String(row.longTasks.join(",") || "-").padStart(9)}  ${String(row.stylesheets).padStart(3)}  ${String(row.headScripts).padStart(7)}`,
  );
}

const worstShift = Math.max(...rows.map((row) => row.shift));
const slowest = Math.max(...rows.map((row) => row.load));

console.log(`\nCold load, 1280px: worst layout shift ${worstShift}, slowest load ${slowest}ms, ${rows.reduce((total, row) => total + row.longTasks.length, 0)} long task(s) in total.`);

const overBudget = rows.filter((row) => row.shift > SHIFT_BUDGET || row.load > LOAD_BUDGET);

if (overBudget.length > 0) {
  console.error(
    `\n${overBudget.length} page(s) over budget (shift ${SHIFT_BUDGET}, load ${LOAD_BUDGET}ms):`,
  );

  for (const row of overBudget) {
    console.error(`  ${row.path} shift ${row.shift}, load ${row.load}ms`);
  }

  process.exitCode = 1;
}
