# Research 02 — Tooling and visual verification

**Question:** how does an agent that cannot see verify that a page looks right, and how does the
project catch visual regressions across eleven phases built in separate sessions?

**Date:** 2026-10-01
**Feeds:** `docs/TESTING_STRATEGY.md`, Phase 0 work item 0.6, every phase's exit criteria.

---

## 1. The problem

An agent reads the DOM and the accessibility tree. Both are silent about the things that make a
replica fail: spacing rhythm, colour, alignment, overflow, a tile two pixels out of its row, a
font fallback that changed the wrapping. Reading markup cannot detect any of these.

Two consequences fall out of that:

1. Verification must be **image-based**, and the image must actually be looked at.
2. Verification must be **repeatable**, or comparisons drift between sessions and the drift is
   mistaken for a regression.

## 2. Available tooling

### 2.1 Browser control (what we have in-session)

The agent's browser tools provide, without any installation:

| Capability | Tool | Use in this project |
|---|---|---|
| Open a page | `preview_open` / `preview_navigate` | Open the reference and our build side by side |
| Read structure | `preview_snapshot` | Accessibility tree — verifies semantics, labels, heading order, control roles |
| **See** the page | `preview_screenshot` | The primary visual check; viewport and full-page |
| Inspect computed style | `preview_evaluate` | Extract exact colours, sizes, grid geometry — how the reference tokens in Research 01 were obtained |
| Check for errors | `preview_logs` | Console errors, failed requests, warnings after an interaction |
| Set viewport | `preview_resize` | The 1280 / 768 / 375 px sweep |
| Emulate colour scheme | `preview_set_color_scheme` | Confirming the site renders identically under a dark OS preference, since it ships one light theme (ADR-006) |
| Record | `preview_recording_start` / `_stop` | Capture motion and transitions, which a still cannot show |

**Key insight:** `preview_evaluate` is the bridge between "cannot see" and "knows exactly what the
reference does". Rather than guessing at a colour, read the computed style. That is how the entire
token table in Research 01 was produced, and it is the method to reuse whenever a value is uncertain.

### 2.2 Playwright / Playwright MCP for regression testing

Playwright is the standard tool for this problem. Its `expect(page).toHaveScreenshot()` captures a
baseline on first run, then compares later runs pixel-by-pixel (via `pixelmatch`) and fails when the
difference exceeds a configured threshold. Playwright MCP exposes the same browser control to an
agent through structured accessibility snapshots rather than raw HTML, which is what makes it
useful for an agent driving a UI.

**But it conflicts with our constraints.** Playwright is an npm dependency tree, and ADR-004 states
that the running site requires no third-party packages. Nothing stops us adding Playwright as a
*development-only* tool — but it means the project no longer runs from a clean clone without an
install, which is the property we chose the architecture to protect.

**Resolution — a two-track approach:**

| Track | Tool | Purpose | Dependency cost |
|---|---|---|---|
| **Track A — mandatory, every phase** | The in-session browser tools above | Look at the page, compare to the reference, record findings in the phase log | None |
| **Track B — optional, additive** | Playwright test runner + `toHaveScreenshot` | Automated pixel-diff baselines for a fixed viewport set, run when the author wants a hard gate | Dev-only npm install |

Track A is required. Track B is opt-in, must live outside the shipped source path, and must never
become a prerequisite for running the site. If installing it proves awkward, the project loses an
automation convenience and nothing else.

**Caveat discovered in research, relevant to Track B:** Playwright's own documentation and the
community reports are consistent that screenshot comparisons are sensitive to the environment —
fonts, GPU, device pixel ratio and OS rendering differ, so a baseline captured on one machine will
fail on another. If we adopt Track B, baselines must be generated and compared on the same
machine, and font loading must be awaited before capture (`document.fonts.ready`), otherwise the
diff reports noise and the suite gets ignored.

### 2.3 Other MCP-style capabilities considered

| Tool | Verdict |
|---|---|
| Playwright MCP | Useful for driving and snapshotting a running UI. Same dependency caveat. Keep as an optional accelerator, not a requirement. |
| Lighthouse (CLI or in-browser) | Adopt. Accessibility, performance and SEO scoring is required by Phase 11 and needs no project dependency if run from the browser's own devtools/lighthouse. |
| axe-core | Consider for the Phase 11 accessibility sweep. Would be a dev-only dependency; the manual keyboard and contrast audit is mandatory regardless. |
| W3C HTML validator | Adopt as a manual check; no install needed. |

---

## 3. The verification recipe we will standardise

This is the procedure every phase's visual gate follows. It is written here so it is identical
across sessions, and it is what `RUN_STATE.md` means by "verification".

1. **Serve** the build: `node source/tools/serve.js`, then open `http://localhost:<port>/`.
2. **Reference alongside.** Open the corresponding reference page in a second browser tab in the
   same session, so the two can be compared without relying on memory. Do not compare a screenshot
   from a previous session — the reference itself may have changed.
3. **Capture at three widths.** 1280 px (desktop), 768 px (tablet), 375 px (mobile), via
   `preview_resize` then `preview_screenshot`.
4. **Capture the reference at the same three widths** and open both images.
5. **Compare, and name the differences out loud** in the phase log: order of sections, spacing
   between sections, heading sizes, colour, tile geometry, rule style, alignment, overflow,
   wrapping, focus state, motion.
6. **Read the accessibility tree** (`preview_snapshot`) for the same page and confirm: landmarks,
   one `<h1>`, heading order, accessible names on every control, no empty links or buttons.
7. **Read the console** (`preview_logs`) and require zero errors and zero failed requests.
8. **Check the extremes:** empty search result, element 118, the smallest rendering, the longest
   name (`Rutherfordium`, `Darmstadtium`), the `Not measured` sentinel value.
9. **Fix, or record the deviation** with its reason. Silent deviation is a defect.
10. **Record** the outcome in `progress/PHASE_LOG.md`: what was checked, what was found, what was
    changed, and the screenshot references.

## 4. Rule for future agents

> Never mark a visual check complete without having captured and looked at a screenshot in this
> session. Never claim a test passes without the command output. If a screenshot cannot be taken,
> the verification has not happened, and the phase is not complete — say so explicitly in the
> phase log rather than recording a check that did not occur.

---

## Sources

- Playwright visual comparisons documentation — `https://playwright.dev/docs/test-snapshots`
- Playwright MCP overview and community usage reports for agentic UI verification (2026)
- Reproducibility caveats for screenshot tests across environments — Stack Overflow, 2026
- Visual regression testing guidance for AI-generated UIs (2026)
