# GH-8 Phase 0 findings: does Higgsfield return real alpha for GPT Image 2.5?

**Updated 2026-10-09:** the first half of this document is the REST-route test (NO-GO). A second test through the Higgsfield CLI (Phase 0b, below) **did** return real alpha. Read the summary first.

Date: 2026-10-09. Issue: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/8. Plan: `PROJECT/1-INBOX/GH-8-HIGGSFIELD-SPIKE.md`. Evidence: `spike-ledger.jsonl` (every call, scrubbed; no key, no signed URL query strings).


## Summary

| Route | Verdict | Evidence |
|---|---|---|
| REST `marketing-studio/image/flare` and `/sunburst` | **NO-GO** | 0 of 12 paid images had an alpha channel; `background` and `output_format` were accepted and ignored |
| CLI `higgsfield generate create gpt_image_2_5 --background transparent` | **GO** | 4 of 4 transparent requests returned real alpha (RGBA, minimum alpha 0, no opaque corners); the opaque control returned an opaque image; 1.5 credits |
| MCP connector | **untested** | not connectable from this environment |

## CLI route (Phase 0b): `gpt_image_2_5 --background transparent` returns real alpha

Run 2026-10-09 with the installed `higgsfield` CLI 1.1.26 (OAuth sign-in, workspace "Private", starter plan), 1k resolution, `--aspect_ratio 1:1`, strictly one job at a time, under the operator's 20-credit cap. Every call went through `higgsfield-cli-spike.py` (price check, balance read, reserve row, then the create) and is in `cli-spike-ledger.jsonl`.

| Label | Variant | Quality | `--background` | Credits (quoted / measured) | PNG colour type | Transparent pixels | Min alpha | Opaque corners | Real alpha | sha256 (first 12) | Job |
|---|---|---|---|---|---|---|---|---|---|---|---|
| T1-smoke-interphase | flare | low | transparent | 0.25 / 0.25 | 6 (RGBA) | 46.0% | 0 | 0 | yes | `ebe91c71dd84` | `13dd16ee` |
| T2-cytokinesis | flare | low | transparent | 0.25 / 0.25 | 6 (RGBA) | 65.2% | 0 | 0 | yes | `ea34af329cc3` | `e1efbe5f` |
| T3-sunburst-interphase | sunburst | low | transparent | 0.25 / 0.25 | 6 (RGBA) | 33.9% | 0 | 0 | yes | `b9b8f6a1edef` | `e8e0401e` |
| T4-flare-medium-interphase | flare | medium | transparent | 0.5 / 0.5 | 6 (RGBA) | 48.9% | 0 | 0 | yes | `17cc8856e1af` | `3e204ac7` |
| C1-flare-opaque-interphase (control) | flare | low | opaque | 0.25 / 0.25 | 2 (RGB) | 0% | 255 | 4 | **no** | `44933088f135` | `347fcbf0` |

- **The parameter does the work.** The same prompt with `--background opaque` returned an opaque RGB image, while `transparent` returned RGBA. The job's echoed `params.background` matched the request in all five runs (the runner flags a mismatch and marks the result not GO-eligible; none occurred).
- **Looks clean.** The four transparent images were viewed composited on the diagram's dark card colour (`#0b1529`): clean cutouts, no halo, no baked checkerboard and no white box. T3 (sunburst) is more detailed and translucent; T4 (flare, medium) has the clearest cell edge, which is why it was used for interphase.
- **Cost:** quoted and measured agree. The balance went from 701 to 699.5 credits for the five jobs (1.5 credits; Higgsfield's own example prices 1.5 credits at $0.094, so about $0.09). The CLI's `generate cost` returns a number and `account status` returns the balance, so spend can be measured directly, unlike the REST route.
- **Used in the diagram:** interphase uses T4 and cytokinesis uses T2, as 256 px web copies (`assets/web/`), with provenance in `assets/provenance.json` (provider, model, full params, job id, credits, original and web sha256, alpha statistics). The other four stages keep their hand-drawn SVG icons, and the footer says the two cells are AI-generated.
- **Other things seen, not tested:** the echoed job parameters include `remove_bg: false`, and the CLI lists an `image_background_remover` model. Neither was used.

Why the CLI differs from REST is not known. The CLI runs a `gpt_image_2_5` job type that lists `background` (`auto`, `opaque`, `transparent`); the REST route is a Marketing Studio endpoint whose schema has no such field. That is an observation, not an explanation.

Limits of the CLI test: five jobs, one account, one resolution (1k), prompts about cells only; the two variants and two quality tiers tried, not the higher tiers; four of five images viewed (the control was only measured). The CLI needs an interactive OAuth sign-in, so unattended use is untested. MCP is still untested.

## REST route verdict (Phase 0): NO-GO for native transparency on the REST surface

**Real alpha returned: 0 of 12 paid generations.** Every image was a 1024 by 1024, 8-bit RGB PNG (PNG colour type 2, no alpha channel), measured by `inspect-alpha.mjs` (decoded in Chromium; `real_alpha` false, minimum alpha 255, four opaque corners). The inspector was proven first on a committed transparent Solar System PNG (`real_alpha` true) and the opaque Solar System poster (`real_alpha` false).

Per the issue's definitions this is NO-GO for transparent generation through `marketing-studio/image/flare` and `marketing-studio/image/sunburst`. The MCP connector was **not tested** (see Limits), so this is not a statement about Higgsfield as a whole.

## What was tried

Every call used 1k resolution and low quality, and ran strictly one at a time. For each of Flare and Sunburst:

| Step | Fields sent besides the prompt | Outcome |
|---|---|---|
| a | `"background": "transparent"` | accepted (HTTP 200, queued), completed, opaque RGB |
| b | `"output_format": "png"` | accepted, completed, opaque RGB |
| c | both fields | accepted, completed, opaque RGB |
| d (3 runs) | none; the prompt asks for a "transparent background, no backdrop, no ground, no shadow, no checkerboard" | completed, opaque RGB |

Full results (all from the ledger):

| Label | Fields | Latency | Size | PNG colour type | real_alpha | sha256 (first 12) |
|---|---|---|---|---|---|---|
| flare-a-background | background | 10.3 s | 1062 KB | 2 | false | `d5989f833935` |
| flare-b-output_format | output_format | 10.3 s | 1090 KB | 2 | false | `403dd67326c3` |
| flare-c-both | background+output_format | 10.5 s | 1152 KB | 2 | false | `2c2d657a2339` |
| flare-d-prompt-1 | prompt only | 13.6 s | 1475 KB | 2 | false | `43785e0a4199` |
| flare-d-prompt-2 | prompt only | 13.9 s | 1517 KB | 2 | false | `e83b93337b14` |
| flare-d-prompt-3 | prompt only | 13.6 s | 1302 KB | 2 | false | `63a290c587e5` |
| sunburst-a-background | background | 13.6 s | 1250 KB | 2 | false | `7f505f720c4c` |
| sunburst-b-output_format | output_format | 13.8 s | 1319 KB | 2 | false | `19a869ed0d26` |
| sunburst-c-both | background+output_format | 10.5 s | 1192 KB | 2 | false | `6667fb4c080c` |
| sunburst-d-prompt-1 | prompt only | 20.2 s | 1672 KB | 2 | false | `65b600d1a24c` |
| sunburst-d-prompt-2 | prompt only | 20.7 s | 1579 KB | 2 | false | `217dbe6a0a1b` |
| sunburst-d-prompt-3 | prompt only | 20.4 s | 1631 KB | 2 | false | `2371dc8ec1d9` |

## Observations

- **The unsupported fields are accepted and ignored, not rejected.** The Flare page says `additionalProperties: false`, which implied a 400 or 422 for `background` and `output_format`. The API instead returned 200 and generated an image. A flag that is accepted and has no effect is worse than a rejected one: a client would believe it asked for transparency. Any provider code must verify alpha itself (as the issue already planned) and must not treat acceptance of a flag as support.
- **Prompting for transparency produced fake transparency or a flat white backdrop.** I looked at four of the twelve images. One prompt-only Flare run showed a faint baked checkerboard behind the cell (the failure the issue warned about); three others (one Flare prompt-only, one Sunburst prompt-only, one Sunburst probe) had a flat white backdrop. None had alpha. I did not view the other eight; the inspector result (no alpha channel) covers all twelve.
- **Latency:** 10 to 21 seconds per image at 1k/low (Flare faster than Sunburst).
- **Other endpoints (estimate route only, free):** `marketing-studio/image/generate-and-edit` returned 404 `model_not_found` on this account, so the Marketing Studio 2.0 alpha edit model could not be tried. `higgsfield-ai/soul/standard` and `higgsfield-ai/soul/v2/standard` exist (estimates $0.094 and $0.004); they are not GPT Image 2.5 and their documented fields mention no transparency, so they were not generated.
- **Docs:** the docs index and the published OpenAPI list no image model or field mentioning transparent, alpha, background, `output_format`, PNG or WebP.

## Cost and how it was bounded

- The estimate route for Flare and Sunburst returns a pricing description (token-based: image output $30 per 1M tokens, "final cost uses actual token usage ... The initial charge is an estimate reconciled on completion"), **not a quote**. There is no balance endpoint, so the real charge cannot be read through the API.
- The runner therefore reserved an assumed $0.10 per 1k/low call (documented 1.5 credits is about $0.075 to $0.094). 12 calls reserved **$1.20** against the $1.90 gate and the operator's $2.00 cap. **The actual charge was not measured**; compare the Higgsfield console balance before and after if the exact figure matters. No further paid call was made, so the diagram uses hand-drawn SVG art.
- Every call's reservation, idempotency key, request id and result is in `spike-ledger.jsonl`.

## Limits

- **MCP connector not tested.** No Higgsfield MCP tool is connected in this environment and its OAuth flow cannot run here. If the MCP tools expose a transparency option the REST routes lack, it would change the answer. This is the main open question.
- REST only, two endpoints, 1k/low quality, 12 samples, one account. A higher quality tier was not tried (cost), though nothing in the schema suggests quality affects alpha.
- Asset visual review covered four of twelve images.
- The docs-based reading of `status_url`, `request_id` and `images[].url` held on the live API; no response shape surprises other than the estimate route.

## Recommendation

1. **REST route:** do not build a transparent Higgsfield provider on `marketing-studio/image/flare` or `/sunburst`; the NO-GO stands for that route.
2. **CLI route:** it is a plausible transport for a Higgsfield provider (JSON output, a price check that returns a number, a readable balance, auth handled by the CLI). The contract and provider work (Phases 1 to 4 of #8) is still blocked by GH-5 and is not started; the design needs a decision on shelling out to an interactive-login CLI.
3. HiQS (`background: transparent` on the OpenAI endpoint) remains the other confirmed transparent path. Both could be peer providers behind one contract, with the engine verifying alpha itself.
4. A matting step (`image_background_remover`, or a local tool) is a different capability; open a separate issue if it is wanted.
5. A short MCP spike, once someone can connect the connector, would complete the picture.
