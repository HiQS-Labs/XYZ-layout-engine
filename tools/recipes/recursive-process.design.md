# Recursive belief updating — reference-directed recipe

This is the art-direction contract for the next recursive-process renderer
version. The operator's supplied reference governs the composition. Preserve
the earlier horizontal editorial variant in Git and in the local review archive.

## Reader and hierarchy

Reader: someone learning the illustrated relationship between an event,
interpretation, consequence and examination of a belief. The illustration is
schematic, not evidence of a guaranteed psychological outcome.

1. Large B1 and B2 hexagons anchor the main horizontal reading line.
2. Smaller consequence cards sit below and feed back upward; examination and
   revised philosophy sit above B2, so their role is visible spatially.
3. A broad pale blue continuation arrow leads right to smaller repeating belief
   hexagons and profiles. Title and stage formulas orient rather than dominate.

## Composition contract

Use the reference's 1320 x 1294 coordinate space; fit it uniformly inside the
supported 1600 x 1340 output, centred horizontally. Do not stretch the diagram.
Warm ivory background, charcoal text, light grey rules, muted blue-grey fills,
very restrained bevel/shadow treatment. Use the bundled Barlow Condensed regular and bold faces, as selected by the
operator for the corrected render. Text, subscripts and arrows stay crisp
engine-rendered geometry; never ask the image model to paint the complete chart.

Reference anchors (x, y in that design coordinate space):

| Element | Position / extent |
|---|---|
| Rounded title panel | x75 y67 w1170 h80 |
| Four stage markers | centres (300,238), (540,238), (805,238), (1095,238) |
| Vertical stage rules | x180,418,660,955; y215 to1178, individually interrupted around labels and causal paths |
| Formulas | A1 -> B1 -> C1 above stage1; A2 -> B2 -> C2 above stage2; D and E above their artwork |
| Activating event | circular node centred (105,648), label above |
| Initial belief | large hexagon centred (310,648); B1 engine-rendered inside |
| Updated belief | large hexagon centred (662,648); B2 engine-rendered inside |
| Repeated profile | centred below each large belief, around y806 |
| Consequences | rounded cards centred (465,928) and (735,928); C1/C2 at top, PNG below |
| Examination | gears/question PNG centred (735,430), with upward branch from B2 |
| Revised philosophy | shield PNG centred (880,430), label below; arrow from examination |
| Continuing revision | broad arrow from x790 to1275 around y648; label above |
| Repeated beliefs | small hexagons centred (890,744), (1026,744), (1163,744); profile below each |

Maintain the visual edges event -> B1 -> B2, B1 -> C1 -> B2,
B2 -> C2 -> continuation, and B2 -> examination -> revised philosophy.
The reference does not draw an E-to-continuation connector: do not invent one.
Preserve repeated B2, B3, B4 in the small trail to show the current belief entering
continued revision. Use a separate ellipsis after B4. Preserve the reference's
labels, with source/schematic and generated-imagery disclosure in a quiet footer.
Additional explanatory copy may use compact captions without changing anchors.

## LLM artwork pass

Read `recursive-process.artwork.json`. For each asset concatenate `sharedStyle`
and that asset's `subject`, unless it has an accepted `refinementPrompt`; use
that exact replacement prompt when present. Retain the exact model and settings. Generate one
transparent PNG per asset, not a sheet or a complete infographic. Review the
six outputs together for shared stroke weight, scale, palette, silhouette and
padding. Reuse the accepted profile PNG for all five placements.

Use the existing HiQS single-image caller explicitly, at most six initial calls,
and the existing display-asset conversion helper. The legacy solar batch runner
currently rejects source PNGs containing caBX provenance metadata even after
successful provider output; do not replay those paid jobs blindly. Inspect the
saved receipt and use the validated display derivative, retaining original bytes.
Do not add another provider, queue or retry mechanism. Cache accepted bytes and
receipts, check alpha and digests, and load them with the existing pinned PNG
reader. No silent SVG replacement if a required PNG is absent. Publication
must pin the artwork specification, accepted PNGs and provenance with the new
renderer version. A later fresh generation creates a new asset/version record.

## Deliberate taste exceptions and acceptance

The rounded title, hexagons, repeated profiles, consequence cards and subtle
shading deliberately match this specific reference (AS-2, AS-3, AS-6).
They are not prohibited generic decoration in this task. Palette roles live in
the fixture; geometry and type have one owner in the recipe (AS-5 exception).

Inspect both backend PNGs at full size and thumbnail size for reference
fidelity, correct connections, labels, clipping and PNG style consistency.
Report generated-asset variability separately from deterministic layout.
Save inputs, receipts and exact commands; do not claim pixel identity for fresh
image generation, or clinical validity from the schematic.

## Divider and connector clearance

Stage dividers are background guides, never causal edges. Give each divider its
own path segments rather than repeating one y-range. Leave at least 12 reference
pixels around the fixture's label/caption regions and a clear gap wherever a
causal connector would coincide with a rule. In particular, break x180 around
the activating-event text, x418 around the C1 caption, and x660 around both the
C2 caption/profile connector and the upward B2 examination route. Break x955
above the revised-philosophy text. End every divider by y1178, before the y1194
footer. Recheck these gaps if copy, type sizes or anchors change.

Connector endpoints must approach the visible PNG subject, accounting for its
transparent padding, rather than stopping at the image node's box edge. The B2
examination elbow reaches x699 at y430, giving a distinct horizontal arrowhead
near the accepted gear silhouette. Keep its upward leg visually separate from
the x660 divider. Formula arrows are engine-rendered SVG geometry because the
bundled Barlow Condensed font does not cover the arrow glyph; no font fallback.

The profile-to-C2 connector uses a 20px rounded elbow and a 16px straight
horizontal approach to its arrowhead (`M638 868V908Q638 928 658 928H674`).
Keep the x660 divider absent between the profile connector and the consequence
caption; an isolated stub there reads as part of the causal arrow.
