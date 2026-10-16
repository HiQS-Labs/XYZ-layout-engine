---
title: "Recon — DESIGN.md authoring profile"
status: "Active reference"
created: 2026-10-14
updated: 2026-10-14
owner: Codex
goal: "Bound the document-level DESIGN.md adoption without changing render authority."
roadmap_exempt: true
---

# Recon Map — DESIGN.md authoring profile

## Status

| What was just completed | What's next |
|---|---|
| Traced current authoring instructions, JSON/render boundary and catalog pins at base ed565292d280fec565c30e9612ca31240e84fbf6. | GH-51 is implemented and independently Approved; follow its plan for PR/merge handoff. |

## Subject and change class

Document/consumer contract change. One main-context lane (A–D combined), proportionate
to a few authoring documents. No runtime recon fan-out required.
Graph project `XYZ-layout-engine`, generation `2026-10-13T02:52:30Z`, Verify tier:
design search returned no symbols; coverage excludes tools/examples and indexes the
older primary checkout. Fresh-clone source reads are authoritative for this task.

## The seams — where a change escapes

| Seam | Location at base | Crosses | Breaks if |
|---|---|---|---|
| Agent startup | ROUTER.md:20–29, AGENTS.md:3–5 | New visual authoring | A guide is added without a required reader pointer. |
| Taste and authority | SYSTEM-INSTRUCTIONS.md:5–7, 27–28 | Recipe/fixture ownership | YAML silently overrides existing recipe styling. |
| Human onboarding | README.md:9–19 | Expectations of format support | Document adoption is described as direct Markdown rendering. |
| Published contracts | tools/catalog.mjs:124–148, 200–217 | Immutable content receipts | Existing pinned DESIGN.md is reformatted without a new version. |
| Runtime input | tools/request.mjs:49–62; tools/render.mjs:184–207, 234–239 | Deterministic output | A second Markdown parser/import path is introduced. |

## Call paths in

Agent: ROUTER → SYSTEM-INSTRUCTIONS → design brief → authored fixture/recipe.
Runtime: render CLI → processRequest → normalizeRequest (JSON.parse) →
trusted recipe validate/buildScene → existing fitting/export. DESIGN.md is read
by the authoring agent; catalog reads its raw bytes as declared content.

## State and contracts

Copy/palette remain fixture-owned; geometry/font selection remain recipe-owned.
`tools/catalog.mjs` is the catalog's sole writer. RELEASES changes use the installed
`releases_app.py --root` writer; this fresh clone already has the DB/dump but no
ignored .xyz runtime. Use the primary installation, without installing another.
New root/sample documents are not added to a published recipe's declared file set.

## Build, failure and rollback

Baseline catalog verification: valid, no errors. Baseline PDDA: exit 0, zero errors,
40 pre-existing governance warnings (legacy pointers and absent ignored harness
paths). Root runtime/package/test-budget remain untouched.
Rollback is reverting the authoring documents/pointers and task ledger entry through
the same writer; no artifact rollback or data migration.

## Unknowns

| Unknown | Why it matters | Resolution |
|---|---|---|
| Future PR #43 behavior | Could later provide another brief translation surface. | Kept separate by explicit operator choice; rebase/reconcile when it lands. |
| Future Google alpha changes | Could change lint/schema semantics. | Pin current release and source; reassess deliberately on adoption update. |

## Current-state radius

Authoring agents and README readers; catalog-pinned briefs constrain migration.
No new dependency on a parser, provider or renderer is needed. Nothing cut off
within this bounded trace; Google's entire toolchain and external callers were not audited.
