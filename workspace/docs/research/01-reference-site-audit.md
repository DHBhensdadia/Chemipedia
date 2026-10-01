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
`actinides`, `unknown`

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
  number.`, and a full-width search input with placeholder `Search By Element Name...`.
- Body: a **two-column** grid of 118 element cards.
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

Same skeleton on all four: submenu → hero (heading + one-paragraph explainer) → legend chips →
the table.

- **Properties and states** — legend counts by state.
- **Orbitals** — legend: `s-block 12` · `p-block 38` · `d-block 40` · `f-block 28`. Explainer:
  *"The same table, coloured by the orbital block each element fills last. The shape of the table
  is the shape of the blocks."* (Our own wording, same idea.) Colours here: s-block slate blue,
  p-block green, d-block orange, f-block pink.
- **Electronegativity** — continuous colour scale over the element tiles.
- **Evolution** — coloured by period/decade of discovery.

Note: this is a **content-tier** pattern worth copying structurally — one component, four
colourings, each with its own explanatory paragraph and legend.

### 3.6 Element group pages — `/element-groups/:slug`

Not yet fully audited. To be captured when Phase 8 begins. Expected: hero in the group colour,
member count, an explainer, and the member grid. **Action for Phase 8:** audit this family live
before implementing it, and append findings here.

### 3.7 Glossary — `/terms`

- Hero: `Glossary of Terms`, sub-paragraph `Get familiar with the vocabulary around the Periodic
  Table and Chemistry`.
- An **A–Z jump index** (`abcdefghijklmnopqrstuvwxyz`, capitals rendered as `A`).
- A term list grouped by initial letter. **418 terms total.**
- Term row anatomy (from live markup):

```html
<li>
  <a href="/glossary-of-terms/absolute-zero">
    <span class="term">Absolute Zero</span>
    <span class="def">Absolute zero is the temperature measured in kelvin, …</span>
    <span class="lvl lvl--beginner">Beginner</span>
  </a>
</li>
```

- Each term carries a **difficulty level** badge: `Beginner`, `Novice` or `Expert` — the same
  three-tier idea the reference uses for its (out-of-scope) learning tracks.
- Detail pages live at `/glossary-of-terms/:slug`.

### 3.8 Temperature calculators — `/temperature-calculators`

- Title: `Temperature Calculator and Conversions`. Sub-paragraph: *"Use our temperature calculator
  to convert between Fahrenheit, Celsius, and Kelvin."* (ours to rewrite).
- Three numeric inputs that convert live in both directions.
- Small, self-contained, and a good candidate for the cleanest unit-test suite in the project.

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

## 5. What we deliberately change

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

Everything else — the grid, the rhythm, the palette relationships, the motion, the dotted rule,
the information architecture — is reproduced deliberately.

---

## 6. Outstanding audit work

- [ ] Element group pages (`/element-groups/:slug`) — audit before Phase 8.
- [ ] Melting/boiling point pages — audit before Phase 6.
- [ ] Glossary term detail page — audit before Phase 9.
- [ ] Tablet and mobile layouts — capture breakpoints before Phase 1 signs off.
- [x] Dark theme — resolved: the reference switches to it at runtime, but its `:root` palette is
the light one. We ship light only (ADR-006).

Append findings here rather than in a new file, so this stays the single audit record.
