# RELAY · GH-51 DESIGN.md profile final QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-14.
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
6. **Commit only the relay file** (`relay(gh51-final): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: the full committed diff against origin/main, root DESIGN.md, docs/design-md/DESIGN.md and REVIEW.md, README/ROUTER/SYSTEM-INSTRUCTIONS/CHANGELOG, GH-51 plan/recon, TESTS-RESULTS/2026-10-14-GH-51, and RELEASES GH-51 metadata.
- Reviewer: codex   ·   Producer: codex-producer
- Started: 2026-10-14
- Definition of Done: Verify the captured operator request and approved plan are satisfied: low-to-medium document-level Google alpha compatibility, substantive unique ordered sections, valid actual token groups/references, truthful authority/capability/legacy boundaries, required new authoring pointers, zero-error/warning pinned lint with witnessed negative controls and disclosed duplicate-H2 limitation. Verify protected runtime/fixture/asset/catalog/package/test paths unchanged against integration base ed565292d280fec565c30e9612ca31240e84fbf6, DB/dump consistency and persisted 60/15/50/85 rating, and recorded PDDA baseline/candidate equivalence (0 errors, same 40 warnings). Read complete touched documents, not only added lines. The single removed pre-existing broken README gallery link is intentional. Grade this lightweight docs-only requirement; no parser/importer, new gates, bulk migration, rendered WCAG claim, paid provider or PR #43 changes are in scope. Reviewer may edit only this relay thread. Approve only if evidence supports completion; any executable checks must stay narrow and read-only. No runtime suite is required for unchanged product code.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1

VERDICT: PASS
Basis: Approve the completed, bounded documentation adoption at head `16cb986be9cc0d6ed5f6f8f61998a6f6f7d5adef`, against integration base/origin-main `ed565292d280fec565c30e9612ca31240e84fbf6`. No Blocker or Should remains. The bet is that an authoring guide, real token sample and explicit translation boundaries satisfy the operator's low-to-medium compatibility request; direct ingestion and rendered accessibility remain outside this claim. Reversibility: Easy.
swept file: yes

- [Pass] Scope and ownership meet the captured request and approved plan: `PROJECT/2-WORKING/GH-51-DESIGN-MD-PROFILE.md:24`, `DESIGN.md:33`–53, `docs/design-md/DESIGN.md:44`–50, `README.md:20` and `SYSTEM-INSTRUCTIONS.md:9`. Both documents contain substantive ordered sections; the guide gives domain-neutral guidance and explained token omissions while the sample supplies all five actual token groups. Unsupported choices must be resolved before rendering, legacy contracts remain usable, and pinned briefs migrate with a future recipe version. The startup pointer is present at `ROUTER.md:28`. No correction required.
- [Pass] The documented runtime boundary is truthful: `tools/request.mjs:59`–62 reads bounded bytes and parses JSON; `tools/render.mjs:187`–207 selects trusted recipes and recipe-owned fonts, and line 238 builds the scene. `tools/catalog.mjs:131`, line 143 and line 213 bind published brief bytes. The [pinned alpha specification](https://github.com/google-labs-code/design.md/blob/9bf8eae67128b6cc55ad9bf86665767deb4c11cd/docs/spec.md) supports optional frontmatter, ordered sections, domain components and composite references; it does not provide renderer capabilities. No new parser, package, runtime styling owner, paid generation or PR #43 implementation is introduced. Preserve these boundaries.
- [Pass] Firsthand lint replay matches `TESTS-RESULTS/2026-10-14-GH-51/root-lint.json:1`, `sample-lint.json:1`, `broken-reference.json:1` and `duplicate-lint-limit.json:1`. Command: `node "$HOME/.npm/_npx/453056feeae89689/node_modules/@google/design.md/dist/index.js" lint <input> --format json`; package.json was checked as version **0.4.0**. Guide/sample each exited **0**, decisive summaries **errors 0, warnings 0**, with 5/1 informational findings. On a scratch sample with its first `"{colors.primary}"` replaced by `"{colors.missing}"`, exit **1**, decisive error **"Reference {colors.missing} does not resolve to any defined token."** Appending a second Colors section exited **0**, errors 0/warnings 1 with `section-order`; it still does not reject duplicates. Outputs and modified copies stayed under `.relay-scratch/tmp/`. No correction required to the authoring guidance or negative-control design.
- [Pass] Current document SHA-256 values match both inputs recorded at `TESTS-RESULTS/2026-10-14-GH-51/section-check.json:1`. Command: `python3 -` with the bounded section assertions reproduced from `TESTS-RESULTS/2026-10-14-GH-51/README.md:40` (unique headings, canonical order, nonempty bodies); exit **0**, decisive output **"PASS: 2 real docs accepted; duplicate/empty-body/empty-document rejected"**. The same read-only probe resolved the receipt's 32 local links: **"PASS: 32 recorded local links exist"**. This is a bounded document check, not a general Markdown parser. No correction required.
- [Pass] Preservation independently supports `TESTS-RESULTS/2026-10-14-GH-51/preservation.json:1`. Command: inline `python3 -` read-only object/tree comparison (standard-library zlib/struct/hashlib; every reconstructed object checked against its SHA-1), comparing both committed identities and current protected-file bytes. Exit **0**, decisive output **"protectedCount": 243, "protectedDrift": []**. The complete changed-path inventory is confined to authoring/governance documents, this task's evidence/relays and RELEASES DB/dump. The stored origin/main ref equals the pinned integration base. The protected scope includes tools, examples, skills, workflows, package/lockfile and test-budget. The README diff removes only the known nonexistent Solar System gallery pointer in addition to the new authoring section. No runtime render claim is inferred.
- [Pass] Existing catalog commands `node tools/catalog.mjs verify --json` and `node tools/catalog.mjs export --check` completed successfully, decisive outputs **{"valid":true,"errors":[]}** and **{"canonical":true}**, matching `TESTS-RESULTS/2026-10-14-GH-51/catalog-verify.json:1` and `catalog-export.json:1`; the documented experimental SQLite warning remains. No correction required.
- [Pass] RELEASES DB/dump and rating agree with `releases.sql:51` and `TESTS-RESULTS/2026-10-14-GH-51/releases-check.log:1`. To keep lock/audit writes out of the checkout, copied only DB/dump into `$TMPDIR/ledger/` and used the installed writer against that scratch root: `python3 -B "$HOME/Documents/GH Repos/XYZ-layout-engine/.xyz/utils/py/releases_app.py" --root "$TMPDIR/ledger" check`, exit **0**, decisive output **"generation trio consistent at 92 (DB <-> dump)"**, **"receipt chain intact (96 receipt(s), business-state digest matches, 5 merge fork(s) tolerated"**, **"check: clean (0 failures, 0 warning(s))"**. A query through that module's connection helper on the scratch copy returned GH-51's persisted **60/15/50/85**, NULL override, correct plan path; calc **210**. The original-root read-only `roadmap list` also exited **0** and displayed GH-51 In progress / calc 210. No correction required.
- [Pass] Recorded governance comparison is supported by the full baseline/candidate logs, not just their summary JSON: `TESTS-RESULTS/2026-10-14-GH-51/baseline-pdda.log:97` and `pdda.log:98` end with **"PDDA run complete: no errors, 40 warning(s) to review"**. Command: `python3 -` reading both logs, asserting no positive error summaries and equality of all WARN lines after removing only location line numbers; exit **0**, decisive output **"PASS: recorded PDDA logs have 0 errors and 40 identical warnings ignoring line numbers"**. These are retained producer-run receipts; I did not rerun PDDA or any suite here. No correction required.
- [Nit] `docs/design-md/REVIEW.md:41` says the duplicate Colors probe exits 0 “without a finding”; the durable appended-duplicate control at `TESTS-RESULTS/2026-10-14-GH-51/duplicate-lint-limit.json:10` and my replay contain one order warning. Optional wording fix: distinguish the earlier equal-adjacent-heading observation from this appended control, or say “does not reject duplicate headings; the appended control emits an order warning.” The documented rejection limitation remains correct.
- [Nit] Pre-existing wording at `ROUTER.md:27` still describes ten AS rules, while `SYSTEM-INSTRUCTIONS.md:59` contains AS-11. Optional copy fix: say “AS-1 through AS-11” or avoid the fixed count. Reading the complete linked instructions remains required, so this does not block GH-51.

Full-file sweep covered root/sample DESIGN.md, REVIEW, README, ROUTER, SYSTEM-INSTRUCTIONS, CHANGELOG, GH-51 plan/recon, prior plan relay, all new verification receipts and the committed changed-path inventory. The pre-existing stale governance links are explicitly retained in the 40-warning baseline; apart from the wording nits above, no additional material pre-existing document defect was found. Graph MCP tools were not exposed in this session; exact checkout source and byte comparisons were authoritative.

[Unverified — needs clone run] Fresh PDDA/suite execution is left to the harness gate; no validate script, test/*.sh, pytest, executable fixture, runtime render or Git command was run in this reviewer turn. No new runtime test is needed for unchanged product code. Approval covers this documentation requirement and the cited evidence, not a new WCAG audit, general importer or live issue/PR refresh.

Relay closed (Approved), no further review turn needed. Handing the completed token back through `done`; codex-producer may continue the ready-PR workflow after the harness gate.


### Attestation · relay-drive — 2026-10-14T17:16:10Z
task: RELAY-gh51-final-20261014
reviewer: codex
status: Approved
reviewed-head: 16cb986be9cc0d6ed5f6f8f61998a6f6f7d5adef
added-range: 6475+8054
added-sha256: 382d2348fac774f7ac8293406410b99d81126d2e58f5032406b35af456476967
### Producer · Round 2

Disposition: Implemented both nonblocking wording nits. REVIEW now distinguishes the initial adjacent duplicate probe (no finding) from the appended sample control (order warning, still exit 0). ROUTER now names the AS rules without a stale fixed count. No guide/sample, runtime, catalog, fixture, asset, package, test, or ledger values changed.

The prior full final review Approved the implementation and evidence. This follow-up is limited to reading the full two edited files (ROUTER.md and docs/design-md/REVIEW.md) and checking these exact wording corrections against the prior findings/duplicate-lint-limit.json. Do not rerun unrelated suites or reopen the settled scope. Confirm no new contradiction, then approve the updated copy; only this relay may be edited. Cumulative final QA round 2 of 3.

### Reviewer · Round 2

VERDICT: PASS
Basis: Approve both wording corrections within the Producer Round 2 scope. The bet is that distinguishing the two duplicate-heading controls and removing the fixed AS-rule count resolves the earlier nits without changing authoring authority or capabilities; a contradictory receipt or altered capability claim would overturn that conclusion. Reversibility: Easy. The earlier full final review remains the basis for the broader implementation.
swept file: yes

- [Pass] `docs/design-md/REVIEW.md:40`–48 now distinguishes the adjacent minimal control from the appended sample control. Its wording, “The later appended-duplicate sample control exits 0 with an order warning, but still does not reject the duplicate,” agrees with `TESTS-RESULTS/2026-10-14-GH-51/duplicate-lint-limit.json:9`–17 (one `section-order` warning, zero errors) and the recorded CLI exit 0 at `TESTS-RESULTS/2026-10-14-GH-51/README.md:14`. The earlier adjacent-control observation is retained separately; this turn does not claim a fresh CLI replay. No correction required.
- [Pass] `ROUTER.md:27` now says “the AS rules that override recipe, skill and prompt defaults,” removing the stale fixed count. This accommodates AS-11 at `SYSTEM-INSTRUCTIONS.md:47` while retaining the instruction to read the complete design rules. No correction required.
- [Pass] Read-only receipt/copy probe exited **0** with decisive output: **“PASS: appended receipt has errors=0, warnings=1, rule=section-order; REVIEW distinguishes adjacent and appended controls; ROUTER uses uncounted AS rules and AS-11 exists.”** Command (after `export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"`):

```sh
python3 -B - <<'PY'
from pathlib import Path
import json
review = Path("docs/design-md/REVIEW.md").read_text()
router = Path("ROUTER.md").read_text()
receipt = json.loads(Path("TESTS-RESULTS/2026-10-14-GH-51/duplicate-lint-limit.json").read_text())
assert receipt["summary"] == {"errors": 0, "warnings": 1, "infos": 1}
assert [f["rule"] for f in receipt["findings"] if f["severity"] == "warning"] == ["section-order"]
assert "an adjacent duplicate `## Colors` in the minimal probe exits 0 without a finding." in review
assert "The later appended-duplicate sample control exits 0 with an order warning,\nbut still does not reject the duplicate" in review
assert "expect the AS rules that override recipe, skill and prompt defaults" in router
assert "ten AS rules" not in router
assert "**AS-11 " in Path("SYSTEM-INSTRUCTIONS.md").read_text()
print("PASS: appended receipt has errors=0, warnings=1, rule=section-order; REVIEW distinguishes adjacent and appended controls; ROUTER uses uncounted AS rules and AS-11 exists.")
PY
```

Full-file sweep covered all 89 lines of ROUTER.md and all 86 lines of docs/design-md/REVIEW.md, not merely the corrected spans. No new contradiction or material pre-existing defect was found within this follow-up scope. ROUTER’s legacy governance pointers remain the previously disclosed baseline condition. No open Blocker, Should or Nit remains from Round 1. No code discovery was needed; graph MCP tools are not exposed in this session.

[Unverified — needs clone run] Fresh PDDA and harness gate execution remain for the harness. No Git command, validate.sh, test suite, pytest, executable fixture or runtime render was run. Only this relay file was edited; no artifact was changed.

Relay closed (Approved), no further review turn needed. Handing the completed token back with `done`; codex-producer may continue after the harness gate.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
