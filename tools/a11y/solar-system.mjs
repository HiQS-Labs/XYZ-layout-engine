// Accessibility spec for the solar-system recipe (tools/pdf.mjs). The orbit map carries the overview; each planet's
// artwork is described from the fixture, and the asteroid belt is read between Mars and Jupiter, where it sits.
const list = a => a.slice(0, -1).join(', ') + ' and ' + a.at(-1);

export function accessibility(fixture) {
  const { planets, sun, belt, galaxy } = fixture;
  const names = planets.map(p => p.name), mars = planets.findIndex(p => p.id === 'mars');
  const ordered = [...names.slice(0, mars + 1), belt.name.toLowerCase().replace(/^main /, 'the main '), ...names.slice(mars + 1)];
  return {
    title: fixture.title,
    lang: 'en',
    headings: {
      title: 'h1', intro_heading: 'h2', sun_name: 'h3', belt_name: 'h3', galaxy_title: 'h2',
      ...Object.fromEntries(planets.map(p => [`${p.id}_name`, 'h3']))
    },
    images: {
      starfield: '', label_leaders: '', galaxy_marker: '',
      orbits: `Schematic map of the Solar System: the ${sun.name} at the center and ${planets.length} planets on elliptical orbits around it, from the inside out ${list(ordered)}. Sizes, distances and positions are illustrative, not to scale.`,
      asset_sun: `Artist's impression of the ${sun.name}, a glowing orange star.`,
      'asset_asteroid-belt': `A ring of scattered asteroids circling between the orbits of Mars and Jupiter.`,
      'asset_milky-way': `Artist's impression of ${galaxy.name}, a spiral galaxy seen face-on, with a marker on the ${galaxy.location} showing where the Solar System is.`,
      ...Object.fromEntries(planets.map(p => [`asset_${p.id}`, `Artist's impression of ${p.name}: ${p.detail.charAt(0).toLowerCase() + p.detail.slice(1)}.`]))
    },
    order: [
      'header', 'intro', 'orbits', 'asset_sun', 'label_sun',
      ...planets.flatMap((p, i) => [`asset_${p.id}`, `label_${p.id}`, ...(i === mars ? ['asset_asteroid-belt', 'label_belt'] : [])]),
      'galaxy_panel', 'asset_milky-way', 'galaxy_location', 'footer', '*'
    ]
  };
}
