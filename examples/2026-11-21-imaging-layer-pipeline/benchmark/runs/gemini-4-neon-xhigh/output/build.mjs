#!/usr/bin/env node
/**
 * One-command build for the "How XYZ Layout Engine Assembles a Poster" visual explanation.
 * Reads editable captions from output/content.json and packet inputs (read-only),
 * generates self-contained offline output/index.html, and captures output/poster.png
 * at native dimensions via Playwright Chromium.
 *
 * Usage (from packet root):
 *   node output/build.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKET_ROOT = path.resolve(__dirname, '..');

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function toDataUri(relPath, mime) {
  const buf = await fs.readFile(path.join(PACKET_ROOT, relPath));
  return `data:${mime};base64,${buf.toString('base64')}`;
}

function extractInlineSvgs(renderInlineHtml) {
  const byId = {};
  const shadows = {};
  const matches = renderInlineHtml.matchAll(/<img([^>]*)src="(data:image\/svg\+xml;base64,[^"]+)"/g);
  for (const m of matches) {
    const uri = m[2];
    const svg = Buffer.from(uri.split(',')[1], 'base64').toString('utf8');
    const idMatch = /<svg[^>]*\sid="([^"]+)"/.exec(svg);
    if (idMatch) {
      byId[idMatch[1]] = uri;
    } else if (svg.includes('cast_')) {
      const castMatch = /id="cast_([^"]+)"/.exec(svg);
      if (castMatch) shadows[castMatch[1]] = uri;
    }
  }
  return { byId, shadows };
}

function buildPosterPlanes(fixture, assets, svgs) {
  const { palette } = fixture.theme;
  const { header, hero, items, benefitsPanel, footer } = fixture.sections;

  const groundShadow = (id, w, h) =>
    svgs.shadows[id]
      ? `<img src="${svgs.shadows[id]}" style="position:absolute;left:0;top:0;width:${w}px;height:${h}px;object-fit:contain;" alt="">`
      : '';

  // PLANE 1: Canvas backdrop, CSS flexbox grid guides, green-bordered containers & ground cast shadows
  const plane1Inner = `
    <div class="p-canvas" style="background-color:${palette.background};background-image:radial-gradient(circle at 50% 44%, #fffef8 0%, #f7f3e3 58%, #ede6cf 100%);">
      <div class="p-grid-zone p-zone-header">
        <span class="p-css-tag">#header · flex-column</span>
      </div>
      <div class="p-grid-zone p-zone-hero">
        <span class="p-css-tag">#hero · position: relative · flex-row</span>
        <div class="p-callout-slot" style="left:0;top:81px;">
          <div style="position:relative;width:280px;height:210px;">${groundShadow('balance_scale', 280, 210)}</div>
        </div>
        <div class="p-callout-slot" style="right:0;top:81px;">
          <div style="position:relative;width:280px;height:210px;">${groundShadow('skip_spike', 280, 210)}</div>
        </div>
      </div>
      <div class="p-lower-row">
        <div class="p-items-grid">
          <span class="p-css-tag" style="top:-22px;left:6px;">#items · flex-row (4 cards)</span>
          ${['parfait_jar', 'snack_container', 'chicken_wrap', 'water_bottle']
            .map(
              id => `<div class="p-item-slot">
                <div style="position:relative;width:160px;height:170px;">${groundShadow(id, 160, 170)}</div>
              </div>`
            )
            .join('')}
        </div>
        <div class="p-benefits-box" style="border-color:${palette.panelBorder};background:${palette.panelFill};">
          <span class="p-css-tag" style="top:-22px;left:4px;">#benefitsPanel</span>
        </div>
      </div>
      <div class="p-footer-pill" style="border-color:${palette.panelBorder};background:${palette.panelFill};">
        <span class="p-css-tag" style="top:-22px;left:18px;">#footer · border-radius: 999px</span>
      </div>
    </div>
  `;

  // PLANE 2: Typography & vector icons driven by nutrition/fixture.json
  const plane2Inner = `
    <div class="p-canvas p-glass-text">
      <div class="p-header-block">
        <div class="p-header-row">
          ${svgs.byId.leaf_small ? `<img src="${svgs.byId.leaf_small}" style="width:42px;height:42px;" alt="">` : ''}
          <div class="p-headline-highlight">
            <span class="p-h1" style="color:${palette.primary};">${esc(header.headline)}</span>
          </div>
          ${svgs.byId.leaf_small ? `<img src="${svgs.byId.leaf_small}" style="width:42px;height:42px;transform:scaleX(-1);" alt="">` : ''}
        </div>
        <div class="p-h2" style="color:${palette.primary};">${esc(header.subtitle)}</div>
      </div>

      <div class="p-hero-block">
        ${hero.callouts
          .map(
            c => `<div class="p-callout-text">
              <div style="height:216px;"></div>
              <div class="p-label" style="color:${palette.primary};">${esc(c.title)}</div>
              <div class="p-body" style="color:${palette.muted};">${esc(c.text)}</div>
            </div>`
          )
          .join('')}
      </div>

      <div class="p-lower-row">
        <div class="p-items-text">
          ${items
            .map(
              it => `<div class="p-item-text">
                <div style="height:174px;"></div>
                <div class="p-label" style="color:${palette.primary};">${esc(it.title)}</div>
                <div class="p-body-sm" style="color:${palette.muted};">${esc(it.caption)}</div>
              </div>`
            )
            .join('')}
        </div>
        <div class="p-benefits-text">
          ${benefitsPanel
            .map(
              b => `<div class="p-benefit-row">
                ${svgs.byId[b.iconId] ? `<img src="${svgs.byId[b.iconId]}" style="width:42px;height:42px;flex:none;" alt="">` : ''}
                <span class="p-benefit-label" style="color:${palette.primary};">${esc(b.text)}</span>
              </div>`
            )
            .join('')}
        </div>
      </div>

      <div class="p-footer-text-row">
        ${svgs.byId.leaf_small ? `<img src="${svgs.byId.leaf_small}" style="width:28px;height:28px;" alt="">` : ''}
        <span class="p-footer-banner" style="color:${palette.primary};">${esc(footer.bannerText)}</span>
        <span style="width:2px;height:28px;background:${palette.panelBorder};display:inline-block;"></span>
        <span class="p-footer-tagline" style="color:${palette.muted};">${esc(footer.tagline)}</span>
        ${svgs.byId.heart ? `<img src="${svgs.byId.heart}" style="width:24px;height:24px;" alt="">` : ''}
      </div>
    </div>
  `;

  // PLANE 3: Transparent PNG cutouts + authentic nutrition.mjs geometric coordinate rulers
  const plane3Inner = `
    <div class="p-canvas p-glass-art">
      <div style="height:112px;width:952px;"></div>
      <div class="p-hero-art-band">
        <img src="${assets.balance_scale}" style="position:absolute;left:15px;top:81px;width:280px;height:210px;object-fit:contain;" alt="balance_scale">
        <img src="${assets.skip_spike}" style="position:absolute;right:15px;top:81px;width:280px;height:210px;object-fit:contain;" alt="skip_spike">

        <!-- Hero leaf_glow.png at exact nutrition.mjs coordinates: left:262, top:-34, width:428, height:640 -->
        <img src="${assets.leaf_glow}" style="position:absolute;left:262px;top:-34px;width:428px;height:640px;object-fit:contain;filter:drop-shadow(0px 6px 8px rgba(242,228,150,0.55));" alt="leaf_glow">

        <!-- Architectural Amber Coordinate Overlay on Plane 3 -->
        <div class="p-leaf-frame"></div>

        <!-- Horizontal left: 262 measurement arrow from hero left edge (0) to leaf left (262) -->
        <div class="p-dim-left">
          <div class="p-dim-line-h"></div>
          <div class="p-dim-badge">left: 262</div>
        </div>

        <!-- Vertical top: -34 measurement arrow showing upward bleed above hero band (y=0 to y=-34) -->
        <div class="p-dim-top">
          <div class="p-dim-line-v"></div>
          <div class="p-dim-badge p-dim-badge-top">top: -34</div>
        </div>

        <!-- Size pill 428 x 640 on leaf right edge -->
        <div class="p-dim-size">428 × 640</div>
      </div>

      <!-- Lower row transparent food cutouts -->
      <div class="p-items-art-row">
        <div class="p-art-slot"><img src="${assets.parfait_jar}" style="width:160px;height:170px;object-fit:contain;" alt="parfait_jar"></div>
        <div class="p-art-slot"><img src="${assets.snack_container}" style="width:160px;height:170px;object-fit:contain;" alt="snack_container"></div>
        <div class="p-art-slot"><img src="${assets.chicken_wrap}" style="position:absolute;left:0;top:60px;width:160px;height:107px;object-fit:contain;" alt="chicken_wrap"></div>
        <div class="p-art-slot"><img src="${assets.water_bottle}" style="width:160px;height:170px;object-fit:contain;" alt="water_bottle"></div>
      </div>
    </div>
  `;

  return { plane1Inner, plane2Inner, plane3Inner };
}

function buildPixelLoupeSvg() {
  const grid = [
    ['#fbfaf3', '#fbfaf3', '#f4f8ea', '#cfe0be', '#7fb04a', '#558536', '#2f5d27', '#2f5d27'],
    ['#fbfaf3', '#f4f8ea', '#b9d79b', '#7fb04a', '#4c7c32', '#2f5d27', '#2f5d27', '#3f6e2d'],
    ['#fbfaf3', '#dceac9', '#7fb04a', '#4c7c32', '#2f5d27', '#2f5d27', '#669b3d', '#98c45e'],
    ['#f4f8ea', '#9fc971', '#4c7c32', '#2f5d27', '#2f5d27', '#4c7c32', '#8fbe55', '#c8e09e'],
    ['#fbfaf3', '#7fb04a', '#2f5d27', '#2f5d27', '#4c7c32', '#7fb04a', '#b9d79b', '#f4f8ea'],
    ['#fbfaf3', '#b9d79b', '#4c7c32', '#2f5d27', '#669b3d', '#9fc971', '#e8f1da', '#fbfaf3'],
    ['#fbfaf3', '#e8f1da', '#7fb04a', '#4c7c32', '#8fbe55', '#d5e5c1', '#fbfaf3', '#fbfaf3'],
    ['#fbfaf3', '#fbfaf3', '#b9d79b', '#7fb04a', '#cfe0be', '#fbfaf3', '#fbfaf3', '#fbfaf3'],
  ];
  const cell = 8;
  const rects = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      rects.push(
        `<rect x="${c * cell}" y="${r * cell}" width="${cell}" height="${cell}" fill="${grid[r][c]}" stroke="rgba(18,26,22,0.22)" stroke-width="0.6"/>`
      );
    }
  }
  return `
    <svg width="66" height="66" viewBox="0 0 68 68" aria-label="Magnified raster pixel grid">
      <defs>
        <clipPath id="loupeClip"><circle cx="34" cy="34" r="30"/></clipPath>
      </defs>
      <g clip-path="url(#loupeClip)" transform="translate(2,2)">
        ${rects.join('')}
      </g>
      <circle cx="34" cy="34" r="30" fill="none" stroke="#f59e0b" stroke-width="3"/>
      <circle cx="34" cy="34" r="32.5" fill="none" stroke="#111915" stroke-width="1.5"/>
    </svg>
  `;
}

function buildHtml(content, fixture, fonts, assets, svgs) {
  const { width, height } = content.meta;
  const { plane1Inner, plane2Inner, plane3Inner } = buildPosterPlanes(fixture, assets, svgs);

  const legendHtml = content.header.legend
    .map(
      item => `
      <div class="legend-pill tone-${esc(item.tone)}">
        <span class="legend-num">${esc(item.num)}</span>
        <span class="legend-label">${esc(item.label)}</span>
      </div>`
    )
    .join('');

  const satoriStepsHtml = content.pipeline.backendsStage.satoriSteps
    .map(
      (s, i) => `
      ${i > 0 ? '<span class="step-arrow">→</span>' : ''}
      <div class="pipe-node ${i === 1 ? 'pipe-node-accent' : i === 2 ? 'pipe-node-out' : ''}">
        <div class="pipe-node-title">${esc(s.title)}</div>
        <div class="pipe-node-detail">${esc(s.detail)}</div>
      </div>`
    )
    .join('');

  const playwrightStepsHtml = content.pipeline.backendsStage.playwrightSteps
    .map(
      (s, i) => `
      ${i > 0 ? '<span class="step-arrow">→</span>' : ''}
      <div class="pipe-node ${i === 1 ? 'pipe-node-pw' : i === 2 ? 'pipe-node-out' : ''}">
        <div class="pipe-node-title">${esc(s.title)}</div>
        <div class="pipe-node-detail">${esc(s.detail)}</div>
      </div>`
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(content.meta.pageTitle)}</title>
<style>
@font-face {
  font-family: 'Barlow Condensed';
  font-weight: 400;
  font-style: normal;
  src: url(${fonts.regular}) format('truetype');
}
@font-face {
  font-family: 'Barlow Condensed';
  font-weight: 700;
  font-style: normal;
  src: url(${fonts.bold}) format('truetype');
}

*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: ${width}px;
  height: ${height}px;
  overflow: hidden;
  background: #111915;
  color: #f4f7f2;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.poster {
  position: relative;
  width: ${width}px;
  height: ${height}px;
  overflow: hidden;
  background:
    radial-gradient(circle at 63% 34%, rgba(62, 112, 68, 0.25) 0%, rgba(20, 32, 26, 0.0) 56%),
    radial-gradient(circle at 18% 82%, rgba(56, 189, 248, 0.08) 0%, transparent 45%),
    linear-gradient(160deg, #16221c 0%, #101814 55%, #0d1411 100%);
}

/* Architectural drafting dot grid */
.poster::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(220, 242, 224, 0.07) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
}

/* Top color accent hairline */
.top-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #4ade80 0%, #2dd4bf 32%, #fbbf24 64%, #38bdf8 100%);
}

/* ================= HEADER (y: 12..84) ================= */
.header {
  position: absolute;
  left: 24px;
  right: 24px;
  top: 12px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(185, 215, 155, 0.18);
  padding-bottom: 6px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.main-title {
  margin: 0;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 44px;
  line-height: 1.08;
  letter-spacing: 1.3px;
  color: #fbfaf3;
  text-transform: uppercase;
}

.main-subtitle {
  margin: 0;
  font-size: 15px;
  line-height: 1.25;
  color: #b7ceb9;
  font-weight: 500;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 9px;
}

.legend-pill {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 11px 5px 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.legend-num {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 16px;
  color: #0c1510;
}

.legend-label {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 17px;
  letter-spacing: 0.6px;
  color: #edf4ee;
}

.tone-emerald .legend-num { background: #4ade80; }
.tone-teal .legend-num { background: #2dd4bf; }
.tone-amber .legend-num { background: #fbbf24; }
.tone-sky .legend-num { background: #38bdf8; }

/* ================= LEFT INPUT CARDS (x: 24..416, y: 94..640, height: 546px) ================= */
.inputs-col {
  position: absolute;
  left: 24px;
  top: 94px;
  width: 392px;
  height: 546px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  z-index: 20;
}

.input-card {
  position: relative;
  background: rgba(18, 28, 23, 0.94);
  border-radius: 12px;
  border: 1px solid rgba(210, 232, 214, 0.16);
  padding: 8px 12px 8px 13px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.34);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 5px;
}

.input-card.card-words { border-left: 5px solid #4ade80; height: 174px; }
.input-card.card-art   { border-left: 5px solid #2dd4bf; height: 174px; }
.input-card.card-move  { border-left: 5px solid #fbbf24; height: 182px; }

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

/* Thumbnail-legible macro callout badges (tall Barlow Condensed Bold -> 7-8px cap height at 400px wide) */
.macro-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 6px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 29px;
  line-height: 1.04;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  white-space: nowrap;
}

.panel-node .macro-badge {
  font-size: 26px;
  letter-spacing: 0.6px;
  padding: 2px 9px;
}

.assembled-head .macro-badge {
  font-size: 24px;
  letter-spacing: 0.6px;
  padding: 2px 8px;
}

.output-card .macro-badge {
  font-size: 23px;
  letter-spacing: 0.5px;
  padding: 2px 7px;
}

.output-card .file-chip {
  font-size: 9.5px;
  padding: 2px 4px;
}

.output-card .panel-head-row {
  gap: 4px;
}

.badge-emerald { background: #4ade80; color: #09170e; }
.badge-teal    { background: #2dd4bf; color: #061816; }
.badge-amber   { background: #fbbf24; color: #1b1102; }
.badge-sky     { background: #38bdf8; color: #061621; }
.badge-cream   { background: #fbfaf3; color: #1e3d19; }

.file-chip {
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 11.5px;
  font-weight: 600;
  color: #cbe2cf;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 5px;
  padding: 2px 7px;
  white-space: nowrap;
}

.code-snippet {
  background: #0a100d;
  border: 1px solid rgba(185, 215, 155, 0.16);
  border-radius: 7px;
  padding: 5px 8px;
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 11.2px;
  line-height: 1.34;
  color: #c9dccb;
}

.code-k { color: #8ecaa4; }
.code-s { color: #fde68a; }
.code-c { color: #799681; }

.hl-emerald {
  background: rgba(74, 222, 128, 0.22);
  color: #bbf7d0;
  padding: 0px 4px;
  border-radius: 3px;
  font-weight: 700;
  border: 1px solid rgba(74, 222, 128, 0.45);
}

.hl-teal {
  background: rgba(45, 212, 191, 0.22);
  color: #99f6e4;
  padding: 0px 4px;
  border-radius: 3px;
  font-weight: 700;
  border: 1px solid rgba(45, 212, 191, 0.45);
}

.hl-amber {
  background: rgba(251, 191, 36, 0.22);
  color: #fef08a;
  padding: 0px 4px;
  border-radius: 3px;
  font-weight: 700;
  border: 1px solid rgba(251, 191, 36, 0.48);
}

.card-caption {
  margin: 0;
  font-size: 12px;
  line-height: 1.28;
  color: #dbe9dd;
}

.art-split {
  display: flex;
  align-items: center;
  gap: 10px;
}

.checker-thumb {
  width: 50px;
  height: 68px;
  flex: none;
  border-radius: 7px;
  border: 1.5px solid rgba(45, 212, 191, 0.55);
  background-color: #1f2b25;
  background-image:
    linear-gradient(45deg, #2b3a33 25%, transparent 25%),
    linear-gradient(-45deg, #2b3a33 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #2b3a33 75%),
    linear-gradient(-45deg, transparent 75%, #2b3a33 75%);
  background-size: 10px 10px;
  background-position: 0 0, 0 5px, 5px -5px, -5px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px;
}

.checker-thumb img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

.art-meta {
  flex: 1;
  min-width: 0;
}

/* ================= CENTER 3D EXPLODED ASSEMBLY STAGE (x: 428..1084, y: 94..640) ================= */
.assembly-stage {
  position: absolute;
  left: 428px;
  top: 94px;
  width: 656px;
  height: 546px;
  border-radius: 14px;
  background: radial-gradient(ellipse at 54% 52%, rgba(44, 72, 54, 0.34) 0%, rgba(14, 22, 18, 0.58) 72%);
  border: 1px solid rgba(185, 215, 155, 0.16);
  overflow: visible;
}

.stage-kicker {
  position: absolute;
  left: 16px;
  top: 10px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 16.5px;
  letter-spacing: 1.4px;
  color: #a9c7b0;
  text-transform: uppercase;
}

.stage-floor-note {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12.2px;
  font-weight: 600;
  color: #a6c1ac;
  letter-spacing: 0.2px;
}

.plane-wrapper {
  position: absolute;
  width: 300px;
  height: 300px;
  perspective: 1150px;
}

.plane-tab {
  position: absolute;
  top: -26px;
  left: 2px;
  padding: 2px 9px;
  border-radius: 5px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.7px;
  white-space: nowrap;
  z-index: 5;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.45);
}

.tab-p1 { background: #e8e2cc; color: #20311d; border: 1px solid #b9d79b; }
.tab-p2 { background: #1c3a28; color: #a7f3d0; border: 1.5px solid #4ade80; }
.tab-p3 {
  background: #2d2310;
  color: #fde68a;
  border: 1.5px solid #fbbf24;
  left: auto;
  right: 8px;
}

.plane-card {
  width: 300px;
  height: 300px;
  transform: rotateY(-24deg) rotateX(6deg);
  transform-style: preserve-3d;
  border-radius: 10px;
  position: relative;
  overflow: visible;
}

.plane-1 .plane-card {
  box-shadow:
    -7px 10px 0 rgba(190, 182, 152, 0.35),
    -18px 26px 36px rgba(0, 0, 0, 0.58);
  border: 2px solid #d5cca9;
}

.plane-2 .plane-card {
  background: rgba(251, 250, 243, 0.26);
  border: 2px solid rgba(74, 222, 128, 0.74);
  box-shadow:
    -5px 8px 0 rgba(74, 222, 128, 0.16),
    -16px 24px 34px rgba(0, 0, 0, 0.45);
}

.plane-3 .plane-card {
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(251, 191, 36, 0.8);
  box-shadow:
    -5px 8px 0 rgba(251, 191, 36, 0.18),
    -18px 28px 40px rgba(0, 0, 0, 0.52);
}

/* Inner 1000x1000 authentic poster space scaled to 296x296 */
.plane-scale {
  width: 1000px;
  height: 1000px;
  transform: scale(0.296);
  transform-origin: top left;
  position: absolute;
  top: 0;
  left: 0;
  font-family: 'Barlow Condensed', sans-serif;
}

.p-canvas {
  width: 1000px;
  height: 1000px;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  border-radius: 24px;
  position: relative;
}

.p-glass-text {
  background: linear-gradient(135deg, rgba(255, 254, 248, 0.78) 0%, rgba(244, 248, 234, 0.42) 100%);
}

.p-glass-art {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.03) 100%);
}

.p-grid-zone {
  position: relative;
  width: 952px;
  border: 3px dashed rgba(47, 93, 39, 0.42);
  border-radius: 14px;
}

.p-zone-header { height: 112px; }
.p-zone-hero   { flex: 1; min-height: 0; }

.p-css-tag {
  position: absolute;
  top: 8px;
  left: 12px;
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 22px;
  font-weight: 700;
  color: #2f5d27;
  background: rgba(244, 248, 234, 0.92);
  padding: 2px 10px;
  border-radius: 6px;
  border: 1.5px solid #9cc179;
}

.p-callout-slot {
  position: absolute;
  width: 310px;
  display: flex;
  justify-content: center;
}

.p-lower-row {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  width: 952px;
}

.p-items-grid {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 750px;
  height: 238px;
  border: 3px dashed rgba(47, 93, 39, 0.35);
  border-radius: 14px;
  padding: 4px 6px;
}

.p-item-slot {
  width: 165px;
  display: flex;
  justify-content: center;
}

.p-benefits-box {
  position: relative;
  width: 190px;
  height: 242px;
  border-width: 3px;
  border-style: solid;
  border-radius: 16px;
}

.p-footer-pill {
  position: relative;
  width: 940px;
  height: 52px;
  border-width: 3px;
  border-style: solid;
  border-radius: 999px;
}

/* Plane 2 typography */
.p-header-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 952px;
  gap: 4px;
}

.p-header-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 952px;
}

.p-headline-highlight {
  padding: 2px 18px;
  border-radius: 14px;
  background: rgba(74, 222, 128, 0.26);
  border: 4px solid #22c55e;
  box-shadow: 0 0 24px rgba(74, 222, 128, 0.4);
}

.p-h1 {
  font-size: 66px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  line-height: 1.18;
}

.p-h2 {
  font-size: 36px;
  font-weight: 400;
  margin-top: -10px;
  letter-spacing: 0.8px;
  line-height: 1.2;
}

.p-hero-block {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 952px;
  flex: 1;
}

.p-callout-text {
  width: 310px;
  margin-top: 81px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.p-label {
  font-size: 24px;
  font-weight: 700;
  text-transform: uppercase;
  text-align: center;
  line-height: 1.2;
}

.p-body {
  font-size: 20px;
  text-align: center;
  line-height: 1.25;
  max-width: 210px;
}

.p-body-sm {
  font-size: 19px;
  text-align: center;
  line-height: 1.2;
  max-width: 165px;
}

.p-items-text {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 750px;
}

.p-item-text {
  width: 165px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.p-benefits-text {
  width: 190px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.p-benefit-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.p-benefit-label {
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
  line-height: 1.15;
}

.p-footer-text-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 940px;
  height: 52px;
}

.p-footer-banner {
  font-size: 23px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2.5px;
}

.p-footer-tagline {
  font-size: 19px;
}

/* Plane 3 artwork + on-plane coordinate rulers */
.p-hero-art-band {
  position: relative;
  width: 952px;
  height: 540px;
}

.p-leaf-frame {
  position: absolute;
  left: 262px;
  top: -34px;
  width: 428px;
  height: 640px;
  border: 6px dashed #fbbf24;
  border-radius: 18px;
  background: rgba(251, 191, 36, 0.06);
  box-shadow: 0 0 28px rgba(251, 191, 36, 0.25);
}

.p-dim-left {
  position: absolute;
  left: 0;
  top: 264px;
  width: 262px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.p-dim-line-h {
  position: absolute;
  left: 4px;
  right: 4px;
  top: 50%;
  height: 6px;
  background: #fbbf24;
  border-radius: 3px;
}

.p-dim-line-h::before,
.p-dim-line-h::after {
  content: "";
  position: absolute;
  top: -10px;
  width: 6px;
  height: 26px;
  background: #fbbf24;
  border-radius: 2px;
}
.p-dim-line-h::before { left: 0; }
.p-dim-line-h::after  { right: 0; }

.p-dim-badge {
  position: relative;
  z-index: 2;
  background: #1a1306;
  color: #fde68a;
  border: 4px solid #fbbf24;
  border-radius: 12px;
  padding: 4px 16px;
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 34px;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.7);
}

.p-dim-top {
  position: absolute;
  left: 416px;
  top: -86px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.p-dim-badge-top {
  font-size: 34px;
}

.p-dim-line-v {
  width: 6px;
  height: 46px;
  background: #fbbf24;
  order: 2;
}

.p-dim-size {
  position: absolute;
  left: 696px;
  top: 472px;
  background: #1a1306;
  color: #fde68a;
  border: 4px solid #fbbf24;
  border-radius: 12px;
  padding: 5px 15px;
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 32px;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.7);
}

.p-items-art-row {
  position: absolute;
  left: 24px;
  bottom: 136px;
  width: 750px;
  height: 170px;
  display: flex;
  justify-content: space-between;
}

.p-art-slot {
  position: relative;
  width: 165px;
  height: 170px;
  display: flex;
  justify-content: center;
}

/* ================= RIGHT ASSEMBLED POSTER PANEL (x: 1126..1476, y: 94..640) ================= */
.assembled-col {
  position: absolute;
  left: 1126px;
  top: 94px;
  width: 350px;
  height: 546px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  z-index: 20;
}

.assembled-card {
  background: rgba(18, 28, 23, 0.94);
  border: 1.5px solid rgba(185, 215, 155, 0.34);
  border-radius: 14px;
  padding: 10px 12px 11px;
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.45);
}

.assembled-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.poster-frame {
  width: 312px;
  height: 312px;
  margin: 0 auto;
  border-radius: 9px;
  overflow: hidden;
  border: 2px solid #d9d3b8;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.55);
  background: #fbfaf3;
}

.poster-frame img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.scene-summary-card {
  flex: 1;
  background: linear-gradient(145deg, rgba(35, 31, 18, 0.94), rgba(18, 26, 22, 0.94));
  border: 1.5px solid rgba(251, 191, 36, 0.42);
  border-radius: 12px;
  padding: 10px 13px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.scene-summary-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 21px;
  line-height: 1.1;
  letter-spacing: 0.7px;
  color: #fde68a;
  margin: 0 0 4px 0;
}

.scene-summary-body {
  margin: 0;
  font-size: 12.4px;
  line-height: 1.36;
  color: #e4eadf;
}

/* ================= LOWER STAGE: RENDER PIPELINE & VIEWER EXPERIENCE (y: 656..982) ================= */
.lower-stage {
  position: absolute;
  left: 24px;
  right: 24px;
  top: 656px;
  height: 326px;
  display: flex;
  align-items: stretch;
  gap: 22px;
  z-index: 20;
}

.stage-panel {
  background: rgba(16, 25, 21, 0.94);
  border-radius: 13px;
  border: 1px solid rgba(200, 225, 206, 0.16);
  padding: 10px 13px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.36);
  display: flex;
  flex-direction: column;
}

.panel-node {
  width: 332px;
  border-top: 4px solid #fbbf24;
}

.panel-backends {
  width: 492px;
  border-top: 4px solid #38bdf8;
}

.panel-outputs {
  flex: 1;
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  display: flex;
  flex-direction: row;
  gap: 14px;
}

.panel-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 3px;
}

.panel-sub {
  font-size: 11.8px;
  line-height: 1.2;
  color: #9ec0a7;
  margin-bottom: 7px;
  font-weight: 500;
}

.node-step-box {
  background: rgba(10, 16, 13, 0.85);
  border: 1px solid rgba(251, 191, 36, 0.25);
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 8px;
}

.node-step-box:last-child {
  margin-bottom: 0;
  border-color: rgba(56, 189, 248, 0.28);
}

.node-step-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 18.5px;
  line-height: 1.1;
  letter-spacing: 0.4px;
  color: #fde68a;
  margin-bottom: 3px;
}

.node-step-box:last-child .node-step-title {
  color: #7dd3fc;
}

.node-step-body {
  font-size: 12px;
  line-height: 1.34;
  color: #dce9df;
}

/* Backend tracks — compactly fitted inside 326px with breathing room */
.track-card {
  background: rgba(10, 16, 13, 0.84);
  border: 1px solid rgba(56, 189, 248, 0.22);
  border-radius: 8px;
  padding: 6px 9px;
  margin-bottom: 7px;
}

.track-top {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 4px;
}

.track-tag {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 14.5px;
  letter-spacing: 0.5px;
  padding: 2px 7px;
  border-radius: 4px;
  white-space: nowrap;
}

.tag-satori { background: rgba(56, 189, 248, 0.22); color: #7dd3fc; border: 1px solid rgba(56, 189, 248, 0.45); }
.tag-pw     { background: rgba(167, 139, 250, 0.22); color: #ddd6fe; border: 1px solid rgba(167, 139, 250, 0.45); }

.pipe-chain {
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 1;
}

.pipe-node {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 6px;
  padding: 3px 5px;
  text-align: center;
}

.pipe-node-accent {
  background: rgba(56, 189, 248, 0.14);
  border-color: rgba(56, 189, 248, 0.48);
}

.pipe-node-pw {
  background: rgba(167, 139, 250, 0.15);
  border-color: rgba(167, 139, 250, 0.48);
}

.pipe-node-out {
  background: rgba(251, 191, 36, 0.14);
  border-color: rgba(251, 191, 36, 0.45);
}

.pipe-node-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 1.05;
  color: #fbfaf3;
}

.pipe-node-detail {
  font-size: 10.2px;
  color: #b7d0be;
  line-height: 1.15;
}

.step-arrow {
  color: #7dd3fc;
  font-weight: 700;
  font-size: 14px;
  flex: none;
}

.track-caption {
  margin: 0;
  font-size: 11.4px;
  line-height: 1.28;
  color: #d3e5d7;
}

.shared-html-banner {
  margin-top: auto;
  background: linear-gradient(90deg, rgba(74, 222, 128, 0.16), rgba(56, 189, 248, 0.16));
  border: 1.5px solid rgba(74, 222, 128, 0.5);
  border-radius: 7px;
  padding: 6px 9px;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.28;
  color: #d8fbe3;
}

/* Output comparison cards */
.output-card {
  flex: 1 1 0;
  min-width: 0;
  background: rgba(16, 25, 21, 0.95);
  border-radius: 13px;
  padding: 11px 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.38);
}

.out-html {
  border: 1.5px solid rgba(56, 189, 248, 0.45);
  border-top: 4px solid #38bdf8;
}

.out-png {
  border: 1.5px solid rgba(251, 191, 36, 0.45);
  border-top: 4px solid #fbbf24;
}

.out-demo-box {
  position: relative;
  height: 78px;
  border-radius: 8px;
  background: linear-gradient(135deg, #fffef8 0%, #f4efe0 100%);
  border: 1.5px solid #c9d9b4;
  margin: 7px 0 9px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 11px;
}

.html-demo-sample {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.html-live-text {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 35px;
  line-height: 1;
  color: #2f5d27;
  letter-spacing: 0.8px;
  display: flex;
  align-items: center;
}

.text-selection {
  background: #38bdf8;
  color: #082f49;
  padding: 0 4px 1px;
  border-radius: 2px;
}

.ibeam-cursor {
  display: inline-block;
  width: 2.5px;
  height: 35px;
  background: #0f172a;
  margin-left: 1px;
  position: relative;
}

.ibeam-cursor::before,
.ibeam-cursor::after {
  content: "";
  position: absolute;
  left: -3px;
  width: 8.5px;
  height: 2px;
  background: #0f172a;
}
.ibeam-cursor::before { top: 0; }
.ibeam-cursor::after  { bottom: 0; }

.dom-pill {
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 10px;
  font-weight: 600;
  color: #0c4a6e;
  background: rgba(56, 189, 248, 0.22);
  border: 1px solid rgba(14, 165, 233, 0.45);
  border-radius: 4px;
  padding: 2px 5px;
  width: fit-content;
}

.png-demo-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.png-flat-text {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 33px;
  line-height: 1;
  color: #2f5d27;
  letter-spacing: 0.8px;
}

.pixel-pill {
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 10px;
  font-weight: 700;
  color: #78350f;
  background: rgba(251, 191, 36, 0.3);
  border: 1px solid rgba(217, 119, 6, 0.5);
  border-radius: 4px;
  padding: 2px 5px;
  width: fit-content;
}

.out-bullets {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.out-bullets li {
  position: relative;
  padding-left: 14px;
  font-size: 12.2px;
  line-height: 1.34;
  color: #e0eee2;
}

.out-html .out-bullets li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 6px;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #38bdf8;
}

.out-png .out-bullets li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 6px;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #fbbf24;
}

/* ================= FULL-CANVAS SVG CONNECTOR OVERLAY ================= */
.wires-overlay {
  position: absolute;
  inset: 0;
  width: ${width}px;
  height: ${height}px;
  pointer-events: none;
  z-index: 40;
}
</style>
</head>
<body>
<div class="poster" id="canvas">
  <div class="top-accent"></div>

  <!-- HEADER -->
  <header class="header">
    <div class="header-left">
      <h1 class="main-title">${esc(content.header.title)}</h1>
      <p class="main-subtitle">${esc(content.header.subtitle)}</p>
    </div>
    <div class="legend-row">${legendHtml}</div>
  </header>

  <!-- LEFT COLUMN: 3 EDITABLE INPUTS -->
  <section class="inputs-col" aria-label="Editable inputs">
    <!-- 1. EDIT WORDS -->
    <article class="input-card card-words" id="card-words">
      <div class="card-head">
        <span class="macro-badge badge-emerald">${esc(content.inputs.words.badge)}</span>
        <span class="file-chip">${esc(content.inputs.words.file)}</span>
      </div>
      <div class="code-snippet">
        <span class="code-k">"sections"</span>: { <span class="code-k">"header"</span>: {<br>
        &nbsp;&nbsp;<span class="code-k">"headline"</span>: <span class="hl-emerald">"${esc(fixture.sections.header.headline)}"</span>,<br>
        &nbsp;&nbsp;<span class="code-k">"subtitle"</span>: <span class="code-s">"${esc(fixture.sections.header.subtitle)}"</span><br>
        }}
      </div>
      <p class="card-caption">${esc(content.inputs.words.caption)}</p>
    </article>

    <!-- 2. SWAP LEAF -->
    <article class="input-card card-art" id="card-artwork">
      <div class="card-head">
        <span class="macro-badge badge-teal">${esc(content.inputs.artwork.badge)}</span>
        <span class="file-chip">${esc(content.inputs.artwork.file)}</span>
      </div>
      <div class="art-split">
        <div class="checker-thumb">
          <img src="${assets.leaf_glow}" alt="leaf_glow transparent artwork">
        </div>
        <div class="art-meta">
          <div class="code-snippet">
            <span class="code-k">"hero"</span>: {<br>
            &nbsp;&nbsp;<span class="code-k">"illustrationId"</span>: <span class="hl-teal">"${esc(fixture.sections.hero.illustrationId)}"</span><br>
            }<br>
            <span class="code-c">// resolves → ${esc(content.inputs.artwork.assetFile)}</span>
          </div>
        </div>
      </div>
      <p class="card-caption">${esc(content.inputs.artwork.caption)}</p>
    </article>

    <!-- 3. MOVE LEAF -->
    <article class="input-card card-move" id="card-recipe">
      <div class="card-head">
        <span class="macro-badge badge-amber">${esc(content.inputs.recipe.badge)}</span>
        <span class="file-chip">${esc(content.inputs.recipe.file)}</span>
      </div>
      <div class="code-snippet">
        <span class="code-c">// buildScene() runs in Node.js</span><br>
        img(<span class="code-s">'hero_img'</span>, heroImage, { position: <span class="code-s">'absolute'</span>,<br>
        &nbsp;&nbsp;<span class="hl-amber">left: 262, top: -34, width: 428, height: 640</span> })
      </div>
      <p class="card-caption">${esc(content.inputs.recipe.caption)}</p>
    </article>
  </section>

  <!-- CENTER STAGE: EXPLODED 3D PERSPECTIVE LAYER STACK -->
  <section class="assembly-stage" id="assembly-stage" aria-label="Exploded 3D poster assembly planes">
    <div class="stage-kicker">${esc(content.stage.kicker)}</div>

    <!-- PLANE 1 (Back): Canvas, Theme & CSS Flexbox Grid -->
    <div class="plane-wrapper plane-1" style="left: 18px; top: 62px; z-index: 10;">
      <div class="plane-tab tab-p1">${esc(content.stage.plane1Label)}</div>
      <div class="plane-card">
        <div class="plane-scale">${plane1Inner}</div>
      </div>
    </div>

    <!-- PLANE 2 (Middle): Typography & Icons from fixture.json -->
    <div class="plane-wrapper plane-2" style="left: 162px; top: 108px; z-index: 20;">
      <div class="plane-tab tab-p2">${esc(content.stage.plane2Label)}</div>
      <div class="plane-card">
        <div class="plane-scale">${plane2Inner}</div>
      </div>
    </div>

    <!-- PLANE 3 (Front): Transparent Cutouts + Recipe Coordinate Rulers -->
    <div class="plane-wrapper plane-3" style="left: 318px; top: 186px; z-index: 30;">
      <div class="plane-tab tab-p3">${esc(content.stage.plane3Label)}</div>
      <div class="plane-card">
        <div class="plane-scale">${plane3Inner}</div>
      </div>
    </div>

    <div class="stage-floor-note">
      <span>${esc(content.stage.depthNote)}</span>
    </div>
  </section>

  <!-- RIGHT COLUMN: ASSEMBLED POSTER + SCENE TREE BRIDGE -->
  <section class="assembled-col" id="assembled-col" aria-label="Assembled nutrition poster">
    <div class="assembled-card">
      <div class="assembled-head">
        <span class="macro-badge badge-cream">${esc(content.stage.assembledBadge)}</span>
        <span class="file-chip">${esc(content.stage.assembledDims)}</span>
      </div>
      <div class="poster-frame">
        <img src="${assets.render}" alt="Finished Fuel Well. Live Well. poster">
      </div>
    </div>

    <div class="scene-summary-card">
      <h2 class="scene-summary-title">${esc(content.stage.sceneSummaryTitle)}</h2>
      <p class="scene-summary-body">${esc(content.stage.sceneSummaryBody)}</p>
    </div>
  </section>

  <!-- LOWER STAGE: NODE.JS RENDER TIME -> DUAL BACKENDS -> VIEWER EXPERIENCE -->
  <section class="lower-stage" id="lower-stage" aria-label="Render pipeline and viewer outputs">
    <!-- STAGE 4: NODE.JS RECIPE & CSS -->
    <div class="stage-panel panel-node" id="panel-node">
      <div class="panel-head-row">
        <span class="macro-badge badge-amber">${esc(content.pipeline.nodeStage.badge)}</span>
      </div>
      <div class="panel-sub">${esc(content.pipeline.nodeStage.sub)}</div>
      <div class="node-step-box">
        <div class="node-step-title">${esc(content.pipeline.nodeStage.step1Title)}</div>
        <div class="node-step-body">${esc(content.pipeline.nodeStage.step1Body)}</div>
      </div>
      <div class="node-step-box">
        <div class="node-step-title">${esc(content.pipeline.nodeStage.step2Title)}</div>
        <div class="node-step-body">${esc(content.pipeline.nodeStage.step2Body)}</div>
      </div>
    </div>

    <!-- STAGE 5: DUAL BACKENDS -->
    <div class="stage-panel panel-backends" id="panel-backends">
      <div class="panel-head-row">
        <span class="macro-badge badge-sky">${esc(content.pipeline.backendsStage.badge)}</span>
      </div>
      <div class="panel-sub">${esc(content.pipeline.backendsStage.sub)}</div>

      <div class="track-card">
        <div class="track-top">
          <span class="track-tag tag-satori">${esc(content.pipeline.backendsStage.satoriBadge)}</span>
          <div class="pipe-chain">${satoriStepsHtml}</div>
        </div>
        <p class="track-caption">${esc(content.pipeline.backendsStage.satoriCaption)}</p>
      </div>

      <div class="track-card">
        <div class="track-top">
          <span class="track-tag tag-pw">${esc(content.pipeline.backendsStage.playwrightBadge)}</span>
          <div class="pipe-chain">${playwrightStepsHtml}</div>
        </div>
        <p class="track-caption">${esc(content.pipeline.backendsStage.playwrightCaption)}</p>
      </div>

      <div class="shared-html-banner">${esc(content.pipeline.backendsStage.sharedHtmlBanner)}</div>
    </div>

    <!-- STAGE 6: OFFLINE HTML VS EXPORTED PNG -->
    <div class="panel-outputs" id="panel-outputs">
      <!-- OFFLINE HTML CARD -->
      <article class="output-card out-html">
        <div class="panel-head-row">
          <span class="macro-badge badge-sky">${esc(content.pipeline.outputsStage.htmlCard.badge)}</span>
          <span class="file-chip">${esc(content.pipeline.outputsStage.htmlCard.file)}</span>
        </div>
        <div class="out-demo-box">
          <div class="html-demo-sample">
            <div class="html-live-text">
              <span>${esc(content.pipeline.outputsStage.htmlCard.demoPrefix)}</span><span class="text-selection">${esc(content.pipeline.outputsStage.htmlCard.demoSelection)}</span><span class="ibeam-cursor"></span>
            </div>
            <div class="dom-pill">${esc(content.pipeline.outputsStage.htmlCard.demoTag)}</div>
          </div>
        </div>
        <ul class="out-bullets">
          ${content.pipeline.outputsStage.htmlCard.bullets.map(b => `<li>${esc(b)}</li>`).join('')}
        </ul>
      </article>

      <!-- EXPORTED PNG CARD -->
      <article class="output-card out-png">
        <div class="panel-head-row">
          <span class="macro-badge badge-amber">${esc(content.pipeline.outputsStage.pngCard.badge)}</span>
          <span class="file-chip">${esc(content.pipeline.outputsStage.pngCard.file)}</span>
        </div>
        <div class="out-demo-box">
          <div class="png-demo-left">
            <div class="png-flat-text">FUEL WELL.</div>
            <div class="pixel-pill">${esc(content.pipeline.outputsStage.pngCard.demoDims)} · ${esc(content.pipeline.outputsStage.pngCard.demoLoupeLabel)}</div>
          </div>
          ${buildPixelLoupeSvg()}
        </div>
        <ul class="out-bullets">
          ${content.pipeline.outputsStage.pngCard.bullets.map(b => `<li>${esc(b)}</li>`).join('')}
        </ul>
      </article>
    </div>
  </section>

  <!-- PRECISION SVG LEADER WIRES, Z-DEPTH RAILS & PIPELINE ARROWS -->
  <svg class="wires-overlay" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <marker id="arr-emerald" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
        <path d="M 0 1.2 L 8.5 5 L 0 8.8 z" fill="#4ade80"/>
      </marker>
      <marker id="arr-teal" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
        <path d="M 0 1.2 L 8.5 5 L 0 8.8 z" fill="#2dd4bf"/>
      </marker>
      <marker id="arr-amber" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
        <path d="M 0 1.2 L 8.5 5 L 0 8.8 z" fill="#fbbf24"/>
      </marker>
      <marker id="arr-sky" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M 0 1.2 L 8.5 5 L 0 8.8 z" fill="#38bdf8"/>
      </marker>
      <marker id="arr-cream" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M 0 1.2 L 8.5 5 L 0 8.8 z" fill="#fbfaf3"/>
      </marker>
    </defs>

    <!-- Subtle Z-axis depth registration rails linking Plane 1 -> Plane 2 -> Plane 3 -->
    <g stroke="rgba(220, 240, 224, 0.30)" stroke-width="1.5" stroke-dasharray="5 5" fill="none">
      <line x1="460" y1="158" x2="760" y2="282"/>
      <line x1="460" y1="458" x2="760" y2="582"/>
      <line x1="726" y1="164" x2="1026" y2="288"/>
    </g>

    <!-- WIRE 1 (Emerald): Card 1 (x=416, y=181) -> Headline on Plane 2 (x=662, y=224) -->
    <path d="M 416 181 C 500 181, 535 224, 650 224" fill="none" stroke="#111915" stroke-width="7.5" stroke-linecap="round"/>
    <path d="M 416 181 C 500 181, 535 224, 650 224" fill="none" stroke="#4ade80" stroke-width="3.2" stroke-linecap="round" marker-end="url(#arr-emerald)"/>
    <circle cx="416" cy="181" r="5.5" fill="#4ade80" stroke="#111915" stroke-width="2.2"/>
    <circle cx="662" cy="224" r="5" fill="#4ade80" stroke="#0c1510" stroke-width="2"/>

    <!-- WIRE 2 (Teal): Card 2 (x=416, y=363) -> Floating glowing leaf on Plane 3 (x=882, y=424) -->
    <path d="M 416 363 C 454 363, 444 554, 616 554 C 756 554, 804 490, 872 432" fill="none" stroke="#111915" stroke-width="7.5" stroke-linecap="round"/>
    <path d="M 416 363 C 454 363, 444 554, 616 554 C 756 554, 804 490, 872 432" fill="none" stroke="#2dd4bf" stroke-width="3.2" stroke-linecap="round" marker-end="url(#arr-teal)"/>
    <circle cx="416" cy="363" r="5.5" fill="#2dd4bf" stroke="#111915" stroke-width="2.2"/>
    <circle cx="882" cy="424" r="6" fill="none" stroke="#2dd4bf" stroke-width="2.5"/>

    <!-- WIRE 3 (Amber): Card 3 (x=416, y=549) -> left: 262 coordinate badge on Plane 3 (x=786, y=420) -->
    <path d="M 416 549 C 525 549, 648 602, 740 558 C 772 542, 776 476, 786 428" fill="none" stroke="#111915" stroke-width="7.5" stroke-linecap="round"/>
    <path d="M 416 549 C 525 549, 648 602, 740 558 C 772 542, 776 476, 786 428" fill="none" stroke="#fbbf24" stroke-width="3.2" stroke-linecap="round" marker-end="url(#arr-amber)"/>
    <circle cx="416" cy="549" r="5.5" fill="#fbbf24" stroke="#111915" stroke-width="2.2"/>

    <!-- ASSEMBLY MERGE ARROW: Centered symmetrically at x=1086 between Plane 3 (r=1046) and Assembled Poster (l=1126) -->
    <g transform="translate(1086, 316)">
      <rect x="-26" y="-20" width="52" height="40" rx="20" fill="#17271e" stroke="#4ade80" stroke-width="2"/>
      <path d="M -12 0 L 12 0" stroke="#fbfaf3" stroke-width="3.5" stroke-linecap="round" marker-end="url(#arr-cream)"/>
    </g>

    <!-- PIPELINE FLOW ARROWS IN LOWER STAGE -->
    <!-- Col 1 (Node.js r=356) -> Col 2 (Dual Backends l=378) -->
    <path d="M 357 780 L 372 780" fill="none" stroke="#fbbf24" stroke-width="3.2" stroke-linecap="round" marker-end="url(#arr-amber)"/>
    <path d="M 357 866 L 372 866" fill="none" stroke="#38bdf8" stroke-width="3.2" stroke-linecap="round" marker-end="url(#arr-sky)"/>

    <!-- Col 2 (Backends r=870) -> Col 3 (Outputs l=892) -->
    <path d="M 871 796 L 886 796" fill="none" stroke="#38bdf8" stroke-width="3.2" stroke-linecap="round" marker-end="url(#arr-sky)"/>
    <path d="M 871 924 L 886 924" fill="none" stroke="#4ade80" stroke-width="3.2" stroke-linecap="round" marker-end="url(#arr-emerald)"/>
  </svg>
</div>
</body>
</html>`;
}

async function main() {
  const content = JSON.parse(await fs.readFile(path.join(__dirname, 'content.json'), 'utf8'));
  const fixture = JSON.parse(await fs.readFile(path.join(PACKET_ROOT, 'nutrition/fixture.json'), 'utf8'));
  const renderInlineHtml = await fs.readFile(path.join(PACKET_ROOT, 'nutrition/render-inline.html'), 'utf8');
  const svgs = extractInlineSvgs(renderInlineHtml);

  const [regularFont, boldFont, renderPng, leafGlow, balanceScale, skipSpike, parfaitJar, snackContainer, chickenWrap, waterBottle] =
    await Promise.all([
      toDataUri('fonts/BarlowCondensed-Regular.ttf', 'font/ttf'),
      toDataUri('fonts/BarlowCondensed-Bold.ttf', 'font/ttf'),
      toDataUri('nutrition/render.png', 'image/png'),
      toDataUri('nutrition/assets/web/leaf_glow.png', 'image/png'),
      toDataUri('nutrition/assets/web/balance_scale.png', 'image/png'),
      toDataUri('nutrition/assets/web/skip_spike.png', 'image/png'),
      toDataUri('nutrition/assets/web/parfait_jar.png', 'image/png'),
      toDataUri('nutrition/assets/web/snack_container.png', 'image/png'),
      toDataUri('nutrition/assets/web/chicken_wrap.png', 'image/png'),
      toDataUri('nutrition/assets/web/water_bottle.png', 'image/png'),
    ]);

  const fonts = { regular: regularFont, bold: boldFont };
  const assets = {
    render: renderPng,
    leaf_glow: leafGlow,
    balance_scale: balanceScale,
    skip_spike: skipSpike,
    parfait_jar: parfaitJar,
    snack_container: snackContainer,
    chicken_wrap: chickenWrap,
    water_bottle: waterBottle,
  };

  const html = buildHtml(content, fixture, fonts, assets, svgs);
  const htmlPath = path.join(__dirname, 'index.html');
  const pngPath = path.join(__dirname, 'poster.png');

  await fs.writeFile(htmlPath, html, 'utf8');

  const { width, height } = content.meta;
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      javaScriptEnabled: false,
    });
    await context.route('**/*', route => route.abort());
    const page = await context.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      const imgs = Array.from(document.querySelectorAll('img'));
      await Promise.all(imgs.map(img => (img.complete ? img.decode().catch(() => {}) : Promise.resolve())));
    });
    const pngBuffer = await page.screenshot({
      clip: { x: 0, y: 0, width, height },
      fullPage: false,
    });
    await fs.writeFile(pngPath, pngBuffer);
    await context.close();

    console.log(
      JSON.stringify(
        {
          html: { path: path.relative(PACKET_ROOT, htmlPath), bytes: Buffer.byteLength(html, 'utf8') },
          png: { path: path.relative(PACKET_ROOT, pngPath), width, height, bytes: pngBuffer.length },
        },
        null,
        2
      )
    );
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
