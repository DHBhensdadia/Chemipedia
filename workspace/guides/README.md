# Developer Guides — ChemiPedia

This folder is a developer explaining the project to another developer. No assumed context, no
hand-waving, no "it just works". If you have cloned this repository and you want to understand it —
or if you wrote it and have been asked to explain it in an interview — start here.

Everything in this folder describes **the code as it actually is**. If a guide disagrees with the
source, the guide is wrong and must be fixed in the same commit as the code.

> **Complete as of `v1.1.0`, the release that added the atom viewer.** These guides were written
> up-front as a specification of intent, and the intention was to correct each one at the end of every
> phase. Some were not corrected as they landed — the interview reference still carried `(pending)`
> rows into the final phase, and the tour named files that were never created — so Phase 11's close-out
> audited all four against the source and corrected them, and the atom viewer's close-out did it again
> for the four modules, three sheets and one page family that feature added. A guide that has drifted
> is a defect.

---

## Read in this order

| # | Guide | What it gives you |
|---|---|---|
| 1 | [What this project is](01-project-overview.md) | The product, the constraints, the decisions that shaped it, and what is deliberately missing. |
| 2 | [Tour of the codebase](02-tour-of-the-codebase.md) | Every folder, what lives in it, and the rule that decides what belongs there. |
| 3 | [How a page gets built](03-how-a-page-gets-built.md) | End-to-end trace from a URL in the address bar to pixels on screen, following one real page the whole way. |
| 4 | [Interview quick reference](04-interview-quick-reference.md) | "Where is X?", "how does Y work?", "why did you do Z that way?" — with the file to open for each answer. |

## If you only have five minutes

1. Read [`01-project-overview.md`](01-project-overview.md).
2. Read the "Thirty-second version" at the top of
   [`03-how-a-page-gets-built.md`](03-how-a-page-gets-built.md).
3. Skim the table in [`04-interview-quick-reference.md`](04-interview-quick-reference.md).

That is enough to hold a conversation about the project.

## Where to go for the other kinds of question

| You want | Go to |
|---|---|
| The rules for working on this repo | `workspace/AGENTS.md`, `workspace/WORKING_AGREEMENT.md` |
| Where did we stop, what is next | `workspace/RUN_STATE.md`, `workspace/HANDOFF.md` |
| What are we building, in what order | `workspace/docs/IMPLEMENTATION_PLAN.md` |
| Why was a technical choice made | `workspace/docs/ARCHITECTURE.md` |
| Exact colours, type, spacing | `workspace/docs/DESIGN_SYSTEM.md` |
| Where does the data come from | `workspace/docs/DATA_SOURCES.md` |
| Where is any given file | `workspace/docs/MIND_MAP.md` |
| How do I commit here | `workspace/docs/GIT_WORKFLOW.md` |
| How do I verify it works | `workspace/docs/TESTING_STRATEGY.md` |
| The reference site, in detail | `workspace/docs/research/01-reference-site-audit.md` |

## A note on tone

These guides are written plainly and directly. They explain reasoning, not just mechanics — why a
thing is the way it is, not only what it does. That is deliberate: a developer who understands *why*
can change the code safely, and a developer being interviewed needs to answer *why*.
