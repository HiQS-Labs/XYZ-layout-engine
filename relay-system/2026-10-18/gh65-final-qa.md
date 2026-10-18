# RELAY · GH-65 final QA: XYZ Forge lenses and prior-art search
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-18.
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
6. **Commit only the relay file** (`relay(gh65-final-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `examples/xyz-forge/README.md` and the rest of the committed implementation on
  this branch versus main at b38e0d3 (git diff -M b38e0d3..HEAD): everything under examples/xyz-forge/,
  root `.gitignore`, the top entry of `CHANGELOG.md`, and the plan, acceptance checks and Evidence table in
  `PROJECT/2-WORKING/GH-65-XYZ-FORGE-LENSES.md`. Approved plan QA thread:
  `relay-system/2026-10-18/gh65-plan-qa.md`. View the PNGs directly for visual checks:
  `examples/xyz-forge/today/software-factory-v2/xyz-forge-software-factory.png`,
  `examples/xyz-forge/future/shift-proposal/xyz-forge-shift-proposal.png`.
- Operational envelope: documentation examples in a public repo, rendered locally by one developer.
  Grade against the plan's requirements 1–7 and acceptance checks with commensurate complexity; do not ask
  for new nodes, recipes, tests or engine machinery the approved plan scoped out.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-18
- Definition of Done: requirements 1–7 are met by the committed files; Evidence claims match the files;
  v1 is a pure rename apart from its `RT` line and README paths; no pinned or tested path changed; no
  live reference under examples/ names an old folder.

### Questions for the Reviewer
1. Moves: are the three folders pure renames apart from the stated edits? Does each script's `RT` reach
   the repo root from its new depth, and is v1's rendered output unchanged (compare blob hashes across the
   rename)?
2. Links and paths: does every relative link in the index and three READMEs resolve? Any live old-path
   reference left under examples/ (generated HTML included)?
3. Captions: do the v2 `/start-task` and shift Open captions state the prior-art check where it runs, and
   does each generated HTML caption element match its fixture? Is shortening "Codex plan QA" to "Codex QA"
   acceptable given the plan allows shortening without losing meaning?
4. Visual: in the two PNGs, any new crowding or overlap caused by the longer captions? Is the Evidence
   table's AS-10 statement (tight above the routes label; captions unreadable at 1/3 scale, pre-existing)
   honest?
5. Hygiene: any accidental files (.relay-scratch, .xyz, .claude, node_modules), or changes outside scope?
   Is the `.gitignore` hunk exactly the three requested lines?
6. Flag anything over- or under-engineered. Cite `file:line`.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1

VERDICT: PASS
Basis: Ship the documentation example changes. Requirements 1–7 are represented in the seeded files; source, link, caption, receipt and visual checks found no blocking defect. Reversibility: Easy. Historical byte identity, exact branch scope and executable gate results below remain producer-reported, pending the harness's clone verification.
swept file: yes

Read the whole index, all three render scripts, fixtures, READMEs and ignore files, all generated HTML text leaves and verification receipts, the top CHANGELOG entry, the full plan and its approved plan-QA thread. Inspected both backends of the changed diagrams and their one-third previews. No actionable pre-existing implementation defect found; one optional wording nit follows. No git, renderer, executable fixture, validator or test suite was run. Only this relay is changed outside scratch.

- [Pass] **Paths and links:** all three scripts use `new URL('../../../../',import.meta.url)` (system `render-diagram.mjs:8`; factory/shift `:9`) and still own fixture/output paths through `ROOT`. All nine relative README/image links resolve, including v1's `../../../2026-10-12-belief-reference/README.md` (`today/system-v1/README.md:3`). The index explicitly separates Today from “Future — proposals, not built” (`examples/xyz-forge/README.md:7–17`). The Python probe quoted below exited 0: `links 9 broken 0`; each bundle printed `RT True`.
- [Pass] **Captions and receipts:** factory `fixture.json:87` says “Prior-art check, fresh clone, recon, plan, Codex QA, build, gates, final QA.” Shift `fixture.json:25` places the duplicate check in Morning open before proposing items. Both HTML caption elements equal their fixture values exactly. “Codex QA” retains the plan-review meaning through its position between plan and build; the separate final QA remains explicit, and factory `fixture.json:148` still says “Codex plan and final QA.” This meets plan requirement 4's shortening allowance (`GH-65-XYZ-FORGE-LENSES.md:104–110`). Probe exit 0: all three bundles printed `digests True`, `caption True`, `findings []`; text/icon counts were 73/1, 86/2 and 77/5. These are stored-receipt checks, not fresh geometry runs.
- [Pass] **Visual / AS-10:** inspected `today/software-factory-v2/xyz-forge-software-factory{,-chromium}.png` and `future/shift-proposal/xyz-forge-shift-proposal{,-chromium}.png`. The new captions read at full size; no visible caption collision. Open ends tightly above “ROUTES TO EXISTING SKILLS,” accurately described in plan Evidence `:177`. One-third previews preserve title/stage/node hierarchy; fine captions do not read. This supports the table's observation, not an AS-12 compliance claim. No new styling mechanism is warranted. Preview commands were `sips -z 580 733 <factory PNG> --out .relay-scratch/<preview>.png` and `sips -z 500 733 <shift PNG> --out .relay-scratch/<preview>.png`, applied to each backend; exit 0 for all four. The initial Pillow preview attempt failed with `ModuleNotFoundError: No module named 'PIL'`; sips supplied the inspected previews without installing anything.
- [Pass] **Current-tree hygiene:** `rg -n --hidden -g '*.md' -g '*.mjs' -g '*.json' -g '*.html' '2026-10-14-xyz-forge-system|2026-10-15-xyz-forge-software-factory|2026-10-15-xyz-forge-shift-proposal' examples` exited 1 with no output, including generated HTML. Bundle inventory contains exactly the index plus three sets of eight expected files; no accidental dependency/scratch/config directories appear inside it. Root `.gitignore:12–14` contains precisely the requested `# Aider Studio (auto-added)`, `REPO_MAP.md`, `.aider/` entries after a blank separator. CHANGELOG's top entry describes the same moves and captions (`CHANGELOG.md:2–7`). These checks establish present contents; exact added/removed scope requires the base comparison below.
- [Nit] **Pre-existing count wording:** factory `README.md:3` says “seven skills” but lists six roles, with `/review-pr` an alias of `/review-code`. The fixture subtitle and script comment likewise say seven. Optional follow-up: omit the numeral or explicitly count the alias as a seventh command. This does not affect the prior-art change and does not warrant another render for this task.

Probe command (read-only Python, exit 0; decisive output quoted above):

```sh
python3 - <<'PYPROBE'
from pathlib import Path
import json,re,html,hashlib
root=Path.cwd(); links=[]
for p in [Path("examples/xyz-forge/README.md"),*Path("examples/xyz-forge").glob("*/*/README.md")]:
 links += [(p.parent/t).exists() for t in re.findall(r"!?\[[^\]]*\]\(([^)]+)\)",p.read_text()) if "://" not in t]
print("links",len(links),"broken",links.count(False))
for d in sorted(Path("examples/xyz-forge").glob("*/*")):
 f=json.loads((d/"fixture.json").read_text());v=json.loads((d/"verification.json").read_text());n=f["id"];h=(d/(n+".html")).read_text()
 ok=all(hashlib.sha256((d/p).read_bytes()).hexdigest()==v["artifactDigests"][k] for k,p in [("png",n+".png"),("chromiumPng",n+"-chromium.png"),("html",n+".html")])
 caption=True
 if "nodes" in f:
  key,id=("startTask","starttask_caption") if "startTask" in f["nodes"] else ("open","open_caption")
  caption=html.unescape(re.search(r'<span\b[^>]*id="'+id+r'"[^>]*>(.*?)</span>',h,re.S)[1])==f["nodes"][key]["caption"]
 print(d.name,"RT",(d/"../../../..").resolve()==root,"digests",ok,"caption",caption,"findings",v["findings"],"ids",len(v["textIds"]),len(v["iconIds"]))
PYPROBE
```

**[Unverified — needs clone run]** No base-to-HEAD git comparison was performed, as git is prohibited in this turn. Thus pure renames, v1's pre-move blob identity, no pinned/tested path changes, and absence of unrelated branch changes are not independently attested here. Plan Evidence `:168–180` supplies the producer's pre-change witness, v1 identity, two red controls with restore, repeat runs, catalog, PDDA and pnpm receipts; current artifact hashes and caption contents agree with the stored claims, but those executions were not repeated. The harness must retain its normal clone gate; this approval does not replace it.

Graph limitation: both list-project pages were inspected; this seeded worktree has no matching project. Nearest canonical `XYZ-layout-engine` generation is `2026-10-13T02:52:30Z`, a different checkout. Coverage reports examples excluded, CHANGELOG skipped and the new plan missing; exact source reads supplied evidence throughout. No graph completeness claim is made. Startup `python3 .xyz/utils/py/releases_app.py roadmap list` exited 2 (`No such file or directory`); no replacement was created.

Relay closed (Approved), no further turn needed. Producer (claude-a) receives the completed review; the harness owns the file-scoped commit and subsequent clone gate.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
