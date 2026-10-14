# RELAY · GH50 WebP artwork plan QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-14.
-->

NEXT: Reviewer
STATUS: Open
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
6. **Commit only the relay file** (`relay(gh50-webp-artwork-plan-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **.relay-artifacts/GH-50-WEBP-ARTWORK.md** — the read-only path that
  `relay-drive.sh --artifact-file PROJECT/2-WORKING/GH-50-WEBP-ARTWORK.md` seeds into the isolated worktree (read it there; do NOT edit it).
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-14
- Definition of Done: the plan is approved for implementation when it satisfies issue #50
  (https://github.com/HiQS-Labs/XYZ-layout-engine/issues/50) and the questions below have no open Blocker.

**Requirements (from the operator and issue #50).** Add optional, MVP-level transparent WebP artwork
beside the PNG path, and make the latest diagram (`examples/2026-10-12-belief-reference/`, recipe
`recursive-process`) use WebP files. Operator decision: WebP + Chromium PNG. SVG/HTML exports and the
Playwright PNG support WebP; the default Satori PNG refuses with a clear error (resvg-js 2.6.2 silently
drops WebP). No new npm dependency; no new test file (test-budget.json ratchet).

**Operational envelope.** Local single-operator CLI renderer with trusted, catalog-pinned recipes and
committed artwork. Grade against these requirements and commensurate complexity, not multi-tenant or
untrusted-upload threat models. Challenge speculative machinery.

**Read these sources** (the plan cites line numbers on base `ed56529`):
- `tools/request.mjs` (readPinnedPngs, readBounded, LIMITS)
- `tools/spike/assets.mjs` (inspectPng)
- `tools/render.mjs` (processRequest Satori/Playwright branch ~236-250; HTML extractor ~340-352)
- `tools/catalog.mjs` (declaredFiles ~120-148, snapshot, publish)
- `tools/recipes/recursive-process.mjs`, `tools/recipes/nutrition.mjs`, `tools/recipes/solar-system.mjs`
- `tools/spike/test/canaries.test.mjs` (assertOfflineExport ~28-52; GH-36 block ~263-284) and `test-budget.json`
- `examples/2026-10-12-belief-reference/` (provenance.json, README.md, verification-v5.json, SHA256SUMS)

**Questions.**
1. Are the plan's claims grounded in the actual code paths (line refs, which files the catalog pins for
   which recipe, the HTML extractor's refusal)? Cite any claim that is wrong.
2. Is any requirement from issue #50 missing or mis-scoped?
3. Does the plan extend the existing reader/inspector/extractor owners rather than adding a parallel
   loader or writer? Is keeping the `readPinnedPngs` name (to avoid editing pinned nutrition/solar
   modules) the right trade?
4. Is the `inspectWebp` header contract (RIFF size, VP8X alpha flag or VP8L alpha bit, plain VP8 refused,
   shared budgets) sufficient and correct for `cwebp -lossless -exact` output, without overbuilding?
5. Is the Satori PNG refusal placed at the right owner and condition? Can it misfire (e.g. on SVG-only
   or HTML-only Satori runs, or on the Playwright coverage pass that calls renderSatori with raster:false)?
6. Is 6.0.0 (major) the correct semver under the repo's catalog rules, and are blast radius, rollback,
   the PR #43 overlap and the acceptance map/red controls sufficient and falsifiable?
7. Is editing the existing C1 GH-36 block (no new test() or file) consistent with test-budget.json rules?
8. Is the 55/20/50/60 rating grounded (appeal neutral, effort = cheapness)?

Output graded findings with file:line citations per the protocol.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
