# RELAY · GH50 WebP artwork final QA
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
6. **Commit only the relay file** (`relay(gh50-webp-artwork-final-qa): <role> r<N>`); no push. **Stop** and report one line.
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
- Definition of Done: the committed implementation at this branch's HEAD satisfies issue #50 and the
  Approved plan (`relay-system/2026-10-14/gh50-plan.codex.md`, round 3), and the questions below have
  no open Blocker.

**This is the final QA of the committed diff, not the plan.** Base is `ed56529`; implementation is
`bdf4e6f` (engine + assets + catalog) and `2faf201` (renders, evidence, docs, existing-test edit).
Review the code by reading the files at HEAD, and `git diff ed56529..HEAD -- tools/` for the change.

**Requirements.** Optional, MVP-level transparent WebP artwork beside PNG; the latest diagram
(`examples/2026-10-12-belief-reference/`, recipe `recursive-process`) uses WebP. Operator decision:
WebP + Chromium PNG; Satori PNG refuses clearly (resvg-js 2.6.2 silently drops WebP). No new npm
dependency, no new test file or `test()` block (`test-budget.json`).

**Operational envelope.** Local single-operator CLI renderer, trusted catalog-pinned recipes, committed
artwork. Grade against the requirements and commensurate complexity; challenge overbuilding.

**Read:** `tools/request.mjs` (inspectWebp, readPinnedPngs), `tools/render.mjs` (lines ~111, ~245,
~352-357, ~443, ~477, ~495), `tools/profile.mjs:14`, `tools/catalog.mjs` (recursive-process declared
files), `tools/recipes/recursive-process.mjs` (header, version, reader call),
`tools/spike/test/canaries.test.mjs` (GH-36 block ~263-290), `tools/catalog.sql` / `tools/design-log.jsonl`
(new 6.0.0 rows), `examples/2026-10-12-belief-reference/` (provenance.json, README.md v6 section,
verification-v6.json, SHA256SUMS, renders-v6/), root `README.md`, `CHANGELOG.md` top entry, and the
evidence `relay-system/2026-10-14/gh50-verification/controls.md`. The plan with its acceptance map and
implementation results is seeded as the artifact.

**Questions.**
1. Does each requirement R1–R6 in the plan's acceptance map hold in the actual code and evidence? Cite
   any claim in the results table or CHANGELOG that the code or evidence does not support.
2. Is `inspectWebp` correct for its stated contract (bounded reads before field access, RIFF length,
   VP8X alpha flag, VP8L signature/alpha bit/14-bit dims, budget accounting matching `inspectPng`)?
3. Is the Satori refusal correct and non-misfiring (SVG/HTML-only Satori, Playwright's raster:false
   coverage pass, the fitting loop's `attempt === 0` placement)?
4. Did a parallel loader, writer or publisher slip in, or did any file pinned by nutrition or
   solar-system change? Are PNG-default callers byte-identical in behaviour?
5. Do the catalog changes (6.0.0 publish, declared `.webp` files, new design) follow the CLI-only rule
   and leave history rows untouched?
6. Is the C1 edit within `test-budget.json` (no new test file/block/registry), and do the edited
   assertions still exercise the original non-fit and unsupported-font controls?
7. Is the 55/20/50/60 rating still consistent with the delivered evidence?
8. Anything over-engineered, under-verified, or out of scope (e.g. the `SHA256SUMS` stale-line removal)?

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
