/** Trusted example recipe. Copy is in deck.json and visual tokens are in theme.json. */
export const width = 1280;
export const height = 720;
export const fontFamily = 'Barlow Condensed';
const S = Math.min(width, height);
const margin = 80;
const content = width - 2 * margin;
const headlineWidth = 1040;

function box(id, x, y, width, style, children) {
  return { type: 'div', props: { id, style: { display: 'flex', position: 'absolute',
    left: x, top: y, width, ...style }, children } };
}

export function sceneFor(slide, theme, family = fontFamily, slideArt, background, nutritionPreview, bookendQr) {
  const { palette, type } = theme;
  const cover = slide.layout === 'bookend';
  const ink = cover ? palette.coverInk : palette.ink;
  const accent = cover ? palette.coverAccent : palette.accent;
  const muted = cover ? palette.coverInk : palette.muted;
  const textIds = [];
  const text = (id, value, role, x, y, w, color = ink, weightOverride) => {
    const { pct, weight, lineHeight } = type[role];
    textIds.push(id);
    return box(id + '-slot', x, y, w, {}, {
      type: 'span', props: { id, style: { fontSize: Math.round(S * pct),
        fontWeight: weightOverride ?? weight, lineHeight, color }, children: value }
    });
  };
  const rule = (id, x, y, w, color = palette.rule) =>
    box(id, x, y, w, { height: 2, backgroundColor: color });

  const nodes = [
    text('section', slide.section, 'label', margin, cover ? 144 : 56, content, accent),
    text('headline', slide.title, 'headline', margin, cover ? 200 : 88, headlineWidth),
  ];
  if (slide.lead) nodes.push(text('lead', slide.lead, 'section', margin,
    cover ? 352 : slide.layout === 'render-loop' ? 175 : 248, content, muted, type.body.weight));

  if (cover) {
    nodes.push({ type: 'img', props: { id: 'bookend-qr', src: bookendQr, width: 184, height: 184,
      style: { position: 'absolute', right: margin, bottom: 36 } } });
    if (slideArt && !background) {
      nodes.unshift({
        type: 'img',
        props: {
          id: 'bookend-art', src: slideArt, width: 392, height: 392,
          style: { position: 'absolute', left: 814, top: 74 },
        },
      });
    } else if (palette.coverSun && !background) {
      nodes.unshift(box('cover-sun', 968, 112, 216, {
        height: 216, borderRadius: 108, backgroundColor: palette.coverSun,
      }));
    }
    nodes.push(rule('divider', margin, 472, content, palette.coverRule),
      text('note', slide.note, 'section', margin, 504, content, accent));
    if (slide.profile) nodes.push(text('profile', slide.profile.replace(/^https:\/\/www\./, ''),
      'label', margin, 574, content, accent));
  } else if (slide.layout === 'render-loop') {
    // Edges are scene geometry so labels and the retry path stay themeable in both renderers.
    const line = (id, x, y, w, h = 3, color = accent) =>
      box(id, x, y, w, { height: h, backgroundColor: color });
    const arrow = (id, x, y, angle) => box(id, x - 6, y - 6, 12, {
      height: 12, borderTop: '3px solid ' + accent, borderRight: '3px solid ' + accent,
      transform: 'rotate(' + angle + 'deg)',
    });
    slide.inputs.forEach(({ title, body }, i) => {
      const y = 248 + i * 150;
      nodes.push(text('input-' + i, title, 'section', margin, y, 232),
        text('input-detail-' + i, body, 'body', margin, y + 40, 222, muted),
        line('input-edge-' + i, 316, y + 20, 27));
    });
    nodes.push(line('join', 341, 268, 3, 153), line('joined-edge', 341, 287, 43),
      arrow('joined-tip', 380, 288, 45));
    slide.stages.forEach(({ title, body }, i) => {
      const y = 247 + i * 152;
      nodes.push(text('stage-' + i, title, 'section', 405, y, 320),
        text('stage-detail-' + i, body, 'body', 405, y + 40, 310, muted));
    });
    nodes.push(line('measure-edge', 425, 333, 3, 48), arrow('measure-tip', 426, 378, 135),
      line('retry-base', 659, 416, 64), line('retry-stem', 720, 264, 3, 155),
      line('retry-back', 657, 263, 66), arrow('retry-tip', 660, 264, 225),
      text('retry', slide.retry, 'label', 735, 308, 162, accent),
      line('pass-edge', 661, 459, 222), arrow('pass-tip', 880, 460, 45),
      text('pass', slide.output, 'label', 748, 423, 148, accent),
      { type: 'img', props: { id: 'nutrition-preview', src: nutritionPreview, width: 234,
        height: 234, style: { position: 'absolute', left: 908, top: 238 } } },
      text('artifact', slide.artifact, 'section', 908, 486, 287),
      text('receipt', slide.receipt, 'label', 908, 532, 290, muted));
  } else if (slide.layout === 'sponsors') {
    slide.items.forEach(({ title, body }, index) => {
      const y = 260 + index * 154;
      nodes.push(rule('credit-rule-' + index, margin, y, 565),
        text('credit-role-' + index, title, 'label', margin, y + 16, 565, accent),
        text('credit-name-' + index, body, 'section', margin, y + 55, 575, ink, type.body.weight));
    });
    nodes.push({ type: 'img', props: { id: 'coffee-mug', src: slideArt, width: 430, height: 430,
      style: { position: 'absolute', left: 715, top: 156 } } });
  } else if (slide.layout === 'list') {
    slide.items.forEach(({ title }, index) => {
      nodes.push(text('item-' + index, title, 'section', margin, 336 + index * 74, 640));
    });
  } else if (slide.layout === 'rows') {
    slide.items.forEach(({ title, body }, index) => {
      const y = 320 + index * 88;
      nodes.push(rule('rule-' + index, margin, y, content),
        text('item-' + index, title, 'section', margin, y + 16, 304),
        text('body-' + index, body, 'body', margin + 336, y + 18, 730, muted));
    });
  } else if (slide.layout === 'split' || slide.layout === 'flow') {
    const flow = slide.layout === 'flow';
    const gap = flow ? 32 : 80;
    const span = (content + gap) / slide.items.length;
    slide.items.forEach(({ title, body }, index) => {
      const x = margin + index * span;
      const w = span - gap;
      nodes.push(rule('rule-' + index, x, 352, w, index === 0 ? accent : palette.rule),
        text('item-' + index, title, 'section', x, 376, w),
        text('body-' + index, body, 'body', x, 432, w - (flow ? 16 : 64), muted));
      if (flow && index < slide.items.length - 1) {
        nodes.push(text('arrow-' + index, '>', 'label', x + w + 8, 382, 24, accent));
      }
    });
  } else {
    throw new Error('Unknown slide layout: ' + slide.layout);
  }

  if (!cover && slide.note) {
    nodes.push(text('note', slide.note, 'label', margin, 624, content, accent, theme.fontProfile === 'neo-mirai' ? undefined : type.body.weight));
  }

  if (background) {
    const wash = cover
      ? 'linear-gradient(90deg, rgba(16,39,37,0.99) 0%, rgba(16,39,37,0.97) 48%, rgba(16,39,37,0.06) 86%)'
      : slide.layout === 'list'
        ? 'linear-gradient(90deg, rgba(245,235,214,0.55), rgba(245,235,214,0) 66%)'
        : 'linear-gradient(180deg, rgba(245,235,214,0.46), rgba(245,235,214,0.94) 47%, rgba(245,235,214,0.88) 85%, rgba(245,235,214,0.24))';
    nodes.unshift(
      { type: 'img', props: { src: background, width, height, style: { position: 'absolute', left: 0, top: 0 } } },
      box('background-wash', 0, 0, width, { height, backgroundImage: wash }),
    );
  }
  const scene = { type: 'div', props: { id: 'canvas', style: {
    display: 'flex', position: 'relative', width, height, fontFamily: family,
    backgroundColor: cover ? palette.cover : palette.paper,
  }, children: nodes } };
  return { scene, textIds };
}
