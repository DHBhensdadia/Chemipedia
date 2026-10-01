# Brand Guidelines — ChemiPedia

**Rule of the project:** *the same design language, unmistakably our own product.*

We reproduce the reference's structure, rhythm, interaction model and information architecture. We
replace everything that identifies it as *that* product. The intended result: someone familiar with
the reference sees a site that uses the same design vocabulary, not a site that has been copied.

---

## 1. Identity

| Field | Value |
|---|---|
| **Product name** | ChemiPedia |
| **One-word form** | ChemiPedia (never `Chemi Pedia`, never `Chemipedia`) |
| **Wordmark structure** | Two lines, mirroring the reference's lockup shape: `Chemi` / `Pedia` |
| **Tagline** | *An open chemistry reference — 118 elements, the glossary behind them, and the table that organises them.* |
| **Domain (planned)** | a ChemiPedia domain or a GitHub Pages project path |
| **GitHub** | `https://github.com/DHBhensdadia/chemipedia` (planned) |

Keep the **two-line wordmark structure**. It is part of the layout we are reproducing — a stacked
lockup occupying a tall, narrow box in the header. Only the words change.

### The mark

A simple, own-drawn SVG glyph. It must:

- be drawn by us, from primitives — no traced or downloaded logo;
- read at 24 px and at 200 px;
- use exactly two colours from the token layer (`--ink`, and one accent);
- avoid any resemblance to the reference's mark, to a real periodic-table tile, or to a
  recognisable commercial chemistry logo.

**Suggestion to explore in Phase 1:** a ring/orbit form paired with a single tile silhouette, or a
stylised `Cp` built from the same 2px-radius geometry as the rest of the interface. Also required:
a favicon (SVG, with a fallback raster), which is **our own artwork** — never a downloaded one.

## 2. What must be replaced — exhaustive

| Reference | ChemiPedia |
|---|---|
| `Breaking Atom`, `BreakingAtom`, `breakingatom.com` | `ChemiPedia` |
| Reference wordmark lockup | our two-line wordmark |
| Reference logo, favicon, social share image | our own artwork |
| Reference prose, hero copy, explainer paragraphs, taglines | our own words |
| Reference page titles and meta descriptions | our own |
| `/terms`, `/glossary-of-terms/:slug` | `/glossary`, `/glossary/:slug` |
| `/periodic-table/evolution-and-history-of-the-periodic-table` | `/periodic-table/evolution` |
| Reference typeface (`Faktum`, commercial) | our own stack (below) |

**Prohibited strings.** These must not appear anywhere under `source/` — including comments, alt
text, `<meta>` tags, data files, test fixtures and CSS comments:

```
breaking atom      Breaking Atom      breakingatom      BreakingAtom
breakingatom.com   breaking-atom
```

Also prohibited: any hyperlink, canonical URL, `og:url`, sitemap entry or structured-data field
that points at the reference domain. Our site must not link to it anywhere.

> The reference URL is permitted only inside `workspace/` — in this document, in
> `docs/research/01-reference-site-audit.md`, and in `RUN_STATE.md` — where it is the recorded
> research subject. It must never be reachable from the built site.

**Brand scan.** Run before every phase-completion commit and paste the result into the phase log:

```bash
grep -rinE 'breaking[ _-]?atom' source/ && echo "FAIL: brand leak" || echo "PASS: brand scan clean"
```

A non-empty result blocks the commit.

## 3. What must be preserved

These are the *design language* — reproduce them deliberately:

- The overall page rhythm: generous vertical space, content on a ruled baseline grid.
- The **1px dotted rule in the ink colour** as the signature divider and panel border.
- Near-square corners (`2px`) with larger radius (`8px`) reserved for raised panels.
- Flat colour fills with no gradients, no glassmorphism, no drop-shadow flourish (only the two
  defined soft shadows).
- The relationship between a group colour and its foreground: dark ink on pale fills, cream on dark
  fills.
- The motion character: short, decelerating, upward-entrance, staggered lists.
- The information architecture: table first, then browse, then deepen, then reference.

## 4. Colour

The palette is inherited from the reference as a *relationship*, and the eleven element-group
colours are load-bearing data (they encode meaning). The core ink and background are ours to set
within the same warm-paper character.

Full palette with hex values: `docs/DESIGN_SYSTEM.md`. Summary:

- **Ink:** deep pine green — the primary brand colour, used for rules, headings and the dotted motif.
- **Background:** warm off-white paper, with a sunken variant for panels.
- **Group colours:** eleven fixed values, one per element category, used consistently everywhere a
  category is shown.
- **Contrast rule:** every group colour has a defined foreground that passes WCAG AA against it.
  This is a tested invariant, not a judgement call.

## 5. Typography

`Faktum` is a commercial typeface. We do not ship it and we do not embed it.

**Our stack — a geometric humanist sans with a tall x-height:**

```css
--font-body:    "Inter", "Work Sans", ui-sans-serif, system-ui, "Helvetica Neue", Arial, sans-serif;
--font-display: var(--font-body);
--font-mono:    ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
```

The character to match is a plain geometric humanist sans — generous line height, large hero sizes,
restrained weight range. System UI fonts are an acceptable fallback and a deliberate performance
choice; if a webfont is used at all, it must be self-hosted, subset, and loaded without blocking
render, and its licence must be recorded in `docs/DATA_SOURCES.md`.

## 6. Voice and copy

- **Plain, precise, unhurried.** Write for a student who is curious, not for a search engine.
- Short sentences. No exclamation marks. No marketing superlatives.
- Never "revolutionary", "cutting-edge", "unleash", "dive into", "elevate", "seamless".
- Every factual claim must be traceable to the data layer or to a source in `docs/DATA_SOURCES.md`.
- **Our copy only.** The reference's prose is never copied, never lightly reworded, and never used
  as a structural crib sentence by sentence. Read the fact, then write our sentence.

## 7. Navigation and footer after the scope cut

Learn and Games are removed. The navigation becomes:

```
Periodic Table · Elements · Glossary · Calculators
```

The footer's five columns become:

```
PERIODIC TABLE   Groups · Properties and states · Orbitals · Electronegativity · Evolution
ELEMENTS         All elements · Melting points · Boiling points · Orbital configuration
REFERENCE        Glossary of terms · Element groups · Atomic number · Atomic mass
TOOLS            Temperature calculator · Molar mass calculator · Units reference
ABOUT            About ChemiPedia · Data sources · Contact
```

No column may visibly appear to have lost entries. Do not add "coming soon" panels, disabled menu
items, or empty cells for the removed sections.

## 8. Assets we must never ship

- The reference's logo, favicon, or any image from the reference site.
- Any commercial typeface without a licence recorded in `docs/DATA_SOURCES.md`.
- Any element photograph or diagram taken from a source whose licence we cannot state.
- Our electron shell diagrams are **generated SVG** drawn from the element data — never images.
