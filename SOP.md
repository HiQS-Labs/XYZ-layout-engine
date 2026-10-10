# SOP: choosing a Higgsfield method

> **Public repo. Do not add PII or credentials to this file** (no keys, tokens, account emails, signed URLs, key-file paths, or personal data). Describe the method only; keep anything private outside the repo.

Last verified: 2026-10-09 (Higgsfield CLI 1.1.26). Evidence: `examples/2026-10-09-cell-division/FINDINGS.md`, `cli-spike-ledger.jsonl`, `spike-ledger.jsonl`, and issue #8.

## The rule

To generate an image that must have a transparent background, use the Higgsfield **CLI** with `--background transparent`, and check the alpha channel of every result yourself. Do not use the Higgsfield REST API for transparency. Do not rely on the MCP connector; it is untested.

| Method | Transparent image | Status | Use it for |
|---|---|---|---|
| CLI `higgsfield generate create gpt_image_2_5 --background transparent` | Real alpha in 4 of 4 runs; the `--background opaque` control came back opaque | GO | Anything that needs a transparent PNG, and any other Higgsfield image |
| REST `api.higgsfield.ai` (`marketing-studio/image/flare`, `/sunburst`) | 0 of 12 had alpha. `background` and `output_format` are accepted and ignored | NO-GO for transparency | Nothing in this repo. Opaque images are possible but the CLI does the same job with a price check and a balance |
| MCP connector | Not tested (could not be connected from the test environment) | Unknown | Only after a spike that passes the same alpha check |
| HiQS `background: transparent` on the OpenAI endpoint | Produced the transparent Solar System assets in `examples/2026-10-08-solar-system/`; the API's `background=transparent` support is described in `PROJECT/4-MISC/OPENAI-IMAGE-GPT-TRANSPARENCY.txt` | GO (not re-tested here) | The other working transparent path; use it when Higgsfield credits or sign-in are not available |

## Procedure (CLI)

Run one job at a time. Never retry a failed job automatically; read the failure first.

1. Sign-in. `higgsfield account status --json` must return your credits. If it does not, the operator runs `higgsfield auth login` (browser sign-in). An agent cannot do this step.
2. Get the operator's credit cap for the work, in writing. No cap, no spend. Note the starting balance from `account status --json`.
3. Price it. `higgsfield generate cost gpt_image_2_5 <same flags as the create> --json` returns `{"credits": N}`. Stop if the price is missing, not a finite number, or would take the total past the cap. Observed prices: 0.25 credits at 1k/low, 0.5 at 1k/medium (about $0.015 and $0.03 per image, from 1.5 credits costing about $0.09).
4. Generate. `higgsfield generate create gpt_image_2_5 --prompt "..." --variant flare --quality low --resolution 1k --aspect_ratio 1:1 --background transparent --wait --json`. Flare and Sunburst both returned alpha; Flare is faster.
5. Download the `result_url` of the finished job (it is a signed URL; do not store its query string anywhere).
6. Verify alpha. Run `node examples/2026-10-09-cell-division/inspect-alpha.mjs <file>`. Accept only `real_alpha: true` (an alpha channel, a minimum alpha below 255, and transparent pixels). An image that merely looks transparent, or has a baked checkerboard, fails.
7. Look at the image on the colour it will sit on. Alpha can be real and still have a halo.
8. Record the job: label, parameters, credits, job id, file hash, alpha result. Credits only; never the account email, token or full URL. `examples/2026-10-09-cell-division/higgsfield-cli-spike.py` is a worked runner (spend gate, ledger, redaction); copy its approach, not its prompts.
9. Re-read `account status --json` at the end and compare the spend with the quote.

## Rules that always apply

- The setting is not proof. A flag the API accepts without error can still be ignored (REST did exactly this). Always run step 6.
- Keep key files and tokens out of the repo, out of chat, out of logs. Never print any part of a key. If you must test a key file, check its mode is 600 first.
- Spend only under an explicit operator cap, and stop at the cap.
- Commit only the assets you use, with provenance (provider, model, parameters, job id, hashes). Raw downloads stay out of the repo.
- In PRs and commits for Higgsfield work write `Refs #8`. Never write a closing keyword near `#8`, even in a negation; "does not close #8" closed it once.

## Known limits (revisit these before relying on the result)

- 5 CLI jobs, one account, 1k resolution, cell-biology prompts only. Higher resolutions and other subjects are unmeasured.
- The CLI needs an interactive browser sign-in, so unattended or CI use is untested.
- Why the CLI returns alpha and REST does not is unknown. A CLI update or a REST docs change could flip either result.
- The CLI's `image_background_remover` model and `remove_bg` parameter were not tried.

## When to change this SOP

Update the table and the "Last verified" date when any of these happens: an MCP spike runs (pass or fail); the REST docs list a transparency field; a CLI version changes the `--background` behaviour; or the first Higgsfield provider (issue #8, Phases 1 to 4) lands and becomes the supported entry point. Record the evidence in the same change.
