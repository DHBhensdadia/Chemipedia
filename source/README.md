# `source/` — shipped code

Everything in this folder is loaded by a browser. Nothing else belongs here: no plans, no notes, no
research, no screenshots of the design reference. Those live in sibling `../workspace/`.

The rule that decides it: **does the browser load it?** Yes → here. No → `../workspace/`.

## What will live here

| Path | Contents |
|---|---|
| `index.html` | The home page's authored template |
| `pages/` | One authored HTML template per page family |
| `scripts/` | `app.js` entry point, `router/`, `data/` repositories, `components/`, `pages/`, and `lib/` pure helpers |
| `styles/` | `tokens.css` (every design value), `base.css`, `layout.css`, plus per-component and per-page stylesheets. One theme only — light (ADR-006). |
| `data/` | `elements.json`, `glossary.json`, `categories.json`, `units.json` |
| `assets/` | Our brand artwork and any self-hosted fonts |
| `tools/` | Plain-Node development tooling: the dev server, the data build script, the site build script |
| `tests/` | Node's built-in test runner. No dependencies. |

This folder is populated phase by phase. The full tree, with the responsibility of every file, is in
[`../workspace/guides/02-tour-of-the-codebase.md`](../workspace/guides/02-tour-of-the-codebase.md),
and the index of every file actually present is in
[`../workspace/docs/MIND_MAP.md`](../workspace/docs/MIND_MAP.md).

## The rules that apply here

- JavaScript ES modules only. No TypeScript, no framework, no npm package required at runtime.
- One page family = one folder. One component = one module plus one stylesheet of the same name.
- No file over 400 lines. No `utils.js`, `helpers.js`, `misc.js` or `common.js`.
- No literal colour, size, radius or duration outside `styles/tokens.css`.
- No file named after a phase. Files are named after what they own.
- The brand rules in [`../workspace/docs/BRAND_GUIDELINES.md`](../workspace/docs/BRAND_GUIDELINES.md)
  are enforced by a scan before every milestone commit.

## Before you change anything

Read [`../workspace/AGENTS.md`](../workspace/AGENTS.md). It is short and it is binding.
