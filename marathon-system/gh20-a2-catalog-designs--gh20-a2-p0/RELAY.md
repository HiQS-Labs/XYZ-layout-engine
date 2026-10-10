# Marathon Phase gh20-a2-p0
STATUS: Open
NEXT: codex (Builder)

<!-- marathon-drive: task=MARATHON-GH20-A2-P0-TURN builder=codex reviewer=agy round-cap=5 -->

## Phase Brief

---
title: "GH-20 A2 Phase 0 — execution brief"
status: Prepared
created: 2026-10-10
updated: 2026-10-10
owner: unassigned
goal: Execute Phase 0 (spike and decisions) of the canonical GH-20 Phase A2 catalog designs plan.
roadmap_exempt: true
---

## Status

| What was just completed | What's next |
|---|---|
| Prepared a bounded phase brief linked to GH-20 under umbrella GH-19. | Execute only after plan QA, operator confirmation and dry-run admission. |

# GH-20 A2 Phase 0 — Spike: migration, NULL literal, ID, log and path decisions

Umbrella: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/19. Member: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/20 (design log: #21).
Canonical plan: `PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md`, "Design decisions" D1–D8 and "Phase 0".
Order: gh20-a2-p0 -> gh20-a2-p1 -> gh20-a2-p2 -> gh20-a2-p3, strictly serial.
Builder: Codex (driver default). Reviewer: independent Agy. No fallback.

## Goal

Re-prove decisions D1 (migration 2 via `import`, recipe rows byte-stable), D2 (NULL literal), D5 (log
line canonical serialization) and D7 (write order) in a `$TMPDIR` prototype, confirm D3/D4 rules, and
write a `### Phase 0 findings` subsection into the plan. No feature code in the repo.

## Allowed files

Only `PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md`, and inside it only a new `### Phase 0 findings`
subsection under "Phase 0". Every prototype, copied module, dump and log lives under `$TMPDIR`.

## Scope

- Copy `tools/catalog.mjs`, `tools/request.mjs`, `tools/catalog.sql` and the three examples'
  `fixture.json` and primary PNG into `$TMPDIR`; apply D1/D2 to the copy; run
  `node tools/catalog.mjs import tools/catalog.sql` there; record the old-vs-new dump diff and the
  count of removed `INSERT` lines (expected 0).
- Two load/export cycles and `export --check` on the migrated prototype are byte-identical.
- NULL pin round trip; half-null pin rejected; NULL into a recipe `NOT NULL` column rejected.
- One D5 log line: `JSON.stringify(JSON.parse(line)) === line`; a reordered-key line fails it.
- D3: `2026-02-30-x-y-z` rejected, the three seed IDs accepted. D4: `/abs.png`,
  `examples/../x.png`, a symlink escaping the root and a non-`examples/` path refused.
- Time one prototype `verify` with three designs; estimate C4 added spawns.
- Write each outcome as a line starting `Decision:` with BECAUSE and UNLESS, with file:line pointers.

## Acceptance (each can fail; red control in brackets)

- P0-A1 Findings subsection has at least four `Decision:` lines. [Red: `rg -c '^Decision:'` on the plan returns fewer than 4.]
- P0-A2 Prototype migration removes zero `INSERT` lines and keeps every GID. [Red: rebuilding with fresh `add`/`publish` shows `-INSERT` lines.]
- P0-A3 NULL-pin round trip byte-identical. [Red: unpatched `quote` throws `TypeError` on the same row.]
- P0-A4 `git status --porcelain` shows only the plan changed by this phase. [Red: a scratch file in the repo is listed.]

## Gate

Driver runs `pnpm test` after independent review (exit 0, 4/4, budget unchanged). Builder runs only
the P0 checks and records command, exit code and key output in the relay.

## Boundaries and proof

Ponytail: standard library and installed dependencies only; no new dependency, test file, `test()`
block or CI workflow. Follow ROUTER/AGENTS startup and read the plan first. The plan outside the
findings subsection, the issue #20 appendix, briefs, `releases.db`, `releases.sql`,
`test-budget.json`, `package.json`, `pnpm-lock.yaml` and all code are read-only. Do not run
`pnpm test` yourself. No paid calls, no network installs. If a decision cannot be evidenced, emit
`VERDICT: PARKED` with the evidence. Use debug-mantra on concrete failures. Never `--force`.

**No push, no PR, no merge, no issue close.**

## Receipt contract

Append the required native build/review block. The final block uses literal `VERDICT: PASS`,
`VERDICT: FAIL` or `VERDICT: PARKED` and a nonempty `Basis:`; conversational approval goes in
`Review outcome:`. Only the independent reviewer approves; no builder self-attestation.


---

▶ TAKE YOUR TURN (codex — BUILDER role)

You are the BUILDER for this phase. Read the phase brief above and implement it.
APPEND-ONLY FILE (GH-529 attestation): add your block at the END and never delete, reorder, or rewrite any existing content — the terminal attestation refuses the approval if any byte above your block changed, even a tidy-up.
1. Implement the brief by creating/editing the artifact file(s): PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md
2. Append a build block to this relay file: `### Round N · Builder · codex` summarizing what you did (files touched, key decisions).
3. Use this exact tick binary (run it from any directory): /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick
   - /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick claim MARATHON-GH20-A2-P0-TURN --agent codex --paths "marathon-system/gh20-a2-catalog-designs--gh20-a2-p0/RELAY.md,PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md"
   - /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick ping MARATHON-GH20-A2-P0-TURN --agent codex
   - /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick release MARATHON-GH20-A2-P0-TURN --agent codex --to agy
4. Edit ONLY these paths: marathon-system/gh20-a2-catalog-designs--gh20-a2-p0/RELAY.md and PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md. Do NOT run git. Do NOT touch any other file — the harness commits for you.
5. HAND OFF EXPLICITLY (GH-268): after releasing the token, end your turn by naming who acts next —
   "handing off to agy — agy, take your turn." A turn that ends without that line
   leaves a human guessing whether the relay is waiting on them or has stalled. Do this EVERY round,
   not just the first. ALSO, you MUST update the `NEXT:` line at the top of this file to exactly: `NEXT: agy (Reviewer)`

---

▶ TAKE YOUR TURN (agy — REVIEWER role)

You are the REVIEWER for this phase. Read the latest builder block above AND review the artifact file(s) on disk: PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md. REVIEW THE WHOLE FILE, NOT JUST THE DIFF (GH-268): a beta test had this loop reach 'Approved' in two rounds while an independent audit of the same branch found 20 issues (1 critical, 4 high) — every one of them in the pre-existing code the change sat on, which nobody had read. Pre-existing defects in a file you are touching are IN SCOPE; say so explicitly if you find none. DECLARE IT: your review block MUST contain a literal 'swept file: yes' or 'swept file: no' line — without it a reviewer that skipped the sweep is indistinguishable in the transcript from one that did it and found nothing, which is exactly how those 20 issues stayed invisible.
APPEND-ONLY FILE (GH-529 attestation): add your block at the END and never delete, reorder, or rewrite any existing content — the terminal attestation refuses the approval if any byte above your block changed, even a tidy-up.
1. Append a review block: `### Round N · Reviewer · agy` followed by your assessment.
2. If changes needed: add `**Verdict:** Changes requested`, update the `NEXT:` line to exactly `NEXT: codex (Builder)`, then: /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick release MARATHON-GH20-A2-P0-TURN --agent agy --to codex
3. If satisfied: add `**Verdict:** Approved`, set `STATUS: Approved`, then: /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick done MARATHON-GH20-A2-P0-TURN --agent agy
4. Use this exact tick binary (run it from any directory) for all token operations: /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick
   Edit ONLY marathon-system/gh20-a2-catalog-designs--gh20-a2-p0/RELAY.md (your review block + STATUS). Do NOT edit the artifact yourself — request changes instead. Do NOT run git.
4b. TO VERIFY A FINDING, WRITE PROBE FILES OUTSIDE THE REPO — under $TMPDIR, never inside the
   working tree. Creating even one scratch file in the repo is an off-lane write: containment
   reverts it and FAILS YOUR WHOLE TURN, discarding the review you just did (GH-441). Observed
   2026-08-08: a reviewer found a real latent crash, wrote two probe files in-tree to demonstrate
   it, and lost the turn for doing so — the finding survived only because RELAY.md happens to be
   on your allowlist. `cp` what you need to "$TMPDIR/probe.$$/" and work there instead. Verifying
   is wanted; verifying in-tree is what costs you the turn.
4c. A finding that asks for a behaviour change is a generalization unless you can paste the concrete
   input — a row, a value, a `file:line` — that fails under the current code (GH-681). Every
   `[Blocker]` or `[Should]` requesting a behaviour change MUST carry `Observed input:`,
   `Affected scope:` and `Falsifier:` lines; a `[Blocker]` must cite an observed failure. The Builder
   may disposition a request lacking these as `Declined — unproven generalization`.
5. HAND OFF EXPLICITLY (GH-268): end your turn by naming who acts next — "handing off to codex —
   codex, take your turn" when requesting changes, or "relay closed, no further turn needed" when
   approving. The beta report singled this out: the Reviewer turn did not tell the user to go back to the
   Producer, so the relay looked stalled when it was simply waiting. Do this EVERY round.
