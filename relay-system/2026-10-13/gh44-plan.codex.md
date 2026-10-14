# RELAY · GH44 Nutrition DESIGN.md, MangaJDM archive, and README refresh plan QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-13.
-->

NEXT: Producer
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
6. **Commit only the relay file** (`relay(gh44-plan): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **.relay-artifacts/GH-44-NUTRITION-DESIGN-README.md** — the read-only path that
  `relay-drive.sh --artifact-file PROJECT/2-WORKING/GH-44-NUTRITION-DESIGN-README.md` seeds into the isolated worktree (read it there; do NOT edit it).
- Reviewer: codex   ·   Producer: author
- Started: 2026-10-13
- Definition of Done: Grade the three scoped objectives (1: move MangaJDM studies to gitignored temp/ManagaJDM projects/ and remove mangajdm-promo + 7 design rows from tools/catalog.sql and tools/design-log.jsonl; 2: create examples/2026-10-13-nutrition-infographic/ with DESIGN.md and publish nutrition@2.0.0 using Barlow Condensed ALL CAPS headlines, gradient background, 7 verified gpt-image-2.5-flare transparent PNGs, and per-PNG drop shadows across both Satori+resvg and Chromium while leaving tools/request.mjs and tools/spike/{scene.mjs,assets.mjs,fixture.json,output/**} byte-identical; 3: refresh README.md and CHANGELOG.md), falsifiable acceptance criteria, 70/20/75/70 rating, and unchanged test-budget.json.  [Unverified — no citation]

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
Basis: The three objectives are represented, but the registration command fails admission, the C4 migration misses its namespace control, and the catalog migration and invariant checks need executable detail before implementation.
swept file: yes

Reviewed the entire seeded plan, including frontmatter, scope/bet, all phases, acceptance and ratings, against the current catalog, renderer, request helper and canary contracts. The findings below include issues already present in the plan; no additional pre-existing plan defects were identified in this sweep. This is plan QA, not implementation approval. Reversibility: Easy for these plan corrections; archival loss remains Costly as the plan states.

- [Pass] All three requested objectives are explicit: archive and seven row IDs (artifact lines 38–42), the new example and nutrition@2.0.0 (44–57), and README/CHANGELOG (59–63). The requested rating is exactly `70/20/75/70`, with the correct sum `235` (76). The design exceptions and both-backend full-size/thumbnail review are named (48, 56); this passes planning coverage only, not visual QA.
- [Should] R1 — Repair the design-registration command and specify export retrieval (artifact:56). It omits mandatory `--friction`; the current parser rejects it before catalog I/O (`tools/catalog.mjs:279`). Also state how the selected immutable render becomes the proposed flat `renders/satori/render.png`: the renderer publishes to `runs/<id>` and sets `manifest.current` (`tools/render.mjs:427–455`). Resolve that pointer and register its PNG, or explicitly copy the selected distribution before registering it.
  Observed input: The exact `node tools/catalog.mjs design add ... --use-case nutrition@2.0.0` command at artifact:56, with no `--friction`.
  Affected scope: Only the new nutrition design registration and its artifact path; no CLI relaxation.
  Falsifier: The corrected command parses with a nonempty friction value, and its chosen artifact path exists after the documented export/copy step.
  Probe command (read-only parser extraction; no catalog write attempted):
  ```sh
  node --input-type=module <<'JS'
  import fs from 'node:fs';
  import vm from 'node:vm';
  const src=fs.readFileSync('tools/catalog.mjs','utf8');
  const parse=vm.runInNewContext('class Usage extends Error {}; '+src.slice(src.indexOf('function parse(args)'),src.indexOf('// Only this module owns catalog I/O.'))+'; parse');
  const plan=fs.readFileSync('.relay-artifacts/GH-44-NUTRITION-DESIGN-README.md','utf8');
  const command=plan.match(/node tools\/catalog\.mjs design add [^`]+/)[0];
  try { parse(command.split(' ').slice(2)); console.log('accepted'); process.exitCode=1; }
  catch(e) { console.log('REJECTED before catalog I/O: '+e.message); }
  JS
  ```
  Exit: 0 (the probe caught the rejection). Decisive output: `REJECTED before catalog I/O: catalog list|show <slug>|add <slug> --title T|publish <slug> <version>|update <slug> --title T|deprecate|retire <slug> --reason R|verify|export [--check]|import <dump>`.
- [Should] R2 — Specify relocation of C4's extra-PNG tamper control, not just the copied fixture/font/version (artifact:55–57). `tools/spike/test/canaries.test.mjs:512–514` currently adds `tools/spike/assets/generated/web/heart.png` and expects `namespace differs`. The planned declared file set drops that directory in favor of the new example's PNGs. Move the injected file into that new namespace and retain the reject/restore assertion in the existing C4; do not add another suite.
  Observed input: C4's `extraPng = path.join(root,'tools/spike/assets/generated/web/heart.png')`, versus artifact:55's new `assets/web/*.png` declaration.
  Affected scope: Nutrition@2.0.0's extra-file detection control.
  Falsifier: In a disposable clone, an extra PNG in the new declared namespace makes verify fail with `namespace differs`; removing it restores success. Full canary execution is [Unverified — needs clone run].
- [Should] R3 — Name the supported catalog migration procedure (artifact:42). ROUTER.md's canonical rule says “Change the catalog only through `node tools/catalog.mjs`”; the plan names row removal but no operation. `design` admits only list/show/add (`tools/catalog.mjs:267`), and `retire` preserves the identity (`350`); it does not perform this requested removal. Specify a bounded prepared-dump/import procedure using the existing CLI, coordinate the seven log-line removals, preserve all unrelated rows, and restore both dump and log on failure. No new generic deletion subsystem is needed.
  Observed input: Artifact:42's removal of the named recipe history and seven design rows from the dump/log.
  Affected scope: Exactly those records, plus their dependent recipe file/output rows.
  Falsifier: A documented CLI-owned migration produces a canonical dump with exactly the requested records absent, all other records unchanged, and a matching log; verify succeeds in the clone.
- [Should] R4 — Add explicit evidence for the byte-preservation acceptance and unchanged test budget (artifact:63,70–72). Passing the current canaries is not a before/after digest comparison of all protected paths or both unaffected recipes. Record baseline/candidate hashes for the named protected files/directories and `test-budget.json`, plus deterministic artifact comparisons for fixed Solar System and recursive-process inputs under the same runtime. Keep this as clone verification, not additional tests/gates.
  Observed input: Artifact:70 promises byte-identical protected files and unchanged two-recipe outputs; :63 lists checks but no baseline comparison, and the plan never names `test-budget.json` despite the relay DoD.
  Affected scope: Only the already-required preservation invariants and unchanged test budget.
  Falsifier: A documented baseline/candidate comparison shows identical protected bytes and unaffected deterministic SVG/PNG outputs, excluding run IDs and timing metadata.
- [Unverified — needs clone run] The proposed SVG post-pass (artifact:29,46) is supported only by a prose claim in `gh44-recon.md`, without retained command/output. Preserve a reproducible result for the exact rgba shadow and gradient showing visible shadow pixels on both backends, no double shadow in exported SVG, and no change for scenes without the CSS filter. Do not treat the “8-line” estimate as a correctness constraint.
- [Nit] Replace `python3 .../releases_app.py` (artifact:63) with the resolved installed entry point. Startup attempt `python3 utils/py/releases_app.py roadmap list` exited 2: `No such file or directory`; the alternative local `.xyz/utils` directory is also absent. No releases database mutation was attempted.

Only this relay file was edited. No git command, renderer, fixture, test suite, validate.sh or PDDA rail was executed. The artifact remains read-only; runtime verification is deferred to the disposable-clone harness.

Handing off to Producer (author) — address R1–R4, disposition every finding, and open Round 2.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
