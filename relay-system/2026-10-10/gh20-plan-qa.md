# RELAY · Finalized three-ID / catalog plan (issue 20 plan comment): plan QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-10.
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
6. **Commit only the relay file** (`relay(gh20-plan-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: the finalized plan embedded below (also posted as a comment on issue #20; there is no repo file for it). Source paths it plans against: `tools/catalog.mjs`, `tools/catalog.sql`, `tools/render.mjs`, `ROUTER.md`, `PROJECT/2-WORKING/SPECS-PRD.md`, `PROJECT/2-WORKING/GH-10-RECIPE-CATALOG.md`, `PROJECT/2-WORKING/GH-9-STACKING-RESPONSIVE-FLAGS.md`, `examples/2026-10-08-solar-system/verification.json`, `examples/2026-10-09-rag-system/verification.json`, `examples/2026-10-09-cell-division/verification.json`, `test-budget.json`, `GUIDING-PRINCIPLES.md`, `AGENTS.md`.
- Reviewer: agy   ·   Producer: claude-a
- Started: 2026-10-10

### Artifact — plan.md
```
## Finalized plan: three-ID model, one catalog CLI, grid core next

**This comment is the current plan for #20 and supersedes the plans in #9 and #10.** Recorded 2026-10-10 after the operator's answers below. Related: #5 (delivered), #19 (umbrella, re-scoped), #21 (design data log).

### Constraints this plan is built around

1. **Early project: don't paint ourselves into the future.** Reversible, additive steps first; nothing that makes a Costly decision (grid string format, design ID format) before real data exists.
2. **Immediately usable.** Each step ships something that works today.
3. **Maintainable and flexible.** One owner module, one text source of truth, one write path, and a place to grow.

### Decisions recorded

| Question | Decision |
|---|---|
| How much of #20 in the first cut | **Recipes plus designs now.** Layouts and the grid parser follow in the next phase. |
| Serial IDs (RCP-0001 style) | **Dropped.** A use case is `slug@semver`, as in the PRD (§6.2). |
| GH-9 stacking flags | **Folded into the grid core.** Stacking becomes choosing a layout string by canvas width. |
| Issue edits | #9 and #10 superseded; #19 re-scoped; #5 pointer only; #8 untouched. |
| Feedback loop | New issue #21: an append-only design log to judge the grid grammar on real data. |

### What already exists (state as of this comment)

- GH-5 (PR #18) delivered the shared render operation, recipes and request schema that #20 was waiting on.
- GH-10's marathon built, on a local branch not yet pushed, a catalog: `tools/catalog.mjs` (CLI: `list`, `show`, `add`, `publish`, `update`, `deprecate`, `retire`, `verify`, `export [--check]`, `import`), a committed canonical dump `tools/catalog.sql`, `node:sqlite` with no new dependency, immutable published versions enforced by triggers, and a render-time catalog identity hook. It still carries a serial; Phase A1 removes it.

### Phase A: one catalog, usable now (two small PRs, stacked)

**A1. Finish the GH-10 catalog without serials** (`Refs #10`, `Refs #20`).
- Remove the `serial` column, `serialName` and every `RCP-` reference from code, README and plans. A recipe is identified by slug; a version by `slug@semver`.
- Keep everything else: immutable versions bound to a content digest, `verify`, `export --check`, no committed binary.
- Acceptance (each can fail): `catalog verify` passes on the seeded dump; republishing different content under the same version exits non-zero; a dump hand-edited to differ from `export` fails `export --check`; no `serial` or `RCP-` text remains (`git grep` returns nothing); `pnpm test` passes within the 60 s budget; the four existing canaries and byte-identical golden artifacts are unchanged.

**A2. Add designs and the ROUTER pointer** (`Refs #20`, `Refs #21`).
- Add a `designs` table to the same module and the same dump (no second DB file, no second module): design ID in `date-slug` form, pinned use case and version, `layout_id` (null until Phase B), params, data hash, artifact digest. No timestamps in the dump so it stays deterministic.
- Designs are insert-only. The CLI gets `design list`, `design show` and `design add`, and has no update or delete; an edit forks a new design.
- Seed the three existing examples (solar system, cell division, RAG) from their `verification.json` digests.
- `design add` also appends one line to the design log from #21.
- Add the pointer to **ROUTER.md** (repo-owned; the installer will not overwrite it): in the role split, one line naming `tools/catalog.mjs` and `tools/catalog.sql` as the recipe and design catalog; in the canonical rules, "Change the catalog only through `node tools/catalog.mjs`; `tools/catalog.sql` is generated output, never hand-edited."
- **Enforcement is the existing gate, not a new mechanism:** `catalog verify` and `export --check` run inside the existing canary, so a hand-edited dump fails `pnpm test`. No git hook and no new check. Revisit if someone bypasses the CLI in practice.
- Acceptance: the three seeded designs read back with matching digests; a second `design add` for the same ID is refused; ROUTER.md names the CLI; a hand edit of `catalog.sql` fails `pnpm test`; no new test file, workflow or dependency beyond extending the existing canary.

**Deliberate change to #20's storage text:** #20 proposed a separate `designs.sql` plus a gitignored `designs.db`. Phase A keeps one dump (`tools/catalog.sql`) and builds the database in memory on each run. One owner and one write path beat two files for three seed rows. Splitting later is Easy because the dump is plain SQL.

### Phase B: grid core (next marathon, planned after A2 merges)

- One parser and canonical form for the grid string (digit = span, `0` = empty cell, `-` = next row, GCD-reduced, equal row sums), and one geometry function (`colW = (W - (N-1)·gap) / N`, `boxW = span·colW + (span-1)·gap`) in the engine core, used by at least one existing render path. Add §6.6 to `SPECS-PRD.md`, reusing the existing recipe and fingerprint definitions.
- Fill `layout_id` on designs; add `use_case_layouts` when the first use case declares an allow-list.
- **Responsive stacking replaces GH-9:** a use case supplies a layout per canvas-width band (for example `1111` wide, `1-1-1-1` narrow); the engine picks the layout and computes the boxes. No flex-column or CSS `order` mechanism, no second layout engine, no runtime measurement.
- Acceptance: the same string always yields the same geometry in both backends; `22` and `11` normalize to one canonical form; a spec with unequal row sums is rejected; unflagged recipes stay byte-identical.

### Deferred, with the trigger that revives each

| Deferred | Revive when |
|---|---|
| Row spans and nesting | `needed_row_span` is true in the #21 log, or a real design needs a tall box |
| Non-grid families (`orbit:8` style prefix) | a second non-grid design is made (the solar system is the first) |
| Bracketed spans for 10+ columns | `needed_span_over_9` is true |
| Layouts table and allow-lists | Phase B lands |
| Separate `designs.db` / remote `tenant_id` | a second writer or remote mode exists |
| Variants, aliases, semver ranges | something consumes them |
| Grid string as a published, stable ID | the #21 log has reviewed at least 10 designs |

### Reversibility

| Change | Read |
|---|---|
| Dropping the serial (before anything is pushed) | Easy |
| Designs table and CLI verbs | Easy (rebuild from the dump) |
| ROUTER.md rule | Easy |
| Grid string format, once designs pin it | Costly, which is why Phase B waits for #21 data before publishing it as an ID |
| Design ID format, once shared outside the repo | Costly |

### Issue disposition

- #10: superseded. The identity scheme moves to this plan (no serial); the delivered catalog CLI is the foundation of Phase A.
- #9: superseded. The mechanism is folded into Phase B.
- #19: re-scoped. The umbrella now tracks Phase A, then Phase B.
- #5: delivered; pointer only.
- #8: unaffected.

### Next steps

1. Drop the serial in the GH-10 branch, re-run the gate, get one independent review of the change, then push and open the A1 PR (stacked on PR #18's branch). Not merged by automation.
2. Build and review A2 on top of it.
3. Plan Phase B as a separate marathon once A2 is reviewed; GH-9 stays unfired.
```
- Definition of Done: the plan satisfies the operator's three non-negotiables (early project: do not commit to expensive-to-change decisions yet; immediately usable value; maintainable and flexible) and the stated decisions (recipes plus designs now; no serial; GH-9 folded into a grid core; ROUTER.md pointer and a single CLI as the only write path for the catalog). Claims about existing code match the files; Phase A is surgical and DRY (one module, one dump, one write path) and extends the existing GH-10 catalog; every acceptance check can fail; reversibility reads are honest; deferred items name a real trigger; the plan keeps the repo's no-new-tests / test-budget / no-new-dependency rules; nothing public contains personal data, credentials or absolute home paths.

## QA brief (read before reviewing)

Operational envelope: a local single-developer library and CLI in an early-stage public repo; no tenants, no network service. Grade against the stated requirements and commensurate complexity; do not demand enterprise machinery. This is plan QA: no code is under review except where the plan makes claims about it.

Read the plan in full, then these files in this clone: `tools/catalog.mjs`, `tools/catalog.sql`, `ROUTER.md`, `PROJECT/2-WORKING/SPECS-PRD.md` (section 6), `test-budget.json`, and the three `verification.json` files named in Setup. The original proposal is issue #20 (not in the clone; its text is summarised in the plan).

Questions:
1. Fit to the three non-negotiables: does each phase avoid Costly commitments now, deliver something usable immediately, and stay maintainable? Where does the plan paint the project into a corner, or over-build?
2. Grounding: do the plan's claims about the existing catalog (CLI verbs, tables, triggers, dump, `verify`, `export --check`, no committed binary) match `tools/catalog.mjs` and `tools/catalog.sql`? Do the three example `verification.json` files each carry the digest the designs seed needs (`artifactDigests`)? Are the stated seed fields enough, and is anything in them non-deterministic (timestamps in a canonical dump)?
3. Single write path: is "one module, one dump, ROUTER.md rule plus the existing `catalog verify` / `export --check` in the test gate" enough to make the CLI the only way to change the catalog, without a new hook or check? What is the cheapest way someone bypasses it, and does the plan's revisit trigger cover that?
4. The deliberate deviation from #20 (one dump `tools/catalog.sql` and an in-memory database, no separate `designs.sql` or gitignored `designs.db`): is that justified, and is splitting later really Easy?
5. Phase A2 acceptance and the data log (#21): can each check fail? Is "one line per design, recording twice is refused" consistent with designs being insert-only and with the log being append-only and never read by the engine?
6. Phase B: is "responsive stacking = pick a layout string by canvas width" a sound replacement for GH-9, and what does it leave unsolved (for example `stackOrder` reordering, differing box content per band, connectors)? Are the deferred triggers realistic?
7. Hygiene: no closing keywords next to issue numbers, no personal data or absolute home paths, issue dispositions (#10 and #9 superseded, #19 re-scoped, #5 pointer, #8 untouched) consistent with the plan.

Output: graded findings with citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, and `swept file: yes|no`. Every `[Blocker]` or `[Should]` asking for a behaviour change must carry `Observed input:`, `Affected scope:` and `Falsifier:` lines. Set STATUS Approved only on PASS.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1

- `[Blocker]` Seed data is not available in `verification.json` as claimed. The plan states "Seed the three existing examples... from their verification.json digests" and requires storing `params`, `data hash`, and `use case and version`. However, `verification.json` lacks these fields; they exist in `fixture.json` and the recipe modules. Additionally, `verification.json` contains multiple `artifactDigests` (png, svg, html, chromiumPng), making "artifact digest" ambiguous.
  Observed input: `jq 'keys' examples/2026-10-08-solar-system/verification.json` returns `["artifactDigests", "assets", "chromiumText", "findings", "generatedAt", "height", "imageNodes", "renderer", "satoriBounds", "textIds", "width"]` without `params` or `dataHash`.
  Affected scope: Phase A2 seed instructions and table schema.
  Falsifier: `verification.json` does not contain the necessary fields to seed the `designs` table. The plan must clarify the data source (e.g. `fixture.json`) and which specific artifact digest (e.g. SVG) is pinned.
- `[Blocker]` Hand edits to the `designs` table will not be caught by existing checks. The plan claims "Enforcement is the existing gate... so a hand-edited dump fails pnpm test." However, `verify` only checks hashes for `recipes` and `recipe_version_files`, not `designs`. A correctly formatted manual `INSERT INTO designs` row added to `catalog.sql` will perfectly match `exportDump(db)` serialization and pass `export --check`.
  Observed input: Adding a correctly serialized `INSERT INTO designs` row to `tools/catalog.sql`.
  Affected scope: Phase A2 enforcement and acceptance criteria claiming no new checks are needed to catch hand edits.
  Falsifier: Running `pnpm test` after adding a well-formatted `designs` row will pass, bypassing the CLI without detection.
- `[Should]` The plan claims "Responsive stacking replaces GH-9" by picking a layout string by canvas width, but fails to document what this leaves unsolved. Since the grid core maps items by document order, a layout string change cannot alter the visual order of elements or change box content per band.
  Observed input: A requirement to place an image above text on narrow screens and right of text on wide screens.
  Affected scope: Phase B's claim to fully replace GH-9 with layout strings.
  Falsifier: A purely string-based layout parser cannot reorder the underlying DOM/React tree rendering order without a separate mechanism.
- `[Pass]` Removed serial constraint and verification steps. Verified `tools/catalog.mjs` and `tools/catalog.sql` both contain `serial` and `RCP-` references (e.g., `tools/catalog.mjs:15` `const serialName = n => \`RCP-${String(n).padStart(4, '0')}\`;`). The planned surgical Phase A1 correctly targets these for removal.

VERDICT: FAIL
Basis: The plan's claims about test enforcement for hand edits and the contents of `verification.json` are incorrect and need to be addressed.
swept file: yes

### Producer · Round 1 (claude-a): dispositions and revised text

- **[Blocker] seed data is not in `verification.json`:** Implemented. Confirmed: its keys are `artifactDigests, assets, chromiumText, findings, generatedAt, height, imageNodes, renderer, satoriBounds, textIds, width`. Fields now come from the right sources: params stay in the fixture file referenced by `fixture_path` + `data_hash`; the artifact digest is the `png` entry of `artifactDigests`. Also found by this review: only the solar system is a catalog recipe, so RAG and cell-division seed with a null use case (logged in #21 as `no_recipe`).
- **[Blocker] hand edits to `designs` are not caught by `export --check`:** Implemented. Agreed: `export --check` only proves the dump matches the database built from it. The plan now states the real checks (`catalog verify` recomputes digests from files, checks the pinned version exists, requires exactly one #21 log line per design) and states the honest limit (not tamper-proof; a fabricated consistent row equals what the CLI writes) with a revisit trigger.
- **[Should] Phase B leaves things unsolved:** Implemented. Added what layout-by-width does not solve (reordering, per-band content), that GH-9's `stackOrder` is dropped, and the trigger to revive it.
- **[Unverified — no citation] serial removal grounding:** noted.

Revised text (replaces the corresponding text in the embedded plan above; the whole revised plan is the comment on issue #20, edited in place):

**A2. Add designs and the ROUTER pointer** (`Refs #20`, `Refs #21`).
- Add a `designs` table to the same module and the same dump (no second DB file, no second module). Columns: design ID in `date-slug` form; pinned use case and version (**nullable**, see seeds); `layout_id` (null until Phase B); `fixture_path` and `data_hash` (sha256 of that fixture file's bytes); `artifact_path` and `artifact_digest` (sha256 of the primary PNG, which equals the `png` entry of `artifactDigests` in the example's `verification.json`). Parameters stay in the fixture file and are referenced by path and hash, not copied into the DB. No timestamps, so the dump stays deterministic.
- Designs are insert-only. The CLI gets `design list`, `design show` and `design add`, and has no update or delete; an edit forks a new design.
- **Seeds, stated honestly:** only the solar system is a catalog recipe, so it seeds as `solar-system@1.0.0`. The RAG and cell-division diagrams are hand-built example scripts, not recipes, so they seed with a **null use case**. That is a real finding for #20's "record any split that feels forced" and is logged in #21 as `no_recipe`. Phase B or a later recipe promotion pins them.
- `design add` also appends one line to the design log from #21.
- Add the pointer to **ROUTER.md** (repo-owned; the installer will not overwrite it): in the role split, one line naming `tools/catalog.mjs` and `tools/catalog.sql` as the recipe and design catalog; in the canonical rules, "Change the catalog only through `node tools/catalog.mjs`; `tools/catalog.sql` is generated output, never hand-edited."
- **Enforcement, stated honestly.** `export --check` only proves the dump matches the database built from it, so a well-formed hand-written `INSERT` passes it. The real checks are consistency checks that `catalog verify` (already in the existing canary) gains for designs: recompute `data_hash` and `artifact_digest` from the files on disk; confirm a pinned recipe version exists; confirm there is exactly one #21 log line per design. A forged row with a wrong digest, or a row with no log line, fails `pnpm test`. This is a convention backed by consistency checks, not tamper-proofing: a person can still fabricate a row, file and log line that agree, which is the same thing the CLI would write. No git hook and no new check beyond extending `verify`. Revisit if a bypass is seen in practice.
- Acceptance (each can fail): the three seeded designs read back with matching digests; a second `design add` for the same ID is refused; a `designs` row with a wrong digest fails `verify`; a `designs` row with no log line fails `verify`; ROUTER.md names the CLI; a hand edit to a recipe version row fails `verify`; no new test file, workflow or dependency beyond extending the existing canary.


Phase B addition (inserted before the Phase B acceptance line):

- **What this does not solve (deliberately):** layouts place boxes by reading order, so every width band must keep the same source order and the same content. Moving an image above the text on narrow canvases and to the right on wide ones, or showing different content per band, needs a per-band slot map. GH-9's `stackOrder` (`source` / `priority` / `rtl`) is therefore dropped, not delivered. Revive when the first real design needs a different order or different content on a narrow canvas.

Plan header addition:

> Revised after plan QA (same day): the design seeds named `verification.json` as the source of fields it does not hold, and two of the three examples are not recipes; `export --check` cannot catch a well-formed hand-written `designs` row, so the plan now says what actually catches it; Phase B now says what layout-by-width leaves unsolved.

### Reviewer · Round 2

- `[Pass]` Seed data sourcing is corrected. Verified that the plan now accurately reflects that `verification.json`'s `artifactDigests.png` is used for the artifact digest, and parameters are referenced from the fixture file rather than copied into the DB (e.g. "sha256 of the primary PNG, which equals the `png` entry of `artifactDigests` in the example's `verification.json`").
- `[Pass]` Enforcement of the single write path is now honest. The plan correctly acknowledges that `export --check` will not catch well-formed manual inserts, and delegates consistency checking to `catalog verify` which will "recompute `data_hash` and `artifact_digest` from the files on disk" (satisfying the maintainable/single write path constraints).
- `[Pass]` Phase B limitations documented. The plan now explicitly states that GH-9's `stackOrder` is dropped and layout-by-width assumes "every width band must keep the same source order and the same content", with a trigger to revive it.

VERDICT: PASS
Basis: The producer successfully resolved the blockers regarding seed data sources and enforcement gaps. The plan now meets the Definition of Done.
swept file: yes

relay closed (Approved), no further turn needed.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
