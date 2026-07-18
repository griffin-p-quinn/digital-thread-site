import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const pagePath = path.join(root, 'projects.html');
const contentPath = path.join(root, 'assets', 'projects', 'portfolio-content.js');
const checkOnly = process.argv.includes('--check');

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

function extractLiteral(source, pattern, label) {
  const match = source.match(pattern);
  if (!match) throw new Error(`Could not find ${label} in projects.html.`);
  return vm.runInNewContext(`(${match[1]})`, Object.create(null), { filename:label });
}

const page = fs.readFileSync(pagePath, 'utf8');
const projects = extractLiteral(page, /const PROJECTS = (\[[\s\S]*?\n\]);\r?\n\r?\n\/\* Category display|const PROJECTS = (\[[\s\S]*?\n\]);\r?\n\r?\n\/\* Public portfolio model/, 'PROJECTS');

// The alternation above preserves compatibility with the earlier comment. VM
// needs the populated capture, whichever side matched.
const projectList = Array.isArray(projects) ? projects : (() => {
  const match = page.match(/const PROJECTS = (\[[\s\S]*?\n\]);\r?\n\r?\n\/\* Public portfolio model/);
  if (!match) throw new Error('Could not parse PROJECTS.');
  return vm.runInNewContext(`(${match[1]})`, Object.create(null), { filename:'PROJECTS' });
})();

const context = { window:{} };
vm.runInNewContext(fs.readFileSync(contentPath, 'utf8'), context, { filename:contentPath });
const model = context.window.PORTFOLIO_CONTENT;
if (!model) throw new Error('portfolio-content.js did not expose PORTFOLIO_CONTENT.');

const byKey = new Map(projectList.map((project) => [project.k, project]));
const categoryLabels = Object.fromEntries(model.categories.map((category) => [category.key, category.label]));
const overrideFor = (key) => model.projectOverrides?.[key] || {};
const titleFor = (project) => overrideFor(project.k).name || project.name;
const storyFor = (project) => model.stories?.[project.k];
const summaryFor = (project) => storyFor(project)?.summary || overrideFor(project.k).summary || project.blurb;
const categoryFor = (project) => model.categoryByKey[project.k];
const statusFor = (project) => model.statusByKey[project.k];
const caseHref = (project) => model.caseStudySlugs[project.k] ? `projects/${model.caseStudySlugs[project.k]}/` : '';

function storyFields(story) {
  if (!story) return '';
  return `<dl class="static-story">
          <div><dt>Problem</dt><dd>${escapeHtml(story.problem)}</dd></div>
          <div><dt>My contribution</dt><dd>${escapeHtml(story.contribution)}</dd></div>
          <div><dt>Proof</dt><dd>${escapeHtml(story.proof)}</dd></div>
          <div><dt>Result</dt><dd>${escapeHtml(story.result)}</dd></div>
        </dl>`;
}

function selectedProject(project, index) {
  const story = storyFor(project);
  return `<article class="static-selected-project">
        <p class="static-project-meta">${String(index + 1).padStart(2, '0')} / ${String(model.selectedKeys.length).padStart(2, '0')} · ${escapeHtml(categoryLabels[categoryFor(project)])} · ${escapeHtml(statusFor(project))}</p>
        <h3>${escapeHtml(titleFor(project))}</h3>
        <p class="static-project-summary">${escapeHtml(summaryFor(project))}</p>
        ${storyFields(story)}
        <a href="${caseHref(project)}">Open full case study</a>
      </article>`;
}

function exploration(project) {
  return `<article class="static-exploration-project">
        <p class="static-project-meta">${escapeHtml(categoryLabels[categoryFor(project)])} · ${escapeHtml(statusFor(project))}</p>
        <h3>${escapeHtml(titleFor(project))}</h3>
        <p>${escapeHtml(summaryFor(project))}</p>
      </article>`;
}

function archiveRecord(project, index) {
  return `<article class="static-archive-record">
        <span>${String(index + 1).padStart(2, '0')}</span>
        <div><h3>${escapeHtml(titleFor(project))}</h3><p>${escapeHtml(summaryFor(project))}</p></div>
        <small>${escapeHtml(categoryLabels[categoryFor(project)])} · ${escapeHtml(statusFor(project))}</small>
      </article>`;
}

const selected = model.selectedKeys.map((key) => byKey.get(key)).filter(Boolean);
const explorations = model.explorationKeys.map((key) => byKey.get(key)).filter(Boolean);
const archive = [...projectList].sort((a, b) => titleFor(a).localeCompare(titleFor(b)));

if (selected.length !== model.selectedKeys.length || explorations.length !== model.explorationKeys.length || archive.length !== 63) {
  throw new Error('Static portfolio generation has incomplete curation or archive coverage.');
}

const generated = `<!-- STATIC-GALLERY:START -->
    <div class="static-gallery">
      <noscript><p class="static-gallery__notice">JavaScript is off. Every project remains readable below; interactive filters and previews are unavailable.</p></noscript>
      <section class="static-gallery__section" aria-labelledby="staticSelectedTitle">
        <p class="static-gallery__kicker">The defining systems</p>
        <h2 id="staticSelectedTitle">Selected work</h2>
        <div class="static-selected-list">
      ${selected.map(selectedProject).join('\n      ')}
        </div>
      </section>
      <section class="static-gallery__section" aria-labelledby="staticExplorationTitle">
        <p class="static-gallery__kicker">Applied research</p>
        <h2 id="staticExplorationTitle">Explorations</h2>
        <div class="static-exploration-list">
      ${explorations.map(exploration).join('\n      ')}
        </div>
      </section>
      <section class="static-gallery__section" aria-labelledby="staticArchiveTitle">
        <p class="static-gallery__kicker">Complete project index</p>
        <h2 id="staticArchiveTitle">Archive</h2>
        <div class="static-archive-list">
      ${archive.map(archiveRecord).join('\n      ')}
        </div>
      </section>
    </div>
    <!-- STATIC-GALLERY:END -->`;

const mountPattern = /(<div id="galleryMount">)[\s\S]*?(<\/div>\r?\n\s*\r?\n\s*<div class="gallery-empty")/;
const nextPage = page.replace(mountPattern, `$1\n    ${generated}\n  $2`);
if (nextPage === page && !page.includes('STATIC-GALLERY:START')) {
  throw new Error('Could not locate galleryMount replacement boundary.');
}

if (checkOnly) {
  if (nextPage !== page) {
    console.error('projects.html static gallery is stale. Run npm run portfolio:generate.');
    process.exit(1);
  }
  console.log(`Static portfolio is current: ${selected.length} selected, ${explorations.length} explorations, ${archive.length} archive records.`);
} else {
  fs.writeFileSync(pagePath, nextPage, 'utf8');
  console.log(`Generated ${selected.length} selected, ${explorations.length} explorations, and ${archive.length} archive records in projects.html.`);
}
