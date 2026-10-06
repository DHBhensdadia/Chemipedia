# ChemiPedia

An interactive periodic table and chemistry reference for the web — all 118 elements, the table
that organises them, and the glossary behind them.

Built with **plain JavaScript, HTML and CSS**. No framework, no TypeScript, no runtime dependencies.

---

## Status

**Complete at `v1.0.0`.** Eleven phases built the site, and the last of them measured it: 562 routes
plus a not-found page, every one of them rendered at build time rather than assembled by the browser,
and four gates that pass on measurement rather than on inspection.

| | |
|---|---|
| Routes the build writes | 562, plus `404.html` |
| Tests | `node --test source/tests` — the suite that must pass, with nothing installed |
| Accessibility | 0 defects across 19 pages from our own sweep; Lighthouse 100 on seven sampled pages |
| Responsive | 76 of 76 page-and-width combinations fit at 375 / 768 / 1024 / 1440 |
| Performance | worst layout shift 0, slowest cold load 41ms, no long task on any page |
| SEO | Lighthouse 100: canonical, Open Graph, JSON-LD, `sitemap.xml` and `robots.txt` |

| | |
|---|---|
| Current phase | see [`workspace/RUN_STATE.md`](workspace/RUN_STATE.md) |
| Phase status and every phase's evidence | [`workspace/progress/PHASE_LOG.md`](workspace/progress/PHASE_LOG.md) |
| What was built, and in what order | [`workspace/docs/IMPLEMENTATION_PLAN.md`](workspace/docs/IMPLEMENTATION_PLAN.md) |

## Repository layout

```
source/       All shipped code. Nothing that is not shipped code.
workspace/    All planning, research, documentation and progress tracking.
```

The rule that decides which is which: *does the browser load it?* Yes → `source/`. No →
`workspace/`.

## Running it locally

```bash
node source/tools/serve.js
```

Then open the URL it prints — `http://localhost:4173/` unless that port is taken. No install step
and no dependencies: the build and the development server are plain Node, and the server builds the
site for you if it has not been built yet.

The individual steps, if you want them:

```bash
git clone <this repository> && cd chemipedia
node source/tools/build.js     # render every declared route into dist/
node source/tools/serve.js     # serve dist/ locally
node --test source/tests       # run the test suite
```

The same three commands are available as `npm run build`, `npm start` and `npm test`. The built
output lives in `dist/`, which git ignores: the repository holds authored source, and the site is
generated from it.

## The quality gates

`node --test source/tests` is the gate that must pass, and it needs nothing installed. The four
sweeps behind the table above are development-only: they live in `workspace/tools/visual`, drive the
system Chrome through Playwright, and are the evidence rather than the opinion.

```bash
node source/tools/serve.js --port 4180 &
cd workspace/tools/visual && npm install
node audit-a11y.mjs         # 19 pages: landmarks, headings, names, contrast, keyboard, motion
node audit-responsive.mjs   # every page at 375 / 768 / 1024 / 1440
node audit-performance.mjs  # six pages: timings, bytes, layout shift, long tasks
node audit-lighthouse.mjs   # Lighthouse's own four categories, seven pages
```

Each of them exits non-zero on the defect it owns — an unreadable colour, a page that scrolls
sideways, a page that moves after it has painted, a category under budget — so a phase can gate on
them. `workspace/tools/visual/README.md` says how to read their output and what each number means.
None of them is required to run the site, build it or test it.

## Publishing it

The site is static, so publishing is copying `dist/` to any host that serves files. One thing has to
be set first: the address the pages claim to live at. Every page carries a canonical link and Open
Graph metadata, and the build writes `sitemap.xml` and `robots.txt`; all four need an absolute URL,
and the build defaults to a placeholder that cannot resolve and says so on every run.

```bash
SITE_ORIGIN=https://example.org node source/tools/build.js   # then publish dist/
```

Set `SITE_ORIGIN` to the deployed origin, with no trailing slash. Serve directory URLs —
`/elements/hydrogen/` is canonical and `/elements/hydrogen` redirects to it — and answer an unknown
path with `dist/404.html` at the same status code, which is what GitHub Pages and Netlify both do by
default.

### GitHub Pages

`.github/workflows/pages.yml` is the whole deployment, and it is the two commands above: it works
out the address the site will be served from, builds with `SITE_ORIGIN` set to it, runs the suite,
and hands `dist/` to Pages. Enable Pages for the repository with **Source: GitHub Actions**, and
every push to `main` publishes — nothing else has to be configured, because the site is static and
the build has no dependencies. The fallback is the host's: an unknown path is answered with the
built `404.html`.

## Working on it

**Read [`workspace/AGENTS.md`](workspace/AGENTS.md) first.** It is the mandatory entry point and it
is binding — the rules for layout, branding, scope, quality, recovery and commits all live behind it.
Nothing in `source/` should be touched before that sequence has been followed.

## What this is not

The **Learn** and **Games** sections of the site whose design this project reproduces are out of
scope, deliberately. They are not stubbed and not planned.

## Data and attribution

Element facts come from an openly licensed dataset, transformed by a committed script. All prose is
written for this project. Provenance, licences and the data schema are recorded in
[`workspace/docs/DATA_SOURCES.md`](workspace/docs/DATA_SOURCES.md).

---

*Authored by Devansh — [`DHBhensdadia`](https://github.com/DHBhensdadia).*
