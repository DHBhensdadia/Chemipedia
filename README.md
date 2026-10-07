# ChemiPedia

An interactive periodic table and chemistry reference for the web — all 118 elements, the table
that organises them, and the glossary behind them.

Built with **plain JavaScript, HTML and CSS**. No framework, no TypeScript, no runtime dependencies.

---

## Status

**Complete at `v1.0.1`**, and published: **<https://dhbhensdadia.github.io/Chemipedia/>**, rebuilt and
redeployed by `.github/workflows/pages.yml` on every push to `main`.

Twelve phases built the site, and the last of them measured it: 562 routes plus a not-found page, every
one of them rendered at build time rather than assembled by the browser, and four gates that pass on
measurement rather than on inspection.

**Four more phases added its one page that draws.** `/atoms/` — in the navigation as *Atoms*, and
reachable from every element page — draws the chosen element as a three-dimensional atom: a nucleus of
protons and neutrons, electrons orbiting on their shells, a camera a reader can swing, and a
translucent bar driving it. It is hand-written WebGL2 (`docs/ARCHITECTURE.md`, ADR-007), it adds no
dependency and no data, and it degrades to the element's own shell diagram rather than to a blank
stage. **It is on `feature/atom-3d` until the author merges it**; everything below is measured on that
branch.

| | |
|---|---|
| Published at | <https://dhbhensdadia.github.io/Chemipedia/> — a GitHub Pages project site, so served from the path `/Chemipedia/` rather than from a domain root |
| Routes the build writes | 563, plus `404.html` |
| Tests | `node --test source/tests` — 658 passing, 0 failing, with nothing installed |
| Accessibility | 0 defects across 20 pages from our own sweep; Lighthouse 100 on eight sampled pages |
| Responsive | 80 of 80 page-and-width combinations fit at 375 / 768 / 1024 / 1440 |
| Performance | worst layout shift 0, slowest cold load 25–41ms across the recorded runs, no long task on any page, and `/atoms/` holds the browser's 16.70ms frame cadence with its heaviest atom turning |
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

**Requires Node 20 or newer** — that is the whole list. There is no install step, no `node_modules`
and no build tool beyond `node` itself.

```bash
git clone <this repository> && cd chemipedia
node source/tools/serve.js
```

It prints the address it is serving on, and that is the one to open:

```
Built 563 routes into dist/          <- only when dist/ is missing or you pass --rebuild
Serving dist/ at http://localhost:4173/   (Ctrl+C to stop)
```

Open `http://localhost:4173/` and the home page is there — the periodic table, its group chips, and
an element page behind every tile. The server binds `127.0.0.1` only, so nothing is reachable from
another machine. `/styleguide/` is the design system on one page; it is development-only, served
from the source tree, and never built or deployed.

**If the port is already in use** the server stops and says so rather than picking another:

```
Error: Port 4173 is already in use. Pass --port <number> to choose another.
```

(It is a start-up failure rather than a request one, so it surfaces as an unhandled rejection: Node
prints the stack above that message and the process exits `1`.)

So run it on a port of your own with `node source/tools/serve.js --port 4180`, or set `PORT`. The
other two options are `--rebuild` (build before serving even if `dist/` exists) and `--help`.

The individual steps, if you want them separately:

```bash
git clone <this repository> && cd chemipedia
node source/tools/build.js     # render every route into dist/   -> "Built 563 routes and the not-found page"
node source/tools/serve.js     # serve dist/ locally
node --test source/tests       # run the test suite             -> "tests 658 · pass 658 · fail 0"
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
node audit-a11y.mjs         # 20 pages: landmarks, headings, names, contrast, keyboard, motion
node audit-responsive.mjs   # every page at 375 / 768 / 1024 / 1440
node audit-performance.mjs  # seven pages: timings, bytes, layout shift, long tasks
node audit-lighthouse.mjs   # Lighthouse's own four categories, eight pages
node audit-atom.mjs         # the atoms page itself: 57 claims, from its pixels to its keyboard
node audit-atom-scene.mjs   # the style guide driving the model: all 118 elements, every extreme
node audit-atom-renderer.mjs # the drawing layer on the style guide: buffers, calls and pixels
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

**An address that is not a domain root carries its path.** This site's own address is
`https://dhbhensdadia.github.io/Chemipedia`, where the site lives under the path named after its
repository — so `SITE_ORIGIN` includes that path, and the build places every URL it writes inside
it, because a stylesheet asked for at `/styles/base.css` would be asked of the domain root, where
nothing is. The one link the browser writes after the page has loaded — the finder's list of matches
— is placed there by `scripts/lib/site-path.js`, which reads the site's path off its own module's
address: the one address guaranteed to be inside the site, wherever the site is put.

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
scope, deliberately. They are not stubbed and not planned. Neither are the `/periodic-table` and
`/statistics` pages of the second reference the atom viewer was measured against — the author's
instruction was one page of it, and one page is what was built.

## Data and attribution

Element facts come from an openly licensed dataset, transformed by a committed script. All prose is
written for this project. Provenance, licences and the data schema are recorded in
[`workspace/docs/DATA_SOURCES.md`](workspace/docs/DATA_SOURCES.md).

---

*Authored by Devansh — [`DHBhensdadia`](https://github.com/DHBhensdadia).*
