// Scene builders for the Phase 0 spike. One generic element tree (Satori-compatible props) is the
// single source for both backends; render.mjs serializes the same tree to HTML for Chromium.
//
// Every text-bearing node carries an `id` so both backends can report labeled geometry. `sizes`
// maps a text id to a font size (px) and is the only knob the bounded fitting loop turns.
import { resolveIllustration } from './assets.mjs';

// Nutrition infographic layout follows PROJECT/2-WORKING/layout-engine-reference.png: centred headline
// with leaf ornaments, two illustrated callouts flanking the glowing leaf, four captioned items, a
// vertical benefits panel, and a footer pill. Default font sizes per text id; fitting may lower them.
const ITEM_IDS = ['item_1', 'item_2', 'item_3', 'item_4'];
const BENEFIT_IDS = ['benefit_1', 'benefit_2', 'benefit_3', 'benefit_4'];
export const NUTRITION_TEXT_IDS = [
  'header_headline', 'header_subtitle', 'header_caption',
  'callout_1_title', 'callout_1_text', 'callout_2_title', 'callout_2_text',
  ...ITEM_IDS.flatMap(i => [`${i}_title`, `${i}_caption`]),
  ...BENEFIT_IDS,
  'footer_text', 'footer_tagline'
];
export const HERO_TEXT_IDS = ['hero_eyebrow', 'hero_headline', 'hero_tagline', 'hero_price', 'hero_cta'];

// Decorative/containment overlaps that the overlap check must ignore: parent → children.
export const NUTRITION_CONTAINMENT = {
  header: ['header_row', 'header_subtitle', 'header_caption'],
  header_row: ['header_headline'],
  hero: ['callout_1', 'hero_img', 'callout_2'],
  callout_1: ['callout_1_img', 'callout_1_title', 'callout_1_text'],
  callout_2: ['callout_2_img', 'callout_2_title', 'callout_2_text'],
  lower: ['items', 'benefitsPanel'],
  items: ITEM_IDS,
  ...Object.fromEntries(ITEM_IDS.map(i => [i, [`${i}_img`, `${i}_title`, `${i}_caption`]])),
  benefitsPanel: BENEFIT_IDS.map(b => `${b}_row`),
  ...Object.fromEntries(BENEFIT_IDS.map(b => [`${b}_row`, [`${b}_icon`, b]])),
  footer: ['footer_text', 'footer_tagline']
};
export const HERO_CONTAINMENT = {
  hero_copy: ['hero_eyebrow', 'hero_headline', 'hero_tagline', 'hero_actions'],
  hero_actions: ['hero_price', 'hero_cta'],
  hero_visual: ['hero_product']
};

export const DEFAULT_SIZES = {
  header_headline: 50, header_subtitle: 24, header_caption: 18,
  callout_1_title: 18, callout_1_text: 15, callout_2_title: 18, callout_2_text: 15,
  ...Object.fromEntries(ITEM_IDS.flatMap(i => [[`${i}_title`, 17], [`${i}_caption`, 14]])),
  ...Object.fromEntries(BENEFIT_IDS.map(b => [b, 13])),
  footer_text: 20, footer_tagline: 15,
  hero_eyebrow: 20, hero_headline: 64, hero_tagline: 26, hero_price: 40, hero_cta: 24
};

function text(type, id, content, style, sizes) {
  return {
    type,
    props: {
      id,
      style: { margin: 0, fontSize: sizes[id] ?? DEFAULT_SIZES[id], ...style },
      children: content
    }
  };
}
const img = (id, src, style) => ({ type: 'img', props: { ...(id ? { id } : {}), src, style: { objectFit: 'contain', ...style } } });

export async function createScene(fixture, sizes = {}) {
  const s = { ...DEFAULT_SIZES, ...sizes };
  const { palette } = fixture.theme;
  const { header, hero, items, benefitsPanel, footer } = fixture.sections;
  const R = id => resolveIllustration(id);
  const [ornament, heroImage, footerOrnament, footerEnd] = await Promise.all([R(header.ornamentId), R(hero.illustrationId), R(footer.ornamentId), R(footer.endIconId)]);
  const calloutImages = await Promise.all(hero.callouts.map(c => R(c.illustrationId)));
  const itemImages = await Promise.all(items.map(i => R(i.illustrationId)));
  const iconImages = await Promise.all(benefitsPanel.map(b => R(b.iconId)));
  // Line-height 1.25: Inter Bold's glyph box exceeds a 1.15 line box in Chromium (scrollHeight >
  // clientHeight), which font-size fitting cannot cure (the ratio is size-independent).
  const title = { color: palette.primary, fontWeight: 700, textAlign: 'center', lineHeight: 1.25 };
  const body = { color: palette.muted, textAlign: 'center', lineHeight: 1.3 };

  const callout = (c, i) => ({
    type: 'div',
    props: {
      id: c.id,
      style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 300, gap: 8 },
      children: [
        img(`${c.id}_img`, calloutImages[i], { width: 280, height: 210 }),
        text('span', `${c.id}_title`, c.title, { ...title, maxWidth: 300 }, s),
        text('span', `${c.id}_text`, c.text, { ...body, maxWidth: 230 }, s)
      ]
    }
  });

  return {
    type: 'div',
    props: {
      id: 'canvas',
      style: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: fixture.width, height: fixture.height,
        backgroundColor: fixture.theme.background, fontFamily: 'Inter', color: palette.text,
        padding: '28px 30px 24px', gap: 12
      },
      children: [
        {
          type: 'div',
          props: {
            id: 'header',
            style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 940, gap: 6 },
            children: [
              {
                type: 'div',
                props: {
                  id: 'header_row',
                  style: { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 22, width: 940 },
                  children: [
                    img(null, ornament, { width: 40, height: 40 }),
                    text('h1', 'header_headline', header.headline, { ...title, letterSpacing: 1, maxWidth: 780 }, s),
                    img(null, ornament, { width: 40, height: 40, transform: 'scaleX(-1)' })
                  ]
                }
              },
              text('h2', 'header_subtitle', header.subtitle, { color: palette.primary, fontWeight: 400, textAlign: 'center', maxWidth: 820 }, s),
              header.caption ? text('p', 'header_caption', header.caption, { ...body, maxWidth: 600 }, s) : null
            ]
          }
        },
        {
          type: 'div',
          props: {
            id: 'hero',
            // flex:1 + minHeight 0 gives this row whatever height is left; the leaf stretches to fill it
            // (objectFit contain), so longer header/caption copy shrinks the leaf instead of overflowing.
            style: { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: 940, flex: 1, minHeight: 0 },
            children: [callout(hero.callouts[0], 0), img('hero_img', heroImage, { width: 320, height: '100%' }), callout(hero.callouts[1], 1)]
          }
        },
        {
          type: 'div',
          props: {
            id: 'lower',
            style: { display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', width: 940 },
            children: [
              {
                type: 'div',
                props: {
                  id: 'items',
                  style: { display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 10, width: 700 },
                  children: items.map((item, i) => ({
                    type: 'div',
                    props: {
                      id: item.id,
                      style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 167, gap: 5 },
                      children: [
                        img(`${item.id}_img`, itemImages[i], { width: 160, height: 170 }),
                        text('span', `${item.id}_title`, item.title, { ...title, maxWidth: 167 }, s),
                        text('span', `${item.id}_caption`, item.caption, { ...body, maxWidth: 160 }, s)
                      ]
                    }
                  }))
                }
              },
              {
                type: 'div',
                props: {
                  id: 'benefitsPanel',
                  style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, width: 220, padding: '14px 16px', border: `2px solid ${palette.panelBorder}`, borderRadius: 16, backgroundColor: palette.panelFill },
                  children: benefitsPanel.map((b, i) => ({
                    type: 'div',
                    props: {
                      id: `${b.id}_row`,
                      style: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 },
                      children: [
                        img(`${b.id}_icon`, iconImages[i], { width: 44, height: 44 }),
                        text('span', b.id, b.text, { color: palette.primary, fontWeight: 700, lineHeight: 1.2, maxWidth: 120 }, s)
                      ]
                    }
                  }))
                }
              }
            ]
          }
        },
        {
          type: 'div',
          props: {
            id: 'footer',
            style: { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, width: 880, padding: '10px 24px', border: `2px solid ${palette.panelBorder}`, borderRadius: 999, backgroundColor: palette.panelFill },
            children: [
              img(null, footerOrnament, { width: 28, height: 28 }),
              text('span', 'footer_text', footer.bannerText, { color: palette.primary, fontWeight: 700, letterSpacing: 0.5 }, s),
              { type: 'div', props: { style: { width: 2, height: 26, backgroundColor: palette.panelBorder } } },
              text('span', 'footer_tagline', footer.tagline, { color: palette.muted }, s),
              img(null, footerEnd, { width: 22, height: 22 })
            ]
          }
        }
      ]
    }
  };
}

// Small structured product-hero smoke fixture (PRD: "product-hero smoke check"), landscape 1200x630.
export async function createHeroScene(hero, sizes = {}) {
  const s = { ...DEFAULT_SIZES, ...sizes };
  const product = await resolveIllustration(hero.product.illustrationId);
  const { palette } = hero.theme;
  return {
    type: 'div',
    props: {
      id: 'canvas',
      style: {
        display: 'flex', flexDirection: 'row', alignItems: 'center',
        width: hero.width, height: hero.height,
        backgroundColor: hero.theme.background, fontFamily: 'Inter', color: palette.primary,
        padding: 60, gap: 40
      },
      children: [
        {
          type: 'div',
          props: {
            id: 'hero_copy',
            style: { display: 'flex', flexDirection: 'column', width: 660, gap: 18 },
            children: [
              text('span', 'hero_eyebrow', hero.product.eyebrow, { color: palette.accent, letterSpacing: 2 }, s),
              text('h1', 'hero_headline', hero.product.headline, { maxWidth: 660, lineHeight: 1.2 }, s),
              text('p', 'hero_tagline', hero.product.tagline, { color: palette.muted, maxWidth: 660, lineHeight: 1.3 }, s),
              {
                type: 'div',
                props: {
                  id: 'hero_actions',
                  style: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 24, marginTop: 10 },
                  children: [
                    text('span', 'hero_price', hero.product.price, { color: palette.badge, fontWeight: 'bold' }, s),
                    text('span', 'hero_cta', hero.product.cta, { padding: '12px 28px', backgroundColor: palette.accent, color: '#052e16', borderRadius: 999 }, s)
                  ]
                }
              }
            ]
          }
        },
        {
          type: 'div',
          props: {
            id: 'hero_visual',
            style: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 380, height: 510, backgroundColor: '#1e293b', borderRadius: 24 },
            children: [{ type: 'img', props: { id: 'hero_product', src: product, style: { width: 320, height: 320 } } }]
          }
        }
      ]
    }
  };
}
