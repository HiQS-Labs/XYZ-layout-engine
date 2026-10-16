# RELAY · GH-60 plan QA: skill trigger plate example
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-16.
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
6. **Commit only the relay file** (`relay(gh60-plan-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `PROJECT/1-INBOX/GH-60-SKILL-TRIGGER-PLATE.md` (the plan; nothing is built yet).
  Grounding sources: `tools/render.mjs` (`renderSatori` line 24-31, `measureLongestWords` ~line 67-90,
  `toDocument` ~line 119-131, `renderPlaywright`), the precedent example
  `examples/2026-10-15-xyz-forge-shift-proposal/{render-diagram.mjs,fixture.json,README.md}`,
  `PROJECT/3-COMPLETED/GH-55-XYZ-FORGE-DIAGRAM.md`, `tools/fonts/barlow-condensed/SOURCE.md`,
  `SYSTEM-INSTRUCTIONS.md` (AS-1..AS-11), `AGENTS.md`, `test-budget.json`, issue
  https://github.com/HiQS-Labs/XYZ-layout-engine/issues/60 (its body describes the source image).
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-16
- Operational envelope: one documentation example in a single-repo local render tool. Grade against the
  stated requirements and commensurate complexity; no new tests (AGENTS.md); do not demand enterprise
  fail-safes, new frameworks, or recipe/catalog work.
- Definition of Done: the plan is grounded in the actual code paths, covers the operator's ask (recreate
  the supplied plate as a new example folder), extends the existing renderer rather than adding a second
  render path, and has falsifiable acceptance checks including a red control and a back-compat check.

### Questions for the Reviewer
1. Is the renderer change (optional `font.faces` of `{data, weight, style}` appended in `renderSatori`,
   `measureLongestWords`, and as extra `@font-face` rules in `toDocument`) the smallest correct way to get
   italic faces, and is "absent `faces` ⇒ byte-identical output" a sound back-compat claim? Anything in
   `tools/render.mjs` (e.g. the recipe path around `recipe.FONT`, line ~206) that would also need it?
2. Static Alegreya latin WOFF files from `@fontsource/alegreya@5.1.0` with the upstream OFL: any
   license/provenance gap versus how Barlow Condensed is recorded? Does the latin subset plausibly cover
   the copy (curly quotes, middle dot `·`, `?`)? (The glyph check would catch gaps at render time.)
3. Procedural texture rasterized once by resvg into an embedded PNG: sound for identical pixels in both
   backends, or is there a simpler path already in the repo?
4. Are the acceptance checks falsifiable as written (red control on a fixed-height subtitle container;
   shift-proposal digest equality as the back-compat witness)?
5. Is anything over- or under-scoped? Flag missing requirements from the issue, or machinery to cut.

Cite `file:line` for disagreements.

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
Basis: Ship the plan. The additive face option fits the existing shared renderer and the one-example scope. Acceptance includes a concrete negative control, a committed back-compat witness and visual comparison. Approval is of the plan, not of unbuilt output.
swept file: yes

- [Pass] Read the entire plan (`PROJECT/1-INBOX/GH-60-SKILL-TRIGGER-PLATE.md:1-131`), including recon, non-goals and acceptance. No pre-existing defect requiring a plan revision found. The serif/italic requirement and explicit rollback justify the small shared change (plan:65-75); no recipe, catalog, framework or suite expansion is needed (plan:91-94).
- [Pass] Q1: the three named registration sites are the actual owners: `tools/render.mjs:31`, `:82`, `:127-128`. `renderPlaywright` delegates to `toDocument` at `:143`. Keep the two existing normal registrations and HTML bytes unchanged when faces are absent; append same-family italic registrations only when supplied. `processRequest` constructs only regular/bold at `:206-210`, but this example calls the exported backend operations directly, as the precedent does at `examples/2026-10-15-xyz-forge-shift-proposal/render-diagram.mjs:160-166`; extending the recipe FONT contract is unnecessary for this scope.
- [Pass] Q2/Q3, design assessment: versioned static font files plus OFL and source note meet AS-5's recorded-license requirement (`SYSTEM-INSTRUCTIONS.md:34-35`; plan:76). Include exact source filenames and hashes when vendoring, following `tools/fonts/barlow-condensed/SOURCE.md:7-16`. One pre-rasterized, embedded texture avoids separate browser/SVG filter interpretations; embedded PNG is already accepted by `tools/render.mjs:109`. Identical embedded texture bytes do not imply byte-identical complete backend renders. Keep procedural seed and native texture dimensions fixed (plan:84-87).
- [Nit] Q4: make the comparison procedure explicit: snapshot the **committed** expected digest before running the precedent. Its script overwrites the PNG and `verification.json` at `examples/2026-10-15-xyz-forge-shift-proposal/render-diagram.mjs:200-206`; comparing only the two newly written files would be tautological. The plan already correctly specifies the committed value at :103-104. Read-only probe command: `python3 - <<'PY'` with `from pathlib import Path; import hashlib,json; p=Path("examples/2026-10-15-xyz-forge-shift-proposal"); v=json.loads((p/"verification.json").read_text()); print(v["artifactDigests"]["png"]); print(hashlib.sha256((p/"xyz-forge-shift-proposal.png").read_bytes()).hexdigest())`, then `PY`. Exit 0; both seeded values were `871a60362ebce34fb43a307f0e4931c45c69f79f78a48dc1ee2a9af82ff30c7f`. This establishes the seeded witness only, not a post-change result. Since `toDocument` also changes, retain a pre-change HTML witness in clone scratch too when checking the broad byte-identical claim.
- [Nit] Preserve red-control evidence in the plan's Evidence section: exact subtitle mutation, command, non-zero status and decisive container finding, then restored PASS (plan:101-102, :129-131). The precedent writes evidence before asserting findings (`examples/2026-10-15-xyz-forge-shift-proposal/render-diagram.mjs:206-207`), so a restored run replaces the failed receipt. This is an evidence-recording clarification, not a request for another test.
- [Unverified — needs clone run] Static Alegreya WOFF parsing, coverage of the actual copy in all four faces, texture rasterization, subtitle red-control sensitivity, absent-faces output equality and render/visual gates are implementation checks, not observed successes. No local `node_modules` exists (read-only `Path("node_modules").exists()` probe: exit 0, `False`). Do not treat Chromium's family-only check (`tools/render.mjs:164`) as proof of italic selection; inspect the actual italic title in both outputs as planned at :105. No fixtures, test suites or validation scripts were executed here.
- [Unverified — source unavailable] Q5: issue/source-image parity could not be independently checked. `gh issue view 60 --repo HiQS-Labs/XYZ-layout-engine --json title,body` exited 1: `error connecting to api.github.com`; web fallback also could not fetch the issue. The listed content/style requirements at plan:80-89 are internally coherent; implementation must perform the source comparison already required at :105. External font-package contents and current PR #52 state likewise remain unverified.

Relay closed (Approved), no further turn needed. Producer can proceed with implementation and retain the named evidence for final QA.


### Attestation · relay-drive — 2026-10-16T20:14:21Z
task: RELAY-gh60-plan-qa
reviewer: codex
status: Approved
reviewed-head: 0234445155e7ad968622a1fd02b9319b8e555e7c
added-range: 7501+4607
added-sha256: ed7ab89d239031d7589e4cddb495451897a3b969c14b9b40a73d6cdf80cf1f69
<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
