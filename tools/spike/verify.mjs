// Machine acceptance gate for the Phase 0 spike (`pnpm run spike:verify`).
// Phase 1: fixture, assets, licenses, scene. Phase 2: render outputs, dimensions, geometry, overlap,
// text fitting evidence, script-capability records, runtime record, and repeated-render digests.
// A backend that fails a mandatory check is reported as HELD, never silently skipped. The gate
// itself fails only when required evidence is missing, malformed, or internally inconsistent.
import fs from 'fs/promises';
import assert from 'assert';
import crypto from 'crypto';
import { resolveIllustration, getFont } from './assets.mjs';
import { createScene, createHeroScene, NUTRITION_TEXT_IDS, HERO_TEXT_IDS, NUTRITION_CONTAINMENT, HERO_CONTAINMENT } from './scene.mjs';

const out = rel => new URL(`./output/${rel}`, import.meta.url);
const sha256 = buf => crypto.createHash('sha256').update(buf).digest('hex');
const pngSize = buf => {
  assert.strictEqual(buf.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'not a PNG');
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
};
const finite = b => ['x', 'y', 'width', 'height'].every(k => Number.isFinite(b[k]));
const inside = (b, w, h) => b.x >= -0.5 && b.y >= -0.5 && b.x + b.width <= w + 0.5 && b.y + b.height <= h + 0.5;
const overlaps = (a, b) => !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);
const BACKENDS = ['satori', 'playwright'];

async function phase1(fixture) {
  console.log('Verifying fixture and assets for Phase 1...');
  assert(fixture.id === 'nutrition-infographic', 'Fixture ID must be nutrition-infographic');
  assert(fixture.width === 1000 && fixture.height === 1000, 'Fixture must be square');
  const s = fixture.sections;
  assert(s.header && s.header.headline, 'Missing editable header text');
  assert(s.hero && s.hero.illustrationId, 'Missing hero illustration');
  assert(s.hero.callouts && s.hero.callouts.length === 2, 'Missing callouts');
  assert(s.items && s.items.length === 4, 'Missing 4 lower items');
  assert(s.benefitsPanel && s.benefitsPanel.length === 4, 'Missing 4 benefits');
  assert(s.footer && s.footer.bannerText, 'Missing footer banner text');
  console.log('✔ Fixture structure is valid');

  const heroImg = await resolveIllustration(s.hero.illustrationId);
  assert(heroImg.startsWith('data:image/svg+xml;base64,'), 'Hero image must be a standalone SVG data URL');
  for (const item of s.items) {
    const img = await resolveIllustration(item.illustrationId);
    assert(img.startsWith('data:image/svg+xml;base64,'), `Item image ${item.id} must be a standalone SVG data URL`);
  }
  console.log('✔ Illustration resolution is valid');

  const fontData = await getFont();
  assert(fontData && fontData.length > 0, 'Font data must be accessible');
  const fontHash = sha256(fontData);
  assert.strictEqual(fontHash, '64f8be6e55c37e32ef03da99714bf3aa58b8f2099bfe4f759a7578e3b8291123', 'Font SHA-256 digest mismatch');
  const oflText = (await fs.readFile(new URL('./assets/OFL.txt', import.meta.url), 'utf-8')).replace(/\r\n/g, '\n');
  assert.strictEqual(sha256(oflText), '262481e844521b326f5ecd053e59b98c8b2da78c8ee1bdbb6e8174305e54935a', 'OFL.txt SHA-256 digest mismatch (truncated or modified)');
  const sources = await fs.readFile(new URL('./assets/SOURCES.md', import.meta.url), 'utf-8');
  assert(sources.includes('Inter Regular'), 'Missing SOURCES.md attribution');
  assert(sources.includes(`Digest: ${fontHash}`), 'Missing or incorrect provenance digest in SOURCES.md');
  console.log('✔ Fonts and licenses are valid');

  const scene = await createScene(fixture);
  assert(scene.type === 'div', 'Scene root must be a div');
  assert(scene.props.children.length === 5, 'Scene must contain 5 main sections');
  console.log('✔ Scene generation is successful');
}

function checkGeometry(label, c, w, h, textIds, containment, requiredSections) {
  const b = c.bounds;
  for (const id of requiredSections) assert(b[id], `${label}: bounds missing for ${id}`);
  for (const [id, r] of Object.entries(b)) {
    assert(finite(r), `${label}: non-finite bounds for ${id}`);
    assert(r.width > 0 && r.height > 0, `${label}: empty bounds for ${id}`);
    assert(inside(r, w, h), `${label}: ${id} is out of the ${w}x${h} canvas: ${JSON.stringify(r)}`);
  }
  // Unintended overlap: any two labeled boxes that overlap and are not in a declared parent/child
  // (containment) relationship. Declared decorative overlaps would be listed the same way.
  const related = new Set();
  const descend = (p, acc) => { for (const k of containment[p] || []) { acc.push(k); descend(k, acc); } return acc; };
  for (const p of Object.keys(containment)) for (const k of descend(p, [])) { related.add(`${p}|${k}`); related.add(`${k}|${p}`); }
  related.add('canvas|*');
  const ids = Object.keys(b).filter(id => id !== 'canvas');
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const [x, y] = [ids[i], ids[j]];
    if (related.has(`${x}|${y}`)) continue;
    assert(!overlaps(b[x], b[y]), `${label}: unintended overlap between ${x} and ${y}`);
  }
  // Text evidence: every text id the scene emitted must have backend-owned fitting evidence.
  // Text evidence: every text id the scene emitted must have backend-owned fitting evidence, and the
  // recorded overflow flags must be re-derivable from the recorded boxes/regions/scroll metrics.
  const parentOf = {};
  for (const [p, kids] of Object.entries(containment)) for (const k of kids) parentOf[k] = p;
  const contained = (a, o) => a.x >= o.x - 0.5 && a.y >= o.y - 0.5 && a.x + a.width <= o.x + o.width + 0.5 && a.y + a.height <= o.y + o.height + 0.5;
  const canvas = { x: 0, y: 0, width: w, height: h };
  for (const id of textIds) {
    const t = c.text[id];
    assert(t, `${label}: no text evidence for ${id}`);
    if (!t.present) { assert(id === 'header_caption', `${label}: text ${id} missing from render`); continue; }
    assert(finite(t.box) && finite(t.region), `${label}: non-finite text box for ${id}`);
    assert(typeof t.text === 'string' && t.text.length > 0, `${label}: rendered text missing for ${id}`);
    const region = b[parentOf[id]] || canvas;
    assert.deepStrictEqual(t.region, region, `${label}: ${id} region does not match recorded parent bounds`);
    let overflow = !contained(t.box, region) || !contained(t.box, canvas);
    assert.strictEqual(t.insideRegion, contained(t.box, region), `${label}: ${id} insideRegion flag disagrees with boxes`);
    assert.strictEqual(t.insideCanvas, contained(t.box, canvas), `${label}: ${id} insideCanvas flag disagrees with boxes`);
    if (t.scrollMetrics) {
      const sm = t.scrollMetrics;
      const so = sm.scrollWidth > sm.clientWidth + 1 || sm.scrollHeight > sm.clientHeight + 1;
      assert.strictEqual(t.scrollOverflow, so, `${label}: ${id} scrollOverflow flag disagrees with scroll metrics`);
      overflow = overflow || so;
    }
    assert.strictEqual(t.overflow, overflow, `${label}: ${id} overflow flag disagrees with recomputed overflow`);
  }
  const f = c.fitting;
  assert(typeof f.fit === 'boolean' && Number.isInteger(f.iterations) && f.iterations <= 10 && Array.isArray(f.steps), `${label}: fitting record malformed`);
  assert.strictEqual(f.steps.length, f.iterations + 1, `${label}: fitting steps do not match iteration count`);
  const lastOverflow = Object.entries(c.text).filter(([, t]) => t.present && t.overflow).map(([id]) => id).sort();
  assert.deepStrictEqual(lastOverflow, [...f.unresolved].sort(), `${label}: unresolved disagrees with recomputed text overflow`);
  assert.deepStrictEqual([...f.steps[f.steps.length - 1].overflowing].sort(), lastOverflow, `${label}: last fitting step disagrees with text evidence`);
  assert.strictEqual(f.fit, lastOverflow.length === 0, `${label}: fit flag disagrees with unresolved overflow`);
}

async function phase2(fixture) {
  console.log('\nVerifying Phase 2 backend render comparisons...');
  const m = JSON.parse(await fs.readFile(out('measurements.json'), 'utf-8'));
  const rt = JSON.parse(await fs.readFile(out('runtime.json'), 'utf-8'));
  const hero = JSON.parse(await fs.readFile(new URL('./hero-fixture.json', import.meta.url), 'utf-8'));
  const W = fixture.width, H = fixture.height, HW = hero.width, HH = hero.height;

  // 1. Outputs exist, are non-empty PNGs with the declared dimensions, and hash to the recorded digests.
  const expect = {
    baseline: { satori: ['satori.png', W, H], playwright: ['playwright.png', W, H] },
    override: { satori: ['override-satori.png', W, H], playwright: ['override-playwright.png', W, H] },
    hero: { satori: ['hero-satori.png', HW, HH], playwright: ['hero-playwright.png', HW, HH] }
  };
  for (const [caseName, per] of Object.entries(expect)) for (const [b, [file, w, h]] of Object.entries(per)) {
    const c = m.cases?.[caseName]?.[b];
    assert(c, `measurements missing case ${caseName}/${b}`);
    const buf = await fs.readFile(out(file));
    assert(buf.length > 0, `${file} is empty`);
    assert.deepStrictEqual(pngSize(buf), { width: w, height: h }, `${file} must be ${w}x${h}`);
    assert.strictEqual(sha256(buf), c.sha256, `${file} does not match the recorded digest`);
    assert.strictEqual(c.png, `output/${file}`, `${caseName}/${b} png path mismatch`);
  }
  const svg = await fs.readFile(out('satori.svg'), 'utf-8');
  assert(svg.includes('<svg') && svg.includes(`viewBox="0 0 ${W} ${H}"`), 'satori.svg missing or wrong viewBox');
  assert(m.svgExport.playwright.startsWith('unsupported'), 'browser SVG export must be declared unsupported, not faked');
  for (const b of BACKENDS) {
    const pa = m.probeArtifacts?.[b];
    assert(pa && pa.png === `output/probe-${b}.png`, `probeArtifacts missing for ${b}`);
    const buf = await fs.readFile(out(`probe-${b}.png`));
    assert(buf.length > 0, `probe-${b}.png is empty`);
    assert.deepStrictEqual(pngSize(buf), pa.pngSize, `probe-${b}.png dimensions do not match the record`);
    assert.strictEqual(sha256(buf), pa.sha256, `probe-${b}.png does not match the recorded digest`);
  }
  console.log('✔ Render outputs present, correctly sized, and digest-bound');

  // 2. Geometry, overlap, and text-fitting evidence per case per backend.
  const sections = ['header', 'hero', 'items', 'benefitsPanel', 'footer'];
  for (const b of BACKENDS) {
    checkGeometry(`baseline/${b}`, m.cases.baseline[b], W, H, NUTRITION_TEXT_IDS, NUTRITION_CONTAINMENT, sections);
    checkGeometry(`override/${b}`, m.cases.override[b], W, H, NUTRITION_TEXT_IDS, NUTRITION_CONTAINMENT, sections);
    checkGeometry(`hero/${b}`, m.cases.hero[b], HW, HH, HERO_TEXT_IDS, HERO_CONTAINMENT, ['hero_copy', 'hero_visual', 'hero_product']);
    if (b === 'playwright') for (const c of ['baseline', 'override', 'hero']) {
      const d = m.cases[c][b].documentOverflow; const cw = c === 'hero' ? HW : W, chh = c === 'hero' ? HH : H;
      assert(d && Number.isFinite(d.scrollWidth) && Number.isFinite(d.scrollHeight) && d.canvas, `${c}/playwright: documentOverflow record missing`);
      const actual = d.scrollWidth > cw || d.scrollHeight > chh || d.canvas.scrollWidth > cw || d.canvas.scrollHeight > chh;
      assert.strictEqual(d.overflows, actual, `${c}/playwright: documentOverflow flag disagrees with measured dimensions`);
      assert.strictEqual(actual, false, `${c}/playwright: document overflows the ${cw}x${chh} canvas`);
    }
  }
  // Override case must carry the prescribed long copy and differ from baseline.
  assert.strictEqual(m.override.applied['sections.header.headline'], 'Fuel your whole day with balanced nutrition and lasting energy');
  assert.strictEqual(m.override.applied['sections.items[0].caption'], 'Fresh whole foods, easy to carry, wherever your busy day takes you');
  for (const b of BACKENDS) {
    assert.strictEqual(m.cases.override[b].text.header_headline.text, m.override.applied["sections.header.headline"], `${b}: override headline not rendered`);
    assert.strictEqual(m.cases.override[b].text.item_1_caption.text, m.override.applied["sections.items[0].caption"], `${b}: override caption not rendered`);
    assert.notStrictEqual(m.cases.override[b].sha256, m.cases.baseline[b].sha256, `${b}: override render identical to baseline`);
  }
  console.log('✔ Geometry, overlap, and bounded text-fitting evidence are consistent for both backends');

  // 3. Repeated-render digests.
  for (const b of BACKENDS) {
    const d = m.digests[b];
    assert(d && /^[0-9a-f]{64}$/.test(d.baseline) && /^[0-9a-f]{64}$/.test(d.repeat), `${b}: digests malformed`);
    assert.strictEqual(d.baseline, m.cases.baseline[b].sha256, `${b}: digest record disagrees with case record`);
    assert.strictEqual(d.deterministic, d.baseline === d.repeat, `${b}: deterministic flag inconsistent`);
  }
  console.log('✔ Repeated-render digests recorded and internally consistent');

  // 4. Script capability probes are observations with evidence, not constants.
  const okObs = new Set(['rendered_by_pinned_font', 'uncovered_by_pinned_font', 'rendered_via_system_fallback']);
  for (const id of ['english', 'latin_accented', 'cjk', 'emoji']) {
    const p = m.probes[id];
    assert(p, `probe ${id} missing`);
    assert(okObs.has(p.satori.observation) && Array.isArray(p.satori.uncoveredSegments), `satori probe ${id} malformed`);
    assert.strictEqual(p.satori.observation === 'uncovered_by_pinned_font', p.satori.uncoveredSegments.length > 0, `satori probe ${id} observation disagrees with evidence`);
    assert(p.satori.layoutBox && finite(p.satori.layoutBox) && p.satori.layoutBoxNonEmpty === (p.satori.layoutBox.width > 0), `satori probe ${id} layout evidence malformed`);
    const mt = p.playwright.measureText;
    assert(okObs.has(p.playwright.observation) && mt && Number.isFinite(mt.pinnedFamilyWidth) && Number.isFinite(mt.fallbackOnlyWidth), `playwright probe ${id} malformed`);
    assert.strictEqual(mt.pinnedVsFallbackWidthsDiffer, Math.abs(mt.pinnedFamilyWidth - mt.fallbackOnlyWidth) > 0.01, `playwright probe ${id} width flag disagrees with widths`);
    // Chromium's observation is derived from the shared font's coverage (satori's segmenter), not from widths.
    assert.strictEqual(p.playwright.observation, p.satori.uncoveredSegments.length ? 'rendered_via_system_fallback' : 'rendered_by_pinned_font', `playwright probe ${id} observation disagrees with font coverage`);
    assert(p.playwright.layoutBox && finite(p.playwright.layoutBox) && p.playwright.layoutBoxNonEmpty === (p.playwright.layoutBox.width > 0), `playwright probe ${id} layout evidence malformed`);
  }
  assert(m.probes.english.mandatory === true, 'English probe must be mandatory');
  console.log('✔ Script capability probes carry per-backend evidence');

  // 5. Runtime record: versions, licenses with provenance, units, boundaries, samples, memory caveats.
  assert(rt.environment.node && rt.environment.cpu && rt.environment.totalMemoryBytes, 'runtime.environment incomplete');
  for (const k of ['satori', 'resvg_js', 'resvg_native_binding', 'playwright']) {
    const d = rt.dependencies[k];
    assert(d && d.verified === true && d.version && typeof d.license === 'string' && d.provenance && !d.error, `runtime.dependencies.${k} not read from its manifest: ${JSON.stringify(d)}`);
  }
  assert(rt.dependencies.resvg_native_binding.name === `@resvg/resvg-js-${process.platform}-${process.arch}`, 'native binding record is not for this platform');
  for (const d of rt.dependencies.transitive) assert(d.verified === true && d.version && typeof d.license === 'string' && !d.error, `transitive dependency not read: ${JSON.stringify(d)}`);
  for (const d of [...Object.values(rt.dependencies).filter(x => x && x.license), ...rt.dependencies.transitive]) assert(!/GPL/i.test(d.license || ''), `copyleft licence outside the PRD exception: ${d.name} ${d.license}`);
  const ch = rt.dependencies.chromium;
  assert(ch && ch.version && ch.title && ch.revision && typeof ch.license === 'string' && ch.licenseEvidenceLimit, 'chromium record incomplete (version/title/revision/license/evidence limit)');
  assert(Array.isArray(rt.licenseNotes) && rt.licenseNotes.length >= 4 && !rt.licenseNotes.some(n => /UNVERIFIED/.test(n)), `licenseNotes contain unverified entries: ${JSON.stringify(rt.licenseNotes)}`);
  assert(rt.stageBoundaries.importNote, 'stageBoundaries must disclose static imports preceding cold timers');
  assert(rt.units.time && rt.stageBoundaries.satori_warm && rt.stageBoundaries.playwright_warm && rt.memoryNotes.length >= 2, 'runtime units/boundaries/memory notes missing');
  for (const b of BACKENDS) {
    assert(Number.isFinite(rt[b].cold.totalMs), `${b}: cold timing missing`);
    assert(rt[b].warm.samples.length === 10 && rt[b].warm.samples.every(Number.isFinite), `${b}: ten warm samples required`);
    assert(rt[b].memory.nodeProcess.rss > 0, `${b}: memory record missing`);
  }
  console.log('✔ Runtime, dependency, license, and timing records are complete');

  // 6. Capability table and eligibility recomputed from the evidence above.
  const mandatory = ['englishReferenceText', 'baselineFit', 'longCopyFit', 'heroFit', 'heroCanvasExact', 'repeatDeterministic', 'labeledGeometry'];
  for (const b of BACKENDS) {
    const cap = m.capabilities[b];
    assert(cap, `capabilities missing for ${b}`);
    const recomputed = {
      englishReferenceText: m.probes.english[b].observation === 'rendered_by_pinned_font' && m.probes.english[b].layoutBoxNonEmpty === true && m.probes.english[b].layoutBox.width > 0 && m.probes.english[b].layoutBox.height > 0,
      baselineFit: m.cases.baseline[b].fitting.fit,
      longCopyFit: m.cases.override[b].fitting.fit,
      heroFit: m.cases.hero[b].fitting.fit,
      heroCanvasExact: m.cases.hero[b].pngSize.width === HW && m.cases.hero[b].pngSize.height === HH,
      repeatDeterministic: m.digests[b].deterministic,
      labeledGeometry: Object.keys(m.cases.baseline[b].bounds).length > 0
    };
    for (const k of mandatory) assert.strictEqual(cap[k], recomputed[k], `${b}: capability ${k} does not match evidence`);
    const failed = mandatory.filter(k => recomputed[k] !== true);
    assert.deepStrictEqual(cap.failedMandatory, failed, `${b}: failedMandatory inconsistent`);
    assert.strictEqual(cap.eligibleForRecommendation, failed.length === 0, `${b}: eligibleForRecommendation disagrees with mandatory failures`);
    assert.strictEqual(cap.status, failed.length ? 'held' : 'eligible', `${b}: status inconsistent`);
    assert.deepStrictEqual(cap.scripts, Object.fromEntries(['english', 'latin_accented', 'cjk', 'emoji'].map(id => [id, m.probes[id][b].observation])), `${b}: capability scripts disagree with probes`);
    console.log(`  ${b}: ${cap.status.toUpperCase()}${failed.length ? ' — failed ' + failed.join(', ') : ''}; scripts ${JSON.stringify(cap.scripts)}`);
  }
  const eligible = BACKENDS.filter(b => mandatory.every(k => m.capabilities[b][k] === true));
  assert.deepStrictEqual(m.selection.eligible, eligible, 'selection.eligible inconsistent with capabilities');
  assert.strictEqual(m.selection.status, eligible.length ? 'candidates' : 'BLOCKED', 'selection.status inconsistent');
  console.log(`✔ Capability table consistent; selection ${m.selection.status}${eligible.length ? ': ' + eligible.join(', ') : ''}`);
  return { eligible, m };
}

async function verify() {
  const fixture = JSON.parse(await fs.readFile(new URL('./fixture.json', import.meta.url), 'utf-8'));
  await phase1(fixture);
  const { eligible } = await phase2(fixture);
  console.log('\nVERDICT: PASS');
  console.log(`Basis: Phase 1 fixture/asset/license assertions and Phase 2 render, dimension, geometry, overlap, fitting, probe, runtime, and digest assertions all hold; backends eligible for recommendation: ${eligible.join(', ') || 'none (BLOCKED)'}. Human artwork acceptance remains pending.`);
}

verify().catch(err => {
  console.error('\nVERDICT: FAIL');
  console.error('Basis:', err.message);
  process.exit(1);
});
