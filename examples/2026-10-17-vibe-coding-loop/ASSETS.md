# Step cutouts and replay

Five separate `gpt-image-2.5-flare` transparent PNG cutouts supply the step illustrations for
`examples/2026-10-17-vibe-coding-loop/`. The image model never draws headlines, captions, cards,
arrows or the overall slide.

- **Style guide:** [`DESIGN.md`](DESIGN.md)
- **Prompt spec (one shared style string, AS-9):** [`artwork.json`](artwork.json)
- **Pinned hashes, prompts and alpha checks:** [`provenance.json`](provenance.json)
- **Sanitized provider receipts:** [`receipts/`](receipts/) (`<id>.result.json`; scratch paths replaced)
- **Committed web-sized PNGs (512 × 512):** [`assets/web/`](assets/web/)

## Verified asset table

Generated 2026-10-17 through the HiQS image runtime (`recipe:hiqs/openai-image-generation@r2`,
`endpoint: "generate"`, no reference image, `size: "1024x1024"`, `quality: "high"`,
`background: "transparent"`). Each asset was accepted on its first attempt (5 paid calls in total).
Alpha was verified on the generated file (`opaqueCornerCount: 0`) and again on the downscaled display
copy. Display copies were made with `examples/2026-10-09-cell-division/make-web-asset.mjs`. The
1024 px originals were not retained; their size and SHA-256 are recorded.

| Asset ID | Step | Source bytes | Source SHA-256 | Display (`assets/web/`) SHA-256 | Display bytes | Transparent ratio (display) |
|---|---|---|---|---|---|---|
| `idea` | 01 Describe your idea | 1,006,154 | `6f5c6f8911c822f99d10b6e4f9ef652b5a8e7ab4c491fa557f195bb9bf32b7f3` | `cb2a06d13c04c75aaa85f4b89c5e31119d964f35f9681a9405201887f2e7dc5e` | 154,309 | 0.665 |
| `code` | 02 AI generates code | 1,065,857 | `7920a12071252f9b441529f2a5c2fc94e803c88da3b4739e8df6a50f3f2fd02e` | `eb4b72986d28d5caec83fd455dafe1793921cc7b29edb3f658154bcd24ce301d` | 235,018 | 0.484 |
| `live` | 03 You see it live | 1,027,725 | `bea44749570423ed38dbbc7f4edd93f8bddeb0f35a709db47d3b056aacb06144` | `7ac6afa943ccd8af568351489b978ba1d962b2b1ad15c33a1d735549f34782cb` | 257,994 | 0.376 |
| `refine` | 04 You refine it | 1,085,454 | `85146fa032330f6cf5a4c6708c3dcf64679c2ccf863204ccbfe6cd4c02da8550` | `521e834dd0b5b91672fc6234a356f5fd2cf0721b5dd2b49634f5133e0400a978` | 226,237 | 0.548 |
| `ship` | Exit: Ship it | 925,473 | `45295765cea811743b671591ac2757d8b86832169c9ba8d60fb1b9e31bc34d49` | `5a98c37774ba8ae81f12d5e528073701eec6692c792437d47ca71be34bbf3274` | 155,427 | 0.702 |

`fixture.json` → `assets.<id>.visibleBox` records each display PNG's visible bounding box (alpha > 40),
which the render script uses to stand each cutout on its card's floor line and size its ground shadow.

## Fresh artwork generation

Renders use the committed `assets/web/` PNGs, checked against `provenance.json` by `readPinnedPngs`
(`tools/request.mjs`), and make no network or model calls. To generate a new candidate set (each run is
one paid OpenAI call), run the HiQS chain caller per asset into a scratch folder, never over the committed
files:

```sh
OUT="$PWD/temp/vibe-loop-assets"; mkdir -p "$OUT"
python3 - "$OUT" <<'PY'
import json, os, subprocess, sys
spec = json.load(open('examples/2026-10-17-vibe-coding-loop/artwork.json'))
g = spec['generation']
for a in spec['assets']:
    subprocess.run(['node', os.environ['HIQS_CHAIN_CALLER'], 'image',
        '--prompt', f"{a['subject']} {spec['sharedStyle']}", '--model', g['model'],
        '--size', g['size'], '--quality', g['quality'], '--background', g['background'],
        '--out', os.path.join(sys.argv[1], a['id'] + '.png')], check=True)
PY
```

Then inspect alpha and cohesion, downscale to 512 px with `make-web-asset.mjs`, re-measure each
`visibleBox`, and update `provenance.json`, the receipts and this table together.
