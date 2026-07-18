(function portfolioContentModel() {
  'use strict';

  const ALL_PROJECT_KEYS = Object.freeze([
    'mro',
    'edge',
    'hub',
    'ix',
    'ai-studio-mcp',
    'ai-studio-millon',
    'change-graph',
    'new-view',
    'rl26',
    'mx-migration',
    'mx-sap',
    'sap-replace',
    'sfdc-v1',
    'sfdc-main',
    'supply-risk',
    'plm-vis',
    'db-jdbc',
    '4090',
    'bom',
    'dt-composer',
    'hyperv',
    'llms',
    'video',
    'explore',
    'networking',
    'one-pager',
    'personal',
    'playwright',
    'pricebook',
    'progression',
    'racer',
    'protein',
    'siemens-ppts',
    'nx',
    'graph',
    'capital',
    'flights-mcp',
    'graph-rag',
    'capital-mcp',
    'nx-mendix',
    'tc-change',
    'tc-story',
    'mcp-dev',
    'nx-journals',
    'et-site',
    'info-site',
    'codex',
    'goals',
    'luma',
    'ml-dev',
    'time',
    'widgets',
    'evora',
    'lunch',
    'world',
    'hello',
    'custom-dirs',
    'neo4j-lab',
    'copilot365',
    'notes',
    'obsidian',
    'mx-docker',
    'soa'
  ]);

  const SELECTED_KEYS = Object.freeze([
    'playwright',
    'dt-composer',
    'nx',
    'soa',
    'tc-change',
    'widgets',
    'mro',
    'video'
  ]);

  const EXPLORATION_KEYS = Object.freeze([
    'graph',
    'new-view',
    'edge',
    'llms',
    'protein',
    'world'
  ]);

  const CATEGORIES = Object.freeze([
    Object.freeze({
      key: 'agents-mcp',
      label: 'Agents & MCP',
      description: 'Tool surfaces, gateways, and agent-control infrastructure.'
    }),
    Object.freeze({
      key: 'industrial-applications',
      label: 'Industrial applications',
      description: 'Operator-facing applications for engineering and operations workflows.'
    }),
    Object.freeze({
      key: 'plm-cad',
      label: 'PLM & CAD',
      description: 'Teamcenter, NX, JT, BOM, and digital-thread integrations.'
    }),
    Object.freeze({
      key: 'edge-manufacturing',
      label: 'Edge & manufacturing',
      description: 'Factory telemetry, MES, deployment, and production-system work.'
    }),
    Object.freeze({
      key: 'local-tools',
      label: 'Local tools',
      description: 'Desktop utilities, build tooling, documentation, and personal work systems.'
    }),
    Object.freeze({
      key: 'experiments',
      label: 'Experiments',
      description: 'Applied research and deliberately bounded prototypes.'
    })
  ]);

  const CASE_STUDY_SLUGS = Object.freeze({
    playwright: 'maia-local-mcp',
    'dt-composer': 'dtc-production-copilot',
    nx: 'nx-mcp-automation',
    soa: 'teamcenter-soa-mcp',
    'tc-change': 'teamcenter-change-dashboard',
    widgets: 'mendix-widget-foundry',
    mro: 'mro-workbench',
    video: 'video-analyzer-studio'
  });

  const CATEGORY_BY_KEY = Object.freeze({
    mro: 'industrial-applications',
    edge: 'edge-manufacturing',
    hub: 'local-tools',
    ix: 'industrial-applications',
    'ai-studio-mcp': 'agents-mcp',
    'ai-studio-millon': 'experiments',
    'change-graph': 'plm-cad',
    'new-view': 'plm-cad',
    rl26: 'local-tools',
    'mx-migration': 'local-tools',
    'mx-sap': 'edge-manufacturing',
    'sap-replace': 'industrial-applications',
    'sfdc-v1': 'local-tools',
    'sfdc-main': 'local-tools',
    'supply-risk': 'industrial-applications',
    'plm-vis': 'plm-cad',
    'db-jdbc': 'local-tools',
    '4090': 'plm-cad',
    bom: 'plm-cad',
    'dt-composer': 'edge-manufacturing',
    hyperv: 'local-tools',
    llms: 'experiments',
    video: 'local-tools',
    explore: 'industrial-applications',
    networking: 'local-tools',
    'one-pager': 'local-tools',
    personal: 'experiments',
    playwright: 'agents-mcp',
    pricebook: 'industrial-applications',
    progression: 'local-tools',
    racer: 'experiments',
    protein: 'experiments',
    'siemens-ppts': 'local-tools',
    nx: 'agents-mcp',
    graph: 'plm-cad',
    capital: 'plm-cad',
    'flights-mcp': 'agents-mcp',
    'graph-rag': 'experiments',
    'capital-mcp': 'agents-mcp',
    'nx-mendix': 'plm-cad',
    'tc-change': 'plm-cad',
    'tc-story': 'plm-cad',
    'mcp-dev': 'agents-mcp',
    'nx-journals': 'plm-cad',
    'et-site': 'local-tools',
    'info-site': 'plm-cad',
    codex: 'experiments',
    goals: 'local-tools',
    luma: 'experiments',
    'ml-dev': 'local-tools',
    time: 'local-tools',
    widgets: 'local-tools',
    evora: 'industrial-applications',
    lunch: 'experiments',
    world: 'experiments',
    hello: 'experiments',
    'custom-dirs': 'plm-cad',
    'neo4j-lab': 'agents-mcp',
    copilot365: 'agents-mcp',
    notes: 'local-tools',
    obsidian: 'local-tools',
    'mx-docker': 'edge-manufacturing',
    soa: 'agents-mcp'
  });

  const STATUS_BY_KEY = Object.freeze({
    mro: 'Working prototype',
    edge: 'Working prototype',
    hub: 'Internal utility',
    ix: 'Interface concept',
    'ai-studio-mcp': 'Working prototype',
    'ai-studio-millon': 'Applied research',
    'change-graph': 'Interface concept',
    'new-view': 'Working prototype',
    rl26: 'Documentation',
    'mx-migration': 'Documentation',
    'mx-sap': 'Documentation',
    'sap-replace': 'Internal utility',
    'sfdc-v1': 'Archived artifact',
    'sfdc-main': 'Internal utility',
    'supply-risk': 'Working prototype',
    'plm-vis': 'Documentation',
    'db-jdbc': 'Internal utility',
    '4090': 'Archived artifact',
    bom: 'Working prototype',
    'dt-composer': 'Working prototype',
    hyperv: 'Archived artifact',
    llms: 'Applied research',
    video: 'Packaged desktop app',
    explore: 'Working prototype',
    networking: 'Internal utility',
    'one-pager': 'Internal utility',
    personal: 'Working prototype',
    playwright: 'Packaged Windows tool',
    pricebook: 'Working prototype',
    progression: 'Internal utility',
    racer: 'Working prototype',
    protein: 'Applied research',
    'siemens-ppts': 'Internal utility',
    nx: 'Working prototype',
    graph: 'Working prototype',
    capital: 'Case study',
    'flights-mcp': 'Working prototype',
    'graph-rag': 'Applied research',
    'capital-mcp': 'Working prototype',
    'nx-mendix': 'Working prototype',
    'tc-change': 'Working prototype',
    'tc-story': 'Case study',
    'mcp-dev': 'Documentation',
    'nx-journals': 'Archived artifact',
    'et-site': 'Documentation',
    'info-site': 'Working prototype',
    codex: 'Case study',
    goals: 'Archived artifact',
    luma: 'Applied research',
    'ml-dev': 'Internal utility',
    time: 'Internal utility',
    widgets: 'Packaged collection',
    evora: 'Interface concept',
    lunch: 'Working prototype',
    world: 'Working prototype',
    hello: 'Archived artifact',
    'custom-dirs': 'Internal utility',
    'neo4j-lab': 'Working prototype',
    copilot365: 'Working prototype',
    notes: 'Internal utility',
    obsidian: 'Archived artifact',
    'mx-docker': 'Internal utility',
    soa: 'Working prototype'
  });

  const STORIES = Object.freeze({
    playwright: Object.freeze({
      summary: 'Makes local agent authority visible and controllable across Mendix development work.',
      problem: 'A useful local agent needs access to files, processes, browsers, builds, and documentation, but unrestricted desktop authority is too broad.',
      contribution: 'I built a self-contained Windows MCP server and native control center for Mendix, Git, widget, build, task, browser, and documentation tooling, with interdependent capability gates.',
      proof: 'The project includes a TypeScript and Node package, Streamable HTTP transport, a standalone executable path, a documented safety model, and a browser-safe control-center walkthrough.',
      result: 'Local tool access becomes an explicit set of capabilities that can be enabled, inspected, and kept within an allowed workspace.'
    }),
    'dt-composer': Object.freeze({
      summary: 'Makes an assembly-line shortfall diagnosable from one interface while keeping the MES evidence and agent tool path visible.',
      problem: 'Plant geometry, station state, and diagnostic reasoning are difficult to follow when they live in separate views and the recommendation hides its evidence.',
      contribution: 'I built the React and Three.js production view and paired it with LangGraph and ReAct diagnostic, recovery, and simulation tools in scripted and live modes.',
      proof: 'The browser build opens a throughput alert, shows the 3D final-assembly line, identifies the constrained station, and exposes the diagnosis-to-recovery tool sequence.',
      result: 'An operator can inspect the shortfall, the source state, and the proposed recovery path in one continuous workflow.'
    }),
    nx: Object.freeze({
      summary: 'Wraps 68 NXOpen operations in typed MCP tools for modeling, feature creation, file handling, and FEA results.',
      problem: 'CAD automation is hard to reuse conversationally when geometry, feature, and analysis operations remain isolated in journals or opaque commands.',
      contribution: 'I built a FastMCP server over NXOpen with 68 typed operations spanning modeling, features, file handling, and FEA result access.',
      proof: 'The project includes the 68-operation inventory, an NX runtime capture, a cargo-ship benchmark artifact, and representative browser previews for solid modeling and stress response.',
      result: 'NX operations become explicit agent tools with named inputs and outputs instead of an unstructured desktop-control sequence.'
    }),
    soa: Object.freeze({
      summary: 'Lets an MCP client work through authenticated Teamcenter SOA sessions, with separate read, edit, and full-write gates.',
      problem: 'An agent needs authenticated Teamcenter context to be useful, but a single undifferentiated permission level makes enterprise operations difficult to govern.',
      contribution: 'I built a FastMCP gateway over Teamcenter SOA with session authentication, local and Eureka modes, resources, prompts, and runtime write gates.',
      proof: 'The gateway registers 77 tools, documents its session and discovery modes, and includes a redacted walkthrough of search, object loading, BOM expansion, and permission changes.',
      result: 'The client can discover 77 named Teamcenter operations, while the operator can see which write level is enabled before a call runs.'
    }),
    'tc-change': Object.freeze({
      summary: 'Moves Teamcenter change reporting out of spreadsheet rollups and into a query-backed view of KPI, workflow, and impact evidence.',
      problem: 'Saved-query results, workflow state, and downstream impact are difficult to review when they must be reconstructed across spreadsheet exports.',
      contribution: 'I built a reporting dashboard that uses Teamcenter saved queries and SOA hydration to assemble change KPIs, workflow state, and impact views.',
      proof: 'The documented implementation and sanitized walkthrough show the saved-query input, hydrated change records, KPI summaries, workflow stages, and linked impact context.',
      result: 'Reviewers can follow current change state and impact in one view instead of rebuilding the story from separate rollups.'
    }),
    widgets: Object.freeze({
      summary: 'Ten packaged Mendix widgets, plus the MxWidgetForge and Mx Pluggable Widget Complete Markdown specs I shared so other builders could reuse the build, validation, accessibility, and .mpk packaging process.',
      problem: 'Each pluggable widget repeats the same XML, generated typing, accessibility, build, packaging, and deployment decisions unless the working procedure is captured.',
      contribution: 'I packaged ten Mendix widgets, then turned the recurring XML, typing, accessibility, build, and validation rules into three agent-spec Markdown guides and two reusable skills that I shared with other Mendix builders.',
      proof: 'The portfolio includes the live Diagram Editor LocalLab, a packaged MPK artifact, and the MxWidgetForge and Mx Pluggable Widget Complete specifications with their build and validation constraints.',
      result: 'The learned workflow becomes a portable specification and repeatable packaging path rather than staying inside one widget repository.'
    }),
    mro: Object.freeze({
      summary: 'Keeps inspection evidence, asset context, repair planning, and disposition inside one guided work-order flow.',
      problem: 'An MRO decision becomes harder to follow when inspection findings, JT context, service BOM data, and disposition steps are separated.',
      contribution: 'I built a React 19 and Siemens iX prototype with Zustand state, JT context, and a guided path from work-order intake through assessment and disposition.',
      proof: 'The live browser build lets a visitor open a sample work order, inspect the asset and service BOM, resume the damage assessment, and carry findings into disposition.',
      result: 'The evidence needed for a disposition stays connected to the work order as the user advances through the decision.'
    }),
    video: Object.freeze({
      summary: 'A packaged desktop app that sends a local video to Gemini, turns the response into a structured scene report, and keeps prior runs in SQLite.',
      problem: 'Ad hoc video prompts are difficult to compare or revisit when the source, analysis request, report structure, and prior runs are not retained together.',
      contribution: 'I built a packaged desktop workspace for selecting a local video, sending it to Gemini, assembling a structured scene report, and storing each run in SQLite history.',
      proof: 'The project includes the desktop-workspace capture, the documented upload-to-report workflow, and a sanitized interactive reconstruction of provider selection, scene output, and local history.',
      result: 'A video-analysis run becomes a repeatable local record instead of a one-off prompt and response.'
    })
  });

  const MEDIA_ALT = Object.freeze({
    nx: 'Siemens NX viewport showing the SS Charlie cargo-ship benchmark model, including sectional feature planes and an isometric solid view.',
    mro: 'MRO Disposition Workbench dashboard with a resumable turbine-blade inspection, work-order queue, due dates, and priority states.',
    hub: 'Project Action Hub dashboard listing local runnable projects, quick tools, execution commands, and recent process history.',
    ix: 'Nexus iX interface concept showing a machine-signal-to-operator-action path for an illustrative industrial-edge scenario.',
    'new-view': 'NewView JT assembly viewer displaying a blue configuration-enclosure model in isometric wireframe mode.',
    'dt-composer': 'DTC Production Co-Pilot showing a 3D aircraft final-assembly line, a red bottleneck station, throughput metrics, and the agent diagnosis panel.',
    'change-graph': 'Quality command-center dashboard connecting Opcenter NCRs, Teamcenter engineering changes, CAPA status, delivery risk, and work orders.',
    'nx-mendix': 'Four-view CAD output for a configurable electronics enclosure, with length and height dimensions, flange callouts, and embossed text.',
    'ai-studio-millon': 'AI Studio endpoint setup with Gradient Boosted Trees selected and predictive-cost training artifacts listed.',
    graph: 'Teamcenter Graph Experience with an item-to-revision graph canvas and a selection inspector explaining the chosen RDF edge and query intent.',
    video: 'Video Analyzer Studio with a local video drop zone, Gemini scene-report controls, SQLite history panel, and analysis stages.',
    widgets: 'MxWidgetForge agent specification outlining Mendix widget constraints, reusable skill knowledge, and a six-step build and validation workflow.',
    protein: 'GENE OS landing screen for a gene and protein interaction simulator, with simulation, DepMap-style context, and SVG visualization features.'
  });

  const PROJECT_OVERRIDES = Object.freeze({
    ix: Object.freeze({
      name: 'Nexus iX Workflow Concept',
      summary: 'Browser interface concept built with locally bundled Siemens iX components to explore a signal-to-action workflow across maintenance, quality, and energy scenarios.'
    })
  });

  function assertExactCoverage(label, record, expectedKeys) {
    const actualKeys = Object.keys(record);
    const expected = new Set(expectedKeys);
    const missing = expectedKeys.filter((key) => !Object.prototype.hasOwnProperty.call(record, key));
    const extra = actualKeys.filter((key) => !expected.has(key));
    if (missing.length || extra.length) {
      throw new Error(`${label} coverage mismatch; missing: ${missing.join(', ') || 'none'}; extra: ${extra.join(', ') || 'none'}`);
    }
  }

  if (new Set(ALL_PROJECT_KEYS).size !== 63) {
    throw new Error('Portfolio content model must contain 63 unique project keys.');
  }

  assertExactCoverage('Category', CATEGORY_BY_KEY, ALL_PROJECT_KEYS);
  assertExactCoverage('Status', STATUS_BY_KEY, ALL_PROJECT_KEYS);
  assertExactCoverage('Case-study slug', CASE_STUDY_SLUGS, SELECTED_KEYS);
  assertExactCoverage('Selected story', STORIES, SELECTED_KEYS);

  const validCategories = new Set(CATEGORIES.map((category) => category.key));
  ALL_PROJECT_KEYS.forEach((key) => {
    if (!validCategories.has(CATEGORY_BY_KEY[key])) {
      throw new Error(`Unknown category "${CATEGORY_BY_KEY[key]}" for ${key}.`);
    }
    if (!STATUS_BY_KEY[key]) {
      throw new Error(`Missing status for ${key}.`);
    }
  });

  const selectedSet = new Set(SELECTED_KEYS);
  const explorationOverlap = EXPLORATION_KEYS.filter((key) => selectedSet.has(key));
  const unknownCuratedKeys = [...SELECTED_KEYS, ...EXPLORATION_KEYS].filter((key) => !ALL_PROJECT_KEYS.includes(key));
  const duplicateSlugs = Object.values(CASE_STUDY_SLUGS).filter((slug, index, values) => values.indexOf(slug) !== index);
  if (explorationOverlap.length || unknownCuratedKeys.length || duplicateSlugs.length) {
    throw new Error('Portfolio curation contains overlapping, unknown, or duplicate route entries.');
  }

  window.PORTFOLIO_CONTENT = Object.freeze({
    allProjectKeys: ALL_PROJECT_KEYS,
    selectedKeys: SELECTED_KEYS,
    explorationKeys: EXPLORATION_KEYS,
    categories: CATEGORIES,
    categoryByKey: CATEGORY_BY_KEY,
    statusByKey: STATUS_BY_KEY,
    caseStudySlugs: CASE_STUDY_SLUGS,
    stories: STORIES,
    mediaAlt: MEDIA_ALT,
    projectOverrides: PROJECT_OVERRIDES
  });
})();
