# Portfolio validation

The browser suite serves the source `projects.html` through Vite on `127.0.0.1:4173`; it does not use the unrelated `dist/` preview.

- `npm test` checks the generated static gallery and runs model/interaction tests.
- `npm run test:e2e` runs model/interaction tests without the generation precheck.
- `npm run test:visual` captures the six required viewports in light and dark themes.
- `npm run test:all` runs the generation check and every Playwright spec.

Visual verification PNGs are written to `artifacts/portfolio-validation/`. Each theme/viewport pair gets an opening viewport and an Archive viewport. Failure traces, videos, and screenshots go to `test-results/`; the HTML report goes to `playwright-report/`.

The default browser channel is the installed Google Chrome. Set `PLAYWRIGHT_BROWSER_CHANNEL=msedge` to use Edge, or remove the channel override in `playwright.config.js` when running with a Playwright-managed Chromium installation.
