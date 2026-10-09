---
title: XYZ Layout Engine — PRD
status: Draft
created: 2026-10-01
updated: 2026-10-08
owner: Neochrome
goal: Specify one recipe-driven engine for local and remote rendering through library, CLI, HTTP, and MCP.
reversibility: Easy — specification changes only; no runtime or deployment changes.
effort: 5
complexity: 4
risk: 4
phases: 7
---

# PRD: XYZ Layout Engine (JavaScript/TypeScript)

Canonical project name: **XYZ Layout Engine**
Technical naming in examples: `xyz-layout-engine` CLI, `@xyz-layout-engine/*` packages, and `createLayoutEngine` library factory (proposed identifiers; package availability is not asserted).
Owner: Neochrome
Status: Draft v0.4, October 2026

## Status

| What was just completed | What's next |
|---|---|
| Phase 0 spike executed (2026-10-08; Phase 2 code/evidence and Phase 3 documents Codex-approved and attested): both backends render the reference composition and product hero with authoritative geometry; Satori→resvg selected as default, Chromium as declared fallback; timings, licences and proposed limits recorded under Phases → Phase 0 findings. | Human visual acceptance of the spike artwork; then Phase 1 core engine on the selected backend, carrying the listed gaps. |

## Table of contents

- [Architecture and execution modes](#5-architecture-overview)
- [Library, CLI, HTTP, and MCP](#8-api-and-mcp)
- [Phase 0: Spike](#phase-0-spike-1-week)
- [Phase 1: Core engine](#phase-1-core-engine-2-to-3-weeks)
- [Phase 2: Recipe layer](#phase-2-recipe-layer-1-to-2-weeks)
- [Phase 3: Adapters + service](#phase-3-adapters--service-2-weeks)
- [Phase 4: Product UI](#phase-4-product-ui-2-weeks)
- [Phase 5: Hardening + v1 launch](#phase-5-hardening--v1-launch-1-to-2-weeks)
- [Phase 6: Infographic expansion](#phase-6-infographic-expansion-v11-2-to-3-weeks)

---

## 1. Summary

XYZ Layout Engine is a use-case-agnostic, deterministic layout and rendering engine written in TypeScript. It turns structured data (product catalogs, metrics, copy, brand tokens) into finished raster or vector images (PNG and SVG in v1; JPEG, WebP, and PDF after backend capability is verified) using versioned layout definitions.

The engine knows nothing about "products" or "infographics." Use cases live in a **recipe layer**: versioned definitions that map domain data to engine primitives (slots, blocks, themes, constraints).

- **Primary use case:** Product catalog → promotional email/newsletter imagery (Shopify, WooCommerce).
- **Secondary use case:** Infographic building (stats, comparisons, timelines, simple charts).

## 2. Priority decision: newsletter first or infographic first?

**Recommendation: keep product newsletter as the primary shipped use case, but design the core against the infographic use case.**

| Factor | Newsletter first | Infographic first |
|---|---|---|
| Time to revenue | Fast; clear buyer (e-com marketers) | Slower; fuzzier buyer |
| Layout complexity | Low: fixed slots, 1 to 6 products | High: variable-length lists, data-driven sizing, charts |
| Forces good abstractions | Weakly; tempts hardcoding "product" | Strongly; forces repeaters, data binding, auto-flow |
| Integration work | High (Shopify/Woo adapters) | Low (CSV/JSON) |

The risk of newsletter-first is that the engine quietly becomes a product-banner tool. The mitigation is cheap: **the core must express at least one infographic recipe before v1 ships**, even if it is unpolished and not marketed. That single test keeps primitives honest (repeaters, flow layout, data-bound sizing) without delaying the revenue path.

Swap priorities only if: (a) your SaaS distribution is stronger in content/reporting than e-commerce, or (b) you find yourself unable to sell the newsletter feature without a visual editor you don't yet have. Infographics tolerate a weaker editor because users mostly supply data, not design.

## 3. Goals and non-goals

### Goals

1. Deterministic: same resolved recipe/input/assets and pinned runtime/backend = byte-identical output; reviewed perceptual tolerance applies to approved environment changes (§10.1).
2. Use-case agnostic core; all domain knowledge in recipes and adapters.
3. Local Node rendering and a self-hosted or managed remote engine, with the same recipes and request contract through library, CLI, HTTP API, and MCP; optional browser preview.
4. Customization through constrained parameters (theme, palette, font pair, layout variant), not arbitrary code.
5. Permissive licensing for everything shipped in the core (MIT/Apache-2.0/BSD/ISC preferred; MPL-2.0 acceptable as an unmodified dependency).
6. Automated quality checks (overflow, overlap, contrast, safe areas).

### Non-goals (v1)

- Free-form Canva-style editor.
- Generative AI image composition. AI may supply copy suggestions or background assets only.
- Email HTML builder. XYZ Layout Engine produces images; the email tool assembles them.
- Animation/video.

## 4. Users and jobs

| Persona | Job |
|---|---|
| E-com marketer | "Turn this week's featured products into a hero banner and a 3-up grid in my brand style." |
| SaaS developer (you, tenants via API) | "POST data + recipe ID, get a CDN URL." |
| Designer | "Author a new layout/theme without touching engine code." |
| Content/ops user (secondary) | "Turn these 5 stats into a shareable infographic." |

## 5. Architecture overview

```
 ┌──────────────┐   ┌──────────────┐   ┌───────────────┐   ┌────────────┐   ┌──────────┐
 │ Source       │ → │ Adapter      │ → │ Recipe        │ → │ Layout     │ → │ Renderer │ → PNG/SVG/PDF
 │ Shopify/Woo/ │   │ normalize to │   │ map data to   │   │ engine     │   │ backend  │
 │ CSV/JSON     │   │ domain schema│   │ scene graph   │   │ measure +  │   │          │
 └──────────────┘   └──────────────┘   └───────────────┘   │ constrain  │   └──────────┘
                                                            └────────────┘
                                         ↑ themes, brand tokens, fonts
```

Four layers: data flows left to right; domain knowledge must not flow into the core. Recipes depend on core primitives; renderers implement the core contract; application entry points compose these layers. The core imports no adapters, domain schemas, transports, storage, or recipe packs:

1. **Adapters** (domain-aware): Shopify, WooCommerce, CSV, JSON. Output a typed domain object (`ProductSet`, `DataSeries`).
2. **Recipes** (domain-aware; trusted TSX in v1): validated input schema + mapping to a scene graph + allowed parameters.
3. **Core engine** (domain-agnostic): scene graph, layout contract, text fitting, constraints, validation; one owner of final geometry per backend.
4. **Renderers** (pluggable): Satori + resvg (fast, no browser) and Playwright/Chromium (full CSS fidelity fallback).

### 5.1 One engine, two execution modes

| Mode | Entry points | Assets and outputs | Required infrastructure |
|---|---|---|---|
| Local | Library, CLI, MCP stdio | Explicit local files or bounded URL fetches; bytes or files in an authorized output directory | Node, installed recipes/fonts; no cloud, Redis, or remote engine required |
| Remote engine | HTTP API, MCP Streamable HTTP; CLI with explicit `--engine-url` | Tenant-scoped asset IDs or approved HTTPS sources; private artifacts with expiring download URLs | Server process plus persistent job/artifact storage for async work; object storage when deploying multiple workers |

Both modes call the same recipe resolution → input/parameter validation → asset resolution → layout/fitting → constraint validation → render pipeline. HTTP and MCP are thin protocol adapters to shared application operations, not separate engines. The remote client sends normalized JSON, not executable TSX. Store credentials stay in the adapter's deployment environment, outside render requests.

Local mode must work offline with installed recipes and supplied assets/fonts. Remote selection is explicit; never silently upload a local render or fall back across deployments. Moving a workflow remote changes credentials and asset/output references, not its recipe mapping. Server mode can be self-hosted independently of the SaaS UI.

**Layout ownership gate:** The selected backend owns layout and text measurement; XYZ Layout Engine consumes its authoritative bounds for fitting and constraint reports. Satori already performs layout. Phase 0 must prove that final text and element bounds can drive constraint checks without a second divergent Yoga/text engine. Reuse backend measurements in core validation; if a backend cannot expose sufficient geometry, document the gap and narrow support or choose the other backend. Do not introduce a separate XYZ Layout Engine layout/text engine to compensate. Do not claim browser/Satori pixel parity or add a second layout pass by default. Preview may be approximate; the selected backend's final render is authoritative. See [Satori's layout documentation](https://github.com/vercel/satori).

### 5.2 Architecture tradeoffs

Apply [GUIDING-PRINCIPLES.md](../../GUIDING-PRINCIPLES.md): balance DRY, durability, maintainability, security, and measured performance. Share business rules and schemas; isolate deployment concerns. Add a package, dependency, queue, or abstraction only for a present requirement that a simpler mechanism cannot meet. The renderer boundary earns its place through the two Phase 0 backends; no generic plugin framework is needed.

**Decided scope:** Keep the Satori/resvg versus Playwright spike. Build only XYZ Layout Engine's missing layer: recipes, constrained parameters, validation reports, secure asset handling, and shared local/API/MCP operations. Reuse backend layout and text measurement. Defer Fabric.js and Konva until direct canvas editing is an actual requirement; neither is a v1 dependency.

### 5.3 First proof-of-concept reference

[layout-engine-reference.png](layout-engine-reference.png) is the first visual litmus reference, ahead of the product-hero smoke check. Reproduce a **similar nutrition infographic** from structured data and separate illustration assets, using reusable primitives. The reference is a visual target, not an input-to-image conversion feature or a requirement for generative illustration.

At the reference's square aspect ratio, preserve its hierarchy and composition: headline/subtitle, dominant central leaf and glow, two upper side callouts, four lower food/hydration items with captions, a four-item benefits panel, and a footer banner. Use a light background and green palette with comparable spacing, alignment, and typography. Exact illustration pixels and font identity are not required; supplied assets may approximate the reference. Record asset sources/licenses and any fidelity differences.

- [x] Render the same structured fixture with both spike backends; retain PNGs and compare them side by side with the reference. Record SVG capability separately. (2026-10-08: `tools/spike/output/{satori,playwright}.png`; SVG from Satori only.)
- [x] Keep text as text and illustrations as separate image/vector nodes; embedding the entire reference as a background is not a passing implementation. (`tools/spike/fixture.json`, `assets/illustrations.svg`.)
- [x] All sections are present and readable, with no clipped text or unintended overlap. Decorative overlaps are intentional and declared. (Verifier-checked with declared containment; agent visual assessment in Phase 0 findings.)
- [x] Change the headline and one caption in the fixture and rerender without changing engine code; layout/fitting must remain valid. (`output/override-*.png`, fit at iteration 0 in both backends.)
- [ ] Record a human visual acceptance verdict, geometry/fitting gaps, timings, and chosen backend in this PRD. Similarity to artwork is reviewed visually; byte equality applies to repeated generated output, not to the source reference. (Gaps, timings and backend recorded in Phase 0 findings; **human visual acceptance verdict pending**.)

Promote the successful spike fixture to a recipe in Phase 2 and use it for the local/remote parity check in Phase 3. This reference is the first acceptance example, not a new general-purpose diagram editor or automatic connector-routing requirement.

This is a greenfield specification, not a verified implementation map. Latency, portability, fidelity, and estimates remain targets until the spike records evidence.

## 6. The recipe abstraction layer

Yes, a recipe file layer is the right design. A recipe is the unit of "use case."

### 6.1 Recipe anatomy

```
recipes/
  product-hero/
    recipe.yaml          # metadata, params, input schema ref, variants
    input.schema.json    # JSON Schema (or Zod export) for required data
    layout.tsx           # trusted v1 source; YAML/JSON layouts deferred
    themes/              # optional recipe-specific themes
    fixtures/            # sample inputs for tests + previews
    snapshots/           # golden images for visual regression
  product-grid-3up/
  infographic-stat-cards/
  infographic-timeline/
```

### 6.2 recipe.yaml example

```yaml
id: product-hero
version: 3.1.0
title: Product hero banner
domain: commerce            # informational only; core ignores it
input: ./input.schema.json
outputs:
  - { name: email-hero, width: 1200, height: 600 }
  - { name: email-hero-mobile, width: 640, height: 800 }
params:
  theme:       { type: themeRef, default: citrus-pop, allow: [citrus-pop, neon-grain, editorial, minimal] }
  productSide: { type: enum, values: [left, right], default: right }
  showPrice:   { type: boolean, default: true }
  headlineMaxLines: { type: int, min: 1, max: 3, default: 2 }
constraints:
  - { rule: noOverlap, targets: [headline, cta, product] }
  - { rule: minContrast, target: cta, ratio: 4.5 }
  - { rule: withinSafeArea, targets: [headline, cta], inset: 32 }
fallbacks:
  headline: [shrinkToFit(min: 36), truncate(ellipsis)]
  product: { onError: placeholder }
```

### 6.3 Layout definition

Two authoring options, same output (a scene graph):

- **TSX (recommended for v1):** JSX over core primitives, type-checked, easy for developers, compatible with Satori.
- **YAML/JSON (v2):** for a future visual editor and non-developer authors. Compiles to the same scene graph.

```tsx
// recipes/product-hero/layout.tsx
import { Frame, Stack, Text, Image, Badge, Button, Background } from '@xyz-layout-engine/core';
import { PriceLine } from './components'; // commerce formatting stays recipe-local
import type { RecipeProps } from './types';

export default function Layout({ data, params, theme }: RecipeProps) {
  const p = data.products[0];
  return (
    <Frame>
      <Background theme={theme} />
      <Stack direction={params.productSide === 'right' ? 'row' : 'row-reverse'} padding={48} gap={32}>
        <Stack flex={1} justify="center" gap={16}>
          {data.offer && <Badge id="offer">{data.offer.label}</Badge>}
          <Text id="headline" role="heading-xl" maxLines={params.headlineMaxLines} fit="shrink">
            {data.headline}
          </Text>
          <Text role="body" maxLines={2}>{data.body}</Text>
          {params.showPrice && <PriceLine price={p.price} compareAt={p.compareAtPrice} />}
          <Button id="cta">{data.cta.label}</Button>
        </Stack>
        <Image id="product" src={p.imageUrl} fit="contain" flex={1} />
      </Stack>
    </Frame>
  );
}
```

### 6.4 Infographic recipe proving agnosticism

```tsx
// recipes/infographic-stat-cards/layout.tsx
export default function Layout({ data, theme }) {
  return (
    <Frame>
      <Background theme={theme} />
      <Stack direction="column" padding={56} gap={24}>
        <Text id="headline" role="heading-xl" maxLines={2} fit="shrink">{data.title}</Text>
        <Repeat items={data.stats} max={6} layout="grid" columns={3} gap={20}>
          {(s) => (
            <Card>
              <Text role="stat" fit="shrink">{s.value}</Text>
              <Text role="caption" maxLines={2}>{s.label}</Text>
            </Card>
          )}
        </Repeat>
        <Text role="footnote">{data.source}</Text>
      </Stack>
    </Frame>
  );
}
```

Same primitives, zero product knowledge in the core. If an infographic recipe needs a primitive the newsletter didn't, it goes in the core only if it's domain-neutral (e.g. `Repeat`, `BarChart`), otherwise in a recipe-local component.

### 6.5 Recipe registry and composition

- `RecipeRegistry` loads trusted installed recipes from disk/packages in v1; remote callers select published IDs/versions, never server paths.
- Resolve semver ranges to an immutable exact version before rendering. Re-publishing different content under the same version is rejected; see §10.1 for cache identity.
- **Recipe packs** (`@xyz-layout-engine/recipes-commerce`, `@xyz-layout-engine/recipes-infographic`) let you ship and license use cases separately.
- **Tenant overrides (v1):** schema-validated parameters and brand tokens only. TSX recipes are trusted deployment code; installation is an operator action, not a render API/MCP tool. Tenant YAML/JSON authoring is deferred until its bounded interpreter exists; YAML syntax alone is not a sandbox.

## 7. Core engine requirements

### 7.1 Primitives
`Frame`, `Stack` (flex), `Grid`, `Layer` (absolute), `Repeat`, `Text`, `RichText` (bold/italic/color spans), `Image`, `Shape` (rect, circle, blob, SVG path), `Background`, `Badge`, `Button`, `Card`, `Divider`, `Icon`. v1.1: `BarChart`, `Donut`, `Progress`, `Timeline`.

### 7.2 Text

- Reuse the geometry owner's font metrics and line breaking; `maxLines`, `fit: shrink | truncate | wrap`, min/max font sizes. Bound shrink-to-fit search to 10 iterations; if it still cannot fit, apply the declared fallback or report an error.
- Font registry per tenant; licenses tracked per font file. Default bundle: OFL Google Fonts.
- Emoji and non-Latin fallback chain.

### 7.3 Images

- Fetch only approved HTTPS sources, with deadlines, encoded-byte and decoded-pixel caps, content-type validation, and redirect limits. Check resolved IPs and every redirect; block loopback, private/link-local networks, and metadata endpoints in remote mode. Apply the same policy to image/font/SVG references and webhook destinations; disallow renderer-initiated network fetches.
- `fit: contain | cover`, focal point, optional background removal via pluggable provider.
- Palette extraction and background removal are optional later extensions; baseline v1 uses supplied assets and explicit theme tokens.

### 7.4 Themes and brand tokens

- Theme = background generator (gradient, blobs, grain, pattern, SVG decorations) + role styles (heading-xl, body, badge, button).
- Brand tokens (colors, fonts, logo, radius) override theme values.
- Themes are seeded and deterministic (random blobs use a seed from the input hash).

### 7.5 Constraint validation
After layout, before raster: check overflow, overlap, safe-area, contrast (WCAG ratio), image load failures. Report: `{ status: "ok" | "warning" | "error", issues: [{ code, severity, nodeId, message }] }`. `strict` fails on constraint violations; `lenient` applies only declared, bounded fallbacks and revalidates once. Remaining fatal errors fail in either mode; security/resource limits can never be downgraded to warnings. Check declared target pairs rather than treating intentional parent/child containment or background layers as overlaps. Contrast against unsupported image/gradient backgrounds reports an explicit unverifiable issue, never an assumed pass.

### 7.6 Renderers
| Backend | Use | Notes |
|---|---|---|
| Satori → SVG → resvg-js → PNG | Proposed default; no browser. Node v1; speed and edge portability require measurement | CSS subset; verify pinned dependency licenses and required notices in Phase 0 |
| Playwright/Chromium | Fallback for complex CSS (blend modes, filters, advanced typography) | Heavier; run in a worker pool |
| Browser preview | Same scene graph rendered as DOM/SVG in the editor | Live preview in your SaaS UI |

Renderer contract: measurement/layout exposes authoritative bounds for validation; rendering returns `{ bytes, mimeType }` for a validated scene and declared format/scale. Each backend publishes supported formats/features. Reject unsupported requests explicitly; fallback is recipe-declared, never triggered by arbitrary runtime errors. The precise geometry interface is a Phase 0 decision (§5.1).

## 8. API and MCP

### 8.1 Shared request/result contract

One runtime schema defines `RenderRequest` for library, CLI, HTTP, and MCP: recipe selector, named output, normalized `data`, validated `params`/`brand`, `format` (PNG/SVG), bounded `scale`, and validation `policy`. Reject unknown parameters. The authenticated server context supplies tenant identity; callers cannot select another tenant via request fields.

`RenderResult` contains resolved recipe version, render fingerprint, validation report, backend/runtime identity, and artifacts (`mimeType`, dimensions, digest; bytes locally or authorized URL plus `expiresAt` remotely). Schema errors expose field paths; operational errors expose a stable code, request/job ID, and whether retry is safe. No credentials, internal paths, or stack traces in public responses. HTTP descriptions and MCP tool schemas derive from the shared schema; do not maintain duplicate validators.

### 8.2 Library
```ts
import { createLayoutEngine } from '@xyz-layout-engine/core';
import commerce from '@xyz-layout-engine/recipes-commerce';

const engine = createLayoutEngine({ recipes: [commerce], renderer: 'satori', fonts, assets });
const result = await engine.render({
  recipe: 'product-hero@^3',
  output: 'email-hero',
  params: { theme: 'neon-grain' },
  brand: tenant.brandTokens,
  data: await shopifyAdapter.toProductSet(['gid://shopify/Product/123']),
});
// result: RenderResult with local artifact bytes; recipe range resolved to an exact version
```

### 8.3 CLI and HTTP remote engine

CLI: `xyz-layout-engine render --request request.json --out ./output` runs locally; adding `--engine-url https://engine.example` uses the HTTP API. Credentials come from environment/credential configuration, not command-line values. CLI writes files atomically inside the chosen output directory; remote mode rejects local paths rather than reading/uploading them implicitly.

- `GET /v1/recipes`, `GET /v1/recipes/:id`: authorized recipe versions, parameters, input schemas, outputs, backend capabilities, and active limits.
- `POST /v1/renders`: shared request; `201` with completed result for bounded sync work, or explicit async submission returning `202` with job ID/status URL. Do not silently enqueue a sync request that exceeds its deadline.
- `GET /v1/jobs/:id`: state, progress, result or structured failure; `POST /v1/jobs/:id/cancel`: authorized best-effort cancellation. A completed job remains completed.
- `POST /v1/previews`: shared resolution/validation path, returning SVG only for recipes/backends advertising SVG support.
- `POST /v1/batches`: bounded request list, parent job ID and per-item results; partial failures are explicit. Polling is the baseline; optional signed completion webhooks do not own job state.

API v1 is versioned independently of recipe versions. Server limits bound request bytes, output pixels, item count, concurrency, and execution time. Asset uploads, if needed for private inputs, are a bounded tenant-scoped ingestion operation returning an opaque asset ID; remote APIs never accept filesystem paths.

### 8.4 MCP support (v1)

Expose `list_recipes`, `get_recipe`, `render`, `preview`, `get_job`, `cancel_job`, and `render_batch` as thin mappings to the operations above. Return structured metadata/reports and artifact references, avoiding large base64 image payloads. Rendering writes artifacts and consumes resources; tool annotations must reflect this, but authorization must never rely on annotations.

- **Local stdio:** starts the same local engine with explicitly configured recipe/asset/output roots. Logs go to stderr; stdout is protocol-only. Resolve paths including symlinks within authorized roots.
- **Remote Streamable HTTP:** `/mcp` on the engine server, using the same application authorization, limits, jobs, and artifact access as HTTP. Use the official MCP SDK; pin and negotiate a supported protocol version. Prefer stateless request handling plus durable job IDs rather than a second session/job store.
- A local stdio bridge may forward to an explicitly configured remote engine using the HTTP client; it must not duplicate rendering or forward arbitrary credentials to asset hosts.
- HTTP API can use scoped service tokens; remote MCP implements the protocol's authorization requirements through an existing identity provider. Require TLS, token audience/scope validation, tenant/resource checks, and Origin validation. Bind local HTTP to loopback by default; credentials never go in tool arguments or recipe data.

Protocol references: [MCP transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports) and [MCP authorization](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization). No custom transport, agent orchestration framework, or recipe-install tool in v1.

### 8.5 Durable jobs and artifacts

Async jobs use `queued | running | succeeded | failed | cancelled`, persisted by one application job service shared by HTTP/MCP. A sync-only deployment needs no queue. Async acceptance occurs only after durable submission; worker leases/timeouts recover interrupted work. Retry transient failures at most twice within the job deadline; validation/security failures are not retried. Publish artifacts atomically before marking success; discard incomplete attempt output.

Async submissions require a tenant-scoped idempotency key: replay returns the existing job; reuse with different normalized request content returns conflict. Key and job retention are advertised; after expiry a key may submit new work. Content caching is separate from submission idempotency. Cancellation is best effort and checked between stages/items; disconnecting a client does not cancel a durable job. Batch item identity prevents successful items from being re-published on restart.

Artifacts and cache entries are private and tenant-scoped, with deployment-configured retention and expiring download URLs. Expired results are reported explicitly; do not return dead URLs as success. A remote engine uses its own filesystem or object store; it cannot write into a client's local filesystem.

## 9. Adapters (v1)

- **Shopify:** Admin GraphQL; products, variants, images, prices, compare-at, collections; webhook-driven cache invalidation.
- **WooCommerce:** REST v3; same normalized output.
- **CSV/JSON:** for infographics and manual use.
- Normalized domain schemas live in `@xyz-layout-engine/schemas` (Zod), not in the core. Generic brand/render tokens belong to the core contract. Prices include currency and integer minor units; formatting uses explicit locale, never the host default. Adapter failures are separate from render failures.

## 10. Non-functional requirements
| Area | Target |
|---|---|
| Latency | p95 < 400 ms per image (Satori path, cached assets) |
| Throughput | 50+ renders/sec per 4-vCPU worker (Satori path) |
| Determinism | Byte equality in a pinned runtime/backend; reviewed perceptual threshold across approved platform changes (§10.1) |
| Security | No tenant code execution; authenticated tenant isolation; bounded assets/output/work; SVG sanitization; private artifacts |
| Observability | Request/job ID; stage timings, cache hit, backend, retry count, issue codes; redact source data, credentials, signed URLs |
| Licensing | CI license check (e.g. `license-checker`), deny GPL/AGPL in shipped bundle |

Latency/throughput are hypotheses, measured separately for warm/cold paths on declared hardware, fixture mix, concurrency, and pinned backend versions. Render latency excludes queue/network time; report end-to-end latency and queue delay separately. Bound CPU/memory and apply backpressure (`429` with retry guidance) rather than allowing unlimited queued work. Freeze numeric resource/retention defaults from Phase 0 measurements before remote acceptance.

### 10.1 Reproducibility and cache identity

Fingerprint canonical normalized input, resolved recipe content/version, resolved parameters and brand/theme, output dimensions/format/scale, validation/fallback policy, engine/backend versions, seed, locale, and content hashes of all assets/fonts. URLs alone are not asset identity. Resolve and hash asset bytes before a content-cache lookup. Cache lookup/storage additionally includes authenticated tenant scope; shared public assets must be explicitly designated.

Pin fonts, rendering dependencies, and runtime/container for byte-level reproduction; remove unstable timestamps/metadata. Cross-backend or cross-platform byte equality is not promised. Record the manifest with the result so a failed render can be reproduced from authorized fixtures without logging private input. The proposed perceptual threshold (<0.1% differing pixels) requires a specified pixel tolerance and reviewed representative fixtures before adoption; never auto-approve changed goldens.

Security applies to all entry points: sanitize SVGs (no scripts, external references, or active HTML), forbid arbitrary browser navigation/script injection, isolate Chromium workers, and disable their network access. Remote asset fetching happens only through the bounded resolver. Set finite deadlines on every network/render call; kill/recycle a hung worker. Operational times are UTC; locale is an explicit render input.

## 11. Success metrics

- Time from catalog sync to first approved banner < 2 minutes.
- > 95% of renders pass validation without fallbacks.
- New recipe authored by a developer in < 1 day; new theme in < 2 hours.
- At least one infographic recipe in production use by v1.1.
- One pinned fixture renders offline locally and through remote HTTP/MCP with identical fingerprint, geometry/report, and artifact digest using the same runtime/backend; paths/URLs may differ.
- Cross-tenant job/asset access is denied; a restarted async worker finishes or reports a terminal failure without duplicate publication.

## 12. Risks
| Risk | Mitigation |
|---|---|
| Satori CSS subset too limiting | Renderer abstraction; Playwright fallback per recipe |
| Engine leaks commerce concepts | Infographic recipe required in v1 CI; lint rule banning domain imports in core |
| Font licensing exposure | Font registry with license field; OFL default set |
| Poor product photos | `contain` fit and padding first; optional background removal only if needed |
| Editor demand before ready | Auto-generated param forms from recipe schema cover 80% of customization |

---

# Implementation plan

## Repo layout (pnpm monorepo, TypeScript, Node 22+)

```
packages/
  core/                # scene graph, primitives, geometry contract, fitting, constraints
  render-satori/       # Satori + resvg backend
  render-playwright/   # Chromium backend
  schemas/             # Zod domain schemas (ProductSet, DataSeries)
  adapters-shopify/
  adapters-woo/
  adapters-tabular/    # CSV/JSON
  recipes-commerce/
  recipes-infographic/
  themes/              # shared theme library
  server/              # HTTP/application jobs + optional storage/queue integration
  mcp/                 # official SDK protocol adapter to shared operations
  preview/             # React preview + auto-generated param forms
tools/
  recipe-cli/          # xyz-layout-engine new|validate|render|snapshot; local or --engine-url
```

Proposed tooling: pnpm, tsup, Vitest, Zod, Fastify, official MCP SDK, pixelmatch, Changesets. Reuse installed dependencies first. BullMQ/Redis is justified only for durable multi-worker batches; local rendering does not need it. Filesystem artifacts suffice for one host; S3/R2 becomes necessary for shared remote workers. Start with modules inside these boundaries; split publishable packages only when deployment or reuse earns the split.

## Phases

### Phase 0: Spike (1 week)

- First reproduce the nutrition infographic composition in §5.3 with Satori/resvg and Playwright using the same fixture/assets. Follow with a simple product-hero smoke check; compare fidelity and speed.
- Decide default renderer and confirm license acceptability.
- Verify one authoritative geometry path for fitting/constraints; check PNG/SVG and required text/script support using pinned fonts.
- Exit: reference-composition PNGs from both backends, visual acceptance verdict (§5.3), product-hero smoke output, timings, license memo, backend geometry decision, and proposed resource limits recorded back into this PRD.
- [x] QA: run the spike, record hardware/dependencies and capability gaps; select a default backend from observed results. No estimates marked as measured. (2026-10-08, see findings below.)

#### Phase 0 findings (2026-10-08, GH-1)

Evidence: `tools/spike/REPORT.md`, `tools/spike/output/` (regenerate with `pnpm run spike:render`; gate `pnpm run spike:verify`, exit 0). Independent post-build QA: `relay-system/2026-10-08/gh1-spike-p2-postbuild.md` (Codex, Approved after three rounds). Hardware: Apple M1 Max, Node v22.22.3, satori 0.36.0, @resvg/resvg-js 2.6.2, playwright 1.64.0 with Chrome for Testing 156.0.8078.4.

- **Reference composition:** both backends render the §5.3 nutrition fixture from structured data and separate SVG illustrations (`output/satori.png`, `output/playwright.png`, 1000×1000). Agent visual assessment: all sections present and readable, no clipping, no unintended overlap (verifier-checked); the two backends are broadly similar, with element positions differing by whole pixels and different text anti-aliasing (coordinates in `tools/spike/REPORT.md` §8). **Human visual acceptance: pending** operator review of artwork; the hand-authored illustrations are deliberately sparse placeholders, the benefits panel is a horizontal bottom strip where the reference uses a vertical side panel, and the reference's callouts carry copy and icons the fixture lacks.
- **Product-hero smoke:** structured 1200×630 hero (`tools/spike/hero-fixture.json`) renders exactly to canvas in both backends with no overflow (`output/hero-*.png`).
- **Geometry decision (§5.1 gate):** both backends expose authoritative bounds for fitting without a second layout engine. Satori: `onNodeDetected` laid-out element boxes with text content (glyph ink beyond the box is not observable). Chromium: element rects plus `Range` and scroll/client metrics (ink-level). Bounded fitting (≤10 re-renders, font-size only) fit baseline, the prescribed long-copy override, and the hero at iteration 0 in both backends; the shrink path is implemented but untested by these cases.
- **Text and script support (pinned Inter Regular 4.0):** English and accented Latin render from the pinned font in both backends. CJK and emoji are **not covered** by the pinned font: Satori draws `.notdef` placeholders unless fallback fonts are supplied via `loadAdditionalAsset`; Chromium silently substitutes system faces, which is not reproducible across hosts. v1 claims English only; other scripts need explicit pinned fallback fonts.
- **SVG:** Satori emits SVG (`output/satori.svg`, byte-stable across repeats). Chromium screenshot is raster-only; SVG export is unsupported there, not emulated.
- **Determinism:** PNG sha256 equal across independent repeat renders for both backends.
- **Timings (ms, one machine, one fixture, not a p95; from the delivered `runtime.json`, `generatedAt` 2026-10-09T00:16:57.399Z):** Satori warm stage median 26.5 (min 25.5, max 27.7; layout + resvg + PNG encode), cold 152.7 (import + wasm init + first render). Chromium warm stage median 68.8 (min 66.8, max 72.1; setContent through screenshot on a running browser), cold 425.7 (launch + first render). Both cold numbers are backend initialization inside a running process; fresh-process startup was not measured. §10 targets remain hypotheses.
- **Memory:** Node process rss ≈ 270–276 MiB after the warm loops (shared process, not per-backend peak). Chromium RSS was not observable (`Browser.process()` unavailable in Playwright 1.64.0); measure at worker level in Phase 1 before freezing a browser limit.
- **Licence memo:** satori, @resvg/resvg-js and its darwin-arm64 native binding are MPL-2.0 (within the PRD exception); satori transitives yoga-layout, harfbuzzjs, @shuding/opentype.js, linebreak are MIT; playwright is Apache-2.0; Inter is OFL-1.1. Package licences are read from installed manifests with provenance; the font licence comes from `tools/spike/assets/SOURCES.md` and the verifier's sha256 constants. **Open item:** the Playwright-managed browser is Google "Chrome for Testing", not bare Chromium; its third-party notices live at chrome://credits and are recorded as unverified for shipping until reviewed. No GPL/AGPL string appears.
- **Proposed resource limits (targets from these measurements, to be frozen after Phase 1 on deployment hardware):** scene JSON ≤ 256 KiB; assets ≤ 1 MiB each / 8 MiB per render (SVG or PNG); output ≤ 4096×4096 and ≤ 16 MiB; render time 5 s soft / 30 s hard (Satori), 10 s / 60 s (Chromium); fitting ≤ 10 iterations; Satori worker 512 MiB; Chromium worker 1 GiB placeholder pending measurement; concurrency Satori one render per task × cores, Chromium 2–4 contexts per browser, both unmeasured under load.
- **Backend decision:** **Satori → resvg-js is the default renderer.** It passed every mandatory check, its warm stage median is 26.5 ms vs 68.8 ms for Chromium here, it needs no browser process, and it emits SVG. **Playwright/Chromium stays the recipe-declared fallback** (§7.6) for CSS beyond Satori's subset and for scripts the pinned fonts do not cover; it also passed every mandatory check. Selection evidence: `measurements.selection.eligible = ["satori","playwright"]`.
- **Carried into Phase 1:** explicit fallback fonts for non-Latin scripts; conservative line-height defaults (Satori cannot see glyph-ink overflow); Chromium memory measurement; the `globalThis.__dirname` shim required by satori 0.36.0's ESM loader; Chrome for Testing notice review. Phase 0 remains **awaiting human visual acceptance**; later phases stay pending.

### Phase 1: Core engine (2 to 3 weeks)

- Scene graph types; primitives `Frame, Stack, Grid, Layer, Repeat, Text, Image, Shape, Background, Badge, Button, Card`.
- Text measurement + `maxLines` + shrink-to-fit (binary search on font size).
- Theme system with seeded backgrounds; brand token merge.
- Constraint validator (overflow, overlap, safe area, contrast).
- Renderer interface + the backend selected in Phase 0; XYZ Layout Engine reuses its geometry and text measurement.
- Exit: deterministic fixture output and actionable constraint reports using the selected geometry owner.
- [ ] QA: execute focused fitting/constraint checks, including long copy and missing images; record results. No second independent text/layout implementation.

### Phase 2: Recipe layer (1 to 2 weeks)

- `recipe.yaml` loader, JSON Schema/Zod validation, param resolution, semver registry.
- `recipe-cli`: `new`, `validate`, `render --fixture`, `snapshot`; offline local rendering and local MCP stdio over shared operations.
- Recipes: `product-hero`, `product-grid-3up`, and the promoted **nutrition infographic reference recipe** (§5.3, agnosticism gate). `infographic-stat-cards` remains an illustrative follow-on, not an extra v1 acceptance requirement.
- Visual regression in CI against `snapshots/`.
- Exit: three recipes render through the local library/CLI/MCP; dependency checks block domain imports in `core`.
- [ ] QA: execute pinned-fixture checks, prove offline output, reject invalid params and local path escapes; review golden images before acceptance.

### Phase 3: Adapters + service (2 weeks)

- Shopify and Woo adapters to `ProductSet`; CSV/JSON adapter to `DataSeries`.
- Remote engine: shared request schema, HTTP endpoints and MCP Streamable HTTP, CLI remote selection, authentication/tenant isolation, private artifacts and content cache.
- Async job service: idempotency, status/cancel, bounded batch/retry, durable recovery; storage/queue chosen for the initial deployment (§8.5).
- Asset fetcher: allowlist, timeouts, size caps, cache.
- Exit: catalog → private banner URL for a real store; same pinned recipe/data renders locally and remotely.
- [ ] QA: execute HTTP/MCP parity, cross-tenant denial, blocked URL/redirect, idempotent replay, and worker interruption checks; record results and active limits before remote pilot.

### Phase 4: Product UI (2 weeks)

- Preview package: live SVG preview, param forms generated from recipe schema, theme picker, brand token editor.
- Batch: pick products × recipes → zip/URLs, webhook on completion.
- Exit: marketer can produce a week's newsletter images without dev help.
- [ ] QA: complete that workflow, including partial batch failure and expired-artifact handling; record preview/final-render differences.

### Phase 5: Hardening + v1 launch (1 to 2 weeks)

- Wire the alternate spike backend per recipe only where measured capability gaps justify it. If Satori is selected, Playwright is the complex-CSS fallback; if Playwright is selected, do not add a second production backend without a present need.
- Tune existing quotas/tracing/metrics from pilot evidence; dependency license check with shipped notices. Security limits ship in Phase 3, not at launch.
- Six to eight commerce themes; two more commerce recipes (sale banner, new arrivals).
- Exit: bounded production pilot meets measured warm-render targets and documented recovery behavior.
- [ ] QA: run declared load/cold-start checks, backend-specific fixtures and recovery checks; record results and rollback instructions. Disable a failing recipe/backend for new work while retaining pinned previous versions for reproducible jobs.

### Phase 6: Infographic expansion (v1.1, 2 to 3 weeks)

- Chart primitives (`BarChart`, `Donut`, `Progress`, `Timeline`) in core as domain-neutral.
- Recipes: timeline, comparison, top-N list.
- Optional: YAML layout authoring only with bounded expressions, node/depth/repeater limits, and no executable code or unrestricted file/network access.
- Exit: infographic recipes render representative data without commerce dependencies.
- [ ] QA: execute boundary fixtures for chart/list counts and long labels; record results before expanding supported primitives.

### Later

- Visual editor writing YAML recipes.
- AI helpers: copy suggestions, theme-from-photo, generated background assets (cached, moderated).
- Additional outputs: PDF one-pagers, social sizes, animated WebP.

## Verification scope and rollout

Use existing PDDA checks for documentation; this iteration adds no runtime or CI tests. During implementation, extend existing checks first. New checks require a named failure mode: a small recipe fixture set earns visual regression for determinism; shared-contract parity, tenant isolation, SSRF/path boundaries, and async restart/replay earn focused checks because failures cross trust or persistence boundaries. Do not add per-wrapper duplicate suites or snapshot every theme. Run applicable checks and record results at each exit; new CI gates need a stated justification. Debugging follows debug-mantra: reproduce, trace the failure, falsify the hypothesis, cross-reference evidence.

Document edits are **Easy** to undo. Published API/recipe contracts and async storage are **Costly**: pilot one tenant first, retain exact recipe/backend versions, and stop rollout on parity failures, unauthorized access, duplicate artifact publication, or missed deadlines. Shut off new remote submissions before rollback; preserve accepted jobs/artifacts and verify replay against compatible pinned versions. Choose durable storage before accepting async work; no destructive schema change is assumed in this plan.

## Total estimate
Original estimate: roughly 11 to 15 engineer-weeks to v1 (newsletter), +2 to 3 for infographic v1.1. This is not yet validated and did not explicitly budget remote MCP authorization or durable recovery. Re-estimate after Phase 0; preserve local/remote/API/MCP requirements and reduce themes/UI breadth first if capacity is tight.

## Key decisions to confirm

1. Satori default vs Playwright default (Phase 0 result).
2. Trusted TSX-only recipes in v1; tenant YAML deferred by default (§6.5).
3. Whether recipe packs are a pricing/licensing boundary in your SaaS.
4. Background removal deferred by default; add only for demonstrated photo-quality needs.
5. Initial remote deployment (single host vs multiple workers), identity provider, job/artifact retention, and numeric resource limits; settle before Phase 3 pilot.
6. Font/script support and access to backend-owned geometry; settle from Phase 0 evidence. Backend ownership of layout/text measurement is decided (§5.2).
