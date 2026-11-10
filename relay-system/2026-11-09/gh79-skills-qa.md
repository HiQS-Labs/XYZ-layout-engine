# RELAY · GH-79 Skills QA (hallmark & impeccable)
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
-->

NEXT: Reviewer
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

<!-- END OF LOG MARKER — append new turns immediately above this line -->
