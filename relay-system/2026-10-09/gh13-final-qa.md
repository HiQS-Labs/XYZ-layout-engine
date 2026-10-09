# RELAY · GH-13 final QA: design-diagram skill
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-09.
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
6. **Commit only the relay file** (`relay(gh13-final-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: the committed implementation on branch feat/diagram-design-skill (diff main to HEAD): `skills/design-diagram/SKILL.md`, `CHANGELOG.md`, `PROJECT/1-INBOX/GH-13-DIAGRAM-DESIGN-SKILL.md`, `relay-system/2026-10-09/gh13-plan-qa.md`. Context: `examples/2026-10-09-rag-system/render-diagram.mjs`, `examples/2026-10-09-rag-system/fixture.json`, `examples/2026-10-09-rag-system/README.md`, `examples/2026-10-08-solar-system/generate-assets.py`, `examples/2026-10-08-solar-system/render-diagram.mjs`, `PROJECT/1-INBOX/GH-5-MVP-FOUNDATION.md`, `tools/spike/assets.mjs`, `test-budget.json`, `AGENTS.md`, `GUIDING-PRINCIPLES.md`.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-09
- Definition of Done: issue #13 (https://github.com/HiQS-Labs/XYZ-layout-engine/issues/13) is satisfied exactly as the approved plan states (requirements 1-6): a design-diagram skill pointing at the RAG example with evidenced traps, hand-drawn SVG default, operator-requested install only, changelog entry; no scaffolder, dependency, test, workflow or engine change.

## QA brief (read before reviewing)

This is final QA of a finished, committed change. Operational envelope: one Markdown skill file (51 lines) for a local single-developer repo. Grade against issue #13, the approved plan and commensurate complexity. Do not ask for a scaffolder, tests, CI, or a shared runtime refactor.

Read the diff and the context files in full. You may run narrow read-only probes under `.relay-scratch/` or `$TMPDIR`; do not run renderers, tests or gates (the Producer's evidence is in the plan's Evidence section).

Questions:
1. Map plan requirements 1-6 to `skills/design-diagram/SKILL.md` lines. Anything missing or padded?
2. Truth check against the RAG example: do the claims in procedure steps 2 to 8 match `examples/2026-10-09-rag-system/render-diagram.mjs` (the `REQUIRED` set, `icons` object, lane keys `ingest`/`store`/`query`, `expectedText`, `assert.equal(found.length,10)`, footer rule at `H - 160` and footer block at `H - 132`, fixture keys read by name, `fixture.sources` unused, `source_note` string)? Quote any mismatch.
3. Do the seven trap rows' evidence pointers resolve to what they claim (the cited files, sections and line numbers)? Is any trap overclaimed beyond what the evidence shows (traps 4, 5 and 6 are labelled working patterns or build observations)?
4. Do the CHANGELOG entry and the plan's Evidence table claim only what was shown (path probe counts, three falsifiers, cold run PASS and three red controls, eight gaps found and fixed, not re-run cold)? Any overclaim?
5. Install section: is it safe and consistent with "does not install itself"?
6. Does the diff touch `tools/spike/**`, `package.json`, `test-budget.json`, add a test, workflow or dependency, or any accidental file?
7. Does the skill contradict `AGENTS.md`, `GUIDING-PRINCIPLES.md` or the repo's PR base (`main`)?

Output: graded findings with citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, and `swept file: yes|no`. Set STATUS Approved only if nothing blocking remains. Hand off to claude-a if changes are requested.

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
Basis: The procedure is grounded and proportionate, but step 5 omits the approved plan's explicit resolve-image routing for paid artwork. One small documentation correction is requested; no renderer, scaffolder, dependency, test or workflow change. Reversibility: Easy. The bet is that naming the required skill removes a forced workflow guess; the failure mode is a cold agent treating the example generator as the complete paid-generation instruction.
swept file: yes

- [Should] **R1 — Name resolve-image in the paid-art branch.** `PROJECT/1-INBOX/GH-13-DIAGRAM-DESIGN-SKILL.md:38` requires “paid generation through resolve-image only when the operator asks”; live issue #13 likewise names resolve-image. `skills/design-diagram/SKILL.md:25` says only “Use paid image generation only when the operator asks. Then follow … generate-assets.py”. That script reads `HIQS_CHAIN_CALLER` (`examples/2026-10-08-solar-system/generate-assets.py:4`–5, :27); it does not tell the reader to load the resolve-image instructions. Minimal fix: explicitly direct the agent to use resolve-image when paid art is requested, retaining the Solar System receipt/check pointers. No expansion of the paid-art workflow is needed.
  Observed input: Skill line 25 is the entire paid-art instruction; the literal `resolve-image` occurs zero times in the skill, whereas plan requirement 4 names it.
  Affected scope: Only the operator-requested paid-generation branch; hand-authored SVG remains the default.
  Falsifier: A cold reader given only the skill and “use paid generated art” should be explicitly directed to resolve-image without inferring it from the generator or external context; a request without paid art should remain on the SVG branch. A direct resolve-image instruction in the current skill would invalidate this finding.
- [Nit] **R2 — Call icon values SVG markup strings.** Skill line 25 says “one path string per stage … as in the example”, but the RAG `icons` values include `<rect>`, `<ellipse>` and `<circle>` as well as `<path>` (`examples/2026-10-09-rag-system/render-diagram.mjs:30`–41). Replace “path string” with “SVG markup string”; the 96×96, stroke-only and stage-key claims are correct (:28–29, :43, :60).
- [Pass] **Requirements 1–6 mapped.** Requirement 1 is covered by skill lines 1–4, 10–31 and 49–51; requirement 2 by :8, :14 and :22; requirement 3 by :33–43; requirement 4 by :25 except R1; requirement 5 by :45–47; requirement 6 by `CHANGELOG.md:3`–7. Installation is explicitly on request, preserves a different existing entry, uses the maintained clone and reads back through the link (:47). The procedure retains existing backend ownership, explicit uploads and the test ratchet (:24–25, :30), consistent with `GUIDING-PRINCIPLES.md` principles 2–6 and `AGENTS.md` Engineering standards. No additional pre-existing defects were identified in the four artifact files after the full sweep, beyond R1–R2.
- [Pass] **RAG adaptation instructions match the source.** Required stages and uniqueness are at `examples/2026-10-09-rag-system/render-diagram.mjs:24`–26; icon lookup at :31–43; lane geometry and lane-dependent scene construction at :46–115; named panel and edge reads at :91–115; the hard-coded source string at :123; `expectedText` at :144 and icon count at :171. `fixture.sources` appears only in `fixture.json:54`–56, with no read in the entire 184-line script. Footer values 1500 and 1528 (:116–117), against height 1660 (`fixture.json:6`), give the prescribed H−160 and H−132. The guard/import order (:8–12), load/render sequence (:127–136), named geometry findings (:138–168) and early missing-icon assertion (:43) support steps 2–8, subject to R2's terminology correction.
- [Pass] **All seven trap pointers resolve with the stated evidence limits.** Trap 1: RAG :8–12 and pinned runtime `examples/2026-10-08-solar-system/runtime/tools/spike/render.mjs:547`. Trap 2: `tools/spike/assets.mjs:4` and `PROJECT/1-INBOX/GH-5-MVP-FOUNDATION.md:33`, :44. Trap 3: `CHANGELOG.md:23`. Traps 4–5: RAG :59–64 and :111 support the working constructions; they do not independently reproduce the reported alignment incident. Trap 6: RAG README :29–33 explicitly limits the geometry checks, and skill :42 discloses that the two build incidents are not otherwise recorded. Trap 7: RAG writes outputs at :175–182 before asserting findings at :183; early assertions can still exit before writing. The rerun-green instruction is appropriate. No universal renderer defect is established or required.
- [Pass] **Evidence wording is bounded.** `CHANGELOG.md:7` and plan :82–90 consistently report the original cold-run PASS, three named red controls and eight corrected gaps, explicitly saying the fixed skill was not cold-run again and raw outputs were not retained. The eight topics are now addressed at skill :22–28. This is a source-consistency finding, not independent validation of the historical execution. The plan relay is Approved at `relay-system/2026-10-09/gh13-plan-qa.md:117`–127, with the attestation at :130–136.
- [Pass] **Narrow static probe.** After `export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"`, command `python3 -` with the following read-only stdin exited 0; decisive output was `existing input occurrences: 23`, `unique inputs: 15`, `missing: []`, `footer offsets: 160 132`, `resolve-image named: False`. This corroborates the 23 input-reference occurrences, not 23 distinct paths, and does not execute the producer's discarded checker or its falsifiers.

  ```python
  from pathlib import Path
  import re
  s = Path("skills/design-diagram/SKILL.md").read_text()
  refs = re.findall(r"`([^`\n]+)`", s)
  inputs = [r for r in refs if (r.startswith(("examples/", "tools/", "PROJECT/"))
            or r in ("CHANGELOG.md", "test-budget.json")) and "<" not in r and "*" not in r]
  print("existing input occurrences:", len(inputs))
  print("unique inputs:", len(set(inputs)))
  print("missing:", [p for p in inputs if not Path(p).exists()])
  print("footer offsets:", 1660-1500, 1660-1528)
  print("resolve-image named:", "resolve-image" in s)
  ```

- [Unverified — needs clone run] No renderer, executable fixture, test or gate was run. Historical cold-run/red-control results and command execution remain producer evidence. Full reads covered the four artifact files and every Setup context file, plus the Solar System README and the cited pinned-runtime guard. The seeded checkout lacks root `README.md` and both roadmap CLI paths (read-only `Path.exists()` probe exited 0 with all three `False`), preventing those startup steps. Graph `list_projects(limit=100)` returned all 82 projects, `has_more:false`, with no matching checkout or XYZ Layout Engine index; no applicable generation/coverage result exists, so exact source reads supplied the evidence. Live issue #13 was fetched through the GitHub connector and matches the local requirements. GitHub `compare_commits(base="main", head="feat/diagram-design-skill", repo_full_name="HiQS-Labs/XYZ-layout-engine")` returned HTTP 404; no diff was seeded. Consequently the complete main-to-HEAD file inventory, absence of accidental changes and PR-base ancestry are unverified here. No git command was run; the harness owns diff/containment and clone gates.

Handing off to claude-a (Producer) — address R1 and disposition R2, then take the next turn. Only this relay file was edited; the harness owns the file-scoped commit.

### Producer · Round 1 → 2 (claude-a)

- **R1 [Should] — Implemented.** Step 5 now says to use the resolve-image skill (load it and follow its recipe) for paid art, then follow the Solar System generator and receipt checks. SVG stays the default.
- **R2 [Nit] — Implemented.** "path string" is now "SVG markup string (paths, rects, ellipses and circles are all used)".
- **Wording (from your probe note) — Implemented.** The CHANGELOG and plan Evidence table now say "23 existing input references (bare filenames included)", not "paths", since your unique-path count differs by filter.
- **[Unverified — no citation] findings — acknowledged.**

Handing off to codex (Reviewer) for round 2.

### Reviewer · Round 2

VERDICT: PASS
Basis: R1 and R2 are resolved. The full artifact sweep found no additional pre-existing defects or blocking findings. Requirements 1–6 remain covered without expanding the implementation. Reversibility: Easy. The bet is that the explicit paid-art routing removes the remaining forced guess; the failure mode remains future drift between the skill and its example. Approval covers the seeded documentation; execution and branch-inventory limits below remain for the harness.
swept file: yes

- [Pass] **R1 and R2 closed.** `skills/design-diagram/SKILL.md:25` now says “use the resolve-image skill (load it and follow its recipe)” only when the operator requests paid generation, and calls icon values “SVG markup string”. This satisfies plan requirement 4 (`PROJECT/1-INBOX/GH-13-DIAGRAM-DESIGN-SKILL.md:38`) and matches the mixed SVG elements at `examples/2026-10-09-rag-system/render-diagram.mjs:30`–41. The default remains hand-drawn SVG, separate image nodes and no silent upload. The receipt pointers remain accurate: Solar System `generate-assets.py:20`–35 and `render-diagram.mjs:25`–35.
- [Pass] **Requirements and governance mapped again.** Requirement 1 maps to skill :1–4, :10–31 and :49–51; requirement 2 to :8, :14 and :22; requirement 3 to :33–43; requirement 4 to :25; requirement 5 to :45–47; requirement 6 to `CHANGELOG.md:3`–7. Skill :47 explicitly preserves a different existing install entry, uses the maintained clone only on request, and reads back through the link. Skill :24–25 and :30 retain shared renderer ownership, explicit upload policy and the test ratchet, consistent with `GUIDING-PRINCIPLES.md` principles 2–6 and `AGENTS.md` Engineering standards. No added procedure or requirement padding was identified.
- [Pass] **RAG truth check and all seven trap pointers still hold.** Source anchors: required stages/uniqueness (:24–26), icons (:28–43), structural lanes and named fixture reads (:46–115), footer (:116–123), load/render sequence (:127–136), expected text (:144), icon count (:171), outputs before final findings assertion (:175–183), all in `examples/2026-10-09-rag-system/render-diagram.mjs`. With fixture height 1660 (`fixture.json:6`), footer coordinates 1500/1528 give H−160/H−132. The full script never reads `fixture.sources`; `source_note` is a literal at :123. Trap 1's runtime guard exists at `examples/2026-10-08-solar-system/runtime/tools/spike/render.mjs:547`; trap 2 is supported by `tools/spike/assets.mjs:4` and GH-5's asset-path item; trap 3 by `CHANGELOG.md:23`. Traps 4–5 point to the working card/flex constructions at RAG :59–64 and :111. Trap 6 explicitly discloses the unretained build observations and cites the RAG README's “What the checks prove” limits. Trap 7 correctly motivates rerunning green; early assertions can still fail before writing. No mismatch requiring correction found.
- [Pass] **Evidence wording stays bounded.** `CHANGELOG.md:7` and plan :82–90 now say input “references”, retain the three path falsifiers and three named render red controls, and expressly state that the eight fixes were not cold-run again and raw outputs were not retained. The plan approval/attestation remains at `relay-system/2026-10-09/gh13-plan-qa.md:117`–136. These are consistent historical reports, not newly reproduced execution results.
- [Pass] **Read-only static probe.** After `export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"` and `mkdir -p "$TMPDIR"`, command `python3 - <<'PY' > .relay-scratch/r2-static.txt` with the following stdin exited 0. Decisive output: `existing input occurrences: 23`, `unique inputs: 15`, `missing: []`, `resolve-image instruction: True`, `SVG markup wording: True`. This corroborates reference occurrences and the literal corrections at skill :25; it does not rerun the discarded acceptance checker.

  ```python
  from pathlib import Path
  import re
  s=Path('skills/design-diagram/SKILL.md').read_text()
  refs=re.findall(r'`([^`\n]+)`',s)
  inputs=[r for r in refs if (r.startswith(('examples/','tools/','PROJECT/')) or r in ('CHANGELOG.md','test-budget.json')) and '<' not in r and '*' not in r]
  print('existing input occurrences:',len(inputs))
  print('unique inputs:',len(set(inputs)))
  print('missing:',[p for p in inputs if not Path(p).exists()])
  print('resolve-image instruction:', 'use the resolve-image skill (load it and follow its recipe)' in s)
  print('SVG markup wording:', 'one SVG markup string per stage' in s)
  print('startup paths:',{p:Path(p).exists() for p in ['README.md','utils/py/releases_app.py','.xyz/utils/py/releases_app.py']})
  ```

- [Unverified — needs clone run] No renderer, fixture, test or gate executed. Full reads covered all four artifact files and every Setup context file, plus the Solar System README and cited runtime guard. The probe above also printed all three startup paths `False`, so root README/roadmap startup steps remain unavailable. Verify-tier review fell back to exact source: graph `list_projects(limit=100)` returned 82 projects with `has_more:false`, none matching this checkout or XYZ Layout Engine; there is no applicable generation or coverage result. No main-to-HEAD diff is seeded, and no git command was run. Complete changed-file inventory, absence of accidental runtime/dependency/test/workflow changes, and PR-base ancestry therefore remain unverified here, as in round 1. The harness owns containment, diff and clone gates. No fresh live-issue verification is claimed.

Relay closed (Approved), no further turn needed. Token completion returns control to Producer claude-a and the harness. Only this relay file was edited; scratch probe output stays in `.relay-scratch/`. The harness owns the file-scoped commit.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
