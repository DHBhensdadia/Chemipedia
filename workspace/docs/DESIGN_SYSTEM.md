# Design System — ChemiPedia

The implementation spec for the visual layer. Values are the ones extracted from the reference and
recorded in `docs/research/01-reference-site-audit.md`; this file is how they are organised in code.

**One rule governs the whole layer:** no literal colour, size, radius, duration or easing may appear
outside `source/styles/tokens.css`. Every other stylesheet references tokens only. A phase that
introduces a raw hex value fails its exit criteria.

---

## 1. Token layer — `source/styles/tokens.css`

### 1.1 Surfaces and ink

```css
:root {
  /* Warm paper and pine-green ink — the identity */
  --bg:            #fdfbfa;
  --surface:       #ffffff;
  --surface-sunk:  #f6f2ef;

  --ink:           #15403d;   /* brand ink: rules, headings, the dotted motif */
  --ink-body:      #24312f;   /* body copy */
  --ink-soft:      #5d6b68;   /* secondary */
  --ink-faint:     #5b726e;   /* tertiary, captions — darkened from the reference's
                                 #8a938f; see the note under the palette */
  --ink-inverse:   #fdfbfa;   /* text on ink */

  --line:          #e4ddd7;
  --line-strong:   #cfc5bc;

  --accent:        var(--ink);
  --on-accent:     var(--ink-inverse);
}
```

**ChemiPedia ships one theme: light.** The warm-paper palette above is the design, and it is the
only palette. There is no `data-theme` attribute, no theme switcher, no `prefers-color-scheme`
branch, and no second set of surface tokens. See ADR-006 in `docs/ARCHITECTURE.md` for the decision
and the reasoning.

This simplifies the layer in three ways worth noting, because each one removes a class of bug:

- Every component is authored, reviewed and screenshotted against exactly one background, so a
  contrast or legibility problem cannot hide in the other theme.
- Each of the eleven element-group colours has one verified foreground rather than two, which halves
  the contrast invariants the tests must assert.
- The visual verification pass at the end of each phase stays at three viewport widths instead of
  doubling into six.

The reference site does render a dark variant, and its `:root` values are in fact the light ones —
we are adopting the palette it defines at the root, not the variant it switches to at runtime.

### 1.2 Element group colours — eleven fixed values

```css
:root {
  --g-transition-metals:      #f9aa62;   /* orange       */
  --g-actinides:              #559982;   /* sage         */
  --g-lanthanides:            #d473a2;   /* pink         */
  --g-post-transition-metals: #97c0aa;   /* pale green   */
  --g-unknown:                #efce69;   /* yellow       */
  --g-noble-gases:            #e57860;   /* coral        */
  --g-non-metals:             #a6c6d5;   /* pale blue    */
  --g-alkali-metals:          #456683;   /* slate blue   */
  --g-alkaline-earth-metals:  #15403d;   /* deep pine    */
  --g-metalloids:             #6e58ac;   /* violet       */
  --g-halogens:               #4c575a;   /* grey blue    */
}
```

**The ink ladder had to be compressed.** The reference's own tertiary ink, `#8a938f`, is 3.06:1 on
our paper and 2.84:1 on the sunken surface — below AA at the 13.6px it is used at (captions, the
footer, an element's atomic number in a configuration row, a discovery year, a field's unit). Any
value that passes AA is within half a step of `--ink-soft`, so the four-step ladder the reference
uses is now three visible steps plus a fourth that reads as faint only by weight and placement
rather than by lightness. That is the honest cost of the requirement, and a browser sweep over every
page is what found it: the failure was invisible in the code and obvious on measurement.

**Invariant to test:** every ink token reaches WCAG AA on every surface token it is used on. A test
in `tests/lib/contrast.test.js` reads both sets of values from `styles/tokens.css` and holds them.

**Invariant to test:** every group colour has a paired foreground that reaches WCAG AA contrast
against it. The pairs live in `source/data/categories.json` (or a single derived function in
`lib/contrast.js`), not in each component. Dark groups (`alkaline-earth-metals`, `halogens`,
`alkali-metals`, `metalloids`) take the cream foreground; pale groups take the dark ink. The
reference does the same thing with its `--fill` / `--on-fill` custom properties.

**How to apply a group colour:** set the custom property on the element, do not add a modifier class
per group.

```html
<a href="/elements/hydrogen" style="--fill: var(--g-non-metals); --on-fill: #12211f">
```

```css
.tile { background: var(--fill); color: var(--on-fill); }
```

### 1.3 Block colours (alternate table view)

```css
--g-s-block: var(--g-alkali-metals);        /* slate blue  */
--g-p-block: var(--g-actinides);            /* sage green  */
--g-d-block: var(--g-transition-metals);    /* orange      */
--g-f-block: var(--g-lanthanides);          /* pink        */
```

The four blocks point at four of the eleven group colours rather than repeating their values: the
reference's orbitals view uses the same four, so a correction to a group colour moves both views at
once.

### 1.4 Typography

```css
--font-body:    "Inter", "Work Sans", ui-sans-serif, system-ui, "Helvetica Neue", Arial, sans-serif;
--font-display: var(--font-body);
--font-mono:    ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;

--step--1: clamp(0.79rem,  0.77rem + 0.10vw, 0.85rem);
--step-0:  clamp(1.00rem,  0.96rem + 0.18vw, 1.10rem);
--step-1:  clamp(1.25rem,  1.18rem + 0.35vw, 1.45rem);
--step-2:  clamp(1.56rem,  1.44rem + 0.62vw, 1.94rem);
--step-3:  clamp(1.95rem,  1.74rem + 1.05vw, 2.58rem);
--step-4:  clamp(2.44rem,  2.08rem + 1.78vw, 3.43rem);
--step-5:  clamp(3.05rem,  2.45rem + 2.98vw, 4.58rem);

--leading-tight: 1.08;   /* display headings */
--leading-body:  1.6;
--leading-prose: 1.7;
--measure:       68ch;   /* max prose width  */
```

Usage: hero `<h1>` → `--step-4`/`--step-5`; section `<h2>` → `--step-2`; card title → `--step-1`;
body → `--step-0`; caption/badge → `--step--1`.

### 1.5 Space, shape, layout

```css
--sp-1: 0.25rem;  --sp-2: 0.5rem;  --sp-3: 0.75rem;  --sp-4: 1rem;
--sp-5: 1.5rem;   --sp-6: 2rem;    --sp-7: 3rem;     --sp-8: 4rem;   --sp-9: 6rem;

--radius:    2px;   /* the default: near-square */
--radius-lg: 8px;   /* raised panels only       */
--shell:     1100px;
--pad-shell: var(--sp-5);   /* horizontal page padding, reduced on small screens */

--rule-solid:  1px solid var(--ink);
--rule-dotted: 1px dotted var(--ink);
--shadow-sm: 0 1px 2px  #15403d0f;
--shadow-md: 0 4px 16px #15403d14;
```

### 1.6 Motion

```css
--dur-fast: 0.16s;
--dur-base: 0.30s;
--dur-slow: 0.62s;
--ease-out:  cubic-bezier(0.22, 1, 0.36, 1);
--ease-soft: cubic-bezier(0.33, 1, 0.68, 1);

--rise:    14px;   /* entrance offset */
--rise-sm:  8px;
--stagger:     70ms;
--stagger-sm:  45ms;
```

Character: short, decelerating, upward. Never bouncy, never longer than `--dur-slow`.

**Mandatory:**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## 2. Base layer — `source/styles/base.css`

Reset and element defaults: `box-sizing: border-box` everywhere, margin reset, `text-rendering`,
`font-synthesis: none`, a sensible media default, a visible `:focus-visible` ring built from
`--ink` and `--accent`, and `::selection`. No component styles here.

## 3. Naming conventions

Follow the reference's own scheme — it is conventional, readable, and already proven in this exact
design:

- **Components** use a block name and element suffixes: `.tile`, `.tile__z`, `.tile__sym`;
  `.meta`, `.meta__name`, `.meta__sub`.
- **Modifiers** use a double dash: `.lvl--beginner`, `.tile--placeholder`.
- **State** uses `is-` / `has-`: `.is-active`, `.is-isolated`, `.has-error`.
- **Utility** classes are rare and named for what they do, not where they are: `.visually-hidden`,
  `.stack`, `.rule-dotted`.
- No nested selectors deeper than three levels. No `!important` outside the reduced-motion block
  and `.visually-hidden`.
- No IDs as style hooks.

## 4. Component inventory

Each component is one JS module in `source/scripts/components/` and one stylesheet of the same name
in `source/styles/components/`. Styles never bleed across files.

| Component | Owns | Used by |
|---|---|---|
| `site-header` | wordmark, primary nav, search field, responsive collapse | every page |
| `submenu` | contextual secondary nav, active-item underline | every page family |
| `site-footer` | five link columns, tagline, copyright | every page |
| `periodic-table` | the 18×10 grid, colour modes, isolation, keyboard nav, tooltips | home, 4 table views, group pages |
| `element-tile` | one tile: number, symbol, name; compact and detailed variants | table, index, cards |
| `element-card` | index card: tile + name + group + weight · state | elements index, rankings, group pages |
| `legend-chips` | one pill per colour key, with count; emits isolate events, or links to a key's own page | home, 4 table views, group pages |
| `element-search` | input, live filtering, quick-jump behaviour | home, elements index |
| `property-list` | the ~40-row labelled property table, with sentinel handling | element detail |
| `definition-list` | key/value pairs for Discovery and similar | element detail, glossary |
| `faq-block` | generated question/answer pairs from element data | element detail |
| `shell-diagram` | generated SVG electron shell diagram | element detail |
| `bar-ranking` | horizontal magnitude bars for the ranking pages | melting/boiling point pages |
| `converter-input` | one synchronised numeric input in the temperature calculator | calculators |
| `filter-bar` | search + letter jump index | glossary, elements index |

## 5. Responsive strategy

- Mobile-first CSS. Base styles target narrow screens; `min-width` media queries add complexity.
- Breakpoints: `40rem`, `56rem`, `72rem`.
- The periodic table is the one intentional exception: it keeps its 18-column geometry and scrolls
  horizontally rather than reflowing out of shape. A narrow-screen affordance plus keyboard
  scrolling makes it reachable.
- Element index cards: one column → two columns at `40rem`.
- Never hide content to make a breakpoint fit. Reflow it.

## 6. Accessibility requirements for this layer

- Every group colour pairing meets WCAG AA (4.5:1 for text, 3:1 for the tile as a graphic element
  against its background).
- Focus is always visible, and never removed without an equal-or-better replacement.
- The dotted rule must not be the only signal carrying meaning.
- Tiles are real links or buttons with accessible names, not `div`s with click handlers.
- `prefers-reduced-motion` is honoured everywhere, without exception.

## 6.1 If a dark theme is ever wanted

The semantic token names are already theme-neutral: nothing in `tokens.css` is named after the light
palette, and no component reads a literal colour. Adding a second theme later is therefore a
contained change — a second value set under a root attribute — rather than a refactor. It is recorded
here as a deliberate, reversible omission rather than an oversight.

## 7. Phase 1 deliverable

A **style guide page** rendering every token and every component in isolation: the palette swatches,
the type scale, the spacing scale, all eleven group colours with their foregrounds and a contrast
result, each component in each state. It is a development tool, excluded from the built output and
from the sitemap, and it is the fastest possible way to verify this layer.
