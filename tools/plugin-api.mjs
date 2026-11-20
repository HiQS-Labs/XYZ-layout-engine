// Public API for modules that live in other repositories (GH-82).
//
// This file is the engine's only supported import surface for outside code. package.json "exports"
// maps the package root here, so a linked consumer writes `import { ... } from 'xyz-layout-engine'`
// and cannot reach any other engine file by package name. Everything not re-exported below is
// internal and may change without notice.
//
// Adding a name is a deliberate change: re-export it here, document it in README.md
// ("Using the engine from another repository") and note it in CHANGELOG.md.
// Removing or changing one breaks consumers; treat that as a breaking change.

// Launches the engine's own Playwright Chromium; the caller closes the returned browser.
export { launchPlaywright } from './render.mjs';
// Replaces REVIEW/<project>/ in the engine checkout with the given files and rebuilds REVIEW/index.html.
export { publishForReview } from './review.mjs';
