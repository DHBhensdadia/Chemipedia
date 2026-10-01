# Testing Strategy — ChemiPedia

How we prove the site works, and how we prove it *looks* right. Every phase closes against this
document (`WORKING_AGREEMENT.md` §6 and §10).

> **A phase is not complete until it has been verified visually.** Reading the DOM does not count.
> A screenshot must have been captured and actually looked at, in the session, at desktop, tablet
> and mobile widths.

---

## 1. The four layers of verification

| Layer | Question | Tool | When |
|---|---|---|---|
| **Logic** | Does the code compute the right thing? | `node --test` on pure modules | continuously |
| **Structure** | Is the page semantically correct and reachable? | accessibility-tree snapshot | end of every phase |
| **Appearance** | Does it look like the reference? | screenshots at three widths, compared by eye | end of every phase |
| **Health** | Is anything erroring or silently failing? | console + network log | after every interaction |

All four are required. Passing three of four is a failed phase.

## 2. Layer 1 — Logic tests

**Runner:** Node's built-in test runner. Zero dependencies, no install, matches ADR-004.

```bash
node --test source/tests
```

**What must be tested** — anything pure or rule-like:

| Subject | Assertions |
|---|---|
| Element repository | lookup by number, symbol, slug; lookups return `null` rather than throwing; all 118 resolve |
| Sorting and ranking | melting/boiling/density rankings are monotonic; unknown values sort last, never in the middle |
| Grid geometry | `position` for a sample including every lanthanide and actinide; no two elements share a cell |
| Colour scales | interpolation returns the domain endpoints exactly; midpoints are monotonic; out-of-range clamps |
| Contrast pairing | every group colour pairs with a foreground that meets WCAG AA |
| Formatters | `null` → placeholder; units render correctly; negative temperatures keep their sign and degree symbol |
| FAQ generator | generated question/answer pairs match the element's own values |
| Shell diagram geometry | electron counts per shell are correct for H, C, Fe, Au, U |
| Temperature conversion | round-trips; `0 °C = 32 °F = 273.15 K`; `-40 °C = -40 °F`; rejects non-numeric input |
| Glossary repository | A–Z grouping; prefix search; slug lookup; 418 terms |
| Brand scan | no prohibited string in any data record or prose field |

**Rules**

- Test the rule, not the implementation detail. A test that breaks when a function is renamed
  without changing behaviour is a liability.
- Every test has a name that reads as a sentence about behaviour.
- No test may depend on network access. The build script may fetch; the tests may not.
- A phase's new logic without a test is unfinished work — it fails the phase's exit criteria.

## 3. Layer 2 — Structure

Take an accessibility-tree snapshot of every page in the phase and confirm:

- exactly one `<h1>`, and the heading order descends without skipping;
- landmarks present: `banner`, `navigation`, `main`, `contentinfo`;
- every interactive element has an accessible name, and the name is meaningful out of context
  (not `"link"`, not an icon alone);
- tiles and cards are links or buttons, not clickable `div`s;
- form controls are labelled, and errors are announced;
- no empty links, no empty buttons, no placeholder `href="#"` in shipped pages.

Also validate the generated HTML where practical: no unclosed tags, no duplicate `id`, no
`<a>` nesting.

## 4. Layer 3 — Appearance (the gate that actually catches replica failures)

Run this at the end of **every** phase, for **every** page the phase touched, and re-run it for at
least one page from each earlier phase to catch regressions.

**Before anything else: make the preview composite.** A browser preview that is not filling the
panel produces no frames, and every capture attempt fails with a message saying the webview is not
being composited. Resizing the preview with fill enabled is what makes capture work. Do that first,
then set the width you want. If a capture still fails, the problem is the capture and not the page:
say so, rather than treating a missing screenshot as a passed check.

**Procedure — identical every time** (full version in `docs/research/02-tooling-and-visual-verification.md` §3):

1. Serve the build: `node source/tools/serve.js`.
2. Open the built page, and open the equivalent reference page in a second tab of the same session.
   Never compare against a remembered screenshot.
3. Set the viewport to **1280 px**, screenshot both, and compare.
4. Repeat at **768 px** and **375 px**.
5. Compare, and **name the differences out loud** in the phase log. What specifically differs:
   order of sections, vertical spacing, heading size, colour, tile geometry, rule style, alignment,
   text wrapping, overflow, focus styling, motion.
6. Check the console and network log: zero errors, zero failed requests.
7. Check the extremes:
   - the longest element names (`Rutherfordium`, `Darmstadtium`) and symbols;
   - atomic number 118 and atomic number 1;
   - an element with many unknown properties;
   - an empty search result;
   - a 375 px viewport with the table horizontally scrolled to both ends.
8. Fix the difference, or record it as a deliberate deviation **with a reason**.

**Deviation rule.** Some differences are intentional: different brand, different typeface, removed
Learn/Games surfaces, our own copy. Those are recorded once, in the phase log, and do not need
re-recording. Any *other* difference is a defect.

**What to look for specifically on this design**, because these are where the replica fails:

- the dotted rule is 1px dotted, not dashed, not 2px;
- tile gaps are uniform in both axes — the lanthanide/actinide offset is the usual culprit;
- the empty cells of the table's top rows are genuinely empty and correctly sized, not collapsed;
- group colour foreground contrast flips correctly on dark groups;
- section spacing follows the spacing scale rather than drifting per section;
- hero type size tracks the fluid scale instead of being fixed;
- horizontal scroll on mobile does not clip the first or last column.

## 5. Layer 4 — Health

After every interaction in a verification pass, read the console and network log. Required:

- zero console errors;
- zero failed requests (404s, CORS, missing assets);
- no warnings that indicate a real defect (a deprecated API, a layout warning, a missing source map
  is fine; a failed fetch is not).

A single console error fails the phase.

## 6. Accessibility checks

Beyond the structural snapshot:

- **Keyboard:** tab through the whole page. Every interactive element is reachable, focus is always
  visible, and no focus trap exists. On the table, arrow keys move between tiles.
- **Contrast:** check body text, muted text, badges, and every group colour against its foreground.
  Target WCAG AA.
- **Reduced motion:** emulate `prefers-reduced-motion: reduce` and confirm nothing animates.
- **Zoom:** 200% browser zoom does not break layout or clip content.
- **Screen-reader sanity:** landmarks and the table's accessible names make sense read aloud. The
  table should announce as a table-like structure, not as 118 unlabelled links in a flat list.

## 7. Phase close-out checklist

Copy this into the phase's entry in `progress/PHASE_LOG.md` and complete every line honestly.

```
Phase __ verification
[ ] node --test source/tests ................ pass  (attach the summary line)
[ ] node --check on every changed module .... pass
[ ] Brand scan .............................. PASS: brand scan clean
[ ] Console/network on every touched page ... zero errors, zero failed requests
[ ] Accessibility tree reviewed ............. landmarks, headings, names OK
[ ] Keyboard traversal ...................... complete, focus visible
[ ] Reduced motion .......................... honoured
[ ] 1280 px screenshot vs reference ......... compared — differences: <list>
[ ] 768 px  screenshot vs reference ......... compared — differences: <list>
[ ] 375 px  screenshot vs reference ......... compared — differences: <list>
[ ] Regression check on an earlier phase .... page: ______ result: ______
[ ] Deliberate deviations recorded .......... <list, with reasons>
[ ] docs/MIND_MAP.md updated ................ yes/no
[ ] RUN_STATE.md + HANDOFF.md updated ....... yes/no
```

If any line cannot be honestly ticked, **the phase is not complete**. Say so in the log, record why,
and leave the phase `IN_PROGRESS` with the blocker written into `RUN_STATE.md`. An honest incomplete
phase is recoverable; a falsely-closed one corrupts every phase after it.
