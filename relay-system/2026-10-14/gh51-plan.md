# RELAY · GH-51 DESIGN.md profile plan QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-14.
-->

NEXT: Producer
STATUS: Approved
ROUND: 1 / 3

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
6. **Commit only the relay file** (`relay(gh51-plan): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **.relay-artifacts/GH-51-DESIGN-MD-PROFILE.md** — the read-only path that
  `relay-drive.sh --artifact-file ~/Documents/GH Repos/XYZ-layout-engine-gh51-design-md-profile-2026-10-14/PROJECT/2-WORKING/GH-51-DESIGN-MD-PROFILE.md` seeds into the isolated worktree (read it there; do NOT edit it).
- Reviewer: codex   ·   Producer: codex-producer
- Started: 2026-10-14
- Definition of Done: Review the full GH-51 plan, docs/design-md/REVIEW.md, PROJECT/2-WORKING/recon-design-md-profile.md, the operator request captured in the plan and the referenced authoring/render/catalog source. Decide whether the bounded document adoption achieves low-to-medium authoring compatibility without unnecessary core changes; verify the rating rationale and falsifiable acceptance/red controls. Grade against documentation scope and commensurate complexity, not speculative runtime ingestion or enterprise policies. Review source in this isolated target checkout. Only the relay file may be edited. Approve if no concrete material blocker remains. Three review rounds maximum.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1

VERDICT: PASS
Basis: Approve this bounded authoring-document plan. It meets the captured request without a second styling owner, runtime ingestion, dependency or published-content migration. Approval covers the plan; implementation evidence remains due at final QA.
swept file: yes

- [Pass] Scope and complexity fit the request: `.relay-artifacts/GH-51-DESIGN-MD-PROFILE.md:24` captures basic compatibility conditional on preserving the core; lines 40–60 choose a guide/sample, disclose translation limits, protect published bytes and provide an Easy rollback. Lines 93–96 correctly distinguish byte preservation from fresh render verification. No correction required.
- [Pass] Actual boundary supports the bet: `tools/request.mjs:59` reads bounded bytes and line 61 parses JSON; `tools/render.mjs:187` normalizes that request, lines 192–207 select trusted recipes and recipe-owned fonts, and line 238 calls `buildScene`. `tools/recipes/nutrition.mjs:134` and `tools/recipes/recursive-process.mjs:70` take palettes from fixtures. `tools/catalog.mjs:131` and line 143 declare the existing briefs as content; line 213 detects modified declared bytes. Preserve these owners as planned.
- [Pass] Baseline pins are sound in this checkout. Narrow read-only probes, with `PYTHONDONTWRITEBYTECODE=1` and `TMPDIR="$PWD/.relay-scratch/tmp"`: `node tools/catalog.mjs verify --json` exited **0**, decisive output `{"valid":true,"errors":[]}`; `node tools/catalog.mjs export --check` exited **0**, output `{"canonical":true}`. Both emitted the documented experimental SQLite warning. Logs are scratch-only. These observations support the preservation baseline, not future implementation success.
- [Pass] The research distinguishes the format from Stitch extraction guidance and lint limitations (`docs/design-md/REVIEW.md:40`, lines 48–56, 73–84). Read the pinned [Google specification](https://github.com/google-labs-code/design.md/blob/9bf8eae67128b6cc55ad9bf86665767deb4c11cd/docs/spec.md), [CLI README](https://github.com/google-labs-code/design.md/blob/9bf8eae67128b6cc55ad9bf86665767deb4c11cd/README.md), package, parser, section-order rule and Stitch skill: section order/optional omissions, reference syntax and unknown-content treatment support the proposed profile. The order rule compares adjacent indices with `>` and therefore does not reject equal headings; the separate duplicate check is warranted. No upstream-wide conformance or rendered accessibility claim is made.
- [Pass] Acceptance is falsifiable and proportional: `.relay-artifacts/GH-51-DESIGN-MD-PROFILE.md:81` requires zero lint errors, warning disclosure, nonempty section bodies, uniqueness/order and local links; lines 83–88 name broken-reference and duplicate-heading red controls, durable evidence, catalog/dump consistency and comparison against governance warnings. No permanent validator, new CI suite or render workload is needed for this docs-only change. Keep exact inputs, commands, exits and decisive output in the planned results receipt.
- [Pass] Rating rationale is reasonable for this scope (`.relay-artifacts/GH-51-DESIGN-MD-PROFILE.md:62`): the local `releases.sql` GH-51 row contains `60/15/50/85`, corresponding rating columns and NULL override; arithmetic is **210**. Low severity and high effort cheapness match documentation-only adoption, while the plan expressly avoids an inferred recurrence multiplier. This is local ledger evidence, not an independent live issue-history audit.
- [Unverified — needs clone run] The authored guide/sample, upstream CLI red/green results and PDDA warning comparison are intentionally pending (`.relay-artifacts/GH-51-DESIGN-MD-PROFILE.md:100`). I ran no validate script, test suite, pytest or executable fixture. Final QA must examine those completed receipts; this is not a reason to block plan approval. Live GitHub refresh also remained unavailable: `gh issue view 51 --repo HiQS-Labs/XYZ-layout-engine --json number,state,title,body` exited **1** with `error connecting to api.github.com`; no live issue/PR-state verification is claimed.

Full-file sweep covered the complete seeded plan, REVIEW, recon, ROUTER, AGENTS, SYSTEM-INSTRUCTIONS and README, both published briefs, request/render/catalog source and the relevant recipe authority. No additional material pre-existing defect was found in the documents this plan will touch. Graph project `XYZ-layout-engine` generation `2026-10-13T02:52:30Z` refers to the primary checkout; coverage excludes tools/examples and lacks the new docs. Exact source reads in this isolated checkout were authoritative; the empty graph search was not treated as absence evidence.

Relay closed (Approved), no further review turn needed; codex-producer may implement the approved plan and obtain final QA.


### Attestation · relay-drive — 2026-10-14T17:04:15Z
task: RELAY-gh51-plan-20261014
reviewer: codex
status: Approved
reviewed-head: 30f2bb0ecb6b83fe689b64762246c9bf646f0545
added-range: 6075+4809
added-sha256: b3fa5b3e41f3c3cd5ae48ea29eb80f4ea7110bb7d8db9e9fd284a383392eca03
<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
