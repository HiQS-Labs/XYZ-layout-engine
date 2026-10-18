# RELAY · GH-63 final QA: vibe-coding loop example
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-17.
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
6. **Commit only the relay file** (`relay(gh63-final-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `examples/2026-10-17-vibe-coding-loop/README.md` and the rest of the committed
  implementation on this branch versus main at 6facd4c (diff with git diff 6facd4c..HEAD):
  examples/2026-10-17-vibe-coding-loop/** (render script, fixture, DESIGN.md, ASSETS.md, README,
  artwork.json, provenance.json, receipts, assets/web PNGs, outputs, verification.json), `CHANGELOG.md`
  (top entry), and the plan + acceptance map + evidence in `PROJECT/2-WORKING/GH-63-VIBE-CODING-LOOP.md`.
  Plan QA thread (approved): `relay-system/2026-10-17/gh63-plan-qa.md`. View the PNGs directly
  (`examples/2026-10-17-vibe-coding-loop/vibe-coding-loop.png`, `examples/2026-10-17-vibe-coding-loop/vibe-coding-loop-chromium.png`) for the visual checks.
- Operational envelope: a documentation example in a public repo, rendered locally by one developer.
  Grade against the plan's requirements 1–7 and acceptance checks and commensurate complexity. Do not ask
  for recipes, catalog entries, new tests or engine machinery the approved plan scoped out.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-17
- Definition of Done: every requirement 1–7 is met by the committed files; the evidence table's claims
  match what the files and outputs show; no pinned file (`tools/render.mjs`, `tools/request.mjs`, recipe
  modules) or `test-budget.json` changed; no personal or machine path leaked into committed files.

### Questions for the Reviewer
1. Does `render-diagram.mjs` keep one geometry owner, reuse the shared `renderSatori` / `renderPlaywright`
   and `readPinnedPngs` without a second render path, and are its AS-12 checks computed from real values
   (sizes collected from every text node, title width from the Satori text box, cap height from the font's
   OS/2 table)? Any check that cannot fail?
2. AS-11: is the two-ellipse ground shadow (contact under the visible base, cast lower-left from one
   upper-right light) correctly placed from each asset's `visibleBox`? Are the `visibleBox` values in
   `fixture.json` plausible for the committed `assets/web` PNGs?
3. Provenance: do `provenance.json`, `ASSETS.md` and the receipts agree (hashes, bytes, alpha), and are the
   receipts free of home-directory or scratch paths? Does `readPinnedPngs` actually gate the cutouts?
4. Content parity (requirement 7) and visual quality: compare the PNGs with the checklist. Any connector
   crossing a card, cutout or label? Any AS-1..AS-12 claim in the README that the PNGs contradict? Is the
   phone-readability statement honest?
5. Is the headline change from the planned 8% to 9% of S justified and recorded?
6. Diff hygiene: any accidental files (`.relay-scratch`, `.xyz`, `.claude`, node_modules), stray outputs,
   or changes outside the stated scope?
7. Flag anything over- or under-engineered. Cite `file:line`.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
