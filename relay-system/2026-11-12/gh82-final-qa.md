# RELAY · GH-82 final QA: external-module public API
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-11-12.
-->

NEXT: done
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
6. **Commit only the relay file** (`relay(gh82-final-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `tools/plugin-api.mjs` and the rest of the diff 4e08148..HEAD on this branch — `package.json`, `README.md`
  ("Using the engine from another repository"), `ROUTER.md`, `CHANGELOG.md`, `PROJECT/2-WORKING/SPECS-PRD.md` §6.5,
  `PROJECT/2-WORKING/GH-82-PLUGIN-API.md` (plan), `TESTS-RESULTS/2026-11-12-GH-82/README.md` (evidence),
  and the approved plan QA `relay-system/2026-11-12/gh82-plan-qa.md`.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-11-12
- **Operational envelope:** local, single-operator engine; one external repository links this checkout. Grade against
  the plan's acceptance and commensurate complexity. The repo caps tests at 4 canaries; a new test file would itself
  be a finding, not a request. `releases.db`/`releases.sql` changes are ledger writes by the repo's CLI (registration,
  repoint, move), not hand edits.

Questions:
1. Does the implementation match the approved plan exactly (two re-exports, the `exports` map, docs), with nothing extra
   and nothing missing? Cite lines.
2. Does each acceptance check in the receipt observe the real outcome, and does the red control reject the unchanged
   base? Is anything claimed in the receipt not supported by what the diff makes possible?
3. Is the README section accurate against `tools/review.mjs` and `tools/render.mjs` (replace semantics, caller closes
   the browser, REVIEW location, link instructions)? This was the plan QA nit.
4. Does the diff leak anything private (absolute home paths, emails, tokens, names of private repositories)? Run
   `git diff 4e08148..HEAD | grep -n "/Users/"` or equivalent as a read-only probe.
5. Is the CHANGELOG entry correct and does SPECS-PRD §6.5 keep the delivered-versus-deferred distinction?

Definition of Done: plan delivered as approved, evidence supports every claim, no private data in the diff.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1 · codex

VERDICT: PASS
Basis: Approve the two-name public surface in the stated local, single-operator envelope. The implementation matches the approved plan; the receipt targets the actual acceptance outcomes, and its tested runtime bytes remain unchanged. No Blocker or Should finding. Browser/suite execution remains author-reported clone evidence, not a reviewer rerun.
swept file: yes

- [Pass] **Q1: implementation and scope.** Read the entire public entry point and package manifest, the complete renderer and review publisher, the approved plan/plan QA, and surrounding documentation. `tools/plugin-api.mjs:1–15` declares the contract and contains exactly two re-exports, at lines 13 and 15; `package.json:6–9` has precisely the approved root and manifest mappings. The object-to-object comparison of base `4e08148` to seeded HEAD `a6b1fc79c753` contains no renderer, request, recipe, dependency, test or workflow change. Other changed paths are the named documentation/relays and the explicitly allowed release ledger. No new runtime mechanism or pre-existing defect requiring correction was found in the public entry point or package manifest. No fix required.
- [Pass] **Import resolution is measured.** Command: `export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"; node "$TMPDIR"/gh82-import-*/probe.mjs`; exit 0. The scratch consumer uses a `node_modules/xyz-layout-engine` symlink to the seeded engine; its ESM driver imports the root and manifest, asserts the deep import's exact rejection code, and never invokes launch/publication. Decisive output: `root names=launchPlaywright,publishForReview`, `types=function,function`, `manifest=xyz-layout-engine-spike`, `deep=ERR_PACKAGE_PATH_NOT_EXPORTED`, `no browser launch or publication invoked`. This directly measures `package.json:6–9` and `tools/plugin-api.mjs:13–15`. No fix required.
- [Pass] **Q2: receipt relevance and red control.** `TESTS-RESULTS/2026-11-12-GH-82/README.md:10–15` records executed canaries/PDDA, package-name launch/close plus PNG publication, deep-import rejection, unchanged-base root-import failure, and a real-consumer pixel/hash comparison. These observe outcomes rather than merely searching for export text. The unchanged-base failure is consistent with the earlier measured base probe retained in `relay-system/2026-11-12/gh82-plan-qa.md` (quoted output: `xyz-layout-engine: ERR_MODULE_NOT_FOUND`, while the deep path worked). A read-only object comparison against receipt revision `5fffa8b` exited 0 and printed only three later changes: the working plan, receipt, and final-QA relay; runtime/package/documentation bytes tested at that revision are unchanged. No fix required.
- [Pass] **Q3: ownership and replacement semantics.** `README.md:187–195` explicitly closes the browser in `finally`, says publishing replaces the project's directory, and identifies the engine checkout's REVIEW location/index. These match `tools/render.mjs:137–140` and `tools/review.mjs:9,14–22`: the launcher returns the browser; the publisher computes its root from its own module, removes/recreates the project directory, copies files and rebuilds the index. The link dependency at `README.md:179–181` supplies the consumer alias while retaining the manifest's original name. The plan-QA nit was addressed. No fix required.
- [Pass] **Q4: privacy scan.** No git command was run. Equivalent read-only probe: `export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"; python3 "$TMPDIR/inspect-objects.py"`; exit 0. The scratch Python reader decoded stored commit/tree/blob objects, reconstructed the base-to-HEAD text diff and scanned it for home-directory prefixes, email addresses and common credential formats. Decisive output: `changed paths (12)`, `absolute-home hits=1`, `email hits=0`, `credential hits=0`. The sole home-prefix hit is this relay's own generic search instruction containing the literal `/Users/`, with no person's directory. Reading the substantive API/documentation additions found no private repository name. Binary `releases.db` was excluded from text scanning; its corresponding textual `releases.sql` was included. This is a scoped privacy review, not a universal secret-detector guarantee. No fix required.
- [Pass] **Q5: delivered versus deferred.** `CHANGELOG.md:2–7` records the two exports, metadata, docs and deferred external recipes. `PROJECT/2-WORKING/SPECS-PRD.md:266–274` calls the public entry point delivered, explicitly says it is not a RecipeRegistry, and leaves registry/range requirements as targets. This matches the hardcoded dispatch at `tools/render.mjs:195–205`. No fix required.
- [Nit] **Manifest exception in wording.** `README.md:197–198` says “any other import by package name fails,” but `package.json:8` deliberately permits `xyz-layout-engine/package.json`, as the import probe also demonstrates. Optional correction: say other engine subpaths are blocked, except the exported manifest. The map itself matches the approved plan.
- [Unverified — needs clone run] **Clean-machine Chromium setup and execution limits.** `README.md:197` associates `pnpm install` with having the Playwright browser present. The seed has no installed Playwright dependency, so this turn cannot establish whether a fresh machine also needs an explicit `pnpm exec playwright install chromium`; distinguish installing the package from provisioning its browser when documenting that setup. The receipt's browser launch/publication, real consumer, canaries and PDDA remain author-reported clone observations; no such run was repeated here, and no fresh-install browser-cache claim is independently approved. The harness owns the post-turn gate.

Bet: the existing launcher and publisher meet this consumer's current need without a plugin framework. Reversibility: Easy; undo the entry point/map and consumer seam together. Graph tooling was unavailable, so this review used direct source reads and narrow scratch-only probes. Historical claims in the existing changelog/PRD were read as context, not independently re-executed.

Relay closed (Approved), no further turn needed; handing the token to done.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
