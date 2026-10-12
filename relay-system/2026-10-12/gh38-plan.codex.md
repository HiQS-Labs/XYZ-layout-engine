# RELAY · GH38 follow-up fix plan QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-12.
-->

NEXT: Reviewer
STATUS: Open
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
6. **Commit only the relay file** (`relay(gh38-plan): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **.relay-artifacts/GH-38-FOLLOWUP-FIXES.md** — the read-only path that
  `relay-drive.sh --artifact-file PROJECT/2-WORKING/GH-38-FOLLOWUP-FIXES.md` seeds into the isolated worktree (read it there; do NOT edit it).
- Reviewer: codex   ·   Producer: author
- Started: 2026-10-12
- Definition of Done: Grade the stated two fixes, ordinary-I/O local CLI envelope, existing owner/helper reuse, retained published history/bytes, falsifiable acceptance,80/85/50/65 rating, unchanged test budget. Avoid unrequested power-loss or enterprise threat-model machinery.

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
Basis: Block on one ordinary-I/O commit-boundary gap in the proposed compensation; the two-fix scope and loader design otherwise meet the plan DoD. This is plan review, not implementation approval.
swept file: yes

- [Should] Make `atomicDump` success/failure identify whether rename committed before using rejection to trigger log compensation (.relay-artifacts/GH-38-FOLLOWUP-FIXES.md:28,36,43; tools/catalog.mjs:253-259). Its `finally` unconditionally calls `fs.rm` after successful rename. A cleanup error therefore rejects an already committed write: for the proposed log-first sequence this can leave a new log with the old dump, or restore the old log after the new dump has committed. Cheapest correction: have the existing helper skip obsolete-temp removal after successful rename (or otherwise distinguish committed publication), and specify a narrow post-rename cleanup control alongside the planned rename-failure controls. No journal or power-loss contract is requested. Reversibility: Easy.
  Observed input: Exact current `atomicDump` body, with successful open/write/sync/close/rename and `fs.rm` throwing injected `EACCES`; it rejected after the rename event. This is a non-mutating call-sequence probe, not an observed full filesystem/catalog failure.
  Affected scope: Ordinary I/O rejection from cleanup after successful atomic replacement, when the helper is reused for the log and catalog.
  Falsifier: In a disposable clone, the same successful-rename/cleanup-error control must leave dump and log at the same committed state without triggering compensation of an already committed catalog; pre-rename failure must still preserve old bytes/absence and allow retry. If the revised helper never attempts cleanup after successful rename, this particular failure path is eliminated.
  Probe command: `export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"; node "$TMPDIR/atomic-cleanup.mjs" > "$TMPDIR/atomic-cleanup.out"` — exit 0; decisive output: `{"events":["write","sync","close","rename committed","cleanup EACCES"],"result":"rejected","code":"EACCES"}`. Exact probe source (scratch is discarded):
  ```js
  import { readFileSync } from 'node:fs';
  const source = readFileSync('tools/catalog.mjs', 'utf8');
  const body = source.slice(source.indexOf('async function atomicDump('), source.indexOf('\nclass Usage'));
  const events = [];
  const fs = { open: async () => ({ writeFile: async () => events.push('write'), sync: async () => events.push('sync'), close: async () => events.push('close') }), rename: async () => events.push('rename committed'), rm: async () => { events.push('cleanup EACCES'); throw Object.assign(new Error('injected cleanup EACCES'), {code:'EACCES'}); } };
  const atomicDump = new Function('fs', 'randomUUID', body + '\nreturn atomicDump;')(fs, () => 'probe');
  try { await atomicDump('catalog.sql', 'new dump'); } catch (e) { console.log(JSON.stringify({events, result:'rejected', code:e.code})); }
  ```
- [Pass] Recovery stays in the existing catalog owner/lock and explicitly excludes journal/schema/power-loss expansion (artifact:28,32; tools/catalog.mjs:280-287,352-365). Exact-byte/absence restoration and explicit rollback errors are useful, falsifiable requirements (artifact:42-43). Root cause: durable dump publication precedes fallible log append; fix site: existing catalog writer; a renderer patch cannot repair this ownership/order defect.
- [Pass] The shared loader preserves the actual duplicated containment/bounded-read/PNG inspection/digest/data-URL sequence and keeps recipe-specific inputs at callers (artifact:30; tools/recipes/solar-system.mjs:92-106; tools/recipes/mangajdm-promo.mjs:24-38). Lazy reuse fits the existing request import in tools/spike/assets.mjs:5. No additional loader defect found in the source sweep.
- [Pass] Published history/design pins and pinned Nutrition asset-owner bytes are explicitly retained; patch versions are conditioned on artifact-byte preservation (artifact:30,37-38,45-46). Existing catalog immutability/history protections remain the owner (tools/catalog.mjs:23-30,238-251).
- [Pass] Rating 80/85/50/65 has an explicit rationale and bounded incident-history uncertainty (artifact:51); the unchanged budget is exactly 4 tests / 1 file / 60 seconds / 0 workflows (artifact:36,38; test-budget.json `budget`). The 35-format target is 5 fixtures × (4 Satori + 3 Playwright); it is a future comparison, not a measured pass.
- [Nit] Add the evidence destination and an explicit rollback-failure manual control to implementation step 1, so the second acceptance checkbox's diagnostic requirement has a recorded witness (artifact:36,43). Reuse the existing task evidence; no additional test block is needed.
- [Unverified — needs clone run] Prior append-EACCES reproduction, baseline digests, suite duration and final preservation remain reported evidence in relay-system/2026-10-12/gh38-recon.md, not independently rerun here. No validate.sh, test shell scripts, pytest, executable fixtures, or git commands ran. Graph inventory returned all 82 projects with `has_more:false`; neither this worktree nor XYZ Layout Engine has an index, so no generation/coverage metadata exists and direct source fallback was used. Whole seeded plan and catalog/request/Solar/Manga/PNG-owner source were read; the cleanup issue above is pre-existing and in scope. No other material plan defect found in this bounded sweep.

Handing off to Producer (author) — revise the commit-boundary contract and return for Round 2.

### Producer · Round 1 · author

Implemented the Should: atomicDump will distinguish the successful rename commit by skipping obsolete-temp removal on success. Precommit failures still clean their staged file; failed catalog commit triggers log compensation, never an already committed rename. This is part of the existing writer correction, not a new storage subsystem.
Implemented the Nit: implementation step1 now names missing-log restoration, rollback failure diagnostics and post-rename cleanup controls, with results in relay-system/2026-10-12/gh38-verification/. Existing test budget and two-fix scope remain unchanged.

Handing off to Reviewer (codex) for Round2.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
