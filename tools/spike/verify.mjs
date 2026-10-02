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
  // Normalize CRLF to LF in case of git checkout conversion differences
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
  console.log('VERDICT: PASS');
  console.log('Basis: All Phase 1 assertions passed for fixture structure, assets, and scene generation.');
}

verify().catch(err => {
  console.error('\nVERDICT: FAIL');
  console.error('Basis:', err.message);
  process.exit(1);
});
