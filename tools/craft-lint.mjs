// Deterministic anti-slop craft linter for layout engine fixtures and recipes.
// Evaluates layout trees against Impeccable-derived craft floor invariants:
// 1. no-nested-cards: Containers placed inside containers with duplicate framing.
// 2. elevation-singularity: Border OR shadow; never both simultaneously.
// 3. no-side-stripe-borders: Colored left/right stripe on rounded containers.
// 4. typography-ramp: Strictly bounded font sizes adhering to proportional scale.
// 5. no-empty-decorative-plates: Unearned decorative cards without semantic purpose.

import fs from 'node:fs/promises';
import path from 'node:path';

export const RULES = Object.freeze([
  'no-nested-cards',
  'elevation-singularity',
  'no-side-stripe-borders',
  'typography-ramp',
  'no-empty-decorative-plates'
]);

export function lintFixture(fixture, options = {}) {
  const findings = [];
  const report = (rule, message, elementId = null, severity = 'error') => {
    findings.push({ rule, message, elementId, severity });
  };

  if (!fixture || typeof fixture !== 'object') {
    report('invalid-fixture', 'Fixture must be an object');
    return { ok: false, findings };
  }

  // Check design-intake style elements
  if (Array.isArray(fixture.elements)) {
    const rects = fixture.elements.filter(e => e.type === 'rect');
    const texts = fixture.elements.filter(e => e.type === 'text');
    const images = fixture.elements.filter(e => e.type === 'image');

    // 1. no-nested-cards: Check spatial containment between rects
    for (let i = 0; i < rects.length; i++) {
      for (let j = 0; j < rects.length; j++) {
        if (i === j) continue;
        const outer = rects[i];
        const inner = rects[j];
        const isContained = inner.x >= outer.x &&
          inner.y >= outer.y &&
          (inner.x + inner.width) <= (outer.x + outer.width) &&
          (inner.y + inner.height) <= (outer.y + outer.height);

        // A nested card is an inner card that both has a fill and a stroke inside an outer card with fill and stroke
        if (isContained && inner.fill && inner.stroke && outer.fill && outer.stroke) {
          // If the outer card is not the entire canvas background
          if (outer.width < (fixture.width ?? 8192) || outer.height < (fixture.height ?? 8192)) {
            report('no-nested-cards', `Nested card detected: '${inner.id}' is nested inside '${outer.id}' with duplicate border and fill framing.`, inner.id);
          }
        }
      }
    }

    // 2. elevation-singularity: Check border + shadow
    for (const elem of fixture.elements) {
      if (elem.style) {
        const hasBorder = (elem.style.border && elem.style.border !== 'none') || (elem.style.borderWidth && elem.style.borderWidth > 0);
        const hasShadow = elem.style.boxShadow || elem.style.filter?.includes('drop-shadow');
        if (hasBorder && hasShadow) {
          report('elevation-singularity', `Element '${elem.id}' declares both a border and a shadow; choose one elevation model.`, elem.id);
        }
      }
    }

    // 3. no-side-stripe-borders
    for (const elem of fixture.elements) {
      if (elem.style) {
        const hasRadius = (elem.style.borderRadius && elem.style.borderRadius !== '0px' && elem.style.borderRadius !== 0) || (fixture.settings?.cornerRadius > 0);
        const hasSideStripe = (elem.style.borderLeftWidth && !elem.style.borderRightWidth) || (elem.style.borderRightWidth && !elem.style.borderLeftWidth);
        if (hasRadius && hasSideStripe) {
          report('no-side-stripe-borders', `Element '${elem.id}' has an asymmetric side border stripe on a rounded card.`, elem.id);
        }
      }
    }

    // 4. typography-ramp
    if (fixture.settings?.type) {
      for (const [role, typeConfig] of Object.entries(fixture.settings.type)) {
        if (typeof typeConfig.size === 'number') {
          if (!Number.isInteger(typeConfig.size) || typeConfig.size < 12) {
            report('typography-ramp', `Type role '${role}' size ${typeConfig.size}px is invalid or below the 12px legibility floor.`, null);
          }
        }
      }
    }

    // 5. no-empty-decorative-plates
    // An element is an empty plate if it's a rect that contains no texts or images
    for (const rect of rects) {
      // Ignore full-canvas background rects
      if (rect.x === 0 && rect.y === 0 && rect.width === fixture.width && rect.height === fixture.height) continue;
      const containsText = texts.some(t => t.x >= rect.x && t.y >= rect.y && (t.x + t.width) <= (rect.x + rect.width + 10) && (t.y + t.height) <= (rect.y + rect.height + 10));
      const containsImage = images.some(img => img.x >= rect.x && img.y >= rect.y && (img.x + img.width) <= (rect.x + rect.width + 10) && (img.y + img.height) <= (rect.y + rect.height + 10));
      if (!containsText && !containsImage) {
        report('no-empty-decorative-plates', `Rect '${rect.id}' contains neither text nor imagery; empty decorative plates are discouraged.`, rect.id, 'warn');
      }
    }
  }

  const errors = findings.filter(f => f.severity === 'error');
  return {
    ok: errors.length === 0,
    findings,
    errors,
    warnings: findings.filter(f => f.severity === 'warn')
  };
}

// CLI entry point
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: node tools/craft-lint.mjs <fixture.json>');
    process.exit(1);
  }
  try {
    const content = await fs.readFile(path.resolve(process.cwd(), target), 'utf8');
    const fixture = JSON.parse(content);
    const result = lintFixture(fixture);
    if (!result.ok) {
      console.error(`craft-lint: FAILED (${result.errors.length} error(s), ${result.warnings.length} warning(s))`);
      for (const err of result.errors) {
        console.error(`  [ERROR] [${err.rule}] ${err.message}`);
      }
      for (const warn of result.warnings) {
        console.warn(`  [WARN]  [${warn.rule}] ${warn.message}`);
      }
      process.exit(1);
    } else {
      console.log(`craft-lint: PASSED (${result.warnings.length} warning(s))`);
      for (const warn of result.warnings) {
        console.warn(`  [WARN]  [${warn.rule}] ${warn.message}`);
      }
      process.exit(0);
    }
  } catch (err) {
    console.error('craft-lint error:', err.message);
    process.exit(1);
  }
}
