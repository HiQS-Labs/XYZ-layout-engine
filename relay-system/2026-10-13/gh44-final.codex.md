# RELAY · GH44 Nutrition DESIGN.md, MangaJDM archive, and README refresh final implementation QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-13.
-->

NEXT: Producer
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
6. **Commit only the relay file** (`relay(gh44-final): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **.relay-artifacts/GH-44-NUTRITION-DESIGN-README.md** — the read-only path that
  `relay-drive.sh --artifact-file PROJECT/2-WORKING/GH-44-NUTRITION-DESIGN-README.md` seeds into the isolated worktree (read it there; do NOT edit it). Also inspect the implemented branch files (`tools/render.mjs`, `tools/catalog.mjs`, `tools/catalog.sql`, `tools/design-log.jsonl`, `tools/recipes/nutrition.mjs`, `tools/spike/verify.mjs`, `tools/spike/test/canaries.test.mjs`, `examples/2026-10-13-nutrition-infographic/**`, `README.md`, `CHANGELOG.md`).
- Reviewer: codex   ·   Producer: author
- Started: 2026-10-13
- Definition of Done: Verify all three GH-44 implementation deliverables on branch feat/gh44-nutrition-design (`PROJECT/2-WORKING/GH-44-NUTRITION-DESIGN-README.md:67-72`): (1) `examples/2026-10-11-mangajdm-promos`, `examples/2026-10-12-design-revision`, and `tools/recipes/mangajdm-promo.mjs` removed from tracked repo and `tools/catalog.sql` (`tools/catalog.sql:18-137`) + `tools/design-log.jsonl` (`tools/design-log.jsonl:1-14`) while preserving all unrelated catalog rows; (2) `examples/2026-10-13-nutrition-infographic/` delivered with `DESIGN.md`, `ASSETS.md`, `artwork.json`, `fixture.json`, `provenance.json`, 7 verified `gpt-image-2.5-flare` transparent PNGs, `receipts/`, `renders/{satori,playwright}/`, `index.html`, `verification.json`, `README.md`, and `SHA256SUMS`, plus `nutrition@2.0.0` in `tools/recipes/nutrition.mjs:1-340` (`Barlow Condensed` ALL CAPS headlines, radial-gradient canvas, per-PNG drop shadows across Satori+resvg and Chromium with inline style stripped on rewritten SVG `<image>` elements in `tools/render.mjs:35-43`) while keeping `tools/request.mjs`, `tools/spike/{scene.mjs,assets.mjs,fixture.json,assets/**,output/**}`, and `test-budget.json` byte-identical; (3) `README.md:1-175` and `CHANGELOG.md:1-12` refreshed and `pnpm test` (4/4), catalog verify/export --check, SHA256SUMS, releases_app.py check, and pdda.sh run passing.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1

VERDICT: FAIL
Basis: The delivered visual bundle and catalog pass the narrow checks below, but the canonical style guide contradicts the fixture, the root README gives an obsolete catalog recovery procedure, and the AS review does not acknowledge the reference's copy/ornament exceptions. Correct these documentation defects before approval; no runtime redesign is requested.
swept file: yes

Reviewed the entire seeded artifact, not only a diff, and swept the implementation modules (`render.mjs`, `catalog.mjs`, `nutrition.mjs`, `verify.mjs`, and `canaries.test.mjs`), root README, current changelog entry, catalog/log data, and example design/copy/provenance/render evidence. The pre-existing README recovery defect is included below; no additional concrete runtime defect was established in the source sweep. Historical catalog preservation and full runtime checks remain bounded by the evidence limits below.

- **[Should] R1 — Make the canonical DESIGN.md describe the delivered design.** `examples/2026-10-13-nutrition-infographic/DESIGN.md:16` names `NUTRITION FOR ENERGY & FOCUS`, line 19 names different callouts, and line 26 names `NOURISH TO FLOURISH` / `Eat Well, Live Vibrantly!`; the delivered fixture and both PNGs instead use `FUEL WELL. LIVE WELL.`, `BALANCED NUTRITION`, `SKIP THE SPIKE`, and `GOOD FUEL. EVERY DAY. EVERY WHERE.` / `Small choices. Big impact.`. The palette table at lines 58–64 also disagrees with the fixture: primary `#2e5a27` vs `#2f5d27`, muted `#4a5d43` vs `#3d4639`, panelFill `#eef2e2` vs `#f4f8ea`, panelBorder `#6d9f58` vs `#b9d79b`, fallback `#f7f3e3` vs `#fbfaf3`. The example README repeats the wrong fallback. Fix: reconcile the guide and README to the accepted fixture (or explicitly distinguish illustrative alternatives from current values); preserve published-version immutability when updating catalog-bound DESIGN.md, and refresh dependent evidence through the existing publication flow. Reversibility: Easy; the present requirement is an accurate reusable style guide, not a visual redesign.
  Observed input: `examples/2026-10-13-nutrition-infographic/fixture.json` and the conflicting literal values above.
  Affected scope: This example's current style-guide/copy/palette descriptions and their publication evidence.
  Falsifier: The delivered fixture and backend styles match each claimed current token and headline; expected zero mismatches.
  Probe (exit 0):
  ```sh
  node --input-type=module -e 'import fs from "node:fs"; const p="examples/2026-10-13-nutrition-infographic/"; const f=JSON.parse(fs.readFileSync(p+"fixture.json")); const d=fs.readFileSync(p+"DESIGN.md","utf8"); for (const k of ["primary","muted","panelFill","panelBorder"]) { const row=d.split("\n").find(l=>l.startsWith("| `palette."+k+"`")); console.log(k, row, "fixture="+f.theme.palette[k]); }'
  ```
  Decisive output: `primary ... #2e5a27 ... fixture=#2f5d27`, `muted ... #4a5d43 ... fixture=#3d4639`, `panelFill ... #eef2e2 ... fixture=#f4f8ea`, `panelBorder ... #6d9f58 ... fixture=#b9d79b`.

- **[Should] R2 — Correct the pre-existing catalog recovery paragraph in the refreshed README.** `README.md:125` says `dump first, then the log line` and recommends restoring version-controlled files after log failure. Actual ownership is the opposite: `tools/catalog.mjs:356` atomically stages the log first, line 360 replaces the dump, and lines 364–367 restore prior log bytes/absence on ordinary dump failure and explicitly report rollback failure. The old recovery advice can discard valid intervening local records and misstates a repair already documented in the October 12 changelog.
  Observed input: The literal `dump first, then the log line` paragraph versus `await atomicDump(logFile,...)` before `await atomicDump(file,canonical)`.
  Affected scope: README's description and operator recovery instructions only.
  Falsifier: A source path committing the dump before the log during `design add`; expected no such path in the current implementation.
  Fix: Describe log-first compensated writes, ordinary-failure retry, explicit recovery on rollback failure, and the existing process/power-loss atomicity limit. Do not change working catalog code. Reversibility: Easy. Source inspection command `nl -ba tools/catalog.mjs | sed -n '348,376p'` exited 0 with the ordered calls and compensation above; injected I/O execution was not run here.

- **[Should] R3 — Report the actual AS-6/AS-7 exceptions.** `SYSTEM-INSTRUCTIONS.md` AS-7 explicitly calls `Fuel well. Live well.` a failing slogan; `fixture.json` uses precisely that headline and a slogan footer. Header/footer leaves and heart are decorative, and the radiant leaf/sparkles are a reference-led metaphor. The example README's AS-6/AS-7 paragraph (lines 72–74) describes SVG versus PNG implementation instead of acknowledging these exceptions or explaining their purpose. Fix: explicitly record the reference-reproduction rationale for retained slogan copy, decorative ornaments and metaphor, and identify this as an illustrative reference study. This is compatible with preserving the requested artwork; no automatic copy rewrite is requested. Correct rule attribution as well: AS-2 covers glow/shadows, AS-3 covers containers, AS-6 covers ornament.
  Observed input: `fixture.json` headline `FUEL WELL. LIVE WELL.` and `ornamentId: leaf_small` / `endIconId: heart`, visible in both saved PNGs; README's quoted AS-6/AS-7 paragraph omits the exception.
  Affected scope: This example's documented AS review and reference-study framing.
  Falsifier: An explicit AS-6/AS-7 exception already explaining these exact choices and their reader/reference purpose; expected a citation to that explanation.
  Reversibility: Easy; accurate disclosure is the smallest mechanism.

- **[Pass] Current catalog and retained file integrity.** Commands `node tools/catalog.mjs verify --json` and `node tools/catalog.mjs export --check` exited 0 with `{"valid":true,"errors":[]}` and `{"canonical":true}`. From the example directory, `shasum -a 256 -c SHA256SUMS` exited 0: all 33 listed files reported `OK`, including `DESIGN.md`, seven PNGs, seven receipts, and both retained render bundles. Evidence owner: `examples/2026-10-13-nutrition-infographic/SHA256SUMS`.

- **[Pass] Requested visual features in retained artifacts.** Inspected both `renders/{satori,playwright}/render.png` at 1000×1000 and both `thumbnail.png` at 420×420. Unequal hierarchy, uppercase condensed headlines, seven illustrations, cream radial background and grounding shadows are visible; no obvious clipping was observed. Saved `renders/satori/render.svg` contains seven `<feDropShadow>` elements and zero `style="filter:drop-shadow(` attributes, consistent with `tools/render.mjs:35` and the stripping return at line 40. This is artifact inspection, not a fresh-render claim. AS-2/AS-3 exceptions are documented; R3 covers the omitted exceptions.

- **[Unverified — needs clone run]** `pnpm test`, fresh render/digest equivalence for solar/recursive-process, full PDDA and RELEASES gates were not executed in this reviewer worktree. The harness owns those checks. Filesystem inspection found the three retired paths absent and no retired identities in current catalog/log, but removal from Git tracking, both private archive copies, every unrelated historical row, and complete protected-tree before/after equality were not independently proven without the baseline/host evidence. The five individually pinned protected-file hashes read here match the seeded artifact's recorded values. Local startup RELEASES entrypoints were absent, so roadmap query was not run. No Git command, fixture execution, or artifact/source edit was performed.

Handing off to Producer (author) — disposition R1–R3, update the documentation/publication evidence as needed, and return for Round 2. STATUS remains Open.

<!-- APPEND NEW TURN BLOCKS ABOVE THIS LINE -->
