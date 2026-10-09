# RELAY · GH-1 spike artwork revision QA
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
6. **Commit only the relay file** (`relay(gh1-spike-artwork-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: commit 33d93a1: `tools/spike/scene.mjs`, `tools/spike/fixture.json`, `tools/spike/assets.mjs`, `tools/spike/assets/illustrations.svg`, `tools/spike/assets/SOURCES.md`, `tools/spike/assets/generated/prompts.json`, `tools/spike/downscale-assets.mjs`, `tools/spike/render.mjs`, `tools/spike/verify.mjs`, `tools/spike/output/measurements.json`, `tools/spike/output/runtime.json`, `tools/spike/REPORT.md`, `PROJECT/2-WORKING/SPECS-PRD.md`, `CHANGELOG.md`, `.gitignore`. Also read (binary/per-item): `tools/spike/assets/font-bold.ttf`, tools/spike/assets/generated/ID.result.json and tools/spike/assets/generated/web/ID.png for the seven ids in prompts.json, and the output PNGs.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-08
- Definition of Done: the revised fixture/scene still satisfies the approved Phase 2 contract (backend-owned geometry, bounded fitting, override, hero, probes, digests) with `pnpm run spike:verify` as a real gate; the generated assets have honest provenance (model, recipe, reference-as-style-input, digests, alpha) and the reference image is never rendered as a layer; every number in the updated report/PRD/changelog is traceable to the delivered JSON or a recorded receipt; the two new backend findings are stated accurately; nothing pending is marked complete.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## QA brief (read before reviewing)

Context: GH-1 Phase 0 spike, artwork revision after Phase 2/3 were approved (`relay-system/2026-10-08/gh1-spike-p2-postbuild.md`, `gh1-spike-p3-postbuild.md`). The operator asked to match `PROJECT/2-WORKING/layout-engine-reference.png`. Operational envelope: local spike scripts and documents; commensurate complexity, no engine/CI/framework.

Read: the commit diff, `PROJECT/2-WORKING/layout-engine-reference.png`, `tools/spike/output/{satori,playwright,override-satori,override-playwright}.png`, `tools/spike/assets/generated/web/*.png`, both evidence JSON files, `tools/spike/assets/SOURCES.md`, and the changed doc sections.

You may run narrow read-only probes under `.relay-scratch/` or `$TMPDIR`; do not run the renderer/verifier/PDDA here. Orchestrator receipts (full clone, Node v22.22.3, M1 Max): `node tools/spike/render.mjs` exit 0 (`satori: eligible`, `playwright: eligible`); `pnpm run spike:verify` exit 0 `VERDICT: PASS`; red control — append 1 byte to `assets/generated/web/water_bottle.png` → `VERDICT: FAIL`, `Basis: generated/web/water_bottle.png digest not recorded in SOURCES.md` (restored, PASS); `utils/pdda/pdda.sh run` exit 0, 0 errors, same 3 pre-existing warnings. Generation receipts: seven `chain.mjs image` calls, all exit 0, endpoint edit, alpha verified (ratios in SOURCES.md).

Questions:
1. Does the revised scene keep the Phase 2 evidence contract intact (text ids, containment map, overlap exclusions, fitting, override fields `sections.header.headline` / `sections.items[0].caption`)? Any id or containment entry that would let a real overlap escape the check?
2. Is the `height: '100%'` leaf sizing sound in both backends per `cases.*.*.bounds.hero_img` and `hero`, and does the override reflow without overflow?
3. Provenance: do SOURCES.md, prompts.json and each result.json agree (model, recipe ref, publication label, endpoint, original sha256, alpha)? Do the committed web PNG digests match the files? Is it clear the reference was a style input only and never rendered? Is the "usage per OpenAI terms, operator to confirm" note adequate?
4. The verifier additions (bold font digest; per-asset digest in SOURCES.md, alpha in result.json, RGBA colour type): correct and proportionate? Any way a swapped or opaque asset passes?
5. Report/PRD/changelog: are the two backend findings (line-height glyph overflow that font-size fitting cannot cure — 50 → 29.5 px; image stretch sizing differs — 518 vs 480) described accurately and only as strongly as the evidence supports? Note: those intermediate runs were superseded; their figures are from orchestrator observation during development, not from the delivered JSON — judge whether that is labelled clearly enough. Are all current timings/memory/size figures traceable to the delivered JSON or file sizes?
6. Agent visual assessment vs the reference: is it fair, and are remaining differences listed? Human acceptance must remain pending.
7. Scope: anything speculative, dead, or left over (e.g. the hand-authored SVG items now shadowed by generated PNGs, `bottle` vs `water_bottle`)?

Output: graded findings with citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, `swept file: yes|no`; STATUS Approved only if nothing blocking remains. Hand off to claude-a if changes are requested.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
