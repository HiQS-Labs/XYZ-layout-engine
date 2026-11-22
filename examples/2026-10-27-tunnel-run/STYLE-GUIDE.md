# Tunnel Run — Art Direction Style Guide

Oct 25, 2026 · @Noel Saw

## Style DNA

Late-90s Japanese theatrical anime, painted-background school: hand-painted gouache/watercolor environments with a cel-shaded hero vehicle, lit by a cool blue-cyan key and a warm sodium-amber accent at the vanishing point. Think touge/wangan night-driving cinema rather than modern clean digital anime. Mood is quiet speed: a single car owning an empty urban underpass, cinematic widescreen, slightly worn and weathered surfaces.

Three-word brief: **painted, cool, kinetic.**

## Color palette

Roughly 70% cool environment, 20% hero color, 10% warm accent. Values are sampled approximations; treat as a locked palette and tint from them.

| Role | Hex | Use |
| --- | --- | --- |
| Concrete shadow | #1F2A33 | Deep wall and ceiling shadows, underside of overpass |
| Concrete mid | #5C6E7A | Dominant wall tone, slightly green-grey |
| Concrete light | #B9C8CF | Lit wall faces, dusty highlights |
| Road grey | #6E7A80 | Asphalt base |
| Wet highlight | #CFE3EA | Specular streaks on road, headlight bloom edge |
| Hero blue | #2E7FD9 | Car body, the only saturated blue in frame |
| Hero blue shadow | #1C4F8F | Car body shadow side |
| Sodium amber | #F2B547 | Tunnel exit glow, distant lights |
| Amber hot | #FFF0C2 | Core of warm light sources |
| Lane white | #E8ECEC | Road markings (never pure white) |
| Iridescent accent | #4FB3A8 / #7A5FC9 | Oil-slick sheen on walls, 1 spot per frame max |

**Rules**

- No pure black or pure white anywhere; darkest is #1F2A33, lightest is #FFF0C2.
- Saturation lives in the hero and the warm accent only; environment stays desaturated.
- Warm light is always distant and small (exit, far lamps); cool light is near and large.

## Light and atmosphere

One cool key, one warm counterpoint, and the hero's own headlights as the only hard source.

- **Key:** diffuse cool-white tunnel strip lights overhead, running in a receding curve; they read as a dotted line of soft highlights, not individual lamps.
- **Counterpoint:** warm amber glow at the far exit or vanishing point, always behind the subject. It gives depth and tells the eye where the road goes.
- **Hero light:** headlights with a 4-point lens flare and a soft radial bloom; bloom bleeds onto the nearest wall. Max one flare pair per frame.
- **Ambient:** low-contrast fill so shadow sides stay readable (no crushed blacks).
- **Surface response:** road has long vertical specular streaks (wet or polished look); walls have soft watercolor pooling and one faint iridescent patch; the car has crisp cel highlights only.
- **Atmosphere:** no fog or volumetric haze; depth comes from value falloff and the warm exit, not from particles.

## Line, rendering and texture

Two rendering languages in one frame, kept deliberately separate: painted world, cel hero.

| Element | Treatment |
| --- | --- |
| Environment | Gouache/watercolor: visible brush pooling, dry-brush streaks on road, soft edges, no outlines |
| Hero vehicle | Cel-shaded: 2-3 flat value steps, thin dark-blue (not black) outline, sharp specular shapes |
| Road markings | Dry-brush, broken edges, slight motion smear toward camera |
| Light sources | Soft bloom plus a hard flare; no lens dirt |
| Overall grain | Faint paper texture across the whole frame at \~5% opacity |

**Line weight:** hero outline about 1.5 px at 1080p, thinner on highlights, heavier under the chassis. Environment carries zero line work; shapes separate by value only.

**Edge rule:** anything farther than the hero gets softer; the hero is the sharpest object in frame.

## Composition and camera

Widescreen, low, and curved: the road is the leading line and the hero sits off-center.

- **Aspect:** 16:9 for stills, 2.39:1 letterbox allowed for animation.
- **Camera height:** bumper height, roughly 0.6 m, tilted up a few degrees so the ceiling curve is visible.
- **Lens:** 24-35 mm equivalent; mild wide-angle stretch on the near lane, no fisheye.
- **Hero placement:** right or left third, nose toward camera, body angled 20-30 degrees so one side and the front both read.
- **Leading line:** the road and lane markings sweep in an S or C curve from the bottom edge to the warm vanishing point.
- **Negative space:** at least 40% of the frame is empty wall and road; one subject, no clutter.
- **Horizon:** hidden; the exit glow stands in for it.

## Subject treatment

**Vehicles.** Late-90s to early-2000s Japanese performance cars, stock or lightly tuned (front-mount intercooler, modest wing). Proportions accurate, not chibi or exaggerated. Body is the single saturated object; wheels and tires are near-black blue-grey. Reflections are simplified cel shapes, not ray-traced.

**Environments.** Infrastructure, not nature: tunnels, underpasses, elevated expressways, parking structures, toll plazas. Concrete and steel, weathered with water stains and grime. Signage minimal and illegible; no readable text or logos.

**People.** Rarely present. If shown, silhouettes through glass or small figures at distance, same cel treatment as the car.

**Weather and time.** Night or deep dusk only. Dry road with a polished sheen; rain allowed as an optional variant but keep it to road reflection, no visible droplets.

## Animation translation

The world is a painted plate that slides; the hero is a cel layer that moves on 2s. Keep the two layers visibly different in motion as well as render.

| Layer | Motion rule |
| --- | --- |
| Background plate | Multi-plane parallax (3-4 depth layers), smooth 24 fps camera moves, slow pushes and pans |
| Strip lights | Scroll overhead to sell speed; soft bloom pulses as each passes |
| Road markings | Streak toward camera; motion smear baked into the paint, not a blur filter |
| Hero car | Cel animation on 2s; body stays rigid; subtle 1-2 px suspension bob; wheel rotation implied by highlight flicker |
| Headlights | Flare rotates slowly; bloom intensity breathes with the strip-light cadence |
| Iridescent wall patch | Slow hue drift only; never flashes |

**Frame rate.** 24 fps composite; hero on 2s (12 drawings/s), FX on 1s where bloom needs smoothness.

**Camera grammar.** Long holds and slow moves; cuts on speed changes, not on action. No shaky cam, no speed lines in the environment.

**Transitions.** Pass through the warm exit glow to white-amber, then into the next tunnel; this is the series' signature cut.

## Do / Don't

| Do | Don't |
| --- | --- |
| Painted, soft-edged environments | Clean vector or 3D-rendered backgrounds |
| One saturated hero against grey-blue world | Multiple saturated objects competing |
| Cool near, warm far | Warm key light or daylight |
| Empty roads, one subject | Traffic, crowds, clutter |
| Hard flare + soft bloom from headlights only | Neon signage, light trails, lens dirt |
| Dusty, stained concrete | Pristine or futuristic surfaces |
| Low bumper-height camera | Drone or top-down angles |
| Paper grain at \~5% | Film grain, chromatic aberration, vignette |
| Period-correct JDM silhouettes | Modern hypercars or fantasy vehicles |

## Prompts

Use the base block verbatim and swap only the scene line. Attach the reference image when the generator supports it.

**Base style block**

```markdown
Late-1990s Japanese theatrical anime style, hand-painted gouache and watercolor background with visible brush pooling and dry-brush streaks, cel-shaded vehicle with thin dark-blue outline and 2-3 flat shading steps, cool blue-cyan key light from overhead strip lights, single warm sodium-amber glow at the far vanishing point, headlights with soft bloom and a crisp 4-point lens flare, polished dark asphalt with long specular streaks, weathered stained concrete, desaturated grey-blue environment with one saturated blue hero car, no pure black, no pure white, faint paper texture, 16:9, bumper-height wide-angle camera, cinematic, empty road, night. No text, no logos, no people, no neon, no fog, no 3D render, no film grain, no chromatic aberration, no vignette.
```

**POC 1 — Elevated expressway**

```markdown
[base style block]
Scene: a blue late-90s Japanese sports coupe drifting through a long banked curve on an elevated expressway at night, concrete guard walls on both sides, a line of cool white overhead lamps curving away into the distance, a faint warm amber glow from a toll plaza far ahead, camera low at bumper height on the outside of the curve, car in the right third angled toward camera, rear tires lightly smeared with motion, at least 40 percent of the frame empty road and wall.
```

**POC 2 — Parking structure**

```markdown
[base style block]
Scene: a blue late-90s Japanese sports coupe idling on the top deck ramp of a multi-level concrete parking structure at night, low ceiling with evenly spaced cool fluorescent strips, water stains and oil marks on the floor, a single warm amber exit sign glow down the ramp behind the car, camera low and slightly tilted up so the ceiling curve shows, car in the left third with headlights on and bloom spilling onto the nearest pillar, one small iridescent oil-sheen patch on the wall, no other vehicles.
```

**Acceptance check for each POC**

- [ ] Environment reads as painted, hero reads as cel
- [ ] Only one saturated color in frame (hero blue) plus a small warm accent
- [ ] Cool light near, warm light far
- [ ] No readable text or logos
- [ ] Palette hexes match within a tint shift
