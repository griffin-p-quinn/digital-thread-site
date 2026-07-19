import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const pagePath = path.join(root, 'projects.html');
const contentPath = path.join(root, 'assets', 'projects', 'portfolio-content.js');
const checkOnly = process.argv.includes('--check');

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const textValue = (value) => Array.isArray(value)
  ? value.filter(Boolean).join(' · ')
  : String(value ?? '');

const context = { window: {} };
vm.runInNewContext(fs.readFileSync(contentPath, 'utf8'), context, { filename: contentPath });
const model = context.window.PORTFOLIO_CONTENT;
if (!model || !Array.isArray(model.projects) || model.projects.length === 0) {
  throw new Error('portfolio-content.js must expose a non-empty PORTFOLIO_CONTENT.projects array.');
}

const keyFor = (project) => project?.k || project?.key || project?.id;
const projectList = model.projects.map((project, index) => {
  const key = keyFor(project);
  const name = project.title || project.name;
  if (!key || !name || !project.summary) {
    throw new Error(`Canonical project at index ${index} is missing k/key, title/name, or summary.`);
  }
  return {
    ...project,
    k: key,
    name,
    blurb: project.summary
  };
});

const byKey = new Map(projectList.map((project) => [project.k, project]));
if (byKey.size !== projectList.length) throw new Error('Canonical project keys must be unique.');

const publicProjects = projectList.filter((project) => project.public !== false && !project.mergedInto);
const publicKeys = new Set(publicProjects.map((project) => project.k));
const selectedKeys = Array.isArray(model.selectedKeys) ? model.selectedKeys : [];
const explorationKeys = Array.isArray(model.explorationKeys) ? model.explorationKeys : [];
const labFragmentKeys = new Set(Array.isArray(model.labFragmentKeys) ? model.labFragmentKeys : []);
const buildThreads = Array.isArray(model.buildThreads) ? model.buildThreads : [];
const explorationGroups = Array.isArray(model.explorationGroups) ? model.explorationGroups : [];

const categories = Array.isArray(model.categories) ? model.categories : [];
const categoryLabels = Object.fromEntries(categories.map((category) => [
  category.id || category.key,
  category.label || category.name || category.id || category.key
]));

const titleFor = (project) => project.title || project.name;
const summaryFor = (project) => project.summary || project.blurb;
const categoryFor = (project) => categoryLabels[project.category] || project.category || 'Uncategorized';
const artifactTypeFor = (project) => project.artifactType || project.status || 'Project artifact';
const caseHref = (project) => {
  const slug = project.caseStudySlug || model.caseStudySlugs?.[project.k];
  return slug ? `projects/${slug}/` : '';
};

function staticField(label, value) {
  const text = textValue(value);
  return text ? `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(text)}</dd></div>` : '';
}

function storyFields(project) {
  return `<dl class="static-story">
          ${staticField('Problem', project.problem || project.prompt || project.summary)}
          ${staticField('My contribution', project.griffinsRole)}
          ${staticField('Role of GenAI', project.roleOfGenAI)}
          ${staticField('Validation', project.validation)}
          ${staticField('Limitations', project.limitations)}
        </dl>`;
}

function selectedProject(project, index, total) {
  const href = caseHref(project);
  return `<article class="static-selected-project">
        <p class="static-project-meta">${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')} · ${escapeHtml(categoryFor(project))} · ${escapeHtml(artifactTypeFor(project))}</p>
        <h3>${escapeHtml(titleFor(project))}</h3>
        <p class="static-project-summary">${escapeHtml(summaryFor(project))}</p>
        ${storyFields(project)}
        ${href ? `<a href="${escapeHtml(href)}">Open full case study</a>` : ''}
      </article>`;
}

function exploration(project) {
  return `<article class="static-exploration-project">
        <p class="static-project-meta">${escapeHtml(categoryFor(project))} · ${escapeHtml(artifactTypeFor(project))}</p>
        <h3>${escapeHtml(titleFor(project))}</h3>
        <p>${escapeHtml(summaryFor(project))}</p>
      </article>`;
}

function explorationGroup(group) {
  const projects = (group.projects || []).map((key) => byKey.get(key)).filter((project) => project && publicKeys.has(project.k));
  if (!projects.length) return '';
  return `<article class="static-exploration-project static-exploration-project--paired">
        <p class="static-project-meta">Paired build story · ${projects.length} projects</p>
        <h3>${escapeHtml(group.title || 'Related exploration')}</h3>
        <p>${escapeHtml(group.summary || '')}</p>
        <ul>${projects.map((project) => `<li><b>${escapeHtml(titleFor(project))}</b><span>${escapeHtml(summaryFor(project))}</span></li>`).join('')}</ul>
      </article>`;
}

function explorationEntries(projects) {
  const renderedGroups = new Set();
  return projects.map((project) => {
    const group = explorationGroups.find((candidate) => Array.isArray(candidate.projects) && candidate.projects.includes(project.k));
    if (!group) return exploration(project);
    const id = group.id || group.title;
    if (renderedGroups.has(id)) return '';
    renderedGroups.add(id);
    return explorationGroup(group);
  }).join('\n      ');
}

function threadNode(node, index) {
  const key = typeof node === 'string' ? node : keyFor(node);
  const project = key ? byKey.get(key) : null;
  const label = typeof node === 'object' && node?.label
    ? node.label
    : project ? titleFor(project) : String(node || 'Build stage');
  return `<li><span>${String(index + 1).padStart(2, '0')}</span><b>${escapeHtml(label)}</b>${project ? `<small>${escapeHtml(artifactTypeFor(project))}</small>` : ''}</li>`;
}

function buildThread(thread, index) {
  const nodes = Array.isArray(thread.projects) ? thread.projects : Array.isArray(thread.nodes) ? thread.nodes : [];
  return `<article class="static-build-thread">
        <p class="static-project-meta">Thread ${String(index + 1).padStart(2, '0')}</p>
        <h3>${escapeHtml(thread.title || `Build thread ${index + 1}`)}</h3>
        <p>${escapeHtml(thread.summary || '')}</p>
        <ol>${nodes.map(threadNode).join('')}</ol>
      </article>`;
}

function archiveRecord(project, index) {
  return `<article class="static-archive-record">
        <span>${String(index + 1).padStart(2, '0')}</span>
        <div><h3>${escapeHtml(titleFor(project))}</h3><p>${escapeHtml(summaryFor(project))}</p></div>
        <small>${escapeHtml(categoryFor(project))} · ${escapeHtml(artifactTypeFor(project))}</small>
      </article>`;
}

const selected = selectedKeys.map((key) => byKey.get(key)).filter((project) => project && publicKeys.has(project.k));
const explorations = explorationKeys.map((key) => byKey.get(key)).filter((project) => project && publicKeys.has(project.k));
const labFragments = publicProjects
  .filter((project) => labFragmentKeys.has(project.k))
  .sort((a, b) => titleFor(a).localeCompare(titleFor(b)));
const archive = publicProjects
  .filter((project) => !labFragmentKeys.has(project.k))
  .sort((a, b) => titleFor(a).localeCompare(titleFor(b)));

for (const [label, keys] of [['selectedKeys', selectedKeys], ['explorationKeys', explorationKeys]]) {
  const missing = keys.filter((key) => !byKey.has(key));
  if (missing.length) throw new Error(`${label} contains unknown projects: ${missing.join(', ')}`);
}

for (const [key, slug] of Object.entries(model.caseStudySlugs || {})) {
  if (!byKey.has(key)) throw new Error(`caseStudySlugs contains unknown project: ${key}`);
  const caseStudyPath = path.join(root, 'projects', slug, 'index.html');
  if (!fs.existsSync(caseStudyPath)) throw new Error(`Missing case study for ${key}: projects/${slug}/index.html`);
  const markup = fs.readFileSync(caseStudyPath, 'utf8');
  if (!markup.includes(`data-project-key="${key}"`)) {
    throw new Error(`Case study ${slug} must declare data-project-key="${key}".`);
  }
  const modelScript = markup.indexOf('../../assets/projects/portfolio-content.js');
  const caseScript = markup.indexOf('../../assets/projects/case-study.js');
  if (modelScript < 0 || caseScript < 0 || modelScript > caseScript) {
    throw new Error(`Case study ${slug} must load the canonical model before case-study.js.`);
  }
}

const generated = `<!-- STATIC-GALLERY:START -->
    <div class="static-gallery">
      <noscript><p class="static-gallery__notice">JavaScript is off. Every public project remains readable below; interactive filters and previews are unavailable.</p></noscript>
      <section class="static-gallery__section" aria-labelledby="staticSelectedTitle">
        <p class="static-gallery__kicker">Worth a closer look</p>
        <h2 id="staticSelectedTitle">Selected work</h2>
        <div class="static-selected-list">
      ${selected.map((project, index) => selectedProject(project, index, selected.length)).join('\n      ')}
        </div>
      </section>
      <section class="static-gallery__section" aria-labelledby="staticExplorationTitle">
        <p class="static-gallery__kicker">Smaller things I tried</p>
        <h2 id="staticExplorationTitle">Explorations</h2>
        <div class="static-exploration-list">
      ${explorationEntries(explorations)}
        </div>
      </section>
      <section class="static-gallery__section" aria-labelledby="staticThreadsTitle">
        <p class="static-gallery__kicker">Systems, not isolated cards</p>
        <h2 id="staticThreadsTitle">Build threads</h2>
        <div class="static-build-thread-list">
      ${buildThreads.map(buildThread).join('\n      ')}
        </div>
      </section>
      <section class="static-gallery__section" aria-labelledby="staticArchiveTitle">
        <p class="static-gallery__kicker">${archive.length} public projects</p>
        <h2 id="staticArchiveTitle">Archive</h2>
        <div class="static-archive-list">
      ${archive.map(archiveRecord).join('\n      ')}
        </div>
        ${labFragments.length ? `<details class="static-lab-fragments"><summary>Lab fragments · ${labFragments.length}</summary><div class="static-archive-list">${labFragments.map(archiveRecord).join('\n')}</div></details>` : ''}
      </section>
    </div>
    <!-- STATIC-GALLERY:END -->`;

const page = fs.readFileSync(pagePath, 'utf8');
const mountPattern = /(<div id="galleryMount">)[\s\S]*?(<\/div>\r?\n\s*\r?\n\s*<div class="gallery-empty")/;
const nextPage = page.replace(mountPattern, `$1\n    ${generated}\n  $2`);
if (nextPage === page && !page.includes('STATIC-GALLERY:START')) {
  throw new Error('Could not locate the galleryMount replacement boundary.');
}

const summary = `${selected.length} selected, ${explorations.length} exploration projects, ${buildThreads.length} build threads, ${archive.length} archive records, and ${labFragments.length} lab fragments`;
if (checkOnly) {
  if (nextPage !== page) {
    console.error('projects.html static gallery is stale. Run npm run portfolio:generate.');
    process.exit(1);
  }
  console.log(`Static portfolio is current: ${summary}.`);
} else {
  fs.writeFileSync(pagePath, nextPage, 'utf8');
  console.log(`Generated ${summary} in projects.html.`);
}
