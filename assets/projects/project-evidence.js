(function () {
  'use strict';

  const simulated = 'The Interactive tab is a deterministic, sanitized browser reconstruction of the documented workflow. It does not connect to a live enterprise system, model provider, filesystem, or credential store.';
  const realStatic = 'The Interactive tab runs a real static build from the project with browser-safe fixtures. Host-only and backend-only behavior is identified inside the preview.';

  window.PROJECT_EVIDENCE = Object.freeze({
    mro: { files:[['README.md','Defines the React MRO workflow and portable browser runtime.'],['mro-workbench/package.json','Confirms React 19, Vite, Siemens iX, and Zustand.']], demo:realStatic },
    edge: { files:[['CLAUDE.md','Documents the Node-RED, OPC UA, MQTT, IIH asset, nine signals, and one-second publish cycle.']], demo:simulated },
    hub: { files:[['ProjectHub.App.csproj','Confirms the .NET 10 WPF, WebView2, and EF Core desktop shell.'],['Services/ProjectScanner.cs','Defines repository discovery and metadata scanning.'],['ui/package.json','Confirms the embedded React/Vite interface.']], demo:realStatic },
    ix: { files:[['index.html','Defines the Nexus application shell and locally bundled Siemens iX runtime.'],['studio.js','Implements the industrial signal path, capability navigation, and operator workflows.']], demo:realStatic },
    'ai-studio-mcp': { files:[['README.md','Documents the installable AI Studio MCP Agent extension, its connection profiles, chat modes, and external MCP-server hook.'],['docs/jar-file-index.csv','Indexes the unpacked extension contents.']], demo:simulated },
    'ai-studio-millon': { files:[['AIHUB_SCORING_GUIDE.md','Documents publishing an AI Studio scoring process to AI Hub and calling it from an application.']], demo:simulated },
    'change-graph': { files:[['README.md','Defines the cross-system quality, change, cost, design-inbox, and copilot cockpit.']], demo:simulated },
    'new-view': { files:[['package.json','Identifies the Mendix pluggable-widget package.'],['src/NewView.xml','Defines PLMVisWeb JT viewer properties and actions.'],['test.html','Provides the original standalone PLMVisWeb/JTReader validation path used by the live preview.']], demo:realStatic },
    rl26: { files:[['CLAUDE.md','Defines the six-guide curriculum, transcript sources, generator, format, and known gaps.'],['generate_docs_v2.py','Builds the DOCX guides with the reviewed template.']], demo:simulated },
    'mx-migration': { files:[['1024-react-retrospective.md','Records the failed migration approaches, error evidence, guardrails, and reset recommendation.']], demo:simulated },
    'mx-sap': { files:[['README.md','Documents the self-contained ten-slide Mendix and MES presentation and navigation.'],['MxSAPME-Presentation.html','Contains the actual presentation surface.']], demo:simulated },
    'sap-replace': { files:[['mendix_expressions.md','Contains the conditional Mendix demo-data expressions and their intended fallback use.']], demo:simulated },
    'sfdc-v1': { files:[['README.md','Preserves the first localhost OAuth-broker implementation that informed the current Salesforce Local Token Broker.']], demo:simulated },
    'sfdc-main': { files:[['README.md','Defines automatic refresh, CLI and binary packaging, browser/headless flows, and read-only examples.'],['package.json','Confirms the Node/Bun scripts and package surface.']], demo:simulated },
    'supply-risk': { files:[['README.md','Documents disruption scenarios, graph reasoning, forecasting assets, and the demonstrator boundary.'],['pluggable-widgets/SupplyChainGlobe/src/SupplyChainGlobe.xml','Defines the Mendix 3D globe widget contract.'],['pluggable-widgets/SupplyChainCharts/src/SupplyChainCharts.xml','Defines the Mendix analytical-chart widget contract.'],['pluggable-widgets/AgentGraphEditor/src/AgentGraphEditor.xml','Defines the Mendix agent-graph editor widget contract.']], demo:simulated },
    'plm-vis': { files:[['serve-docs.js','Serves the parsed SDK documentation.'],['parse-docs.js','Transforms source documentation into the searchable mirror.'],['docs/markdown/PLMVisWeb.Viewer.md','Documents the viewer API surface.']], demo:simulated },
    'db-jdbc': { files:[['README.md','Documents the PostgreSQL external-database fixture and H2 connector alternative.']], demo:simulated },
    '4090': { files:[['README.md','Describes the preserved Jetson Thor model artifact used alongside the NX automation work.'],['Jetson_Thor_DevKit_V01_stp.prt / .fac','The repository’s native and faceted NX files.']], demo:simulated },
    bom: { files:[['siemens.TcBOM/TcBOM.xml','Defines the Mendix widget, Product UID and revision inputs, ACE tree, and selection outputs.']], demo:simulated },
    'dt-composer': { files:[['README.md','Defines the 3D plant, MES dashboard, station views, and co-pilot.'],['app/frontend/src/App.tsx','Composes the production view, station state, alert flow, and co-pilot panel.'],['app/backend/dtc_copilot/tools.py','Defines the diagnostic, recovery, and simulation tool contracts.']], demo:realStatic },
    hyperv: { files:[['IEVD/Virtual Machines','Contains the preserved Hyper-V configuration for the Industrial Edge Virtual Device used by the Realize LIVE 2026 demonstration.'],['IEVD/Snapshots','Contains the recovery-state inventory for the virtual edge lab.']], demo:simulated },
    llms: { files:[['README.md','Documents model discovery, Chat, Agent, Transcribe, and benchmark families.'],['pyproject.toml','Confirms the workbench package and runtime.']], demo:simulated },
    video: { files:[['README.md','Defines local upload, provider analysis, structured scene reports, and history.']], demo:simulated },
    explore: { files:[['README.md','Defines the 3D lifecycle map, 2D journey, editor, drafts, publication, and SQLite state.']], demo:simulated },
    networking: { files:[['DemoRouter-CheatSheet.md','Documents setup and operational checks for the demo router.'],['GL-MT300N-V2-audit.md','Records the device audit and security findings.'],['demo-setup.ps1','Implements the setup and test workflow.']], demo:simulated },
    'one-pager': { files:[['SIEMENS_1PAGER_STYLE_GUIDE.md','Defines the fixed A4 composition and writing rules.'],['build-pdf.js','Runs the Puppeteer HTML-to-PDF build.']], demo:simulated },
    personal: { files:[['leagueOfGriffins/README.md','Defines the RUNE DIFF Unreal Engine 5 vertical slice and the champion, build, and combat systems produced during the GenAI benchmark.']], demo:simulated },
    playwright: { files:[['README.md','Defines Maia Local MCP, capability gates, Mendix/Git/widget/task/browser tools, and safety model.'],['package.json','Confirms the TypeScript/Node package and release scripts.']], demo:simulated },
    pricebook: { files:[['README.md','Defines the Neo4j graph, iX viewer, workbook importer, FastAPI surface, and LLM chat.'],['package.json','Confirms the frontend and API development surfaces.']], demo:simulated },
    progression: { files:[['progBoardRequirements.md','Defines the required progression evidence sections.'],['EXPLORE_AND_ORGANIZE.plan.md','Documents the evidence-collection and presentation plan.'],['board-data.js','Contains the board structure.']], demo:simulated },
    racer: { files:[['README.md','Defines the Eifel Apex Godot benchmark artifact: cars, circuits, controls, checkpoints, laps, and packaged builds.']], demo:simulated },
    protein: { files:[['README.md','Defines the gene/protein simulator and motif interactions.'],['src/services/depmap.ts','Explicitly implements simulated DepMap-style context.']], demo:realStatic },
    'siemens-ppts': { files:[['skill/SKILL.md','Defines the deck narrative patterns, generation helpers, rendering, and QA workflow.']], demo:simulated },
    nx: { files:[['README.md','Canonical inventory of the 68 NX automation tools and server behavior.'],['CLAUDE.md','Documents NXOpen/remoting architecture and verification workflow.']], demo:simulated },
    graph: { files:[['README.md','Defines Teamcenter/Mendix ingestion and enterprise graph integration.'],['CLAUDE.md','Documents RDF/SPARQL transformation and ontology-edge validation.']], demo:simulated },
    capital: { files:[['progressionBoard/board-data.js','Records the demonstrated Capital Copilot open-weight-model proof and the company-owned AI-infrastructure result.']], demo:simulated },
    'flights-mcp': { files:[['README.md','Defines the FastMCP Duffel search server and supported trip shapes.'],['src/flights/services/search.py','Implements the read-only offer search.']], demo:simulated },
    'graph-rag': { files:[['graphrag_core.py','Implements local graph retrieval over asset, telemetry, and work-order context.'],['src/App.jsx','Provides the AG-UI chat and trace surface.']], demo:simulated },
    'capital-mcp': { files:[['README.md','Documents the local MCP wrapper around Capital’s existing REST/OpenAPI surface and its per-session login/logout path.']], demo:simulated },
    'nx-mendix': { files:[['CLAUDE.md','Defines polling, parametric inputs, NX template execution, exports, and result PATCH behavior.']], demo:simulated },
    'tc-change': { files:[['README.md','Defines the reporting dashboard and spreadsheet-replacement goal.'],['CLAUDE.md','Documents saved queries, SOA hydration, KPIs, workflow, and impact views.']], demo:simulated },
    'tc-story': { files:[['CLAUDE.md','Defines the fixed eight-scene story, six-system manifest, and critical traversal.']], demo:simulated },
    'mcp-dev': { files:[['flights-mcp/README.md','Documents the cloned read-only flights server.'],['winMCP/Windows-MCP/README.md','Documents the cloned Windows desktop MCP surface.']], demo:simulated },
    'nx-journals': { files:[['simLaunch.cs','Recorded NXOpen FEM and simulation-setup calls used to understand the ordered automation path.'],['algodesign.cs','Recorded feature calls that exposed hardcoded journal limits before operations became typed NX MCP tools.']], demo:simulated },
    'et-site': { files:[['SKILL.md','Contains the frontend-design subject, direction, implementation, and critique instructions.']], demo:simulated },
    'info-site': { files:[['README.md','Defines the read-only Teamcenter semantic graph API and ingestion contract.'],['package.json','Confirms the API service package.']], demo:simulated },
    codex: { files:[['quinn-family-tree/CLAUDE.md','Defines the source-backed genealogy, citations, PDF output, and research gaps.']], demo:simulated },
    goals: { files:[['goals.md','Contains the private goal, minimum, stretch, and evidence drafting structure now represented only as lineage for the public Progression Evidence System.']], demo:simulated },
    luma: { files:[['README.md','Documents the unsupported Luma GraphQL/REST research client and known boundary.']], demo:simulated },
    'ml-dev': { files:[], note:'The enhanced connector JAR is not published in this portfolio. The preview therefore explains the user-supplied connector contribution without substituting a different AI Studio experiment as proof.', demo:simulated },
    time: { files:[['timetracker.html','Contains the review-and-adjustment surface for weekly opportunity hours. It does not by itself prove the Microsoft 365 Copilot, WorkIQ, or Salesforce context-gathering steps.']], demo:simulated },
    widgets: {
      resource: {
        src: 'assets/resources/mx-pluggable-widget-complete.agent.md',
        title: 'Agent specification resource',
        note: 'Open and read mx-pluggable-widget-complete.agent.md in raw Markdown.'
      },
      artifacts:[
        { src:'assets/projects/widget_forge_agent_cover.png', alt:'MxWidgetForge agent specification showing its core knowledge, build constraints, and six-step approach.', title:'MxWidgetForge', note:'The focused agent wrapper for complete, buildable Mendix widget output.' },
        { src:'assets/projects/widget_complete_agent_cover.png', alt:'Mx Pluggable Widget Complete specification showing non-negotiables, widget scale, workflow, and definition of done.', title:'Mx Widget Complete', note:'The later self-contained, harness-agnostic build contract.' }
      ],
      files:[
        ['assets/resources/mx-pluggable-widget-complete.agent.md','Consolidates the workflow into a self-contained, harness-agnostic specification grounded in official Mendix sources and an explicit Definition of Done.'],
        ['.github/agents/mx-widget-forge.agent.md','Defines the complete widget-building agent with XML, generated-typing, accessibility, build, lint, package, and deployment guardrails.'],
        ['.github/agents/mx-widget-artisan.agent.md','Adds the focused UI craft, interaction, testing, and accessibility discipline learned across the working widget collection.'],
        ['.github/skills/mendix-pluggable-widget/SKILL.md','Carries the reusable technical procedure and property-type reference loaded by the focused agent.'],
        ['.github/skills/mendix-widget-ui-craft/SKILL.md','Captures UI patterns for dashboards, matrices, timelines, kanban, selection bridges, and LocalLab development.'],
        ['DiagramEditorWidget/src/DiagramEditorWidget.xml','Defines the packaged Mendix widget contract and Studio Pro properties.'],
        ['DiagramEditorWidget/MENDIX_TESTING_GUIDE.md','Documents configuration, events, permissions, import behavior, testing, and deployment.'],
        ['DiagramEditorWidget/dist/1.0.0/enterprisewidgets.DiagramEditorWidget.mpk','Concrete packaged output from the same foundry, shown alongside the live Agent Graph Editor widget lab.']
      ],
      demo:realStatic
    },
    evora: { files:[['fleet-control-center.html','Contains the single-file drone fleet control interface and status model.']], demo:simulated },
    lunch: { files:[['README.md','Defines the AI concierge, deal radar, price comparison, MapLibre, and model tool calling.']], demo:simulated },
    world: { files:[['CLAUDE.md','Defines the Cesium prototype, its entity and imagery adapters, and the inspection modes. The public walkthrough uses browser-safe fixture data and does not claim every layer is live.']], demo:simulated },
    hello: { files:[['index.html','The complete animated Hello World project.']], demo:simulated },
    'custom-dirs': { files:[['customDirs.dat','Points NX at the managed startup location.'],['startup/NXHostFacade.dll','The deployed NX startup library and its neighboring diagnostics.']], demo:simulated },
    'neo4j-lab': { files:[['README.md','Documents the Neo4j Desktop MCP surface, although its 22-tool heading trails the current source.'],['src/tools/*.ts','Registers 24 tools across discovery, lifecycle, databases, graph, plugins, backup, settings, and connections.'],['package.json','Confirms the MCP server package and scripts.']], demo:simulated },
    copilot365: { files:[['README.md','Defines the Windows CLI/MCP desktop bridge and read-only authority.'],['CLAUDE.md','Documents MSAA/PostMessage behavior and safety constraints.'],['pyproject.toml','Confirms the Python package and entry points.']], demo:simulated },
    notes: { files:[['README.md','Defines the local plaintext engineering-memory structure for reusable notes, decisions, and runbooks.']], demo:simulated },
    obsidian: { files:[['core-plugins.json','Records enabled core plugins supporting the larger engineering-memory workflow.'],['community-plugins.json','Records community plugin selection.'],['plugins/*/manifest.json','Contains installed plugin metadata.']], demo:simulated },
    'mx-docker': { files:[['skills/mendix-docker-snapshot-deploy/SKILL.md','Defines the isolated artifact, migration, health, and recovery workflow.'],['evora-docker/docker-compose.yml','Defines the application and database stack.'],['evora-docker/helper scripts','Implement preflight, seed, migration, and recovery operations.']], demo:simulated },
    soa: { files:[['README.md','Defines Teamcenter sessions, local/Eureka modes, resources, prompts, and write gates.'],['app/main.py','Contains 77 registered MCP tool decorators and the real tool names.']], demo:simulated }
  });
})();
