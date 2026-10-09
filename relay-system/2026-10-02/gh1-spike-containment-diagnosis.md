# GH-1 Phase 1 containment diagnosis — 2026-10-02

Root cause: repository initialization omitted the generated dependency-directory ignore rule; pnpm installation left untracked node_modules/ visible to containment. Fix site: existing project .gitignore, /node_modules/ only. Why not upstream/downstream: the authoritative runtime correctly rejects unignored writes; changing the harness or widening tools/ ownership would weaken the source boundary and would not address project setup.

## Observations and controls

- Original driver stopped with exit 6; pre-advance verifier and independent review did not run. Original isolated turn was discarded. Agy's self-reported checks are not accepted evidence.
- Source trace: Python RelayTurnLib.worktree_end calls Bash rtl_worktree_end (relay-turn-lib.sh), which checks Git porcelain paths via rtl_in_allow and exemptions. Python offlane_candidates is explicitly advisory and overreports: it normalizes the relay path against the temporary worktree and omits the Bash ancestor rule. Therefore reported RELAY.md/tools/ candidates do not establish an authoritative rejection of those paths.
- Actual .gitignore contained only PDDA runtime filenames. No node_modules ignore in clone local excludes either. No active driver or surviving failed worktree.
- Control replay: four disposable full clones plus detached worktrees; same installed authoritative rtl_init/rtl_worktree_end, absolute relay path, and exact sample file allowlist. No model call or installed-runtime edit.
- Disproof first: allowed package.json/fixture and relay append only -> CONTAINMENT=0. This rules out relay path rooting and collapsed tools/ as sufficient causes.
- Add simulated install output under node_modules/.pnpm -> CONTAINMENT=1.
- Add /node_modules/ ignore before the turn -> CONTAINMENT=0.
- Add unauthorized.mjs under corrected setup -> CONTAINMENT=1. Source containment remains enforced.

Ranked alternatives: missing dependency ignore (confirmed by differential); absolute relay-path mismatch (disproved by allowed-only control); collapsed tools/ directory mismatch (disproved by same control); actual additional stray source writes (not evidenced by saved diagnostic candidates; negative control remains enforced).

Both primary and task clone get the one-line project ignore rule; no model may edit it during the turn. Source artifact allowlists and renderer scope stay unchanged. Installed harness remains untouched. Clone-only runtime run-log ignore is operational hygiene, not source ownership.

Retry: Phase 1 only, same Agy builder/Codex reviewer, fresh MARATHON-GH1-SPIKE-P1-TURN-2 token, same scoped lane namespace and attempt cap. Mandatory pnpm run spike:verify before phase approval. Record live result separately; no completion claimed by this diagnosis.

## Retry dispatched

Retry dry-run exited 0. Actual Phase 1 driver started in native exec session 60095 with RTL_TRACE=1; token MARATHON-GH1-SPIKE-P1-TURN-2 is claimed by agy. Same source allowlist, 900-second turn ceiling and five-turn review cap. Worktree isolation ON, no --force or disabled gate. Detailed live log: /Users/noelsaw/marathon-clones/marathon-gh-1-renderer-spike/relay-system/logs/gh1-spike-p1-retry-run.txt. No Phase 1 approval yet. This direct phase retry does not automatically start Phases 2/3.
