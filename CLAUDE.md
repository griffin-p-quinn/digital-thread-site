# Digital Thread Site — Agent Handoff

Last updated: 2026-07-20. The feature baseline immediately before this handoff is commit `9fa6219` (`Make mobile atmosphere visible and personalize copy`).

## Project and production state

This repository is the static GitHub Pages site at:

- Portfolio: `https://griffin-p-quinn.github.io/digital-thread-site/projects.html`
- Repository: `https://github.com/griffin-p-quinn/digital-thread-site`
- Deployment branch: `main`

The main portfolio is `projects.html`. `index.html` is the broader Digital Fabric reference-library landing page. Eight full case studies live under `projects/*/index.html`.

The current portfolio contains 63 canonical project records: 8 selected projects, 9 explorations, 7 build threads, 59 archive records, and 2 lab fragments. Some categories overlap those totals by design.

## Completed portfolio work

- Rebuilt the portfolio around selected industrial, applied-AI, MCP, PLM, CAD, Mendix, and manufacturing work.
- Added a canonical project model, generated static fallback content, grouped explorations, build threads, archive filtering/search, and eight full case-study pages.
- Made selected cards open an image-first details drawer. The default Overview contains an in-drawer media carousel with previous/next controls and touch swiping; Evidence and Interactive demo remain separate tabs inside the same drawer.
- Fixed mobile card-body taps so they open the image carousel instead of requiring a small link or navigating to another page.
- Replaced the clipped mobile archive tab rail with a contained category selector. The page, navigation, archive controls, drawer, and carousel have no horizontal overflow at tested widths from 320px through 430px.
- Added lazy-loaded interactive workbenches and kept workbench code out of the initial page load until requested.
- Added light/dark themes and accessible theme labels.
- Reworked the background into three independent warm liquid fields. Mobile uses spatially separated coral, amber, and wine fields rather than enormous overlapping circles:
  - widths: `145vw`, `140vw`, and `150vw`
  - heights: `72svh`, `74svh`, and `80svh`, each with a `vh` fallback
  - durations: `14s`, `18s`, and `22s`
  - explicit RGBA gradient stops avoid a `color-mix()`-only failure on older Safari
  - `prefers-reduced-motion: reduce` intentionally disables the mesh animation
- Removed particle effects, one-way gradient sweeps, hard lower cutoffs, blue/green atmosphere colors, and hover behavior that dimmed or rearranged neighboring work.
- Converted authored portfolio narratives to first person (`I`/`my`). Keep `Griffin Quinn` for identity, signatures, titles, author metadata, and image metadata only. The internal compatibility field is still named `griffinsRole`; do not rename it casually.
- Added cache-version query strings to portfolio CSS/JS references. The current release token is `20260719-mobile2`.

## Do not regress these decisions

- The atmosphere must be visibly moving on an actual phone, not merely report changing CSS transforms. Keep it warm, fluid, restrained, and free of particles.
- Do not reintroduce blue or green background fields against the orange editorial signal.
- Do not add a bounded hero-only gradient or a visible rectangular/circular cutoff.
- Project cards must reveal pictures immediately in the drawer Overview. Do not make users select another tab or leave the page just to see media.
- Keep mobile archive controls contained. No clipped horizontal tab widget.
- Top-project hover must remain planar: no layout shift, neighbor dimming, reshuffling, or unstable z-index behavior.
- Public narrative copy should speak as the portfolio author, not describe “Griffin” in the third person.

## Source of truth and file map

- `assets/projects/portfolio-content.js`
  - Canonical record for all 63 projects, media galleries, selected/exploration keys, build threads, evidence, validation, and limitations.
  - Edit narrative content here first.
- `scripts/generate-static-portfolio.mjs`
  - Regenerates the static gallery block in `projects.html` from the canonical model.
  - Do not hand-edit generated gallery records and expect them to persist.
- `projects.html`
  - Portfolio shell, base tokens, atmosphere CSS/keyframes, drawer markup/runtime, and lazy workbench registry.
- `assets/projects/editorial-gallery.css` / `.js`
  - Editorial gallery, archive, navigation, filtering, and scroll behavior.
- `assets/projects/editorial-studio.css`
  - Drawer, tabs, project carousel, evidence, and interactive-studio presentation.
- `assets/projects/executive-portfolio.css`
  - Selected-work hierarchy, hero, About section, mobile publication layout, and portfolio close.
- `assets/projects/decision-thread.css`
  - Hero decision-thread and archive/detail visual refinements.
- `assets/projects/project-evidence.js`
  - Evidence rendering.
- `assets/projects/workbenches-truth-*.css` / `.js`
  - Lazy-loaded interactive demos.
- `assets/projects/case-study.css` / `.js`
  - Shared case-study presentation and hydration from the canonical model.
- `tests/`
  - Canonical model, case-study, interaction, motion, accessibility/reduced-motion, and visual regression coverage.

## Required workflow

After changing canonical portfolio content:

```powershell
npm run portfolio:generate
npm run portfolio:check
```

Before pushing a portfolio change:

```powershell
npm test
npm run build
```

For responsive screenshots and the complete browser suite:

```powershell
npm run test:visual
npm run test:all
```

Useful targeted checks:

```powershell
npx playwright test tests/portfolio.motion.spec.js --workers=1
npx playwright test tests/portfolio.interactions.spec.js --workers=1
npx playwright test tests/portfolio.visual.spec.js --grep "390x844|key portfolio details mobile" --workers=2
```

The Playwright portfolio suite serves the source root through Vite at `127.0.0.1:4173`; it does not validate the unrelated `dist/` preview. Visual artifacts go to `artifacts/portfolio-validation/` and are ignored by Git.

The motion regression test includes a rendered-pixel comparison on mobile. Do not replace it with an element-position-only assertion; that older approach passed while the animation remained visually imperceptible.

The last full validation completed before this handoff was:

- `npm test`: 41 passed
- targeted 390×844 light/dark and mobile drawer visual checks: 3 passed
- `npm run build`: passed
- live 320×568, 390×844, and 430×932 motion checks: passed

## Cache and deployment

GitHub Pages serves these files with a short cache window. When a referenced CSS or JS asset changes, bump its query-string release token in every loading page, including case studies and lazy workbench registry entries.

When work is complete and tested, commit and push to `origin/main`; the user has explicitly authorized pushing completed work without another approval prompt.

Confirm Pages built the pushed commit:

```powershell
gh api repos/griffin-p-quinn/digital-thread-site/pages/builds/latest --jq '{status: .status, commit: .commit}'
```

Then verify the live page with a unique query string and confirm that the deployed HTML contains the new marker/token. Do not treat a successful `git push` alone as deployment verification.

## Working-tree safety

Existing untracked files belong to the user. At the time of this handoff these are:

- `assets/projects/widgets_cover.png`
- `tools/`

Do not stage, overwrite, or delete them unless a later task explicitly puts them in scope. Stage intended files explicitly rather than using a broad `git add .`.
