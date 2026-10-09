# GH-8 Phase 0 findings: does Higgsfield return real alpha for GPT Image 2.5?

Date: 2026-10-09. Issue: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/8. Plan: `PROJECT/1-INBOX/GH-8-HIGGSFIELD-SPIKE.md`. Evidence: `spike-ledger.jsonl` (every call, scrubbed; no key, no signed URL query strings).

## Verdict: NO-GO for native transparency on the REST surface

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

## Recommendation (the issue's NO-GO options)

1. Do not build a Higgsfield transparent provider on this REST surface. Keep HiQS (`background: transparent` on the OpenAI endpoint) as the only confirmed transparent path.
2. If Higgsfield is still wanted, treat it as an **opaque-only provider** or an **`ingest` source** (Phase 2 of #8), where the engine verifies alpha itself and rejects opaque files when transparency is required. That needs no contract work beyond GH-5.
3. A matting step (background removal after generation) is a different capability; open a separate issue rather than folding it into #8.
4. A short MCP spike, once someone can connect the connector, is the only remaining way to flip this verdict.
