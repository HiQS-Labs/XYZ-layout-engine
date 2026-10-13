# RELAY · GH-8 close-out plan QA: Higgsfield CLI skill
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-12.
-->

NEXT: Producer
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
6. **Commit only the relay file** (`relay(gh-8-close-out-plan-qa-higgsfield-cli-skill): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: the plan section "## Close-out: the Higgsfield CLI skill (added 2026-10-12)" at the end of `PROJECT/1-INBOX/GH-8-HIGGSFIELD-SPIKE.md`. Nothing is implemented yet.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-12
- Operational envelope: one operator's local Mac, an agent following a Markdown skill to run the already-installed, already-signed-in `higgsfield` CLI a few times a week for diagram art. Not a service, not CI, not multi-tenant. Machinery must stay commensurate: the plan deliberately adds no script, test or dependency. Do not ask for a runner, a test, or a provider abstraction unless you can show a stated requirement that the plan cannot meet without it.
- Read in full: the plan section above; `SOP.md`; `skills/design-diagram/SKILL.md` (format and install pattern to copy); `examples/2026-10-09-cell-division/inspect-alpha.mjs`; `examples/2026-10-09-cell-division/assets/provenance.json`; skim `examples/2026-10-09-cell-division/higgsfield-cli-spike.py` (the runner the plan chooses not to generalise); `test-budget.json`; `AGENTS.md`.
- Operator decision (not for re-litigation): the CLI is the default route; Phases 1 to 4 of #8 are dropped; #8 closes after this skill lands.
- Definition of Done (for the plan): every requirement is grounded in a real repo path or live CLI fact; the plan meets the operator's ask (a reusable skill that invokes the Higgsfield CLI for verified transparent PNGs) with the smallest surface; spend, secrecy and no-silent-upload rules from `SOP.md` and `AGENTS.md` are carried; the verification is falsifiable (includes a red control).

Questions:
1. Is each Recon claim accurate against the cited files? Cite file:line for any you dispute.
2. Does any requirement from the operator ask or from `SOP.md` go missing from Requirements 1 to 5?
3. Is "skill only, no new script" the right call given the envelope, or does a stated requirement (spend cap, alpha proof, provenance, redaction) actually need code? Answer with the concrete requirement and why prose cannot carry it.
4. Is the verification enough to catch a wrong skill (wrong flag, wrong path, inspector not proving alpha)? Is the red control (earth.png true / solar-system.png false) meaningful?
5. Anything over-built, or anything the plan should drop?

Grade each finding [Blocker]/[Should]/[Nit]/[Unverified — no citation]; a [Blocker] or [Should] asking for a behaviour change needs Observed input / Affected scope / Falsifier lines. Set STATUS: Approved if the plan can be implemented as written (Nits allowed).

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1

VERDICT: FAIL
Basis: The skill-only scope is appropriate, but correct the signed-download instruction before implementation. This is a documentation correction, reversibility Easy; the failure mode is teaching an agent to discard the download credential before making the request.
swept file: yes

Read the entire GH-8 document, SOP, design-diagram skill, inspector, provenance and test budget; skimmed the CLI runner. The earlier Phase 0/0b requirements are historical; their stale status is already covered by the planned status update. No additional pre-existing defect in the reviewed plan file requires expanding this close-out. Graph tools were unavailable, so evidence is direct source reading. No git, paid calls, fixture execution or test suites ran.

- [Should] Correct the Recon summary's “download without the query string” (`PROJECT/1-INBOX/GH-8-HIGGSFIELD-SPIKE.md:180`). `SOP.md:26` says download the signed `result_url` but do not store its query; the runner separately records `url_noquery(url)` and calls `self.fetch(url)` (`examples/2026-10-09-cell-division/higgsfield-cli-spike.py:430`). Cheapest fix: explicitly preserve the complete signed URL for the download request, while excluding its query from logs, chat and durable provenance. No new script required.
  Observed input: The literal instruction at plan line 180 conflicts with the cited SOP and runner's treatment of a signed `result_url`.
  Affected scope: CLI result downloads whose query carries authorization; this does not change the prohibition on recording signed queries.
  Falsifier: A revised procedure that passes the complete returned URL to the downloader and stores only a query-free URL resolves this finding; if the Producer intended only record redaction, make that distinction explicit. No live URL was fetched and no HTTP failure is claimed.
- [Pass] Keep the Markdown-only mechanism. The existing runner bakes in `CAP_CREDITS = 20.0`, `BASELINE_CREDITS = 701.0` and a five-job `MATRIX` (`examples/2026-10-09-cell-division/higgsfield-cli-spike.py:48`, `:49`, `:70`); the plan instead carries cap, quote-before-create, serialization, no automatic retry and balance checks at line 191. Nothing in this single-operator envelope demonstrates a need for another runner, test or provider abstraction. Preserve cumulative spend accounting when writing the procedure.
- [Pass] Secrecy, explicit upload authorization, provenance and installation have existing owners: plan lines 190–193, `SOP.md:29`, `SOP.md:35`, `SOP.md:37`, `examples/2026-10-09-cell-division/assets/provenance.json` (the `original` and `web` records), and `skills/design-diagram/SKILL.md:59` (maintained-primary-clone symlink, preserve different existing entry). Carry these into the skill as planned.
- [Pass] The free CLI help supports the chosen mechanism and the upload warning. Probe commands: `higgsfield --version`, `higgsfield generate create --help`, `higgsfield generate cost --help`; each exited 0. Decisive output: `higgsfield 1.1.26`; create says “Use --wait to block until each job finishes and print the result URL(s).”; cost says “Estimate credits without creating a job.” and “Local file paths are auto-uploaded.” The latter warning applies even during cost estimation.
- [Pass] The proposed two-file alpha control is meaningful: the inspector computes `real_alpha` from header alpha plus decoded minimum alpha and transparent pixel count (`examples/2026-10-09-cell-division/inspect-alpha.mjs:72`); historical control outcomes are recorded in `examples/2026-10-09-cell-division/FINDINGS.md:40`. The planned help/model checks and path checks at plan lines 213–215 address wrong flags and missing paths. Compare the JSON boolean explicitly: an opaque decoded file still exits 0 (`inspect-alpha.mjs:79`).
- [Nit] Make the PNG acceptance condition explicit alongside alpha: require `format: "png"` as well as `real_alpha: true`. The inspector also handles WebP (`inspect-alpha.mjs:65`), so alpha alone is not a format assertion. This clarifies the already-stated PNG requirement at plan line 190 without adding machinery.
- [Unverified — needs clone run] The current earth/poster inspector control and PDDA gate were not executed in this review environment. Run the existing planned checks in the disposable full clone; do not interpret historical evidence as a fresh pass.
- [Unverified — no citation] Current sign-in/model schema, global Higgsfield skill behavior, resolver catalog contents and the exhaustive Claude-log assertion at plan lines 183–186 were not independently established here. Cite the Producer's concrete source/probe for these peripheral Recon claims or narrow them to the evidence actually inspected; they do not justify additional implementation scope.

Handing off to Producer (claude-a): correct the download wording, disposition these findings, and return the plan for review.

### Producer · Round 1

- [Should] signed download → Accepted. Recon line now says "download the signed `result_url` but never store its query string"; Requirement 4 now says download with the complete signed URL and keep the query out of files, logs, chat and provenance.
- [Nit] PNG format → Accepted. Requirement 3 now requires `format: "png"` and `real_alpha: true`, compared as JSON values, and notes the inspector exits 0 for opaque files.
- [Pass] cost also uploads → Folded in. Recon and Requirement 4 now cover `generate cost` as well as `create`, with the real flag names `--image-references` / `--image`.
- [Unverified — no citation] → Accepted, citations added to Recon: the CLI probes run (credits field only from `account status`), the global skill's path and rule number, the resolver search (working tree, all remote branches, the 2026-10-12 session transcript), and the MCP evidence (search of every Claude Code session transcript for Higgsfield MCP tool calls or `mcp.higgsfield.ai`; none found apart from the 401 probe). No change in scope.
- [Unverified — needs clone run] → Agreed. The inspector controls and PDDA gate run at implementation time; historical results are not counted as a fresh pass.

Back to Reviewer (codex) for round 2.

### Reviewer · Round 2

VERDICT: PASS
Basis: Approve the plan for implementation as written. The signed-download correction resolves the previous Should; explicit PNG/alpha checks and upload authorization now cover the remaining clarifications. Markdown plus the existing CLI and inspector is proportionate to the stated single-operator envelope. Reversibility: Easy. The bet is that the numbered procedure carries these controls; skipped steps remain the documented failure mode and trigger to revisit a runner (plan line 205).
swept file: yes

Re-read the entire GH-8 document, SOP, design-diagram skill, inspector, provenance and test budget; skimmed the existing runner. No additional pre-existing defect in the reviewed plan file requires expansion of this close-out. Historical phase/status text is covered by the planned status update at `PROJECT/1-INBOX/GH-8-HIGGSFIELD-SPIKE.md:221`. Graph tools were unavailable; this review uses direct source evidence. The Producer called this round 2 in its last block; the header round counter was left unchanged because the protocol assigns increments to the Producer.

- [Pass] Previous download finding resolved: `PROJECT/1-INBOX/GH-8-HIGGSFIELD-SPIKE.md:180` and `:193` distinguish the complete signed download URL from prohibited query retention. This matches `SOP.md:26` and the runner at `examples/2026-10-09-cell-division/higgsfield-cli-spike.py:430`, where recording uses `url_noquery(url)` and fetching uses `self.fetch(url)`. No new downloader is needed.
- [Pass] Requirements cover the operator workflow: plan lines 190–194 include provenance, a written cap, matching quote/create flags, finite-price and cumulative-cap refusal, serialization, no automatic retry, balances, secret exclusion and explicit upload authorization. These carry `SOP.md:20` through `:37`; the existing provenance JSON supplies the `original` and `web` records. The install pattern remains the maintained-primary-clone link in `skills/design-diagram/SKILL.md` under “Install.” Keep these details in the implementation; no missing requirement warrants another script or suite.
- [Pass] The alpha acceptance condition is now falsifiable: plan line 192 requires both `format: "png"` and `real_alpha: true` as JSON values, plus visual inspection. `examples/2026-10-09-cell-division/inspect-alpha.mjs:72` combines header alpha, minimum decoded alpha and transparent pixels; line 79 exits successfully for a decoded opaque image, making the explicit boolean comparison necessary. The two-file control at plan line 214 tests that distinction; `FINDINGS.md:40` records the historical true/false outcomes. Help/model/path checks at plan lines 213–215 target wrong flags and paths. No additional test is justified.
- [Pass] Fresh free probes: commands `higgsfield --version`, `higgsfield generate create --help`, and `higgsfield generate cost --help` each exited 0. Decisive output: `higgsfield 1.1.26`; create help says “Use --wait to block until each job finishes and print the result URL(s).” and names `--image-references` with short alias `--image`; cost help says “Estimate credits without creating a job.” and “Local file paths are auto-uploaded.” This directly supports plan lines 183 and 193. Probe logs were confined to `.relay-scratch/`; no create, upload or account query ran.
- [Unverified — no citation] The Producer has identified its sources for resolver-wide and transcript-wide searches at plan lines 185–186, but I did not independently repeat those searches or establish current sign-in/model-schema state. These peripheral claims remain Producer evidence, not fresh reviewer verification; they do not block this local skill plan.
- [Unverified — needs clone run] Inspector controls, completed-skill command/path checks and PDDA verification remain implementation-time work. No executable fixture, test suite, PDDA gate, roadmap command, paid generation or git command ran in this restricted reviewer turn. Approval applies to the plan, not a claim that the absent skill already passes.

Relay closed (Approved), no further review turn needed. Producer (claude-a) may implement the approved plan and run its existing verification in the disposable full clone.


### Attestation · relay-drive — 2026-10-13T03:05:38Z
task: GH8-CLI-SKILL-PLAN-20261012
reviewer: codex
status: Approved
reviewed-head: 9b539aa9c1493d9c647e08b387034936a4515516
added-range: 13796+4232
added-sha256: e227e188983c74589a88c5e95595c7b4600854b3a12c3a1542664c24750bdcce
<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
