---
name: higgsfield-cli
description: Generate a transparent PNG through the Higgsfield CLI for the XYZ Layout Engine repo, under an operator credit cap, with the alpha channel proven and provenance recorded. Use when asked to "generate a transparent image with Higgsfield", "make a cutout / icon / illustration with Higgsfield", "use the Higgsfield CLI", or "/higgsfield-cli <subject>". Works only inside an XYZ Layout Engine checkout (it needs `SOP.md` and `examples/2026-10-09-cell-division/inspect-alpha.mjs`).
---

# higgsfield-cli

Run the Higgsfield CLI's `gpt_image_2_5` model with `--background transparent`, one job at a time, and keep only results whose alpha channel the repo's own inspector proves. `SOP.md` at the repo root is the rule this skill carries out; if the two disagree, `SOP.md` wins and this skill needs fixing.

The CLI is the only Higgsfield route this repo uses. The REST API ignores the transparency setting (0 of 12 runs had alpha) and the MCP connector has never been tested. Do not switch routes inside this skill.

## Before you start

- Read `SOP.md`, and `SYSTEM-INSTRUCTIONS.md` if the image is for a diagram or recipe (its AS rules govern prompts and art direction).
- The globally installed `higgsfield-generate` skill says not to pre-estimate cost and never checks alpha. In this repo this skill's rules apply instead.
- The pinned runtime must be installed for the alpha check. Working directory: repository root: `pnpm install --frozen-lockfile`, and if Chromium is missing, `pnpm exec playwright install chromium`.
- Paid calls need a **written credit cap from the operator** for this piece of work, in credits. No cap, no spend. Observed prices: 0.25 credits at `1k`/`low`, 0.5 at `1k`/`medium`.

## Procedure

Outputs this procedure creates, so they do not exist yet: a raw download folder outside the repo, and (only for assets you commit) the asset file plus its provenance entry.

1. **Sign-in.** `higgsfield account status --json` must print a `credits` number. If it fails, stop and ask the operator to run `higgsfield auth login`; an agent cannot complete the browser sign-in. Note the starting balance. Record only the number: the reply also carries the account email.
2. **Settle the job.** Prompt (subject only: say "isolated subject on a transparent background, no backdrop, no shadow, no text"; describing a backdrop overrides the setting), `--variant flare` (fast) or `sunburst`, `--quality`, `--resolution`, `--aspect_ratio`. Check unfamiliar values with `higgsfield model get gpt_image_2_5 --json`. Do **not** pass `--image-references` (alias `--image`) or any local file path, to `cost` or `create`, unless the operator asks: the CLI uploads local files to Higgsfield, even for a cost estimate.
3. **Price it.** Run `higgsfield generate cost gpt_image_2_5` with exactly the flags of the create in step 4, plus `--json`. It returns `{"credits": N}`. Stop if `N` is missing or not a finite positive number, or if credits spent so far plus `N` would exceed the cap. Spent so far is the larger of (starting balance minus current balance) and the sum of earlier quotes in this task.
4. **Generate, once.** `higgsfield generate create gpt_image_2_5 --prompt "..." --variant flare --quality low --resolution 1k --aspect_ratio 1:1 --background transparent --wait --json`. The reply is a JSON list holding one job. Accept it only if `status` is `completed`, `job_type` is `gpt_image_2_5` and `params.background` echoes `transparent`. Any other outcome (non-zero exit, non-JSON, a timeout, a status that is not `completed`) is ambiguous: do not retry. Read `higgsfield account status --json` and `higgsfield generate list --json`, report to the operator, and stop.
5. **Download.** Fetch the job's complete `result_url`, query string included (the signature is what authorises the download), into a folder outside the repository (for example `$TMPDIR/higgsfield-raw/`). Never write that query string into a file, a commit, a log, provenance or chat; where a URL must be recorded, keep only scheme, host and path.
6. **Prove the alpha.** Working directory: repository root: `node examples/2026-10-09-cell-division/inspect-alpha.mjs <file>`. Read the printed JSON and accept only `"format": "png"` together with `"real_alpha": true`; the command exits 0 for an opaque file too, so the exit code proves nothing. A file that looks transparent, or has a baked checkerboard or white matte, fails; report it and do not regenerate without the operator's say.
7. **Look at it** on the colour it will sit on. Real alpha can still carry a halo or a cut-off edge.
8. **Record it.** For every asset you commit, add an entry to the consuming example's `provenance.json`, in the shape used by `examples/2026-10-09-cell-division/assets/provenance.json`: `provider: "higgsfield-cli"`, `model`, `variant`, the echoed `params`, `job_id`, `created_at`, `credits` (estimated, measured by balance, balance before and after), and `original` (file name marked "not committed", `sha256`, `bytes`, `width`, `height`, `alpha` from step 6). Commit only the assets you use; raw downloads stay out of the repo. Never record the account email, a token or a full signed URL.
9. **Close the spend.** Re-read `higgsfield account status --json` and compare the balance change with the quotes. Report credits used against the cap.

## Known traps

| # | Trap | Working pattern | Evidence |
|---|---|---|---|
| 1 | A setting the service accepts is not proof it was applied: REST took `background: transparent` without error and returned opaque images. | Step 4 checks the echo; step 6 checks the pixels. | `SOP.md`; `examples/2026-10-09-cell-division/FINDINGS.md` |
| 2 | Retrying a create that timed out or returned nothing can pay twice. | One create per quote; an ambiguous outcome stops the task. | `SOP.md` procedure; `higgsfield-cli-spike.py` stop rules |
| 3 | `account status --json` carries the account email; `result_url` carries a signature. Both have leaked into logs in other tools. | Copy out only the credits number and the URL path. | `higgsfield-cli-spike.py` redaction controls |
| 4 | A local file passed as a reference is uploaded to Higgsfield. | No `--image-references` or `--image` without an explicit operator request. | `higgsfield generate create --help` ("paths are auto-uploaded") |
| 5 | Measured only at `1k`, one account, cell-biology subjects. | Treat `2k`/`4k` and new subject types as unverified until step 6 passes. | `SOP.md` known limits |

## Install

This skill does not install itself. When the operator asks, symlink `skills/higgsfield-cli` from the maintained primary clone into the agent app's skills folder (for Claude Code, `~/.claude/skills/higgsfield-cli`), keep any existing different entry as is, and read `SKILL.md` back through the link. Never link to a temporary task clone.

## Done means

Each delivered image came from a quoted, capped, single create; `inspect-alpha.mjs` printed `real_alpha: true`; it was inspected on its target colour; committed assets have provenance entries with no email, token or signed query string; and the operator has the credits used against the cap.
