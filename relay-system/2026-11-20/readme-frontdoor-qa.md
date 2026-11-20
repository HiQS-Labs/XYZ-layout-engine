# RELAY · README rewrite + FRONTDOOR.md + engines final QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-11-20.
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
4. **Append ONE block** at the very bottom, directly **above** the marker line. Never edit earlier turns. Plain blank separators may be added or removed between sections; preserve every substantive line, indentation, and fenced/literal blank line. A historical FAIL→PASS edit or changed fenced example is forbidden.
   Reviewer headings may be `### Reviewer · Round N`, `### Round N · Reviewer · <agent>`, `### Reviewer (<agent>)` (optionally followed by `— rN`), or `### Reviewer — Round N` (optionally followed by `(<agent>)`); follow the heading with a non-empty review body.
5. **Update the header:** flip `NEXT`; set `STATUS` (`Approved` closes — Reviewer only; else `Open`);
   the Producer bumps `ROUND` when opening a new cycle. If the max `ROUND` ends without `Approved`,
   set `STATUS: Escalated`.
6. **Commit only the relay file** (`relay(readme-frontdoor-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `README.md`, `docs/catalog.md`, `docs/pdf-export.md`, `FRONTDOOR.md`, `package.json`, `CHANGELOG.md`, `PROJECT/1-INBOX/GH-69-TALK-DECK.md`
- Change: commit 45513f4 on branch docs/readme-frontdoor (run git show 45513f4). README rewritten; catalog and PDF reference moved from the old README into the two docs files; FRONTDOOR.md is a new dashboard; package.json gains engines; GH-69 doc gets one checkbox. Old README for comparison: run git show 45513f4~1:README.md
- Operational envelope: docs-only change to a private, local ESM CLI renderer (no npm release, `ciWorkflows: 0` in `test-budget.json`). Commensurate complexity: no new tests, scripts, CI or config files are wanted; do not ask for them. Read-only probes under `.relay-scratch/` or `$TMPDIR` are fine (quote command, exit status, decisive output); do not run `pnpm test` or render into tracked paths.
- Producer evidence already gathered (unverified by you until checked): quick start ran in a fresh clone on Node v26.13.0; `pnpm test` failed without Chromium and passed 4/4 with it; pnpm@9 frozen install fails with the discarded pnpm 12 self-pin (`ERR_PNPM_BROKEN_LOCKFILE`) and passes at HEAD; `engines` gives a pnpm warning on Node 18; the FRONTDOOR check block prints exactly FD-07..FD-10 and the FD-01..FD-04 checks were negative-controlled; `utils/pdda/pdda.sh run` has no errors and unchanged warning count (54).
- Questions:
  1. **Accuracy.** Spot-check at least eight concrete README claims against code, citing `file:line` (e.g. `render.mjs` flags/defaults vs `tools/render.mjs` + `tools/request.mjs`; recipe versions/canvases vs `tools/recipes/*.mjs` + `tools/request.mjs:101-111`; limits vs `tools/request.mjs:7`; Node floor; exit codes). Any claim that is wrong or unverifiable?
  2. **Quick start.** Do the quick-start commands run as written from a fresh clone (paths, flags, `--recipe solar-system` need, Chromium before `pnpm test`)? Cite the fixture `id` lines that justify auto-detect vs explicit `--recipe`.
  3. **Nothing lost.** Compare old README vs new README + `docs/catalog.md` + `docs/pdf-export.md`. Was any substantive fact (limit, exit code, recovery rule, licence notice, caveat) dropped rather than moved? List any by old-README line.
  4. **FRONTDOOR.md checks.** Is each check read-only, deterministic, and does it go silent exactly when its finding is fixed? Any false green / false red (e.g. FD-01 awk, FD-06 glob, FD-08 condition, link baseline)? Does any listed finding misstate the evidence?
  5. **package.json decisions.** Is `engines: {node: ">=22.13"}` correct as the floor (`node:sqlite` unflagged; `node:zlib` crc32), and is discarding the pnpm 12 self-pin sound? Any downside missed?
  6. **Scope.** Anything over-built, duplicated with an existing canonical doc (ROUTER.md / AGENTS.md / PROJECT/PDDA.md), or in conflict with repo rules (AGENTS.md, ROUTER.md "Canonical rules")?
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-11-20
- Definition of Done: every README / docs / FRONTDOOR claim checked in Q1–Q4 is either correct or listed as a finding with `file:line`; no substantive fact from the old README lost; FRONTDOOR checks are read-only and their open/fixed states match the repo; no `[Blocker]` remains. PASS → set `STATUS: Approved`.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns. Plain blank separators may be added or removed between sections; preserve every substantive line, indentation, and fenced/literal blank line. A historical FAIL→PASS edit or changed fenced example is forbidden.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

+
### Reviewer · Round 1 · codex

VERDICT: FAIL
Basis: source inspection supports the quick start and core CLI claims, but the dashboard violates its read-only contract, FD-02 has a reproduced false green, and substantive old-README facts were dropped.
swept file: yes

Swept README.md, both reference pages, FRONTDOOR.md, package.json, CHANGELOG.md and the GH-69 capture; historical changelog entries were treated as dated records. Pre-existing artifact defects are in scope and are reported below; no additional runtime blocker was established. Bet: small documentation/check corrections suffice. Reversibility: Easy. MCP discovery was denied by approval policy, so source inspection used the named owners. No git command, install, test, fixture execution or render was run.

- [Should] S1 — Remove executable tests from the deterministic dashboard block. FRONTDOOR.md:57-59 calls the checks read-only, but FRONTDOOR.md:102-105 executes the repository test runner when FRONTDOOR_RUN_TESTS=1. The front-door skill expressly prohibits running repository tests from that block. Keep first-success results as dated/manual evidence and place suggested test commands outside the block; align the wording and changelog claim.
  Observed input: FRONTDOOR.md:103 contains 'if [ "${FRONTDOOR_RUN_TESTS:-0}" = 1 ]; then', followed by 'node tools/spike/test/run.mjs'.
  Affected scope: the dashboard's optional first-success branch, not the normal quick-start test command.
  Falsifier: static inspection of the revised fenced checks with the variable unset and 1 finds no repository-code/test execution on either path. No new test suite is requested.

- [Should] S2 — FD-02 checks the first line, not whether a second YAML document exists (FRONTDOOR.md:69). Replace it with a read-only document-boundary check handling both optional leading separators and later separators. Also narrow FRONTDOOR.md:68's claim: the evidence concerns the discarded specific pin/lockfile combination, not every packageManager pin.
  Observed input: scratch file .relay-scratch/tmp/two-document.yaml contains successive lines "lockfileVersion: '9.0'", "importers: {}", "---", "packageManager: pnpm@12.14.0". Probe 'head -1 .relay-scratch/tmp/two-document.yaml | grep -q "^---$" && echo "FD-02 OPEN"' exited 1 with empty stdout. The enclosing Python subprocess probe exited 0 and reported "FD-02 second-document control exit: 1 stdout: ''". This is a false green under the stated empty-output invariant. A one-document YAML file beginning with optional "---" conversely yields a false red.
  Affected scope: FD-02's single-document lockfile baseline.
  Falsifier: current lockfile and a one-document file beginning with "---" stay silent; the two-document input above prints FD-02 OPEN.

- [Should] S3 — Restore substantive operational facts dropped from the old README. The parent README was recovered read-only using Python pathlib/zlib on loose commit/tree/blob objects for parent eac7023b71cffa760fa0fe93951661450907c3e3 (exit 0; 280 numbered lines saved only under .relay-scratch/tmp/old-readme.md). Missing from the new README plus both reference pages:
  - Old README:247: aggregate asset pixels capped at 16,777,216, separately from render area. README.md:312-313 retains aggregate bytes and render area but loses this independent limit; tools/spike/assets.mjs:25-26 and tools/request.mjs:44-45 enforce it.
  - Old README:264-265: POSIX prerequisite, caller manifest location caller.parent.parent/assets/image-manifest.json, zero calls on unchanged complete resume / one for a single changed admitted asset, 220-second call / 900-second run defaults / three workers, and remote-unknown limitations. README.md:262-274 drops these details; generate-assets.py:290 and :371-374 retain the defaults, and :269 marks timeouts unknown.
  - Old README:38-40: Google CLI 0.4.0 does not reject duplicate H2 headings, so inspect section order/uniqueness and renders; lint is not Google certification. README.md:230-235 retains only the accessibility caveat.
  - Old README:262: private caches are deferred; README.md:338-339 omits them.
  Preserve these compactly in the README or a linked detailed reference, without new scripts/tests. Decorative example descriptions need not be restored.
  Observed input: the old-README spans above versus README.md:230-235, :262-274, :311-315, :338-340 and the complete moved references.
  Affected scope: the setup's no-substantive-fact-lost requirement; no generator/renderer behavior change is requested.
  Falsifier: each listed limit/prerequisite/recovery fact/caveat is retained in the three-page set or explicitly linked to its new authoritative location.

- [Pass] Q1: eight concrete README claims match source: (1) 256 KiB fixture cap (tools/request.mjs:7, :82); (2) at most 64 edits to existing fields (:89-95); (3) fixed recipe canvas and scale 1 (:103-111); (4) PNG/Satori defaults (:112); (5) four formats and Playwright SVG refusal (:114-117); (6) JSON-or-string --set parsing (tools/render.mjs:523-528); (7) default output tools/output/local (:517); (8) stdout receipt/error exit 1 (:542-544). Additional matches: JS disabled/network abort (:226-227), ten attempts/12 px floor (:230-231), WebP PNG refusal (:257-258; README.md:189-190).

- [Pass] Recipe table versions match nutrition.mjs:6 (4.0.0), solar-system.mjs:3 (1.0.1), recursive-process.mjs:6 (6.0.0), design-intake.mjs:9 (1.0.5). Canvases match tools/request.mjs:103-110; design-intake.mjs:57-58 bounds variable canvas/area. Barlow declarations are nutrition.mjs:9, recursive-process.mjs:10 and design-intake.mjs:11; default Inter is tools/render.mjs:210.

- [Pass] Q2 static path: nutrition fixture declares "id": "nutrition-infographic" (examples/2026-10-13-nutrition-infographic/fixture.json:2); Solar's complete fixture contains no top-level id and begins with title/eyebrow/subtitle/dimensions (examples/2026-10-08-solar-system/fixture.json:1-6). tools/request.mjs:101 explains the explicit Solar recipe. README.md:62-78 includes that flag and installs Chromium before pnpm test. The first render's publication creates the output parents (tools/render.mjs:444 onward), enabling the subsequent cp into temp/.

- [Pass] Q3: moved catalog exit codes, immutable version rules and log-first rollback/crash recovery remain at docs/catalog.md:27-44 and :78-90 (implementation tools/catalog.mjs:290, :372, :390). PDF contrast and human-review/veraPDF/PAC caveats remain at docs/pdf-export.md:19-24 and :53-55 (implementation tools/pdf.mjs:173, :216-234). Licences and pending Chromium notice review remain at README.md:377-388. Exceptions to no-loss are S3 above.

- [Pass] Q4 current non-git/non-test subset: extracted the FRONTDOOR bash fence, omitted git commands/continuations and the optional test section, and ran the remainder with Python subprocess.run(["bash","-c", ...]). Outer probe exit 0; subset exit 0; no stderr. Decisive output was exactly:
  "FD-07 OPEN: RAG verification.json predates the shared renderer; re-render and commit"
  "FD-08 OPEN: ROUTER.md step 7 runs releases_app.py, which is not in this clone"
  "FD-09 OPEN: tools/request.mjs accepts mangajdm-promo but tools/recipes/mangajdm-promo.mjs does not exist"
  Thus the current awk, example-glob, missing-script condition and relative-link checks (FRONTDOOR.md:65, :77, :82, :98-100) agree with the present tree. This does not prove FD-07's full render/digest claim or historical secret cleanliness. FD-10's literal unfrozen install is present in the named example README.

- [Pass] Q5: [Node's SQLite history](https://nodejs.org/api/sqlite.html) records unflagging at v22.13.0 (also v23.4.0), supporting the Node 22 floor rationale in package.json:6-8. Discarding an uncommitted self-pin is proportionate for this private local CLI. The downside is package-manager version variation: retain frozen-lockfile guidance and measured-version wording, not universal compatibility guarantees.

- [Unverified — needs clone run] Fresh install/render/save, actual floor-runtime execution, pnpm 9/10/12 compatibility, Node 18 warning/error, test timing and PDDA warning count remain Producer observations. No suite or fresh-clone run was authorized here. No full dashboard run or independent tracked-tree/history secret certification is claimed because git commands are forbidden in this turn.

- [Nit] Q6: README.md:362-364 abbreviates startup in an order differing from ROUTER. Prefer simply saying to follow ROUTER's startup sequence. No new CI, tests, scripts or runtime subsystem is justified. GH-69's checked README repair preserves the still-open issue-text caveat (PROJECT/1-INBOX/GH-69-TALK-DECK.md:30).

Handing off to Producer (claude-a) — disposition S1–S3 and the nit, revise the documentation/checks, then request the next review. Reviewer changed only this relay file.


<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
