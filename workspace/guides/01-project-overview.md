# Guide 1 — What this project is

## The product in one paragraph

**ChemiPedia** is a website about the periodic table. Its home page shows all 118 elements in the
familiar 18-column grid, colour-coded so that a question can be answered by shape rather than by
reading — hover "Halogen" and the five halogen tiles light up while everything else recedes. Each
element has its own page: what it is, how it is pronounced, its properties, where its electrons sit,
what we use it for, where it came from, and who found it. Around that centrepiece sit four alternate
views of the same table (states, orbital blocks, electronegativity, and the history of when elements
were discovered), a searchable index of all 118 elements, eleven group pages, a glossary of 418
terms, and a live temperature converter.

That is the whole product. There is nothing else, and that is on purpose.

## Why it exists

It is a university JavaScript capstone project, and it doubles as a portfolio piece. Those two facts
explain almost every decision in the repository:

- **It is a JavaScript project, so the JavaScript is the point.** No framework does the interesting
  work, because then there would be no interesting work to show. The routing, the rendering, the
  colour scales and the keyboard navigation across a 118-cell grid are all written by hand.
- **It must be explainable.** Every module has one job and a name that says what the job is. If a
  part of the codebase cannot be explained in a sentence, it has been built wrong.
- **It must still run in five years.** Zero dependencies means nothing can rot, break, or be
  abandoned underneath it. Opening the built site in a browser in 2031 will work.

## The design brief, honestly stated

The visual and interaction design is a deliberate reproduction of an existing chemistry reference
site, `breakingatom.com`. Reproducing a design is a well-established exercise — this project exists
to demonstrate that the structure, rhythm, information architecture and interaction model have been
understood deeply enough to rebuild.

What is **not** reproduced is the brand. ChemiPedia has its own name, its own wordmark, its own
favicon, its own prose, and its own data. The result is intended to read as a site that *shares a
design language* with the reference, not as a copy of it. The boundary is written down explicitly in
`workspace/docs/BRAND_GUIDELINES.md` §2, and enforced automatically — a brand scan runs before every
phase-completion commit and a single match blocks it.

## Two sections that are deliberately missing

The reference site also has a **Learn** section (courses, learning tracks, long-form articles,
tutoring) and a **Games** section (quizzes, flash cards, a find-the-element game). ChemiPedia has
neither.

This is a **product decision, not unfinished work**. They are not stubbed, not greyed out, not
marked "coming soon", and not present in navigation, in the footer, or in any route table. If you
are looking at this repository and wondering where the quizzes are — they are out of scope, by
design, and the reason is recorded in `workspace/docs/IMPLEMENTATION_PLAN.md` §1.2.

## The constraints that shaped the code

| Constraint | Consequence you can see in the code |
|---|---|
| JavaScript only — no TypeScript | No type annotations anywhere. Types are documented in prose and enforced by tests instead. |
| No frameworks | Hand-written rendering, routing and state. The interesting parts of the app are ours. |
| No runtime dependencies | No `node_modules` in the built site. Even the dev server is plain Node. |
| Data-driven | 118 element pages and 418 glossary pages come from one template each, not from 536 hand-written files. |
| Must survive interruption | Work is committed in small units, and `workspace/RUN_STATE.md` records exactly where a session stopped. |
| Must look right, not just work | Every phase ends with a screenshot comparison against the reference at three widths. |

## What "done" looks like

A visitor can land on the home page, understand the table at a glance, isolate a group, open any
element, read its properties and history, jump to a term in the glossary, cross-link back to an
element, convert a temperature, and browse all 118 elements ranked by melting point — on a phone, on
a laptop, with a keyboard only, and with reduced motion enabled.

Every one of those journeys is checked before the project closes. The checklist is in
`workspace/docs/TESTING_STRATEGY.md` §7.
