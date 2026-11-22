// Pure Web-Standard ESM Solar System jobs and admission rules (zero node:* dependencies)
import { canonicalJson, sha256Sync, PyNumber } from './json.mjs';

export const SOLAR_SYSTEM_STYLE =
  'Create ONE isolated astronomy illustration asset for a sophisticated museum-quality solar-system infographic. ' +
  'Photorealistic scientific illustration with beautiful restrained detail, clean silhouette and consistent studio ' +
  'illumination from upper left. Entire subject fully visible centered, generous 12 percent transparent padding. ' +
  'Transparent background, genuinely clear alpha outside the subject. No black rectangle, no stars in the background, ' +
  'no ground, no cast shadow, no caption, no typography, no diagram, no other planets. ';

export const SOLAR_SYSTEM_SUBJECTS = {
  sun: 'A standalone schematic illustration of the Sun, complete full circle, extremely bright center fading out to an intricate active corona of solar flares and magnetic loops, face-on. Warm yellow and bright orange tones. No planets, no background starfield, no black rectangle; flares must fade smoothly to transparent space. Educational astronomical illustration.',
  mercury: 'A standalone schematic illustration of Mercury, complete full circle, face-on. Grey, heavily cratered rocky surface similar to the Moon but with distinct thrust faults and ridges. Sharp terminator, no atmosphere. No Sun, no background starfield, no black rectangle; edges fade cleanly to transparent space. Educational astronomical illustration.',
  venus: 'A standalone schematic illustration of Venus, complete full circle, face-on. Featureless thick opaque pale-yellow/white cloud cover with subtle chevron or V-shaped atmospheric bands. No surface details visible. No Sun, no background starfield, no black rectangle; edges fade cleanly to transparent space. Educational astronomical illustration.',
  earth: 'A standalone schematic illustration of Earth, complete full circle, face-on. Vibrant deep blue oceans, varied green/brown continents, swirling white dynamic cloud patterns. Thin blue atmospheric haze at the limb. No Sun, no background starfield, no black rectangle; edges fade cleanly to transparent space. Educational astronomical illustration.',
  moon: "A standalone schematic illustration of Earth's Moon, complete full circle, face-on. Bright grey heavily cratered highlands and dark smooth basaltic maria (seas). Sharp terminator, no atmosphere. No Earth, no background starfield, no black rectangle; edges fade cleanly to transparent space. Educational astronomical illustration.",
  mars: 'A standalone schematic illustration of Mars, complete full circle, face-on. Rusty red and orange dusty surface, distinct dark albedo features (like Syrtis Major), subtle white polar ice cap. Thin wispy atmosphere at the limb. No Sun, no background starfield, no black rectangle; edges fade cleanly to transparent space. Educational astronomical illustration.',
  jupiter: 'A standalone schematic illustration of Jupiter, complete full circle, face-on. Distinct horizontal bands of turbulent clouds in cream, brown, orange, and white. Prominent Great Red Spot visible. Complex swirling storms at band boundaries. No Sun, no background starfield, no black rectangle; edges fade cleanly to transparent space. Educational astronomical illustration.',
  saturn: 'A standalone schematic illustration of Saturn with its rings, oblique view. Pale gold and muted yellow-brown banded atmosphere. Spectacular, expansive, complex ring system (A, B, C rings with Cassini division) encircling the planet, correctly casting a shadow on the globe and the globe casting a shadow on the rings behind. Rings fade to transparent. No Sun, no background starfield; educational astronomical illustration.',
  uranus: 'A standalone schematic illustration of Uranus, complete full circle, face-on. Featureless smooth pale cyan/light-blue atmosphere. Very subtle, almost invisible vertical banding. Faint, dark, extremely thin vertical ring system just visible. No Sun, no background starfield, no black rectangle; edges fade cleanly to transparent space. Educational astronomical illustration.',
  neptune: 'A standalone schematic illustration of Neptune, complete full circle, face-on. Deep vivid azure blue atmosphere. Subtle high-altitude white cirrus clouds and a dark blue oval storm feature. No Sun, no background starfield, no black rectangle; edges fade cleanly to transparent space. Educational astronomical illustration.',
  pluto: 'A standalone schematic illustration of Pluto, complete full circle, face-on. High contrast surface with pale tan, reddish-brown, and dark charcoal areas. Prominent bright heart-shaped nitrogen ice feature (Tombaugh Regio). No Sun, no background starfield, no black rectangle; edges fade cleanly to transparent space. Educational astronomical illustration.',
  'asteroid-belt': 'A standalone schematic asteroid belt: a complete thin horizontal elliptical annulus of many tiny individually separated irregular grey and warm-brown rocky asteroids, viewed obliquely. Ring is wide, about 85 percent canvas width and 30 percent canvas height, large empty transparent center. Rocks small, sparse and fine, not a continuous solid ring, avoid boulders filling entire center. No Sun or planets. This is an exaggerated-density illustration of the main asteroid belt, not a dense physical barrier. Genuine transparency between rocks and inside the ellipse.',
  'milky-way': 'The Milky Way alone as an artist impression schematic face-on barred spiral galaxy, centered round-ish disk, luminous pale gold central bar, sweeping elegant blue-white spiral arms and subtle warm dust lanes. Entire galaxy fits at 85 percent canvas width. No labels, no location marker, no foreground planets, no black rectangle, no background starfield beyond the galaxy; galaxy fades smoothly to transparent space outside its disk. Educational astronomical illustration, not a claimed photograph.'
};

export const SOLAR_SYSTEM_JOBS = Object.entries(SOLAR_SYSTEM_SUBJECTS).map(([k, v]) => ({
  id: k,
  prompt: SOLAR_SYSTEM_STYLE + v,
  model: 'gpt-image-2.5-flare',
  size: '1024x1024',
  quality: 'medium',
  background: 'transparent'
}));

export const ATTEMPT_DIR = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}_[0-9a-f]{64}_[0-9a-f]{32}$/;

export function neverDispatched(result) {
  if (!result || typeof result !== 'object') return false;
  if (result.dispatched === false) {
    return true;
  }
  const attempts = result.attempts;
  return Array.isArray(attempts) && attempts.length > 0 && attempts.every(a => a && typeof a === 'object' && a.dispatched === false);
}

export function validateManifestMap(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('invalid manifest; reconcile before dispatch');
  }
  const allowed = new Set(['pending', 'in-flight', 'complete', 'unknown', 'failed']);
  for (const v of Object.values(data)) {
    if (!v || typeof v !== 'object' || Array.isArray(v) || !allowed.has(v.status)) {
      throw new Error('invalid manifest; reconcile before dispatch');
    }
  }
  return true;
}

export function jobDigest(job, referenceDigests = null) {
  const core = { ...job };
  delete core._caller_sha256;
  delete core._manifest_sha256;
  delete core._recipe_ref;
  core.reference_digests = referenceDigests !== null ? referenceDigests : (job.reference_digests || []);
  const jsonStr = canonicalJson(core);
  return sha256Sync(jsonStr);
}

export function admitJobs(jobList, callerSha256, manifestBytes = null, referenceStats = new Map()) {
  let recipe = 'configured-caller:' + callerSha256;
  let manifestSha256 = sha256Sync(new Uint8Array(0));
  if (manifestBytes && manifestBytes.length > 0) {
    manifestSha256 = sha256Sync(manifestBytes);
    const parsed = JSON.parse(typeof manifestBytes === 'string' ? manifestBytes : new TextDecoder().decode(manifestBytes));
    if (parsed?.recipes?.image_generation) {
      recipe = parsed.recipes.image_generation;
    }
  }

  if (!Array.isArray(jobList) || jobList.length < 1 || jobList.length > 32) {
    throw new Error('jobs must be a list of 1 to 32 exact inputs');
  }

  const seen = new Set();
  const admitted = [];
  const required = ['id', 'prompt', 'model', 'size', 'quality', 'background'];
  const optional = ['references', 'parameters', 'recipe_version', 'refinement_id'];
  const reserved = new Set([
    'model', 'prompt', 'n', 'size', 'quality', 'output_format',
    'stream', 'partial_images', 'response_format', 'images', 'image', 'mask'
  ]);

  for (const original of jobList) {
    if (!original || typeof original !== 'object' || Array.isArray(original)) {
      throw new Error('unknown or missing job fields');
    }
    const origKeys = Object.keys(original);
    for (const req of required) {
      if (!origKeys.includes(req)) {
        throw new Error('unknown or missing job fields');
      }
    }
    for (const k of origKeys) {
      if (!required.includes(k) && !optional.includes(k)) {
        throw new Error('unknown or missing job fields');
      }
    }

    const job = { ...original };
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(job.id) || seen.has(job.id)) {
      throw new Error('unsafe or duplicate asset ID');
    }
    seen.add(job.id);

    for (const field of required) {
      const val = job[field];
      const maxLen = field === 'prompt' ? 12000 : 100;
      if (typeof val !== 'string' || !val || val.length > maxLen || val.startsWith('--')) {
        throw new Error('invalid job ' + field);
      }
    }

    if (job.background !== 'transparent' && job.background !== 'opaque' && job.background !== 'auto') {
      throw new Error('invalid background');
    }

    if ('recipe_version' in job && job.recipe_version !== recipe) {
      throw new Error('recipe_version must match the configured caller manifest recipe');
    }

    const refs = job.references || [];
    if (!Array.isArray(refs) || refs.length > 16) {
      throw new Error('invalid references');
    }
    let totalRefBytes = 0;
    for (const ref of refs) {
      if (typeof ref !== 'string') {
        throw new Error('references must be absolute regular image files');
      }
      const stat = referenceStats.get(ref);
      if (!stat || !stat.isAbsolute || !stat.isFile || stat.isSymlink) {
        throw new Error('references must be absolute regular image files');
      }
      totalRefBytes += stat.size;
    }
    if (totalRefBytes > 35 * 1024 * 1024) {
      throw new Error('reference byte budget exceeded');
    }

    const params = job.parameters || {};
    if (!params || typeof params !== 'object' || Array.isArray(params) || Object.keys(params).length > 32) {
      throw new Error('invalid parameters');
    }

    for (const [name, value] of Object.entries(params)) {
      if (!/^[a-zA-Z][a-zA-Z0-9_]{0,63}$/.test(name) || reserved.has(name)) {
        throw new Error('unsupported parameter');
      }
      const isNum = typeof value === 'number' || value instanceof Number;
      const isStr = typeof value === 'string';
      const isBool = typeof value === 'boolean';
      if (!isNum && !isStr && !isBool) {
        throw new Error('unsupported parameter');
      }

      if (isNum && !isBool) {
        const numVal = Number(value);
        if (!Number.isFinite(numVal)) {
          throw new Error('unsupported parameter');
        }
        const hasExponent =
          (value instanceof PyNumber && /[eE]/.test(value.raw)) ||
          (numVal !== 0 && (Math.abs(numVal) < 1e-4 || Math.abs(numVal) >= 1e16));
        if (Math.abs(numVal) > 9007199254740991 || hasExponent) {
          throw new Error('numeric parameter cannot round-trip through caller; use supported decimal/safe integer');
        }
      }

      if (isStr) {
        if (value.length > 1000 || value === 'true' || value === 'false' || /^-?\d+(\.\d+)?$/.test(value)) {
          throw new Error('ambiguous or oversized parameter string');
        }
      }
    }

    if ('refinement_id' in job && (typeof job.refinement_id !== 'string' || job.refinement_id.length > 128)) {
      throw new Error('invalid refinement_id');
    }

    job._caller_sha256 = callerSha256;
    job._manifest_sha256 = manifestSha256;
    job._recipe_ref = recipe;
    admitted.push(job);
  }

  const hasSolarSubjects = admitted.some(j => (j.id in SOLAR_SYSTEM_SUBJECTS) && j.id !== 'sun');
  if (hasSolarSubjects && !seen.has('sun')) {
    throw new Error('Solar System generation requires Sun admission in the requested batch');
  }

  return admitted;
}
