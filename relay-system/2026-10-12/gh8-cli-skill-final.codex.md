# RELAY · GH-8 close-out final QA: Higgsfield CLI skill
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-12.
-->

NEXT: Reviewer
STATUS: Open
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
6. **Commit only the relay file** (`relay(gh-8-close-out-final-qa-higgsfield-cli-skill): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: the implementation commit `d8fdbb4` on this branch (diff against `origin/main` = `9f5aa79`): `skills/higgsfield-cli/SKILL.md` (new), `SOP.md`, `CHANGELOG.md` (top entry), `PROJECT/1-INBOX/GH-8-HIGGSFIELD-SPIKE.md` (status line). The approved plan is the "## Close-out: the Higgsfield CLI skill" section of that doc; its plan QA is `relay-system/2026-10-12/gh8-cli-skill-plan.codex.md` (Approved round 2).
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-12
- Operational envelope: one operator's local Mac; an agent follows a Markdown skill to run the installed, signed-in `higgsfield` CLI a few times a week. No script, test or dependency was added on purpose (plan Non-goals, `test-budget.json`). Do not ask for one unless a stated requirement cannot be met without it.
- Producer's verification evidence (2026-10-12, this clone):
  - Repo paths named in the skill: `SOP.md`, `SYSTEM-INSTRUCTIONS.md`, `examples/2026-10-09-cell-division/FINDINGS.md`, `.../assets/provenance.json`, `.../inspect-alpha.mjs` all tracked (`git ls-files --error-unmatch`).
  - Inspector red control: `node examples/2026-10-09-cell-division/inspect-alpha.mjs examples/2026-10-08-solar-system/assets/web/earth.png examples/2026-10-08-solar-system/solar-system.png` → earth `format png, real_alpha true, minAlpha 0`; solar-system `format png, real_alpha false, minAlpha 255, opaqueCornerCount 4`.
  - Free CLI checks (no create): `higgsfield generate cost gpt_image_2_5 --prompt "..." --variant flare --quality low --resolution 1k --aspect_ratio 1:1 --background transparent --json` → `{"credits": 0.25}`; the same with `--background bogus` → `Error: Invalid values: background=bogus (allowed: auto,opaque,transparent)`; `higgsfield generate list --json` exit 0; `generate create --help` names `--image-references` / `--image` and says local paths are auto-uploaded.
  - `utils/pdda/pdda.sh run`: no errors, 33 warnings, all dead `ROADMAP.md` / `.claude/skills/pdda` references in `ROUTER.md`, `PROJECT/PDDA.md`, `utils/pdda/PDDA-INSTALL.md` (files this change does not touch).
- Definition of Done: the skill meets plan Requirements 1 to 5 exactly; every command, flag and path in it is real; nothing contradicts `SOP.md` or `AGENTS.md`; no secret, upload or retry hazard; the diff contains nothing outside the plan.

Questions:
1. Does `skills/higgsfield-cli/SKILL.md` satisfy each plan requirement (1 to 5)? Cite the skill line for each.
2. Is any CLI command, flag or JSON field in the skill wrong for `higgsfield` 1.1.26? (You may run free `--help` / `model get` probes; no `generate create`, no `generate cost` with a local file.)
3. Do the spend rules hold up: is "spent so far" defined so a lagging balance cannot let spend pass the cap, and is every ambiguous create a stop?
4. Do the SOP edits keep the SOP and the skill consistent, and is anything still pointing at the dropped Phases 1 to 4?
5. Anything over-built, missing, or outside the plan in the diff?

Grade each finding [Blocker]/[Should]/[Nit]/[Pass]; a [Blocker] or [Should] asking for a behaviour change needs Observed input / Affected scope / Falsifier lines. Set STATUS: Approved if it can ship as is (Nits allowed).

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
