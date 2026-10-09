# RELAY · GH-5 Phase 1 surgical repair independent QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-09.
-->

NEXT: Reviewer
STATUS: Open
ROUND: 1 / 2

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
6. **Commit only the relay file** (`relay(gh-5-phase-1-surgical-repair-independent-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **MVP-REPORT.md** (embedded below — read it here).
- Reviewer: codex   ·   Producer: codex-producer
- Started: 2026-10-09

### Artifact — MVP-REPORT.md
```
# MVP Report

## Phase 1 recovery — 2026-10-09

The initial native Phase 1 lane halted at `cap-progressing-extended`, exit 4; its test gate never ran. Its escalation remains unchanged. The operator authorized workhorse repair and independent QA before a continuation. This report records orchestrator verification while no builder is active; it does not forge `phase.approved`.

Delivered local subset: nutrition recipe 1.0.0 on its 1000×1000 canvas, scale 1, Satori by default; PNG/SVG/self-contained HTML artifacts and explicit Playwright PNG/HTML. Other dimensions/scale and remote/fallback fields fail with field paths. API: `processRequest(request, {root})` returns normalized request, validation, pinned versions, input provenance, SHA-256 and requested artifact bytes/MIME/dimensions. CLI: `node tools/render.mjs tools/spike/fixture.json --out tools/output/local [--format svg|html] [--backend playwright]`. Inputs and output are confined to the authorized local root; committed spike output is read-only. JSON is limited to 256 KiB; images to direct 8-bit RGBA non-interlaced PNG or the trusted bundled SVG subset. PNG chunk bounds/order/CRC, scanline inflation/filter bytes and positive dimensions are validated before native rendering. Per-image limit: 5 MiB and 16,777,216 pixels; scene aggregate: 35 MiB encoded and 16,777,216 pixels; render area 16,777,216 pixels; total published bytes 64 MiB. The local filesystem is trusted against concurrent hostile mutation; this is not remote tenant isolation.

One publisher owns immutable `runs/<UUID>` and atomically commits `manifest.json` after all staged files are admitted/hashed. Shared operation validates text presence/region/canvas, fonts and raster size first; spike validates mandatory capability outcomes and case digests/dimensions first. No postcommit compatibility copies. `selectedRun` resolves the pointer once for readers; legacy manifest-free goldens remain readable. Browser/context/page owners close in finally; Chromium loads only for explicit browser requests or the explicit legacy comparison.

## Receipts

Host: Node v22.22.3, pnpm 12.4.1, darwin-arm64. Pinned installed renderers: Satori 0.36.0, resvg 2.6.2, Playwright 1.64.0. No dependency, test-block, test-budget or CI-workflow addition.

- Original baseline `pnpm test`: exit 0, 4/4 in 9.8s, despite the witnessed admission and markup failures. Receipt: `relay-system/2026-10-09/gh5-p1-repair/baseline.log`.
- Red controls: oversized 8192² canvas with scale 0.1 admitted; literal injected script serialized. Receipt: `relay-system/2026-10-09/gh5-p1-repair/red-controls.log`.
- Revised C1 exposed macOS `/var` versus `/private/var` guard/root aliases. Canonicalization fixed both. Root red receipt: `relay-system/2026-10-09/gh5-p1-repair/macos-root-red.log`; the earlier empty-CLI failure is recorded in repair plan/tool transcript.
- Current `pnpm test`: exit 0, four canaries in 10.8s, 216 geometry boxes within 0.5 px and 12 artifacts byte-identical. Receipt: `relay-system/2026-10-09/gh5-p1-repair/verification.log`. C1 now checks actual imports, local CLI in a space path with dependency linkage, format export, strict input/asset/HTML controls, owning browser cleanup via native launch substitution, and two successful same-day publications followed by a late failure. It re-reads selection and compares target, manifest bytes and all referenced digests, and checks orphan cleanup.
- Preservation: `git diff origin/main -- tools/spike/output examples/2026-10-08-solar-system/assets test-budget.json` is empty. Historical content, test budget and original checkout preserved. Easy rollback: revert task-branch repair; prior immutable runs/selectors and goldens are retained.
- Consult: both Codex/Agy advisory seats answered; disagreements adjudicated in `relay-system/2026-10-09/gh5-p1-repair/plan.md`. Consult is not runtime acceptance.

Independent committed-code Codex QA is pending. Phases 2–5, adaptive fitting/Solar System, generation resume, measured optimization and final integration remain pending. Human artwork acceptance and live provider measurements remain pending; no paid calls, push, PR, merge or issue closure is authorized by these receipts.
```
- Definition of Done: Independently QA the full current Phase 1 code and diff against origin/main and ff6ea60, including tools/request.mjs, tools/render.mjs, tools/recipes/nutrition.mjs, tools/spike/assets.mjs, scene.mjs, render.mjs, verify.mjs and existing C1-C4. Read the final seven findings in marathon-system/gh5-mvp-foundation--gh5-p1/RELAY.md and explicitly disposition each. Review the committed test/PDDA receipts in relay-system/2026-10-09/gh5-p1-repair/ and the honest fixed nutrition/scale subset. Confirm one atomic manifest publication boundary, last-good/history preservation, bounded strict asset and JSON admission, HTML safety, browser cleanup and usable default-lazy CLI. Full files are short; review actual source and use bounded scratch component probes for material uncertainties. Do not run the full pre-advance suite or render outside scratch, edit artifacts, push, browse or redesign the later phases. Existing green suite is evidence but not a substitute for independent review. If a blocker/should exists, give observed input, affected scope and falsifier; accept only if all required Phase 1 acceptance is met. Reviewer writes this relay only, literal VERDICT/Basis/swept file and native handoff, no fabricated approval. Graph: this clone has no indexed project; use exact source fallback. Do not start or reset the halted lane.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
