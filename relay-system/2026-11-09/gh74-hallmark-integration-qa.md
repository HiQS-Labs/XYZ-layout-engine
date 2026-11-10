# RELAY · GH-74 Hallmark Integration Scripts QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-11-09.
-->

NEXT: Producer
STATUS: Open
ROUND: 1 / 4

## ▶ TAKE YOUR TURN — read this first (works for ANY agent: Claude, Codex, agy)
1. **Read this whole file** (header, Setup, Ground rules, every block in the Log).
2. **Check it's your turn:** `NEXT` (top) names the role to act. Confirm you are bound to it and the
   last Log block isn't already yours. If not → STOP and reply "wrong window — nudge the <other> window."
3. **Do your role's work** on the artifact named in Setup:
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
6. **Commit only the relay file** (`relay(gh74-hallmark-integration-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268).

## Setup
- Artifact under review: `tools/hallmark.mjs`
- External clone path for testing: `/Users/noelsaw/Documents/GH Repos/hallmark-fork`
- Reviewer: codex   ·   Producer: Antigravity (Claude/Gemini)
- Started: 2026-11-09
- Operational Envelope: Local developer CLI and importable ESM module for reading third-party Hallmark layout macrostructures and themes into XYZ Layout Engine without runtime bloat or baking third-party templates into the repository. Commensurate complexity standard applies: no enterprise multi-tenant overbuilding.

## Definition of Done & QA Questions
1. **Path Resolution & CLI Options**: Does `resolveHallmarkPath` handle relative paths, missing paths, `--from <path>`, and `HALLMARK_PATH` environment variable correctly? Does `runCLI` gracefully validate argument bounds (e.g. `--from` at the end of argv)?
2. **Theme Parsing Robustness**: In `parseThemeMarkdown`, does color extraction handle YAML frontmatter, markdown tables, and multiple color definitions without misassigning roles or dropping valid hex codes?
3. **Macrostructure Lookup**: In `readMacrostructure`, does slug matching (`slug === target || slug.startsWith(target)`) avoid unintended collisions (e.g. matching `1` against `14` instead of `01`)?
4. **Commensurate Complexity & Cleanliness**: Is the implementation surgical, dependency-free (standard Node.js `node:fs` and `node:path`), DRY, and safe to import into other XYZ tools?

## Ground rules
1. This file is the single source of truth.
2. Take a turn only if `NEXT` names your role.
3. One turn = one block appended at the very bottom, above the marker.
4. Stay tight — findings are bullets with `file:line` citations.
5. The Reviewer never edits the artifact.
6. The relay ends on **Approved** (Reviewer only).

## Log

## Reviewer · codex · Round 1 · 2026-11-09

**Block — VERDICT: FAIL**

**Basis:** QA questions 1–3 have reproduced failures: malformed CLI input succeeds, theme colors are unavailable or incorrectly parsed, and numeric macro lookup silently selects the wrong layout. The fixes can stay within this small standard-library module.

swept file: yes

- **[Blocker] F1 — Load theme definitions, not only index metadata** (`tools/hallmark.mjs:35`, `tools/hallmark.mjs:39`, `tools/hallmark.mjs:60`, `tools/hallmark.mjs:122`). On the supplied checkout, `loadThemes('../hallmark-fork')` returns 50 entries, **zero** with nonempty palettes; `list` consequently omits every palette. The manifest contains descriptive bands/hues rather than actual CSS colors, and returning it bypasses all Markdown parsing. Directly parsing `broadside.md` also returns `{ palette: {} }`: its token block uses `oklch(...)`, which the hex-only parser cannot read. Cheapest correction: use index metadata for discovery/name and read the corresponding theme's declared color tokens; preserve supported CSS color values rather than adding a color-conversion subsystem. Keep the manifest-absent fallback usable.
  Observed input: `loadThemes('../hallmark-fork')`, `runCLI(['--from','../hallmark-fork','list'])`, and `parseThemeMarkdown('broadside', fs.readFileSync('../hallmark-fork/skills/hallmark/references/themes/broadside.md','utf8'))` → 0/50 populated palettes, omitted list palettes, and an empty direct palette respectively. The external source's `skills/hallmark/references/themes/broadside.md:23`–26 defines paper, ink, muted and accent tokens.
  Affected scope: live theme loading through the exported module and CLI, with the provided external checkout; current fallback parsing also cannot recover its colors.
  Falsifier: the same checkout produces actual source paper/ink/accent values (e.g. Broadside paper `oklch(92% 0.028 88)` and accent `oklch(53% 0.19 33)`) in both module output and CLI JSON, without fabricated hex conversions.

- **[Should] F2 — Associate colors with their declared roles** (`tools/hallmark.mjs:60`, `tools/hallmark.mjs:63`, `tools/hallmark.mjs:64`, `tools/hallmark.mjs:65`). Whole-line keyword priority and `hexMatches[0]` misassign table colors and discard later definitions. The six-digit substring regex also drops short hex and truncates alpha hex. Cheapest correction: parse bounded role/value declarations and table role cells, accept complete supported hex lengths, and state a deterministic policy for repeated roles; no general Markdown/YAML framework is needed.
  Observed input: `parseThemeMarkdown('x', '| Accent | #abcdef | text on background |')` → `{ paper: '#abcdef' }`; `paper: #ffffff; ink: #111111; accent: #ff0000` → only paper; YAML frontmatter containing `paper: "#fff"` drops paper; `secondary: #aabbccdd` → `#aabbcc`, losing alpha.
  Affected scope: exported parser and Markdown fallback for frontmatter, tables, and multiple declarations; this is distinct from the manifest short circuit in F1.
  Falsifier: those inputs retain accent in the table, all three independent declarations, short paper hex, and the full alpha value respectively; ordinary six-digit frontmatter continues to work.

- **[Should] F3 — Reject ambiguous prefixes / resolve numeric IDs deliberately** (`tools/hallmark.mjs:99`). `find` chooses the first prefix match with no ambiguity check and no numeric normalization. Cheapest correction: prioritize exact slugs, normalize numeric IDs to the delimited number if numeric shorthand is supported, and reject ambiguous remaining prefixes (or require exact slugs).
  Observed input: `readMacrostructure('../hallmark-fork', '1')` → `10-specimen`, while `'01'` → `01-bento-grid` and `'14'` → `14-narrative-workflow`. The supplied directory has IDs 01–21, so `1` currently matches 10–19 and silently selects 10.
  Affected scope: exported macro reader and `macro <slug>` CLI; callers can receive a valid but unintended layout.
  Falsifier: `1` selects 01 under a documented numeric rule or reports ambiguous/invalid input; full slugs and unambiguous supported IDs still select their intended layouts, independent of enumeration order.

- **[Should] F4 — Validate `--from` before dispatch** (`tools/hallmark.mjs:110`, `tools/hallmark.mjs:117`, `tools/hallmark.mjs:118`). A missing option value falls into positional arguments, and dispatch ignores trailing positionals. Cheapest correction: explicitly reject a missing `--from` value (including another option in its place), then validate command arity/unknown options with the existing usage-error path.
  Observed input: with `HALLMARK_PATH='../hallmark-fork'`, `runCLI(['list','--from'])` succeeds; independently, `runCLI(['--from','../hallmark-fork','list','--from'])` succeeds and lists 50 themes/21 macros. The malformed option is silently ignored rather than diagnosed.
  Affected scope: CLI argument parsing only; valid explicit/environment path selection should retain its precedence.
  Falsifier: both malformed inputs throw a clear usage/missing-value error and the executable exits nonzero; `['--from','../hallmark-fork','list']` still succeeds.

- **[Pass] Proportionate implementation and normal import:** only Node built-ins are imported (`tools/hallmark.mjs:5`–7), filesystem operations read local source (`tools/hallmark.mjs:38`, `tools/hallmark.mjs:50`, `tools/hallmark.mjs:90`, `tools/hallmark.mjs:103`), and CLI execution is guarded (`tools/hallmark.mjs:137`). A fresh `node --input-type=module -e "await import('./tools/hallmark.mjs')"` exited 0 with empty stdout/stderr. No enterprise infrastructure or new dependencies are requested.
- **[Pass] Valid paths and basic reads:** relative/absolute resolution and environment selection passed direct assertions (`tools/hallmark.mjs:10`–11); a nonexistent explicit path produced the intended explanatory error (`tools/hallmark.mjs:12`–17). Explicit `--from ../hallmark-fork list` read 50 themes/21 macros, and `macro 14` returned the narrative-workflow source (`tools/hallmark.mjs:103`, `tools/hallmark.mjs:125`).

**Evidence / limits:** Entire 145-line artifact read, including manifest fallback, directory scans, dispatch and entry guard; no additional findings beyond F1–F4. Probes ran as local `node --input-type=module` calls against the supplied checkout and literal parser inputs; no source changes or added tests. Graph discovery/coverage tools were unavailable, so this is a direct-source review. Root causes are the early metadata return/hex-only extraction, whole-line role classification, first-prefix selection, and missing option/arity validation; corrections belong in those existing owners. Reversibility: **Easy**. `utils/pdda/pdda.sh hardcoded-paths` reported one existing error at `PROJECT/2-WORKING/GH-74-HALLMARK-LAYOUTS.md:69`; its printed summary was errors=1 despite exit code 0. That unrelated document is unchanged.

**Handoff:** Producer — address F1–F4, log a disposition for each, and return for review.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
