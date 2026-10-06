# Research 01 — Reference site audit

**Subject:** `https://www.breakingatom.com/`
**Method:** live inspection with the browser tools — accessibility tree snapshots, computed styles,
DOM extraction, and screenshots at desktop width.
**Date:** 2026-10-01
**Purpose:** capture, precisely, what we are replicating — so later phases can be verified against
recorded fact rather than memory, and so the reference never has to be re-audited from scratch.

> **Brand note.** The reference brand is recorded here only as the thing being *replaced*.
> `Breaking Atom` and its wordmark must never appear in `source/`. See `docs/BRAND_GUIDELINES.md`.

---

## 1. What the site is

An educational chemistry reference built with **Astro** — a static site generator whose output is
pre-rendered HTML with per-page stylesheets. Evidence: asset paths under `/_astro/`, per-page
stylesheet bundles (`Base.C3-nRXzb.css`, `PeriodicTable.BxhjHmTB.css`, `_slug_.C8S2vuHO.css`), and
scoped `data-astro-cid-*` attributes on elements.

**Implication for us:** the reference is a static site with a build step. ADR-001 Option A mirrors
that architecture, which is a point in its favour — we would be reproducing the same *kind* of
product, not an approximation of it.

## 2. URL inventory

Extracted from the live DOM (170 distinct links).

### Primary navigation
| Label | Path |
|---|---|
| Periodic Table | `/` |
| Elements | `/elements` |
| ~~Learn~~ | `/learn-the-periodic-table` — **excluded from our scope** |
| ~~Games~~ | `/periodic-table-games` — **excluded from our scope** |
| Glossary | `/terms` |
| Calculations | `/temperature-calculators` |

### Contextual submenus (they change per section)
| Section | Submenu items |
|---|---|
| Home / table | Explore Periodic Tables: States · Orbitals · Electronegativity · Evolution |
| Elements | Attributes · Melting Points · Boiling Points · Orbital Configuration · Downloads |
| Table views | Groups · Properties and states · Orbitals · Electronegativity · Evolution |

### Table views
- `/periodic-table/element-properties`
- `/periodic-table/orbitals`
- `/periodic-table/electronegativity`
- `/periodic-table/evolution-and-history-of-the-periodic-table`

### Element groups (11)
`/element-groups/` + `alkali-metals`, `alkaline-earth-metals`, `transition-metals`,
`post-transition-metals`, `metalloids`, `non-metals`, `halogens`, `noble-gases`, `lanthanides`,
`actinides`, `unknown`.

**There is no group index.** `/element-groups/` and `/element-groups` both answer 404, and the group
band's `All` link points at `/` — the table. Measured 2026-10-06.

### Elements
`/elements/:slug` — 118 slugs, e.g. `/elements/hydrogen`, `/elements/oganesson`.
Slug convention: lowercase, British spellings (`aluminium`, `caesium`, `sulphur`).

### Attribute listings
`/melting-point`, `/boiling-point`, `/orbital-configurations`, `/downloads`

### Glossary
`/terms` (index) and `/glossary-of-terms/:slug` (detail), e.g. `/glossary-of-terms/absolute-zero`

### Everything else
`/about`, `/contact`, `/tutoring`, `/alchemy`, `/blog/...`, `/printables-and-pdfs/...`,
`/periodic-table-games`, `/games/periodic-table-quiz`, `/games/elements-quiz`

---

## 3. Page anatomy, family by family

### 3.1 Global chrome (present on every page)

**Header**
- Two-line wordmark lockup, left aligned: `Breaking` / `Atom`.
- Primary nav to its right: the six items above.
- The active item is underlined (a solid 1px rule under the label).
- Below the wordmark row: a search field with a magnifier icon, spanning the header width.
- The header sits on the page's background colour and is separated from the content by a hairline.

**Contextual submenu bar**
- A horizontal row of small labels, centred, on a distinct band.
- The active item has a short solid underline.
- Separated from the content below by a **dotted** 1px rule.

**Footer**
- Wordmark repeated, then a one-line tagline.
- Five link columns, each with a small-caps heading:
  `PERIODIC TABLE` · `ELEMENTS` · `LEARN` · `EXPLORE` · `MORE`.
- Bottom line: `© 2026 <brand>`.
- For ChemiPedia the five columns must be re-cut so that no column is visibly missing entries
  after Learn and Games are removed. Proposal: `PERIODIC TABLE` · `ELEMENTS` · `REFERENCE` ·
  `TOOLS` · `ABOUT`.

### 3.2 Home page — `/`

Order of sections:

1. **Quickswitch strip** — `Explore Periodic Tables:` followed by States / Orbitals /
   Electronegativity / Evolution.
2. **Hero** — `The Periodic Table of Elements` as a large display heading, then a paragraph:
   *"All 118 elements, arranged by atomic number. Select any element for its properties, electron
   configuration, uses and discovery."* (Our own wording — do not copy.)
3. **Legend / group chips** — one pill per element group, each carrying the group name and a
   member count: Transition metal 35 · Actinide 15 · Lanthanide 15 · Post-transition metal 8 ·
   Unknown 8 · Noble gas 7 · Non-metal 7 · Alkali metal 6 · Alkaline earth metal 6 · Metalloid 6 ·
   Halogen 5. Pills wrap across up to four rows, each filled in its group colour.
   Helper text: *"Hover a group to pick it out of the table. Scroll the table sideways on a narrow
   screen."*
4. **The periodic table** — a horizontally scrollable 18-column grid, 10 rows, with the lanthanide
   and actinide series broken out into two separate rows below. Each tile shows atomic number
   (top-right, small) and symbol (centred), with the element name beneath in the larger variant.
   Tiles are tinted by group.
5. **Understanding the Periodic Table** — an explainer with two panels:
   **Periods** ("Left to Right") and **Groups** ("Top to Bottom"), each with a paragraph, plus a
   "Learn more" link (we relink this to our own in-scope explainer).
6. Reference's **"Learn The Easy Way"** article list — **we replace this** with in-scope teasers
   (glossary, calculators, table views).
7. **Element search** — labelled `Looking to find an element?` with a search input and a button.

### 3.3 Elements index — `/elements`

- Submenu: Attributes · Melting Points · Boiling Points · Orbital Configuration · Downloads.
- Hero: `Elements in the Periodic Table`, sub-paragraph `All 118 elements, ordered by atomic
  number.`, and a search input with placeholder `Search By Element Name...`.
- Body: a grid of 118 element cards.

**Measured 2026-10-05** (1280px and 375px, live):

- Hero: `min-height` 270px. Heading 54.4px / 59.84px with −1.088px tracking. Sub-paragraph 17.6px /
  28.16px in the soft ink, margins `12px 0 16px`. Search field 420 × 54.14px — 1px dotted ink, 2px
  radius, white fill, `12px 16px` padding, 17.6px type. At 375px the field is the column's full
  width (327px) and 51.64px tall; the hero stays 270px.
- Grid: **four columns** of 266px with 12px row and column gaps at 1280px, starting 32px below the
  hero; one column of 327px at 375px. 118 cards over 30 rows.
- Card: 266 × 99.64px — flex row, 12px padding, 12px gap, white, 2px radius. The 54 × 54px tile
  carries the category fill and the contrasting foreground; its number is 9.6px at `top: 3px;
  right: 5px`, 0.85 opacity; its symbol 23.2px. The meta column is a grid with a 1px gap: the name
  at 17.6px / 28.16px in the brand ink, then the category at 13.6px / 21.76px in the soft ink and
  the weight and state on one line below it (`1.008 · Gas`).
- Card anatomy (from the live markup):

```html
<a href="/elements/hydrogen" style="--fill:#a6c6d5;--on-fill:#12211f">
  <span class="tile">
    <span class="tile__z">1</span>
    <span class="tile__sym">H</span>
  </span>
  <span class="meta">
    <span class="meta__name">Hydrogen</span>
    <span class="meta__sub">Non-metal</span>
    <span class="meta__sub">1.008 · Gas</span>
  </span>
</a>
```

Two implementation details worth copying: the group colour is passed per card as a **CSS custom
property** (`--fill` / `--on-fill`) rather than as a class, and the foreground colour is chosen to
contrast against that fill (dark ink on pale groups, cream on dark groups).

### 3.4 Element detail — `/elements/:slug`

The richest page in the site. Order of sections:

1. **Previous / current / next strip** — three labels: previous element + name + number, the
   current element underlined, next element + name + number. Wraps around at the ends (Hydrogen's
   previous is Oganesson, 118).
2. **Miniature periodic table** — the whole table in compact form with the current element
   highlighted, captioned `Position of Hydrogen in the periodic table`.
3. **Hero tile** — a large rounded panel in the group colour showing the atomic number and the
   element symbol.
4. **Name and pronunciation** — `Hydrogen`, then `Pronounced` / `HI-dreh-jen`.
5. **Summary line**, then a long descriptive paragraph.
6. **FAQ's** — auto-generated question/answer pairs from the element's own data:
   *What is the Melting Point for Hydrogen?* → `-259.2 °C`;
   *Boiling Point*; *Electronegativity*; *Heat of Vaporization*.
   This is a data transformation, not authored content — worth reproducing as a generator.
7. **Uses** — a paragraph. **Sources** — a paragraph.
8. **Discovery** — a description list: `Discovered by`, `Year`, `Where`, `Name origin`.
9. **Properties sidebar** — the large one. ~40 labelled values in this order (Hydrogen shown):

   | Property | Hydrogen |
   |---|---|
   | Protons / Electrons / Neutrons | 1 / 1 / 0 |
   | Element Symbol | H |
   | Atomic Number | 1 |
   | Atomic Weight | 1.008 |
   | State | Gas |
   | Melting Point | −259.2 °C |
   | Boiling Point | −252.77 °C |
   | Heat of Vaporization | 0.44936 kJ/mol |
   | Heat of Fusion | 0.05868 kJ/mol |
   | Crystal Structure | Hexagonal |
   | Thermoconductivity | 0.001815 W/cmK |
   | Specific Heat | 14.304 J/gK |
   | Shells | 1 |
   | Group | Non-metal |
   | Period | 1 |
   | Block | S Block |
   | Orbitals | 1s1 |
   | Electronegativity | 2.2 |
   | Valence | 1 |
   | Coefficient of Thermal Expansion | Not measured |
   | Covalent Radius | 0.32 Å |
   | Atomic Radius | 0.79 Å |
   | Atomic Volume | 14.4 cm³/mol |
   | Density @ 293K | Not measured |
   | Electrical Conductivity | Not measured |
   | First Ionization Potential | 13.5984 V |
   | Second Ionization Potential | Not measured |
   | Third Ionization Potential | Not measured |
   | Ionic Radius | 1.54 (+1) Å |
   | Oxydation States | −1, +1 |
   | Lattice Parameter 2 | 10.478 Å |
   | Lattice Parameter 3 | 3.584 Å |

   Note the literal spelling `Oxydation States` — we will use our own correct label, since the
   brief requires our own copy, not a transcription of their typos. Note also the sentinel value
   `Not measured`, which our formatter must handle as a first-class case.
10. **Orbital configuration figure** — an electron **shell diagram**, generated per element,
    captioned `Orbital configuration — 1s1`. This must be an SVG we draw from the shell data.
11. **Explore other members of this group** — a row of sibling element tiles.
12. **Previous / next navigation** — explicit links at the foot of the page.

### 3.5 Alternate table views — `/periodic-table/*`

**Measured 2026-10-06** (live, 1280px; the four pages all returned 200).

Same skeleton on all four, and the skeleton is the Phase 3 table with a hero over it:

- **Submenu** band, 33px, above everything.
- **Hero** section, 240px tall, starting directly under the band: heading 51.2px / 56.32px with
  −1.024px tracking, then one paragraph of 17.6px lede. The **evolution** view is the exception on
  both counts: its hero is 300px, its heading 54.4px / 59.84px (the same display size every other
  page uses), and its lede is joined by a second line naming the span of the recorded years
  (`Copper 9000 BC→Tennessine 2009`).
- **Body**: a 1100px column with 32px of padding above its first child. The legend comes first,
  then the table — which bleeds to 1228.8px, wider than the column it sits in.
- **The note comes after the table**, not between the legend and the grid: 60px tall in the
  reference's own words on the states page, one line (`Hover an era to pick it out of the table.`)
  on the evolution page, which puts it above the table instead.
- **Grid**: 18 columns of 65.375px at a 3.072px gap, tiles 65.36px square with a 3px radius — the
  Phase 3 measurements, unchanged. 118 tiles on all four.

**The four legends, exactly as the reference draws them** (label · count · measured fill):

| View | Keys |
|---|---|
| Properties and states | Solid 90 `#456683` · Liquid 2 `#559982` · Gas 12 `#e57860` · Unknown 14 `#efce69` |
| Orbitals | s-block 12 `#456683` · p-block 38 `#559982` · d-block 40 `#f9aa62` · f-block 28 `#d473a2` |
| Electronegativity | a continuous bar, 220 × 14px, under the labels `0.7` and `3.98`, then a `no value` swatch `#e8e2dc` |
| Evolution | Antiquity 7 `#15403d` · Alchemical era 2 `#456683` · 18th century 22 `#559982` · 19th century 51 `#97c0aa` · 20th century 31 `#f9aa62` · This century 5 `#e57860` |

Three findings worth recording, because they shaped our four pages:

1. **The orbital block colours are four of the eleven group colours** — the alkali slate, the
   actinide sage, the transition orange and the lanthanide pink. Our block palette had been chosen
   rather than measured, and its p-block was a fifth colour; it now points at the same four group
   tokens the reference uses.
2. **The electronegativity ramp is the scale `tokens.css` already holds** — six steps from
   `#dce9f0` to `#15403d` over a domain of 0.7 to 3.98, with `#e8e2dc` for a record with no value.
   Live, the reference's hydrogen tile is `rgb(111,159,181)` and ours is the same value.
3. **A note between the legend and the grid costs the page its alignment.** The reference's note
   sits *under* its table, and its legend sits directly above the grid with a 24px gap. Our first
   build put the note in the curve between the two, which pushed the whole table down by the
   paragraph's height — 224px at 1280 in the first capture. Moving the note below the table and
   giving the legend the reference's own 24px took the table to within 2px of the reference's.

**Evolution legend detail.** The reference's eras are its own: *Antiquity* holds the seven metals
its data lists with no discoverer, and *Alchemical era* holds arsenic and phosphorus. The remaining
four are centuries. Under the table it draws one card per era — `Antiquity` / `before 1 AD · 7
elements` / a sentence / the era's elements as symbol-and-year chips — before any other content.

**Correction.** An earlier version of this section recorded the orbitals explainer as *our own
wording* with the same idea. It is the reference's sentence, transcribed: the audit must record the
reference's copy as the reference's, and ours has to be written afresh.

Note: this is a **content-tier** pattern worth copying structurally — one component, four
colourings, each with its own explanatory paragraph and legend.

### 3.6 Element group pages — `/element-groups/:slug`

**Measured 2026-10-06** (live, at 1280 / 768 / 375; halogens, alkali metals, transition metals and
the unknowns fetched in full, all eleven counted).

The skeleton, the same on all eleven:

- **Band**: the contextual submenu, **33px** at 1280, on the paper colour: a 13.6px label
  `Element groups:` and links. The links are **six of the eleven groups** — Actinide, Alkali metal,
  Alkaline earth metal, Halogen, Lanthanide, Metalloid, Noble gas — with the page's own group
  removed from that fixed list, plus `All` → `/`. The four groups outside the list
  (Non-metal, Post-transition metal, Transition metal, Unknown) are reachable only from the foot of
  the page.
- **Hero**: `section.hero` → `div.shell.hero__inner`, a flex row with a 48px gap and `padding: 48px
  0`, **with no background of its own**. Inside it, `div.hero__text` capped at 620px holds an eyebrow
  `Element group` (13.6px, 16px below), the `<h1>` at **57.6px/63.36px with −1.152px tracking** in the
  ink, one lede paragraph at **23.2px/32.48px in the group's own colour**, and a
  `<dl class="facts">` of 13.6px labels over 23.2px values, 24px apart.
- **The facts are derived per group**, not written: Elements · Atomic numbers · Block · States, with
  the block stated only where every member shares one and the states listed in the order the members
  are met in atomic-number order. Read live: halogens `5 · 9–85 · p-block · Gas, Liquid, Solid`;
  alkali metals `6 · 3–87 · s-block · Solid`; transition metals `35 · 21–112 · d-block ·
  Solid, Liquid, Unknown`; the unknowns `8 · 109–117 · (no block) · Unknown`.
- **"Where they sit"** (an h2 at 30.976px — our `--step-2`): the Phase 3 table, whole, on the group
  mode's colours — 18 columns of 65.375px at a 3.072px gap, 65.36px tiles — with the grid carrying
  `pt__grid is-filtered` and **every non-member tile at `opacity: 0.22; filter: saturate(0.35)`**,
  its own members at full colour. 118 cells on every page measured. The section is 713px tall at
  1280.
- **The note under the table**: `The 5 highlighted cells are the halogens.` — 13.6px, 16px below the
  grid. The note is below the table here too, as it is on the four views.
- **The members** (`section.members-sec`, an h2 reading `The halogens`, 64px under the note): a
  wrapping grid of cards with a **210px column floor** — five columns of 210.4px at 1280, three of
  232px at 768, one of 327px at 375 — at a 12px gap. Each card is a link to the element: a **48px
tile in the group's colour** (`--fill`/`--on-fill` written inline on the link) carrying the atomic
  number at 9.6px over the symbol at 23.2px, then the name (17.6px) over `18.998 · Gas` (13.6px).
- **"About the …"**: an explainer in a 68ch column, ours to write.
- **"Other groups"** (`section.siblings`): the other ten as pills — `padding: 8px 16px`,
  `border-radius: 999px`, a **9.52px round dot in each group's own colour**, 13.6px labels, 8px
  apart.
- Every section carries `margin: 0 0 64px`. **There are no rules between the sections** — a group
  page is one column of blocks rather than a set of ruled panels.

**The eleven, counted live** (declared count · member list): alkali metals 6 · alkaline earth metals 6
· transition metals 35 · post-transition metals 8 · metalloids 6 · non-metals 7 · halogens 5 · noble
gases 7 · lanthanides 15 · actinides 15 · unknown 8 — 118 in total. Checked slug by slug against the
live pages, their membership is **the same as our `category` field, member for member**: the same
astatine under halogens, the same selenium under the non-metals, the same polonium under the
post-transition metals, the same eight transactinides under unknown. The Phase 8 exit criterion
"member counts match the reference exactly" is therefore satisfiable as written, and its own examples
— transition metals 35, halogens 5, unknown 8 — are the reference's own numbers.

**A finding that shaped the hero.** The reference's lede is written in the group's own colour,
darkened where the colour is too light to read: `#4c575a` for the halogens (which is the halogen
token itself), `#98683c` for the transition metals, `#a85846` for the noble gases, `#816f39` for the
unknowns. Those eleven values are already the `--g-*-deep` tokens in `tokens.css`, transcribed in
Phase 1 from the same site — so our hero's lede is written in `var(--fill-deep)` and takes its colour
from the one map that already owns the pairing, rather than from an eleventh decision.

**What we take, and what we deliberately change.**

| | Reference | ChemiPedia |
|---|---|---|
| Band | six groups + `All` → `/`, the current one removed | all eleven groups in the order a reader meets them reading the table, plus `All groups` → our index |
| Hero wash | none; the colour appears in the lede only | the group's colour mixed into the paper at 16% — the same device our element pages use |
| Lede ink | the group's darkened colour | `--fill-deep`, the same value, from the token layer |
| Explainer | their prose, thousands of words | ours, two paragraphs, free of counts |
| Note | `The 5 highlighted cells are the halogens.` | ours, and it counts both the group and the rest of the table |
| Index page | **does not exist** | `/element-groups/` — ours alone |
| Members, siblings, facts, table | as measured above | reproduced, with the counts derived from our records |

### 3.7 Glossary — `/terms` and `/glossary-of-terms/:slug`

**Measured 2026-10-06** (live, at 1280 / 768 / 375).

**The index.** 418 term rows, 26 letter headings (one per letter A–Z), and a sticky rail of
letters down the left edge.

- **Hero**: `section.hero`, **230px tall at every width**, sitting directly under the 59px
  masthead with no background of its own. Its `.shell` starts 68px below the hero's top and is
  1100px wide, so the hero is 68px of padding above and below a 92.94px block.
- The `<h1>` is `Glossary of Terms`, **48px/52.8px with −0.96px tracking**, in the ink; the
  sub-paragraph is 17.6px/28.16px in the soft ink, 12px below it.
- **The list breaks the shell.** A 34px rail of letters runs down the left edge — `display: grid`,
  `gap: 2px`, `position: sticky`, `top: 58px` — each link 34×20, 11.52px/18.432px in the soft ink
  at a 2px radius. The alphabet column then takes everything from the rail's right edge to the
  viewport's right edge: **1246px at 1280** (34 + 1246 = 1280), not the shell's 1100.
- **Letter headings** are `h2.letter__h`, one per letter, 17.6px/19.36px with −0.352px tracking
  and `padding: 12px 0` — 44.34px tall, `margin: 0`, in the ink. They carry the jump index's
  target ids (`#letter-A`), which the term pages link back to.
- **A row** is an `<li>` with `border-bottom: 1px solid #e4ddd7` — our `--line` — 91.13px tall
  including that rule. The anchor inside it is a **grid of `352px 670px 112px`** with a 24px gap
  and `padding: 24px 32px`:
  - `.term` — **30.976px/35.6224px**, which is our `--step-2`, in the ink.
  - `.def` — 13.6px/21.08px, its own measure capped at 534.48px inside the 670px column.
  - `.lvl` — the difficulty badge, below.
- **The badge** is 11.52px/18.432px with `letter-spacing: 0.4608px`, `padding: 2.88px 8.064px`,
  `border-radius: 2px` and a **1px dotted** border. The three levels, measured, with their counts
  on the live index and their two colours:

  | Level | Count | Text | Border |
  |---|---|---|---|
  | Beginner | 189 | `#1d4634` | `#97c0aa` |
  | Novice | 129 | `#1d3d4d` | `#a6c6d5` |
  | Expert | 99 | `#38246b` | `#6e58ac` |

  The three border colours are **three of the eleven group tokens** already in `tokens.css` —
  post-transition metal, non-metal and metalloid — so the badge spends those rather than taking
  three more colours into the palette, as the block palette does.
- **There is no filter on the index.** Filtering is a ChemiPedia addition, asked for by the plan.
- Below 56rem the rail is dropped and a row becomes one column: **736px at 768** and **343px at
  375**, both with 16px of padding, 140px and 156px tall.

**A term page** at 1280, from the live DOM:

```
main
  div.shell.back                     a → /terms#letter-A, "← Glossary · A"        45px tall
  div.shell.cols                     two columns, 1100 wide, 284px tall
    article.col-main                 776px
      header.head                    h1 (51.2px/56.32px) + the badge, 16px to its right
      div.underline                  768 × 5px
      div.prose.def                  the definition
    aside.col-side                   260px, 64px away
      div.rail                       p.rail__k (13.6px) + ul
      div.rail                       p.rail__k + ul
  nav.shell.pager                    a.pager--next → "Next" + the next term's name
```

- The back link carries the **letter anchor**, so a reader returns to the right place in the index.
- The h1 is **51.2px/56.32px** — smaller than the index's 48px only in appearance, since the two
  are the same `--step-3`-ish rung of the reference's own scale at these widths.
- The term page's own body is **the definition and nothing else**. There is no expanded
  explanation, no related elements and no related terms; the space a richer page would use is
  taken by the aside's two rails, which link to the reference's Learn and Games sections — both
  **out of our scope**.
- Our term page therefore uses that column for what the plan asked for: the explanation, the
  related elements and the related terms.

**What we take, and what we deliberately change.**

| | Reference | ChemiPedia |
|---|---|---|
| The index | 418 rows under 26 letter headings, a sticky 34px rail | the same arrangement, with a filter field above the list and a status line counting what is left |
| The rail | letters, in the soft ink | the same, and it marks the letter the reader is at once the filter narrows the list |
| A row | term · definition · badge in a `352px 670px 112px` grid | the same three columns, with the definition's own measure |
| The badge | three levels on three group colours | the same three colours, spent from the group tokens |
| The term page | the definition, and two rails into out-of-scope sections | the definition, an explanation, the related elements and the related terms |
| The prose | theirs, 418 definitions | ours, 418 definitions |

### 3.8 Temperature calculators — `/temperature-calculators`

**Measured 2026-10-06**, including the live behaviour of all three fields.

- Title: `Temperature Calculator and Conversions`. Hero: a heading plus one sub-paragraph of the
  reference's own copy (ours to rewrite). No filter, no table.
- Body: a `.cards` grid — **one column, 411.094px at 1280** — holding three `div.card`s, each
  `data-conv` with `data-from` and `data-to`:

  | Card | `data-from` | `data-to` | Input id |
  |---|---|---|---|
  | Fahrenheit to Celsius | `F` | `C` | `f-to-c` |
  | Celsius to Fahrenheit | `C` | `F` | `c-to-f` |
  | Celsius to Kelvin | `C` | `K` | `c-to-k` |

- A card is an `h2`, then a `.card__row` holding a visually-hidden `label`, an `input` and an
  `output.card__out[for=<id>]`, then a `p.card__warn[data-warn][role=status][aria-live=polite]`.
- The input is `type="number"`, `step="any"`, `inputmode="decimal"`, placeholder `0`, and **carries
  no `min`, no `max` and no `aria-describedby`**. The `type` is the whole of its validation: pressing
  a letter after `12` leaves `12`, because the browser refuses the keystroke.
- **Each card converts one way only**, and Kelvin has no field of its own — the three pairs are
  F→C, C→F and C→K, so a reader who wants Kelvin types in the third card's Celsius field.
- The output is filled from the placeholder's zero before anything is typed: `-17.78°C`, `32°F`,
  `273.15°K`. It is **30.976px** — our `--step-2` — in the ink `rgb(21, 64, 61)`.
- Rounding is at most two decimals with trailing zeros dropped: `37.78°C`, `100°C`, `32°F`,
  `-868°F`, `-11.11°C`.
- Below absolute zero the conversion still happens and the warning appears beside it: `-500` in any
  field gives `-295.56°C` / `-868°F` / `-226.85°K` with *"Below absolute zero — not a reachable
  temperature."* Clearing the field returns the output to the zero conversion and the warning to
  empty.
- **Kelvin is written `273.15°K`**, with a degree sign, and the unit follows the number with no
  space.

**What we take, and what we deliberately change.** The measured vocabulary is kept: the field's
shape, the output at `--step-2` in the ink, the two-decimal rounding, and a warning that is a polite
live region rather than an alert. Three one-way cards become **three synchronised fields** —
Celsius, Fahrenheit and Kelvin, each updated as any of them is typed in — because that is the form
the plan asks for and it removes the reference's awkwardness that a reader wanting Kelvin must find
the Celsius field. We drop the degree sign on Kelvin (it is not a scale with a degree) and set the
unit off the number with a space, as every other figure on this site does. The notable reference
points are printed at build time, so the page is useful with the script off.


### 3.9 Attribute rankings — `/melting-point`, `/boiling-point`, `/orbital-configurations`

**Measured 2026-10-05.** All three are one skeleton: hero → a shell with a filter field → a table.

- Hero: 240px. Heading 51.2px, plus one sub-paragraph of the reference's own copy.
- Shell: first element is a filter field, 260 × 46.14px — 1px dotted ink, 2px radius, `8px 12px`
  padding, 17.6px type, placeholder `Filter by element name…`.
- Table: 1100px wide, 119 rows (a 38.25px header and 118 data rows of 47px), 13.6px type.
  Columns, in order:
  - melting point — Element (364px) · Melting point (°C), right-aligned (257px) · Boiling point
    (°C), right (251px) · State at 20 °C (227px);
  - boiling point — the two numeric columns swapped;
  - orbital configurations — Element (295px) · Configuration (271px) · Electrons per shell (216px)
    · Block (118px) · Valence, right (199px).
- Every header is a button carrying `data-sort` and an ↕ affordance. The default order is atomic
  number, so the reference publishes a **sortable table**, not a ranking.
- A data row: a row-header link holding a 30px symbol chip in the category's fill, the element's
  name and its atomic number; right-aligned numeric cells in tabular figures (`-259.2 °C`); then
  the state word. An element with no measurement prints `Not measured` and stays in atomic order
  with everything else. Rows carry `data-name`, `data-symbol`, `data-atomicnumber` and the values,
  which is how the reference's own filter hides them.

**What we take, and what we deliberately change.** The skeleton — hero, one field, one 1100px
surface, one row per element with the symbol chip, the name and the atomic number on the left — is
reproduced. The sortable table is not: Phase 6's deliverable is a *ranking*, one order per page,
with the bar visualisation the implementation plan names, and the project's one word for a missing
value (`Unknown`) rather than the reference's “Not measured”. The index's hero search is kept, and
the ranking pages carry no filter of their own.

### 3.10 Downloads, About and Contact

**Measured 2026-10-06.** One of these three has a page to study; the other two have nothing.

**`/downloads`.** Title `Download The Periodic Table and Elements`. No submenu of headings at all.

- Hero: **400.5px tall** — the tallest hero in the site — and it is a coloured band, since its `h1`
  measures white (`rgb(255, 255, 255)`) at **43.2px/49.68px**, smaller than the 51.2px the other
  index heroes use.
- Shell 1100px holding a `div.panel` **1100 × 331**, carrying four cards. Each card is an SVG
  preview image measured **261 × 174** with an empty `alt`, a title, and a one-line description:

  | Card | Target |
  |---|---|
  | Electronegativity Periodic Table | `/printables-and-pdfs/electronegativity-periodic-table` |
  | Orbitals Periodic Table | `/printables-and-pdfs/orbitals-periodic-table` |
  | Periodic Table PDF | `/printables-and-pdfs/periodic-table-pdf` |
  | Properties and States Periodic Table | `/printables-and-pdfs/properties-and-states-periodic-table` |

  Two of the four preview images point at the same file. The second `.panel` is 0 × 0 — a hidden
  duplicate.
- Below that, a strip reading *"Each element has its own printable card"* followed by **all 118
  element links**, each the symbol then the name.
- **Nothing on the page is itself a file.** Every one of its targets is another page of the
  reference's own site, and the four printable ones live under `/printables-and-pdfs/*`, which
  ADR-002 leaves out of scope. So there is no downloadable asset to reproduce and no print rule to
  read off: the whole family is ours to design, and what it must satisfy is the plan's exit
  criterion — every target resolving in our own built output, and the table fitting one sheet at
  A4 and Letter.

**`/about` and `/contact` are not implemented on the reference.** Each returns an `h1` (`about`,
`contact`), 54.88px/60.368px in the ink, over a single sentence: *"Placeholder — ported from
about.html. Content not yet migrated."* — 9 words of main content, no headings, no links, no
images. There is therefore no prose to avoid copying and no layout to measure. Both pages are ours
by the plan: About describes ChemiPedia and carries the **Data sources** section ADR-005 requires,
and Contact is written in our own words. What the audit settles is only that neither page should be
modelled on the reference, because there is nothing there to model.

---

## 4. Design tokens (extracted from `:root` computed styles)

This is the exact palette and scale the reference uses. Transcribe it into
`source/styles/tokens.css` in Phase 1, and verify against these values.

### Core palette
```
--bg            #fdfbfa     page background (light theme)
--surface       #fff        raised surfaces
--surface-sunk  #f6f2ef     sunken panels
--ink           #15403d     deep pine green — the primary brand ink
--ink-body      #24312f     body text
--ink-soft      #5d6b68     secondary text
--ink-faint     #8a938f     tertiary text
--ink-inverse   #fdfbfa     text on ink
--line          #e4ddd7     hairlines
--line-strong   #cfc5bc     stronger rules
```

The footer tagline, the light `--bg`, and the deep green `--ink` establish the identity: a **warm
off-white paper** with **pine-green ink**, not a cold grey.

**Note for our build.** The reference also renders a dark variant at runtime — observed as body
background `rgb(18,16,15)` with body text `rgb(230,226,222)` — while its `:root` values are the light
ones above. ChemiPedia adopts the light palette it defines at the root and ships that theme only;
the decision and its reasoning are recorded as ADR-006 in `docs/ARCHITECTURE.md`. Adopting the
root palette rather than the runtime variant also means the values above can be transcribed
directly into `tokens.css` without interpretation.

### Element group colours — the most important palette in the project
```
--g-transition-metals        #f9aa62   orange
--g-actinides                #559982   sage
--g-lanthanides              #d473a2   pink
--g-post-transition-metals   #97c0aa   pale green
--g-unknown                  #efce69   yellow
--g-noble-gases              #e57860   coral
--g-non-metals               #a6c6d5   pale blue
--g-alkali-metals            #456683   slate blue
--g-alkaline-earth-metals    #15403d   deep pine
--g-metalloids               #6e58ac   violet
--g-halogens                 #4c575a   grey blue
```

These eleven values are load-bearing: they appear in legend pills, table tiles, element cards,
group heroes and the contrast logic that picks `--on-fill`. They are verified against a live
screenshot of the home page's legend row.

### Typography
```
--font-body       "Faktum", ui-sans-serif, system-ui, "Helvetica Neue", Arial, sans-serif
--font-display    "Faktum", ui-sans-serif, system-ui, "Helvetica Neue", Arial, sans-serif
--font-condensed  "Helvetica Neue Condensed", "HelveticaNeue-CondensedBold", "Arial Narrow", ui-sans-serif, system-ui, sans-serif
--font-mono       ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace
```

`Faktum` is a commercial typeface we must **not** ship. See `docs/BRAND_GUIDELINES.md` for the
substitute strategy — a humanist geometric sans with tall x-height, of which system-ui is the
zero-cost fallback. The character to match is: a **geometric humanist sans**, generous line
height, and a **very large display size for hero headings**.

Fluid type scale (all `clamp()`-based):
```
--step--1  clamp(.79rem,  .77rem + .1vw,  .85rem)
--step-0   clamp(1rem,    .96rem + .18vw, 1.1rem)
--step-1   clamp(1.25rem, 1.18rem + .35vw, 1.45rem)
--step-2   clamp(1.56rem, 1.44rem + .62vw, 1.94rem)
--step-3   clamp(1.95rem, 1.74rem + 1.05vw, 2.58rem)
--step-4   clamp(2.44rem, 2.08rem + 1.78vw, 3.43rem)
--step-5   clamp(3.05rem, 2.45rem + 2.98vw, 4.58rem)
```
Measured in the browser: the home hero `<h1>` renders at **48px** and section `<h2>` at
**~26.7px** at desktop width — consistent with `--step-4`/`--step-5` for the hero and `--step-2`
for section headings.

### Spacing, shape, layout
```
--sp-1 .25rem   --sp-4 1rem    --sp-7 3rem
--sp-2 .5rem    --sp-5 1.5rem  --sp-8 4rem
--sp-3 .75rem   --sp-6 2rem    --sp-9 6rem

--radius        2px       note: nearly square
--radius-lg     8px
--shell         1100px    content max width
--measure       68ch      prose max width

--rule-solid    1px solid  var(--ink)
--rule-dotted   1px dotted var(--ink)     ← the signature motif
--shadow-sm     0 1px 2px  #15403d0f
--shadow-md     0 4px 16px #15403d14
```

### Motion
```
--dur-fast  .16s
--dur-base  .3s
--dur-slow  .62s
--ease-out  cubic-bezier(.22, 1, .36, 1)
--ease-soft cubic-bezier(.33, 1, .68, 1)
--rise      14px      entrance offset
--rise-sm   8px
--stagger     70ms    list stagger
--stagger-sm  45ms
```

The motion character is: **short, decelerating, and upward** — content rises ~14px into place with
an ease-out curve, and lists stagger in at 45–70ms intervals. Never bouncy, never slow. All of it
must be disabled under `prefers-reduced-motion`.

### The signature visual motif

**The 1px dotted rule in the ink colour.** It appears as the divider under submenus, around the
element search field, around the element cards in the index, and as panel borders. Together with
the 2px radius and the flat fills, it is what makes the design recognisable. Copy the motif; we
have our own palette and wordmark, so the result reads as our design language.

---

## 5. Metadata and crawlability

Audited live on 2026-10-06 with `curl` and a desktop user-agent, over the home page and one element
page, plus the three crawl files. This is what the reference actually serves:

| | Home `/` | Element `/elements/hydrogen` |
|---|---|---|
| `<title>` | `The Periodic Table of Elements \| Breaking Atom` (46 chars) | `Hydrogen (H) — Atomic Number 1 \| Breaking Atom` (46) |
| `<meta name="description">` | 146 chars | 200 chars, **cut mid-word** (`…hydrogenati`) at the template's limit |
| `rel="canonical"` | `https://www.breakingatom.com/` | the page's own address |
| `og:title` / `og:description` | identical to the title and description | identical |
| `og:image` | — | a **relative** path (`/images/…Hydrogen1200x.png`), which no crawler can resolve |
| `twitter:card` | `summary_large_image` | `summary_large_image` |
| JSON-LD | none | **none** |

No `og:site_name`, `og:type` or `og:url` appears on either page.

**The three crawl files.** `robots.txt` allows everything and names
`https://www.breakingatom.com/sitemap-index.xml`, which is a 191-byte index pointing at one child,
`sitemap-0.xml` — **922** `<loc>` entries behind a needless second request. **`/sitemap.xml` is a
404**, and that 404 page's own head carries
`<link rel="canonical" href="https://www.breakingatom.com/404">`, so the reference tells a crawler
that its error page is a real address.

**Two defects worth naming.** No page declares an icon, and `/favicon.ico` answers **404**
`text/html`, so every page load in the reference logs a failed request. Our build declares the
favicon on every document — the not-found one included — which is why no sweep of ours has ever
reported a failed request.

**What we take, and what we add.** We take the shape: a title and a description per page, a
canonical link, an Open Graph pair that repeats them, and a Twitter card. We add four things:

1. **`og:site_name`, `og:type` and `og:url`**, which the reference omits — and an `og:image`, ours
   absolute rather than relative. Our Twitter card is `summary` rather than
   `summary_large_image`, because we have no social image and a banner card with a missing image is
   the worse lie.
2. **JSON-LD on every page**: a `WebPage` that is part of one `WebSite`, and on an element page a
   `Thing` named after the element, with the symbol as an alternate name and the record's own atomic
   number and weight as `PropertyValue`s. The reference ships none, which is the largest gap in its
   metadata and the one the SEO audit rewards.
3. **One `sitemap.xml`** rather than an index over a single child, listing only the **562 routes the
   build actually wrote** rather than the manifest's inventory, because a sitemap that lists a page
   the site does not serve is a sitemap that lies to a crawler.
4. **No canonical on the not-found document.** It is not a published address, so it claims none.

Descriptions are clipped to a word boundary rather than mid-word, and an element page's title
follows the reference's shape (`Hydrogen (H) — atomic number 1`) without its brand suffix.

---

## 6. What we deliberately change

| Item | Reference | ChemiPedia |
|---|---|---|
| Name | Breaking Atom | **ChemiPedia** |
| Wordmark | their two-line lockup | our own, same two-line structure |
| Learn section | courses, tracks, articles, tutoring | **removed entirely** |
| Games section | quizzes, flash cards, find-the-element | **removed entirely** |
| Footer columns | PT / ELEMENTS / LEARN / EXPLORE / MORE | PT / ELEMENTS / REFERENCE / TOOLS / ABOUT |
| All prose | theirs | ours, or openly licensed with attribution |
| Typeface | Faktum (commercial) | our own stack |
| Paths | `/terms`, `/glossary-of-terms/:slug` | `/glossary`, `/glossary/:slug` |
| Property typo | `Oxydation States` | `Oxidation States` |
| Metadata | no JSON-LD, no declared icon, `/sitemap.xml` 404s | a `WebPage` per page, JSON-LD naming the element on its own page, a declared favicon, one sitemap |

Everything else — the grid, the rhythm, the palette relationships, the motion, the dotted rule,
the information architecture — is reproduced deliberately.

---

## 7. Outstanding audit work

- [x] Element group pages (`/element-groups/:slug`) — audited 2026-10-06; see §3.6, which carries
  the measured skeleton, the eleven live member lists held against our own taxonomy, the eleven deep
  colours the hero's lede is written in, and the finding that the family has no index page at all.
- [x] Melting/boiling point pages — audited 2026-10-05; see §3.9, which also covers the orbital
  configurations page.
- [x] The four alternate table views — audited 2026-10-06; see §3.5, which now carries their
  measured skeleton, their four legends with the colours read off the tiles, and the evolution
  view's timeline.
- [x] Glossary term detail page — audited 2026-10-06; see §3.7, which carries the index's rail,
  letters, row grid and badge colours, and the term page's DOM.
- [x] Temperature calculator — audited 2026-10-06; see §3.8, which carries the three cards' live
  behaviour, the two-decimal rounding and the below-absolute-zero warning.
- [x] Downloads, About and Contact — audited 2026-10-06; see §3.10. Downloads is a page of links
  into an out-of-scope section with no file of its own, and About and Contact are unimplemented
  placeholders.
- [x] Tablet and mobile layouts — the four page families measured since §3.7 each carry their
  three-width numbers in place, and the sweep itself is Phase 11: nineteen pages at 375 / 768 /
  1024 / 1440, 76 of 76 combinations fitting their viewport, with the periodic table's own scroller
  the one recorded exception.
- [x] Metadata and crawlability — audited 2026-10-06; see §5, which carries both pages' heads, the
  three crawl files, the reference's 922-entry sitemap behind an index, its 404ing `/sitemap.xml`
  and its canonical-on-404, and its undeclared, 404ing favicon.
- [x] Dark theme — resolved: the reference switches to it at runtime, but its `:root` palette is
the light one. We ship light only (ADR-006).

Append findings here rather than in a new file, so this stays the single audit record.
