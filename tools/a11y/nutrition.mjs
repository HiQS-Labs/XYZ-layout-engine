// Accessibility spec for the nutrition recipe (tools/pdf.mjs). Alt text is keyed by illustration id, so a fixture
// that uses new artwork fails until its description is written here. Benefit icons and the leaf/heart ornaments
// repeat or decorate adjacent text, so they are decorative.
const ART = {
  leaf_glow: 'A large, glowing green leaf.',
  balance_scale: 'A balance scale holding leafy greens, avocado, nuts and blueberries on one side and grains, chickpeas and salmon on the other.',
  skip_spike: 'A soda cup, a bag of chips and a glazed donut behind a red "no" symbol.',
  parfait_jar: 'A glass jar of yogurt parfait layered with oats, strawberries and blueberries.',
  snack_container: 'A clear snack container filled with green grapes and mixed nuts.',
  chicken_wrap: 'A wrap filled with chicken, tomatoes and lettuce.',
  water_bottle: 'A green reusable water bottle.'
};
const alt = id => { if (!ART[id]) throw new Error(`accessibility: no alt text for nutrition illustration ${id}`); return ART[id]; };
const sentence = s => s.toLowerCase().replace(/(^|[.!?]\s+)([a-z])/g, (m, p, c) => p + c.toUpperCase());

export function accessibility(fixture) {
  const { header, hero, items, benefitsPanel } = fixture.sections;
  return {
    title: `${sentence(header.headline)} Nutrition infographic`,
    lang: 'en',
    headings: {
      header_headline: 'h1',
      ...Object.fromEntries(hero.callouts.map(c => [`${c.id}_title`, 'h2'])),
      ...Object.fromEntries(items.map(i => [`${i.id}_title`, 'h2']))
    },
    images: {
      hero_img: alt(hero.illustrationId),
      ...Object.fromEntries(hero.callouts.map(c => [`${c.id}_img`, alt(c.illustrationId)])),
      ...Object.fromEntries(items.map(i => [`${i.id}_img`, alt(i.illustrationId)])),
      ...Object.fromEntries(benefitsPanel.map(b => [`${b.id}_icon`, '']))
    },
    unnamedImages: 'decorative'
  };
}
