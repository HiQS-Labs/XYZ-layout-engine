# RELAY · GH-1 Phase 2 post-build QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-08.
-->

NEXT: Reviewer
STATUS: Open
ROUND: 1 / 4

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
6. **Commit only the relay file** (`relay(gh1-spike-p2-postbuild): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `tools/spike/render.mjs`, `tools/spike/scene.mjs`, `tools/spike/verify.mjs`, `tools/spike/assets.mjs`, `tools/spike/hero-fixture.json`, `tools/spike/fixture.json`, `tools/spike/assets/illustrations.svg`, `package.json`, `pnpm-lock.yaml`, and the evidence under `tools/spike/output/` (PNGs, satori.svg, measurements.json, runtime.json). Commit 3274e9c on this clone.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-08
- Definition of Done: every checkbox under "Phase 2 — Compare backend renders" in `PROJECT/2-WORKING/GH-1-RENDERER-SPIKE.md` (lines 74-84) is satisfied with on-disk evidence, the brief `PROJECT/2-WORKING/renderer-spike/p2.md` is met, and `pnpm run spike:verify` is a real gate (binds to artifact bytes, fails on tampering). Round 2 findings from the prior agy relay (`relay-system/2026-10-08/marathon-xyz-layout-engine-renderer-spike--gh1-spike-p2-232130.md`, blockers 1-6) must each be resolved or honestly recorded as a backend limitation.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## QA brief (read before reviewing)

Context: Phase 0 renderer spike for XYZ Layout Engine, umbrella GH-1. Two agy-built attempts failed containment; the orchestrator (Claude) built this Phase 2 directly. You are the independent post-build reviewer. Operational envelope: local developer spike scripts (plain .mjs, no build step), evidence collection for a backend decision. Commensurate complexity: no engine, server, queue, CI, test framework, or second layout engine is wanted; flag any such scaffolding as a finding, and do not request it.

Read in full: `AGENTS.md`, `GUIDING-PRINCIPLES.md`, `PROJECT/2-WORKING/GH-1-RENDERER-SPIKE.md` (Phase 2 section and Acceptance), `PROJECT/2-WORKING/renderer-spike/p2.md`, PRD §5.3 in `PROJECT/2-WORKING/SPECS-PRD.md`, every artifact file in Setup, both JSON evidence files, and look at the PNGs (satori/playwright baseline, override-*, hero-*, probe-*) plus `PROJECT/2-WORKING/layout-engine-reference.png`.

You may run narrow read-only probes (python/node one-liners) with output under `.relay-scratch/` or `$TMPDIR`; quote command, exit status, and decisive output. Do not run the renderer, the verifier, validate.sh, or pdda in this worktree; the orchestrator ran them in the full clone and recorded exits below. Grade a claim you cannot reproduce here as `[Unverified — needs clone run]` rather than `[Pass]`.

Orchestrator-recorded runs (full clone, Node v22.22.3, Apple M1 Max):
- `node tools/spike/render.mjs` → exit 0; stdout ends `render: satori: eligible`, `render: playwright: eligible`, `render: selection candidates: satori, playwright`.
- `pnpm run spike:verify` → exit 0, `VERDICT: PASS`.
- Red control 1: append one byte to `tools/spike/output/satori.png` → `VERDICT: FAIL`, `Basis: satori.png does not match the recorded digest` (restored).
- Red control 2: set `capabilities.playwright.heroFit=false` in measurements.json → `VERDICT: FAIL`, `Basis: playwright: capability heroFit does not match evidence` (restored).

Questions to answer, each with file:line or evidence-field citations:

1. Geometry evidence: `render.mjs` collects Satori bounds via `onNodeDetected` and Chromium bounds via `getBoundingClientRect` + `Range` + scroll/client metrics. Is the recorded geometry in `measurements.json` authoritative backend output, and is the overflow/fitting judgment (`textEvidence`, `fitCase`) derived only from it? Is the "glyph ink beyond the box is not separately observable" caveat for Satori stated honestly, and is any claim made that exceeds what the hook reports?
2. Bounded fitting: is the loop capped at 10 re-renders, font-size only, with explicit `unresolved` reporting? Does the override case apply the exact prescribed headline and caption to the intended fixture fields (`sections.header.headline`, `sections.items[0].caption`), preserve the baseline artifacts, and avoid mutating `fixture.json`?
3. Hero smoke: is `hero-fixture.json` a structured product-hero input (not a cropped nutrition scene)? Are both hero PNGs exactly 1200x630 with no document overflow, per `cases.hero.*.pngSize` and `documentOverflow`?
4. Script probes: do `probes.*` record observations with evidence (Satori `loadAdditionalAsset` uncovered segments; Chromium `measureText` pinned vs fallback widths, `glyphsDrawn`), rather than constants? Is the Chromium classification (coverage from the shared font file, rendering via per-glyph system fallback, identity not exposed) a fair statement of what the page can and cannot observe? Is the English probe correctly mandatory?
5. Runtime record: does `runtime.json` give exact versions (satori, resvg-js wrapper and darwin-arm64 binding, playwright, Chromium), licenses with provenance, units, stage boundaries for cold and warm, ten warm samples after one warmup, and clearly-bounded memory caveats (Node heap/rss only; Chromium RSS unobservable in this Playwright build)? Any licence claim that is inferred rather than read?
6. Verifier: does `verify.mjs` bind digests to PNG bytes, check dimensions, geometry finiteness/in-bounds, containment-aware overlap, fitting-consistency, probe evidence shape, runtime completeness, and recompute the capability table? Is anything in `measurements.json` that the plan calls mandatory still unread by the gate? Could a backend fail a mandatory check and still be reported eligible?
7. Determinism and SVG: are repeat digests computed from an independent re-render, and is browser SVG export declared unsupported rather than faked?
8. Deadline/cleanup: is there a finite overall render deadline and browser cleanup on failure (`try/finally`)? Is the `globalThis.__dirname` shim documented as a Satori 0.36.0 ESM loader limitation?
9. Scope: any speculative abstraction, dead code, or drift from "plain .mjs spike, backend owns layout"? Any leftover from the agy attempts that should go?
10. Visual: looking at the PNGs against the reference, are all sections present and readable with no clipped text? State your agent visual assessment separately from human artwork acceptance, which stays pending.

Output: graded findings with citations, then `VERDICT: PASS|FAIL|PARKED` and a `Basis:` line, `swept file: yes|no`, and set STATUS to Approved only if nothing blocking remains. Hand off explicitly to claude-a (Producer) if changes are requested.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
