/**
 * The Lighthouse baseline.
 *
 * The three sweeps beside this file measure the things we chose to measure; this one measures the
 * page the way an outside tool does, so the phase's promise — "Lighthouse: accessibility and
 * best-practices pass; performance and SEO recorded with a baseline" — is a number on a line rather
 * than an adjective. Lighthouse brings its own Chrome, its own mobile emulation and its own
 * throttling, and the scores are not ours to argue with.
 *
 * It runs the four categories the phase names, on seven pages: the home page, the elements index, an
 * element page, a table view, a group page, the glossary and the calculator. The group page is here
 * because it is the one page that rests in the table's isolation state, with one key at full colour
 * and the rest drained — the state Lighthouse found 109 unreadable tiles in. It prints a score per
 * category per page, names every failing accessibility, best-practices and SEO audit, and exits
 * non-zero when accessibility is not perfect or best-practices drops below its budget. Performance
 * and SEO are
 * recorded rather than gated: a score of 100 on localhost would be a claim about the harness, not
 * about the site, and the numbers that matter there are the ones the performance sweep already
 * reports in milliseconds.
 *
 * Usage: `node audit-lighthouse.mjs`, or `BASE=... node audit-lighthouse.mjs`. One run per page,
 * about ten seconds each: this is the slowest of the four tools, which is why it is the one to run
 * last.
 */

import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const BASE = process.env.BASE ?? "http://127.0.0.1:4180";
const PAGES = (
  process.env.PAGES ??
  [
    "/",
    "/elements/",
    "/elements/hydrogen/",
    "/atoms/",
    "/periodic-table/properties-and-states/",
    "/element-groups/noble-gases/",
    "/glossary/",
    "/calculators/temperature/",
  ].join(",")
).split(",");

/** The four categories the phase names, and the score each page has to reach. */
const CATEGORIES = [
  { id: "accessibility", budget: 1 },
  { id: "best-practices", budget: 0.95 },
  { id: "performance", budget: null },
  { id: "seo", budget: null },
];

/** The categories whose failing audits are worth printing in full: the ones with a budget. */
const NAMED = ["accessibility", "best-practices", "seo"];

const chrome = await launch({ chromeFlags: ["--headless=new"] });
const rows = [];
const defects = [];

for (const path of PAGES) {
  const { lhr } = await lighthouse(`${BASE}${path}`, {
    port: chrome.port,
    output: "json",
    logLevel: "error",
    onlyCategories: CATEGORIES.map(({ id }) => id),
  });

  const scores = Object.fromEntries(
    CATEGORIES.map(({ id }) => [id, lhr.categories[id] ? Math.round(lhr.categories[id].score * 100) : null]),
  );

  rows.push({ path, scores });

  for (const { id, budget } of CATEGORIES) {
    if (scores[id] === null || budget === null || scores[id] / 100 >= budget) {
      continue;
    }

    defects.push({ path, id, score: scores[id], budget: Math.round(budget * 100) });
  }

  for (const id of NAMED) {
    for (const audit of failingAudits(lhr, id)) {
      console.log(`  ${path} ${id}: ${audit}`);
    }
  }
}

await chrome.kill();

console.log(
  "\npage                                     accessibility  best-practices  performance  seo  (0–100)",
);

for (const { path, scores } of rows) {
  console.log(
    `${path.padEnd(40)} ${String(scores.accessibility).padStart(13)}  ${String(scores["best-practices"]).padStart(14)}  ${String(scores.performance).padStart(11)}  ${String(scores.seo).padStart(3)}`,
  );
}

const mean = (id) =>
  Math.round(rows.reduce((total, row) => total + row.scores[id], 0) / rows.length);

console.log(
  `\nMean over ${rows.length} pages: accessibility ${mean("accessibility")}, best-practices ${mean("best-practices")}, performance ${mean("performance")}, seo ${mean("seo")}.`,
);

if (defects.length > 0) {
  console.error(`\n${defects.length} page(s) under budget:`);

  for (const { path, id, score, budget } of defects) {
    console.error(`  ${path} ${id} ${score} < ${budget}`);
  }

  process.exitCode = 1;
}

/**
 * The audits a category failed, as human-readable lines.
 *
 * An audit that does not apply to the page, or that reports information rather than a pass or a
 * fail, is left out: what is wanted here is the list to fix, not the list to read.
 *
 * @param {object} lhr the Lighthouse result for one page
 * @param {string} category
 * @returns {string[]}
 */
function failingAudits(lhr, category) {
  const refs = lhr.categories[category]?.auditRefs ?? [];

  return refs
    .map(({ id }) => lhr.audits[id])
    .filter((audit) => audit && audit.score === 0)
    .map((audit) => `${audit.id} — ${audit.title}`);
}
