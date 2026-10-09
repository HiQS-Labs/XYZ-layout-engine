# RELAY · GH-13 plan QA: design-diagram skill
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-09.
-->

NEXT: Reviewer
STATUS: Open
ROUND: 2 / 3

## ▶ TAKE YOUR TURN — read this first (works for ANY agent: Claude, Codex, agy)
1. **Read this whole file** (header, Setup, Ground rules, every block in the Log).
2. **Check it's your turn:** `NEXT` (top) names the role to act. Confirm you are bound to it and the
   last Log block isn't already yours. If not → STOP and reply "wrong window — nudge the <other> window."
3. **Do your role's work** on the artifact named in Setup:
   - **Reviewer:** review vs the Definition of Done → graded findings
     (`[Blocker]`/`[Should]`/`[Nit]`/`[Pass]`), each with a concrete fix → set a **VERDICT**
     (exactly PASS, FAIL, or PARKED) and a **Basis** (explanation). **Review the whole file, not just the diff** (GH-268):
     a beta test had this loop reach `Approved` in two rounds while an independent audit of the same
     branch found 20 issues (1 critical, 4 high) — every one of them in the pre-existing code the
     change sat on, which nobody had read. Pre-existing defects in a file you are touching are IN
     SCOPE; if you find none, say so explicitly rather than leaving it unstated.
     **Declare it: every review block must contain a literal `swept file: yes` or `swept file: no`
     line.** Without it a reviewer that skipped the sweep is indistinguishable in the transcript from
     one that did it and found nothing — which is how the original 20 issues stayed invisible.
     Any `[Pass]` or "verified"/"confirmed" finding MUST
     carry a quoted span or a `file:line` citation — an uncited one is mechanically downgraded to
     `[Unverified — no citation]` (GH-173 B3). Do **not** edit the artifact; only append findings here.
     **A finding that asks for a behaviour change is a generalization unless you can paste the concrete
     input — a row, a value, a `file:line` — that fails under the current code** (GH-681: the gh673
     final QA relay generalized one late-error observation into "or a later invalid identity", the
     Producer implemented it, the same seat `[Pass]`ed it next round, and one historical NULL-URL
     ledger row then blanked every issue). Every `[Blocker]` or `[Should]` requesting a behaviour
     change MUST carry three lines: `Observed input:` (the failing input you saw), `Affected scope:`
     (the input predicate the change would govern), `Falsifier:` (the fixture or data that would show
     the change unnecessary or wrong, and its expected result).
     A `[Blocker]` must cite an observed failure. This is a protocol rule, not a mechanical check —
     the Producer may disposition a request lacking these as `Declined — unproven generalization`.
   - **Producer:** log a disposition for every open finding (Implemented / Modified / Declined + why,
     including `Declined — unproven generalization` for a behaviour-change request that carries no
     `Observed input:` / `Affected scope:` / `Falsifier:`), make the change, then add new work.
4. **Append ONE block** at the very bottom, directly **above** the marker line. Never edit earlier turns.
   Reviewer headings may be `### Reviewer · Round N`, `### Round N · Reviewer · <agent>`, `### Reviewer (<agent>)` (optionally followed by `— rN`), or `### Reviewer — Round N` (optionally followed by `(<agent>)`); follow the heading with a non-empty review body.
5. **Update the header:** flip `NEXT`; set `STATUS` (`Approved` closes — Reviewer only; else `Open`);
   the Producer bumps `ROUND` when opening a new cycle. If the max `ROUND` ends without `Approved`,
   set `STATUS: Escalated`.
6. **Commit only the relay file** (`relay(gh13-plan-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `PROJECT/1-INBOX/GH-13-DIAGRAM-DESIGN-SKILL.md` (capture and plan). Source paths it plans against: `examples/2026-10-09-rag-system/render-diagram.mjs`, `examples/2026-10-09-rag-system/README.md`, `examples/2026-10-08-solar-system/render-diagram.mjs`, `examples/2026-10-08-solar-system/generate-assets.py`, `examples/2026-10-08-solar-system/README.md`, `PROJECT/1-INBOX/GH-5-MVP-FOUNDATION.md`, `CHANGELOG.md`, `AGENTS.md`, `GUIDING-PRINCIPLES.md`, `test-budget.json`, `tools/spike/assets.mjs`.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-09
- Definition of Done: the plan satisfies issue #13 (https://github.com/HiQS-Labs/XYZ-layout-engine/issues/13): a skill file that lets an agent run the diagram design process end to end in this repo, pointing at the RAG example as the pattern, listing evidenced traps, with no scaffolder, dependency, test or engine change, and a falsifiable acceptance check.

## QA brief (read before reviewing)

This is plan QA, before the skill is written. Operational envelope: one Markdown skill file for a local single-developer repo. Grade against issue #13 and commensurate complexity. Do not ask for a scaffolder, test suite, CI, or a shared runtime refactor (GH-5).

Read the plan in full and the Setup source paths. You may run narrow read-only probes under `.relay-scratch/` or `$TMPDIR`. Do not run renderers, tests or gates.

Questions:
1. Grounding: is every recon claim true against the files? In particular: no tracked `SKILL.md` exists (inspect the inventory you can see), the RAG script's import-guard order, the traps and their cited evidence (GH-5 lines, the Solar System changelog entry, the flex-wrapper pattern in the RAG script).
2. Is pointing at the RAG example, rather than shipping a template or script, the right smallest mechanism? Is anything the process needs missing from requirements 1-6 (for example the brief or art-policy steps), or is anything padding?
3. Location and naming: is `skills/design-diagram/SKILL.md` a sound place in this repo given `ROUTER.md`, `AGENTS.md` and PDDA? Does the plan wrongly assume anything about how agent apps discover skills?
4. Is the acceptance check falsifiable? Can the path probe pass vacuously, and does the cold-run check actually detect a skill that forces guessing? Is a cold run by a fresh agent proportionate here?
5. Does the plan stay inside non-goals and the test budget (no new test file, workflow, dependency)?
6. Are the rating rationale (35/10/50/75, neutral appeal) and rollback honest?

Output: graded findings with citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, and `swept file: yes|no`. Set STATUS Approved only if nothing blocking remains. Hand off to claude-a if changes are requested.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1

VERDICT: FAIL
Basis: The one-file approach is proportionate and grounded, but the path acceptance contract needs a non-vacuity requirement before implementation. This is a small documentation revision, not a request for more infrastructure.
swept file: yes

- [Should] **R1 — Make the path probe reject missing coverage.** `PROJECT/1-INBOX/GH-13-DIAGRAM-DESIGN-SKILL.md:55` says “every repo path and command named in `SKILL.md` resolves” and requires an invented-path red control. A checker can satisfy both while accepting an empty extracted reference set; the red control only demonstrates recognition of that invented reference. Require a reported inventory/count, reject zero references, and explicitly require the RAG pattern and its pinned-runtime prerequisite. Distinguish existing input paths from proposed output paths/placeholders, and name command working directories. Keep this a one-off probe/manual inventory, with no committed checker.
  Observed input: Plan line 55 contains no required-reference inventory or zero-reference rejection; line 35 includes the future output placeholder `examples/<YYYY-MM-DD>-<slug>/`, which cannot be treated as an existing input.
  Affected scope: Acceptance of the planned Markdown skill's references and commands, not renderer behavior.
  Falsifier: An empty/reference-free skill must fail; removing the required RAG reference must fail; a complete skill must pass; an invented input path must fail by name. An explicitly declared future output path must not fail merely because it does not exist yet.
- [Nit] **R2 — Preserve changelog history on rollback.** Plan line 51 says to delete the changelog entry, whereas `PROJECT/PDDA.md:1014`–1018 requires append-only history. Delete the skill and append a rollback entry after publication; deleting an unpublished draft entry is fine. The Easy reversibility rating remains appropriate.
- [Nit] **R3 — Separate observed workarounds from unmeasured failure claims.** Plan line 30's flex-wrapper recommendation is supported by `examples/2026-10-09-rag-system/render-diagram.mjs:61` and `:111`, but those successful constructions do not establish the categorical claim “`textAlign` on a span is not honored.” Likewise, `:59`–64 and `:125` show positioned parents, not a recorded failure without them. Phrase these as the example's working patterns, or attach the original failing observation. A new renderer probe is unnecessary for the narrower wording.
- [Pass] **Grounding and smallest mechanism.** The import guard precedes the awaited runtime import (`examples/2026-10-09-rag-system/render-diagram.mjs:8`–12); required stages, geometry checks and evidence output are explicit (`:24`–26, `:138`–184). The nested-raster incident is recorded in `CHANGELOG.md:17` and `PROJECT/1-INBOX/GH-5-MVP-FOUNDATION.md:33`; the encoded-path problem is supported by `tools/spike/assets.mjs:4` and GH-5 line 33. Reusing this example with the paid-art receipt pattern (`examples/2026-10-08-solar-system/generate-assets.py:20`–35; `render-diagram.mjs:25`–35) earns the proposed mechanism; no scaffolder or shared-runtime change is needed.
- [Pass] **Scope, placement and cold-run intent.** Plan lines 35–45 include brief, art policy, both backends, red controls and visual inspection, explicitly excluding new tests/dependencies/workflows. `test-budget.json` allows no new suite without a named uncovered failure. `skills/design-diagram/SKILL.md` is a reasonable source location: `ROUTER.md:7` assigns startup routing to ROUTER, while plan lines 31 and 39 explicitly avoid claiming app discovery or automatic installation. The fresh-agent four-stage exercise and “Anything it had to guess is a finding” (plan line 56) are proportionate acceptance for a skill; report missing operational instructions separately from intentional design choices. Provisional 35/10/50/75 ratings and neutral appeal are explained as judgments at line 75, not measurements.
- [Unverified — needs clone run] No renderer, test or gate was executed. Import order and checks were inspected, not run. The complete 75-line plan and all Setup source files were read; no additional plan defects were identified beyond R1–R3. Graph tools are unavailable. A read-only inventory command, `python3 -c 'from pathlib import Path; print(sorted(str(p) for p in Path(".").rglob("SKILL.md")))'`, exited 0 with `[]`; this supports only the visible seeded inventory, not tracked-history or `.xyz/` claims. A separate read-only `Path.exists()` probe exited 0 and printed `roadmap entrypoints: {'utils/py/releases_app.py': False, '.xyz/utils/py/releases_app.py': False}`; the root README is also absent, so those startup steps could not run here. `gh api repos/HiQS-Labs/XYZ-layout-engine/issues/13 --jq '{title,body}'` exited 1 with `error connecting to api.github.com`; review therefore uses the supplied Definition of Done and local issue capture, not a claim of live issue verification.

Handing off to claude-a (Producer) — address R1 and disposition R2–R3, then take the next turn. Only this relay file was edited; no git command was run.

### Producer · Round 1 → 2 (claude-a)

Plan revised; see `PROJECT/1-INBOX/GH-13-DIAGRAM-DESIGN-SKILL.md`.

- **R1 [Should] — Implemented.** The path probe now prints an inventory and count, rejects zero, requires the RAG example and the pinned-runtime prerequisite, separates input paths from declared output placeholders, names each command's working directory, and lists four falsifiers (empty skill, missing RAG reference, invented input path, complete skill). Still a one-off, nothing committed.
- **R2 [Nit] — Implemented.** Rollback now deletes the skill and appends a rollback changelog entry; an unpublished draft entry may be deleted.
- **R3 [Nit] — Implemented.** The trap list now says what was observed (a span's `textAlign: right` rendered left-aligned in the first RAG render; the flex wrapper is the working pattern) and marks the positioned-parent point as a working pattern, not a recorded failure.
- **[Pass] findings — acknowledged.**

Handing off to codex (Reviewer) for round 2.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
