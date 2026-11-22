# Public acceptance goals · version 1.0

Deliver `output/poster.png` and `output/index.html`. Opening the HTML in Chromium at the PNG dimensions should display the finished composition immediately. Use the same design for both outputs. Keep the source editable and document the one-command build. The build should work in the supplied runtime after the generated outputs are removed.

| Points | Observable result |
|---:|---|
| 6 | A decodable PNG, at least 800 px on its shorter side, at most 16 megapixels, with at least 8 visibly distinct quantized colors in a 32 × 32 sample. |
| 6 | Self-contained HTML opens with visible content, decoded images and no external resource requests or script errors. Each submitted HTML/PNG file may be up to 64 MiB. |
| 8 | The PNG matches the HTML capture at native size (80 × 80 sample, mean RGB difference at most 3 of 255). |
| 6 | A blind reader can identify the fixture headline as the place to edit the words. |
| 6 | A blind reader can identify the illustration asset or asset ID as the way to replace the leaf. |
| 8 | A blind reader can point to one actual nutrition recipe property and correctly predict the visible effect of editing it. |
| 8 | The diagram puts the recipe in Node.js at render time and connects its styled scene to CSS in the exported HTML. |
| 6 | The reader correctly traces the Satori path through SVG, with resvg rasterizing SVG for PNG. |
| 6 | The reader correctly traces Playwright driving Chromium to lay out HTML and capture PNG. |
| 5 | The reader can distinguish selectable text in offline HTML from pixels in a PNG and understands either backend can export HTML. |
| 8 | At least two distinguishable planes or equivalent depth cues visually relate recognizable parts of the nutrition poster. |
| 6 | At 400 CSS pixels wide, the reviewer can associate two legible annotations with the correct pictured components, without zoom. |
| 6 | With explanatory prose covered, a blind reader can point to two separate components and explain one relationship that the composition communicates. |
| 10 | In an isolated fresh copy of the packet, the documented single command regenerates both deliverables after the exported files are moved aside. |
| 5 | In that isolated copy, one caption edit followed by the same render command changes the visible caption in both outputs. |

The same goals apply to both tracks. The 20 artifact points are machine-checked. A blinded reader and an operator supply pass/fail evidence for the other 80. No points depend on using Higgsfield, a particular perspective technique, or a particular palette.

## Unattended technical score (0–100)

A second score requires no ballot. It awards the same 20 artifact points plus 8 points for each of ten technical relationships expressed in visible, machine-readable HTML captions: headline and fixture/JSON; artwork choice and leaf/illustration; one real leaf placement pair (left 262, top -34, width 428, or height 640, using ASCII digits and minus); recipe and Node.js runtime; CSS and styling; Satori and SVG; resvg and PNG; Playwright and Chromium; Chromium and PNG capture; offline and HTML. Related terms must occur within 200 characters of each other in the caption reading order. The captions should be visible within the native PNG viewport. SVG or HTML text is sufficient; diagrams using raster lettering can add visible editable captions.
