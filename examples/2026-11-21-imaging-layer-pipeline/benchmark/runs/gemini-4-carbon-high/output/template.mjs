// Editable visual layout & HTML generator for "How a poster is assembled"
// Produces a 100% self-contained 1600x1200 HTML document with zero external requests.

const escapeHtml = value =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Ground contact + cast shadow SVGs matching source/nutrition.mjs
const GROUND_SHADOW_SPECS = {
  balance_scale:   { boxW: 280, boxH: 210, contact: { cx: 139, cy: 184, rx: 46, ry: 6.5 }, cast: { cx: 122, cy: 187, rx: 68, ry: 12.5, rot: -4 } },
  skip_spike:      { boxW: 280, boxH: 210, contact: { cx: 142, cy: 194, rx: 62, ry: 7.5 }, cast: { cx: 124, cy: 197, rx: 84, ry: 13.5, rot: -4 } },
  parfait_jar:     { boxW: 160, boxH: 170, contact: { cx: 79,  cy: 155, rx: 41, ry: 6.5 }, cast: { cx: 63,  cy: 158, rx: 58, ry: 12,   rot: -5 } },
  snack_container: { boxW: 160, boxH: 170, contact: { cx: 75,  cy: 152, rx: 45, ry: 7   }, cast: { cx: 58,  cy: 156, rx: 62, ry: 13,   rot: -6 } },
  chicken_wrap:    { boxW: 160, boxH: 170, imgTop: 60, imgHeight: 107, contact: { cx: 72, cy: 153, rx: 44, ry: 6.5 }, cast: { cx: 56, cy: 156, rx: 60, ry: 12, rot: -5 } },
  water_bottle:    { boxW: 160, boxH: 170, contact: { cx: 79,  cy: 162, rx: 25, ry: 5.5 }, cast: { cx: 61,  cy: 164, rx: 46, ry: 10.5, rot: -4 } },
};

function groundShadowUri(id) {
  const s = GROUND_SHADOW_SPECS[id];
  if (!s) return '';
  const { boxW, boxH, contact, cast } = s;
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${boxW} ${boxH}" width="${boxW}" height="${boxH}">`,
    '<defs>',
    `<radialGradient id="cast_${id}" cx="50%" cy="50%" r="50%">`,
    '<stop offset="0%" stop-color="#1f2a1c" stop-opacity="0.34"/>',
    '<stop offset="45%" stop-color="#1f2a1c" stop-opacity="0.20"/>',
    '<stop offset="100%" stop-color="#1f2a1c" stop-opacity="0"/>',
    '</radialGradient>',
    `<radialGradient id="contact_${id}" cx="50%" cy="50%" r="50%">`,
    '<stop offset="0%" stop-color="#162014" stop-opacity="0.54"/>',
    '<stop offset="55%" stop-color="#162014" stop-opacity="0.25"/>',
    '<stop offset="100%" stop-color="#162014" stop-opacity="0"/>',
    '</radialGradient>',
    '</defs>',
    `<ellipse cx="${cast.cx}" cy="${cast.cy}" rx="${cast.rx}" ry="${cast.ry}" transform="rotate(${cast.rot} ${cast.cx} ${cast.cy})" fill="url(#cast_${id})"/>`,
    `<ellipse cx="${contact.cx}" cy="${contact.cy}" rx="${contact.rx}" ry="${contact.ry}" fill="url(#contact_${id})"/>`,
    '</svg>',
  ].join('');
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Projection helper matching CSS matrix(0.242, -0.066, 0, 0.432, X0, Y0)
function proj(x0, y0, px, py) {
  return [
    Math.round((x0 + 0.242 * px) * 10) / 10,
    Math.round((y0 - 0.066 * px + 0.432 * py) * 10) / 10,
  ];
}

export function buildHtml({ captions, fixture, fonts, assets }) {
  const W = 1600;
  const H = 1200;

  // Plane origins in 1600x1200 space
  const P1 = { x: 486, y: 276 };
  const P2 = { x: 606, y: 264 };
  const P3 = { x: 732, y: 252 };
  const P4 = { x: 876, y: 240 };

  // Key projected points for precision SVG rails and leader lines
  const p1TL = proj(P1.x, P1.y, 0, 0);
  const p4TL = proj(P4.x, P4.y, 0, 0);
  const p1TR = proj(P1.x, P1.y, 1000, 0);
  const p4TR = proj(P4.x, P4.y, 1000, 0);
  const p1BL = proj(P1.x, P1.y, 0, 1000);
  const p4BL = proj(P4.x, P4.y, 0, 1000);
  const p1BR = proj(P1.x, P1.y, 1000, 1000);
  const p4BR = proj(P4.x, P4.y, 1000, 1000);

  // Target points on planes
  const headlineTarget = proj(P4.x, P4.y, 195, 58);      // Headline left-side on Plane L4
  const leafArtTarget = proj(P3.x, P3.y, 445, 435);      // Hero leaf body on Plane L3
  const leafCoordTarget = proj(P3.x, P3.y, 155, 142);    // left: 262 / top: -34 caliper on Plane L3

  const { header, hero, items, benefitsPanel, footer } = fixture.sections;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(captions.title)}</title>
<style>
@font-face {
  font-family: 'Barlow Condensed';
  font-weight: 400;
  font-style: normal;
  src: url(data:font/ttf;base64,${fonts.regular}) format('truetype');
}
@font-face {
  font-family: 'Barlow Condensed';
  font-weight: 700;
  font-style: normal;
  src: url(data:font/ttf;base64,${fonts.bold}) format('truetype');
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: ${W}px;
  height: ${H}px;
  overflow: hidden;
  background: #0d1712;
  color: #edf5ef;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.board {
  position: relative;
  width: ${W}px;
  height: ${H}px;
  background:
    radial-gradient(circle at 54% 38%, rgba(56, 118, 68, 0.22) 0%, rgba(18, 34, 26, 0.65) 52%, #0b140f 100%);
  overflow: hidden;
}

/* Subtle architectural drafting grid */
.board::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(164, 214, 178, 0.045) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(164, 214, 178, 0.045) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

/* ---------- TOP MASTHEAD ---------- */
.masthead {
  position: absolute;
  left: 24px;
  top: 16px;
  width: 1552px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  background: linear-gradient(180deg, rgba(25, 43, 33, 0.94), rgba(16, 29, 22, 0.94));
  border: 1px solid rgba(145, 196, 158, 0.26);
  border-radius: 14px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
}

.masthead-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.eyebrow {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.6px;
  color: #8be864;
}

.eyebrow-sep {
  color: #bdd0c3;
  font-weight: 500;
  letter-spacing: 0.1px;
}

.main-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 40px;
  font-weight: 700;
  letter-spacing: 1.2px;
  line-height: 1;
  color: #f8fcf9;
  text-transform: uppercase;
}

.legend-strip {
  display: flex;
  align-items: center;
  gap: 10px;
}

.legend-pill {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 23px;
  font-weight: 700;
  letter-spacing: 0.6px;
  padding: 6px 14px;
  border-radius: 999px;
  color: #0b140f;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.pill-amber { background: #ffd166; }
.pill-emerald { background: #8be864; }
.pill-cyan { background: #67e8f9; }

/* ---------- LEFT COLUMN: 3 EDIT CARDS ---------- */
.edit-card {
  position: absolute;
  left: 24px;
  width: 430px;
  background: linear-gradient(180deg, rgba(22, 38, 29, 0.96), rgba(14, 25, 19, 0.97));
  border-radius: 14px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.42);
}

.card-amber {
  top: 106px;
  height: 212px;
  border: 2px solid rgba(255, 209, 102, 0.76);
}
.card-emerald {
  top: 328px;
  height: 226px;
  border: 2px solid rgba(139, 232, 100, 0.76);
}
.card-cyan {
  top: 564px;
  height: 242px;
  border: 2px solid rgba(103, 232, 249, 0.76);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.action-badge {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 33px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.7px;
  padding: 4px 11px;
  border-radius: 8px;
  color: #0b140f;
  text-transform: uppercase;
}

.file-chip {
  font-family: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
  font-size: 11px;
  font-weight: 600;
  color: #d7e6dc;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;
}

.code-box {
  font-family: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
  font-size: 11.4px;
  line-height: 1.34;
  background: #08100c;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 6px 9px;
  color: #b7c9be;
  white-space: pre;
}

.hl-amber {
  display: inline-block;
  background: rgba(255, 209, 102, 0.22);
  border: 1px solid rgba(255, 209, 102, 0.65);
  color: #ffe399;
  font-weight: 700;
  padding: 0 4px;
  border-radius: 4px;
}

.hl-emerald {
  display: inline-block;
  background: rgba(139, 232, 100, 0.2);
  border: 1px solid rgba(139, 232, 100, 0.65);
  color: #b6f59b;
  font-weight: 700;
  padding: 0 4px;
  border-radius: 4px;
}

.hl-cyan {
  display: inline-block;
  background: rgba(103, 232, 249, 0.18);
  border: 1px solid rgba(103, 232, 249, 0.65);
  color: #a5f3fc;
  font-weight: 700;
  padding: 0 4px;
  border-radius: 4px;
}

.art-row {
  display: flex;
  align-items: stretch;
  gap: 10px;
}

.art-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 6px;
}

.alt-strip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(139, 232, 100, 0.35);
  border-radius: 7px;
  padding: 4px 8px;
}

.alt-strip img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.alt-label {
  font-size: 10.8px;
  color: #b8cdc0;
  line-height: 1.2;
}

.checker-card {
  width: 112px;
  background-color: #1a2920;
  background-image:
    linear-gradient(45deg, #26382d 25%, transparent 25%),
    linear-gradient(-45deg, #26382d 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #26382d 75%),
    linear-gradient(-45deg, transparent 75%, #26382d 75%);
  background-size: 14px 14px;
  background-position: 0 0, 0 7px, 7px -7px, -7px 0;
  border: 2px solid #8be864;
  border-radius: 9px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px;
  position: relative;
}

.checker-card img {
  width: 56px;
  height: 66px;
  object-fit: contain;
  filter: drop-shadow(0 3px 6px rgba(242, 228, 150, 0.45));
}

.checker-tag {
  font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
  font-size: 10.5px;
  font-weight: 700;
  color: #0b140f;
  background: #8be864;
  padding: 1px 6px;
  border-radius: 4px;
  margin-top: 2px;
}

.effect-pills {
  display: flex;
  gap: 5px;
}

.effect-pill {
  flex: 1;
  background: rgba(103, 232, 249, 0.11);
  border: 1px solid rgba(103, 232, 249, 0.35);
  border-radius: 6px;
  padding: 3px 3px;
  font-size: 10.1px;
  color: #cffafe;
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
}

.caption {
  font-size: 12.6px;
  line-height: 1.32;
  color: #e6f2ea;
  font-weight: 500;
}

/* ---------- CENTER COLUMN: EXPLODED 3D SCENE ---------- */
.center-panel {
  position: absolute;
  left: 468px;
  top: 106px;
  width: 674px;
  height: 700px;
  background: linear-gradient(180deg, rgba(20, 35, 27, 0.72), rgba(11, 20, 15, 0.82));
  border: 1px solid rgba(145, 196, 158, 0.24);
  border-radius: 16px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 14px 32px rgba(0, 0, 0, 0.4);
}

.section-bar {
  position: absolute;
  left: 16px;
  right: 16px;
  top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-heading {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.9px;
  color: #f3faf5;
  text-transform: uppercase;
}

.layer-chips {
  position: absolute;
  left: 16px;
  right: 16px;
  top: 44px;
  display: flex;
  gap: 6px;
}

.layer-chip {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 3px 9px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e9f5ed;
}
.layer-chip.c-l3 {
  background: rgba(103, 232, 249, 0.18);
  border-color: #67e8f9;
  color: #a5f3fc;
}
.layer-chip.c-l4 {
  background: rgba(255, 209, 102, 0.18);
  border-color: #ffd166;
  color: #ffe399;
}

.center-note {
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 12px;
  background: rgba(9, 17, 13, 0.88);
  border: 1px solid rgba(145, 196, 158, 0.28);
  border-radius: 10px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.z-pill {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #0b140f;
  background: #a7f3d0;
  padding: 3px 9px;
  border-radius: 6px;
  white-space: nowrap;
}

.center-note-text {
  font-size: 12.4px;
  line-height: 1.3;
  color: #dcebe1;
}

/* Axonometric 1000x1000 poster planes positioned in board space */
.iso-plane {
  position: absolute;
  left: 0;
  top: 0;
  width: 1000px;
  height: 1000px;
  transform-origin: 0 0;
  border-radius: 18px;
  pointer-events: none;
}

.plane-l1 {
  transform: matrix(0.242, -0.066, 0, 0.432, ${P1.x}, ${P1.y});
  background-color: #fbfaf3;
  background-image: radial-gradient(circle at 50% 44%, #fffef8 0%, #f7f3e3 58%, #ede6cf 100%);
  border: 6px solid #cbbda0;
  box-shadow: -18px 24px 38px rgba(0, 0, 0, 0.55);
}

.plane-l2 {
  transform: matrix(0.242, -0.066, 0, 0.432, ${P2.x}, ${P2.y});
  background: rgba(251, 250, 243, 0.34);
  border: 5px solid rgba(163, 211, 138, 0.82);
  box-shadow: -22px 22px 34px rgba(0, 0, 0, 0.46);
}

.plane-l3 {
  transform: matrix(0.242, -0.066, 0, 0.432, ${P3.x}, ${P3.y});
  background: rgba(20, 44, 34, 0.24);
  border: 6px solid #67e8f9;
  box-shadow: -24px 22px 36px rgba(0, 0, 0, 0.52), 0 0 24px rgba(103, 232, 249, 0.2);
}

.plane-l4 {
  transform: matrix(0.242, -0.066, 0, 0.432, ${P4.x}, ${P4.y});
  background:
    linear-gradient(180deg,
      rgba(251, 250, 243, 0.90) 0%,
      rgba(251, 250, 243, 0.86) 13.5%,
      rgba(251, 250, 243, 0.08) 14.5%,
      rgba(251, 250, 243, 0.08) 82%,
      rgba(251, 250, 243, 0.88) 84%,
      rgba(251, 250, 243, 0.94) 100%);
  border: 6px solid #ffd166;
  box-shadow: -24px 22px 36px rgba(0, 0, 0, 0.48);
}

.plane-tag {
  position: absolute;
  top: -54px;
  left: 0;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 40px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 4px 18px;
  border-radius: 10px;
  white-space: nowrap;
}

/* ---------- RIGHT COLUMN: ASSEMBLED POSTER & HTML vs PNG ---------- */
.right-panel {
  position: absolute;
  left: 1156px;
  top: 106px;
  width: 420px;
  height: 700px;
  background: linear-gradient(180deg, rgba(22, 38, 29, 0.95), rgba(13, 23, 18, 0.97));
  border: 1px solid rgba(145, 196, 158, 0.28);
  border-radius: 16px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.42);
}

.assembled-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.assembled-frame {
  position: relative;
  width: 224px;
  height: 224px;
  border-radius: 10px;
  overflow: hidden;
  border: 3px solid #e9e2cc;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.55);
}

.assembled-frame img {
  width: 100%;
  height: 100%;
  display: block;
}

.poster-dim-tag {
  position: absolute;
  right: 6px;
  bottom: 6px;
  font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
  font-size: 10px;
  font-weight: 700;
  background: rgba(15, 25, 20, 0.86);
  color: #f8faf8;
  padding: 2px 6px;
  border-radius: 4px;
}

.compare-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 10px;
}

.compare-card {
  background: rgba(9, 17, 13, 0.9);
  border-radius: 11px;
  padding: 9px 9px 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.compare-html {
  border: 2px solid #60a5fa;
}
.compare-png {
  border: 2px solid #f472b6;
}

.compare-badge {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.6px;
  padding: 4px 9px;
  border-radius: 6px;
  color: #0b140f;
  text-align: center;
}
.badge-html { background: #93c5fd; }
.badge-png { background: #f9a8d4; }

.compare-sub {
  font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
  font-size: 9.8px;
  color: #c7d9ce;
  text-align: center;
  font-weight: 600;
}

.loupe-box {
  position: relative;
  height: 86px;
  border-radius: 8px;
  overflow: hidden;
  background: #fbfaf3;
  border: 1px solid rgba(255, 255, 255, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Live selectable DOM text simulation inside Offline HTML loupe */
.dom-loupe-text {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 40px;
  font-weight: 700;
  color: #2f5d27;
  letter-spacing: 0.8px;
  display: flex;
  align-items: center;
  user-select: text;
}

.selected-span {
  position: relative;
  background: rgba(37, 99, 235, 0.28);
  border-left: 2px solid #2563eb;
  border-right: 2px solid #2563eb;
  padding: 0 3px;
  color: #173812;
}

.ibeam {
  position: absolute;
  right: 14px;
  bottom: 8px;
  font-family: Georgia, serif;
  font-size: 22px;
  font-weight: 700;
  color: #1d4ed8;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid #60a5fa;
  border-radius: 4px;
  padding: 0 5px;
  line-height: 1.1;
}

.loupe-chip {
  position: absolute;
  left: 5px;
  top: 5px;
  font-size: 9.5px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
  text-transform: uppercase;
}
.chip-dom { background: #1d4ed8; color: #fff; }
.chip-pix { background: #be185d; color: #fff; }

.pixel-crop {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: pixelated;
}

.pixel-grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(31, 42, 28, 0.22) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(31, 42, 28, 0.22) 1px, transparent 1px);
  background-size: 4px 4px;
}

.compare-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 11px;
  color: #dbe9df;
  line-height: 1.25;
}

.viewer-caption-box {
  background: rgba(9, 17, 13, 0.88);
  border: 1px solid rgba(147, 197, 253, 0.35);
  border-radius: 9px;
  padding: 7px 10px;
}

/* ---------- BOTTOM RAIL: ENGINE RENDER PIPELINE ---------- */
.pipeline-rail {
  position: absolute;
  left: 24px;
  top: 820px;
  width: 1552px;
  height: 364px;
  background: linear-gradient(180deg, rgba(20, 35, 27, 0.96), rgba(11, 20, 15, 0.98));
  border: 1px solid rgba(145, 196, 158, 0.28);
  border-radius: 16px;
  padding: 12px 18px 14px;
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.45);
}

.pipe-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.pipe-tag {
  font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
  font-size: 11.5px;
  color: #a7f3d0;
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(167, 243, 208, 0.3);
  padding: 4px 10px;
  border-radius: 999px;
}

.pipe-stage {
  position: absolute;
  background: #0a130e;
  border-radius: 12px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.stage-node {
  left: 18px;
  top: 50px;
  width: 338px;
  height: 298px;
  border: 2px solid #8be864;
}

.stage-css {
  left: 386px;
  top: 50px;
  width: 338px;
  height: 298px;
  border: 2px solid #67e8f9;
}

.stage-a1 {
  left: 774px;
  top: 50px;
  width: 372px;
  height: 142px;
  border: 2px solid #fb923c;
}

.stage-a2 {
  left: 1176px;
  top: 50px;
  width: 358px;
  height: 142px;
  border: 2px solid #fb923c;
}

.stage-b1 {
  left: 774px;
  top: 206px;
  width: 372px;
  height: 142px;
  border: 2px solid #c084fc;
}

.stage-b2 {
  left: 1176px;
  top: 206px;
  width: 358px;
  height: 142px;
  border: 2px solid #c084fc;
}

.stage-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.stage-badge {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.6px;
  padding: 4px 10px;
  border-radius: 6px;
  color: #0b140f;
}
.b-node { background: #8be864; }
.b-css  { background: #67e8f9; }
.b-sat  { background: #fdba74; }
.b-pw   { background: #d8b4fe; }

.stage-sub {
  font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
  font-size: 10.5px;
  color: #bfd2c5;
  font-weight: 600;
}

.mini-flow {
  display: flex;
  flex-direction: column;
  gap: 7px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 10px;
}

.flow-step {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #e4f1e8;
}

.flow-chip {
  font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(139, 232, 100, 0.16);
  color: #bbf7d0;
  border: 1px solid rgba(139, 232, 100, 0.4);
  white-space: nowrap;
}

.flow-chip.cyan {
  background: rgba(103, 232, 249, 0.15);
  color: #a5f3fc;
  border-color: rgba(103, 232, 249, 0.4);
}

.track-io {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
  font-size: 11px;
  color: #f1f7f3;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 8px;
  border-radius: 6px;
}

.out-pill {
  margin-left: auto;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10.5px;
}
.out-svg { background: rgba(251, 146, 60, 0.25); color: #fed7aa; border: 1px solid #fb923c; }
.out-png { background: rgba(244, 114, 182, 0.25); color: #fbcfe8; border: 1px solid #f472b6; }
.out-html { background: rgba(96, 165, 250, 0.25); color: #bfdbfe; border: 1px solid #60a5fa; }

/* Full-board SVG overlay */
.overlay-svg {
  position: absolute;
  inset: 0;
  width: ${W}px;
  height: ${H}px;
  pointer-events: none;
}
</style>
</head>
<body>
<div class="board" id="poster_root">

  <!-- ==================== TOP MASTHEAD ==================== -->
  <header class="masthead">
    <div class="masthead-left">
      <div class="eyebrow">${escapeHtml(captions.eyebrow)} <span class="eyebrow-sep">— ${escapeHtml(captions.subtitle)}</span></div>
      <h1 class="main-title">${escapeHtml(captions.title)}</h1>
    </div>
    <div class="legend-strip">
      <span class="legend-pill pill-amber">${escapeHtml(captions.legend.words)}</span>
      <span class="legend-pill pill-emerald">${escapeHtml(captions.legend.art)}</span>
      <span class="legend-pill pill-cyan">${escapeHtml(captions.legend.move)}</span>
    </div>
  </header>

  <!-- ==================== LEFT COLUMN: 3 EDITABLE CONTROLS ==================== -->
  <figure class="edit-card card-amber" id="card_headline">
    <div class="card-head">
      <span class="action-badge pill-amber">${escapeHtml(captions.cards.headline.badge)}</span>
      <span class="file-chip">${escapeHtml(captions.cards.headline.file)}</span>
    </div>
    <div class="code-box">"header": {
  <span class="hl-amber">"headline": "${escapeHtml(header.headline)}"</span>,
  "subtitle": "${escapeHtml(header.subtitle)}"
}</div>
    <figcaption class="caption" id="cap_headline">${escapeHtml(captions.cards.headline.caption)}</figcaption>
  </figure>

  <figure class="edit-card card-emerald" id="card_artwork">
    <div class="card-head">
      <span class="action-badge pill-emerald">${escapeHtml(captions.cards.artwork.badge)}</span>
      <span class="file-chip">${escapeHtml(captions.cards.artwork.file)}</span>
    </div>
    <div class="art-row">
      <div class="art-left">
        <div class="code-box">"hero": {
  <span class="hl-emerald">"illustrationId": "${escapeHtml(hero.illustrationId)}"</span>
}</div>
        <div class="alt-strip">
          <img src="${assets.parfait_jar}" alt="parfait_jar">
          <img src="${assets.water_bottle}" alt="water_bottle">
          <img src="${assets.balance_scale}" alt="balance_scale">
          <span class="alt-label">Other PNG IDs in<br><code>assets/web/*.png</code></span>
        </div>
      </div>
      <div class="checker-card">
        <img src="${assets.leaf_glow}" alt="leaf_glow transparent PNG">
        <span class="checker-tag">leaf_glow.png</span>
      </div>
    </div>
    <figcaption class="caption" id="cap_artwork">${escapeHtml(captions.cards.artwork.caption)}</figcaption>
  </figure>

  <figure class="edit-card card-cyan" id="card_placement">
    <div class="card-head">
      <span class="action-badge pill-cyan">${escapeHtml(captions.cards.placement.badge)}</span>
      <span class="file-chip">${escapeHtml(captions.cards.placement.file)}</span>
    </div>
    <div class="code-box">img('hero_img', heroImage, { position: 'absolute',
  <span class="hl-cyan">left: 262, top: -34, width: 428, height: 640</span>,
  filter: HERO_SHADOW // golden drop-shadow
})</div>
    <div class="effect-pills">
      <span class="effect-pill">left: 262 → + shifts right</span>
      <span class="effect-pill">top: -34 → pulls 34px up</span>
      <span class="effect-pill">428 × 640 → box size</span>
    </div>
    <figcaption class="caption" id="cap_placement">${escapeHtml(captions.cards.placement.caption)}</figcaption>
  </figure>

  <!-- ==================== CENTER COLUMN: EXPLODED 3D SCENE ==================== -->
  <section class="center-panel" id="exploded_stage">
    <div class="section-bar">
      <h2 class="section-heading">${escapeHtml(captions.assembly.heading)}</h2>
    </div>
    <div class="layer-chips">
      <span class="layer-chip">${escapeHtml(captions.assembly.planes.l1)}</span>
      <span class="layer-chip">${escapeHtml(captions.assembly.planes.l2)}</span>
      <span class="layer-chip c-l3">${escapeHtml(captions.assembly.planes.l3)}</span>
      <span class="layer-chip c-l4">${escapeHtml(captions.assembly.planes.l4)}</span>
    </div>
    <div class="center-note">
      <span class="z-pill">Z-STACK: L1 → L4</span>
      <p class="center-note-text">${escapeHtml(captions.assembly.note)}</p>
    </div>
  </section>

  <!-- Back-to-Front Perspective Registration Rails (Behind Planes) -->
  <svg class="overlay-svg" viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <line x1="${p1TL[0]}" y1="${p1TL[1]}" x2="${p4TL[0]}" y2="${p4TL[1]}" stroke="rgba(167,243,208,0.32)" stroke-width="1.6" stroke-dasharray="5 5"/>
    <line x1="${p1TR[0]}" y1="${p1TR[1]}" x2="${p4TR[0]}" y2="${p4TR[1]}" stroke="rgba(167,243,208,0.32)" stroke-width="1.6" stroke-dasharray="5 5"/>
    <line x1="${p1BL[0]}" y1="${p1BL[1]}" x2="${p4BL[0]}" y2="${p4BL[1]}" stroke="rgba(167,243,208,0.32)" stroke-width="1.6" stroke-dasharray="5 5"/>
    <line x1="${p1BR[0]}" y1="${p1BR[1]}" x2="${p4BR[0]}" y2="${p4BR[1]}" stroke="rgba(167,243,208,0.32)" stroke-width="1.6" stroke-dasharray="5 5"/>
  </svg>

  <!-- PLANE L1: Canvas Backdrop & Structural Panels (1000x1000 local space) -->
  <div class="iso-plane plane-l1" id="plane_l1">
    <span class="plane-tag" style="background:#e7dec8;color:#1f2a1c;">L1 · BACKDROP</span>
    <!-- Header guide frame -->
    <div style="position:absolute;left:24px;top:16px;width:952px;height:116px;border:3px dashed rgba(47,93,39,0.28);border-radius:12px;"></div>
    <!-- Benefits panel structural fill -->
    <div style="position:absolute;left:786px;top:684px;width:190px;height:238px;background:#f4f8ea;border:4px solid #b9d79b;border-radius:16px;"></div>
    <!-- Footer pill structural fill -->
    <div style="position:absolute;left:30px;top:932px;width:940px;height:52px;background:#f4f8ea;border:4px solid #b9d79b;border-radius:999px;"></div>
  </div>

  <!-- PLANE L2: Grounded Callout & Food Illustrations + Contact/Cast Shadows -->
  <div class="iso-plane plane-l2" id="plane_l2">
    <span class="plane-tag" style="background:#86efac;color:#0b140f;">L2 · ITEMS &amp; SHADOWS</span>
    <!-- Callout 1: balance_scale -->
    <img src="${groundShadowUri('balance_scale')}" alt="" style="position:absolute;left:39px;top:223px;width:280px;height:210px;">
    <img src="${assets.balance_scale}" alt="" style="position:absolute;left:39px;top:223px;width:280px;height:210px;object-fit:contain;">
    <!-- Callout 2: skip_spike -->
    <img src="${groundShadowUri('skip_spike')}" alt="" style="position:absolute;left:681px;top:223px;width:280px;height:210px;">
    <img src="${assets.skip_spike}" alt="" style="position:absolute;left:681px;top:223px;width:280px;height:210px;object-fit:contain;">
    <!-- 4 Food Items -->
    <img src="${groundShadowUri('parfait_jar')}" alt="" style="position:absolute;left:27px;top:668px;width:160px;height:170px;">
    <img src="${assets.parfait_jar}" alt="" style="position:absolute;left:27px;top:668px;width:160px;height:170px;object-fit:contain;">

    <img src="${groundShadowUri('snack_container')}" alt="" style="position:absolute;left:222px;top:668px;width:160px;height:170px;">
    <img src="${assets.snack_container}" alt="" style="position:absolute;left:222px;top:668px;width:160px;height:170px;object-fit:contain;">

    <img src="${groundShadowUri('chicken_wrap')}" alt="" style="position:absolute;left:417px;top:668px;width:160px;height:170px;">
    <img src="${assets.chicken_wrap}" alt="" style="position:absolute;left:417px;top:728px;width:160px;height:107px;object-fit:contain;">

    <img src="${groundShadowUri('water_bottle')}" alt="" style="position:absolute;left:612px;top:668px;width:160px;height:170px;">
    <img src="${assets.water_bottle}" alt="" style="position:absolute;left:612px;top:668px;width:160px;height:170px;object-fit:contain;">
  </div>

  <!-- PLANE L3: Hero Leaf Illustration + Exact Recipe Coordinates (left: 262, top: -34, 428x640) -->
  <div class="iso-plane plane-l3" id="plane_l3">
    <span class="plane-tag" style="background:#67e8f9;color:#0b140f;">L3 · HERO LEAF</span>
    <!-- #hero container dashed reference box (x:24, y:142, w:952, h:516) -->
    <div style="position:absolute;left:24px;top:142px;width:952px;height:516px;border:4px dashed rgba(103,232,249,0.55);border-radius:10px;"></div>

    <!-- Hero Leaf Bounding Box (x:286, y:108, w:428, h:640 => left:262, top:-34 inside #hero) -->
    <div style="position:absolute;left:286px;top:108px;width:428px;height:640px;border:5px solid #67e8f9;background:rgba(103,232,249,0.10);border-radius:8px;"></div>
    <img src="${assets.leaf_glow}" alt="Hero leaf_glow" style="position:absolute;left:286px;top:108px;width:428px;height:640px;object-fit:contain;filter:drop-shadow(0px 8px 12px rgba(242,228,150,0.65));">

    <!-- Coordinate Calipers drawn natively in 1000x1000 plane space -->
    <!-- Horizontal caliper: left: 262 (from x=24 to x=286) -->
    <div style="position:absolute;left:24px;top:186px;width:262px;height:8px;background:#67e8f9;"></div>
    <div style="position:absolute;left:24px;top:164px;width:8px;height:52px;background:#67e8f9;"></div>
    <div style="position:absolute;left:280px;top:164px;width:8px;height:52px;background:#67e8f9;"></div>
    <div style="position:absolute;left:34px;top:204px;background:#071318;border:4px solid #67e8f9;color:#67e8f9;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:44px;padding:2px 14px;border-radius:10px;white-space:nowrap;">left: 262</div>

    <!-- Vertical caliper: top: -34 (from y=108 to y=142) -->
    <div style="position:absolute;left:252px;top:108px;width:34px;height:34px;border-left:8px solid #ffd166;border-top:8px solid #ffd166;border-bottom:8px solid #ffd166;"></div>
    <div style="position:absolute;left:34px;top:76px;background:#071318;border:4px solid #ffd166;color:#ffd166;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:42px;padding:2px 14px;border-radius:10px;white-space:nowrap;">top: -34</div>

    <!-- Size badge: 428 x 640 -->
    <div style="position:absolute;left:286px;top:758px;background:#071318;border:4px solid #67e8f9;color:#a5f3fc;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:40px;padding:2px 16px;border-radius:10px;white-space:nowrap;">428 × 640 px</div>
  </div>

  <!-- PLANE L4: Flexbox Typography & Vector Ornaments (Open center window reveals L3 Hero Leaf!) -->
  <div class="iso-plane plane-l4" id="plane_l4">
    <span class="plane-tag" style="background:#ffd166;color:#0b140f;">L4 · LIVE TEXT</span>
    <!-- Header Headline Band -->
    <div style="position:absolute;left:20px;top:14px;width:960px;height:122px;border:5px solid #f59e0b;background:rgba(255,248,220,0.92);border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;">
      <div style="display:flex;align-items:center;gap:16px;">
        <img src="${assets.ornament}" alt="" style="width:42px;height:42px;">
        <span style="font-family:'Barlow Condensed',sans-serif;font-size:66px;font-weight:700;color:#2f5d27;letter-spacing:1.2px;line-height:1.05;">${escapeHtml(header.headline)}</span>
        <img src="${assets.ornament}" alt="" style="width:42px;height:42px;transform:scaleX(-1);">
      </div>
      <span style="font-family:'Barlow Condensed',sans-serif;font-size:36px;font-weight:400;color:#2f5d27;letter-spacing:0.8px;">${escapeHtml(header.subtitle)}</span>
    </div>

    <!-- Callout 1 & Callout 2 Titles (framing the open center window!) -->
    <div style="position:absolute;left:34px;top:432px;width:290px;padding:8px;background:rgba(251,250,243,0.9);border-radius:10px;text-align:center;font-family:'Barlow Condensed',sans-serif;">
      <div style="font-size:26px;font-weight:700;color:#2f5d27;">BALANCED NUTRITION</div>
      <div style="font-size:20px;color:#3d4639;">The right fuel for your body and mind.</div>
    </div>
    <div style="position:absolute;left:676px;top:432px;width:290px;padding:8px;background:rgba(251,250,243,0.9);border-radius:10px;text-align:center;font-family:'Barlow Condensed',sans-serif;">
      <div style="font-size:26px;font-weight:700;color:#2f5d27;">SKIP THE SPIKE</div>
      <div style="font-size:20px;color:#3d4639;">Avoid sugary drinks and processed snacks.</div>
    </div>

    <!-- Item Titles Row -->
    <div style="position:absolute;left:24px;top:838px;width:750px;display:flex;justify-content:space-between;font-family:'Barlow Condensed',sans-serif;text-align:center;">
      ${items.map(it => `<div style="width:165px;"><div style="font-size:24px;font-weight:700;color:#2f5d27;">${escapeHtml(it.title)}</div><div style="font-size:18px;color:#3d4639;">${escapeHtml(it.caption)}</div></div>`).join('')}
    </div>

    <!-- Benefits Panel Text + Icons -->
    <div style="position:absolute;left:786px;top:684px;width:190px;height:238px;padding:12px;display:flex;flex-direction:column;justify-content:center;gap:14px;background:rgba(244,248,234,0.92);border:3px solid #b9d79b;border-radius:16px;font-family:'Barlow Condensed',sans-serif;">
      ${benefitsPanel.map((b, idx) => `<div style="display:flex;align-items:center;gap:8px;"><img src="${assets.benefitIcons[idx]}" alt="" style="width:38px;height:38px;"><span style="font-size:19px;font-weight:700;color:#2f5d27;line-height:1.1;">${escapeHtml(b.text)}</span></div>`).join('')}
    </div>

    <!-- Footer Text -->
    <div style="position:absolute;left:30px;top:932px;width:940px;height:52px;display:flex;align-items:center;justify-content:center;gap:14px;font-family:'Barlow Condensed',sans-serif;">
      <img src="${assets.ornament}" alt="" style="width:26px;height:26px;">
      <span style="font-size:23px;font-weight:700;color:#2f5d27;letter-spacing:2px;">${escapeHtml(footer.bannerText)}</span>
      <span style="font-size:19px;color:#3d4639;">${escapeHtml(footer.tagline)}</span>
      <img src="${assets.heart}" alt="" style="width:22px;height:22px;">
    </div>
  </div>

  <!-- ==================== RIGHT COLUMN: ASSEMBLED POSTER & HTML vs PNG ==================== -->
  <figure class="right-panel" id="viewer_panel">
    <div class="section-bar" style="position:static;">
      <h2 class="section-heading">${escapeHtml(captions.viewer.heading)}</h2>
    </div>

    <div class="assembled-wrap">
      <div class="assembled-frame" id="assembled_poster">
        <img src="${assets.renderPng}" alt="Finished Fuel Well Live Well poster">
        <span class="poster-dim-tag">1000 × 1000</span>
      </div>
    </div>

    <div class="compare-grid">
      <!-- Offline HTML Viewer Experience -->
      <div class="compare-card compare-html" id="loupe_html">
        <span class="compare-badge badge-html">${escapeHtml(captions.viewer.htmlBadge)}</span>
        <span class="compare-sub">${escapeHtml(captions.viewer.htmlSub)}</span>
        <div class="loupe-box">
          <span class="loupe-chip chip-dom">DOM TEXT</span>
          <div class="dom-loupe-text">FUEL&nbsp;<span class="selected-span">WELL.</span></div>
          <span class="ibeam">I</span>
        </div>
        <ul class="compare-list">
          <li>• Live selectable &amp; searchable text</li>
          <li>• Inline CSS + base64 fonts/art</li>
          <li>• Works 100% offline (0 requests)</li>
        </ul>
      </div>

      <!-- Exported PNG Viewer Experience -->
      <div class="compare-card compare-png" id="loupe_png">
        <span class="compare-badge badge-png">${escapeHtml(captions.viewer.pngBadge)}</span>
        <span class="compare-sub">${escapeHtml(captions.viewer.pngSub)}</span>
        <div class="loupe-box">
          <img class="pixel-crop" src="${assets.pixelCropPng}" alt="Magnified raster pixels of WELL.">
          <div class="pixel-grid-overlay"></div>
          <span class="loupe-chip chip-pix">4× NATIVE PX</span>
        </div>
        <ul class="compare-list">
          <li>• Flat 1000×1000 RGB pixel grid</li>
          <li>• Text baked into pixels (no select)</li>
          <li>• Instant drag-and-drop image</li>
        </ul>
      </div>
    </div>

    <div class="viewer-caption-box">
      <figcaption class="caption" id="cap_offline_html">${escapeHtml(captions.viewer.caption)}</figcaption>
    </div>
  </figure>

  <!-- ==================== BOTTOM RAIL: ENGINE RENDER PIPELINE ==================== -->
  <section class="pipeline-rail" id="pipeline_rail">
    <div class="pipe-header">
      <h2 class="section-heading">${escapeHtml(captions.pipeline.heading)}</h2>
      <span class="pipe-tag">Both backends export Offline HTML via toDocument(scene)</span>
    </div>

    <!-- Stage 1: Node.js Recipe -->
    <figure class="pipe-stage stage-node" id="stage_node_recipe">
      <div class="stage-top">
        <span class="stage-badge b-node">${escapeHtml(captions.pipeline.nodeRecipe.badge)}</span>
        <span class="stage-sub">${escapeHtml(captions.pipeline.nodeRecipe.sub)}</span>
      </div>
      <div class="mini-flow">
        <div class="flow-step"><span class="flow-chip">validate()</span><span>Checks <code>fixture.json</code> schema &amp; area budget</span></div>
        <div class="flow-step"><span class="flow-chip">buildScene()</span><span>Resolves PNG/SVG data URIs &amp; coordinates</span></div>
        <div class="flow-step"><span class="flow-chip">Auto-Fit ≤10×</span><span>Shrinks overflowing text down to ≥12px</span></div>
        <div class="flow-step"><span class="flow-chip">Output</span><span>Plain JS <strong>Styled Scene Tree</strong> (build time only)</span></div>
      </div>
      <figcaption class="caption" id="cap_node_recipe">${escapeHtml(captions.pipeline.nodeRecipe.caption)}</figcaption>
    </figure>

    <!-- Stage 2: CSS & HTML Serializer -->
    <figure class="pipe-stage stage-css" id="stage_css_styling">
      <div class="stage-top">
        <span class="stage-badge b-css">${escapeHtml(captions.pipeline.cssStyling.badge)}</span>
        <span class="stage-sub">${escapeHtml(captions.pipeline.cssStyling.sub)}</span>
      </div>
      <div class="mini-flow">
        <div class="flow-step"><span class="flow-chip cyan">cssValue()</span><span><code>left: 262</code> → <code>left:262px; top:-34px</code></span></div>
        <div class="flow-step"><span class="flow-chip cyan">toHtml()</span><span>Emits Flexbox DOM with inline <code>style="..."</code></span></div>
        <div class="flow-step"><span class="flow-chip cyan">@font-face</span><span>Embeds base64 <code>Barlow Condensed</code> TTFs</span></div>
        <div class="flow-step"><span class="flow-chip cyan">No Browser JS</span><span>CSS alone drives all HTML layout &amp; styling</span></div>
      </div>
      <figcaption class="caption" id="cap_css_styling">${escapeHtml(captions.pipeline.cssStyling.caption)}</figcaption>
    </figure>

    <!-- Track A1: Satori -> SVG -->
    <figure class="pipe-stage stage-a1" id="stage_satori_svg">
      <div class="stage-top">
        <span class="stage-badge b-sat">${escapeHtml(captions.pipeline.satoriSvg.badge)}</span>
        <span class="stage-sub">${escapeHtml(captions.pipeline.satoriSvg.sub)}</span>
      </div>
      <div class="track-io">
        <span>Scene + TTFs → <code>satori()</code></span>
        <span class="out-pill out-svg">render.svg</span>
      </div>
      <figcaption class="caption" id="cap_satori_svg">${escapeHtml(captions.pipeline.satoriSvg.caption)}</figcaption>
    </figure>

    <!-- Track A2: resvg -> PNG -->
    <figure class="pipe-stage stage-a2" id="stage_resvg_png">
      <div class="stage-top">
        <span class="stage-badge b-sat">${escapeHtml(captions.pipeline.resvgPng.badge)}</span>
        <span class="stage-sub">${escapeHtml(captions.pipeline.resvgPng.sub)}</span>
      </div>
      <div class="track-io">
        <span><code>new Resvg(svg).render()</code></span>
        <span class="out-pill out-png">render.png</span>
        <span class="out-pill out-html">+ HTML</span>
      </div>
      <figcaption class="caption" id="cap_resvg_png">${escapeHtml(captions.pipeline.resvgPng.caption)}</figcaption>
    </figure>

    <!-- Track B1: Playwright -> Chromium -->
    <figure class="pipe-stage stage-b1" id="stage_playwright_chromium">
      <div class="stage-top">
        <span class="stage-badge b-pw">${escapeHtml(captions.pipeline.playwrightChromium.badge)}</span>
        <span class="stage-sub">${escapeHtml(captions.pipeline.playwrightChromium.sub)}</span>
      </div>
      <div class="track-io">
        <span><code>chromium.launch()</code> + <code>setContent(html)</code></span>
        <span class="out-pill out-html">HTML + CSS</span>
      </div>
      <figcaption class="caption" id="cap_playwright_chromium">${escapeHtml(captions.pipeline.playwrightChromium.caption)}</figcaption>
    </figure>

    <!-- Track B2: Chromium PNG Capture -->
    <figure class="pipe-stage stage-b2" id="stage_chromium_capture">
      <div class="stage-top">
        <span class="stage-badge b-pw">${escapeHtml(captions.pipeline.chromiumCapture.badge)}</span>
        <span class="stage-sub">${escapeHtml(captions.pipeline.chromiumCapture.sub)}</span>
      </div>
      <div class="track-io">
        <span><code>page.screenshot({ clip })</code></span>
        <span class="out-pill out-png">render.png</span>
        <span class="out-pill out-html">+ HTML</span>
      </div>
      <figcaption class="caption" id="cap_chromium_capture">${escapeHtml(captions.pipeline.chromiumCapture.caption)}</figcaption>
    </figure>
  </section>

  <!-- ==================== FOREGROUND VECTOR LEADER LINES & ARROWS ==================== -->
  <svg class="overlay-svg" viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <defs>
      <marker id="arr-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
        <path d="M0,1 L9,5 L0,9 z" fill="#ffd166"/>
      </marker>
      <marker id="arr-emerald" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
        <path d="M0,1 L9,5 L0,9 z" fill="#8be864"/>
      </marker>
      <marker id="arr-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
        <path d="M0,1 L9,5 L0,9 z" fill="#67e8f9"/>
      </marker>
      <marker id="arr-cream" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M0,1 L9,5 L0,9 z" fill="#e9e2cc"/>
      </marker>
      <marker id="arr-orange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
        <path d="M0,1 L9,5 L0,9 z" fill="#fb923c"/>
      </marker>
      <marker id="arr-purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
        <path d="M0,1 L9,5 L0,9 z" fill="#c084fc"/>
      </marker>
    </defs>

    <!-- Leader 1: Card 1 (Headline) -> Plane L4 Headline -->
    <path d="M 454 196 C 640 196, 760 250, ${headlineTarget[0]} ${headlineTarget[1]}" fill="none" stroke="#0b140f" stroke-width="8.5" stroke-linecap="round"/>
    <path d="M 454 196 C 640 196, 760 250, ${headlineTarget[0]} ${headlineTarget[1]}" fill="none" stroke="#ffd166" stroke-width="4.5" stroke-linecap="round" marker-end="url(#arr-amber)"/>
    <circle cx="454" cy="196" r="7.5" fill="#ffd166" stroke="#0b140f" stroke-width="2.5"/>
    <circle cx="${headlineTarget[0]}" cy="${headlineTarget[1]}" r="9" fill="rgba(255,209,102,0.22)" stroke="#ffd166" stroke-width="2.5"/>

    <!-- Leader 2: Card 2 (Leaf Artwork) -> Plane L3 Hero Leaf -->
    <path d="M 454 432 C 595 432, 695 415, ${leafArtTarget[0]} ${leafArtTarget[1]}" fill="none" stroke="#0b140f" stroke-width="8.5" stroke-linecap="round"/>
    <path d="M 454 432 C 595 432, 695 415, ${leafArtTarget[0]} ${leafArtTarget[1]}" fill="none" stroke="#8be864" stroke-width="4.5" stroke-linecap="round" marker-end="url(#arr-emerald)"/>
    <circle cx="454" cy="432" r="7.5" fill="#8be864" stroke="#0b140f" stroke-width="2.5"/>
    <circle cx="${leafArtTarget[0]}" cy="${leafArtTarget[1]}" r="9" fill="rgba(139,232,100,0.22)" stroke="#8be864" stroke-width="2.5"/>

    <!-- Leader 3: Card 3 (Leaf Placement) -> Plane L3 Coordinate Calipers -->
    <path d="M 454 646 C 610 646, 650 365, ${leafCoordTarget[0]} ${leafCoordTarget[1]}" fill="none" stroke="#0b140f" stroke-width="8.5" stroke-linecap="round"/>
    <path d="M 454 646 C 610 646, 650 365, ${leafCoordTarget[0]} ${leafCoordTarget[1]}" fill="none" stroke="#67e8f9" stroke-width="4.5" stroke-linecap="round" marker-end="url(#arr-cyan)"/>
    <circle cx="454" cy="646" r="7.5" fill="#67e8f9" stroke="#0b140f" stroke-width="2.5"/>
    <circle cx="${leafCoordTarget[0]}" cy="${leafCoordTarget[1]}" r="9" fill="rgba(103,232,249,0.22)" stroke="#67e8f9" stroke-width="2.5"/>

    <!-- Convergence Arrow: Plane L4 -> Assembled Poster -->
    <path d="M 1118 335 C 1175 335, 1195 275, 1248 275" fill="none" stroke="#0b140f" stroke-width="7" stroke-linecap="round"/>
    <path d="M 1118 335 C 1175 335, 1195 275, 1248 275" fill="none" stroke="#e9e2cc" stroke-width="3.8" stroke-linecap="round" marker-end="url(#arr-cream)"/>

    <!-- Magnifier Callout Lines on Assembled Poster -> Offline HTML & Exported PNG Loupes -->
    <circle cx="1336" cy="203" r="9.5" fill="rgba(96,165,250,0.22)" stroke="#60a5fa" stroke-width="2.4"/>
    <path d="M 1330 212 C 1295 300, 1270 365, 1265 421" fill="none" stroke="#60a5fa" stroke-width="2.2" stroke-dasharray="4 4"/>
    <circle cx="1370" cy="203" r="9.5" fill="rgba(244,114,182,0.22)" stroke="#f472b6" stroke-width="2.4"/>
    <path d="M 1376 212 C 1418 300, 1456 365, 1466 421" fill="none" stroke="#f472b6" stroke-width="2.2" stroke-dasharray="4 4"/>

    <!-- Pipeline Connectors inside Bottom Rail (y offset +820) -->
    <!-- Stage 1 -> Stage 2 -->
    <line x1="380" y1="1018" x2="406" y2="1018" stroke="#8be864" stroke-width="3.5" marker-end="url(#arr-emerald)"/>
    <!-- Stage 2 -> Satori (A1) and Playwright (B1) -->
    <path d="M 748 985 C 770 985, 772 940, 794 940" fill="none" stroke="#fb923c" stroke-width="3.2" marker-end="url(#arr-orange)"/>
    <path d="M 748 1050 C 770 1050, 772 1096, 794 1096" fill="none" stroke="#c084fc" stroke-width="3.2" marker-end="url(#arr-purple)"/>
    <!-- A1 -> A2 -->
    <line x1="1170" y1="940" x2="1196" y2="940" stroke="#fb923c" stroke-width="3.2" marker-end="url(#arr-orange)"/>
    <!-- B1 -> B2 -->
    <line x1="1170" y1="1096" x2="1196" y2="1096" stroke="#c084fc" stroke-width="3.2" marker-end="url(#arr-purple)"/>
  </svg>

</div>
</body>
</html>`;
}
