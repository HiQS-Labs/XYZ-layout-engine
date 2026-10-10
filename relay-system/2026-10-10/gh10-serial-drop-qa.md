# RELAY · GH-10 A1: drop the serial from the recipe catalog (code QA)
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-10.
-->

NEXT: Producer
STATUS: Approved
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
6. **Commit only the relay file** (`relay(gh10-serial-drop-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `tools/catalog.mjs`, `tools/catalog.sql`, `tools/render.mjs`, `tools/spike/test/canaries.test.mjs`, `README.md`, `CHANGELOG.md`. Context: `PROJECT/2-WORKING/SPECS-PRD.md`, `PROJECT/2-WORKING/GH-10-RECIPE-CATALOG.md`, `test-budget.json`.
- Reviewer: agy   ·   Producer: claude-a
- Started: 2026-10-10
- Definition of Done: the serial number is fully removed from the catalog (schema, dump, CLI, render receipt, canary, docs) with identity now `slug@semver`; the migrated dump is canonical and verifies; nothing else about the catalog changed (immutable published versions, content digests, triggers, `verify`, `export --check`, exit codes); the retention control still means something (a retired recipe's identity cannot be reused); no new test, workflow or dependency; the change is surgical and reversible.

## QA brief (read before reviewing)

Operational envelope: a local single-developer CLI. Review the last commit with `git show HEAD` (code in `tools/`, the canary, README, PRD note, CHANGELOG, plan banners) and read the surrounding code in `tools/catalog.mjs`.

Questions:
1. Is every serial reference gone from shipped code and docs (`git grep -n -i serial -- tools README.md`)? Anything left is either unrelated (for example 'serialize') or a finding.
2. Was the dump migrated correctly: `node tools/catalog.mjs export --check`, `verify` and `list` still pass; recipe rows are still ordered deterministically (now by slug); the two seeded recipes and their version rows are unchanged apart from the removed column.
3. Did removing `serial` weaken any guard: identity immutability trigger (`gid`, `slug`), `preserveHistory` on import, the retention control in the C4 canary? Name a concrete input that now passes and should not.
4. The render receipt's `catalog` block no longer has `serial`: is any consumer (code, canary, doc) still reading it?
5. Is the CHANGELOG entry and the 'Superseded' banners on `PROJECT/2-WORKING/GH-10-RECIPE-CATALOG.md` and `PROJECT/2-WORKING/GH-9-STACKING-RESPONSIVE-FLAGS.md` accurate and free of personal data or absolute home paths?
6. Anything over-built or under-done for a mechanical removal?

Output: graded findings with citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, and `swept file: yes|no`. Every `[Blocker]` or `[Should]` asking for a behaviour change must carry `Observed input:`, `Affected scope:` and `Falsifier:` lines. Set STATUS Approved only on PASS.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer (agy) — Round 1

swept file: yes

* `[Pass]` Serial references removed from code and documentation (`README.md:46` "There is no serial number; a recipe is identified by `slug@semver`").
* `[Pass]` Dump migrated correctly and cleanly, confirmed canonical (`node tools/catalog.mjs export --check` canonicalizes cleanly).
* `[Pass]` Identity retention control is preserved via the `UNIQUE` slug constraint (`tools/catalog.sql:2` `slug TEXT NOT NULL UNIQUE`), guarded by the C4 canary test (`tools/spike/test/canaries.test.mjs:457` `rejected=catalog('add','solar-system','--title','Again'); assert.equal(rejected.status,1,'retired recipe identity was reused');`).
* `[Pass]` The `catalog` render receipt block correctly removed `serial` and retains `slug` (`tools/render.mjs:350` `const catalog = { slug: recipe.name, version: recipe.version, contentSha256: null, verified: false };`).
* `[Nit]` Pre-existing typo in `README.md:62`: "lsit" should be "list" (`(for example, node tools/catalog.mjs lsit).`).

VERDICT: PASS
Basis: The `serial` column has been surgically removed across the catalog schema, code, docs, and canaries. The `slug` uniqueness perfectly satisfies the retention and immutability controls previously managed by the serial.

relay closed (Approved), no further turn needed


### Attestation · relay-drive — 2026-10-10T18:39:35Z
task: RELAY-gh10-serial-drop-qa-agy1
reviewer: agy
status: Approved
reviewed-head: 8a36de4d6b3199d502f121457149e69249b24664
added-range: 7454+1306
added-sha256: 83283c50f269e4c6381b2e0e4193134d6491c5f8860c2da564ad12be2e291258
<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
