import fs from 'node:fs/promises';
import { NUTRITION_TEXT_IDS, NUTRITION_CONTAINMENT, DEFAULT_SIZES as SPIKE_DEFAULT_SIZES } from '../spike/scene.mjs';
import { resolveIllustration } from '../spike/assets.mjs';
import { invalid, LIMITS, readPinnedPngs, validateFixtureShape } from '../request.mjs';

export const version = '3.0.0';
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
const HERO_SHADOW = 'drop-shadow(0px 6px 8px rgba(242,228,150,0.45))';

// Two-layer directional ground/contact cast shadows (AS-11) from an upper-right corner light source.
const GROUND_SHADOW_SPECS = {
  balance_scale:   { boxW: 280, boxH: 210, contact: { cx: 139, cy: 184, rx: 46, ry: 6.5 }, cast: { cx: 122, cy: 187, rx: 68, ry: 12.5, rot: -4 } },
  skip_spike:      { boxW: 280, boxH: 210, contact: { cx: 142, cy: 194, rx: 62, ry: 7.5 }, cast: { cx: 124, cy: 197, rx: 84, ry: 13.5, rot: -4 } },
  parfait_jar:     { boxW: 160, boxH: 170, contact: { cx: 79,  cy: 155, rx: 41, ry: 6.5 }, cast: { cx: 63,  cy: 158, rx: 58, ry: 12,   rot: -5 } },
  snack_container: { boxW: 160, boxH: 170, contact: { cx: 75,  cy: 152, rx: 45, ry: 7   }, cast: { cx: 58,  cy: 156, rx: 62, ry: 13,   rot: -6 } },
  chicken_wrap:    { boxW: 160, boxH: 170, imgTop: 60, imgHeight: 107, contact: { cx: 72, cy: 153, rx: 44, ry: 6.5 }, cast: { cx: 56, cy: 156, rx: 60, ry: 12, rot: -5 } },
  water_bottle:    { boxW: 160, boxH: 170, contact: { cx: 79,  cy: 162, rx: 25, ry: 5.5 }, cast: { cx: 61,  cy: 164, rx: 46, ry: 10.5, rot: -4 } },
};

function groundShadowUri(id) {
  const s = GROUND_SHADOW_SPECS[id];
  if (!s) return null;
  const { boxW, boxH, contact, cast } = s;
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${boxW} ${boxH}" width="${boxW}" height="${boxH}">`,
    '<defs>',
    `<radialGradient id="cast_${id}" cx="50%" cy="50%" r="50%">`,
    '<stop offset="0%" stop-color="#1f2a1c" stop-opacity="0.30"/>',
    '<stop offset="38%" stop-color="#1f2a1c" stop-opacity="0.21"/>',
    '<stop offset="72%" stop-color="#1f2a1c" stop-opacity="0.09"/>',
    '<stop offset="100%" stop-color="#1f2a1c" stop-opacity="0"/>',
    '</radialGradient>',
    `<radialGradient id="contact_${id}" cx="50%" cy="50%" r="50%">`,
    '<stop offset="0%" stop-color="#162014" stop-opacity="0.50"/>',
    '<stop offset="45%" stop-color="#162014" stop-opacity="0.32"/>',
    '<stop offset="78%" stop-color="#162014" stop-opacity="0.10"/>',
    '<stop offset="100%" stop-color="#162014" stop-opacity="0"/>',
    '</radialGradient>',
    '</defs>',
    `<ellipse cx="${cast.cx}" cy="${cast.cy}" rx="${cast.rx}" ry="${cast.ry}" transform="rotate(${cast.rot} ${cast.cx} ${cast.cy})" fill="url(#cast_${id})"/>`,
    `<ellipse cx="${contact.cx}" cy="${contact.cy}" rx="${contact.rx}" ry="${contact.ry}" fill="url(#contact_${id})"/>`,
    '</svg>',
  ].join('');
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

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

function groundedImg(slotId, assetId, src, { width, height }) {
  const spec = GROUND_SHADOW_SPECS[assetId];
  const shadowUri = groundShadowUri(assetId);
  if (!spec || !shadowUri) return img(slotId, src, { width, height });
  return {
    type: 'div',
    props: {
      style: { position: 'relative', display: 'flex', width, height },
      children: [
        img(null, shadowUri, { position: 'absolute', left: 0, top: 0, width, height }),
        img(slotId, src, {
          position: 'absolute',
          left: 0,
          top: spec.imgTop ?? 0,
          width,
          height: spec.imgHeight ?? height,
        }),
      ],
    },
  };
}

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
        groundedImg(`${c.id}_img`, c.illustrationId, calloutImages[i], { width: 280, height: 210 }),
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
                        groundedImg(`${item.id}_img`, item.illustrationId, itemImages[i], { width: 160, height: 170 }),
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
