# RELAY · GH36 PR37 merge integration QA
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
6. **Commit only the relay file** (`relay(gh36-merge): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **.relay-artifacts/gh36-merge-packet.md** — the read-only path that
  `relay-drive.sh --artifact-file relay-system/2026-10-12/gh36-merge-packet.md` seeds into the isolated worktree (read it there; do NOT edit it).
- Reviewer: codex   ·   Producer: author
- Started: 2026-10-12
- Definition of Done: The concrete preservation, safety, budget and evidence criteria in gh36-merge-packet.md.

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
Basis: runtime union and available machine evidence look sound; the explicit current-plan/final-QA documentation criterion is not met. One Should correction, Easy reversibility. No runtime repair or additional suite is requested.
swept file: yes

- [Should] F1 — Reconcile the live GH-36 plan with the completed final review and existing PR. `PROJECT/2-WORKING/GH-36-RECURSIVE-PROCESS-RECIPE.md:5` still says “awaiting final Codex QA”; its status table at `:51` says “Next: final Codex QA, then PR.” The retained final-QA relay already has `status: Approved` and `reviewed-head: bc35b3db40441d0c47e94cd166aa732f1ff405f6` in its final attestation (`relay-system/2026-10-11/gh36-final-qa.md`, quoted span), and this artifact is explicitly PR #37 merge QA. A cold agent receives the wrong next action. Fix the frontmatter date/status and status table to distinguish completed implementation QA from this merge review, harness gate/landing, and pending human artwork approval; retain the historical evidence. This is required by the packet's “README/current plan status reflect final QA” DoD (`.relay-artifacts/gh36-merge-packet.md:15`).
  Observed input: the two current status strings quoted above.
  Affected scope: this plan's current frontmatter and two-column status table only.
  Falsifier: a plan whose current status already cites the approved final-QA receipt and PR #37, while leaving merge/human acceptance pending, would make this finding unnecessary.
- [Nit] F2 — `README.md:54–56` lists three delivered catalog identities; add `recursive-process@1.0.0` alongside them so the new publication is discoverable. The canvas/font documentation already mentions it (`README.md:143–144`).
- [Pass] Four recipes retain admission/inference/canvas and save selection (`tools/request.mjs:59–61,105–109`), render module selection and bounded declared-font loading (`tools/render.mjs:183–201`), and both incoming declared-file sets (`tools/catalog.mjs:134–148`). Family propagation reaches Satori, Playwright and both HTML forms (`tools/render.mjs:237–242,341–344`). Swept all of request.mjs, render.mjs and catalog.mjs, plus C1 and its offline helper (`tools/spike/test/canaries.test.mjs:25–401`); no material pre-existing runtime defect found in this bounded sweep. Keep the existing owners and mechanisms; no source change requested.
- [Pass] Read-only catalog probes on this tree: `node tools/catalog.mjs verify --json > "$TMPDIR/catalog-verify.txt"` exited 0 with `{"valid":true,"errors":[]}`; `node tools/catalog.mjs export --check > "$TMPDIR/catalog-export.txt"` exited 0 with `{"canonical":true}`. Expected SQLite ExperimentalWarning only. These support current publication/content integrity, not independent historical ancestry proof.
- [Pass] Stored comparison records are identical, not merely their top-level digests. The following probe exited 0 with `PASS: 10 unique fixture/backend records, 35 formats; complete records including artifacts and fitting equal`. Evidence inputs: `relay-system/2026-10-12/gh36-merge-verification/main-matrix.json` and `merged-matrix.json`, quoted decisive output below. This checks recorded artifact/compact-asset hashes and fit steps; it does not execute rendering or establish baseline revision provenance.

```sh
export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"
python3 -B - <<'PROBE' > "$TMPDIR/matrix-probe.txt"
import json,pathlib
p=pathlib.Path("relay-system/2026-10-12/gh36-merge-verification")
a=json.loads((p/"main-matrix.json").read_text());b=json.loads((p/"merged-matrix.json").read_text())
assert len(a)==len(b)==10
assert len({(x["inputPath"],x["backend"]) for x in a})==10
assert sum(len(x["digests"]) for x in a)==35
assert a==b
print("PASS: 10 unique fixture/backend records, 35 formats; complete records including artifacts and fitting equal")
PROBE
```

- [Pass] Retained gate receipts report `# pass 4`, `# fail 0`, and `4 canaries in 39.7s (budget 60s)` (`relay-system/2026-10-12/gh36-merge-verification/canaries.log:37–43`); the budget remains four tests/one file/60 seconds/no workflows (`test-budget.json`, quoted `"budget": { "testFiles": 1, "tests": 4, "maxSeconds": 60, "ciWorkflows": 0 }`). PDDA's closing span is `no errors, 2 warning(s) to review — pdda-check-governance` (`gh36-merge-verification/pdda.log` under the same directory). RELEASES receipt reports final generation 66 and clean receipt chain (`ledger.log:2–5`); generation 61 in the packet is the retained main starting generation, not the final generation. Preserve these receipts; do not describe them as fresh reviewer executions.
- [Unverified — needs clone run] Fresh suite/render/offline-browser checks, exact source union against ca133276/026679195, historical 63/10 row retention, append-only log/changelog comparison and private output restoration are not independently re-executed here. No git, validate.sh, test script, pytest or executable fixture was run. The post-turn harness gate remains required. Both startup RELEASES CLI paths are absent in this seed; no substitute writer was used. Graph inventory (all 82 projects, both pages) has no matching worktree project/generation, so direct-source fallback was used; graph coverage cannot be claimed.

Human artwork acceptance remains pending as explicitly required by the packet. This is machine integration review only.

Handing off to Producer (author) — correct F1, disposition F2, and return the relay for review. The harness owns the one-file commit and clone gate.

### Producer · Round 1 · author

F1 Implemented: current frontmatter now states final Codex QA Approved (round 2), PR #37 merge QA in progress, updated October 12; the status table names merge QA and landing plus pending human artwork review. Historical build evidence is retained.
F2 Implemented: README delivered catalog identities now list all four published recipe pins.
Added preservation.json with source commit provenance (baseline full clone ca133276, merge source 4845131, original PR 0266791) and row/identity/bytes results. Clarified packet: binary font files are unchanged; reviewed incoming SOURCE.md notes are retained. The existing matrix and four-canary receipts stand; no runtime edits or extra suite rerun for these documentation changes. Post-turn native gate remains required.

Handing off to Reviewer (codex) for Round 2 against the corrected docs and retained machine evidence.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
