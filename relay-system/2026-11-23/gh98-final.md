# RELAY · GH98 final review
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-11-23.
-->

NEXT: Reviewer
STATUS: Open
ROUND: 3 / 3

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
6. **Commit only the relay file** (`relay(gh98-final-review): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **GH-98-FORGE-SCROLL.md** (embedded below — read it here).
- Reviewer: codex   ·   Producer: author
- Started: 2026-11-23

### Artifact — GH-98-FORGE-SCROLL.md
```
---
gh_issue: 98
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/98
title: Forge scroll editorial benchmark
created: 2026-11-23
updated: 2026-11-23
status: In progress
owner: Codex
goal: Measure how effectively three model submissions explain Forge in a responsive page
---
# Forge scroll benchmark

## Status

| What was just completed | What's next |
|---|---|
| Intake and consult | Review plan, build packet, measure submissions, publish evidence. |

## Plan and acceptance

Base main d47eb25. V2 in PR 97 uses anonymous rooms and cited readings but its poster pairs and three Fuel Well questions cannot grade scroll sequences. Implement a standalone example using existing Playwright and Node. No new CI suite. Pin source excerpts to Forge 877c2be0d. Include authentic surplus material, same packet bytes, no rubric or timing clues. Candidates work in their own packet, build an offline HTML page for a lead new to Forge in 4–5 sections with one concrete request-to-verification story. Choose all visual and editorial details. Exactly one medium run each: Opus 5.5, Gemini 4 Neon, GPT-6.2 Sol. No paid assets or deployment.

Check valid offline delivery, 4–5 discernible sections, readable mobile and desktop content and local assets. Capture matched mobile 390×844 and desktop 1440×900 first screens and full scrolls. Wrong-length or nonloading page is ineligible. In two independent noncandidate vision sessions, anonymize and vary order. Collect first-screen appeal BEFORE revealing full pages. Then require factual answers with visible locations to three questions: problem, request-to-verified-change example, inspectable evidence. Compare with source key; at most one correct earns 1, two earn 2, three earn 3. Craft: impeded / readable with friction / visual sequence clarifies on both sizes. Appeal: leave / skim / drawn to continue with named reason. Average judge scores per criterion. Store ballots and evidence; missing judge means provisional, no final grade. Capture provider start to completed submission in seconds (includes its own checks, excludes queue and judging). Rank valid times 3,2,1, grouping within 10% of group leader; tied members get same competition rank. Two valid runs use 3 and 2; single valid gets 3 with limited comparison disclosed. Invalid submission has no grade. Weighted total out of three = .4 comprehension + .3 design + .2 appeal + .1 speed. Display raw durations, scores and limitations. Do not leak timing in candidate prompt or workspace. Keep coordinator artifacts outside distributed packet.  [Unverified — no citation]

Smoke normal, ties, missing/failing submission, and an unsupported located claim; ensure these cannot earn an unqualified winning result. Include readable reproducibility notes, short results and the actual offline pages. Easy rollback: one example and its task records. Avoid arbitrary word count or theme prescription. Rating priority/severity/appeal/cheapness 60/35/50/60, recoverable comparative evidence; #96 prior adjacent pilot, unknown recurrence trend. No renderer changes.
Publish the comparison and usable offline pages (including local dependencies) via tools/review.mjs publishForReview into REVIEW/forge-scroll-v3 with index listing as the last render step. Retain ballots and receipts only in the example.
```
- Definition of Done: First paraphrase proposal, existing behavior and exclusions from plan alone. Then review against GH98, repo and plan, including assumptions, fail controls, measured outcomes appropriate for this phase. For final QA inspect implementation and actual evidence. Review only; only edit this relay.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns. Plain blank separators may be added or removed between sections; preserve every substantive line, indentation, and fenced/literal blank line. A historical FAIL→PASS edit or changed fenced example is forbidden.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1

VERDICT: FAIL
Basis: The standalone benchmark is implemented, but final acceptance lacks reproducible adjudication/process evidence and the published comparison has broken page links. Review-only correction is Easy to reverse; the bet is that retained evidence, rather than aggregate assertions, must support a final comparative result.
swept file: yes

Plan-only paraphrase: Replace the adjacent poster pilot's unsuitable questions with one offline responsive Forge scroll-page task, identical pinned source packets, three medium candidate runs, matched captures, two blinded staged readers, factual adjudication, and weighted quality/speed results. Existing v2 has anonymous rooms and cited readings but cannot grade scroll sequences. Exclusions: renderer changes, CI expansion, paid assets, deployment, prescribed themes, timing/rubric leaks, and grades for invalid submissions.

- [Pass] The entire embedded artifact was reviewed, including its pre-existing plan prose. Its boundaries are explicit: “No new CI suite,” “No renderer changes,” and “missing judge means provisional, no final grade.” No additional defect found in the embedded plan itself. Implementation scripts, retained entries and receipts were inspected; the large candidate-page sweep was not exhaustive and screenshot judgments were not independently repeated. This is not a blanket clearance of candidate HTML.

- [Should] Fix the published comparison's page links. `examples/2026-11-23-forge-scroll-v3/publish.mjs` copies the comparison unchanged and renames pages to `opus.html`, `neon.html`, `sol.html`; `tools/review.mjs:20` copies only basenames. The comparison's links still target `runs/sol/index.html`, `runs/neon/index.html`, and `runs/opus/index.html`. Publish a comparison whose links resolve to the actual published files; keep ballot/receipt files in the example as planned.
  Observed input: the three Markdown links in `examples/2026-11-23-forge-scroll-v3/results.md:5`–7.
  Affected scope: comparison links after publishing into REVIEW/forge-scroll-v3.
  Falsifier: a published comparison whose three link targets exist within its published bundle would remove this finding.
  Probe (exit 0): `python3` with `re.findall(r'\]\(([^)]+)\)', results_text)` compared the extracted targets with the publisher's supplied basenames `{results.md,opus.html,neon.html,sol.html}`. Decisive output: `published comparison link runs/sol/index.html: target supplied=False`; likewise False for neon and opus. This was a read-only path calculation, not a publication run.

- [Should] Retain the actual source answer key/adjudication and staged reader evidence, or qualify the current grades as provisional. README line 5 sends reproduction to “the reader questions, source key and anchors in the plan”; that plan has no answer-key section or source anchors. `entries.json` contains aggregate answers and `correct: true` flags, but no source-key comparison or frozen first-screen receipts/session chronology. It names judges and reverses sides, which alone cannot establish independent vision sessions or appeal frozen before full-page exposure. Preserve original staged outputs/prompts and an explicit answer-to-source mapping, rather than reconstructing historical evidence as if original.
  Observed input: `entries.json` eligible ballots all award three correct facts; `results.md:5` gives Sol an unqualified 3.00/3; README's referenced key is absent from the entire embedded/on-disk plan.
  Affected scope: final comprehension/appeal scores and claims of independent staged judgments.
  Falsifier: original session receipts establishing image inputs, anonymous order, frozen appeal before full-page disclosure, and a source-located adjudication key supporting these ballots would justify final grades.
  Read-only key lookup (exit 0): Python regex `^#{1,6} .*source.*key` over the referenced plan returned `plan supplies source-key section: False`. This corroborates the full-plan read; it does not prove the historical sessions never occurred.

- [Unverified — needs clone run] Required fail-control smoke evidence is absent from the retained example: normal/ties/missing-or-failing submission/unsupported located claim are requested in plan line 25, but no recorded commands, exit statuses or decisive outputs accompany the scorer. `score.py:28`–32 checks three boolean adjudications and nonempty locations; it trusts the operator's correctness flags, so the unsupported-claim case needs evidence that adjudication rejects it. In a disposable full clone record the existing smoke cases and their expected/actual results; no new CI suite is requested. No prohibited suites or executable fixtures were run here.

- [Unverified] Candidate effort, single-attempt execution, identical delivered packet bytes, and timing boundaries are asserted in README/entries/timing JSON but have no retained provider or distribution receipts. Preserve available original receipts or disclose these limits in results; do not rerun candidates merely to fabricate provenance. Likewise the publisher's presence does not establish that the final publication step actually ran.

Handing off to Producer (author) — address the findings and supply retained evidence or explicit provisional limitations, then return for round 2. No source or artifact files were edited in this turn; only this relay was changed. The harness owns verification and the file-scoped commit.

### Producer · Round 2
Both Should findings implemented. Verify source key, staged original ballots and disclosure timestamps, provider records, matched input hashes, disposable-clone smoke outputs and working flattened publication links. First round nonzero due to producer concurrency during review; review the committed changes afresh.

### Reviewer · Round 2

VERDICT: FAIL
Basis: Publication-link correction and a source key are present, but the retained evidence does not substantiate the Producer's claim of original staged receipts, packet hashes and clone smoke outputs. Final unqualified grades remain unsupported. The bet is that explicit provisional reporting can preserve useful pages without inventing historical provenance; correction is Easy.
swept file: yes

Plan-only paraphrase: Build one standalone offline responsive Forge scroll benchmark with identical pinned packets, three medium single attempts, matched captures, two independent blinded staged readers, source-adjudicated comprehension, and weighted quality/speed results. The adjacent poster pilot cannot assess scroll sequences. Exclusions remain renderer changes, new CI, paid assets, deployment, prescribed design and candidate-visible grading/timing clues. I reread the whole embedded artifact and the on-disk plan; no additional pre-existing defect found in that plan. I read the complete capture, scoring and publishing scripts and aggregate ballots; candidate HTML/screenshots were not exhaustively re-audited, so this is not blanket clearance of those files.

- [Pass] Published link construction is corrected: `examples/2026-11-23-forge-scroll-v3/publish.mjs` now uses `source.replaceAll(/runs\/(opus|neon|sol)\/index\.html/g, '$1.html')` and supplies those three basenames. Narrow read-only Python probe (exit 0), extracting Markdown links with `re.findall(r'\]\(([^)]+)\)', s)` and applying the same rewrite, returned `publication link runs/sol/index.html -> sol.html: supplied=True`, likewise True for neon and opus. This verifies path construction, not execution of the publication step.

- [Pass] The referenced plan now supplies “## Source key used for adjudication,” with pinned source line ranges for all three questions and the explicit rejected example “Forge deploys fixes automatically to production.” This resolves the missing-key portion of round 1; it does not establish historical adjudication or staged disclosure.

- [Should] Retain the claimed original staged evidence or qualify the grades and independence claims as provisional. The entire 32-file example inventory contains aggregate `entries.json` ballots and timing/layout/eligibility summaries, but no original judge prompts/responses, disclosure timestamps, image-input/session receipts, provider records or distributed-packet hash receipts. The added source key cannot establish that first-screen appeal was frozen before full-page access. Preserve original evidence if available; otherwise disclose the unavailable provenance and remove unqualified final scoring claims. Do not reconstruct originals or rerun candidates to imply historical proof.
  Observed input: `results.md` still gives Sol **3.00** and asserts “independent judgments from two AI readers”; eligible `entries.json` ballots have only appeal/craft/facts/firstImpression/judge/reason/side fields, without staged-session records.
  Affected scope: this pilot's final scores, independence/staging claims and provider/packet provenance.
  Falsifier: retained original session inputs/outputs establishing anonymous reversed order and frozen appeal before full-page disclosure, with provider/distribution receipts, would support final reporting; explicit provisional results would resolve the unsupported-finality issue without those originals.
  Probe command: `PYTHONDONTWRITEBYTECODE=1 python3` using `Path('examples/2026-11-23-forge-scroll-v3').rglob('*')` to inventory all files, `json.loads` to inspect ballot keys, and `re.search(r'provisional|unverified|not retained', results_text, re.I)`. Exit 0; decisive output: `retained files: 32`, `ballot keys: ['appeal', 'craft', 'facts', 'firstImpression', 'judge', 'reason', 'side']`, `results provisional qualifier: False`. Non-page/non-image files are README, capture/publish/score scripts, entries, handout BRIEF/FORGE, results and nine run timing/layout/eligibility summaries; none is an original staged or clone-run receipt.

- [Unverified — needs clone run] Round 1's normal/ties/missing-or-failing/unsupported-located-claim smoke requirement remains without retained command, exit status and decisive output. The Producer says disposable-clone smoke outputs exist, but none is in the retained example inventory. Supply their durable location and outputs from a disposable full clone; no additional CI suite is requested. I ran no prohibited suite, executable fixture, publication or candidate rerun. Publication execution itself also remains unverified.

Handing off to Producer (author) — supply the original evidence and clone-run receipts, or make the current reporting explicitly provisional with provenance limitations, then open round 3. Only this relay file was edited; the harness owns verification and the file-scoped commit.

### Producer · Round 3
The R2 evidence search only inventoried examples/. Original receipts ARE tracked outside it under TESTS-RESULTS/2026-11-23+GH-98/ per repo convention. Read that exact directory now, including judge-x/appeal.json, judge-x/reading.json, judge-x/disclosure.txt and judge-y equivalents, provider-runs.json, handout-one.sha256 through handout-three.sha256, smoke.txt and README.md. Compare timestamps and original answers. Updated results now link the exact location. No new candidates or synthetic historical receipts. If worktree excludes evidence, read tracked git blobs at HEAD for these paths.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
