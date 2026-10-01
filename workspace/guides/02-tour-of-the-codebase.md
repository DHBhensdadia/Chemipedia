# Guide 2 — Tour of the codebase

> **Status note.** This guide describes the structure the project is building toward, which follows
> **ADR-001 Option A** in `workspace/docs/ARCHITECTURE.md`. If ADR-001 is accepted as a different
> option, the folder names below change and this guide is corrected in the same commit. Everything
> else — the layering rules, the naming rules — holds regardless of which option is chosen.

## The one rule that decides everything

> **Does the browser load it?**
>
> - **Yes** → it belongs in `source/`.
> - **No** → it belongs in `workspace/`.

`source/` is shipped code and nothing else. `workspace/` is plans, research, documentation, guides,
logs and reference material. There is no third place, no "shared" folder, and no file that is
arguably both. A screenshot of the reference site does not go in `source/`. A `.js` module does not
go in `workspace/`.

This separation exists because the two kinds of file have opposite lifecycles: code is loaded by a
browser and optimised for the browser; documentation is read by humans and optimised for clarity.
Mixing them makes both harder to find and makes "what actually ships?" an unanswerable question.

## The four layers

The code is arranged in four layers. Each layer may only talk to the layer below it. Nothing skips a
layer, and nothing reaches sideways.

```
  Pages          one module per page family
     │           composes components, owns the URL, decides what navigation means
     ▼
  Components     periodic table, header, tiles, cards, legend chips
     │           reusable, data-driven, no knowledge of any URL
     ▼
  Repositories   element and glossary access, queries, derived values
     │           the ONLY code that reads raw JSON
     ▼
  Data           elements.json, glossary.json, categories.json
                 normalised, validated, immutable

  Lib            pure helpers used by any layer above: colour scales, grid maths,
                 formatters, keyboard handling. No DOM, no data, no side effects.
```

**Why the layers exist, concretely.** The periodic table appears on five different page families,
in four different colour modes. If the table were written inside the home page, it would be
duplicated five times, and the fifth copy would drift. Layering means the table engine is written
once, in Phase 3, and every later phase that needs a table is cheap.

**The three rules that keep the layers honest:**

1. **Only repositories import raw JSON.** A component never reads `elements.json`; it asks the
   repository. This is what makes the dataset replaceable without touching the UI.
2. **Components do not know about URLs.** A component emits an event; the page module decides what
   that event means. This is what lets the same tile work as a link on one page and a button on
   another.
3. **`lib/` is pure.** No DOM, no data, no side effects — which makes it trivially testable, and
   means the trickiest maths in the project (colour interpolation, grid placement) can be tested
   without a browser.

## Folder by folder

```
source/
├── index.html                 the home page's authored template
├── pages/                     one authored HTML template per page family
│   ├── elements-index.html
│   ├── element-detail.html
│   ├── glossary-index.html
│   ├── glossary-term.html
│   ├── table-view.html
│   ├── group.html
│   ├── ranking.html
│   ├── about.html
│   └── contact.html
│
├── scripts/
│   ├── app.js                 the single entry point: boots routing, theme, shared behaviour
│   ├── router/
│   │   ├── routes.js          the route table: pattern → page module
│   │   └── router.js          link interception, history, scroll, 404, fallback
│   ├── data/                  ← Layer 3: REPOSITORIES. The only readers of JSON.
│   │   ├── elements-repository.js
│   │   ├── glossary-repository.js
│   │   └── categories-repository.js
│   ├── components/            ← Layer 2: components, one file per component
│   │   ├── periodic-table.js
│   │   ├── element-tile.js
│   │   ├── element-card.js
│   │   ├── legend-chips.js
│   │   ├── site-header.js
│   │   ├── site-footer.js
│   │   ├── submenu.js
│   │   ├── element-search.js
│   │   ├── property-list.js
│   │   ├── faq-block.js
│   │   ├── shell-diagram.js
│   │   ├── bar-ranking.js
│   │   ├── converter-input.js
│   │   └── filter-bar.js
│   ├── pages/                 ← Layer 4: one module per page family
│   │   ├── home.js
│   │   ├── elements-index.js
│   │   ├── element-detail.js
│   │   ├── table-views.js
│   │   ├── group.js
│   │   ├── glossary.js
│   │   ├── glossary-term.js
│   │   ├── ranking.js
│   │   └── calculators.js
│   └── lib/                   pure helpers — no DOM, no data, no side effects
│       ├── colour-scale.js    numeric domain → colour, with clamps
│       ├── contrast.js        group colour → safe foreground
│       ├── grid.js            atomic number → row/column, including the f-block offset
│       ├── format.js          value + unit → display string; handles "unknown"
│       ├── keyboard.js        roving focus and arrow-key grid navigation
│       └── slug.js            name → URL slug, and back
│
├── styles/
│   ├── tokens.css             ALL design values. No literal colour or size exists outside this file.
│   ├── base.css               reset, typography defaults, focus, selection, reduced motion
│   ├── layout.css             shell, ruled sections, spacing, the dotted-rule utilities
│   ├── components/            one stylesheet per component, same name as its module
│   └── pages/                 one stylesheet per page family, same name as its module
│                              one theme only: the light palette in tokens.css (ADR-006)
│
├── data/                      ← Layer 1: the data. JSON only, no logic.
│   ├── elements.json          118 records
│   ├── glossary.json          418 terms
│   ├── categories.json        the eleven element groups, with palette and counts
│   └── units.json             unit definitions used by the formatter
│
├── assets/
│   ├── brand/                 our wordmark, mark, favicon, social image
│   └── fonts/                 self-hosted webfonts, if any. Licence recorded in DATA_SOURCES.md.
│
├── tools/                     development tooling. Plain Node. Never shipped to the browser.
│   ├── serve.js               zero-dependency static server for local development
│   └── build-data.js          fetches the open dataset and emits normalised JSON
│
└── tests/                     Node's built-in test runner. No dependencies.
    ├── data/
    ├── lib/
    └── brand/
```

## Naming rules

- **A file is named after the single thing it owns.** `elements-repository.js` owns element access.
  There is no `utils.js`, no `helpers.js`, no `misc.js`, no `common.js`. These names are how a
  codebase becomes unsearchable.
- **One component = one module + one stylesheet of the same name.** Nothing else styles a component.
- **Page modules are named after the page family**, not the route. `element-detail.js`, not
  `elements-slug.js`.
- **Repositories are named `<thing>-repository.js`** so the search for "where does data come from"
  has an obvious answer.
- **No file exceeds 400 lines.** If it does, it has more than one job; split it and say so in the
  commit message.
- **Test files mirror the source path** and end in `.test.js`.

## How to find things

| Looking for | Go to |
|---|---|
| The colours, type scale, spacing | `source/styles/tokens.css` |
| Where an element's data comes from | `source/scripts/data/elements-repository.js` |
| The raw data itself | `source/data/elements.json` |
| How the grid is laid out | `source/scripts/lib/grid.js` |
| The periodic table itself | `source/scripts/components/periodic-table.js` |
| What a URL renders | `source/scripts/router/routes.js` |
| What the home page does | `source/scripts/pages/home.js` |
| The dev server | `source/tools/serve.js` |
| Any file at all | `workspace/docs/MIND_MAP.md` |

`workspace/docs/MIND_MAP.md` is the authoritative index. It is updated in the same commit as any
file that is added, renamed, moved or deleted. If you cannot find something, that file is the first
place to look — and if it is out of date, fixing it is part of whatever you are doing.
