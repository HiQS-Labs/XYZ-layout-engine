// Accessibility spec for the recursive-process recipe (tools/pdf.mjs). The diagram's structure (hexagons, arrows,
// the A1 -> B1 -> C1 formulas, the column numbers and the B2 -> B3 -> B4 trail) is described in one alt text, so those
// visual label fragments are hidden from assistive technology; every labelled stage is then read in cycle order.
const ART = {
  activating_event_art: 'Two people shaking hands, with a speech bubble above them.',
  consequence_1_art: 'A person beside a broken chain link and a minus sign.',
  consequence_2_art: 'Two people shaking hands, with a plus sign.',
  examination_art: 'Two gears with a question mark above them.',
  revised_philosophy_art: 'A shield showing the sun rising over water.'
};
const low = s => s.charAt(0).toLowerCase() + s.slice(1);

export function accessibility(fixture) {
  const [e1, e2] = fixture.events, [s1, s2] = fixture.states, [c1, c2] = fixture.consequences;
  const { examination: d, outcome: o } = fixture.branch, trail = fixture.trail;
  const structure = [
    `Flow diagram in four numbered columns, after the ABC model: A is an activating event, B a belief, C a consequence, D an examination and E the outcome.`,
    `Column 1: ${low(e1.label)} A1 leads to ${low(s1.label)} B1, which leads to ${low(c1.label)} C1 (${low(c1.caption).replace(/\.$/, '')}).`,
    `Column 2: that consequence becomes the ${low(e2.label)} A2, leading to ${low(s2.label)} B2 and ${low(c2.label)} C2 (${low(c2.caption).replace(/\.$/, '')}).`,
    `Column 3: B2 branches up to ${low(d.label)} D and then ${low(o.label)} E.`,
    `Column 4: a wide arrow labelled ${low(trail.label)} runs right over a chain of later beliefs, ${trail.tokens.slice(0, -1).join(', ')} and onward, each with a small head silhouette.`
  ].join(' ');
  return {
    title: fixture.title,
    lang: 'en',
    headings: {
      title: 'h1',
      event_1_label: 'h2', state_1_label: 'h2', consequence_1_label: 'h2',
      event_2_label: 'h2', state_2_label: 'h2', consequence_2_label: 'h2',
      examination_label: 'h2', outcome_label: 'h2', trail_label: 'h2'
    },
    images: { structure, ...ART },
    artifacts: ['stage_1_num', 'stage_2_num', 'stage_3_num', 'stage_4_num'],
    unnamedText: 'artifact',
    unnamedImages: 'decorative',
    order: [
      'header', 'structure',
      'event_1', 'activating_event_art', 'state_1', 'consequence_1', 'consequence_1_art',
      'event_2', 'state_2', 'consequence_2', 'consequence_2_art',
      'examination', 'examination_art', 'outcome', 'revised_philosophy_art', 'trail', 'footer', '*'
    ]
  };
}
