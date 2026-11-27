import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packetRoot = path.resolve(__dirname, '..');

const contentPath = path.join(__dirname, 'content.json');
const htmlOutPath = path.join(__dirname, 'index.html');
const pngOutPath = path.join(__dirname, 'poster.png');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function toDataUri(filePath, mime) {
  const buf = await fs.readFile(filePath);
  return `data:${mime};base64,${buf.toString('base64')}`;
}

function renderJsonLines(lines, tone) {
  return lines
    .map((line) => {
      const cls = line.highlight ? `code-line hl-${tone}` : 'code-line';
      const tag = line.tag ? `<span class="code-tag tag-${tone}">${escapeHtml(line.tag)}</span>` : '';
      return `<div class="${cls}"><span class="code-text">${escapeHtml(line.text)}</span>${tag}</div>`;
    })
    .join('\n');
}

function renderStepCard(step) {
  const bodyHtml = step.command
    ? `
      <div class="cmd-box">${escapeHtml(step.command)}</div>
      <div class="step-note">${escapeHtml(step.note)}</div>
    `
    : `
      <ul class="step-bullets">
        ${step.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('\n')}
      </ul>
    `;

  return `
    <div class="step-card ${step.command ? 'step-card-cli' : ''}">
      <div class="step-head">
        <span class="step-code">${escapeHtml(step.code)}</span>
        <span class="step-title">${escapeHtml(step.title)}</span>
      </div>
      <div class="step-module">${escapeHtml(step.module)}</div>
      ${bodyHtml}
    </div>
  `;
}

function buildHtml(content, assets) {
  const { width, height, title } = content.meta;
  const { header, headlineCard, heroCard, posterFrame, pipeline } = content;

  const legendHtml = header.legend
    .map(
      (item) => `
      <div class="legend-pill tone-${escapeHtml(item.tone)}">
        <span class="legend-num">${escapeHtml(item.num)}</span>
        <span class="legend-label">${escapeHtml(item.label)}</span>
      </div>`
    )
    .join('\n');

  const swapStepsHtml = heroCard.swapSteps
    .map(
      (s) => `
      <div class="swap-row">
        <span class="swap-dot"></span>
        <span><strong>${escapeHtml(s.lead)}</strong> ${escapeHtml(s.body)}</span>
      </div>`
    )
    .join('\n');

  const stepsWithArrows = pipeline.steps
    .map((step, idx) => {
      const arrow =
        idx < pipeline.steps.length - 1
          ? `<div class="step-arrow" aria-hidden="true">
               <svg width="26" height="28" viewBox="0 0 26 28" fill="none">
                 <path d="M2 14H20M14 6L22 14L14 22" stroke="#1d4f73" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
               </svg>
             </div>`
          : '';
      return renderStepCard(step) + arrow;
    })
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=${width}, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
@font-face {
  font-family: 'Barlow Condensed';
  font-weight: 400;
  font-style: normal;
  src: url(${assets.fontRegular}) format('truetype');
}
@font-face {
  font-family: 'Barlow Condensed';
  font-weight: 700;
  font-style: normal;
  src: url(${assets.fontBold}) format('truetype');
}

:root {
  --bg: #f6f3e8;
  --ink: #182419;
  --muted: #465446;
  --border: #d7d1bf;
  --card: #ffffff;
  --headline: #c84b22;
  --headline-soft: #fdf1ec;
  --headline-border: #e79678;
  --hero: #267a34;
  --hero-soft: #edf7ee;
  --hero-border: #76ba80;
  --export: #1d4f73;
  --export-soft: #edf4f9;
  --export-border: #8eb4cf;
  --code-bg: #17222b;
  --code-fg: #eaf1f7;
  --font-display: 'Barlow Condensed', 'Arial Narrow', sans-serif;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-mono: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  width: ${width}px;
  height: ${height}px;
  overflow: hidden;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

.poster {
  position: relative;
  width: ${width}px;
  height: ${height}px;
  background-color: var(--bg);
  background-image:
    radial-gradient(circle at 76% 42%, rgba(255, 254, 248, 0.85) 0%, rgba(246, 243, 232, 0.2) 55%, rgba(232, 226, 206, 0.45) 100%),
    radial-gradient(rgba(24, 36, 25, 0.08) 1px, transparent 1px);
  background-size: 100% 100%, 24px 24px;
}

/* HEADER */
.top-header {
  position: absolute;
  left: 36px;
  top: 20px;
  width: 1528px;
  height: 98px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 2px solid #d4cebb;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.eyebrow {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 2.2px;
  text-transform: uppercase;
  color: var(--hero);
}

.main-title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 54px;
  line-height: 0.94;
  letter-spacing: 0.8px;
  color: var(--ink);
  text-transform: uppercase;
}

.main-subtitle {
  margin: 4px 0 0;
  font-size: 16.5px;
  color: var(--muted);
  font-weight: 500;
}

.legend {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-bottom: 4px;
}

.legend-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px 6px 8px;
  border-radius: 999px;
  border: 2px solid;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 19px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.legend-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.tone-headline { background: var(--headline-soft); border-color: var(--headline-border); color: var(--headline); }
.tone-headline .legend-num { background: var(--headline); }
.tone-hero { background: var(--hero-soft); border-color: var(--hero-border); color: var(--hero); }
.tone-hero .legend-num { background: var(--hero); }
.tone-export { background: var(--export-soft); border-color: var(--export-border); color: var(--export); }
.tone-export .legend-num { background: var(--export); }

/* CARDS */
.card {
  position: absolute;
  background: var(--card);
  border-radius: 14px;
  border: 1.5px solid var(--border);
  box-shadow: 0 8px 24px rgba(24, 36, 25, 0.065);
}

.card-headline {
  left: 36px;
  top: 132px;
  width: 816px;
  height: 256px;
  border-left: 8px solid var(--headline);
  padding: 15px 18px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.card-hero {
  left: 36px;
  top: 404px;
  width: 816px;
  height: 318px;
  border-left: 8px solid var(--hero);
  padding: 15px 18px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
}

.card-title-group {
  display: flex;
  align-items: center;
  gap: 11px;
}

.badge {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #fff;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 23px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.badge-headline { background: var(--headline); }
.badge-hero { background: var(--hero); }
.badge-export { background: var(--export); }

.card-title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 30px;
  letter-spacing: 0.6px;
  line-height: 1;
  text-transform: uppercase;
}

.file-chip {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  padding: 5px 11px;
  border-radius: 8px;
  border: 1.5px solid;
  white-space: nowrap;
}

.chip-headline { color: var(--headline); background: var(--headline-soft); border-color: var(--headline-border); }
.chip-hero { color: var(--hero); background: var(--hero-soft); border-color: var(--hero-border); }
.chip-export { color: var(--export); background: var(--export-soft); border-color: var(--export-border); }

/* HEADLINE CARD BODY */
.headline-body {
  display: flex;
  gap: 15px;
  flex: 1;
  min-height: 0;
}

.code-block {
  background: var(--code-bg);
  color: var(--code-fg);
  border-radius: 10px;
  padding: 10px 12px;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.62;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.headline-code {
  width: 486px;
  flex-shrink: 0;
}

.code-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1px 6px;
  border-radius: 5px;
  white-space: pre;
}

.hl-headline {
  background: rgba(200, 75, 34, 0.34);
  border-left: 3.5px solid #f27549;
  color: #ffffff;
  font-weight: 700;
  padding-top: 3px;
  padding-bottom: 3px;
  margin: 2px 0;
}

.hl-hero {
  background: rgba(38, 122, 52, 0.34);
  border-left: 3.5px solid #59c96b;
  color: #ffffff;
  font-weight: 700;
  padding-top: 3px;
  padding-bottom: 3px;
  margin: 2px 0;
}

.code-tag {
  font-family: var(--font-display);
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.9px;
  padding: 1px 7px;
  border-radius: 4px;
  margin-left: 8px;
  flex-shrink: 0;
}

.tag-headline { background: #e86235; color: #fff; }
.tag-hero { background: #369e47; color: #fff; }

.result-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #faf8f1;
  border: 1.5px solid #e3decc;
  border-radius: 10px;
  padding: 10px 12px;
}

.result-label {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 1px;
  color: var(--headline);
  text-transform: uppercase;
}

.preview-strip {
  background: #fbfaf3;
  border: 1.5px dashed var(--headline-border);
  border-radius: 8px;
  padding: 7px 9px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.preview-old {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15.5px;
  color: #6b7667;
  text-decoration: line-through;
  letter-spacing: 0.7px;
}

.preview-new {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 25px;
  line-height: 1.05;
  color: #2f5d27;
  letter-spacing: 0.9px;
}

.card-caption {
  font-size: 12.8px;
  line-height: 1.36;
  color: var(--muted);
}

/* HERO CARD BODY */
.hero-body {
  display: flex;
  align-items: stretch;
  gap: 15px;
  flex: 1;
  min-height: 0;
}

.hero-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
}

.hero-code {
  padding: 8px 11px;
  font-size: 13px;
  line-height: 1.52;
}

.swap-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13.5px;
  line-height: 1.32;
  color: var(--ink);
}

.swap-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.swap-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--hero);
  margin-top: 5px;
  flex-shrink: 0;
}

.spec-callout {
  background: var(--hero-soft);
  border: 1.5px solid var(--hero-border);
  border-radius: 8px;
  padding: 7px 10px;
  font-size: 12.6px;
  line-height: 1.34;
  color: #1c4a24;
  font-weight: 500;
}

.asset-preview-card {
  width: 204px;
  flex-shrink: 0;
  border-radius: 10px;
  border: 1.5px solid var(--hero-border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.asset-stage {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 12px 8px;
  background-color: #f4f5f0;
  background-image:
    linear-gradient(45deg, #e5e8df 25%, transparent 25%),
    linear-gradient(-45deg, #e5e8df 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e5e8df 75%),
    linear-gradient(-45deg, transparent 75%, #e5e8df 75%);
  background-size: 16px 16px;
  background-position: 0 0, 0 8px, 8px -8px, -8px 0;
}

.asset-tag {
  position: absolute;
  top: 7px;
  left: 8px;
  background: rgba(24, 36, 25, 0.84);
  color: #fff;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 1px;
  padding: 2px 7px;
  border-radius: 4px;
}

.asset-stage img {
  max-width: 146px;
  max-height: 170px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(31, 42, 28, 0.22));
}

.asset-footer {
  background: #1d4d25;
  color: #f0f9f1;
  font-family: var(--font-mono);
  font-size: 11.8px;
  font-weight: 600;
  text-align: center;
  padding: 6px 6px;
}

/* FINISHED POSTER FRAME */
.poster-frame {
  left: 952px;
  top: 132px;
  width: 612px;
  height: 590px;
  border: 2px solid #c9c2ad;
  background: #ffffff;
  box-shadow: 0 14px 36px rgba(24, 36, 25, 0.11);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
}

.poster-chrome {
  width: 100%;
  height: 40px;
  flex-shrink: 0;
  padding: 0 18px;
  border-bottom: 1.5px solid #e7e2d3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #faf8f1;
  border-radius: 12px 12px 0 0;
}

.poster-chrome-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  letter-spacing: 0.9px;
  color: var(--ink);
  text-transform: uppercase;
}

.poster-canvas-wrap {
  position: relative;
  width: 530px;
  height: 530px;
  margin-top: 9px;
  border-radius: 6px;
  overflow: visible;
  box-shadow: 0 4px 16px rgba(24, 36, 25, 0.14);
}

.poster-img {
  width: 530px;
  height: 530px;
  display: block;
  border-radius: 6px;
  border: 1px solid #d5cfb8;
}

/* EXACT MEASURED OVERLAYS ON 530x530 POSTER (scale = 0.530 from 1000x1000) */
.target-box {
  position: absolute;
  border-radius: 8px;
  pointer-events: none;
}

.target-headline {
  left: 108px;
  top: 6px;
  width: 314px;
  height: 48px;
  border: 3.5px solid var(--headline);
  background: rgba(200, 75, 34, 0.08);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.78);
}

.target-hero {
  left: 150px;
  top: 70px;
  width: 230px;
  height: 310px;
  border: 3.5px solid var(--hero);
  background: rgba(38, 122, 52, 0.06);
  border-radius: 12px;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.78);
}

.target-pin {
  position: absolute;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 14.5px;
  letter-spacing: 0.5px;
  color: #fff;
  padding: 2px 9px;
  border-radius: 999px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.22);
}

.pin-headline {
  background: var(--headline);
  right: 6px;
  top: -13px;
}

.pin-hero {
  background: var(--hero);
  right: 8px;
  top: 8px;
}

/* PIPELINE BAND */
.pipeline-band {
  position: absolute;
  left: 36px;
  top: 748px;
  width: 1528px;
  height: 224px;
  background: var(--export-soft);
  border: 2px solid var(--export-border);
  border-left: 8px solid var(--export);
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(24, 36, 25, 0.06);
  padding: 12px 18px 14px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pipeline-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pipeline-summary {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 1.3px;
  color: var(--export);
  background: #ffffff;
  border: 1.5px solid var(--export-border);
  padding: 4px 12px;
  border-radius: 999px;
}

.pipeline-row {
  display: flex;
  align-items: stretch;
  gap: 6px;
  flex: 1;
  min-height: 0;
}

.step-card {
  flex: 1;
  background: #ffffff;
  border: 1.5px solid #c2d7e6;
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.step-card-cli {
  flex: 1.28;
}

.step-head {
  display: flex;
  align-items: center;
  gap: 7px;
}

.step-code {
  background: var(--export);
  color: #fff;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.6px;
  padding: 2px 7px;
  border-radius: 5px;
}

.step-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  letter-spacing: 0.5px;
  color: #13364f;
  line-height: 1;
}

.step-module {
  font-family: var(--font-mono);
  font-size: 11.8px;
  font-weight: 600;
  color: var(--export);
}

.cmd-box {
  background: var(--code-bg);
  color: #e6f3ff;
  font-family: var(--font-mono);
  font-size: 12.2px;
  line-height: 1.42;
  padding: 8px 10px;
  border-radius: 7px;
  margin-top: 2px;
  word-break: break-word;
}

.step-note {
  font-size: 11.8px;
  line-height: 1.3;
  color: var(--muted);
  margin-top: auto;
}

.step-bullets {
  margin: 2px 0 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 12.8px;
  line-height: 1.32;
  color: #243440;
}

.step-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* SVG CONNECTOR OVERLAY */
.connectors {
  position: absolute;
  inset: 0;
  width: ${width}px;
  height: ${height}px;
  pointer-events: none;
  z-index: 20;
}
</style>
</head>
<body>
<div class="poster">
  <header class="top-header">
    <div class="header-left">
      <div class="eyebrow">${escapeHtml(header.eyebrow)}</div>
      <h1 class="main-title">${escapeHtml(header.title)}</h1>
      <p class="main-subtitle">${escapeHtml(header.subtitle)}</p>
    </div>
    <div class="legend">
      ${legendHtml}
    </div>
  </header>

  <section class="card card-headline">
    <div class="card-top">
      <div class="card-title-group">
        <span class="badge badge-headline">${escapeHtml(headlineCard.badge)}</span>
        <h2 class="card-title">${escapeHtml(headlineCard.title)}</h2>
      </div>
      <span class="file-chip chip-headline">${escapeHtml(headlineCard.filePath)}</span>
    </div>
    <div class="headline-body">
      <div class="code-block headline-code">
        ${renderJsonLines(headlineCard.jsonLines, 'headline')}
      </div>
      <div class="result-panel">
        <div class="result-label">${escapeHtml(headlineCard.resultHeading)}</div>
        <div class="preview-strip">
          <span class="preview-old">${escapeHtml(headlineCard.beforeText)}</span>
          <span class="preview-new">${escapeHtml(headlineCard.afterText)}</span>
        </div>
        <div class="card-caption">${escapeHtml(headlineCard.caption)}</div>
      </div>
    </div>
  </section>

  <section class="card card-hero">
    <div class="card-top">
      <div class="card-title-group">
        <span class="badge badge-hero">${escapeHtml(heroCard.badge)}</span>
        <h2 class="card-title">${escapeHtml(heroCard.title)}</h2>
      </div>
      <span class="file-chip chip-hero">${escapeHtml(heroCard.filePath)}</span>
    </div>
    <div class="hero-body">
      <div class="hero-left">
        <div class="code-block hero-code">
          ${renderJsonLines(heroCard.jsonLines, 'hero')}
        </div>
        <div class="swap-list">
          ${swapStepsHtml}
        </div>
        <div class="spec-callout">${escapeHtml(heroCard.caption)}</div>
      </div>
      <div class="asset-preview-card">
        <div class="asset-stage">
          <span class="asset-tag">${escapeHtml(heroCard.assetPreviewTag)}</span>
          <img src="${assets.leafGlow}" alt="Hero artwork leaf_glow.png">
        </div>
        <div class="asset-footer">${escapeHtml(heroCard.assetPreviewLabel)}</div>
      </div>
    </div>
  </section>

  <section class="card poster-frame">
    <div class="poster-chrome">
      <span class="poster-chrome-title">${escapeHtml(posterFrame.title)}</span>
      <span class="file-chip chip-export">${escapeHtml(posterFrame.fileBadge)}</span>
    </div>
    <div class="poster-canvas-wrap">
      <img class="poster-img" src="${assets.posterRender}" alt="Finished Fuel Well. Live Well. poster">
      <div class="target-box target-headline">
        <span class="target-pin pin-headline">${escapeHtml(posterFrame.headlinePinLabel)}</span>
      </div>
      <div class="target-box target-hero">
        <span class="target-pin pin-hero">${escapeHtml(posterFrame.heroPinLabel)}</span>
      </div>
    </div>
  </section>

  <section class="pipeline-band">
    <div class="pipeline-top">
      <div class="card-title-group">
        <span class="badge badge-export">${escapeHtml(pipeline.badge)}</span>
        <h2 class="card-title">${escapeHtml(pipeline.title)}</h2>
      </div>
      <div class="pipeline-summary">${escapeHtml(pipeline.routeSummary)}</div>
    </div>
    <div class="pipeline-row">
      ${stepsWithArrows}
    </div>
  </section>

  <svg class="connectors" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <marker id="arrow-headline" viewBox="0 0 12 12" refX="9.5" refY="6" markerWidth="10" markerHeight="10" orient="auto">
        <path d="M1 1.2L10.8 6L1 10.8L3.4 6Z" fill="#c84b22"/>
      </marker>
      <marker id="arrow-hero" viewBox="0 0 12 12" refX="9.5" refY="6" markerWidth="10" markerHeight="10" orient="auto">
        <path d="M1 1.2L10.8 6L1 10.8L3.4 6Z" fill="#267a34"/>
      </marker>
      <marker id="arrow-export" viewBox="0 0 12 12" refX="9.5" refY="6" markerWidth="10" markerHeight="10" orient="auto">
        <path d="M1 1.2L10.8 6L1 10.8L3.4 6Z" fill="#1d4f73"/>
      </marker>
    </defs>

    <!-- Connector 1: Headline card right edge (852, 213) -> Poster headline box left edge (1101, 213) -->
    <line x1="852" y1="213" x2="1090" y2="213" stroke="#ffffff" stroke-width="11" stroke-linecap="round" opacity="0.92"/>
    <line x1="852" y1="213" x2="1093" y2="213" stroke="#c84b22" stroke-width="5.5" stroke-linecap="round" marker-end="url(#arrow-headline)"/>
    <circle cx="852" cy="213" r="8" fill="#c84b22" stroke="#ffffff" stroke-width="3"/>

    <!-- Connector 2: Hero card right edge (852, 500) -> Poster leaf box left edge (1143, 500) through empty corridor -->
    <line x1="852" y1="500" x2="1132" y2="500" stroke="#ffffff" stroke-width="11" stroke-linecap="round" opacity="0.92"/>
    <line x1="852" y1="500" x2="1135" y2="500" stroke="#267a34" stroke-width="5.5" stroke-linecap="round" marker-end="url(#arrow-hero)"/>
    <circle cx="852" cy="500" r="8" fill="#267a34" stroke="#ffffff" stroke-width="3"/>

    <!-- Connector 3 (Input feed): Source cards (230, 722) -> Pipeline Step 3A (230, 754) -->
    <line x1="230" y1="720" x2="230" y2="754" stroke="#ffffff" stroke-width="10" stroke-linecap="round" opacity="0.95"/>
    <line x1="230" y1="720" x2="230" y2="754" stroke="#1d4f73" stroke-width="4.8" stroke-linecap="round" marker-end="url(#arrow-export)"/>
    <rect x="244" y="724" width="66" height="21" rx="10.5" fill="#1d4f73"/>
    <text x="277" y="739" text-anchor="middle" font-family="'Barlow Condensed', sans-serif" font-weight="700" font-size="13.5" letter-spacing="1" fill="#ffffff">${escapeHtml(pipeline.inputConnectorLabel)}</text>

    <!-- Connector 4 (Output delivery): Pipeline Step 3D (1376, 752) -> Finished Poster bottom (1376, 718) -->
    <line x1="1376" y1="752" x2="1376" y2="718" stroke="#ffffff" stroke-width="10" stroke-linecap="round" opacity="0.95"/>
    <line x1="1376" y1="752" x2="1376" y2="718" stroke="#1d4f73" stroke-width="4.8" stroke-linecap="round" marker-end="url(#arrow-export)"/>
    <rect x="1390" y="724" width="90" height="21" rx="10.5" fill="#1d4f73"/>
    <text x="1435" y="739" text-anchor="middle" font-family="'Barlow Condensed', sans-serif" font-weight="700" font-size="13.5" letter-spacing="1" fill="#ffffff">${escapeHtml(posterFrame.outputConnectorLabel)}</text>
  </svg>
</div>
</body>
</html>
`;
}

async function main() {
  const content = JSON.parse(await fs.readFile(contentPath, 'utf8'));
  const { width, height } = content.meta;

  const [fontRegular, fontBold, posterRender, leafGlow] = await Promise.all([
    toDataUri(path.join(packetRoot, 'fonts', 'BarlowCondensed-Regular.ttf'), 'font/ttf'),
    toDataUri(path.join(packetRoot, 'fonts', 'BarlowCondensed-Bold.ttf'), 'font/ttf'),
    toDataUri(path.join(packetRoot, 'nutrition', 'render.png'), 'image/png'),
    toDataUri(path.join(packetRoot, 'nutrition', 'assets', 'web', 'leaf_glow.png'), 'image/png'),
  ]);

  const html = buildHtml(content, { fontRegular, fontBold, posterRender, leafGlow });
  await fs.writeFile(htmlOutPath, html, 'utf8');

  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    // Offline guard: block any accidental external requests.
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (url.startsWith('data:') || url === 'about:blank') return route.continue();
      return route.abort();
    });

    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      const imgs = Array.from(document.querySelectorAll('img'));
      await Promise.all(imgs.map((img) => (img.complete ? img.decode() : new Promise((r) => { img.onload = r; }))));
    });

    const check = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img')).map((img) => ({
        alt: img.alt,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      }));
      return {
        fontLoaded: document.fonts.check("700 24px 'Barlow Condensed'"),
        imgs,
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
      };
    });

    if (pageErrors.length) throw new Error(`HTML page errors: ${pageErrors.join('; ')}`);
    if (!check.fontLoaded) throw new Error('Embedded Barlow Condensed font failed to load');
    if (check.imgs.some((i) => !i.complete || i.naturalWidth === 0)) {
      throw new Error(`Undecoded image(s): ${JSON.stringify(check.imgs)}`);
    }

    await page.screenshot({
      path: pngOutPath,
      clip: { x: 0, y: 0, width, height },
      fullPage: false,
    });

    console.log(
      JSON.stringify(
        {
          built: ['output/index.html', 'output/poster.png'],
          dimensions: { width, height },
          decodedImages: check.imgs.length,
          fontLoaded: check.fontLoaded,
          pageErrors: pageErrors.length,
        },
        null,
        2
      )
    );
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
