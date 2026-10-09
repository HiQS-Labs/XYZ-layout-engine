// Scene builders for the Phase 0 spike. One generic element tree (Satori-compatible props) is the
// single source for both backends; render.mjs serializes the same tree to HTML for Chromium.
//
// Every text-bearing node carries an `id` so both backends can report labeled geometry. `sizes`
// maps a text id to a font size (px) and is the only knob the bounded fitting loop turns.
import { resolveIllustration } from './assets.mjs';

// Default font sizes per text id. Fitting may lower these; nothing else about layout changes.
export const NUTRITION_TEXT_IDS = [
  'header_headline', 'header_subtitle', 'header_caption',
  'callout_1', 'callout_2',
  'item_1_caption', 'item_2_caption', 'item_3_caption', 'item_4_caption',
  'benefit_1', 'benefit_2', 'benefit_3', 'benefit_4',
  'footer_text'
];
export const HERO_TEXT_IDS = ['hero_eyebrow', 'hero_headline', 'hero_tagline', 'hero_price', 'hero_cta'];

// Decorative/containment overlaps that the overlap check must ignore: parent → children.
export const NUTRITION_CONTAINMENT = {
  header: ['header_headline', 'header_subtitle', 'header_caption'],
  hero: ['callout_1', 'hero_img', 'callout_2'],
  items: ['item_1', 'item_2', 'item_3', 'item_4'],
  item_1: ['item_1_caption'], item_2: ['item_2_caption'], item_3: ['item_3_caption'], item_4: ['item_4_caption'],
  benefitsPanel: ['benefit_1', 'benefit_2', 'benefit_3', 'benefit_4'],
  footer: ['footer_text']
};
export const HERO_CONTAINMENT = {
  hero_copy: ['hero_eyebrow', 'hero_headline', 'hero_tagline', 'hero_actions'],
  hero_actions: ['hero_price', 'hero_cta'],
  hero_visual: ['hero_product']
};

export const DEFAULT_SIZES = {
  header_headline: 48, header_subtitle: 24, header_caption: 18,
  callout_1: 20, callout_2: 20,
  item_1_caption: 18, item_2_caption: 18, item_3_caption: 18, item_4_caption: 18,
  benefit_1: 18, benefit_2: 18, benefit_3: 18, benefit_4: 18,
  footer_text: 20,
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

export async function createScene(fixture, sizes = {}) {
  const s = { ...DEFAULT_SIZES, ...sizes };
  const heroImage = await resolveIllustration(fixture.sections.hero.illustrationId);
  const itemsImages = await Promise.all(
    fixture.sections.items.map(item => resolveIllustration(item.illustrationId))
  );
  const { palette } = fixture.theme;
  const header = fixture.sections.header;
  const [c1, c2] = fixture.sections.hero.callouts;

  return {
    type: 'div',
    props: {
      id: 'canvas',
      style: {
        display: 'flex', flexDirection: 'column',
        width: fixture.width, height: fixture.height,
        backgroundColor: fixture.theme.background, fontFamily: 'Inter', color: palette.text,
        padding: 40, gap: 20
      },
      children: [
        {
          type: 'div',
          props: {
            id: 'header',
            style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 920 },
            children: [
              text('h1', 'header_headline', header.headline, { color: palette.primary, textAlign: 'center', maxWidth: 920 }, s),
              text('h2', 'header_subtitle', header.subtitle, { textAlign: 'center', maxWidth: 920 }, s),
              header.caption
                ? text('p', 'header_caption', header.caption, { marginTop: 10, maxWidth: 600, textAlign: 'center' }, s)
                : null
            ]
          }
        },
        {
          type: 'div',
          props: {
            id: 'hero',
            style: { display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flex: 1 },
            children: [
              text('div', c1.id, c1.text, { padding: 10, backgroundColor: palette.secondary, borderRadius: 5, alignSelf: 'flex-start', marginTop: 20, maxWidth: 240 }, s),
              {
                type: 'img',
                props: { id: 'hero_img', src: heroImage, style: { width: 300, height: 300, margin: '0 20px' } }
              },
              text('div', c2.id, c2.text, { padding: 10, backgroundColor: palette.secondary, borderRadius: 5, alignSelf: 'flex-start', marginTop: 20, maxWidth: 240 }, s)
            ]
          }
        },
        {
          type: 'div',
          props: {
            id: 'items',
            style: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between' },
            children: fixture.sections.items.map((item, i) => ({
              type: 'div',
              props: {
                id: item.id,
                style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 210 },
                children: [
                  { type: 'img', props: { src: itemsImages[i], style: { width: 80, height: 80 } } },
                  text('span', `${item.id}_caption`, item.caption, { marginTop: 10, textAlign: 'center', maxWidth: 210 }, s)
                ]
              }
            }))
          }
        },
        {
          type: 'div',
          props: {
            id: 'benefitsPanel',
            style: { display: 'flex', flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'white', padding: 20, borderRadius: 10 },
            children: fixture.sections.benefitsPanel.map(b =>
              text('span', b.id, b.text, { fontWeight: 'bold' }, s)
            )
          }
        },
        {
          type: 'div',
          props: {
            id: 'footer',
            style: { display: 'flex', justifyContent: 'center', marginTop: 'auto', padding: 20, backgroundColor: palette.primary, color: 'white' },
            children: [text('span', 'footer_text', fixture.sections.footer.bannerText, { textAlign: 'center' }, s)]
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
