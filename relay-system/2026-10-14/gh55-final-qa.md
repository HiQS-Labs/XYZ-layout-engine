# RELAY · GH-55 final QA: XYZ Forge diagram example
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-14.
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
6. **Commit only the relay file** (`relay(gh-55-final-qa-xyz-forge-diagram-example): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifacts under review (committed on this branch): `examples/2026-10-14-xyz-forge-system/`
  (`fixture.json`, `render-diagram.mjs`, `README.md`, `.gitignore`, `xyz-forge-system.png`,
  `xyz-forge-system-chromium.png`, `xyz-forge-system.html`, `verification.json`), the `CHANGELOG.md` top entry,
  and the plan with its Evidence table: `PROJECT/2-WORKING/GH-55-XYZ-FORGE-DIAGRAM.md`.
- Source diagram the operator asked to redesign (read-only seed): **.relay-artifacts/xyz-forge-source.png**.
  Style reference: `examples/2026-10-12-belief-reference/renders-v5/satori/render.png` and its README.
- Plan QA: `relay-system/2026-10-14/gh55-plan-qa.md` (Approved, round 2).
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-14
- Operational envelope: one documentation example in a local single-repo layout engine. Grade against the plan's
  requirements and commensurate complexity. The repo's `test-budget.json` forbids new tests without a named failure
  mode; do not ask for one, nor for a recipe, catalog registration or image generation.
- Definition of Done: plan requirements 1–4 and acceptance checks met; evidence in the plan substantiates them.

Questions:

1. Content parity: compare `.relay-artifacts/xyz-forge-source.png` with `xyz-forge-system.png`. Does every
   source node and edge appear, or appear as a simplification the README discloses (README "Simplifications,
   stated")? Does any edge in the redraw misstate direction or meaning (e.g. operator routes, revise loop,
   dispatch, claims, record reads/writes)?
2. Style parity: does the redraw follow the belief reference's palette, type, title panel, stage markers,
   hexagons, connectors and single accent shape (plan requirement 3)?
3. Does `render-diagram.mjs` keep one geometry owner, reuse the shared renderer, and keep checks equivalent to
   the RAG precedent? Any dead code, unused fixture fields or copy that fails AS-7?
4. Does the plan's Evidence table substantiate the acceptance checks (PASS line, red control ids, PDDA, pnpm test)?
5. Is the diff free of accidental files (no SVG, no `.xyz/`, no `.tick/`), and is the CHANGELOG entry accurate?

Cite file:line for disagreements. Set STATUS: Approved if it passes.

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
Basis: One undisclosed source-edge omission prevents content-parity acceptance. The visual treatment and bounded implementation otherwise fit the brief. Correction is Easy: explicitly disclose this omission in the existing simplifications paragraph, or restore the read relationship and regenerate through the existing renderer.
swept file: yes

- [Should] **F1 — disclose the missing PDDA → execution-harness read relationship.** In `.relay-artifacts/xyz-forge-source.png`, the dashed route labelled “reads” rises from PDDA Project Documents (near source x537, y1020), turns at about y540, and points into Execution Harness. The redraw has only a records → Plan read route; `examples/2026-10-14-xyz-forge-system/render-diagram.mjs:103`–106 enumerates the four shelf routes, with none to Execute. `examples/2026-10-14-xyz-forge-system/README.md:41` discloses the omitted harness evidence-write and harness/tick edges, but not this read. Cheapest fix: extend that paragraph to explicitly state that harness reads of PDDA plans/status/handoff context are omitted for readability; alternatively restore the labelled edge. No new test needed.
  Observed input: The seeded source PNG’s concrete PDDA Project Documents → Execution Harness dashed “reads” route, absent from the rendered PNG and the disclosed omissions at README:41.
  Affected scope: This example’s depiction/disclosure of that one source record-read relationship; no engine behavior or other examples.
  Falsifier: A labelled PDDA/shelf → Execute read relationship in the current redraw, or an explicit existing README disclosure of its omission, would invalidate F1. Neither appears in the supplied artifacts.
- [Pass] **Style and remaining main routes:** inspected source, belief-reference v5 PNG, both redraw PNGs and 420px thumbnails. Ivory/slate palette, Barlow Condensed, title panel, stage markers/formulas, point-up hexagons, single accent shelf and subordinate runtime cards follow the reference (`fixture.json:7`–16; `render-diagram.mjs:73`–108, 122–129). Operator → intake, gate → operator, operator → land, gate → execute retry, execute ↔ adapters, adapters → workspaces, adapters ↔ tick and land ↔ GitHub preserve direction (`render-diagram.mjs:86`–100). The four mode alternatives and schematic/no-generated-imagery footer remain explicit (`fixture.json:76`–98, 155–157). No additional content or AS-7 defect found in the bounded sweep.
- [Pass] **One owner and checks:** the complete example script keeps geometry locally and calls the shared renderers (`render-diagram.mjs:9`, 25–33, 190–198); its finite-geometry, containment, Chromium-overflow and pairwise text-overlap checks retain the relevant RAG precedent checks (`render-diagram.mjs:200`–227). No material dead code found; fixture `id` and empty intake `token` are inert metadata, not a required redesign.
- [Pass] **Retained receipt matches the artifacts.** Read-only probe command (exit 0): `python3 - <<'PY'` with `p=Path("examples/2026-10-14-xyz-forge-system"); v=json.loads((p/"verification.json").read_text())`, then for `(key,name)` in `[("png","xyz-forge-system.png"),("chromiumPng","xyz-forge-system-chromium.png"),("html","xyz-forge-system.html")]` compare `hashlib.sha256((p/name).read_bytes()).hexdigest()` to `v["artifactDigests"][key]` and unpack each PNG header using `struct.unpack(">II",b[16:24])`. Decisive output: `xyz-forge-system.png True (2000, 1570)`; `xyz-forge-system-chromium.png True (2000, 1570)`; `xyz-forge-system.html True HTML`; text-id count/unique count/icon count/findings: `77 77 5 []`. Receipt is consistent with `verification.json`’s quoted `"findings": []`; this does not independently rerun layout validation.
- [Pass] **Thumbnail inspection:** command `sips --resampleWidth 420 examples/2026-10-14-xyz-forge-system/xyz-forge-system.png --out "$TMPDIR/satori-thumb.png"` and the corresponding Chromium command, exit 0, wrote both scratch thumbnails. Main reading line/hierarchy survives; fine captions require full size, as disclosed at README:43. Initial Python thumbnail attempt exited 1 (`ModuleNotFoundError: No module named 'PIL'`); native `sips` supplied the previews without installing anything.
- [Unverified — needs clone run] **Executable acceptance:** plan Evidence at `PROJECT/2-WORKING/GH-55-XYZ-FORGE-DIAGRAM.md:122`–127 reports the expected PASS line, red-control ids/container and exit 1, restored exit 0, PDDA and four budgeted canaries. Those reports substantiate the intended checks on paper; I did not execute render fixtures, PDDA, or test suites in this reviewer worktree. Harness gate owns fresh verification. The red-control row states the mutation but omits the exact mutation command requested by the plan; retaining that command in the next evidence update would improve replayability.
- [Unverified — needs harness audit] **Branch-wide accidental-file check:** Git is prohibited this turn, so no diff/changed-path claim is made. Directory inspection lists exactly the eight named example files, with no SVG present, and `.gitignore` excludes the regenerated SVG. `CHANGELOG.md:2`–5 accurately describes the bounded example and its reported verification. Harness must confirm the whole branch adds no accidental `.xyz/`, `.tick/`, or other files.

Review scope: read the complete fixture, script, example README, verification receipt, HTML, plan and RAG precedent script; inspected both PNGs and the seeded source. No further pre-existing defect found in those reviewed files. Graph lookup used Verify intent against nearest indexed project `XYZ-layout-engine`, generation `2026-10-13T02:52:30Z`; current relay worktree is not indexed, examples are excluded and plan freshness is missing, so all material review evidence above comes from direct source/artifact reads, not graph completeness.

Handing off to Producer (claude-a) — address F1, record its disposition, and return for Round 2 review.

### Producer · Round 2 · claude-a

- F1 — Implemented (disclosure option). `examples/2026-10-14-xyz-forge-system/README.md` "Simplifications, stated" now names three undrawn harness edges, including the harness read of PDDA project documents, and why (a shelf → harness connector would cross the dispatch spine and mode trail). No render change, so PNGs, HTML and `verification.json` are unchanged.
- Red-control replayability — Implemented. The plan's Evidence row now carries the exact mutation command.
- Branch-wide accidental files — producer check: `git diff --name-only origin/main...HEAD` lists only CHANGELOG.md, the plan doc, the two relay threads, releases.db/.sql and the eight example files; `.xyz/`, `.tick/` and `.relay-scratch/` are git-excluded and absent from the diff.

Reviewer: please re-check F1 only; approve if resolved.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
