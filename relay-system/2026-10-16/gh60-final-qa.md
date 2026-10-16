# RELAY · GH-60 final QA: skill trigger plate, font.faces, design-intake 1.0.4
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-16.
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
6. **Commit only the relay file** (`relay(gh60-final-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: the branch diff `git diff ece1fed..HEAD` (base `ece1fed` = origin/main). Plan and evidence:
  `PROJECT/2-WORKING/GH-60-SKILL-TRIGGER-PLATE.md` (read "Scope change after implementation" and "Evidence").
  Changed code: `tools/render.mjs` (optional `font.faces`), `tools/recipes/design-intake.mjs` (version 1.0.4),
  `tools/catalog.sql` (new design-intake 1.0.4 rows), `examples/2026-10-16-skill-trigger/{render-diagram.mjs,fixture.json,README.md,verification.json}`,
  `tools/fonts/alegreya/{SOURCE.md,OFL.txt,*.woff}`, `SYSTEM-INSTRUCTIONS.md` (AS-5 wording), `CHANGELOG.md`.
  Plan QA thread: `relay-system/2026-10-16/gh60-plan-qa.md`. Precedent: `examples/2026-10-15-xyz-forge-shift-proposal/`, `tools/catalog.mjs` (`verify`, `publish`).
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-16
- Operational envelope: one documentation example plus a small additive option in a single-repo local render tool.
  Grade against the stated requirements and commensurate complexity; no new tests (AGENTS.md); do not demand
  enterprise fail-safes. Renders and `pnpm test` were run by the Producer outside the sandbox (Chromium cannot
  launch inside it); evidence is in the plan doc. Do not run validate/test suites in the relay worktree.
- Definition of Done: issue #60 satisfied (recreated plate as a new example folder), operator decisions honoured
  (shared-renderer `font.faces` + recipe republish in this PR; AS-5 font policy: vendor the closest Google Fonts
  match at authoring time, agent picks and records why, Barlow Condensed default with no reference), checks
  substantiate the claims, no duplicate subsystem or writer.

### Questions for the Reviewer
1. `tools/render.mjs`: is absent `font.faces` truly byte-identical in all three sites (Satori fonts list in
   `renderSatori` and `measureLongestWords`; `toDocument` @font-face lines)? Any input that would break (e.g. a
   `style` other than 'italic', non-WOFF data MIME sniffing)? Cite lines.
2. Catalog: is publishing `design-intake@1.0.4` (patch) the correct and complete response to changing a pinned
   file, per `tools/catalog.mjs` verify/publish and the recursive-process 5.0.1 precedent? Are the new
   `tools/catalog.sql` rows canonical (generated by the CLI, not hand-edited)? Any other pinned consumer missed?
3. Example script: does it own geometry once, reuse the shared renderer (no leftover local render path), and do
   its checks (rotated-label box transform, the single `title_1|title_2` overlap exemption, italic @font-face
   registration check) hold up? Is the exemption justified and narrow?
4. AS-5 edit in `SYSTEM-INSTRUCTIONS.md`: does it match the operator answers above without contradicting the
   rest of AS-5 / "Changing this file"? Are font license, source and hashes recorded per AS-5?
5. Plan doc / CHANGELOG / README: truthful and consistent with the final design (no stale `renderBoth` or
   "render.mjs unchanged" claims)? Anything over- or under-scoped?

Cite `file:line` for disagreements.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
