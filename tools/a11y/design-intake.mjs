// Accessibility spec for the design-intake recipe (tools/pdf.mjs). The recipe already requires alt text on every
// image element; the first display-role text is the H1 and later display texts are H2s. Elements are absolutely
// placed, so the reading order is visual: top to bottom, then left to right.
const sentence = s => s.charAt(0) + s.slice(1).toLowerCase();

export function accessibility(fixture) {
  const els = fixture.elements, display = els.filter(e => e.type === 'text' && e.role === 'display');
  if (!display.length) throw new Error('accessibility: design-intake needs a display-role text to serve as the H1');
  const region = e => e.type === 'text' ? `intake_region_${e.id}` : `intake_image_${e.id}`;
  const visual = els.filter(e => e.type !== 'rect').sort((a, b) => a.y - b.y || a.x - b.x);
  return {
    title: sentence(display[0].text),
    lang: 'en',
    headings: Object.fromEntries(display.map((e, i) => [`intake_text_${e.id}`, i ? 'h2' : 'h1'])),
    images: Object.fromEntries(els.filter(e => e.type === 'image').map(e => [`intake_image_${e.id}`, e.alt])),
    order: [...visual.map(region), '*']
  };
}
