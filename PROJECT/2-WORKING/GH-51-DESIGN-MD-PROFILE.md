---
gh_issue: 51
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/51
title: "Lightweight Google DESIGN.md authoring profile"
status: "PR ready — awaiting merge"
created: 2026-10-14
updated: 2026-10-14
owner: Codex
goal: "Adopt low-to-medium Google DESIGN.md authoring compatibility without changing existing renders."
doc_type: project
branch: feat/XYZ-layout-engine-gh51-design-md-profile-2026-10-14
---

# GH-51 — DESIGN.md authoring profile

## Status

| What was just completed | What's next |
|---|---|
| PR #53 opened against main after plan/final QA Approved and publication checks; no open review findings. | Await merge of PR #53, then reconcile issue/ledger and safely retire the task clone. |

## Request and evidence

Review Google's format at medium depth, then implement low-to-medium basic
compatibility if effort does not substantially affect the core or existing behavior.
Operator selected latest main and separation from PR #43; explicitly authorized
an official-source review after resolve-research failed both search stages.
See [review](../../docs/design-md/REVIEW.md) and [Recon Map](recon-design-md-profile.md).

| Claim | Probe | Observed at plan time |
|---|---|---|
| Existing work partially covers authoring | GH issues/PRs 42–45; current README and Nutrition DESIGN.md | PR #45 landed, PR #43 open; numbered custom brief remains. |
| Existing Markdown is published content | catalog.mjs declaredFiles and verify; `node tools/catalog.mjs verify` | Nutrition/recursive briefs hashed; baseline valid. |
| Runtime consumes JSON | request.mjs:49–62; render.mjs:184–207 | JSON.parse, trusted recipe validation; no Markdown token path here. |
| Upstream linter is insufficient alone | `npx --yes --package=@google/design.md@0.4.0 designmd lint` on temp probes | Broken reference exit 1; duplicate H2 exit 0; prose-only exit 0 with warning. |
| Governance baseline | `utils/pdda/pdda.sh run` | Exit 0; zero errors, 40 existing governance warnings in a fresh clone. |

## Solution-fit bet, effort and blast radius

Outcome: agents author portable design briefs without implying new renderer features.
Smallest bet: root `DESIGN.md` defines the authoring profile; a compact
`docs/design-md/DESIGN.md` supplies actual YAML token groups and rationale.
Root guide is domain-neutral: metadata and explained token omissions, no global
palette/type-size defaults. The sample is illustrative, not a published/rendered recipe.

Alternatives: (1) just describe Google in README — too little guidance/evidence;
(2) reformat existing pinned briefs — forces publication/version churn;
(3) import YAML into the engine — unnecessary second styling owner;
(4) custom validator/CI gate — duplicates a moving upstream tool.
Select the guide/sample plus optional pinned CLI and manual section review.
Strongest counterargument: docs alone cannot translate every token into runtime
styling. Explicitly limit the claim to authoring/document compatibility.

Reversibility: **Easy**. Current radius is authoring agents and README readers;
the change adds a local sample and optional externally installed lint tool at
authoring time. No runtime/provider calls, automatic upload, new schemas,
dependencies, catalog writes, renderer changes, paid generation, or bulk migration.
Containment: published briefs, fixtures, assets and core files stay byte-identical.
Rollback: revert profile/pointers; remove this task's roadmap row using the existing
writer if abandoning. Existing rendering needs no rollback.

Rating read-back: `rated 60/15/50/85`, calc 210, no override (2026-10-14).
Priority 60: explicit request and useful onboarding; severity 15: portability/
expectations gap, no outage; appeal 50 neutral; effort cheapness 85: bounded docs.
Recent-window scan: all available repo issues (last 14 days 2026-10-01–14,
preceding 2026-09-17–30); #42/#44 are feature work, not repeated incidents.
No recurrence/severity multiplier inferred; older incident history is unknown.

## Ordered implementation and acceptance (one phase)

1. After Approved plan QA, write root guide using Google's eight canonical H2s,
   with authored guidance under each and links to the AS rules. Explain optional
   YAML, recognized groups/references, domain-specific components, preserved extra
   sections, publication/authority boundaries and legacy compatibility.
2. Add a small self-contained token-bearing sample with valid colors, typography,
   spacing, rounded and component references plus substantive rationale. Mark it
   illustrative; no rendering/artwork claims or universal design defaults.
3. Point ROUTER and SYSTEM-INSTRUCTIONS to the guide, and add one README section
   explaining Google's alpha convention, sample, optional pinned lint command and
   limits. Preserve existing AS rules and published contract files.
4. Verify both new docs with Google CLI 0.4.0 (zero errors; disclose any warnings).
   Independently check nonempty canonical section bodies, uniqueness/order and
   local links. Run red controls on temp copies: broken token reference must yield
   lint error/exit 1; duplicate H2 must be detected by a small inline Python/manual
   section check. Record the upstream duplicate-lint limitation instead of hiding it.
5. Check diff containment, catalog verify/export check and RELEASES DB/dump
   consistency; record evidence under `TESTS-RESULTS/2026-10-14-GH-51/`. Run
   PDDA with no new errors (compare pre-existing warning findings).
6. Update changelog/status and commit. Run independent Codex final relay QA on
   diff and evidence; resolve findings within three rounds. Open ready PR against
   main and retain this clone until landing is verified.

No new tests, framework, CI workflow, fixture generator or permanent validator.
The docs-only change does not earn runtime render tests or new visual outputs.
Existing core and published artifact bytes are checked against the integration
base; this is a preservation claim, not a fresh cross-backend render claim.

## QA receipts

- Plan: Approved round 1, `relay-system/2026-10-14/gh51-plan.md`; reviewed input 30f2bb0ecb6b. No required findings.
- Final: Approved full round 1 (reviewed 16cb986be9cc) and wording follow-up round 2 (reviewed 9d7b4ee7bca4), `relay-system/2026-10-14/gh51-final.md`. Both driver calls exit 0 with attested Approved. No open findings remain.
- Red/green authoring evidence: `TESTS-RESULTS/2026-10-14-GH-51/README.md`; zero-error/warning lint on both docs, duplicate/empty controls rejected, broken reference exit 1, 32 local links pass. Catalog verify/export and RELEASES check exit 0. PDDA exit 0, 0 errors and 40 identical pre-existing warning findings (ignoring shifted line numbers).

## Review envelope

Grade the stated documentation requirement and commensurate complexity.
Read full changed documents, research/recon and actual boundary source paths.
Do not demand a YAML importer, enterprise policy framework, new gates, bulk
recipe migration, global palette or changes to PR #43. Reviewer may edit only
the relay thread. Missing evidence, contradictory authority or inflated
compatibility claims are in-scope findings.

## Execution disposition

Full-file README verification found one pre-existing dead Solar System gallery
link at base. Removed that single broken pointer while preserving its working
bundle link; no additional system changes. No production logic or permanent
validator was added. The independent plan reviewer returned Approved round 1
with no required findings.

Post-approval changes are task/review bookkeeping only; the root guide and token
sample remain at the verified hashes. Final hygiene is rechecked before publication.

## PR handoff

[Ready PR #53](https://github.com/HiQS-Labs/XYZ-layout-engine/pull/53), against main.
Publication checks at 0fe2704: PDDA exit 0 with the same 40 baseline warnings,
RELEASES clean, protected runtime/catalog paths unchanged and guide/sample
hashes current. The repository has no configured CI workflows or pre-push hook;
manual repository gates above were run. No hosted check success is claimed.
Task clone is retained for merge handoff; retire through /merge-cleanup only
after landing and preservation checks. This task has not been marked shipped.
