import fs from 'fs/promises';
import { resolveIllustration } from './assets.mjs';

export async function createScene(fixture) {
  const heroImage = await resolveIllustration(fixture.sections.hero.illustrationId);
  const itemsImages = await Promise.all(
    fixture.sections.items.map(item => resolveIllustration(item.illustrationId))
  );

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: fixture.width,
        height: fixture.height,
        backgroundColor: fixture.theme.background,
        fontFamily: 'Inter',
        padding: 40,
        gap: 20
      },
      children: [
        {
          type: 'div',
          props: {
            id: 'header',
            style: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
            children: [
              {
                type: 'h1',
                props: {
                  style: { color: fixture.theme.palette.primary, fontSize: 48, margin: 0 },
                  children: fixture.sections.header.headline
                }
              },
              {
                type: 'h2',
                props: {
                  style: { color: fixture.theme.palette.text, fontSize: 24, margin: 0 },
                  children: fixture.sections.header.subtitle
                }
              },
              fixture.sections.header.caption ? {
                type: 'p',
                props: {
                  style: { color: fixture.theme.palette.text, fontSize: 18, margin: '10px 0', maxWidth: 600, textAlign: 'center' },
                  children: fixture.sections.header.caption
                }
              } : null
            ]
          }
        },
        {
          type: 'div',
          props: {
            id: 'hero',
            style: { display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flex: 1 },
            children: [
              {
                type: 'div',
                props: {
                  id: fixture.sections.hero.callouts[0].id,
                  style: { padding: 10, backgroundColor: fixture.theme.palette.secondary, borderRadius: 5, alignSelf: 'flex-start', marginTop: 20 },
                  children: fixture.sections.hero.callouts[0].text
                }
              },
              {
                type: 'img',
                props: {
                  id: 'hero_img',
                  src: heroImage,
                  style: { width: 300, height: 300, margin: '0 20px' }
                }
              },
              {
                type: 'div',
                props: {
                  id: fixture.sections.hero.callouts[1].id,
                  style: { padding: 10, backgroundColor: fixture.theme.palette.secondary, borderRadius: 5, alignSelf: 'flex-start', marginTop: 20 },
                  children: fixture.sections.hero.callouts[1].text
                }
              }
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
                style: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
                children: [
                  {
                    type: 'img',
                    props: { src: itemsImages[i], style: { width: 80, height: 80 } }
                  },
                  {
                    type: 'span',
                    props: { style: { marginTop: 10, fontSize: 18 }, children: item.caption }
                  }
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
            children: fixture.sections.benefitsPanel.map(b => ({
              type: 'span',
              props: { id: b.id, style: { fontWeight: 'bold' }, children: b.text }
            }))
          }
        },
        {
          type: 'div',
          props: {
            id: 'footer',
            style: { display: 'flex', justifyContent: 'center', marginTop: 'auto', padding: 20, backgroundColor: fixture.theme.palette.primary, color: 'white' },
            children: fixture.sections.footer.bannerText
          }
        }
      ]
    }
  };
}
