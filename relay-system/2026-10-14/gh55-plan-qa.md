# RELAY · GH-55 plan QA: XYZ Forge diagram example
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-14.
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
6. **Commit only the relay file** (`relay(gh-55-plan-qa-xyz-forge-diagram-example): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `PROJECT/2-WORKING/GH-55-XYZ-FORGE-DIAGRAM.md` (the plan). Drafted sources it
  describes, for grounding: `examples/2026-10-14-xyz-forge-system/{fixture.json,render-diagram.mjs,README.md}`.
  Precedents: `examples/2026-10-09-rag-system/render-diagram.mjs`, `PROJECT/3-COMPLETED/GH-11-RAG-DIAGRAM-EXAMPLE.md`,
  `examples/2026-10-12-belief-reference/{fixture.json,README.md}`, `tools/recipes/recursive-process.design.md`,
  `tools/render.mjs` (`renderSatori`, `renderPlaywright`), `SYSTEM-INSTRUCTIONS.md` (AS-1..AS-10), `test-budget.json`.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-14
- Operational envelope: a single documentation example in a local, single-repo layout engine. Grade against
  the stated requirements and commensurate complexity. Do not ask for new tests (the repo's `test-budget.json`
  ratchet forbids them without a named failure mode), a new recipe, catalog machinery or image generation.
- Definition of Done: the plan is grounded in the actual paths; it satisfies the operator ask (redesign the
  supplied XYZ Forge system diagram with the belief-reference look and feel, saved in `examples/`); it extends
  the existing example pattern rather than building a parallel system; acceptance checks are falsifiable with
  a red control; rating and rollback are honest.

Questions:

1. Are the recon claims true? In particular: `recursive-process` cannot carry this subject without a new
   recipe; the RAG example's pattern and `tools/render.mjs` signatures match how `render-diagram.mjs` uses
   them; `missingSegments` is a real field.
2. Do requirements 2 and 3 capture content and style parity with the source and the belief reference? Are the
   stated simplifications (record connectors landing on the shelf as a whole; harness "writes evidence" and
   harness↔tick edges folded) acceptable, or do they misstate how the system works?
3. Does `render-diagram.mjs` keep one geometry owner and reuse the shared renderer, without duplicating
   renderer logic beyond what the RAG precedent already does?
4. Are the acceptance checks sufficient and falsifiable (including the red control), and is anything required
   missing (e.g. CHANGELOG, PDDA gate, `pnpm test` budget)?
5. Is the `rated 30/10/50/85` rationale honest (appeal neutral), and is the rollback statement accurate?

Flag anything wrong, missing or over/under-engineered, citing file:line. Set STATUS: Approved if it passes.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1 · codex

VERDICT: FAIL
Basis: the example approach is proportionate, but the plan currently violates its own PDDA acceptance gate and leaves the containment red control underspecified. Correct these two bounded documentation issues before approval. Reversibility: Easy. Bet: a named, container-mapped caption makes the promised negative control reproducible without expanding the example or test suite; the failure mode is an unrelated overflow assertion being mistaken for evidence of container containment.
swept file: yes

Read the entire plan and all three seeded example files, plus the named rendering/style precedents. No additional pre-existing defect found in those seeded files beyond the issues/limits below. Verify-tier source fallback: graph tools were not exposed, so no graph project/generation or coverage assertion is possible.

- [Should] **S1 — make the active plan satisfy the document contract.** `PROJECT/2-WORKING/GH-55-XYZ-FORGE-DIAGRAM.md:1` lacks `updated`, `owner`, and `goal`; its full body has no required near-top status table. These are explicit requirements in `PROJECT/PDDA.md:51`–59 and error conditions in `utils/pdda/pdda.sh:40`–59 and `:114`–151. They conflict with the plan's “no new errors” gate at `:81`. Add the three populated fields and the canonical two-column status table; no runtime changes.
  Observed input: the seeded GH-55 active plan, frontmatter lines 1–17 and body lines 19–102.
  Affected scope: this new active plan only.
  Falsifier: the same plan containing all six required populated fields and the canonical status table should yield no findings for this path in the disposable-clone frontmatter/status checks.
  Probe: `python3 - <<'PY'` with `from pathlib import Path; import re; p=Path('PROJECT/2-WORKING/GH-55-XYZ-FORGE-DIAGRAM.md').read_text(); f=p.split('---',2)[1]; print([k for k in ['updated','owner','goal'] if not re.search(r'^'+k+r':',f,re.M)]); print("| What was just completed | What's next |" in p)` then `PY`. Exit 0; decisive output from the equivalent expanded read-only probe: `missing required frontmatter: updated, owner, goal` and `required status table present: False`. No PDDA suite was executed here.

- [Should] **S2 — pin the red control and preserve its evidence.** The instruction “lengthen one caption” (`GH-55-XYZ-FORGE-DIAGRAM.md:77`) does not identify which caption, mutation, expected diagnostic, or durable result location. The ordinary stage/runtime captions built by `render-diagram.mjs:43`–46 do not register a container; only the title and records texts are mapped (`:124`, `:179`). Lengthening `stages[0].caption` therefore cannot exercise its own container check at `:213`–214, although sufficiently long text can trip another guard. Specify, for example, `records.entries[0].caption` → a concrete repeated string, expected id `rec0_caption` with `text escapes its container`, non-zero exit, and restored green rerun. Retain command, mutation, exit status and decisive output in the plan's eventual evidence section (or another existing evidence destination), because the red run overwrites `verification.json` and restoring green overwrites it again (`:235`). No new test or broader containment feature is requested.
  Observed input: plan line 77's unnamed caption; the current `stages[0].caption` is “Captures specified work, scores the backlog and selects the target repository.” and has no `container.intake_caption` assignment.
  Affected scope: the single planned containment red control and its evidence, not arbitrary fixture validation.
  Falsifier: a named records-caption mutation that produces the specified container-escape diagnostic by id and then passes after restoration, recorded durably, resolves this finding without changing the renderer.
  Probe: `python3 - <<'PY'` with `from pathlib import Path; s=Path('examples/2026-10-14-xyz-forge-system/render-diagram.mjs').read_text(); print('label helper registers within:', 'within' in s[s.index('const label='):s.index('const edgeText=')]); print(*[l.strip() for l in s.splitlines() if 'container[' in l or 'container.title=' in l], sep='\n')` then `PY`; exit 0, `label helper registers within: False`. The same probe printed all container assignments: `if(within)container[id]=within`, `container.title='title_panel'`, and the records `_token/_label/_caption` assignments to `recbox`. This is static evidence of mapping, not a rendered negative-control result.

- [Nit] **N1 — distinguish renderer signatures.** Plan `:35`–36 gives both functions the Satori signature. `tools/render.mjs:139` requires `(context, scene, font, width, height, fontFamily, options)` for Playwright. The actual draft correctly passes the context at `render-diagram.mjs:196`; correct the recon prose only.

- [Pass] **Reuse and one geometry owner are sound at source level.** The draft imports the shared operations and root Playwright/fonts (`render-diagram.mjs:9`–14), owns scene construction locally, and calls those operations at `:190`–198; its postprocessing/viewer/assertions follow `examples/2026-10-09-rag-system/render-diagram.mjs`. It does not copy a render backend. `tools/render.mjs:24`–33 initializes Satori internally and `:60` really returns `missingSegments`. The existing recipe's fixed node ids, four numbered stages, and constrained A–E tokens (`tools/recipes/recursive-process.mjs:14`–58) substantiate rejecting it for the five-stage Forge subject.

- [Pass] **Style and scope are specified proportionately.** Requirements 2–4 (`GH-55-XYZ-FORGE-DIAGRAM.md:60`–66) name the content, palette/type/hierarchy and disclaimer. Palette/font roles match `examples/2026-10-12-belief-reference/fixture.json:7` and `tools/recipes/recursive-process.design.md` (“Warm ivory background, charcoal text…” and bundled Barlow Condensed). No generated artwork or new recipe is needed. Mode alternatives and folded record/runtime routes are disclosed in the draft README `:29`–41; their visual legibility remains a render-review question.

- [Pass] **Rating, change boundary and planned gates are reasonable.** The neutral appeal and low severity are explained rather than inferred from preference (`GH-55-XYZ-FORGE-DIAGRAM.md:99`–102). Easy rollback accurately describes the listed additive files/entry/ledger row (`:16`, `:53`); remove only this effort's changes and use the releases CLI for ledger rollback, per `ROUTER.md`. CHANGELOG, both-backend AS-10, PDDA and `pnpm test` are present at `:79`–89; leaving `test-budget.json` unchanged agrees with its current 1-file/4-test budget. No additional test is requested.

- [Unverified — needs clone run] No renderer, executable fixture, test suite or PDDA gate was run here. The seeded example contains only its three source documents; PNGs and `verification.json` are not present. README `:43` and `:53` report visual inspection/runtime outcomes, but this turn cannot corroborate them. During implementation, substantiate them with the disposable-clone render, exact red/green evidence, both PNG inspections and gates; do not treat this plan review as final artifact QA.
- [Unverified — source unavailable] Exact content parity and whether the folded harness↔tick/evidence routes preserve the supplied source's meaning cannot be independently established from the seeded files alone. Read-only command `gh api repos/HiQS-Labs/XYZ-layout-engine/issues/55 --jq .body` exited 1: `error connecting to api.github.com`. At final QA make the original operator diagram (or its accessible canonical location) available and explicitly compare its edges; the README's stated simplifications are not independent proof of parity. No observed semantic failure is asserted.

Operational note: roadmap lookup `python3 .xyz/utils/py/releases_app.py roadmap list` exited 2 because this relay worktree has no vendored `.xyz/` entry; no ledger or tree mutation was attempted. All review execution was read-only apart from the authorized relay file and scratch directory. No Git command was run.

Handing off to Producer (claude-a) — address S1 and S2, disposition N1 and the verification limits, then open round 2 for Reviewer.

### Producer · Round 2 · claude-a

- S1 — Implemented. Plan frontmatter now carries `goal`, `updated`, `owner` (`GH-55-XYZ-FORGE-DIAGRAM.md:5`, `:8`, `:9`) and the canonical `## Status` table (`:24`).
- S2 — Implemented as proposed. Red control pinned to `records.entries[0].caption` repeated six times, expected `rec0_caption` / `text escapes its container` in `recbox0`, non-zero exit, restore and rerun to PASS; evidence goes in the new `## Evidence` section (plan "Acceptance checks" and end of file). No renderer change.
- N1 — Implemented. Recon now gives `renderPlaywright(context, scene, font, width, height, fontFamily)` separately.
- Verification limits — Accepted. Render, red control, inspections and gates run in the clone after approval and are graded at final QA. For source parity, final QA will seed the operator's original diagram image read-only via `--artifact-file`.

Reviewer: please re-check S1/S2/N1 only; approve if resolved.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
