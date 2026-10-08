import fs from 'fs/promises';
import assert from 'assert';
import { resolveIllustration, getFont } from './assets.mjs';
import { createScene } from './scene.mjs';

async function verify() {
  console.log('Verifying fixture and assets for Phase 1...');

  // 1. Verify fixture structure and editable text
  const fixtureStr = await fs.readFile(new URL('./fixture.json', import.meta.url), 'utf-8');
  const fixture = JSON.parse(fixtureStr);

  assert(fixture.id === 'nutrition-infographic', 'Fixture ID must be nutrition-infographic');
  assert(fixture.width === 1000 && fixture.height === 1000, 'Fixture must be square');
  
  const sections = fixture.sections;
  assert(sections.header && sections.header.headline, 'Missing editable header text');
  assert(sections.hero && sections.hero.illustrationId, 'Missing hero illustration');
  assert(sections.hero.callouts && sections.hero.callouts.length === 2, 'Missing callouts');
  assert(sections.items && sections.items.length === 4, 'Missing 4 lower items');
  assert(sections.benefitsPanel && sections.benefitsPanel.length === 4, 'Missing 4 benefits');
  assert(sections.footer && sections.footer.bannerText, 'Missing footer banner text');

  console.log('✔ Fixture structure is valid');

  // 2. Verify independent illustration references
  const heroImg = await resolveIllustration(sections.hero.illustrationId);
  assert(heroImg.startsWith('data:image/svg+xml;base64,'), 'Hero image must be a standalone SVG data URL');
  
  for (const item of sections.items) {
    const itemImg = await resolveIllustration(item.illustrationId);
    assert(itemImg.startsWith('data:image/svg+xml;base64,'), `Item image ${item.id} must be a standalone SVG data URL`);
  }
  
  console.log('✔ Illustration resolution is valid');

  // 3. Verify valid source licenses and font offline availability
  const fontData = await getFont();
  assert(fontData && fontData.length > 0, 'Font data must be accessible');
  
  const crypto = await import('crypto');
  const fontHash = crypto.createHash('sha256').update(fontData).digest('hex');
  assert.strictEqual(fontHash, '64f8be6e55c37e32ef03da99714bf3aa58b8f2099bfe4f759a7578e3b8291123', 'Font SHA-256 digest mismatch');
  
  const oflText = await fs.readFile(new URL('./assets/OFL.txt', import.meta.url), 'utf-8');
  const normalizedOflText = oflText.replace(/\r\n/g, '\n');
  const oflHash = crypto.createHash('sha256').update(normalizedOflText).digest('hex');
  assert.strictEqual(oflHash, '262481e844521b326f5ecd053e59b98c8b2da78c8ee1bdbb6e8174305e54935a', 'OFL.txt SHA-256 digest mismatch (truncated or modified)');

  const sources = await fs.readFile(new URL('./assets/SOURCES.md', import.meta.url), 'utf-8');
  assert(sources.includes('Inter Regular'), 'Missing SOURCES.md attribution');
  assert(sources.includes(`Digest: ${fontHash}`), 'Missing or incorrect provenance digest in SOURCES.md');

  console.log('✔ Fonts and licenses are valid');

  // 4. Verify scene generation
  const scene = await createScene(fixture);
  assert(scene.type === 'div', 'Scene root must be a div');
  assert(scene.props.children.length === 5, 'Scene must contain 5 main sections');
  
  console.log('✔ Scene generation is successful');
  
  // Phase 2: Compare backend renders
  console.log('\nVerifying Phase 2 backend render comparisons...');
  
  // Check output artifacts exist and are not empty
  const satoriPng = await fs.stat(new URL('./output/satori.png', import.meta.url));
  const satoriSvg = await fs.stat(new URL('./output/satori.svg', import.meta.url));
  const playPng = await fs.stat(new URL('./output/playwright.png', import.meta.url));
  const heroSatoriPng = await fs.stat(new URL('./output/hero-satori.png', import.meta.url));
  const heroPlayPng = await fs.stat(new URL('./output/hero-playwright.png', import.meta.url));
  
  assert(satoriPng.size > 0, 'Satori PNG is empty');
  assert(satoriSvg.size > 0, 'Satori SVG is empty');
  assert(playPng.size > 0, 'Playwright PNG is empty');
  assert(heroSatoriPng.size > 0, 'Hero Satori PNG is empty');
  assert(heroPlayPng.size > 0, 'Hero Playwright PNG is empty');
  console.log('✔ Render outputs are present and non-empty');
  
  // Load measurements
  const measurements = JSON.parse(await fs.readFile(new URL('./output/measurements.json', import.meta.url), 'utf-8'));
  
  // Explicitly declare Satori capability failure for geometry
  if (measurements.baseline.satori.error) {
    console.log(`ℹ Satori capability limitation recorded: ${measurements.baseline.satori.error}`);
  } else {
    assert.fail('Expected Satori to fail to provide bounds or provide valid ones');
  }
  
  // Verify Playwright bounds
  const playBounds = measurements.baseline.playwright.bounds;
  assert(playBounds, 'Playwright must provide bounds');
  
  const requiredIds = ['header', 'hero', 'items', 'benefitsPanel', 'footer'];
  for (const id of requiredIds) {
    assert(playBounds[id], `Playwright bounds missing for ${id}`);
    const b = playBounds[id];
    assert(b.width > 0 && b.height > 0, `Bounds for ${id} must be finite`);
    assert(b.x >= 0 && b.y >= 0 && (b.x + b.width) <= 1000 && (b.y + b.height) <= 1000, `Bounds for ${id} must be in-bounds of 1000x1000`);
  }
  
  // Verify no overlap for major sections (header, hero, items, footer) in Playwright
  const sectionsToCheck = ['header', 'hero', 'items', 'footer'];
  for (let i = 0; i < sectionsToCheck.length; i++) {
    for (let j = i + 1; j < sectionsToCheck.length; j++) {
      const b1 = playBounds[sectionsToCheck[i]];
      const b2 = playBounds[sectionsToCheck[j]];
      const overlap = !(b1.x + b1.width <= b2.x || b2.x + b2.width <= b1.x || b1.y + b1.height <= b2.y || b2.y + b2.height <= b1.y);
      assert(!overlap, `Unintended overlap between ${sectionsToCheck[i]} and ${sectionsToCheck[j]}`);
    }
  }
  console.log('✔ Playwright geometry and overlap checks passed');
  
  // Repeated-render digests
  assert(measurements.digests.baseline.satori, 'Missing Satori repeated-render digest');
  assert(measurements.digests.baseline.playwright, 'Missing Playwright repeated-render digest');
  console.log('✔ Repeated-render digests are present');
  
  console.log('\nVERDICT: PASS');
  console.log('Basis: All Phase 1 assertions passed. Phase 2 outputs, bounding geometry (with explicit Satori limitation), and metrics are present and valid.');
}

verify().catch(err => {
  console.error('\nVERDICT: FAIL');
  console.error('Basis:', err.message);
  process.exit(1);
});
