# RELAY · GH-79 Skills QA (hallmark & impeccable)
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
-->

NEXT: Producer
STATUS: Open
ROUND: 1 / 4

## ▶ TAKE YOUR TURN — read this first (works for ANY agent: Claude, Codex, agy)
1. **Read this whole file** (header, Setup, Ground rules, every block in the Log).
2. **Check it's your turn:** `NEXT` (top) names the role to act. Confirm you are bound to it and the
   last Log block isn't already yours. If not → STOP and reply "wrong window — nudge the <other> window."
3. **Do your role's work** on the artifacts named in Setup:
   - **Reviewer:** review vs the Definition of Done → graded findings
     (`[Blocker]`/`[Should]`/`[Nit]`/`[Pass]`), each with a concrete fix → set a **VERDICT**
     (exactly PASS, FAIL, or PARKED) and a **Basis** (explanation). **Review the whole file, not just the diff** (GH-268):
     Pre-existing defects in a file you are touching are IN SCOPE; if you find none, say so explicitly.
     **Declare it: every review block must contain a literal `swept file: yes` or `swept file: no` line.**
     Any `[Pass]` or "verified"/"confirmed" finding MUST carry a quoted span or a `file:line` citation.
     Do **not** edit the artifact; only append findings here.
     Every `[Blocker]` or `[Should]` requesting a behaviour change MUST carry three lines: `Observed input:`, `Affected scope:`, `Falsifier:`.
     A `[Blocker]` must cite an observed failure.
   - **Producer:** log a disposition for every open finding (Implemented / Modified / Declined + why), make the change, then add new work.
4. **Append ONE block** at the very bottom, directly **above** the marker line. Never edit earlier turns.
5. **Update the header:** flip `NEXT`; set `STATUS` (`Approved` closes — Reviewer only; else `Open`).
6. **Commit only the relay file** (`relay(gh79-skills-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268).

## Setup
- Artifact under review: `skills/hallmark/SKILL.md`
- Artifact under review: `skills/impeccable/SKILL.md`
- Related implementation tools:
  - `tools/hallmark.mjs`
  - `tools/craft-lint.mjs`
  - `tools/intake.mjs`
  - `tools/impeccable/audit.mjs`
  - `tools/export-editorial-asset.mjs`
- Reviewer: codex (gpt-5.6-sol, medium reasoning effort)
- Producer: Antigravity (Claude/Gemini)
- Started: 2026-11-09
- Operational Envelope: Agent skill instructions guiding cold agents to discover, adapt, lint, audit, and export layouts using Hallmark macrostructures/themes and Impeccable craft rules. Must be concise, actionable, and mathematically/syntactically faithful to the tools in the repo.

## Definition of Done & QA Questions
1. **Actionable Chained Steps**: Are the steps in both `skills/hallmark/SKILL.md` and `skills/impeccable/SKILL.md` sequenced in correct operational order (discovery/lint -> authoring/preflight -> rendering -> verification/audit -> asset export)?
2. **Accurate Command Syntax & Flags**: Do all CLI invocations (`tools/hallmark.mjs`, `tools/intake.mjs check --craft`, `tools/craft-lint.mjs`, `tools/impeccable/audit.mjs`, `tools/export-editorial-asset.mjs`) match the actual implementation arguments, exit codes, and behavior?
3. **Zero Phantom Machinery / Strict Anti-Slop**: Do the skills provide concise, unambiguous guidance preventing LLM agents from inventing phantom files, unnecessary wrappers, or violating repository conventions (`AS-1` through `AS-14`)?
4. **Self-Sufficiency & Cold-Agent Resumability**: Can a fresh coding agent with zero conversational context read either skill file and successfully complete a Hallmark layout generation or Impeccable craft audit?

## Ground rules
1. This file is the single source of truth.
2. Take a turn only if `NEXT` names your role.
3. One turn = one block appended at the very bottom, above the marker.
4. Stay tight — findings are bullets with `file:line` citations.
5. The Reviewer never edits the artifact.
6. The relay ends on **Approved** (Reviewer only).

## Log

## Reviewer · codex · round 1 · 2026-11-09

VERDICT: FAIL
Basis: Block. The discovery commands fail as written, and the skills omit contracts needed for cold-agent authoring and trustworthy audit/verification. Reviewed both entire skill files, including pre-existing content; findings below cover the defects found. Reversibility: Easy (skill prose corrections only).
swept file: yes

- **[Blocker] R1 — Replace nonexistent Hallmark commands and fallback.** `skills/hallmark/SKILL.md:16`, `:19`, `:22`, `:23`, `:25`: all four example subcommands exited 1 with `Unknown command` in focused probes. The implementation accepts `list`, `macro <slug>`, `theme <slug>` (`tools/hallmark.mjs:193-219`); resolution is explicit `--from`, then `HALLMARK_PATH`, then `../hallmark`, with a missing checkout error and no built-ins (`:9-17`). Fix: document the required existing checkout, use `list` for both inventories, select returned slugs for `macro`/`theme`, and retain the same checkout selection for every command. Treat counts as checkout-dependent inventory, not a hard contract.
  Observed input: `node tools/hallmark.mjs list-macro`, `list-themes`, `show-macro "01 · Bento Grid"`, and `show-theme "Riso"` each exited 1; `list --from .relay-scratch/nonexistent-hallmark` reported a missing checkout.
  Affected scope: Hallmark Step 1 and every downstream workflow depending on discovery.
  Falsifier: Every revised example resolves through `runCLI` against an existing compatible checkout, using returned slugs; a missing checkout is explicitly documented as blocked rather than a built-in fallback.

- **[Should] R2 — Ground authoring in the existing intake contract and repository rules.** `skills/hallmark/SKILL.md:27-31` supplies only dimensions/settings/elements, with no contract, source pin, requirement mappings, artwork pinning, or supported-font constraints. The adapter requires exact top-level fields and a pinned Markdown source (`tools/recipes/design-intake.mjs:55-64`), six-digit palette colors and Barlow Condensed (`:69-71`), and artwork/requirements (`:82-120`). Fix: link `skills/design-intake/SKILL.md`, `tools/recipes/design-intake.contract.md`, and a real fixture; require capabilities discovery and its supported translation/pinning workflow. Both skills should direct cold agents to repo startup and `SYSTEM-INSTRUCTIONS.md` before composition/refinement, including its before/after reports. Do not duplicate those contracts or imply arbitrary theme fonts/CSS can be copied into intake.
  Observed input: Hallmark Step 2 asks a fresh agent to translate directly into `fixture.json`; neither entire skill references the intake contract or startup/design-rule document.
  Affected scope: Cold-agent Hallmark authoring and both skills' compliance with AS-1 through AS-14.
  Falsifier: A cold agent has explicit links to the exact schema/worked example and governing rules, and knows to preserve unsupported requirements rather than invent fields or silently substitute them.

- **[Should] R3 — Describe craft-lint's actual limits and exit semantics.** `skills/impeccable/SKILL.md:28-33` claims proportional integer steps, but `tools/craft-lint.mjs:80-89` only checks numeric sizes are integers >=12. A probe with display=25 and body=13 on a 1200px canvas returned `ok:true`, no findings; it does not enforce AS-12 ratios/percentages or the four-size cap. Empty plates are warnings (`:99`, `:104-109`), and lint only examines top-level `elements`; the style-based elevation/stripe checks (`:58-78`) do not establish rendered CSS compliance for every recipe. Fix: state these boundaries, distinguish errors (exit 1) from warning-only success (exit 0; `:124-138`), require review of warnings and separate AS-12 measurements, and avoid presenting lint success as full AS-14/visual certification. Include the empty-plate warning in Hallmark Step 3's review guidance (`skills/hallmark/SKILL.md:39-41`).
  Observed input: `lintFixture({width:1200,height:1200,elements:[],settings:{type:{display:{size:25},body:{size:13}}}})` returned `ok:true`; source checks no proportional relationship.
  Affected scope: Impeccable Step 2 and Hallmark's preflight acceptance claims.
  Falsifier: Skill text separates the implemented integer floor from manual proportional typography checks and explains warning-only exits and unsupported lint shapes.

- **[Should] R4 — Complete the render-to-current-publication verification chain.** `skills/impeccable/SKILL.md:35-42` jumps from lint to "After rendering" without a render command or explicit workflow link; Hallmark's final checks (`skills/hallmark/SKILL.md:59-63`) omit publication verification/current-run resolution. The renderer publishes under `runs/<id>` and atomically points `manifest.json.current` at it (`tools/render.mjs:444-474`). The audit directory search returns its first HTML recursively, ignoring that pointer (`tools/impeccable/audit.mjs:27-45`), so auditing an export root can select an older run. Fix: reuse/link the dual-backend intake rendering workflow; resolve each backend's current directory from the receipt or manifest, call `verifyPublication()` on that run directory, audit its explicit HTML file, and inspect both PNGs at full size/thumbnail/mobile scale against the source and AS rules before optional asset export. Do not hand-edit exported HTML.
  Observed input: Impeccable's documented directory audit points at a general renders directory; repeated renders retain historical runs while `findHtmlFile` takes the first recursive match.
  Affected scope: Both skills' render/verification order and Impeccable audit target freshness.
  Falsifier: Instructions deterministically select the manifest-current HTML for each backend after rerenders, verify that publication, and give a cold agent a concrete rendering path before auditing/exporting.

- **[Should] R5 — Expose audit prerequisites, fallback, and evidence limits.** `skills/impeccable/SKILL.md:35-44` promises a headless 62-rule/WCAG/bounding audit without explaining the external detector dependency. The local wrapper only locates a binary (`tools/impeccable/audit.mjs:10-24`) and delegates `detect`; if absent it invokes `npx --yes impeccable detect` (`:63-78`), potentially downloading code. It forwards the detector status and maps null status to CLI success (`:81-100`); wrapper success alone cannot prove a detector completed. Fix: document local binary discovery/`IMPECCABLE_BIN`, require an explicit operator decision before a network/install fallback, and report runner, executed detector/version, actual findings and completion evidence. Qualify the 62-rule and named-check claims unless supported by the chosen detector; mark unavailable/failed audits as blocked or unverified and retain visual review.
  Observed input: The documented audit command supplies only an HTML path; absent local tooling, the wrapper selects `npx --yes` with a 30-second timeout, not an embedded detector.
  Affected scope: Impeccable Step 3's offline behavior, prerequisites, and interpretation of audit results.
  Falsifier: A cold agent can identify whether auditing needs a network/install decision and cannot label a missing, timed-out, or unexamined detector invocation as a completed quality check.

- **[Pass] Existing command portions to retain.** Intake `check <fixture> --craft` is accepted and propagates craft errors (`tools/intake.mjs:8-35`); the existing Bento fixture returned `ready:true`, empty unsupported/pending arrays, and `craft.ok:true`. Hallmark's backend/format combinations match `tools/recipes/design-intake.mjs:22` and render flag parsing (`tools/render.mjs:516-533`). Editorial export positional input and `--element`, `--scale`, `--format`, `--out` flags match `tools/export-editorial-asset.mjs:113-124`; markup is returned in JSON (`:94-104`, `:129-130`). Export crops the rendered scene rather than removing all other scene content (`:54-73`), so avoid stronger isolation promises.

Evidence/limits: Focused probe results are in `.relay-scratch/gh79-review-probes.json` and `.relay-scratch/gh79-craft-probe.json` (ephemeral harness scratch). No full suite, remote writes, external detector/download, or visual render was run. Graph lookup required an unavailable project ID/discovery surface; exact source reads were used, with no graph completeness claim. Startup roadmap CLI was unavailable at both documented local paths. Root cause: skill prose drifted from existing tool contracts; fix site: the two skill files; no runtime changes or new machinery are needed for these findings. No artifact edits made by Reviewer. No git commands run; the harness owns the relay-only commit.

Handoff: Producer (Antigravity), disposition R1–R5 and revise the two skills; return to Reviewer for round 2.

<!-- END OF LOG MARKER — append new turns immediately above this line -->
