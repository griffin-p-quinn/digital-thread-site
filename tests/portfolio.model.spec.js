import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import {
  gotoPortfolio,
  loadPortfolioModel,
  normalized,
  projectKey,
  readProjectAsset,
  readPortfolioHtml
} from './helpers/portfolio.js';

const model = loadPortfolioModel();
const projects = model.projects || [];
const byKey = new Map(projects.map((project) => [projectKey(project), project]));

const corrections = {
  notes: {
    title: '_notes — Engineering Memory System',
    required: [/plaintext/i, /engineering (notes|context|memory)/i, /searchable/i]
  },
  'ml-dev': {
    title: 'AI Studio Open-Weight LLM Connector',
    required: [/existing/i, /connector.*JAR|JAR.*connector/i, /open-weight/i]
  },
  'ai-studio-millon': {
    title: 'AI Studio AutoModel → Engineering Change Cost',
    required: [/AutoModel/i, /AI Hub/i, /engineering.change cost/i, /dashboard|published score/i]
  },
  'capital-mcp': {
    title: 'Capital ECAD MCP Server',
    required: [/existing REST API|Capital.*REST API/i, /local MCP server/i, /typed tools/i]
  },
  hyperv: {
    title: 'Realize LIVE 2026 — Virtual Industrial Edge Lab',
    required: [/Hyper-V/i, /Industrial Edge Virtual Device|IEVD/i, /Industrial Edge Management|IEM/i, /without physical|no physical/i]
  },
  time: {
    title: 'Customer Opportunity Time Intelligence',
    required: [/Microsoft 365 Copilot/i, /calendar/i, /WorkIQ/i, /customer opportunity/i, /Salesforce|SFDC/i]
  },
  racer: {
    title: 'Eifel Apex — Godot GenAI Game Benchmark',
    required: [/benchmark/i, /Codex/i, /Sol/i, /Godot/i]
  },
  personal: {
    title: 'RUNE DIFF — Unreal GenAI Game Benchmark',
    required: [/companion benchmark|benchmark/i, /Codex/i, /Sol/i, /Unreal Engine 5|UE5/i]
  }
};

test.describe('canonical portfolio content model', () => {
  test('covers all 63 projects with structured, project-specific evidence fields', () => {
    expect(projects).toHaveLength(63);
    expect(new Set(projects.map(projectKey)).size).toBe(63);

    for (const project of projects) {
      const key = projectKey(project);
      expect(key, 'project key').toBeTruthy();
      expect(normalized(project.title || project.name), `${key} title`).not.toBe('');
      expect(normalized(project.summary), `${key} summary`).not.toBe('');
      expect(normalized(project.category), `${key} category`).not.toBe('');
      expect(normalized(project.artifactType), `${key} artifactType`).not.toBe('');
      expect(normalized(project.status), `${key} status`).not.toBe('');
      expect(typeof project.public, `${key} public flag`).toBe('boolean');
      expect(normalized(project.collection), `${key} collection`).not.toBe('');
      for (const field of ['roleOfGenAI', 'griffinsRole', 'validation', 'limitations']) {
        expect(normalized(project[field]), `${key}.${field}`).not.toBe('');
      }
      expect(Array.isArray(project.relatedProjects), `${key}.relatedProjects`).toBe(true);
      expect(Array.isArray(project.externalEvidence), `${key}.externalEvidence`).toBe(true);
      for (const related of project.relatedProjects) {
        expect(byKey.has(typeof related === 'string' ? related : projectKey(related)), `${key} related project ${JSON.stringify(related)}`).toBe(true);
      }
      for (const evidence of project.externalEvidence) {
        if (evidence.url) expect(evidence.url, `${key} evidence URL`).toMatch(/^https:\/\//);
        if (evidence.thumbnail && !/^https?:/.test(evidence.thumbnail)) {
          const localPath = path.resolve(process.cwd(), evidence.thumbnail.replace(/^[/\\]+/, ''));
          expect(fs.existsSync(localPath), `${key} evidence thumbnail ${evidence.thumbnail}`).toBe(true);
        }
      }
    }
  });

  test('does not duplicate the 63-record catalog inline', () => {
    const html = readPortfolioHtml();
    expect(html).not.toMatch(/const\s+PROJECTS\s*=\s*\[/);
    expect(html).not.toMatch(/const\s+FALLBACK_PROJECTS\s*=\s*\[/);
  });

  test('uses first-person voice for authored project narratives', () => {
    const narrativeFields = ['summary', 'problem', 'roleOfGenAI', 'griffinsRole', 'proof', 'validation', 'limitations'];
    for (const project of projects) {
      const key = projectKey(project);
      const narrative = narrativeFields.map((field) => project[field]).filter(Boolean).join(' ');
      expect(narrative, `${key} narrative`).not.toMatch(/\bGriffin(?:['’]s)?\b/i);
    }

    const html = readPortfolioHtml();
    expect(html).not.toContain('About Griffin');
    expect(html).not.toContain('Griffin’s role');
    expect(html).not.toContain('a personal portfolio by Griffin Quinn');
  });

  test('gives every selected project a truthful multi-item media gallery', () => {
    expect(model.selectedKeys).toHaveLength(8);
    for (const key of model.selectedKeys) {
      const project = byKey.get(key);
      expect(project, `${key} exists`).toBeTruthy();
      expect(Array.isArray(project.mediaGallery), `${key}.mediaGallery`).toBe(true);
      expect(project.mediaGallery.length, `${key} media count`).toBeGreaterThanOrEqual(2);
      for (const [index, item] of project.mediaGallery.entries()) {
        expect(['image', 'video', 'diagram'], `${key} media ${index} kind`).toContain(item.kind);
        expect(normalized(item.title), `${key} media ${index} title`).not.toBe('');
        expect(normalized(item.alt), `${key} media ${index} alt`).not.toBe('');
        expect(normalized(item.caption), `${key} media ${index} caption`).not.toBe('');
        if (item.kind === 'image' || item.kind === 'video') {
          const assetPath = path.resolve(process.cwd(), item.src.replace(/^[/\\]+/, ''));
          expect(fs.existsSync(assetPath), `${key} media source ${item.src}`).toBe(true);
        }
        if (item.poster) {
          const posterPath = path.resolve(process.cwd(), item.poster.replace(/^[/\\]+/, ''));
          expect(fs.existsSync(posterPath), `${key} media poster ${item.poster}`).toBe(true);
        }
        for (const source of item.sources || []) {
          expect(Number(source.width), `${key} responsive width`).toBeGreaterThan(0);
          const responsivePath = path.resolve(process.cwd(), source.src.replace(/^[/\\]+/, ''));
          expect(fs.existsSync(responsivePath), `${key} responsive source ${source.src}`).toBe(true);
        }
      }
    }
  });

  test('defines all seven required build threads with valid project nodes', () => {
    const threads = model.buildThreads || [];
    const expectedTitles = [
      'Open model workflows',
      'Virtual edge anywhere',
      'Opportunity intelligence',
      'Capital agent stack',
      'Agentic game benchmarks',
      'Teamcenter semantic/change stack',
      'NX automation evolution'
    ];
    expect(threads.map((thread) => normalized(thread.title))).toEqual(expectedTitles);
    for (const thread of threads) {
      const nodes = thread.projects || thread.nodes || [];
      expect(nodes.length, `${thread.title} node count`).toBeGreaterThanOrEqual(2);
      for (const node of nodes) {
        const key = typeof node === 'string' ? node : projectKey(node);
        if (key && byKey.has(key)) continue;
        const stage = typeof node === 'string' ? node : node?.label;
        expect(normalized(stage), `${thread.title} explanatory stage`).not.toBe('');
      }
    }
  });

  for (const [key, correction] of Object.entries(corrections)) {
    test(`${key} matches the authoritative correction`, () => {
      const project = byKey.get(key);
      expect(project, `${key} exists`).toBeTruthy();
      expect(normalized(project.title || project.name)).toBe(correction.title);
      const publicCopy = normalized([
        project.summary,
        project.problem,
        project.griffinsRole,
        project.roleOfGenAI,
        project.validation,
        project.limitations
      ].filter(Boolean).join(' '));
      for (const pattern of correction.required) expect(publicCopy).toMatch(pattern);
    });
  }

  test('removes the disproven AI Studio narratives', () => {
    expect(JSON.stringify(byKey.get('ml-dev'))).not.toMatch(/process.?XML|hardening harness/i);
    expect(JSON.stringify(byKey.get('ai-studio-millon'))).not.toMatch(/annual defect cost|support\/contradict|gradient boosted|\bGBT\b/i);
    expect(readProjectAsset('workbenches-truth-d.js')).not.toMatch(/process.?XML|hardening harness/i);
  });

  test('runtime archive is driven by the canonical titles and summaries', async ({ page }) => {
    await gotoPortfolio(page);
    for (const [key, correction] of Object.entries(corrections)) {
      const row = page.locator(`.archive-row[data-k="${key}"]`);
      await expect(row.locator('.archive-row__main strong')).toHaveText(correction.title);
      await expect(row.locator('.archive-row__main small')).not.toHaveText('');
    }

    for (const artifact of await page.locator('.intro-artifact[data-project-key]').all()) {
      const key = await artifact.getAttribute('data-project-key');
      const project = byKey.get(key);
      expect(project, `hero artifact ${key}`).toBeTruthy();
      await expect(artifact.locator('b')).toHaveText(project.title);
      await expect(artifact.locator('img')).toHaveAttribute('alt', model.mediaAlt[key]);
    }
  });
});
