# RELAY · GH-11 plan QA: RAG diagram example
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-09.
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
6. **Commit only the relay file** (`relay(gh11-plan-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `PROJECT/1-INBOX/GH-11-RAG-DIAGRAM-EXAMPLE.md` (capture + plan). Source paths it plans against: `examples/2026-10-08-solar-system/render-diagram.mjs`, `examples/2026-10-08-solar-system/fixture.json`, `examples/2026-10-08-solar-system/runtime/SOURCE.json`, `examples/2026-10-08-solar-system/README.md`, `tools/spike/render.mjs`, `test-budget.json`, `AGENTS.md`, `GUIDING-PRINCIPLES.md`.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-09
- Definition of Done: the plan satisfies issue #11 (https://github.com/HiQS-Labs/XYZ-layout-engine/issues/11): a second published renderer example, a RAG (retrieval-augmented generation) pipeline diagram with ingest and query flows, built from a fixture through the existing GH-1 render functions, reusing the Solar System example's pinned runtime, with hand-authored SVG art, no engine change, no new test/CI/dependency, and a falsifiable verification plan.

## QA brief (read before reviewing)

This is plan QA, before any code is written. Operational envelope: a documentation example of roughly 300 lines of plain .mjs plus a JSON fixture, run on one developer machine. Grade against issue #11 and commensurate complexity. Do not ask for a test suite, CI, cross-platform goldens, or a shared runtime refactor (GH-5 owns that).

Read the plan in full and the Setup source paths. You may run narrow read-only probes under `.relay-scratch/` or `$TMPDIR`. Do not run the renderer, tests or gates here.

Questions:
1. Grounding: are the recon claims true? Specifically: does `render-diagram.mjs` import its render functions from `./runtime/tools/spike/render.mjs` and Playwright from `./runtime/node_modules`, so a new folder can import them by relative path `../2026-10-08-solar-system/runtime/...` without a code change to that runtime? Does `SPIKE_LIBRARY_ONLY` need to be set by the importer?
2. Does reusing the Solar System runtime by relative import beat copying it, given the stated coupling limit? Is a better existing mechanism missed?
3. Are requirements 1-5 sufficient to answer "diagram of how a RAG system works"? Is anything essential to how RAG works missing from the scene (for example the source-grounding or citation loop), or is anything padding?
4. Are the verification steps falsifiable? Can the assertions pass vacuously (zero image nodes, empty text list)? Is the red control (overflowing label box) enough to prove the checks bite?
5. Does the plan stay inside non-goals: no change to `tools/spike/**`, `test-budget.json`, `package.json`, no new test file? Does anything in the plan count as a test file under the ratchet rules in `test-budget.json`?
6. Is the rating rationale (30/10/50/80) grounded, appeal neutral, and the rollback honest?
7. Is the answer to the skill-file question in the issue ("no skill packages the spike") true against the repo, and does the plan avoid claiming GH-5 tracks a skill? Cite what you checked.

Output: graded findings with citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, and `swept file: yes|no`. Set STATUS Approved only if nothing blocking remains. Hand off to claude-a if changes are requested.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1 · codex

VERDICT: FAIL
Basis: The bounded example scope is sound, but the plan omits a required import guard and leaves verification coverage under-specified. Resolve S1–S2 before approval; no engine refactor or added suite is requested.
swept file: yes

Read the entire GH-11 plan and every Setup source, including the full renderer and the pinned-runtime differences. Pre-existing verification gaps are included in S2; no additional material defect found within this review's bounded scope. SWE review mode applied. Graph inventory pagination covered all 82 projects and contained no matching checkout, so generation/coverage verification is unavailable; exact source reads were used. README.md and the roadmap CLI named by ROUTER.md are absent here. The live issue could not be fetched (`gh api repos/HiQS-Labs/XYZ-layout-engine/issues/11 --jq "{title,body,state}"`, exit 1: `error connecting to api.github.com`; web fetch also failed); issue conformance is assessed against the supplied Definition of Done.

- [Should] **S1 — Specify safe library initialization.** `PROJECT/1-INBOX/GH-11-RAG-DIAGRAM-EXAMPLE.md:37` says relative import but does not require the importer to suppress the spike experiment. The working example sets `process.env.SPIKE_LIBRARY_ONLY='1'` **before an awaited dynamic import** (`examples/2026-10-08-solar-system/render-diagram.mjs:6`–`:8`). A static import is evaluated before the importing module's assignments. Fix: explicitly require that ordering, the sibling runtime Playwright import, `loadSatori()` before rendering, and font reads from the sibling runtime assets. Keep the runtime unchanged.
  Observed input: `examples/2026-10-08-solar-system/runtime/tools/spike/render.mjs:547`: `if (process.env.SPIKE_LIBRARY_ONLY !== '1') main().catch(...)`; main creates experiment output and reads spike fixtures at `:284`–`:288`. The GH-11 requirements do not constrain that environment value or import ordering.
  Affected scope: initial loading of this pinned module by the new example only.
  Falsifier: in a disposable clone, load the new importer with the variable initially unset; the example must render while creating no runtime experiment output. A source change eliminating automatic main would make the guard unnecessary, but is expressly outside this plan.

- [Should] **S2 — Make coverage and both-backend bounds explicit.** Requirement 3 (`PROJECT/1-INBOX/GH-11-RAG-DIAGRAM-EXAMPLE.md:37`) needs expected, nonempty stage/icon/text IDs rather than checks solely over whatever the renderer collected. The existing sweep iterates `texts` (`examples/2026-10-08-solar-system/render-diagram.mjs:122`) and checks Satori canvas coordinates plus Chromium scroll metrics (`:125`), omitting Chromium canvas containment. Missing label bounds also skip overlap checks (`:130`). Fix: name required stages for both flows; assert their icon IDs and the expected text/label IDs are present, unique and nonempty, require finite positive geometry in both backends, and check canvas bounds in both. Require label bounds before comparing overlap. A fixed semantic expected set is enough; no test file is needed. Check both PNG dimensions. Keep the overflow red control, but require its named label and nonzero exit in the recorded evidence; it demonstrates overflow detection, not completeness.
  Observed input: the exact existing check block, with `texts=[]`, returns `[]`; with the committed title metrics but Chromium `title.x=2410` on a 2400-wide canvas, it also returns `[]`. Probe below exited 0 and printed `empty textIds: []`, `Chromium title.x=2410: []`, `fixture images=11; textIds=34`. The existing fixed 11-image assertion at `:135` prevents zero icons in the Solar System example; GH-11 must retain an equivalent non-vacuous expectation instead of accepting zero stages/zero icons together.
  Affected scope: the new example's own assertions over its declared stages, text and label geometry; no change requested to the Solar System example or shared runtime.
  Falsifier: a clone run with all required IDs and valid geometry passes; deleting one required text/icon or moving only Chromium text beyond the canvas must fail by ID. If those inputs are already rejected by the new checks, no further mechanism is needed.

  Read-only probe command (no renderer or executable fixture was run):
  ```sh
  export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"
  node --input-type=module <<'NODE'
  import fs from 'node:fs';
  const root='examples/2026-10-08-solar-system/';
  const source=fs.readFileSync(root+'render-diagram.mjs','utf8');
  const evidence=JSON.parse(fs.readFileSync(root+'verification.json','utf8'));
  const checks=source.slice(source.indexOf('const findings=[];'),source.indexOf('assert.equal(result.png.readUInt32BE(16),W);'));
  const check=new Function('texts','result','chromiumResult','W','H',checks+'\nreturn findings;');
  const result={textBoxes:evidence.satoriBounds,bounds:evidence.satoriBounds};
  const chromiumResult={textBoxes:structuredClone(evidence.chromiumText)};
  console.log('empty textIds:',JSON.stringify(check([],result,chromiumResult,evidence.width,evidence.height)));
  chromiumResult.textBoxes.title.x=evidence.width+10;
  console.log('Chromium title.x='+chromiumResult.textBoxes.title.x+':',JSON.stringify(check(['title'],result,chromiumResult,evidence.width,evidence.height)));
  console.log('fixture images='+evidence.imageNodes.length+'; textIds='+evidence.textIds.length);
  NODE
  ```

- [Pass] **Runtime reuse and scope.** Existing imports are exactly `./runtime/tools/spike/render.mjs` and `./runtime/node_modules/playwright/index.mjs` (`examples/2026-10-08-solar-system/render-diagram.mjs:7`–`:8`); sibling-relative paths need no runtime edit. SOURCE.json `:3`, `:15` records the pin and adaptation; pinned render.mjs `:553` exports the functions, whereas `tools/spike/render.mjs:547` unconditionally starts main and has no exports. Reuse beats another copy given the explicit GH-5 revisit limit (plan `:51`; GH-5 `:41`). `du -sk examples/2026-10-08-solar-system/runtime` exited 0 with `896`. No better shared operation was found in the named source scope. Keep the no-engine-change boundary.

- [Pass] **Required RAG scene, art and ratchet.** Plan `:35` includes both flows, the shared store and a grounded answer with citations; `:36` requires separate hand-authored SVG icons. The existing SVG fallback is at `tools/spike/assets.mjs:16`–`:24`. Plan `:43` excludes runtime/package/budget/tests/CI changes. `tools/spike/test/run.mjs:23`–`:30` counts files in test directories or with test/spec suffixes, so the specified example `render-diagram.mjs`, fixture and inline assertions do not add a test file under the ratchet (`test-budget.json:7`). Keep this small example mechanism.

- [Nit] **Make the educational grounding concrete.** Plan `:35`: state that retrieved chunks carry source IDs into the augmented prompt, together with the original question, and that the answer's citations refer to those sources. This is one label/arrow clarification, not a live retrieval implementation or citation-validation service.

- [Nit] **Qualify the skill inventory and add complete setup instructions.** No SKILL.md was present in this checkout: `rg --files --hidden --no-ignore -g "SKILL.md" -g "!.git" -g "!node_modules" -g "!.relay-scratch"` exited 1 with no output; `.xyz/` is absent here, so plan `:30`'s positive claim about its installed contents was not substantiated. Say no repo skill was found in the inspected checkout and distinguish external installed skills. GH-5 `:41`, `:48` concerns a reusable operation and documented render path, not a skill. For plan `:56`, give explicit directory changes back to the new example and the pinned runtime's Chromium installation command if absent; `pnpm install` alone does not establish browser availability.

- [Pass] **Ratings and reversal.** Plan `:77` labels severity as a documentation example, priority as no blocked work, appeal as neutral and effort as patterned work; these are provisional judgments, not measurements. `:16`, `:52` make rollback Easy and local to the new folder/changelog entry. Keep those limits.

- [Unverified — needs clone run] No renderer, test suite or PDDA gate ran in this reviewer worktree. Green outputs, the named overflow failure, no unintended experiment output and unchanged budget remain implementation-time clone checks (plan `:56`–`:59`). Agent PNG inspection and pending human review are separated at `:49`.

Handing off to Producer (claude-a) — disposition S1–S2, tighten the plan, and open Round 2; go to the Producer window and say 'take your turn'.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
