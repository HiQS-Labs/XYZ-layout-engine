import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

// GH-69: ten JSON fixtures, each composed and measured through the shared XYZ backends.
// No published recipe, runtime module, fit guard, catalog row or dependency is changed.
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const RT = new URL('../../', import.meta.url);
const { renderSatori, renderPlaywright } = await import(new URL('tools/render.mjs', RT).href);
const { chromium } = await import(new URL('node_modules/playwright/index.mjs', RT).href);
const OUT = process.env.OUT_DIR ? path.resolve(process.env.OUT_DIR) : ROOT;
const FIXTURE_DIR = process.env.FIXTURE_DIR ? path.resolve(process.env.FIXTURE_DIR) : path.join(ROOT, 'fixtures');
const W = 1920, H = 1080, M = 88;
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const b64 = (bytes, type) => `data:${type};base64,${Buffer.from(bytes).toString('base64')}`;
const pad = n => String(n).padStart(2, '0');
const fontFile = face => fs.readFile(new URL(`tools/fonts/barlow-condensed/BarlowCondensed-${face}.ttf`, RT));
const fonts = { regular: await fontFile('Regular'), bold: await fontFile('Bold') };
const capHeight = ttf => {
  const n = ttf.readUInt16BE(4), tables = {};
  for (let i = 0; i < n; i++) { const o = 12 + i * 16; tables[ttf.toString('latin1', o, o + 4)] = ttf.readUInt32BE(o + 8); }
  return ttf.readInt16BE(tables['OS/2'] + 88) / ttf.readUInt16BE(tables.head + 18);
};
const CAP_RATIO = capHeight(fonts.bold);

await fs.mkdir(path.join(OUT, 'receipts'), { recursive: true });
const fixtureFiles = (await fs.readdir(FIXTURE_DIR)).filter(n => /^slide-\d{2}\.json$/.test(n)).sort();
assert.equal(fixtureFiles.length, 10, 'expected exactly ten slide fixtures');

function makeBuilder(f) {
  assert.equal(f.width, W); assert.equal(f.height, H);
  const { palette: P, type: TY } = f.theme;
  const S = Math.min(W, H);
  const PX = Object.fromEntries(Object.entries(TY.pct).map(([k, v]) => [k, Math.round(S * v)]));
  const texts = [], containers = {}, sizes = new Set(), graphics = [], vector = [];
  const seen = new Set();
  const node = (type, id, style, children, extra = {}) => ({ type, props: { ...(id ? { id } : {}), style, children, ...extra } });
  const box = (id, style, children) => node('div', id, { display: 'flex', ...style }, children);
  const at = (id, x, y, w, style, children) => box(id, { position: 'absolute', left: x, top: y, width: w, ...style }, children);
  const T = (id, text, style = {}, within) => {
    assert.ok(typeof text === 'string' && text.trim(), `text ${id} must be nonempty`);
    assert.ok(!seen.has(id), `duplicate text id ${id}`);
    seen.add(id); texts.push(id); if (within) containers[id] = within;
    const fontSize = style.fontSize ?? PX.body; sizes.add(fontSize);
    return node('span', id, { color: P.ink, fontSize, lineHeight: 1.2, ...style }, text);
  };
  const ty = {
    headline: { fontSize: PX.headline, fontWeight: 700, lineHeight: 1.2, textTransform: 'uppercase' },
    subhead: { fontSize: PX.subhead, fontWeight: 400, lineHeight: 1.2 },
    label: { fontSize: PX.label, fontWeight: 700, lineHeight: 1.15 },
    body: { fontSize: PX.body, fontWeight: 400, lineHeight: 1.25, color: P.muted }
  };
  const one = (id, x, y, w, h, text, style, extra = {}) => at(`${id}_box`, x, y, w, { height: h, ...extra }, [T(id, text, style, `${id}_box`)]);
  const panel = (id, x, y, w, h, fill = P.panel, line = P.rule) => box(id, {
    position: 'absolute', left: x, top: y, width: w, height: h,
    backgroundColor: fill, border: `2px solid ${line}`, borderRadius: 12
  });
  const rule = (id, x, y, w, h = 2, color = P.rule) => box(id, { position: 'absolute', left: x, top: y, width: w, height: h, backgroundColor: color });
  const head = (x, y, dir, color, len = 18, half = 10) => {
    const [ux, uy] = { right: [1, 0], left: [-1, 0], up: [0, -1], down: [0, 1] }[dir];
    vector.push(`<polygon points="${x},${y} ${x - ux * len - uy * half},${y - uy * len - ux * half} ${x - ux * len + uy * half},${y - uy * len + ux * half}" fill="${color}"/>`);
  };
  const arrow = (x0, y0, x1, y1, color = P.accent, width = 4) => {
    const dir = x1 > x0 ? 'right' : x1 < x0 ? 'left' : y1 > y0 ? 'down' : 'up';
    const ex = x1 - Math.sign(x1 - x0) * 18, ey = y1 - Math.sign(y1 - y0) * 18;
    vector.push(`<line x1="${x0}" y1="${y0}" x2="${ex}" y2="${ey}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`);
    head(x1, y1, dir, color);
  };
  const segment = (x0, y0, x1, y1, color = P.accent, width = 4) => vector.push(`<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`);
  const chrome = () => [
    one('eyebrow', M, 42, 1400, 38, f.eyebrow, { ...ty.label, color: P.muted, letterSpacing: 1.5 }),
    one('title', M, 94, W - 2 * M, 190, f.title, ty.headline),
    ...(f.subtitle ? [one('subtitle', M, 288, W - 2 * M, 46, f.subtitle, { ...ty.subhead, color: P.muted })] : []),
    rule('header_rule', M, 340, W - 2 * M),
    rule('footer_rule', M, 990, W - 2 * M),
    one('footer', M, 1005, 1500, 36, f.footer, { ...ty.body, color: P.muted }),
    one('page', 1630, 1005, 202, 36, `${pad(f.slide)} / 10`, { ...ty.label, color: P.muted, textAlign: 'right' }, { justifyContent: 'flex-end' })
  ];
  const scene = content => {
    const ink = node('img', 'vector_layer', { position: 'absolute', left: 0, top: 0, width: W, height: H }, undefined, {
      src: b64(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${vector.join('')}</svg>`, 'image/svg+xml')
    });
    return box('canvas', { position: 'relative', width: W, height: H, backgroundColor: P.ground, fontFamily: TY.family, overflow: 'hidden' }, [ink, ...content, ...chrome()]);
  };
  return { f, P, TY, S, PX, texts, containers, sizes, graphics, node, box, at, T, ty, one, panel, rule, arrow, segment, head, scene };
}

async function loadPng(relative) {
  const resolved = path.resolve(ROOT, relative);
  assert.ok(resolved.startsWith(ROOT + path.sep), 'asset must stay inside the example');
  const bytes = await fs.readFile(resolved);
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${relative} is not PNG`);
  assert.equal(bytes.readUInt32BE(16), 1000); assert.equal(bytes.readUInt32BE(20), 1000);
  return { src: b64(bytes, 'image/png'), sha256: sha256(bytes) };
}

async function buildScene(f) {
  const b = makeBuilder(f), c = [];
  const { P, PX, ty } = b;

  if (f.layout === 'title') {
    c.push(b.at('statement_box', M, 392, 1320, { height: 220, flexDirection: 'column', gap: 12 }, f.statement.map((text, i) =>
      b.T(`statement_${i}`, text, { ...ty.headline, color: i === 1 ? P.accent : P.ink }, 'statement_box'))));
    c.push(b.panel('command_panel', M, 700, 1260, 130, P.accentSoft, P.accent));
    c.push(b.one('command_label', 116, 720, 1170, 36, f.commandLabel, { ...ty.label, color: P.accent }));
    c.push(b.one('command', 116, 770, 1170, 40, f.command, { ...ty.body, color: P.ink }));
    c.push(b.one('outputs_title', 1450, 410, 350, 44, f.outputsTitle, { ...ty.label, color: P.muted }));
    f.outputs.forEach((text, i) => {
      const y = 500 + i * 105;
      c.push(b.one(`output_${i}`, 1450, y, 350, 48, text, ty.subhead));
      c.push(b.rule(`output_rule_${i}`, 1450, y + 62, 350));
    });
  } else if (f.layout === 'reroll') {
    const xs = [88, 700, 1312], y = 390, w = 520, h = 470;
    f.panels.forEach((p, i) => {
      const x = xs[i];
      c.push(b.panel(`reroll_panel_${i}`, x, y, w, h, i === 0 ? P.accentSoft : P.panel, i === 0 ? P.accent : P.rule));
      c.push(b.one(`reroll_label_${i}`, x + 24, y + 22, w - 48, 36, p.label, { ...ty.label, color: i === 0 ? P.accent : P.muted }));
      c.push(b.one(`reroll_headline_${i}`, x + 24, y + 92, w - 48, 68, p.headline, { ...ty.subhead, fontWeight: 700 }));
      c.push(b.panel(`reroll_art_box_${i}`, x + 24, y + 180, w - 48, 100, P.soft));
      c.push(b.one(`reroll_art_${i}`, x + 40, y + 208, w - 80, 44, p.art, { ...ty.label, color: i === 0 ? P.ink : P.accent, textAlign: 'center' }, { justifyContent: 'center' }));
      c.push(b.one(`reroll_items_${i}`, x + 24, y + 304, w - 48, 38, p.items, { ...ty.body, color: i === 0 ? P.muted : P.accent, textAlign: 'center' }, { justifyContent: 'center' }));
      c.push(b.one(`reroll_note_${i}`, x + 24, y + 374, w - 48, 62, p.note, { ...ty.body, textAlign: 'center' }, { justifyContent: 'center' }));
      if (i < 2) b.arrow(x + w + 12, y + h / 2, xs[i + 1] - 12, y + h / 2);
    });
    c.push(b.one('reroll_takeaway', M, 900, W - 2 * M, 48, f.takeaway, { ...ty.subhead, color: P.accent, textAlign: 'center' }, { justifyContent: 'center' }));
  } else if (f.layout === 'split') {
    c.push(b.rule('split_rule', 936, 390, 2, 500));
    const columns = [
      { x: 88, w: 760, prefix: 'ai', title: f.aiTitle, caption: f.aiCaption, items: f.aiItems, color: P.accent },
      { x: 1040, w: 792, prefix: 'engine', title: f.engineTitle, caption: f.engineCaption, items: f.engineItems, color: P.ink }
    ];
    for (const col of columns) {
      c.push(b.one(`${col.prefix}_title`, col.x, 390, col.w, 108, col.title, { ...ty.headline, color: col.color }));
      c.push(b.one(`${col.prefix}_caption`, col.x, 500, col.w, 46, col.caption, ty.subhead));
      col.items.forEach((text, i) => {
        const y = 590 + i * 88;
        c.push(b.one(`${col.prefix}_item_${i}`, col.x, y, col.w, 48, text, ty.label));
        c.push(b.rule(`${col.prefix}_item_rule_${i}`, col.x, y + 60, col.w));
      });
    }
    c.push(b.one('split_handoff', M, 900, W - 2 * M, 48, f.handoff, { ...ty.subhead, textAlign: 'center' }, { justifyContent: 'center' }));
  } else if (f.layout === 'system') {
    const inputX = 60, inputW = 480, ys = [400, 520, 640, 760];
    c.push(b.one('inputs_title', inputX, 360, inputW, 32, f.inputsTitle, { ...ty.label, color: P.muted }));
    f.inputs.forEach((item, i) => {
      const y = ys[i];
      c.push(b.panel(`input_panel_${i}`, inputX, y, inputW, 100, i === 0 ? P.accentSoft : P.panel, i === 0 ? P.accent : P.rule));
      c.push(b.one(`input_title_${i}`, inputX + 18, y + 10, inputW - 36, 34, item.title, ty.label));
      c.push(b.one(`input_caption_${i}`, inputX + 18, y + 50, inputW - 36, 42, item.caption, ty.body));
      if (i > 0) b.arrow(inputX + inputW + 10, y + 50, 628, y + 50, P.ink, 3);
    });
    b.arrow(300, 502, 300, 518, P.accent, 3);
    c.push(b.panel('render_panel', 640, 400, 650, 420, P.soft, P.ink));
    c.push(b.one('render_title', 668, 422, 594, 46, f.renderTitle, { ...ty.subhead, fontWeight: 700 }));
    f.renderItems.forEach((text, i) => c.push(b.one(`render_item_${i}`, 668, 492 + i * 58, 594, 40, text, ty.label)));
    c.push(b.one('render_note', 668, 746, 594, 54, f.renderNote, ty.body));
    c.push(b.panel('outputs_panel', 1390, 400, 470, 420));
    c.push(b.one('outputs_title', 1418, 422, 414, 42, f.outputsTitle, { ...ty.subhead, fontWeight: 700 }));
    f.formats.forEach((text, i) => c.push(b.one(`format_${i}`, 1418, 488 + i * 54, 414, 38, text, ty.label)));
    c.push(b.one('manifest_title', 1418, 716, 414, 36, f.manifestTitle, { ...ty.label, color: P.accent }));
    c.push(b.one('manifest_body', 1418, 760, 414, 42, f.manifestBody, ty.body));
    b.arrow(1302, 610, 1378, 610, P.ink, 4);
    c.push(b.panel('catalog_panel', 640, 850, 650, 90, P.accentSoft, P.accent));
    c.push(b.one('catalog_title', 664, 860, 602, 32, f.catalogTitle, { ...ty.label, color: P.accent }));
    c.push(b.one('catalog_body', 664, 898, 602, 34, f.catalogBody, ty.body));
    b.arrow(965, 848, 965, 824, P.accent, 3);
  } else if (f.layout === 'workflow') {
    const y = 430, w = 260, h = 220, xs = f.stages.map((_, i) => 80 + i * 300);
    f.stages.forEach((stage, i) => {
      const x = xs[i];
      c.push(b.panel(`workflow_stage_${i}`, x, y, w, h, i === 0 ? P.accentSoft : i === 5 ? P.soft : P.panel, i === 0 ? P.accent : P.rule));
      c.push(b.one(`workflow_actor_${i}`, x + 18, y + 18, w - 36, 30, stage.actor, { ...ty.body, color: i === 0 ? P.accent : P.muted }));
      c.push(b.one(`workflow_title_${i}`, x + 18, y + 64, w - 36, 40, stage.title, ty.label));
      c.push(b.one(`workflow_caption_${i}`, x + 18, y + 120, w - 36, 82, stage.caption, ty.body));
      if (i < f.stages.length - 1) b.arrow(x + w + 6, y + h / 2, xs[i + 1] - 6, y + h / 2, P.ink, 3);
    });
    const lastCx = xs[5] + w / 2, editCx = xs[2] + w / 2;
    b.segment(lastCx, 662, lastCx, 744); b.segment(lastCx, 744, editCx, 744); b.arrow(editCx, 744, editCx, 654, P.accent, 4);
    c.push(b.one('workflow_loop_label', 960, 690, 520, 36, f.loopLabel, { ...ty.body, color: P.accent, textAlign: 'center' }, { justifyContent: 'center' }));
    c.push(b.one('workflow_takeaway', M, 850, W - 2 * M, 54, f.takeaway, { ...ty.subhead, textAlign: 'center' }, { justifyContent: 'center' }));
  } else if (f.layout === 'commands') {
    f.commands.forEach((command, i) => {
      const y = 366 + i * 84;
      c.push(b.one(`command_number_${i}`, M, y, 54, 40, `${i + 1}`, { ...ty.label, color: P.accent }));
      c.push(b.one(`demo_command_${i}`, 160, y, 1672, 72, command, { ...ty.body, color: P.ink }));
      if (i < f.commands.length - 1) c.push(b.rule(`command_rule_${i}`, 160, y + 66, 1672, 1));
    });
    c.push(b.one('demo_watch', M, 900, W - 2 * M, 54, f.watch, { ...ty.subhead, color: P.accent, textAlign: 'center' }, { justifyContent: 'center' }));
  } else if (f.layout === 'comparison') {
    const before = await loadPng(f.beforeImage), after = await loadPng(f.afterImage);
    const images = [
      { id: 'before', x: 360, src: before.src, digest: before.sha256, label: f.beforeLabel },
      { id: 'after', x: 1080, src: after.src, digest: after.sha256, label: f.afterLabel }
    ];
    for (const image of images) {
      c.push(b.panel(`${image.id}_frame`, image.x - 8, 352, 496, 496, P.panel, P.rule));
      c.push(b.node('img', `${image.id}_image`, { position: 'absolute', left: image.x, top: 360, width: 480, height: 480 }, undefined, { src: image.src }));
      c.push(b.one(`${image.id}_label`, image.x - 80, 852, 640, 36, image.label, { ...ty.label, textAlign: 'center' }, { justifyContent: 'center' }));
      b.graphics.push({ id: image.id, visibleWidth: 480, visibleHeight: 480, sourceSha256: image.digest });
    }
    b.arrow(900, 600, 1020, 600, P.accent, 5);
    c.push(b.one('comparison_proof', M, 894, W - 2 * M, 32, f.proofLabel, { ...ty.label, color: P.accent, textAlign: 'center' }, { justifyContent: 'center' }));
    c.push(b.one('comparison_hash', M, 928, W - 2 * M, 28, f.hash, { ...ty.body, color: P.ink, textAlign: 'center' }, { justifyContent: 'center' }));
    c.push(b.one('comparison_timing', M, 958, W - 2 * M, 28, f.timing, { ...ty.body, textAlign: 'center' }, { justifyContent: 'center' }));
  } else if (f.layout === 'recipes') {
    const xs = [88, 700, 1312], y = 400, w = 520, h = 240;
    f.stages.forEach((stage, i) => {
      const x = xs[i];
      c.push(b.panel(`recipe_stage_${i}`, x, y, w, h, i === 2 ? P.accentSoft : P.panel, i === 2 ? P.accent : P.rule));
      c.push(b.one(`recipe_stage_title_${i}`, x + 24, y + 22, w - 48, 36, stage.title, { ...ty.label, color: i === 2 ? P.accent : P.muted }));
      c.push(b.one(`recipe_stage_code_${i}`, x + 24, y + 82, w - 48, 48, stage.code, { ...ty.subhead, fontWeight: 700 }));
      c.push(b.one(`recipe_stage_caption_${i}`, x + 24, y + 150, w - 48, 68, stage.caption, ty.body));
      if (i < 2) b.arrow(x + w + 12, y + h / 2, xs[i + 1] - 12, y + h / 2, P.ink, 3);
    });
    f.rules.forEach((text, i) => {
      const y = 710 + i * 80;
      c.push(b.one(`recipe_rule_number_${i}`, 100, y, 48, 42, `${i + 1}`, { ...ty.label, color: P.accent }));
      c.push(b.one(`recipe_rule_${i}`, 170, y, 1640, 64, text, ty.subhead));
      if (i < 2) c.push(b.rule(`recipe_rule_line_${i}`, 170, y + 66, 1640, 1));
    });
  } else if (f.layout === 'designmd') {
    const xs = [50, 535, 880, 1370], ws = [400, 260, 420, 480], y = 380, h = 160;
    f.flow.forEach((stage, i) => {
      const x = xs[i], w = ws[i];
      c.push(b.panel(`design_flow_${i}`, x, y, w, h, i === 1 ? P.accentSoft : P.panel, i === 1 ? P.accent : P.rule));
      c.push(b.one(`design_flow_title_${i}`, x + 18, y + 24, w - 36, 40, stage.title, { ...ty.label, color: i === 1 ? P.accent : P.ink, textAlign: 'center' }, { justifyContent: 'center' }));
      c.push(b.one(`design_flow_caption_${i}`, x + 18, y + 88, w - 36, 56, stage.caption, { ...ty.body, textAlign: 'center' }, { justifyContent: 'center' }));
      if (i < 3) b.arrow(x + w + 10, y + h / 2, xs[i + 1] - 10, y + h / 2, P.ink, 3);
    });
    c.push(b.panel('blocked_panel', 535, 580, 765, 100, P.accentSoft, P.accent));
    c.push(b.one('blocked_title', 557, 592, 720, 32, f.blockedTitle, { ...ty.label, color: P.accent }));
    c.push(b.one('blocked_body', 557, 632, 720, 38, f.blockedBody, ty.body));
    b.arrow(665, 542, 665, 578, P.accent, 3);
    c.push(b.one('story_title', M, 716, W - 2 * M, 36, f.storyTitle, { ...ty.label, color: P.muted }));
    const storyXs = [88, 700, 1312];
    f.story.forEach((stage, i) => {
      const x = storyXs[i];
      c.push(b.panel(`story_panel_${i}`, x, 770, 520, 160, i === 2 ? P.soft : P.panel));
      c.push(b.one(`story_stage_title_${i}`, x + 24, 792, 472, 44, stage.title, { ...ty.subhead, fontWeight: 700, color: i === 1 ? P.accent : P.ink }));
      c.push(b.one(`story_stage_caption_${i}`, x + 24, 850, 472, 62, stage.caption, ty.body));
      if (i < 2) b.arrow(x + 532, 850, storyXs[i + 1] - 12, 850, P.ink, 3);
    });
  } else if (f.layout === 'close') {
    c.push(b.rule('close_split', 960, 390, 2, 480));
    c.push(b.one('modes_title', 88, 380, 760, 44, f.modesTitle, ty.subhead));
    c.push(b.one('takeaways_title', 1060, 380, 772, 44, f.takeawaysTitle, ty.subhead));
    f.modes.forEach((mode, i) => {
      const y = 470 + i * 130;
      c.push(b.one(`mode_title_${i}`, 88, y, 760, 38, mode.title, { ...ty.label, color: i === 0 ? P.accent : P.ink }));
      c.push(b.one(`mode_caption_${i}`, 88, y + 46, 760, 56, mode.caption, ty.body));
      c.push(b.rule(`mode_rule_${i}`, 88, y + 108, 760, 1));
    });
    f.takeaways.forEach((text, i) => {
      const y = 470 + i * 130;
      c.push(b.one(`takeaway_number_${i}`, 1060, y, 54, 44, `${i + 1}`, { ...ty.label, color: P.accent }));
      c.push(b.one(`takeaway_${i}`, 1130, y, 702, 100, text, ty.subhead));
    });
    c.push(b.one('closing', M, 900, W - 2 * M, 48, f.closing, { ...ty.subhead, fontWeight: 700, color: P.accent, textAlign: 'center' }, { justifyContent: 'center' }));
  } else {
    throw new Error(`unknown layout ${f.layout}`);
  }

  return { scene: b.scene(c), builder: b };
}

const summaries = [], allFindings = [];
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  context.setDefaultTimeout(30000);
  for (const file of fixtureFiles) {
    const fixturePath = path.join(FIXTURE_DIR, file);
    const fixture = JSON.parse(await fs.readFile(fixturePath, 'utf8'));
    const { scene, builder: b } = await buildScene(fixture);
    const result = await renderSatori(scene, fonts, W, H, fixture.theme.type.family, { measureWords: true });
    const chromiumResult = await renderPlaywright(context, scene, fonts, W, H, fixture.theme.type.family);
    const findings = [];
    const finding = (kind, detail) => findings.push({ kind, ...detail });
    const titleBox = result.textBoxes.title;
    const maxGraphic = Math.max(0, ...b.graphics.map(g => g.visibleHeight));
    const capPx = CAP_RATIO * b.PX.headline;
    const as12 = {
      S: b.S,
      px: b.PX,
      distinctSizes: [...b.sizes].sort((a, z) => z - a),
      headlinePctOfS: b.TY.pct.headline,
      headlinePctOfWidth: titleBox ? +(titleBox.width / W).toFixed(3) : null,
      bodyPctOfS: b.TY.pct.body,
      headlineToBody: +(b.PX.headline / b.PX.body).toFixed(2),
      headlineCapHeightPx: +capPx.toFixed(1),
      largestVisibleGraphicHeightPx: maxGraphic,
      maxGraphicToCap: +(maxGraphic / capPx).toFixed(2),
      iconToLabelRatio: null,
      exceptions: fixture.as12Exceptions ?? []
    };
    if (b.sizes.size > 4) finding('as12', { reason: 'more than four font sizes', sizes: as12.distinctSizes });
    if (b.TY.pct.headline < 0.07 || b.TY.pct.headline > 0.10) finding('as12', { reason: 'headline outside 7–10% of S' });
    if (b.TY.pct.body < 0.018) finding('as12', { reason: 'body below 1.8% of S' });
    if (as12.headlineToBody < 4) finding('as12', { reason: 'headline:body below 4:1' });
    if (!(as12.headlinePctOfWidth >= 0.5 && as12.headlinePctOfWidth <= 0.85)) finding('as12', { reason: 'headline width outside 50–85% of canvas', measured: as12.headlinePctOfWidth });
    if (as12.maxGraphicToCap > 3 && !(fixture.as12Exceptions ?? []).some(e => e.rule === 'AS-12 rule 5')) finding('as12', { reason: 'graphic exceeds 3× headline cap height', measured: as12.maxGraphicToCap });
    if (result.missingSegments.length) finding('glyphs', { backend: 'satori', segments: result.missingSegments });
    if (!chromiumResult.fontLoaded) finding('glyphs', { backend: 'chromium', reason: 'font did not load' });

    const finite = r => r && [r.x, r.y, r.width, r.height].every(Number.isFinite) && r.width > 0 && r.height > 0;
    const inside = (r, outer, tolerance = 1) => r.x >= outer.x - tolerance && r.y >= outer.y - tolerance && r.x + r.width <= outer.x + outer.width + tolerance && r.y + r.height <= outer.y + outer.height + tolerance;
    const canvas = { x: 0, y: 0, width: W, height: H };
    const backends = { satori: { text: result.textBoxes, bounds: result.bounds }, chromium: { text: chromiumResult.textBoxes, bounds: chromiumResult.bounds } };
    for (const [backend, evidence] of Object.entries(backends)) {
      for (const id of b.texts) {
        const text = evidence.text[id];
        if (!finite(text)) { finding('clippings', { backend, id, reason: 'missing or non-finite text geometry' }); continue; }
        if (!inside(text, canvas, 0.5)) finding('clippings', { backend, id, reason: 'text outside canvas', box: text });
        const containerId = b.containers[id];
        if (containerId) {
          const region = evidence.bounds[containerId];
          if (!finite(region)) finding('clippings', { backend, id, reason: 'missing container geometry', containerId });
          else if (!inside(text, region, 1.5)) finding('clippings', { backend, id, reason: 'text escapes container', containerId, box: text, region });
        }
        if (text.longestWord > text.width + 0.5) finding('clippings', { backend, id, reason: 'unbreakable word exceeds text box', longestWord: text.longestWord, width: text.width });
      }
      for (let i = 0; i < b.texts.length; i++) for (let j = i + 1; j < b.texts.length; j++) {
        const a = evidence.text[b.texts[i]], z = evidence.text[b.texts[j]];
        if (finite(a) && finite(z) && Math.min(a.x + a.width, z.x + z.width) - Math.max(a.x, z.x) > 1 && Math.min(a.y + a.height, z.y + z.height) - Math.max(a.y, z.y) > 1) {
          finding('overlaps', { backend, ids: [b.texts[i], b.texts[j]], boxes: [a, z] });
        }
      }
    }
    for (const id of b.texts) {
      const text = chromiumResult.textBoxes[id];
      if (finite(text) && (text.scrollWidth > text.clientWidth + 1 || text.scrollHeight > text.clientHeight + 1)) finding('clippings', { backend: 'chromium', id, reason: 'text scroll overflow', box: text });
    }
    assert.equal(result.png.readUInt32BE(16), W); assert.equal(result.png.readUInt32BE(20), H);
    assert.equal(chromiumResult.png.readUInt32BE(16), W); assert.equal(chromiumResult.png.readUInt32BE(20), H);

    const name = `slide-${pad(fixture.slide)}`;
    await fs.writeFile(path.join(OUT, `${name}.png`), result.png);
    await fs.writeFile(path.join(OUT, `${name}-chromium.png`), chromiumResult.png);
    await fs.writeFile(path.join(OUT, `${name}.svg`), result.svg);
    const receipt = {
      slide: fixture.slide,
      fixture: `fixtures/${file}`,
      layout: fixture.layout,
      renderer: 'Shared tools/render.mjs renderSatori + renderPlaywright; vendored Barlow Condensed',
      width: W,
      height: H,
      textIds: b.texts,
      graphics: b.graphics,
      as12,
      checks: {
        overlaps: findings.filter(f => f.kind === 'overlaps').length,
        clippings: findings.filter(f => f.kind === 'clippings').length,
        unsupportedGlyphFindings: findings.filter(f => f.kind === 'glyphs').length,
        as12Findings: findings.filter(f => f.kind === 'as12').length
      },
      artifactDigests: { png: sha256(result.png), chromiumPng: sha256(chromiumResult.png), svg: sha256(result.svg) },
      findings
    };
    await fs.writeFile(path.join(OUT, 'receipts', `${name}.json`), JSON.stringify(receipt, null, 2) + '\n');
    summaries.push(receipt);
    allFindings.push(...findings.map(f => ({ slide: fixture.slide, ...f })));
    console.log(`${findings.length ? 'FAIL' : 'PASS'} ${name}: ${b.texts.length} text ids; overlaps=${receipt.checks.overlaps}; clippings=${receipt.checks.clippings}; AS-12=${receipt.checks.as12Findings}`);
  }
  await context.close();
} finally {
  await browser.close();
}
const verification = {
  deck: 'Stop Re-Rolling the Whole Image',
  issue: 'HiQS-Labs/XYZ-layout-engine#69',
  renderer: 'Example-local scene composition through shared renderSatori + renderPlaywright',
  runtime: process.version,
  width: W,
  height: H,
  slideCount: summaries.length,
  slides: summaries.map(r => ({ slide: r.slide, layout: r.layout, checks: r.checks, as12: r.as12, artifactDigests: r.artifactDigests })),
  findings: allFindings
};
await fs.writeFile(path.join(OUT, 'verification.json'), JSON.stringify(verification, null, 2) + '\n');
assert.equal(summaries.length, 10);
assert.equal(allFindings.length, 0, JSON.stringify(allFindings, null, 2));
console.log(`PASS: 10 slides at ${W}x${H} in both backends; zero overlaps, clippings, unsupported glyphs or AS-12 findings.`);
