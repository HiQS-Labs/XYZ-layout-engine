# RELAY · GH-65 plan QA: XYZ Forge lenses and prior-art search
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-18.
-->

NEXT: Producer
STATUS: Approved
ROUND: 2 / 3

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
6. **Commit only the relay file** (`relay(gh65-plan-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `PROJECT/1-INBOX/GH-65-XYZ-FORGE-LENSES.md` (the plan; nothing is built yet).
  Requirements source: issue https://github.com/HiQS-Labs/XYZ-layout-engine/issues/65 (operator layout
  choice "Today + Future" recorded in the plan's Why). Grounding sources: the three folders
  examples/2026-10-14-xyz-forge-system/, examples/2026-10-15-xyz-forge-software-factory/ and
  examples/2026-10-15-xyz-forge-shift-proposal/ (fixture.json, render-diagram.mjs, README.md, .gitignore),
  `PROJECT/3-COMPLETED/GH-55-XYZ-FORGE-DIAGRAM.md`, `tools/catalog.sql`, `tools/design-log.jsonl`,
  `tools/spike/test/canaries.test.mjs`, `test-budget.json`, root `README.md`, `.gitignore`, `AGENTS.md`,
  `SYSTEM-INSTRUCTIONS.md`. The prior-art module lives in XYZ Forge (utils/py/prior_art_recon.py, run by
  /start-task steps 1 and 4); treat the plan's description of it as the requirement, not a path here.
- Operational envelope: documentation examples in a public repo, rendered locally by one developer.
  Grade against the stated requirements and commensurate complexity; do not ask for new nodes, recipes,
  tests or engine machinery the plan scopes out unless a requirement forces it.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-18
- Definition of Done: the plan is grounded in the real paths, covers all three operator requests, touches no
  pinned or tested path, and its acceptance checks would catch a broken move or an unchecked caption.

### Questions for the Reviewer
1. Is the reference recon complete? Does anything outside the three folders (tools, catalog, design log,
   canaries, root README, docs) depend on the old paths, beyond the history files the plan leaves alone?
2. Is `RT` the only relative path each script needs changed for a two-level-deeper location? Anything else
   resolved relative to the script (outputs, fixtures, assets)?
3. Is leaving CHANGELOG, `PROJECT/3-COMPLETED/*` and `relay-system/*` paths untouched the right call, or
   does a PDDA check (dead links, hardcoded paths) flag them after the move?
4. Do the two caption edits state the prior-art check where the factory actually runs it, and are the
   acceptance checks (byte-identical v1, PASS + inspection for v2/shift, two red controls) sufficient and
   falsifiable? Is the layout red control's "temporary copy outside the repo" workable given the scripts
   read fixture.json beside themselves and import `RT` relative to the script?
5. Is the `.gitignore` hunk appropriate to carry in this PR?
6. Flag anything over- or under-engineered. Cite `file:line`.

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
Basis: The folder/caption approach is proportionate, but the move misses a live README link and two acceptance checks claim evidence the scripts do not produce. Correct the plan before implementation. Reversibility: Easy (plan text only).
swept file: yes

Read the entire seeded plan, all three render scripts, fixtures and READMEs, their ignore files, GH-55 completion record, and the named reference surfaces. Pre-existing gaps relevant to these edits are reported below; no other actionable defect found in the plan sweep. Graph tools were unavailable; source reads and targeted `rg` were used. No git, render script, executable fixture, validator or test suite was run.

- [Should] **S1 — include v1's belief-reference link in the move.** Plan `:52–55`, `:90–92` lists only two README cross-links, but `examples/2026-10-14-xyz-forge-system/README.md:3` also links `../2026-10-12-belief-reference/README.md`. After relocation it resolves inside `examples/xyz-forge/today/`, breaking navigation. Add its rewrite to `../../../2026-10-12-belief-reference/README.md`, explicitly allow this README edit under the v1 scope, and check all local README targets after moving.
  Observed input: that exact relative link and destination `examples/xyz-forge/today/system-v1/`.
  Affected scope: local relative documentation links in the three moved folders.
  Falsifier: resolve the rewritten target from the destination folder; it must reach the existing belief-reference README while image links still reach sibling PNGs.
  Probe: `python3 -c 'from pathlib import Path; t="../2026-10-12-belief-reference/README.md"; print((Path("examples/2026-10-14-xyz-forge-system")/t).is_file(), (Path("examples/xyz-forge/today/system-v1")/t).is_file())'`; exit 0, `True False`. This is path arithmetic against the seeded tree, not an executed move.

- [Should] **S2 — assert caption content in HTML, not verification.json.** Plan `:115–116` requires the new caption in `verification.json` text, but factory script `:239` and shift script `:205` serialize only IDs, dimensions, digests and findings. Replace this with exact caption extraction from the generated HTML element (`starttask_caption` / `open_caption`), retain both-PNG inspection, and use JSON for empty findings/digests. No evidence-schema or engine change is needed.
  Observed input: both seeded JSON objects have keys `renderer,width,height,textIds,iconIds,artifactDigests,findings`; neither contains caption values.
  Affected scope: the two changed-caption content checks.
  Falsifier: the generated HTML element contains the final fixture caption; stale HTML with the old caption must fail the check even when JSON findings are empty.
  Probe: `python3 -c 'import json; from pathlib import Path; ds=["2026-10-15-xyz-forge-software-factory","2026-10-15-xyz-forge-shift-proposal"]; [print(d,list(json.loads((Path("examples")/d/"verification.json").read_text()))) for d in ds]'`; exit 0, both printed the keys above. No caption-text field exists.

- [Should] **S3 — make the layout red control match the real check and preserve its receipt.** Plan `:119–123` says repeating `nodes.open.caption` proves it is inside a checked container. Shift `render-diagram.mjs:42–45` calls `T` without `within`; `:125` uses that helper for Open; `:183–184` only checks containers registered in that map. Its label is auto-height, so wrapping alone need not produce DOM overflow either. Existing pairwise text overlap (`:189`) is a suitable check; allow a specific `open_caption` overlap/canvas failure and select a mutation that actually trips it in the implementation clone. Record mutation, command, exit code, decisive finding and restored PASS in the plan Evidence section before the restoring run overwrites JSON (`:200–207`). Do not introduce a test or containment framework for this caption edit.
  Observed input: `label('open',...,230,N.open.label,N.open.caption)` with no container registration for `open_caption`.
  Affected scope: the caption red control and the containment claim at plan `:65–66`.
  Falsifier: a clone run with an oversized Open caption exits nonzero and names `open_caption` in an actual geometry finding, then the restored fixture passes. A failure for a different field or import does not count.
  Probe: `python3 -c 'from pathlib import Path; s=Path("examples/2026-10-15-xyz-forge-shift-proposal/render-diagram.mjs").read_text(); print("within" in s[s.index("const label="):s.index("const edgeText=")])'`; exit 0, `False`. **[Unverified — needs clone run]** Whether three repetitions trigger overlap/overflow has not been measured here. The current in-place control plus restore is workable in a disposable implementation clone with a known clean checkpoint; the question's outside-repo copy is no longer what plan `:121–123` specifies.

- [Should] **S4 — scope the old-path reference assertion to allow this plan's historical recon.** Plan `:124–125` allows only CHANGELOG, completed docs and two dated relay directories. This plan itself contains the old paths at `:17–19`, `:41–55`, `:87–89`; this current relay also contains them. Promotion to 2-WORKING does not remove the recon or move mapping. Explicitly allow the plan's historical recon/mapping and this relay, update current `related` pointers when promoted, and distinguish historical mentions from unresolved live links.
  Observed input: the old path at plan `:87` is intentionally the source side of the move.
  Affected scope: post-move reference search acceptance, not unrelated history rewrites.
  Falsifier: the assertion permits recorded move sources but rejects a leftover old replay command or current README link.
  Probe: `rg -l '2026-10-14-xyz-forge-system|2026-10-15-xyz-forge-software-factory|2026-10-15-xyz-forge-shift-proposal' PROJECT/1-INBOX/GH-65-XYZ-FORGE-LENSES.md relay-system/2026-10-18/gh65-plan-qa.md`; exit 0, both files printed.

- [Pass] **Q2 / scope:** each script derives `ROOT` from its own URL and routes fixture/output paths through `ROOT`, while renderer, Playwright and fonts use `RT` (system `:7–14`, factory/shift `:8–15` and their final write blocks). Four parent traversals fit the specified destinations. Keep the byte-identical v1 artifact check (plan `:112–114`) and snapshot expected bytes before rerunning. No new recipe, catalog registration, test or node is warranted by this request (`:74–81`).
- [Pass] **Q1 / Q3:** exact old-folder-name search in `tools/catalog.sql`, `tools/design-log.jsonl`, canaries, root README and test-budget returned no matches (`rg -n` over those five paths, exit 1). Source search found the histories described in plan `:48–50`, plus S4's current documents. Default governance dead-reference scope is the named governance documents (`utils/pdda/pdda.sh:884`, `:1271`), not completed plans/relay history; hardcoded-paths checks machine-specific absolute prefixes (`:235–240`), not old relative example names. Leaving dated histories intact is appropriate; actual post-move PDDA results remain clone-run evidence.
- [Pass] **Q4 / wording:** plan `:58–63`, taken as the agreed prior-art requirement per Setup, supports adding the v2 check to `/start-task` and a duplicate check to proposed morning Open (`:94–98`). Keep the future/not-built disclaimer. Inspection should include full size and thumbnail/mobile scale per SYSTEM-INSTRUCTIONS AS-10/AS-12; do not claim a new legibility win from a geometry PASS.
- [Nit] **Q5 / provenance:** the three ignore entries are explicitly operator-authorized at plan `:35–36`, so carrying them is reasonable. However, a read of the supplied primary checkout's `.gitignore` this turn found no Aider hunk (exit 0; file ends at `/temp/`); describe the hunk as requested content rather than verified current uncommitted state (`:67–68`). No need to change scope.

Limits: the pre-change witness, post-move byte identity, changed-caption fit, deterministic re-render, catalog verification, PDDA and pnpm suite are **[Unverified — needs clone run]**. Startup roadmap query could not run because `.xyz/utils/py/releases_app.py` is absent in this seeded worktree (exit 2); no replacement files were created.

Handing off to Producer (claude-a): disposition S1–S4 and the provenance nit, revise only the plan in your authorized implementation workspace, then request round 2 review.

### Producer · Round 1 (claude-a)

- S1 [Should] — **Implemented.** Recon names v1 `README.md:3` belief-reference link; requirement 3 rewrites it to `../../../2026-10-12-belief-reference/README.md`, allows that README edit in v1's scope (requirement 2), and requires every relative link in the three READMEs and the index to resolve from the new location.
- S2 [Should] — **Implemented.** Acceptance now compares the generated HTML elements `starttask_caption` / `open_caption` (ids confirmed in the committed HTML) with the fixture caption exactly; `verification.json` is used only for empty findings and digests. Inspection at full size and ~1/3 scale.
- S3 [Should] — **Implemented.** Recon records that Open's caption has no registered container (`render-diagram.mjs:42-45,125,183-184`). The layout red control now requires a geometry finding naming `open_caption` (overlap or outside canvas), mutation chosen in the clone so it trips, and records mutation, command, exit, finding and restored PASS.
- S4 [Should] — **Implemented.** The old-path assertion allows this task's relay directory and this plan's recon/move mapping, rejects any live link, replay command, script, fixture or index under `examples/`, and the `related:` list moves to the new paths on promotion.
- Q5 nit — **Implemented.** The `.gitignore` lines are described as operator-requested content seen in the primary checkout, not verified state of `origin/main`.

Handing off to Reviewer (codex) for round 2.

### Reviewer · Round 2

VERDICT: PASS
Basis: Ship the plan for implementation. S1–S4 are resolved as acceptance specifications; the three requested outcomes have bounded delivery and verification paths. Reversibility: Easy. Approval covers the plan, not unexecuted implementation results.
swept file: yes

Read the entire revised plan and all three render scripts, fixtures, READMEs and ignore files, plus the named grounding surfaces. No additional actionable pre-existing defect was found in the plan sweep. Graph tools were unavailable; direct source reads and targeted searches supplied evidence. No git, renderer, executable fixture, validator or test suite was run.

- [Pass] **S1 / move path ownership:** plan `:97–102` permits v1's README fixes and requires every relative documentation link to resolve. Its explicit belief-reference target is correct; the four-parent RT matches all three destination depths. Scripts resolve fixtures and outputs through ROOT (system `:7–14,229–235`, factory `:8–15,232–240`, shift `:8–15,199–206`). Read-only path probe: `python3 -c 'import posixpath; from pathlib import Path; p=posixpath.normpath(posixpath.join("examples/xyz-forge/today/system-v1","../../../2026-10-12-belief-reference/README.md")); print(p,Path(p).is_file())'` is the path calculation used in the combined Python probe; exit 0, decisive output `v1 rewritten link examples/2026-10-12-belief-reference/README.md True`. That combined probe printed RT `.` for each proposed destination. No move was executed.
- [Pass] **S2 / content and fit checks:** plan `:125–128` now requires exact generated HTML caption equality, both-PNG inspection at full and thumbnail size, empty findings and repeatable digests. The current factory helper/consumer `:47–50,155` emits `starttask_caption`; shift `:42–45,125` emits `open_caption`. These are real text-bearing elements, unlike the receipt schema (factory `:239`, shift `:205`). The stale-HTML rejection is explicit at plan `:126–127`.
- [Pass] **S3 / falsification:** plan `:72–75,131–137` correctly distinguishes the unregistered Open caption from registered containers and specifies a nonzero geometry failure naming `open_caption`, with mutation, command, exit, finding and restored PASS retained in Evidence. Shift `:182,187–189,200–207` supports the canvas/overlap diagnostic and explains why the failed receipt must be retained before restore. This is sufficient at plan time; actual mutation sensitivity remains **[Unverified — needs clone run]**.
- [Pass] **S4 / reference scope and history:** plan `:138–141` allows its historical recon/mapping and this task's relay while rejecting live old-path references under examples; promotion updates related pointers. Probe command: `rg -l --hidden -g '!.git' -g '!node_modules/**' -g '!.relay-scratch/**' '2026-10-14-xyz-forge-system|2026-10-15-xyz-forge-software-factory|2026-10-15-xyz-forge-shift-proposal' .`; exit 0. Decisive file set: the three example folders (including shift's generated HTML), CHANGELOG, GH-55/GH-60 completed docs, dated GH-55/GH-60 relays, this plan and this relay. No additional live consumer appeared in that bounded search. Separate `rg -n` over tools/catalog.sql, tools/design-log.jsonl, canaries, root README and test-budget returned exit 1, no matches. Default governance dead-reference scope is the named governance docs (`utils/pdda/pdda.sh:884,1271,1293`); hardcoded-paths checks machine-specific prefixes (`:235–240`). Leaving dated history alone is appropriate.
- [Pass] **Requirements and proportionality:** plan `:93–112` delivers Today + Future grouping, the prior-art captions at /start-task and proposed morning Open, the index and requested ignore content; `:114–118` excludes unrelated runtime, test and catalog changes. The prior-art description is accepted as the requirement per Setup. The future disclaimer remains in shift fixture `:6–7,70` and README `:3`. No additional node, framework, suite or catalog registration is warranted.
- [Nit] **Provenance wording remains stronger than the disposition says:** plan `:68–69` still says “seen as an uncommitted hunk ... not present on origin/main”; the seeded root .gitignore ends at `/temp/`. The supplied tree supports absence here, not independent observation of the primary checkout or origin. When updating the plan, prefer “operator-requested content, reported from the primary checkout.” This is nonblocking because the requested three lines and authorization are explicit at `:35–36,68–69,111`.

Limits: pre-change rerender witness, post-move byte identity, caption fit/legibility, negative-control execution, determinism, catalog, PDDA and pnpm results remain **[Unverified — needs clone run]**. Startup `python3 .xyz/utils/py/releases_app.py roadmap list` exited 2 because that file is absent in this seeded worktree; no replacement was created.

Relay closed (Approved), no further turn needed. Producer (claude-a) may proceed to implementation and retain the specified clone-run receipts.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
