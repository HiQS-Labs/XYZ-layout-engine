import fs from 'node:fs/promises';
import { NUTRITION_TEXT_IDS, NUTRITION_CONTAINMENT, DEFAULT_SIZES as SPIKE_DEFAULT_SIZES } from '../spike/scene.mjs';
import { resolveIllustration } from '../spike/assets.mjs';
import { invalid, LIMITS, readPinnedPngs, validateFixtureShape } from '../request.mjs';

export const version = '2.0.2';
export const name = 'nutrition';
export const FONT = {
  family: 'Barlow Condensed',
  regular: new URL('../fonts/barlow-condensed/BarlowCondensed-Regular.ttf', import.meta.url),
  bold: new URL('../fonts/barlow-condensed/BarlowCondensed-Bold.ttf', import.meta.url),
};
export const TEXT_IDS = NUTRITION_TEXT_IDS;
export const CONTAINMENT = NUTRITION_CONTAINMENT;

const ITEM_IDS = ['item_1', 'item_2', 'item_3', 'item_4'];
const BENEFIT_IDS = ['benefit_1', 'benefit_2', 'benefit_3', 'benefit_4'];
export const DEFAULT_SIZES = {
  ...SPIKE_DEFAULT_SIZES,
  header_headline: 50,
  header_subtitle: 24,
  header_caption: 18,
  callout_1_title: 20,
  callout_1_text: 16,
  callout_2_title: 20,
  callout_2_text: 16,
  ...Object.fromEntries(ITEM_IDS.flatMap(i => [[`${i}_title`, 18], [`${i}_caption`, 14]])),
  ...Object.fromEntries(BENEFIT_IDS.map(b => [b, 15])),
  footer_text: 21,
  footer_tagline: 17,
};

const EXAMPLE = new URL('../../examples/2026-10-13-nutrition-infographic/', import.meta.url);
const PNG_IDS = [
  'leaf_glow',
  'balance_scale',
  'skip_spike',
  'parfait_jar',
  'snack_container',
  'chicken_wrap',
  'water_bottle',
];
const PNG_SHADOW = 'drop-shadow(0px 8px 6px rgba(31,42,28,0.22))';
const HERO_SHADOW = 'drop-shadow(0px 6px 8px rgba(242,228,150,0.45))';

export async function validate(fixture) {
  const shape = JSON.parse(await fs.readFile(new URL('../spike/fixture.json', import.meta.url), 'utf8'));
  shape.sections.header.caption = ''; // Only optional delivered text field.
  validateFixtureShape(fixture, shape);
  if (fixture.width * fixture.height > LIMITS.renderPixels) throw invalid('fixture.width', 'render area exceeds budget');
  return fixture;
}

function text(type, id, content, style, sizes) {
  return {
    type,
    props: {
      id,
      style: { margin: 0, fontSize: sizes[id] ?? DEFAULT_SIZES[id], ...style },
      children: content,
    },
  };
}

const img = (id, src, style) => ({
  type: 'img',
  props: {
    ...(id ? { id } : {}),
    src,
    style: { objectFit: 'contain', ...style },
  },
});

export async function buildScene(fixture, sizes = {}) {
  const s = { ...DEFAULT_SIZES, ...sizes };
  const { palette } = fixture.theme;
  const { header, hero, items, benefitsPanel, footer } = fixture.sections;
  const pinnedPngs = await readPinnedPngs(EXAMPLE, 'provenance.json', PNG_IDS);
  const budget = { bytes: 0, pixels: 0 };
  const R = async id => (Object.hasOwn(pinnedPngs, id) ? pinnedPngs[id] : resolveIllustration(id, budget));

  const [ornament, heroImage, footerOrnament, footerEnd] = await Promise.all([
    R(header.ornamentId),
    R(hero.illustrationId),
    R(footer.ornamentId),
    R(footer.endIconId),
  ]);
  const calloutImages = await Promise.all(hero.callouts.map(c => R(c.illustrationId)));
  const itemImages = await Promise.all(items.map(i => R(i.illustrationId)));
  const iconImages = await Promise.all(benefitsPanel.map(b => R(b.iconId)));

  const headline = {
    color: palette.primary,
    fontWeight: 700,
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 1.25,
  };
  const body = { color: palette.muted, textAlign: 'center', lineHeight: 1.28 };

  const callout = (c, i) => ({
    type: 'div',
    props: {
      id: c.id,
      style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 300, gap: 8 },
      children: [
        img(`${c.id}_img`, calloutImages[i], { width: 280, height: 210, filter: PNG_SHADOW }),
        text('span', `${c.id}_title`, c.title, { ...headline, letterSpacing: 0.6, maxWidth: 300 }, s),
        text('span', `${c.id}_text`, c.text, { ...body, maxWidth: 240 }, s),
      ],
    },
  });

  return {
    type: 'div',
    props: {
      id: 'canvas',
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: fixture.width,
        height: fixture.height,
        backgroundColor: fixture.theme.background,
        backgroundImage: 'radial-gradient(circle at 50% 44%, #fffef8 0%, #f7f3e3 58%, #ede6cf 100%)',
        fontFamily: FONT.family,
        color: palette.text,
        padding: '28px 30px 24px',
        gap: 12,
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
                    text('h1', 'header_headline', header.headline, { ...headline, letterSpacing: 1.2, maxWidth: 780 }, s),
                    img(null, ornament, { width: 40, height: 40, transform: 'scaleX(-1)' }),
                  ],
                },
              },
              text('h2', 'header_subtitle', header.subtitle, { color: palette.primary, fontWeight: 400, textAlign: 'center', lineHeight: 1.2, maxWidth: 820 }, s),
              header.caption ? text('p', 'header_caption', header.caption, { ...body, maxWidth: 600 }, s) : null,
            ],
          },
        },
        {
          type: 'div',
          props: {
            id: 'hero',
            style: { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: 940, flex: 1, minHeight: 0 },
            children: [
              callout(hero.callouts[0], 0),
              img('hero_img', heroImage, { width: 320, height: '100%', filter: HERO_SHADOW }),
              callout(hero.callouts[1], 1),
            ],
          },
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
                        img(`${item.id}_img`, itemImages[i], { width: 160, height: 170, filter: PNG_SHADOW }),
                        text('span', `${item.id}_title`, item.title, { ...headline, letterSpacing: 0.5, maxWidth: 167 }, s),
                        text('span', `${item.id}_caption`, item.caption, { ...body, lineHeight: 1.25, maxWidth: 167 }, s),
                      ],
                    },
                  })),
                },
              },
              {
                type: 'div',
                props: {
                  id: 'benefitsPanel',
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 12,
                    width: 220,
                    padding: '14px 16px',
                    border: `2px solid ${palette.panelBorder}`,
                    borderRadius: 16,
                    backgroundColor: palette.panelFill,
                  },
                  children: benefitsPanel.map((b, i) => ({
                    type: 'div',
                    props: {
                      id: `${b.id}_row`,
                      style: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 },
                      children: [
                        img(`${b.id}_icon`, iconImages[i], { width: 44, height: 44 }),
                        text('span', b.id, b.text, { color: palette.primary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, lineHeight: 1.2, maxWidth: 120 }, s),
                      ],
                    },
                  })),
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            id: 'footer',
            style: {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              width: 880,
              padding: '10px 24px',
              border: `2px solid ${palette.panelBorder}`,
              borderRadius: 999,
              backgroundColor: palette.panelFill,
            },
            children: [
              img(null, footerOrnament, { width: 28, height: 28 }),
              text('span', 'footer_text', footer.bannerText, { color: palette.primary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, lineHeight: 1.2 }, s),
              { type: 'div', props: { style: { width: 2, height: 26, backgroundColor: palette.panelBorder } } },
              text('span', 'footer_tagline', footer.tagline, { color: palette.muted, lineHeight: 1.2 }, s),
              img(null, footerEnd, { width: 22, height: 22 }),
            ],
          },
        },
      ],
    },
  };
}

export { NUTRITION_TEXT_IDS, NUTRITION_CONTAINMENT, validate as validateNutrition, buildScene as buildNutritionScene };
