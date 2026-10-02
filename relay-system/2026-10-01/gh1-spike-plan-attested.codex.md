# GH-1 spike plan — protocol-corrected independent receipt
STATUS: Approved
NEXT: Producer

## Instructions
You are the independent Codex reviewer. No builder dispatch is authorized. Read the actual current artifacts: PROJECT/2-WORKING/GH-1-RENDERER-SPIKE.md; PROJECT/2-WORKING/renderer-spike/MARATHON.yaml and p1.md,p2.md,p3.md. Compare with PRD §5.3 and Phase 0. The prior independent review found B1/S1/S2/S3 resolved and approved the text, but its receipt was REFUSED by the driver because the legacy marker was moved when appending. That is not an attested approval.

This is ONE bounded corrective receipt turn after a reproduced transcript-format failure, not a new implementation or review loop. Verify current actual plan files still carry all fixes, truthful scope, backend ownership, asset embedding, hero/script/resource experiments, text overflow/long-copy proof, stage-specific verifier gates, Agy/Codex pairing, safe sequencing and allowlists. No implementation exists yet; approve only plan text. Enumerate any concrete blocker; do not approve on the prior log's word alone. Graph index lacks this project; use exact source/artifact reads. Installed harness is at the env-pinned full clone; isolated review worktree may not contain .xyz.

APPEND-ONLY: append your reviewer block AFTER THE FINAL EXISTING BYTE AT EOF. Do not insert before any marker, rewrite a prior line, reflow text, or fill prior commit fields. Only STATUS and NEXT header lines may change. This template deliberately has no end marker. Do not run git or edit artifacts. Do not run rendering or dispatch. Probes only under TMPDIR.

Your block MUST end with exactly `VERDICT: PASS` for supported plan approval, `VERDICT: FAIL` for changes, or `VERDICT: PARKED` for unavailable evidence, then a nonempty `Basis:` line. Use `Review outcome:` for conversational labels. Do not add free-form Verdict fields after the machine verdict. For PASS set STATUS: Approved and use the env-provided tick to mark the current relay task done; for FAIL/PARKED hand back to Producer and leave STATUS Open. Harness owns commits and attestation. Approval is textual only; runtime behavior and human artwork acceptance remain pending.

## Log

### Producer — bounded transcript recovery
The renderer spike plan is unchanged in scope from the second review. Only receipt provenance now points to this valid-template attempt. Prior review artifacts remain immutable at relay-system/2026-10-01/gh1-spike-plan.codex.md. Negative-control probe of installed relay_attest confirms insert-before-marker fails its prefix rule while append-at-EOF passes. No runtime code modified. Direct preflight and full YAML dry-run will be rerun against the final reviewed clone after this independent turn.
VERDICT: PARKED
Basis: independent attested plan approval pending; no runtime proof or dispatch claimed.


### Codex — independent EOF-only corrective plan receipt
Review outcome: Approved (plan text only). No concrete plan blocker found in the current artifacts; approval does not authorize builder dispatch or attest runtime behavior.

Scope and evidence: read ROUTER.md, GUIDING-PRINCIPLES.md, AGENTS.md, the current GH-1 plan, MARATHON.yaml, p1.md/p2.md/p3.md, and SPECS-PRD.md, including §5.3 and Phase 0. Applied the SWE plan rubric. Graph inventory query `list_projects(limit=100)` returned 77 projects, `has_more=false`, with no matching checkout/full-clone project; no generation or graph coverage is available here. Exact artifact reads are the evidence. README.md is absent (`cat GUIDING-PRINCIPLES.md AGENTS.md README.md`, exit 1, decisive output `cat: README.md: No such file or directory`); this does not prevent the bounded review. No installed governance/runtime changes or implementation runs were performed.

Current-file findings:
- GH-1 §Current state and scope and PRD §5.2: truthful greenfield Phase 0 scope, one generic scene, backend-owned geometry/text measurement, no second layout engine, and explicit Fabric/Konva/production/remote deferrals. SWE Recon is N/A for nonexistent engine call paths. Minimal and Blast are satisfied by the local spike boundary and Easy rollback.
- GH-1 Phase 1 and PRD §5.3: editable JSON text, separate approximation assets, all reference sections, standalone SVG bytes/data URLs with embedded definitions and no external references, offline font/assets, and verified sources/licenses. Whole-reference embedding is explicitly excluded.  [Unverified — no citation]
- GH-1 Phase 2: nutrition renders precede product-hero smoke outputs; SVG capability is reported honestly; English/accented Latin/CJK/emoji probes, pinned dependencies/fonts, exact binding licenses, separate warm/cold timings and observable memory limitations are required. These remain experiments, not performance/support promises.
- GH-1 Phase 2: ten-step fitting cap, repeat digests and preserved baseline/override evidence, concrete longer headline/caption, and backend-owned text-content extents/overflow proof are mandatory. Element rectangles cannot substitute for unclipped-glyph evidence. Missing evidence fails the capability; only a backend passing mandatory English/reference/repeat/long-copy checks may be recommended, and neither passing yields BLOCKED.
- GH-1 Phase 3 and PRD Phase 0: report and PRD capture observed geometry, fidelity, timings, licenses, scripts, hero evidence and proposed resource limits. Agent comparison and pending human artwork acceptance remain separate; the full PRD Phase 0 cannot be completed early.
- GH-1 §Wave 1/Dispatch/Safety, YAML and all briefs: explicit Agy builder/Codex reviewer pairing, reviewed invocation with `--builder agy --pre-advance-cmd 'pnpm run spike:verify'`, phase 1 fixture/assets gate and phases 2/3 complete render/repeat/override evidence, three strictly sequential phases, matched artifact allowlists, orchestrator-only ledger ownership, 900-second turns and two-review-round caps, finite operation deadlines/cleanup, and debug-mantra failure diagnosis. Direct preflight and full dry-run still precede exact-plan confirmation and dispatch.

Narrow read-only probe (exported `PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"`; no imports of project code):
```bash
python3 -c 'from pathlib import Path; import re,json; p=Path("PROJECT/2-WORKING/renderer-spike"); y=(p/"MARATHON.yaml").read_text(); c=json.loads(re.search(r"```json\n(.*?)\n```",Path("PROJECT/2-WORKING/GH-1-RENDERER-SPIKE.md").read_text(),re.S)[1]); phases=re.split(r"\n  - id: ",y)[1:]; assert len(phases)==3; a=[set(re.search(r"\n    artifact: (.*)",s)[1].split(",")) for s in phases]; b=[set(re.findall(r"^- `([^`]+)`",(p/f"p{i}.md").read_text().split("Allowed artifact files:",1)[1].split("Driver pairing:",1)[0],re.M)) for i in range(1,4)]; assert a==b; assert all(s<=set(c["artifacts"]) for s in a); assert all(not Path(f).exists() for f in ["package.json","pnpm-lock.yaml","tools/spike/fixture.json","tools/spike/render.mjs","tools/spike/verify.mjs"]); print("PASS: 3 matching YAML/brief allowlists (10,14,4), contained in parent contract; sampled implementation paths absent")'
```
Exit status: 0. Decisive output: `PASS: 3 matching YAML/brief allowlists (10,14,4), contained in parent contract; sampled implementation paths absent`.

Reviewed SHA-256 identities (from direct `hashlib.sha256(path.read_bytes()).hexdigest()` reads, exit 0):
```text
5cfba663ad8ccd4565cf4c78d3dcfd8baca53971a1f9ae630fe6e87e6c86e4b7 GH-1-RENDERER-SPIKE.md
cccf540038680efcb013bd037b87eacbd65095bf71833b01302574b6dc590810 MARATHON.yaml
867cd32eedf9c86f8e765f1329220975058356e564b6589ace44fd1a21b98d86 p1.md
a0f52c83f53ab1291676254aa576af854c19b42c2f6a519bb36d9f00510ea9c2 p2.md
c101ce1f148a96e2c4e73a419d4c4bc53cad8ec91e02314e9098ef6b4a11a27f p3.md
b97cc36adcf70084add3dad1b91a8568bb9c8bdfc09bd24cd679f78106939c88 SPECS-PRD.md
```

Unverified — needs clone run: deterministic preflight/planner/full YAML dry-run and any eventual render, verifier, dependency/license or PDDA execution. None was claimed as passing here. No runtime implementation exists at the sampled paths; backend feasibility and human artwork acceptance remain pending. The harness owns receipt validation, attestation and the file-scoped commit. Only permitted STATUS/NEXT headers changed; this reviewer block was appended after the original EOF. Reversibility: Easy.
VERDICT: PASS
Basis: independent direct review of the current plan/PRD/YAML/briefs and the exit-0 allowlist probe supports bounded plan-text approval; current text retains the required fixes, ownership, experiments, failure gates and sequencing without claiming runtime or human acceptance.
