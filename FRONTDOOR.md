# FRONTDOOR.md — onboarding health dashboard

This dashboard tracks whether a newcomer can get from a clone of XYZ Layout Engine to a working
render. Every finding has a check in [Deterministic checks](#deterministic-checks--re-run-to-refresh),
so each status comes from re-running a command, not from memory. Refresh it when `README.md`,
`ROUTER.md`, `AGENTS.md`, `package.json`, `pnpm-lock.yaml`, an example README or `skills/**/SKILL.md`
changes.

| | |
|---|---|
| **Last audited** | 2026-11-20, working tree of the README-rewrite branch (README, docs and `package.json` changes included) |
| **Method** | front-door walk: fresh clone of HEAD plus the new docs, Node v26.13.0 and v18.20.8, Chromium hidden, `npx --yes pnpm@{9,10,12}` |
| **Verdict** | ✅ **Smooth** for the documented path: install, two renders and `pnpm test` work as written, with no accounts or keys. Four low or medium findings remain off the quick-start path. |

## Health at a glance

| Dimension | Status | One-liner |
|---|---|---|
| One front door | ✅ | `README.md` for people, `ROUTER.md` for agents; no competing QUICKSTART/INSTALL/CONTRIBUTING |
| 🔑 Leaked secrets | ✅ | No provider-format key in the tree; the only history hits are base64 image data in renders deleted in `d0113e7` |
| First success works | ✅ | Quick start: install, nutrition render, solar edit/save, `pnpm test` (4/4, ~30 s) |
| Prerequisites declared | ✅ | Node `>=22.13` in README and `engines`; Chromium install is in the quick start |
| Doc ↔ code drift | ⚠️ | RAG example evidence is stale (FD-07) |
| Agent front door | ⚠️ | `ROUTER.md` startup step 7 runs a script that is not in the repo (FD-08) |

## Findings

Severity 🔴 high · 🟠 med · 🟡 low. Status ⬜ OPEN · ✅ FIXED.

| ID | Area | Sev | Status | Fix |
|---|---|---|---|---|
| FD-01 | First success: quick-start `pnpm test` failed without Chromium (2 of 4 canaries launch it) | 🔴 | ✅ | `pnpm exec playwright install chromium` added to the quick start before step 3 |
| FD-02 | Install: the uncommitted `pnpm@12.14.0` self-pin (`packageManager` plus a second lockfile document) broke `pnpm@9 install --frozen-lockfile` with `ERR_PNPM_BROKEN_LOCKFILE` and silently switched pnpm 10/12 to 12.14.0 | 🟠 | ✅ | That pin discarded (Codex + agy consult, unanimous); README no longer claims a pin. The check flags any `packageManager` field so a future pin gets a deliberate decision |
| FD-03 | Prerequisite: no `engines` field, so Node 18 installed silently, then failed on `node:zlib` `crc32` | 🟠 | ✅ | `"engines": {"node": ">=22.13"}` (pnpm warns at install); error text documented in README |
| FD-04 | Drift: README named `tools/spike/measure-chromium.mjs`, which never existed | 🟠 | ✅ | README describes the real checks in `tools/render.mjs` and `tools/intake.mjs` |
| FD-05 | Drift: README listed JetBrains Mono and IBM Plex Sans as bundled fonts | 🟡 | ✅ | Removed; Alegreya added |
| FD-06 | Undocumented: three example folders missing from README | 🟡 | ✅ | All `examples/*` folders listed with render commands |
| FD-07 | Drift: running `examples/2026-10-09-rag-system/render-diagram.mjs` rewrites committed `rag-system.html`, `.pdf` and `verification.json` (stale renderer note and HTML digest), leaving the tree dirty | 🟡 | ⬜ | Re-render and commit the RAG evidence |
| FD-08 | Agent door: `ROUTER.md` startup step 7 runs `utils/py/releases_app.py` / `.xyz/utils/py/releases_app.py`; neither is in a fresh clone | 🟠 | ⬜ | Vendor the releases overlay, or say in `ROUTER.md` where the script comes from |
| FD-09 | Dead code path: `tools/request.mjs` accepts recipe `mangajdm-promo`, but there is no recipe module, so renders fail late with "unsupported recipe identity" | 🟡 | ⬜ | Remove the branch (its example was deleted in `d0113e7`) |
| FD-10 | Install: `examples/2026-10-17-vibe-coding-loop/README.md` says plain `pnpm install`, not `--frozen-lockfile` | 🟡 | ⬜ | Use `pnpm install --frozen-lockfile` like every other README |

## Verified baselines (keep green)

- ✅ **Secrets clean**: no provider-format key in the tracked tree.
- ✅ **One front door**: `README.md` and `ROUTER.md` exist; no `QUICKSTART*`, `INSTALL*` or `CONTRIBUTING*` competes.
- ✅ **README links resolve**: every relative link in `README.md`, `docs/catalog.md` and `docs/pdf-export.md`.
- ✅ **Lockfile is single-document**: `pnpm-lock.yaml` installs on pnpm 9, 10 and 12.
- ✅ **No human-gated wall** on the render path. Paid cutout generation (HiQS caller credentials, Higgsfield account) is optional and marked so.
- ✅ **First success** (manual evidence, 2026-11-20): `node tools/spike/test/run.mjs` passed 4/4 in about 30 s with Chromium installed. Re-run it by hand; it is not part of the read-only block below.

**Not checked:** installs on Linux or Windows (the only tested host is darwin-arm64), and a real first
Chromium download (it comes from `cdn.playwright.dev`, which proxies and agent sandboxes can block).

## Deterministic checks — re-run to refresh

Empty output means all green. Each printed line names an OPEN finding or a broken baseline. The
checks only read files (`grep`, `awk`, `test`, `git grep`, and `node -p` to read `package.json`); they
run no repository code or tests.

```bash
# Run from the repository root.

# FD-01: Chromium install comes before `pnpm test` in the README quick start
awk '/^## Quick start/{q=1} q&&/playwright install chromium/{c=NR} q&&/^pnpm test$/{t=NR} /^## How it works/{q=0} END{exit !(c && t && c<t)}' README.md \
  || echo "FD-01 OPEN: README quick start runs pnpm test without installing Chromium first"
# FD-02: no pnpm self-pin; lockfile is a single YAML document
grep -q '"packageManager"' package.json && echo "FD-02 OPEN: package.json pins packageManager (breaks pnpm@9 frozen install)"
awk '/^---[[:space:]]*$/{ if (c) d=1; next } /[^[:space:]]/{c=1} END{exit !d}' pnpm-lock.yaml \
  && echo "FD-02 OPEN: pnpm-lock.yaml has a second YAML document (ERR_PNPM_BROKEN_LOCKFILE on pnpm@9)"
# FD-03: engines declares the Node floor
[ "$(node -p 'require("./package.json").engines?.node ?? ""')" = ">=22.13" ] || echo "FD-03 OPEN: package.json engines.node is not >=22.13"
# FD-04: README names no non-existent measure tool
grep -q 'measure-chromium' README.md && echo "FD-04 OPEN: README references tools/spike/measure-chromium.mjs (not in tree)"
# FD-05: README claims no unbundled fonts
grep -qE 'JetBrains Mono|IBM Plex' README.md && echo "FD-05 OPEN: README lists fonts that are not bundled"
# FD-06: every example folder is linked from README
for d in examples/*/; do grep -q "${d%/}/" README.md || echo "FD-06 OPEN: README does not mention ${d%/}"; done
# FD-07: RAG committed evidence matches the current script
grep -q 'Shared root tools/render.mjs' examples/2026-10-09-rag-system/verification.json \
  || echo "FD-07 OPEN: RAG verification.json predates the shared renderer; re-render and commit"
# FD-08: ROUTER.md startup step 7 script exists in the clone
grep -q 'releases_app.py' ROUTER.md && [ ! -e utils/py/releases_app.py ] && [ ! -e .xyz/utils/py/releases_app.py ] \
  && echo "FD-08 OPEN: ROUTER.md step 7 runs releases_app.py, which is not in this clone"
# FD-09: no recipe accepted without a module
grep -q "mangajdm-promo" tools/request.mjs && [ ! -e tools/recipes/mangajdm-promo.mjs ] \
  && echo "FD-09 OPEN: tools/request.mjs accepts mangajdm-promo but tools/recipes/mangajdm-promo.mjs does not exist"
# FD-10: example READMEs use the frozen install
git grep -nE '^pnpm install$' -- 'examples/**/README.md' | sed 's/^/FD-10 OPEN: unfrozen install at /'

# Baseline: secrets stay clean
git grep -IqE '(sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)' \
  && echo "BASELINE BROKEN: provider-format secret in the tracked tree; rotate the key, then purge it"
# Baseline: one front door
[ -f README.md ] && [ -f ROUTER.md ] || echo "BASELINE BROKEN: README.md or ROUTER.md missing"
ls QUICKSTART* INSTALL* CONTRIBUTING* >/dev/null 2>&1 && echo "BASELINE BROKEN: a competing onboarding doc exists at the root"
# Baseline: relative links resolve
for f in README.md docs/catalog.md docs/pdf-export.md; do
  grep -oE '\]\([^)#]+' "$f" | sed 's/^](//' | grep -v '^https\?:' | while read -r p; do
    [ -e "$(dirname "$f")/$p" ] || echo "BASELINE BROKEN: dead link in $f -> $p"
  done
done
```
