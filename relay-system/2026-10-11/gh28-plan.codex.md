# RELAY · GH28 MangaJDM portrait promo plan QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-11.
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
6. **Commit only the relay file** (`relay(gh28-plan): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **.relay-artifacts/GH-28-MANGAJDM-PROMOS.md** — the read-only path that
  `relay-drive.sh --artifact-file <absolute-plan-path>` seeds into the isolated worktree (read it there; do NOT edit it).
- Reviewer: codex   ·   Producer: author
- Started: 2026-10-11
- Definition of Done: a complete, grounded, surgical plan satisfying issue28; no blocking omissions, a sound existing recipe/catalog writer path, falsifiable content/geometry/history checks and neutral per-axis ratings.

### Specific review packet

Read `.relay-artifacts/GH-28-MANGAJDM-PROMOS.md` and current `tools/request.mjs`, `tools/render.mjs`, `tools/catalog.mjs`, `tools/recipes/solar-system.mjs`, `tools/spike/assets.mjs`, existing display derivative helper, README/catalog contract and test-budget.json. Grade the whole plan against the local developer CLI envelope and commensurate complexity; no enterprise multi-tenant layers, paid generators, generic framework, grid parser or new tests/dependencies are requested.

1. Does the minimal new trusted recipe preserve current normalization, saveFixture validation, native fitting/backend/export ownership and old recipe behavior? Is any concrete integration owner omitted?
2. Can the proposed three fixtures/display derivatives and editorial yield three1080×1920 portrait PNGs without losing the complete multi-car scene or shirt print? Are HTML relocation, font/image loading, stable artifact digest and edited-copy checks sufficient?
3. Does catalog add/publish/design add remain the only writer, with pinned use-case, real primary PNG/fixture hashes, prior history/log prefix preservation and truthful phaseB-deferred friction fields?
4. Are the rating65/20/50/65 and rationale grounded in the actual user ask and limited scope? Appeal neutral, no incident/recurrence or synthetic urgency claim?
5. Are source library preservation, primary checkout isolation, bounded review/fitting loops, rollback and publication/handoff acceptance stated? Challenge overbuilding and surface concrete gaps only.

Review writes only this relay file. No implementation, paid operations or test-suite runs. Narrow read-only source probes allowed. Give cited Pass/findings, literal swept file declaration, VERDICT and Basis; Approved only when the entire plan passes. Source library originals are outside this isolated review; their provenance and selected-image observations are in the plan, so do not claim you viewed them.

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
Basis: The complete plan meets the supplied review packet: additive trusted recipe, existing render/save/catalog owners, three bounded editorial outputs, falsifiable acceptance and preserved history. No blocking omissions or additional pre-existing defects found in the swept plan. Approval is for build readiness, not implementation or source-image verification. Reversibility: Easy; the bet is that the reported source observations hold, with final visual/runtime gates detecting a bad selection before publication.
swept file: yes

- [Pass] Integration owners are explicit in `.relay-artifacts/GH-28-MANGAJDM-PROMOS.md:45`–49 and :79: normalize admission/canvas, saveFixture admission, processRequest import and catalog declaredFiles. Source readback supports the approach: `tools/request.mjs:59`–75 and :105–135; `tools/render.mjs:183`–199. Fitting, fonts, backend and publication stay shared (`tools/render.mjs:209`–295, :329–368, :474–515); no new registry is needed.
- [Pass] The recipe contract is grounded: `tools/recipes/solar-system.mjs:8`–60, :67–105 and :116; pinned asset loading reuses bounded read/namespace/digest checks and `tools/spike/assets.mjs:10`–38. The derivative helper preserves aspect ratio and alpha via the existing renderer (`examples/2026-10-09-cell-division/make-web-asset.mjs:15`–23). Plan :78–79 assigns provenance, fixed selectors and asset admission; no new encoder/dependency is warranted.
- [Pass] Content and geometry acceptance is concrete: plan :55 and :58–63 specify portrait size, copy guide, full multi-car containment, preserved shirt print, mockup disclosure and conservative claims; :80–81 requires three primary PNGs, manifest-byte equality, text containment, offline font/image loading, relocated HTML, deterministic rerenders and a saved-copy edit. These are measurable future gates, not claims that the images have already passed.
- [Pass] Writer/history contract is sufficient: plan :67 and :82 requires stable publication, version/ID changes after publication, per-insert reconciliation, real fixture/primary PNG hashes, exact use-case pins and unchanged prior rows/log prefixes. `tools/catalog.mjs:79`–81 requires exactly one schema in the declared set; :289–311 hashes actual design bytes and leaves Phase B fields null; :319–340 preserves immutable publication and uses the existing two-file writer. README's “Designs are insert-only records” and two-write recovery limitation agree. Keep these existing owners.
- [Pass] Ratings and complexity are proportional as written: plan :38 states “severity20: missing example, no observed runtime failure; appeal50: neutral operator default” and gives independent priority/effort rationale without synthetic urgency. Plan :65 caps the recipe at about150lines and excludes new tests/dependencies/grid/service machinery; `test-budget.json` budget is 1 file/4 tests/60 seconds/0 workflows.
- [Pass] Isolation, failure detection and handoff are explicit: plan :37/:78 preserves originals, :67 supplies rollback/tripwires and debug-mantra, :39/:84 bounds independent review to three rounds, and :83–90 requires recorded actual checks and a ready PR while leaving main untouched. Existing fitting bounds are `tools/render.mjs:209`–211. Retain the planned final verification rather than adding a suite for this review.
- [Nit] Recon citations/naming drift at plan :45–46: the current export owner is `publishArtifacts` (:474), not `writeExport`; trusted recipe admission is `tools/request.mjs:60`, canvas selection/check is :61/:68, save admission/validation is :106–109, and `processRequest` begins at `tools/render.mjs:175`. Fix those references when updating the plan; the named responsibilities and proposed edits remain sound.
- [Unverified — needs clone run] Plan :25/:51 reports baseline canary/shim results; those were not reproduced here. Final tests, image previews, digest/relocation/edited-copy controls and PDDA are pending execution gates (:81–90). No test suite, fixture executable, renderer or validator was run in this turn.
- [Unverified — external evidence] Source-library provenance/selected-image observations (:37/:57–63), RELEASES persistence and live issue body were not independently read back. Read-only query `gh issue view 28 --repo HiQS-Labs/XYZ-layout-engine --json title,body` exited 1: “error connecting to api.github.com”; web fetch of the same issue returned “Cache miss”. Review uses the supplied Definition of Done and specific packet, not an independently fetched issue. Graph inventory returned all82 projects with no matching checkout; coverage query for the six named code paths returned “project not found or not indexed”; exact-source fallback was used without indexing/mutation.

Relay closed (Approved), no further review turn needed. Producer resumes implementation and records the final evidence required by the plan.


### Attestation · relay-drive — 2026-10-11T16:31:58Z
task: GH28-PLAN-20261011
reviewer: codex
status: Approved
reviewed-head: 07321a6e21701e27a937c2ec5e05a02b73d7d7b4
added-range: 7438+4966
added-sha256: a9e79f0aeaa44b5d1d4d2d07f1c6509381b32c5a1cab0d37aa3e7df208b30c0a
<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
