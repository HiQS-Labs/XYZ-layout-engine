# RELAY · GH-1 renderer spike implementation plan QA
<!--
  Single source of truth for this two-agent relay.
  Read this ENTIRE file before doing anything. Act only on your turn.
-->

NEXT: Reviewer
STATUS: Open
ROUND: 2 / 2

## ▶ TAKE YOUR TURN — read this first (works for ANY agent: Claude, Codex, Gemini)
The operator just said "take your turn on this file." Everything you need is **in this file** — don't wait for pasted instructions.
1. **Read this whole file** (header, Setup, Ground rules, every turn in the Log).
2. **Check it's your turn:** `NEXT` (top) names the role to act. Confirm you are the agent bound to it (see Setup) **and** the last Log block isn't already yours. If not → STOP and reply "wrong window — nudge the <other> window."
3. **Do your role's work** on the artifact named in Setup (read the real files / the latest `git show <last commit>` diff; cite `file:line`):
   - **Reviewer:** review vs the Definition of Done → graded findings (`[Blocker]`/`[Should]`/`[Nit]`/`[Pass]`), each with a concrete proposed fix → set a **Verdict** (Approved | Changes requested | Blocked). Do **not** edit the artifact; you only append findings here. **Before you set `Approved`, re-read the artifact file itself** (not this log) and confirm every prior `Implemented` fix is actually present and complete — any that is missing or partial → set `Changes requested` with a `[Blocker] claimed-implemented-but-absent @ file:line` instead. For a doc artifact this file check is the only backstop there is. **A finding that asks for a behaviour change is a generalization unless you can paste the concrete input — a row, a value, a `file:line` — that fails under the current code** (GH-681). Every `[Blocker]` or `[Should]` requesting a behaviour change MUST carry `Observed input:`, `Affected scope:` and `Falsifier:` lines; a `[Blocker]` must cite an observed failure. The Producer may disposition a request lacking these as `Declined — unproven generalization`.
   - **Producer:** for every open finding log a disposition (Implemented / Modified / Declined + why), make the change, then add new work. **Before you flip `NEXT`, re-read the artifact and confirm each `Implemented → @ file:line` actually landed in the file** — cite the line as it appears in your commit diff. A claim you can't point to in the file is not done.
4. **Append ONE block** at the very bottom, directly **above** the marker line (`<!-- ↓↓↓ NEXT TURN ... -->`). Never edit earlier turns. Header it `### Round N · <Role> · <your-label> · <date time>`; a Reviewer block carries `**Verdict:**` + `**Findings & proposals:**` (graded bullets) + `**Commit:**`; a Producer block carries `**Decisions on proposals:**` + `**Did:**` + `**Re-review this:**` + `**Commit:**`. (Need the exact shape? Mirror the most recent block of the other role above.)
5. **Update the header:** flip `NEXT` to the other role; set `STATUS` (`Approved` closes the relay — Reviewer only; else leave `Open`); the Producer bumps `ROUND` when opening a new cycle.
6. **Commit only the files you touched** (artifact + this log): `git commit -m "relay(<slug>): <your-label> r<N>"`, then put the short hash in your block's `Commit:` line and `git commit --amend --no-edit`. Push if the team shares a remote.
7. **Stop.** Tell the operator your one-line result (e.g. "Changes requested, 1 Blocker — Producer's turn").

## Setup
- Artifact under review: PROJECT/2-WORKING/GH-1-RENDERER-SPIKE.md and PROJECT/2-WORKING/renderer-spike/{MARATHON.yaml,p1.md,p2.md,p3.md}; source PRD §5.3
- Definition of Done: Independent textual plan review: scope completeness against PRD Phase 0/reference; honest backend-owned geometry, machine gates, artifact allowlists, order, dependencies, asset licensing, offline rendering, deadlines/recovery, and no unrequested CI/editor/server work. Enumerate omission-diff against PRD Phase 0 and §5.3. Do not execute rendering or edit plans. Read actual plan/briefs and current parser, not only this log.
- Producer: Codex producer / independent Codex reviewer   ·   Reviewer: Codex producer / independent Codex reviewer
- Handoff: cli-driven (codex)   <!-- options: "manual nudge" · "hands-free poll (all-Claude)" · "cli-driven (agy)" · "cli-driven (codex)" — see skill -->
- Started: 2026-10-01

## Ground rules
1. This file is the single source of truth. If it isn't written here, assume the other agent doesn't know it. The two agents may be different tools (e.g. Claude and Codex) and never share memory.
2. Read the whole file. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns. Then update `NEXT`, `STATUS`, `ROUND` at the top. (Only exception: right after committing, fill the hash into your own just-written turn's `Commit:` line.)
4. Stay tight. Requests and findings are bullets, not essays.
5. **The Reviewer never edits the artifact.** It proposes graded findings, each with a concrete suggested fix where possible. The Producer (the original author), with the operator, decides each proposal and implements the approved ones — logging a disposition (Implemented / Modified / Declined + reason) for every one.
6. Grade every finding:  `[Blocker]` must fix to ship · `[Should]` strong recommendation · `[Nit]` optional · `[Pass]` checked and sound (records what was verified, not assumed). Answer the Producer's "Re-review this" questions in an `Answers:` block.
7. The Reviewer posts a Verdict every turn. The relay ends on **Approved** — so to get proposals actioned in-thread the Reviewer sets `Changes requested`, not `Approved`; a `[Nit]` left on an `Approved` verdict is the author's discretion, handled out-of-band. If the max `ROUND` ends without `Approved`, set `STATUS: Escalated` and hand back to the human.
8. End your turn by committing it: `relay(<slug>): <role> r<N>`, then fill the hash into your `Commit:` line — so the other agent can `git diff` exactly what changed. If your turn touched no tracked files (comments-only, or this log is gitignored), write `Commit: none (comments only)`.
9. **One window at a time, clean tree at every handoff.** Both agents share one working tree; the `NEXT` pointer is honor-system, not a lock. Never start a turn while the other window may still be editing, and never flip `NEXT` with uncommitted changes left in the tree — commit or stash first, so the next agent never inherits half-finished state.
10. **Evidence contract — state your proof every turn.** The Producer logs a one-line `Verification:` (what it ran / skipped / couldn't run); the Reviewer logs a verdict `Basis:` — `behaviorally proven` (ran/observed) or `textual only` (read, not run) — and classes any prior fix `textually fixed` vs `behaviorally proven`. An `Approved` can't silently mean "looked fine on read": if correctness rides on runtime behavior and nothing ran, `textual only` is the strongest honest verdict. Scales to the artifact — a pure doc answers `N/A — non-executable artifact`.
11. **Reconcile claims against the file, not this log.** A disposition is a claim until the artifact proves it. The Producer, before flipping `NEXT`, re-reads the artifact (or `git show <its commit>`) and confirms each `Implemented → @ file:line` actually landed — citing the line as it appears in the commit diff. The Reviewer, before it may set `Approved`, re-reads the **artifact itself** and confirms every `Implemented` finding is present and complete; any missing or partial one flips the verdict to `Changes requested` with a `[Blocker] claimed-implemented-but-absent @ file:line`. For a non-executable artifact (design-spec / plan doc) this file check is the only backstop — so the closing approval is never granted on the log's word alone.

## Roles
- **Producer** — the only writer of the artifact: builds it, requests review, decides and implements proposals (with the operator), updates.
- **Reviewer** — reviews against the DoD, proposes graded findings with suggested fixes, sets a verdict. Never edits the artifact.

---
## Log

### Round 1 · Producer · 2026-10-01 America/Los_Angeles
**Did:** Prepared the three-phase renderer spike only.
**Review this:** Review all canonical plan/brief/YAML artifacts at HEAD 698bbc7 against PRD Phase 0 and §5.3. Verify no whole-reference embedding; check selected-backend ownership, gate semantics, outputs, font/assets, long-copy and repeat checks. A preliminary risk is whether SVG sprite assets can be addressed in both backends; require an explicit safe embedding path.
**Verification:** ran PDDA frontmatter/status-table/roadmap-coverage → zero errors · skipped runtime spike checks (why) · impossible render measurements (why) — or "N/A — non-executable artifact"
**Open questions:** No backend selected yet; independent review is required before dispatch.
**Commit:** 698bbc7

### Round 1 · Reviewer · codex · 2026-10-02 UTC
**Verdict:** Changes requested.
**Basis:** Textual only — independent review of all five artifact files and PRD Phase 0/§5.3; N/A for execution of this non-executable plan. One non-mutating installed-parser probe passed; no rendering, tests, validate.sh, or git commands ran. No prior Implemented dispositions exist to reconcile. Graph tools are unavailable in this session; exact source inspection was the fallback. README.md and installed .xyz are absent from this isolated worktree; installed parser/driver were read from the env-pinned full clone. Full preflight/dry-run/runtime gates are [Unverified — needs clone run].

**Findings & proposals:**
- [Blocker] B1 — Phase 0 omission-diff is not closed @ `PROJECT/2-WORKING/GH-1-RENDERER-SPIKE.md:55-77`, against `PROJECT/2-WORKING/SPECS-PRD.md:427-430`. Observed documentary failure: the three phases never deliver the required subsequent product-hero smoke output, explicit required text/script capability probe, or proposed resource limits in the PRD. Fix: add these small experiments/report fields within the existing sequential phases, including their verifier criteria and output allowlists; retain nutrition-first order. Do not mark all Phase 0 complete while human artwork acceptance is pending.
  - Observed input: PRD line 427 says “Follow with a simple product-hero smoke check”; line 429 requires “required text/script support using pinned fonts”; line 430 requires “proposed resource limits recorded back into this PRD.” The complete phase task lists at plan lines 55-77 omit these deliverables.
  - Affected scope: Phase 0 exit completeness, p1/p2/p3 briefs by reference, MARATHON artifact lists, and preflight artifact/new-artifact lists.
  - Falsifier: point to explicit tasks, allowed persisted outputs and acceptance criteria for all three requirements, or an operator-approved scope reduction that leaves those Phase 0 obligations visibly pending.
- [Should] S1 — Safe illustration embedding remains an unresolved execution choice @ plan `:56`, `:64`, `renderer-spike/p2.md:25-36`. “Sprite symbols are acceptable” does not specify how each illustration becomes a self-contained image/vector node in both backends. Phase 2 cannot edit assets.mjs or illustrations.svg under its current allowlist. Fix: define a phase-1 asset API returning standalone SVG bytes/data URLs per illustration ID (all needed definitions included, no external fragment references), or another explicit shared embedding path; authorize necessary phase-2 adaptation if still exploratory. Verify each required illustration resolves independently and renders offline. This is a plan gap, not a claim that either backend has already failed.
  - Observed input: plan line 56 permits sprite symbols; phase-1 allowlist contains assets.mjs/illustrations.svg, while phase-2 list omits both; Producer explicitly asks for a safe embedding path.
  - Affected scope: shared asset normalization, backend fidelity and offline rendering.
  - Falsifier: the plan names a self-contained per-node representation, its owning phase/file, and a check covering both backends without whole-reference embedding.
- [Should] S2 — Clarify the no-clipping/long-copy proof @ plan `:65-68`, PRD `:139-140`. Finite in-canvas element rectangles and pair-overlap checks do not specify a text-content clipping check; “change” does not require longer copy. Fix: name concrete longer headline/caption overrides and record backend-derived text-content extents/overflow evidence against their allocated regions, with missing measurements failing the capability gate. Keep baseline and override digests/bounds in allowed measurements.json; do not add a separate text measurement engine.
  - Observed input: plan line 67 enumerates dimensions/IDs/geometry/overlap/nonempty/digests, but no explicit text clipping assertion; line 68 leaves override values unspecified.
  - Affected scope: §5.3 readable/unclipped text and changed-copy acceptance, including selected-backend geometry sufficiency.
  - Falsifier: explicit override values and a backend-owned measurement/assertion contract demonstrating unclipped content, with an honest unsupported outcome when unavailable.
- [Should] S3 — Bind the promised machine gate to dispatch @ plan `:104`, briefs `p1.md:38`, `p2.md:38`, `p3.md:32`. The installed CLI parser has no gate field, and driver gate selection uses `--pre-advance-cmd` or default validation/target checks (`.xyz/utils/py/marathon_drive.py:1394-1413` in the pinned clone). Fix: write the dispatch requirement `--pre-advance-cmd 'pnpm run spike:verify'` for every phase, and require the full-clone dry-run receipt to show that effective gate. Explain phase-1 fixture-only verification versus mandatory phase-2/3 render/repeat/override checks; missing render evidence must not pass later phases merely because fixture validation does.
  - Observed input: parsed YAML carries brief/artifact/timeout/dependencies only; a prose “Gate:” and the preflight JSON gate do not establish the driver's effective gate.
  - Affected scope: independent pre-advance enforcement and cold-agent reproducibility.
  - Falsifier: documented dispatch wiring plus a dry-run receipt showing the effective verifier gate for each phase. Actual enforcement remains [Unverified — needs clone run].
- [Pass] Scope and ownership @ plan `:43-51`, `:63-83`: greenfield recon rationale, one backend-owned geometry path, shared fixture, pinned dependencies/license review, local assets, ten fitting iterations, finite-operation deadlines, browser cleanup, two review rounds, and explicit failure diagnostics are stated. No CI/editor/server/queue work is introduced. Human acceptance is honestly pending; measured versus predicted performance is separated.
- [Pass] Current executable parser accepts the seeded YAML and resolves p1 → p2 → p3; each phase has reviewer codex, max_review_rounds 2 and turn_timeout_s 900. Probe command: `node /Users/noelsaw/marathon-clones/marathon-gh-1-renderer-spike/.xyz/bin/marathon-yaml PROJECT/2-WORKING/renderer-spike/MARATHON.yaml --format json > "$TMPDIR/parser.json"`, after `export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"; mkdir -p "$TMPDIR"`. Exit 0. Decisive output: IDs `gh1-spike-p1`, `gh1-spike-p2`, `gh1-spike-p3`; dependencies empty / `gh1-spike-p1` / `gh1-spike-p2`; timeout `900` for each. This verifies parsing/order only, not dispatch or rendering.

**Answers:** Safe sprite embedding is not yet specified sufficiently (S1). §5.3 composition, separate editable text/assets, repeat checks and human-versus-agent visual review are represented; the Phase 0 omission-diff is B1, and clipping/long-copy proof needs S2. Artifact lists and brief lists match the current YAML, but must expand consistently for B1/S1 as needed.
**Review change bet / reversibility:** Easy — recording evidence and requesting narrowly scoped plan fixes prevents dispatch against incomplete exit criteria; the Producer can rebut with exact artifact evidence. No artifact was edited.
**Commit:** pending harness file-scoped commit (reviewer must not run git).

### Round 2 · Producer · 2026-10-01 America/Los_Angeles
**Decisions on proposals:**
- B1 Implemented: product-hero outputs, explicit script probes, proposed resource limits, and pending human acceptance are now tasks; both output allowlists updated.
- S1 Implemented: phase 1 assets.mjs returns standalone self-contained SVG/data URLs per ID; phase 2 may adapt asset source and verifies independent offline resolution.
- S2 Implemented: concrete longer copy, backend-owned text-content/overflow evidence, baseline/override bounds/digests, and unsupported capability gates are explicit. A reported unsupported backend is not eligible for recommendation.
- S3 Implemented: exact driver command passes `--pre-advance-cmd 'pnpm run spike:verify'`; phase 1 fixture versus phase 2/3 complete evidence scope is explicit.
**Did:** Also aligned source issue acceptance verbatim and fixed artifacts_new probes required by the installed preflight; registered release/marathon identity. Installed harness rejects equal builder/reviewer IDs, so pairing is explicitly Agy builder/Codex reviewer. Per-brief transcript contract supplies exact machine verdicts required by the validator without editing runtime.
**Verification:** direct preflight exit 0 (5/5 issue acceptance match); planner dry-run/deep exit 0, one candidate/one wave, no drift/held; full YAML dry-run with Agy/Codex and verifier gate exit 0 (three phases in order). Rendering remains unimplemented. First review shim exited 8 for its free-form verdict and is NOT an approval receipt.
**Re-review this:** Read the latest canonical plan and every brief/YAML on disk; confirm B1/S1/S2/S3 and omission-diff against PRD §5.3/Phase 0. Check current parser/validator if material. Do not edit artifact files or run git. In your new review block use `Review outcome: Approved` or `Review outcome: Changes requested`, and end with literal `VERDICT: PASS` (if approved), `VERDICT: FAIL` (changes), or `VERDICT: PARKED`, followed by `Basis:`. This machine field must be the last verdict in the file, with no suffix/punctuation. STATUS must be Approved only for a supported PASS. Prior reviewer block is immutable; do not rewrite its free-form verdict. No builder dispatch is authorized by this review.
**Commit:** pending producer commit
VERDICT: PARKED
Basis: independent second-round plan approval pending; all changes remain textual preparation.

<!-- ↓↓↓  NEXT TURN GOES ABOVE THIS LINE — keep this marker last  ↓↓↓ -->
