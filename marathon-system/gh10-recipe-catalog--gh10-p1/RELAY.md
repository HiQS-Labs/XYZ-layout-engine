# Marathon Phase gh10-p1
STATUS: Open
NEXT: codex (Builder)

<!-- marathon-drive: task=MARATHON-GH10-P1-TURN builder=codex reviewer=agy round-cap=5 -->

## Phase Brief

---
title: "GH-10 Phase 1 — execution brief"
status: Prepared
created: 2026-10-10
updated: 2026-10-10
owner: unassigned
goal: Execute Phase 1 (store, canonical dump and CLI) of the canonical GH-10 recipe catalog plan.
roadmap_exempt: true
---

## Status

| What was just completed | What's next |
|---|---|
| Prepared a bounded phase brief linked to GH-10 under umbrella GH-19. | Execute only after gh10-p0 is approved with a go decision. |

# GH-10 Phase 1 — Store, canonical dump and CLI

Umbrella: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/19. Member: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/10.
Canonical plan: `PROJECT/2-WORKING/GH-10-RECIPE-CATALOG.md`, Phase 1 and the Design section. Read the Phase 0 findings first and follow its decisions.
Builder: Codex. Reviewer: independent Agy. Strictly serial after gh10-p0.

## Goal

A single module `tools/catalog.mjs` (the only catalog reader/writer) and a schema-only canonical
dump `tools/catalog.sql`, with the immutability, serial and round-trip guards added to existing C4.

## Allowed files

`tools/catalog.mjs` (new), `tools/catalog.sql` (new), `tools/spike/test/canaries.test.mjs` (extend C4
only; no new `test()`).

## Scope

- Direct-execution guard as `tools/render.mjs:496`; importing the module opens nothing and writes nothing.
- Migration 1: `schema_migrations`, `recipes`, `recipe_versions`, `recipe_version_files`,
  `recipe_outputs`; unique natural keys; `BEFORE UPDATE/DELETE` abort triggers on published rows and
  no-delete on `recipes`.
- Verbs `list`, `show`, `add`, `publish`, `update`, `deprecate`, `retire`, `verify`, `export [--check]`,
  `import <dump>`; `--json` on read verbs; exit 0/1/2; errors via `invalid()` from `tools/request.mjs:9`.
- Load the dump into `:memory:`; write verbs take `tools/.catalog.lock` with `wx`, run one
  transaction, re-export and atomically replace the dump (temp + fsync + rename, as
  `tools/request.mjs:124-129`). Read verbs never touch the dump or lock. Bound parameters only.
- C4 extension in a temp root: publish, republish-different rejected with unchanged dump bytes,
  republish-same no-op, add -> retire -> add yields the next serial, export -> import -> export
  identical, a modified and a missing declared file make `verify` exit 1.

## Acceptance (each can fail; red control in brackets)

- P1-A1 `node tools/catalog.mjs export --check` exits 0. [Red: a `$TMPDIR` copy with one row line moved exits 1.]
- P1-A2 Republish-different exits 1; dump sha256 unchanged. [Red: republish-same exits 0.]
- P1-A3 `list`/`show`/`verify` leave dump sha256 and mtime unchanged and leave no lock. [Red: `update --title` changes the sha256.]
- P1-A4 `rg -n 'prepare\(\s*`[^`]*\$\{' tools/catalog.mjs` finds nothing. [Red: the pattern matches a scratch file line with a template-literal SQL.]
- P1-A5 `git diff --exit-code <base> -- package.json pnpm-lock.yaml test-budget.json` exits 0. [Red: any edit exits 1.]
- P1-A6 C4 fails if the immutability trigger is removed (reviewer verifies on a `$TMPDIR` copy). [Red is the check.]

## Gate

Driver runs `pnpm test` after independent review: exit 0, 4/4 canaries, 1 file/4 tests/60 s/0
workflows. Builder runs only the P1 checks, mutating probes only in `$TMPDIR` copies, and records
command, exit code and key output in the relay.

## Boundaries and proof

Ponytail: one module, Node built-ins only, no new dependency, test file, `test()` block or workflow.
Do not edit recipe modules, `tools/request.mjs`, `tools/render.mjs`, goldens, the plan, briefs,
`releases.db/sql`, `test-budget.json`, `package.json` or `pnpm-lock.yaml`. Do not run `pnpm test`.
Leave no lock or temp file in the repo. No paid calls or network. On an undeliverable requirement emit
`VERDICT: FAIL` or `PARKED` with evidence. Debug-mantra on failures; never `--force`.

**No push, no PR, no merge, no issue close.**

## Receipt contract

Append the required native build/review block. The final block uses literal `VERDICT: PASS`,
`VERDICT: FAIL` or `VERDICT: PARKED` and a nonempty `Basis:`; conversational approval goes in
`Review outcome:`. Only the independent reviewer approves; no builder self-attestation.


---

▶ TAKE YOUR TURN (codex — BUILDER role)

You are the BUILDER for this phase. Read the phase brief above and implement it.
APPEND-ONLY FILE (GH-529 attestation): add your block at the END and never delete, reorder, or rewrite any existing content — the terminal attestation refuses the approval if any byte above your block changed, even a tidy-up.
1. Implement the brief by creating/editing the artifact file(s): tools/catalog.mjs, tools/catalog.sql, tools/spike/test/canaries.test.mjs
2. Append a build block to this relay file: `### Round N · Builder · codex` summarizing what you did (files touched, key decisions).
3. Use this exact tick binary (run it from any directory): /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick
   - /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick claim MARATHON-GH10-P1-TURN --agent codex --paths "marathon-system/gh10-recipe-catalog--gh10-p1/RELAY.md,tools/catalog.mjs, tools/catalog.sql, tools/spike/test/canaries.test.mjs"
   - /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick ping MARATHON-GH10-P1-TURN --agent codex
   - /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick release MARATHON-GH10-P1-TURN --agent codex --to agy
4. Edit ONLY these paths: marathon-system/gh10-recipe-catalog--gh10-p1/RELAY.md and tools/catalog.mjs, tools/catalog.sql, tools/spike/test/canaries.test.mjs. Do NOT run git. Do NOT touch any other file — the harness commits for you.
5. HAND OFF EXPLICITLY (GH-268): after releasing the token, end your turn by naming who acts next —
   "handing off to agy — agy, take your turn." A turn that ends without that line
   leaves a human guessing whether the relay is waiting on them or has stalled. Do this EVERY round,
   not just the first. ALSO, you MUST update the `NEXT:` line at the top of this file to exactly: `NEXT: agy (Reviewer)`

---

▶ TAKE YOUR TURN (agy — REVIEWER role)

You are the REVIEWER for this phase. Read the latest builder block above AND review the artifact file(s) on disk: tools/catalog.mjs, tools/catalog.sql, tools/spike/test/canaries.test.mjs. REVIEW THE WHOLE FILE, NOT JUST THE DIFF (GH-268): a beta test had this loop reach 'Approved' in two rounds while an independent audit of the same branch found 20 issues (1 critical, 4 high) — every one of them in the pre-existing code the change sat on, which nobody had read. Pre-existing defects in a file you are touching are IN SCOPE; say so explicitly if you find none. DECLARE IT: your review block MUST contain a literal 'swept file: yes' or 'swept file: no' line — without it a reviewer that skipped the sweep is indistinguishable in the transcript from one that did it and found nothing, which is exactly how those 20 issues stayed invisible.
APPEND-ONLY FILE (GH-529 attestation): add your block at the END and never delete, reorder, or rewrite any existing content — the terminal attestation refuses the approval if any byte above your block changed, even a tidy-up.
1. Append a review block: `### Round N · Reviewer · agy` followed by your assessment.
2. If changes needed: add `**Verdict:** Changes requested`, update the `NEXT:` line to exactly `NEXT: codex (Builder)`, then: /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick release MARATHON-GH10-P1-TURN --agent agy --to codex
3. If satisfied: add `**Verdict:** Approved`, set `STATUS: Approved`, then: /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick done MARATHON-GH10-P1-TURN --agent agy
4. Use this exact tick binary (run it from any directory) for all token operations: /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick
   Edit ONLY marathon-system/gh10-recipe-catalog--gh10-p1/RELAY.md (your review block + STATUS). Do NOT edit the artifact yourself — request changes instead. Do NOT run git.
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
