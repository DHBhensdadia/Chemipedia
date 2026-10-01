# ChemiPedia

An interactive periodic table and chemistry reference for the web — all 118 elements, the table
that organises them, and the glossary behind them.

Built with **plain JavaScript, HTML and CSS**. No framework, no TypeScript, no runtime dependencies.

---

## Status

**In development.** This repository is built in phases, and the plan, the current state and the
rules for working on it live in [`workspace/`](workspace/). The foundation is in place — the route
manifest, the static build and the development server all work — and the design system is next. The
site currently serves one placeholder page rather than the periodic table.

| | |
|---|---|
| Current phase | see [`workspace/RUN_STATE.md`](workspace/RUN_STATE.md) |
| Phase status | see [`workspace/progress/PHASE_LOG.md`](workspace/progress/PHASE_LOG.md) |
| What is being built, and in what order | [`workspace/docs/IMPLEMENTATION_PLAN.md`](workspace/docs/IMPLEMENTATION_PLAN.md) |

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
