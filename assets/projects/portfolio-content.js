(function portfolioContentModel() {
  'use strict';

  const CATEGORIES = Object.freeze([
    Object.freeze({ key: 'agents-mcp', label: 'Agents & MCP', description: 'Agent tool surfaces, MCP gateways, and bounded control infrastructure.' }),
    Object.freeze({ key: 'industrial-applications', label: 'Industrial applications', description: 'Applications that make engineering and operations work easier to inspect and act on.' }),
    Object.freeze({ key: 'plm-cad', label: 'PLM & CAD', description: 'Teamcenter, NX, JT, BOM, ECAD, and digital-thread integrations.' }),
    Object.freeze({ key: 'edge-manufacturing', label: 'Edge & manufacturing', description: 'Factory telemetry, MES, deployment, and production-system work.' }),
    Object.freeze({ key: 'local-tools', label: 'Local tools', description: 'Desktop utilities, documentation, build tooling, and personal work systems.' }),
    Object.freeze({ key: 'experiments', label: 'Experiments', description: 'Bounded prototypes and tests of what generative-AI systems can actually produce.' })
  ]);

  const SELECTED_KEYS = Object.freeze(['playwright', 'dt-composer', 'nx', 'soa', 'tc-change', 'widgets', 'mro', 'video']);
  const EXPLORATION_KEYS = Object.freeze(['graph', 'new-view', 'edge', 'llms', 'change-graph', 'copilot365', 'racer', 'et-site', 'codex']);
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

  const LEGACY_CATS = Object.freeze({
    'agents-mcp': ['mcp', 'ai'],
    'industrial-applications': ['app'],
    'plm-cad': ['plm', 'app'],
    'edge-manufacturing': ['edge', 'app'],
    'local-tools': ['exe', 'app'],
    experiments: ['ai', 'app']
  });

  const EXTERNAL_EVIDENCE = Object.freeze({
    nx: Object.freeze([Object.freeze({
      type: 'linkedin',
      label: 'NX MCP automation walkthrough',
      url: '',
      date: '',
      thumbnail: 'assets/projects/social/nx-mcp-automation.png',
      description: 'Poster frame reserved for the public NX MCP walkthrough. It remains hidden until the real LinkedIn post URL is configured.',
      engagementSnapshot: null
    })]),
    soa: Object.freeze([Object.freeze({
      type: 'linkedin',
      label: 'Teamcenter SOA MCP walkthrough',
      url: '',
      date: '',
      thumbnail: 'assets/projects/social/teamcenter-soa-mcp.png',
      description: 'Poster frame reserved for the public Teamcenter walkthrough. It remains hidden until the real LinkedIn post URL is configured.',
      engagementSnapshot: null
    })])
  });

  function defineMedia(items) {
    return Object.freeze(items.map((item) => Object.freeze({
      ...item,
      sources: Object.freeze((item.sources || []).map((source) => Object.freeze({ ...source })))
    })));
  }

  const PROJECT_MEDIA = Object.freeze({
    playwright: defineMedia([
      {
        kind: 'image',
        src: 'assets/projects/maia_control_center_capture.png',
        sources: [
          { src: 'assets/projects/hero-720/maia_control_center_capture.webp', width: 720 },
          { src: 'assets/projects/hero-1024/maia_control_center_capture.webp', width: 1024 }
        ],
        title: 'Maia control center',
        alt: 'Maia control center showing server status, allowed locations, 62 available tools, capability gates, and dependency checks.',
        caption: 'The native control surface keeps local authority, tool availability, and dependency state visible in one place.'
      },
      {
        kind: 'diagram',
        title: 'Local authority map',
        alt: 'Studio Pro Maia connects over local Streamable HTTP to capability gates controlling 62 local tools.',
        caption: 'The agent reaches files, builds, browsers, and documentation only through explicit capability gates.'
      }
    ]),
    'dt-composer': defineMedia([
      {
        kind: 'image',
        src: 'assets/projects/dtc_composer_cover.png',
        sources: [
          { src: 'assets/projects/hero-720/dtc_composer_cover.webp', width: 720 },
          { src: 'assets/projects/hero-1024/dtc_composer_cover.webp', width: 1024 }
        ],
        title: 'Production co-pilot',
        alt: 'DTC Production Co-Pilot showing a 3D final-assembly line, constrained station, manufacturing state, and agent diagnosis panel.',
        caption: 'The production view keeps the line, station evidence, and diagnosis-to-recovery trace on the same screen.'
      },
      {
        kind: 'video',
        src: 'assets/projects/dtc_mcp.mp4',
        poster: 'assets/projects/dtc_composer_cover.png',
        title: 'DTC runtime capture',
        alt: 'Recorded Digital Twin Composer & NVIDIA Omniverse assembly line bottleneck resolution session.',
        caption: 'The retained runtime capture shows the Digital Thread Operations Agent diagnosing and simulating line recovery.'
      },
      {
        kind: 'diagram',
        title: 'Observable recovery path',
        alt: 'Manufacturing execution system evidence flows through the production view into diagnosis, recovery, and simulation tools.',
        caption: 'The recommendation remains attached to both the visible plant state and the tools used to produce it.'
      }
    ]),
    nx: defineMedia([
      {
        kind: 'image',
        src: 'assets/nx-renders/ss-charlie-benchmark.png',
        sources: [
          { src: 'assets/projects/hero-720/ss-charlie-benchmark.webp', width: 720 },
          { src: 'assets/projects/hero-1024/ss-charlie-benchmark.webp', width: 1024 }
        ],
        title: 'SS Charlie benchmark model',
        alt: 'Siemens NX showing the SS Charlie cargo-ship benchmark model with construction planes, solid geometry, and analysis evidence.',
        caption: 'A native NX result created through the typed automation surface and inspected in the engineering host.'
      },
      {
        kind: 'video',
        src: 'assets/projects/nx_mcp.mp4',
        poster: 'assets/nx-renders/ss-charlie-benchmark.png',
        title: 'NX runtime capture',
        alt: 'Recorded NX MCP automation session.',
        caption: 'The retained runtime capture shows the automation operating inside NX; playback starts only on request.'
      },
      {
        kind: 'diagram',
        title: 'Typed NXOpen path',
        alt: 'An AI client calls a FastMCP server whose typed NXOpen tools create inspectable geometry and analysis results in Siemens NX.',
        caption: 'Recorded NXOpen patterns become reusable tool contracts rather than opaque desktop commands.'
      }
    ]),
    soa: defineMedia([
      {
        kind: 'diagram',
        title: 'Teamcenter authority map',
        alt: 'An MCP client enters an authenticated FastMCP gateway, passes an explicit read, edit, or full-write gate, and reaches Teamcenter SOA.',
        caption: 'Session handling and authority gates stay visible before any registered tool reaches Teamcenter.'
      },
      {
        kind: 'video',
        src: 'assets/projects/tc_soa_mcp.mp4',
        poster: 'assets/projects/social/teamcenter-soa-mcp.png',
        title: 'Teamcenter SOA MCP gateway capture',
        alt: 'Recorded Agentic Enterprise Platform session executing Teamcenter SOA change requests.',
        caption: 'The retained runtime capture shows an AI agent executing cross-system change requests via Teamcenter SOA.'
      },
      {
        kind: 'image',
        src: 'assets/projects/social/teamcenter-soa-mcp.png',
        title: 'Gateway case-study cover',
        alt: 'Editorial cover for the MCP-Teamcenter SOA Gateway case study.',
        caption: 'The long-form case study documents the gateway, 77 registered tools, discovery modes, and public-demo boundary.'
      }
    ]),
    'tc-change': defineMedia([
      {
        kind: 'image',
        src: 'assets/projects/tc_change_dashboard_actual_capture.png',
        sources: [
          { src: 'assets/projects/hero-720/tc_change_dashboard_actual_capture.webp', width: 720 },
          { src: 'assets/projects/hero-1024/tc_change_dashboard_actual_capture.webp', width: 1024 }
        ],
        title: 'Change KPI dashboard',
        alt: 'Teamcenter Change KPI Dashboard showing workflow completion, aging, ownership, disposition, and task bottlenecks.',
        caption: 'The reporting surface connects query-backed aggregates to workflow and change-record evidence.'
      },
      {
        kind: 'diagram',
        title: 'Reporting pipeline',
        alt: 'Teamcenter saved queries flow through service-oriented-architecture hydration into KPI, workflow, ownership, aging, and impact views.',
        caption: 'The pipeline replaces detached spreadsheet rollups with inspectable change objects and their derived views.'
      }
    ]),
    widgets: defineMedia([
      {
        kind: 'image',
        src: 'assets/projects/mendix_agent_graph_actual_capture.png',
        sources: [
          { src: 'assets/projects/hero-720/mendix_agent_graph_actual_capture.webp', width: 720 },
          { src: 'assets/projects/hero-1024/mendix_agent_graph_actual_capture.webp', width: 1024 }
        ],
        title: 'Agent Graph Editor',
        alt: 'Mendix Agent Graph Editor showing connected specialist agents, their tools, and the Mendix bridge inspector.',
        caption: 'One working widget from the collection, shown with its graph editing and host-bridge behavior.'
      },
      {
        kind: 'video',
        src: 'assets/projects/molex_agent_dev.mp4',
        poster: 'assets/projects/mendix_agent_graph_actual_capture.png',
        title: 'Agentic Mendix build capture',
        alt: 'Recorded terminal developer agent building a Mendix application live in Mendix Studio Pro.',
        caption: 'The recorded session demonstrates a terminal-based Claude developer agent constructing a Mendix app.'
      },
      {
        kind: 'image',
        src: 'assets/projects/mendix_diagram_editor_actual_capture.png',
        title: 'Diagram Editor widget',
        alt: 'Mendix Diagram Editor showing a packaged interactive diagram surface with nodes, connectors, and editing controls.',
        caption: 'A second packaged widget demonstrates the repeatable build, interaction, and packaging workflow.'
      },
      {
        kind: 'image',
        src: 'assets/projects/widget_forge_agent_cover.png',
        title: 'MxWidgetForge specification',
        alt: 'MxWidgetForge agent specification showing core knowledge, build constraints, and a six-step widget workflow.',
        caption: 'The focused agent wrapper records the constraints required for complete, buildable Mendix widget output.'
      },
      {
        kind: 'image',
        src: 'assets/projects/widget_complete_agent_cover.png',
        title: 'Complete widget contract',
        alt: 'Mx Pluggable Widget Complete specification showing non-negotiables, workflow, and definition of done.',
        caption: 'The later contract turns repeated validation and packaging lessons into a reusable implementation procedure.'
      }
    ]),
    mro: defineMedia([
      {
        kind: 'image',
        src: 'assets/projects/mro_cover.jpg',
        title: 'Guided disposition workbench',
        alt: 'MRO Disposition Workbench showing a turbine-blade work order, inspection status, due dates, and guided disposition actions.',
        caption: 'The work-order surface carries inspection evidence, product context, repair planning, and disposition in one flow.'
      },
      {
        kind: 'image',
        src: 'assets/embeds/mro/inspectionImages/1acceptable.jpg',
        title: 'Acceptable inspection reference',
        alt: 'Close inspection reference of an acceptable turbine-blade tip with an intact edge and surface.',
        caption: 'A browser-safe reference image used to ground the guided inspection decision.'
      },
      {
        kind: 'image',
        src: 'assets/embeds/mro/inspectionImages/1rejected.jpg',
        title: 'Rejected inspection reference',
        alt: 'Close inspection reference of a turbine-blade tip with severe edge wear and deformation.',
        caption: 'The contrasting rejected reference makes the evidence behind a disposition visible.'
      }
    ]),
    graph: defineMedia([
      {
        kind: 'image',
        src: 'assets/projects/teamcenter_semantic_graph_cover.png',
        title: 'Teamcenter Semantic Graph API',
        alt: 'GraphStudio showing Teamcenter RDF graph relationships, query builder, and ontology node structure.',
        caption: 'The GraphStudio interface connects Teamcenter RDF graph relationships and ontology structures.'
      },
      {
        kind: 'video',
        src: 'assets/projects/graph_studio_agent.mp4',
        poster: 'assets/projects/teamcenter_semantic_graph_cover.png',
        title: 'GraphStudio agent capture',
        alt: 'Recorded agentic AI session navigating Teamcenter Knowledge Graph and RDF ontology.',
        caption: 'The retained runtime capture shows an AI agent interacting with the Teamcenter RDF graph ontology.'
      }
    ]),
    video: defineMedia([
      {
        kind: 'image',
        src: 'assets/projects/video_analyzer_report_actual_capture.png',
        sources: [
          { src: 'assets/projects/hero-720/video_analyzer_report_actual_capture.webp', width: 720 },
          { src: 'assets/projects/hero-1024/video_analyzer_report_actual_capture.webp', width: 1024 }
        ],
        title: 'Structured scene report',
        alt: 'Video Analyzer Studio showing media controls, a structured Gemini scene report, and saved run history.',
        caption: 'The report view keeps source media, structured output, and retained run history in the same workspace.'
      },
      {
        kind: 'image',
        src: 'assets/projects/video_analyzer_cover.png',
        title: 'Local analysis workspace',
        alt: 'Video Analyzer Studio ready screen with local file selection, run controls, model status, and SQLite history.',
        caption: 'The packaged desktop flow begins with local selection and makes the requested provider and storage state explicit.'
      },
      {
        kind: 'image',
        src: 'assets/embeds/video-analyzer/studio-poster.png',
        title: 'Browser-safe media fixture',
        alt: 'Dark media studio showing an ocean-video timeline used by the browser-safe Video Analyzer demonstration.',
        caption: 'The public build uses a local poster and sample API rather than uploading media or calling Gemini.'
      }
    ])
  });

  function defineProject(project) {
    const isPublic = project.public !== false;
    const tags = Array.isArray(project.tags) && project.tags.length
      ? project.tags
      : [CATEGORIES.find((category) => category.key === project.category).label, project.artifactType];
    const specs = Array.isArray(project.specs) && project.specs.length
      ? project.specs
      : [['Artifact', project.artifactType], ['State', project.status]];
    return Object.freeze({
      ...project,
      key: project.k,
      name: project.title,
      blurb: project.summary,
      public: isPublic,
      collection: project.collection || 'archive',
      cats: Object.freeze([...(LEGACY_CATS[project.category] || ['app'])]),
      arch: project.arch || (project.category === 'agents-mcp' || project.category === 'experiments' ? 'frontier' : 'utility'),
      tags: Object.freeze([...tags]),
      specs: Object.freeze(specs.map((spec) => Object.freeze([...spec]))),
      relatedProjects: Object.freeze([...(project.relatedProjects || [])]),
      mediaGallery: PROJECT_MEDIA[project.k] || Object.freeze([]),
      externalEvidence: EXTERNAL_EVIDENCE[project.k] || Object.freeze([])
    });
  }

  const PROJECTS = Object.freeze([
    defineProject({
      k: 'mro', title: 'MRO Workbench', category: 'industrial-applications', artifactType: 'Working application', status: 'Working prototype', collection: 'selected',
      summary: 'A maintenance, repair, and overhaul (MRO) workbench that keeps inspection evidence, product context from the lightweight Jupiter Tessellation (JT) 3D engineering format, the service bill of materials (service BOM), repair planning, and disposition in one guided work-order flow.',
      problem: 'Maintenance decisions become hard to review when findings, product context, repair options, and disposition steps live in separate tools.',
      griffinsRole: 'I shaped the workflow and built the React 19 and Siemens iX interface, state model, sample work orders, and guided assessment-to-disposition path.',
      roleOfGenAI: 'Generative AI acted as an implementation partner while I supplied the maintenance domain flow, interface constraints, and acceptance judgment.',
      proof: 'The browser-safe React build lets a visitor open a sample work order, inspect the asset and service BOM, resume an assessment, and carry findings into disposition.',
      validation: 'The public build exercises the complete guided path against sanitized sample data and preserves state across the decision steps.',
      limitations: 'The portfolio build uses sample records and a browser-safe JT context; it is not connected to a production maintenance or PLM system.',
      relatedProjects: ['new-view', 'bom', 'dt-composer'], tags: ['React 19', 'Siemens iX', 'JT context', 'Service BOM'], specs: [['Flow', 'Inspect → assess → disposition'], ['State', 'Zustand'], ['Proof', 'Live browser build']],
      alt: 'MRO Disposition Workbench showing a turbine-blade work order, inspection status, due dates, and guided disposition actions.'
    }),
    defineProject({
      k: 'edge', title: 'Mendix Edge IIoT Gateway', category: 'edge-manufacturing', artifactType: 'Integration', status: 'Working prototype', collection: 'explorations',
      summary: 'A virtual-factory telemetry pipeline that collected nine asset signals over OPC UA, published them over MQTT, and surfaced live operating state in Mendix.',
      problem: 'A useful edge demonstration needs a believable signal path from equipment data to an operator-facing decision, even when physical shop-floor hardware is unavailable.',
      griffinsRole: 'I assembled the Node-RED flow, mapped the nine Industrial IoT signals, configured the OPC UA-to-MQTT path, and built the Mendix-facing operating view.',
      roleOfGenAI: 'Generative AI accelerated the flow and application implementation while I defined the signal semantics, integration boundaries, and expected operating states.',
      proof: 'The retained flow and interactive telemetry reconstruction show the documented signals, one-second sample cadence, alarm injection, and Mendix destination.',
      validation: 'The signal path was checked end to end in a virtual Industrial Edge environment and is reproduced publicly with safe sample values.',
      limitations: 'The public interaction simulates the signals; it is not attached to live equipment and does not claim production latency or reliability.',
      relatedProjects: ['hyperv', 'rl26', 'mx-sap'], tags: ['Mendix', 'Node-RED', 'OPC UA', 'MQTT'], specs: [['Signals', '9'], ['Cadence', '1 second'], ['Path', 'OPC UA → MQTT → Mendix']],
      alt: 'Mendix edge dashboard showing virtual-factory asset signals and current operating state.'
    }),
    defineProject({
      k: 'hub', title: 'Presales Command Hub', category: 'local-tools', artifactType: 'Packaged tool', status: 'Internal utility', collection: 'archive',
      summary: 'A Windows project launcher that finds local repositories, remembers useful metadata, runs bounded commands, and presents their output in one desktop workspace.',
      problem: 'Prototype repositories accumulate different start commands and local prerequisites, making demonstrations slow to find and launch consistently.',
      griffinsRole: 'I built the .NET WPF shell, WebView2-hosted React interface, repository scanner, SQLite metadata store, and bounded process-output view.',
      roleOfGenAI: 'Generative AI helped implement the desktop and web layers from my launch workflow and process-control constraints.',
      proof: 'A browser-safe build exposes the real React interface with sample repositories, filters, favorites, details, and no-op launch behavior.',
      validation: 'The desktop workflow was exercised against local projects; the public build validates navigation and state without starting processes.',
      limitations: 'Repository discovery and process execution require the native Windows host and are intentionally disabled in the browser demo.',
      relatedProjects: ['playwright'], tags: ['.NET', 'WPF', 'WebView2', 'React'], specs: [['Shell', 'WPF'], ['UI', 'React + WebView2'], ['Store', 'SQLite']],
      alt: 'Presales Command Hub listing local projects, launch commands, quick tools, and recent process history.'
    }),
    defineProject({
      k: 'ix', title: 'Nexus iX Workflow Concept', category: 'industrial-applications', artifactType: 'Interactive demo', status: 'Interface concept', collection: 'archive',
      summary: 'A Siemens iX browser concept that follows an illustrative equipment signal into operating context, a recommended response, and an operator action.',
      problem: 'Industrial dashboards often show conditions without making the path from signal to decision and action easy to follow.',
      griffinsRole: 'I chose the signal-to-action narrative, composed the locally bundled Siemens iX components, and built the navigable concept.',
      roleOfGenAI: 'Generative AI helped translate the scoped workflow into interface variations; I selected the scenario, information order, and final design.',
      proof: 'The embedded browser concept can be navigated in light and dark themes and exposes the illustrative operating path.',
      validation: 'The concept was reviewed as an interface and storytelling exercise, not as a connected operational system.',
      limitations: 'The scenario and values are illustrative; no live plant, maintenance, quality, or energy service is connected.',
      relatedProjects: ['edge', 'change-graph'], tags: ['Siemens iX', 'Web Components', 'Workflow concept'], specs: [['Path', 'Signal → context → response → action'], ['Runtime', 'Browser'], ['Data', 'Illustrative']],
      alt: 'Nexus Siemens iX concept showing a signal-to-context-to-operator-action workflow.'
    }),
    defineProject({
      k: 'ai-studio-mcp', title: 'MCP Agent Extension for AI Studio', category: 'agents-mcp', artifactType: 'Integration', status: 'Working prototype', collection: 'archive',
      summary: 'An installable AI Studio extension that adds agent-style chat behavior and can load external Model Context Protocol servers inside the low-code machine-learning environment.',
      problem: 'AI Studio users needed a way to move beyond a single chat response and let an in-product agent discover external MCP tools.',
      griffinsRole: 'I built and packaged the extension JAR, provider-profile flow, MCP server loading, in-studio chat surface, and tool trace.',
      roleOfGenAI: 'The generative model is the runtime reasoning layer: it chooses when to use the external tools exposed through MCP.',
      proof: 'The retained extension and portfolio interaction show connection setup, a provider profile, an attached MCP server, chat, and a visible tool trace.',
      validation: 'The extension path was checked inside AI Studio with configured profiles and external MCP tools.',
      limitations: 'The public interaction reconstructs the workflow without credentials or a live AI Studio runtime; it is distinct from the open-weight connector JAR.',
      relatedProjects: ['ml-dev', 'ai-studio-millon', 'mcp-dev'], tags: ['AI Studio', 'MCP', 'Java', 'Extension JAR'], specs: [['Surface', 'Agent chat'], ['Tools', 'External MCP servers'], ['Package', 'Installable extension']]
    }),
    defineProject({
      k: 'ai-studio-millon', title: 'AI Studio AutoModel → Engineering Change Cost', category: 'experiments', artifactType: 'Working application', status: 'Predictive-model demonstration', collection: 'archive',
      summary: 'Used AI Studio AutoModel to train a predictive engineering-change cost model, deployed it to AI Hub, and built a dashboard that consumes the published scores.',
      problem: 'The demonstration asked how quickly existing engineering-change data could become a deployed predictive process that an application could actually consume.',
      griffinsRole: 'I prepared the demonstration, used AutoModel to build the predictive model, published the scoring process to AI Hub, and built the engineering-change cost dashboard.',
      roleOfGenAI: 'Generative AI supported development of the demo workflow and dashboard; the displayed cost prediction comes from the AutoModel scoring process, not from an LLM.',
      proof: 'The project retains the AutoModel-to-AI Hub scoring guide and the dashboard flow that submits change data and displays published scores.',
      validation: 'The demonstration validated the data-to-deployment-to-application path by consuming the published process from the dashboard.',
      limitations: 'It is a demonstration, not a production cost estimator; the portfolio does not claim a specific algorithm, accuracy, or business outcome.',
      relatedProjects: ['ml-dev', 'ai-studio-mcp'], tags: ['AI Studio AutoModel', 'AI Hub', 'Predictive scoring', 'Dashboard'], specs: [['Flow', 'Data → AutoModel → AI Hub → dashboard'], ['Output', 'Engineering-change cost score'], ['Scope', 'Demonstration']],
      alt: 'Engineering-change cost dashboard connected to a predictive scoring process published from AI Studio to AI Hub.'
    }),
    defineProject({
      k: 'change-graph', title: 'Change Graph Cockpit', category: 'plm-cad', artifactType: 'Interactive demo', status: 'Interface concept', collection: 'explorations',
      summary: 'A cross-system cockpit for tracing a manufacturing-quality problem into engineering change, corrective action, cost evidence, design work, and delivery impact.',
      problem: 'One quality event can affect many systems, but the business consequence is hard to see when each record is reviewed in isolation.',
      griffinsRole: 'I defined the connected change story, modeled its evidence trail, and built the command-center interface and interactive traversal.',
      roleOfGenAI: 'Generative AI helped implement and iterate the graph-driven interface while I supplied the lifecycle relationships and decided what evidence the story must expose.',
      proof: 'The cockpit links the sample quality event to its engineering change, corrective action, cost, design inbox, and delivery context.',
      validation: 'The interaction is validated as a coherent cross-system narrative against its bundled fixture.',
      limitations: 'The public data is synthetic and the cockpit is not connected to production quality, PLM, ERP, or delivery systems.',
      relatedProjects: ['tc-story', 'tc-change', 'info-site', 'graph'], tags: ['Change management', 'Quality', 'Graph', 'Delivery impact'], specs: [['Trigger', 'Manufacturing quality event'], ['Path', 'Change → action → cost → delivery'], ['Data', 'Synthetic']],
      alt: 'Change Graph Cockpit linking a quality event with engineering change, corrective action, cost evidence, design work, and delivery risk.'
    }),
    defineProject({
      k: 'new-view', title: 'NewView — Mendix JT Viewer', category: 'plm-cad', artifactType: 'Integration', status: 'Working prototype', collection: 'explorations',
      summary: 'An embeddable 3D engineering-assembly viewer for Mendix that loads JT content and returns load, error, and selection state to the host app.',
      problem: 'A Mendix application needs more than a picture of a product: it needs an interactive JT viewer whose state can participate in the app workflow.',
      griffinsRole: 'I built the Mendix pluggable widget around PLMVisWeb and JTReader, added URL and document inputs, exposed viewer settings, and implemented state write-back.',
      roleOfGenAI: 'Generative AI accelerated widget implementation and debugging while I defined the Mendix contract, viewer behavior, and integration boundaries.',
      proof: 'The live standalone runtime loads a bundled JT assembly, supports orbit and standard views, and demonstrates the viewer layer used by the widget.',
      validation: 'The widget contract was checked through load, view, selection, and host-state paths; the public build validates the viewer without Mendix.',
      limitations: 'The embedded demo uses a bundled model and cannot demonstrate the full Mendix document and write-back runtime.',
      relatedProjects: ['plm-vis', 'mro', 'bom', 'widgets'], tags: ['Mendix widget', 'PLMVisWeb', 'JT', 'Selection bridge'], specs: [['Input', 'JT URL or Mendix document'], ['Output', 'Load · error · selection'], ['Proof', 'Live viewer']],
      alt: 'NewView displaying a blue JT engineering assembly in an interactive isometric viewer.'
    }),
    defineProject({
      k: 'rl26', title: 'Realize LIVE 2026 Workshop Guide Generator', category: 'local-tools', artifactType: 'Documentation system', status: 'Documentation', collection: 'archive',
      summary: 'A source-to-DOCX workflow that turned reviewed workshop transcripts and drafts into six consistent hands-on Mendix and Teamcenter activity guides.',
      problem: 'Workshop instructions assembled by hand drift in structure and are difficult to update consistently as the demonstration changes.',
      griffinsRole: 'I organized the source material, defined the guide structure and review path, and built the python-docx generator.',
      roleOfGenAI: 'Generative AI helped extract and structure draft instructions from source material; I reviewed the steps and controlled the generated documents.',
      proof: 'The repository contains the source, generator, and six generated DOCX activity guides.',
      validation: 'Generated guides were compared with reviewed drafts and the source workshop sequence.',
      limitations: 'The documents support a specific workshop snapshot and still require subject-matter review when the software or exercise changes.',
      relatedProjects: ['hyperv', 'edge'], tags: ['Python', 'python-docx', 'Mendix', 'Teamcenter'], specs: [['Output', '6 DOCX guides'], ['Source', 'Reviewed workshop material'], ['Process', 'Generate + review']]
    }),
    defineProject({
      k: 'mx-migration', title: 'Mendix React Migration — Failure Retrospective', category: 'local-tools', artifactType: 'Documentation system', status: 'Engineering retrospective', collection: 'archive',
      summary: 'An honest retrospective of a Mendix 10.24 React migration that cataloged exported errors, failed approaches, learned guardrails, and why a controlled reset was the right outcome.',
      problem: 'Repeated migration attempts can compound breakage unless failures are captured and the team knows when to stop patching and reset.',
      griffinsRole: 'I attempted the migration, collected the failure evidence, compared unsuccessful approaches, wrote the guardrails, and documented the reset plan.',
      roleOfGenAI: 'Generative AI assisted diagnosis and attempted fixes; the retrospective records where those iterations failed and where human stop conditions were necessary.',
      proof: 'The retained issue exports and retrospective connect observed errors to attempted remedies, guardrails, and the reset decision.',
      validation: 'The work was validated by reproducing the failure patterns and confirming that continued patching did not produce a stable migration.',
      limitations: 'It documents an unsuccessful migration rather than a completed upgrade, and its lessons are tied to the captured application and version.',
      relatedProjects: ['widgets'], tags: ['Mendix 10.24', 'React migration', 'Failure analysis', 'Guardrails'], specs: [['Evidence', 'Issue exports'], ['Outcome', 'Controlled reset'], ['Value', 'Failure lineage']]
    }),
    defineProject({
      k: 'mx-sap', title: 'Mendix Front Ends for MES — Architecture Comparison', category: 'edge-manufacturing', artifactType: 'Documentation system', status: 'Architecture presentation', collection: 'archive',
      summary: 'A presentation comparing two manufacturing execution system front-end strategies: extending SAP ME with Mendix or embedding Mendix natively with Opcenter Core.',
      problem: 'Teams evaluating a low-code MES experience need to understand where the Mendix layer sits, what it integrates with, and how that changes the architecture.',
      griffinsRole: 'I framed the decision, assembled the ten-slide comparison, and made the integration paths legible for a presales audience.',
      roleOfGenAI: 'Generative AI helped organize and render the presentation while I supplied the MES context and reviewed the architectural distinctions.',
      proof: 'The self-contained presentation lays out both frontend patterns and their integration boundaries side by side.',
      validation: 'The comparison was reviewed as an architecture communication artifact rather than benchmarked as a deployed system.',
      limitations: 'It is a decision aid, not a universal recommendation or a measured comparison of customer deployments.',
      relatedProjects: ['sap-replace', 'db-jdbc', 'edge'], tags: ['Mendix', 'SAP ME', 'Opcenter Core', 'MES'], specs: [['Format', '10-slide presentation'], ['Decision', 'Extension vs native embedding'], ['Scope', 'Architecture']]
    }),
    defineProject({
      k: 'sap-replace', title: 'Mendix SAP Demo Expressions', category: 'industrial-applications', artifactType: 'Supporting artifact', status: 'Demo support', collection: 'supporting',
      summary: 'Deterministic Mendix expressions that substituted stable product captions and values when the expected SAP demonstration data was unavailable.',
      problem: 'A demonstration should not collapse because an upstream sample-data source is unavailable or inconsistent.',
      griffinsRole: 'I wrote and checked the conditional expressions and aligned their outputs with the intended demonstration products.',
      roleOfGenAI: 'Generative AI helped draft and review the repetitive expression logic; I controlled the conditions and final values.',
      proof: 'The expression set preserves the exact conditional branches used by the demonstration.',
      validation: 'Each branch was checked against its expected product caption and display value.',
      limitations: 'This is explicit demonstration infrastructure, not a replacement for a real SAP integration or production data.',
      relatedProjects: ['mx-sap'], tags: ['Mendix expressions', 'SAP demo', 'Deterministic fixture'], specs: [['Purpose', 'Stable demonstration'], ['Logic', 'Conditional expressions'], ['Integration', 'None claimed']]
    }),
    defineProject({
      k: 'sfdc-v1', title: 'Salesforce Local Token Broker v1', category: 'local-tools', artifactType: 'Supporting artifact', status: 'Superseded lineage', collection: 'merged', public: false, mergedInto: 'sfdc-main',
      summary: 'The first local OAuth and token-broker implementation that established browser and headless authentication paths before the packaged successor.',
      problem: 'Local tools needed authenticated, read-only Salesforce context without embedding tokens in each client.',
      griffinsRole: 'I built the initial OAuth client, separate token persistence, refresh path, and read-only example routes.',
      roleOfGenAI: 'Generative AI assisted implementation of the first broker while I set the local-only and read-only boundaries.',
      proof: 'The v1 repository preserves the authentication flows and examples that led to the packaged broker.',
      validation: 'Browser and client-credentials paths were exercised locally before the design moved into the successor.',
      limitations: 'This version is hidden because it is superseded; it is retained only as lineage and does not represent the current tool.',
      relatedProjects: ['sfdc-main', 'time'], tags: ['OAuth 2.0', 'Node.js', 'Lineage'], specs: [['State', 'Superseded'], ['Surface', 'Local broker'], ['Access', 'Read-only examples']]
    }),
    defineProject({
      k: 'sfdc-main', title: 'Salesforce Local Token Broker', category: 'local-tools', artifactType: 'Packaged tool', status: 'Internal utility', collection: 'archive',
      summary: 'A packaged local Salesforce OAuth broker with automatic refresh, browser and headless sign-in paths, a global CLI, and sanitized read-only examples for agent workflows.',
      problem: 'Local agents need current Salesforce context, but authentication and refresh behavior should be centralized instead of copied into every workflow.',
      griffinsRole: 'I designed and packaged the broker, implemented both authentication paths, automatic refresh, CLI access, and sanitized read-only routes.',
      roleOfGenAI: 'Generative AI helped implement and test the broker clients; I constrained the public examples to read-only behavior and separated credentials from project code.',
      proof: 'The packaged binary, CLI, local API, and sanitized examples demonstrate the reusable authentication surface.',
      validation: 'Authentication, refresh, CLI, and sample request paths were exercised against the intended internal environment.',
      limitations: 'The public portfolio does not include internal endpoints, credentials, customer records, or a live Salesforce connection.',
      relatedProjects: ['sfdc-v1', 'time', 'copilot365'], tags: ['Node.js', 'OAuth 2.0', 'CLI', 'Local API'], specs: [['Auth', 'Browser + headless'], ['Refresh', 'Automatic'], ['Examples', 'Read-only']]
    }),
    defineProject({
      k: 'supply-risk', title: 'Supply Chain Risk — Mendix + Custom Widgets', category: 'industrial-applications', artifactType: 'Working application', status: 'Working prototype', collection: 'archive',
      summary: 'A Mendix supply-chain risk demonstrator combining a 3D globe, analytical charts, and an agent graph editor with graph reasoning and forecast artifacts.',
      problem: 'Supply risk is difficult to explain when geography, forecast signals, dependencies, and agent reasoning appear in separate demonstrations.',
      griffinsRole: 'I composed the Mendix experience and built the three custom pluggable-widget surfaces that carry the visual and reasoning story.',
      roleOfGenAI: 'Generative AI helped build the widget surfaces and graph-driven interaction while I supplied the risk narrative, integration shape, and review criteria.',
      proof: 'The retained application and widget captures show the globe, chart, and agent-graph layers inside the Mendix story.',
      validation: 'The interfaces and widget contracts were exercised with the demonstration dataset.',
      limitations: 'The portfolio uses sanitized or synthetic risk data and does not claim live supplier prediction or production decisions.',
      relatedProjects: ['widgets', 'graph', 'pricebook'], tags: ['Mendix', 'Custom widgets', 'Graph reasoning', 'Forecasting'], specs: [['Widgets', 'Globe · charts · agent graph'], ['Host', 'Mendix'], ['Data', 'Demonstration fixture']]
    }),
    defineProject({
      k: 'plm-vis', title: 'PLMVisWeb SDK Documentation', category: 'plm-cad', artifactType: 'Documentation system', status: 'Documentation', collection: 'archive',
      summary: 'A parser, local server, and searchable Markdown mirror for the PLMVisWeb SDK API and developer guide.',
      problem: 'Viewer integration work slows down when SDK reference material cannot be searched and cross-referenced in the same environment as the code.',
      griffinsRole: 'I built the parsing and serving workflow and organized the API and guide content into a searchable local reference.',
      roleOfGenAI: 'The searchable corpus gave coding agents grounded SDK context; I controlled the source material and used it while building viewer integrations.',
      proof: 'The repository contains the parser, server, and generated Markdown reference.',
      validation: 'Parsed members and guide sections were spot-checked against the source SDK documentation.',
      limitations: 'It mirrors a particular SDK snapshot and is documentation infrastructure, not a standalone product viewer.',
      relatedProjects: ['new-view', 'mro'], tags: ['PLMVisWeb', 'SDK', 'Markdown', 'Search'], specs: [['Artifact', 'Local docs mirror'], ['Operations', 'Parse + serve'], ['Use', 'Grounded reference']]
    }),
    defineProject({
      k: 'db-jdbc', title: 'CRM JDBC Demo Databases', category: 'local-tools', artifactType: 'Supporting artifact', status: 'Demo support', collection: 'supporting',
      summary: 'Paired PostgreSQL and H2 CRM fixtures for demonstrating Mendix external-database and database-connector patterns through JDBC.',
      problem: 'An external-database demonstration needs repeatable schemas and records without exposing a real CRM environment.',
      griffinsRole: 'I created the paired fixtures, kept their schemas aligned, and prepared them for the Mendix connector demonstration.',
      roleOfGenAI: 'Generative AI helped generate and compare fixture setup; I reviewed the schema and kept the records synthetic.',
      proof: 'Both database variants and their CRM schema are retained as runnable demonstration support.',
      validation: 'The same connector scenario was checked against the PostgreSQL and H2 variants.',
      limitations: 'All records are fixtures; the artifact does not represent a production CRM or benchmark database performance.',
      relatedProjects: ['mx-sap'], tags: ['PostgreSQL', 'H2', 'JDBC', 'Mendix'], specs: [['Engines', 'PostgreSQL + H2'], ['Schema', 'Synthetic CRM'], ['Role', 'Connector fixture']]
    }),
    defineProject({
      k: '4090', title: 'Jetson Thor NX Model Artifact', category: 'plm-cad', artifactType: 'Supporting artifact', status: 'CAD evidence', collection: 'supporting',
      summary: 'A preserved native NX part and faceted representation of a Jetson Thor development-kit model for inspection and reuse.',
      problem: 'A reusable CAD example needs its native and lightweight representations preserved together, with authorship boundaries left clear.',
      griffinsRole: 'I retained and organized the NX and faceted artifacts so they could be inspected in the surrounding automation work.',
      roleOfGenAI: 'The model serves as inspectable context for GenAI-assisted CAD workflows; the portfolio does not claim that an agent generated it.',
      proof: 'The repository contains both the native part and faceted representation.',
      validation: 'The artifacts were opened and inspected as CAD source material.',
      limitations: 'The available evidence does not establish separate model authorship or that NX MCP produced it, so it is presented only as supporting evidence.',
      relatedProjects: ['nx'], tags: ['NX', 'CAD artifact', 'Faceted model'], specs: [['Files', 'Native + faceted'], ['Subject', 'Jetson Thor kit'], ['Role', 'Supporting evidence']]
    }),
    defineProject({
      k: 'bom', title: 'Teamcenter BOM — Mendix Widget', category: 'plm-cad', artifactType: 'Integration', status: 'Working prototype', collection: 'archive',
      summary: 'A packaged Mendix widget that hosts the Teamcenter Active Workspace bill-of-materials tree and writes the selected product line back to the app.',
      problem: 'A Mendix workflow needs to display a configured Teamcenter product structure and react to the exact line a user selects.',
      griffinsRole: 'I built the widget inputs for product, configuration, and revision rules, embedded the BOM view, and implemented UID, item, and revision write-back.',
      roleOfGenAI: 'Generative AI accelerated the widget bridge implementation while I defined the Teamcenter inputs and Mendix selection contract.',
      proof: 'The packaged widget and its contract show the Active Workspace tree and the three selected-line values returned to Mendix.',
      validation: 'Input configuration, tree loading, and selection write-back were checked through the widget workflow.',
      limitations: 'The public portfolio cannot connect to a Teamcenter session and therefore presents the integration contract rather than live enterprise data.',
      relatedProjects: ['soa', 'mro', 'widgets'], tags: ['Mendix widget', 'Teamcenter Active Workspace', 'BOM', 'Selection bridge'], specs: [['Input', 'Product + config + revision rule'], ['View', 'BOM tree'], ['Write-back', 'UID · item · revision']]
    }),
    defineProject({
      k: 'dt-composer', title: 'DTC Production Co-Pilot', category: 'edge-manufacturing', artifactType: 'Working application', status: 'Working prototype', collection: 'selected',
      summary: 'A production co-pilot that puts a 3D final-assembly line, manufacturing execution system state, and an observable agent diagnosis in the same screen.',
      problem: 'Plant geometry, station state, and diagnostic reasoning are difficult to follow when they live in separate views and the recommendation hides its evidence.',
      griffinsRole: 'I built the React and Three.js production view and paired it with LangGraph and ReAct diagnostic, recovery, and simulation tools in scripted and live modes.',
      roleOfGenAI: 'The agent interprets the visible manufacturing state and calls explicit diagnosis, recovery, and simulation tools; I designed the tool sequence and kept the evidence visible.',
      proof: 'The live browser build opens a throughput alert, shows the 3D line, identifies the constrained station, and exposes the diagnosis-to-recovery trace.',
      validation: 'The public scripted mode runs the full alert-to-simulation sequence against a fixed, inspectable scenario.',
      limitations: 'The public build uses scripted sample manufacturing data and makes no claim of autonomous production control.',
      relatedProjects: ['edge', 'mx-sap', 'change-graph'], tags: ['React', 'Three.js', 'LangGraph', 'MES'], specs: [['View', '3D final assembly'], ['Reasoning', 'Observable ReAct trace'], ['Modes', 'Scripted + live']],
      alt: 'DTC Production Co-Pilot showing a 3D aircraft assembly line, a constrained station, throughput state, and an agent diagnosis panel.'
    }),
    defineProject({
      k: 'hyperv', title: 'Realize LIVE 2026 — Virtual Industrial Edge Lab', category: 'edge-manufacturing', artifactType: 'Demo infrastructure', status: 'Working lab environment', collection: 'archive',
      summary: 'Ran an Industrial Edge Virtual Device (IEVD) and Industrial Edge Management (IEM) in Hyper-V to support a Mendix + Industrial Edge demonstration without physical shop-floor hardware.',
      problem: 'The Realize LIVE 2026 demonstration needed a credible edge application environment when neither a shop floor nor a physical edge device was available.',
      griffinsRole: 'I ran the IEVD and IEM virtual machines on my workstation, maintained their recoverable Hyper-V state, and used them to support the team demonstration.',
      roleOfGenAI: 'Generative AI assisted development of the Mendix and edge application around the virtual lab; the Hyper-V environment supplied the real software runtime.',
      proof: 'The repository preserves the virtual-machine configuration and recovery state associated with the demonstrated IEVD and IEM environment.',
      validation: 'The lab supported the Mendix + Industrial Edge demonstration in the Realize LIVE 2026 workflow.',
      limitations: 'The retained artifacts are configuration and recovery state, not infrastructure-as-code; the lab proves virtual development, not physical-device or shop-floor behavior.',
      relatedProjects: ['edge', 'rl26'], tags: ['Hyper-V', 'Industrial Edge Virtual Device', 'Industrial Edge Management', 'Realize LIVE 2026'], specs: [['Runtime', 'IEVD + IEM'], ['Host', 'Hyper-V'], ['Hardware', 'No physical edge device']]
    }),
    defineProject({
      k: 'llms', title: 'Multi-Surface LLM Bench', category: 'experiments', artifactType: 'Research prototype', status: 'Working experiment', collection: 'explorations',
      summary: 'A workbench for asking which available models are actually suitable for chat, agents, speech, embeddings, reranking, transcription, and other tasks.',
      problem: 'A single model label or aggregate score hides whether a model is available and useful for a particular interaction surface.',
      griffinsRole: 'I built model discovery, task-specific runners, result views, and HTML findings across the different benchmark surfaces.',
      roleOfGenAI: 'Multiple models are the subjects of the experiment; I designed the task surfaces and kept their outputs separate instead of forcing one universal ranking.',
      proof: 'The workbench retains availability results, per-surface runs, task metrics, history, and generated HTML findings.',
      validation: 'Each runner reports against its own task and metric rather than borrowing conclusions across incompatible surfaces.',
      limitations: 'Results reflect the tested models, prompts, fixtures, and runtime snapshot; they are not permanent rankings or a general quality claim.',
      relatedProjects: ['ml-dev', 'capital', 'ai-studio-mcp'], tags: ['Model discovery', 'Task benchmarks', 'Speech', 'Embeddings'], specs: [['Surfaces', 'Chat · agent · transcribe · embed · rerank'], ['Output', 'Per-task findings'], ['Claim', 'No universal score']],
      alt: 'Multi-Surface LLM Bench showing discovered models, task-specific benchmark results, and run history.'
    }),
    defineProject({
      k: 'video', title: 'Video Analyzer Studio', category: 'local-tools', artifactType: 'Packaged tool', status: 'Packaged desktop app', collection: 'selected',
      summary: 'A packaged desktop app that sends a local video to Gemini, turns the response into a structured scene report, and keeps prior runs in SQLite.',
      problem: 'Ad hoc video prompts are difficult to compare or revisit when the source, request, report structure, and prior runs are not retained together.',
      griffinsRole: 'I built the desktop workspace, provider and prompt flow, structured report assembly, local history, and packaged application.',
      roleOfGenAI: 'Gemini performs the requested video analysis; I designed the request and report contract and the local workflow that makes each run inspectable.',
      proof: 'The project includes the packaged workspace, documented upload-to-report flow, retained run history, and a browser-safe reconstruction of the real frontend.',
      validation: 'The workflow was exercised from local file selection through structured report and SQLite history; the public build checks the UI against a sample API.',
      limitations: 'The portfolio build does not upload media or call Gemini, and a model-generated scene report still requires human review.',
      relatedProjects: ['llms'], tags: ['Desktop app', 'Gemini', 'Scene reports', 'SQLite'], specs: [['Input', 'Local video'], ['Output', 'Structured scene report'], ['History', 'SQLite']],
      alt: 'Video Analyzer Studio showing local media controls, a structured Gemini scene report, and saved run history.'
    }),
    defineProject({
      k: 'explore', title: 'Digital Thread Storytelling Platform', category: 'industrial-applications', artifactType: 'Working application', status: 'Working prototype', collection: 'archive',
      summary: 'A full-stack authoring and presentation tool for connected product-lifecycle stories, using a 3D lifecycle map and a 2D journey to keep each event in context.',
      problem: 'Digital-thread demonstrations become a sequence of disconnected screens unless someone can author the relationships and present them as one navigable story.',
      griffinsRole: 'I designed the story model and built the 3D map, 2D journey, draft editor, persistence, reordering, and publication flow.',
      roleOfGenAI: 'Generative AI helped implement the full-stack experience while I supplied the lifecycle narrative model and made the authoring decisions explicit.',
      proof: 'The working application includes both presentation modes and the complete draft-to-publish authoring path.',
      validation: 'Stories were created, reordered, persisted, and replayed across the 3D and 2D views.',
      limitations: 'The prototype uses local, no-auth authoring and is not a production content-governance or collaboration system.',
      relatedProjects: ['tc-story', 'change-graph'], tags: ['Digital thread', '3D lifecycle map', 'Story authoring', 'SQLite'], specs: [['Views', '3D map + 2D journey'], ['Flow', 'Draft → reorder → publish'], ['Auth', 'Local prototype']]
    }),
    defineProject({
      k: 'networking', title: 'OpenWrt Demo Router Toolkit', category: 'local-tools', artifactType: 'Packaged tool', status: 'Internal utility', collection: 'archive',
      summary: 'A setup and audit toolkit for OpenWrt and GL.iNet demonstration routers, covering connected clients, exposed services, security checks, traffic inspection, and throughput tests.',
      problem: 'A portable demonstration router needs a repeatable way to see what is connected, what is exposed, and whether basic performance and policy are ready before an event.',
      griffinsRole: 'I assembled the PowerShell setup, inventory, audit, inspection, and measurement workflow around my demonstration-router needs.',
      roleOfGenAI: 'Generative AI helped implement and organize the checks while I defined the safe target, expected services, and review sequence.',
      proof: 'The toolkit retains commands and report surfaces for inventory, services, policy checks, traffic, and throughput.',
      validation: 'Checks were run against the intended OpenWrt/GL.iNet lab routers and reviewed before demonstrations.',
      limitations: 'Results are point-in-time diagnostics for owned demo equipment, not a general security certification or unattended remediation system.',
      relatedProjects: ['hyperv'], tags: ['OpenWrt', 'GL.iNet', 'PowerShell', 'Network audit'], specs: [['Checks', 'Clients · services · policy'], ['Inspect', 'Traffic'], ['Measure', 'Throughput']]
    }),
    defineProject({
      k: 'one-pager', title: 'One-Pager Authoring Kit', category: 'local-tools', artifactType: 'Documentation system', status: 'Internal utility', collection: 'archive',
      summary: 'A disciplined A4 authoring workflow that pairs a Siemens one-page style guide with a fixed HTML composition and a Puppeteer PDF build.',
      problem: 'One-page technical briefs lose hierarchy and print fidelity when content, layout rules, and PDF verification are handled separately.',
      griffinsRole: 'I codified the layout constraints, built the fixed HTML template and PDF pipeline, and used visual review to keep the output on one page.',
      roleOfGenAI: 'Generative AI helped draft and fit content within the template; I controlled hierarchy, claims, page limits, and visual acceptance.',
      proof: 'The repository includes the style guide, HTML composition, Puppeteer build, and generated A4 output.',
      validation: 'The PDF was checked for one-page fit, clipping, hierarchy, and print rendering.',
      limitations: 'The kit targets a fixed brand and A4 format; generated copy still needs factual and editorial review.',
      relatedProjects: ['siemens-ppts', 'rl26'], tags: ['HTML', 'Puppeteer', 'PDF', 'A4'], specs: [['Canvas', 'A4'], ['Build', 'HTML → PDF'], ['QA', 'Visual review']]
    }),
    defineProject({
      k: 'personal', title: 'RUNE DIFF — Unreal GenAI Game Benchmark', category: 'experiments', artifactType: 'GenAI benchmark', status: 'Experimental vertical slice', collection: 'explorations',
      summary: 'A companion benchmark testing Codex and Sol on an Unreal Engine 5 multiplayer-online-battle-arena vertical slice with champions, builds, and combat systems, including what the agents achieved and where the result still fell short.',
      problem: 'The experiment asked how far coding agents could take a native Unreal Engine 5 game when the target required interconnected selection, build, and combat systems rather than a web mockup.',
      griffinsRole: 'I wrote the brief, directed Codex and Sol, constrained the intended game loop, ran the build, and judged the resulting systems and playability.',
      roleOfGenAI: 'Codex and Sol produced and iterated the C++ and project implementation under my prompts, corrections, and acceptance decisions.',
      proof: 'The retained Unreal project and playable vertical-slice systems show champion selection, builds, and combat behavior achieved during the benchmark.',
      validation: 'I built and played the resulting slice and compared observed behavior with the brief rather than assigning an invented numerical score.',
      limitations: 'The result remained a rough benchmark slice: completeness, polish, balance, and autonomous agent follow-through fell short of a finished game.',
      relatedProjects: ['racer'], tags: ['Unreal Engine 5', 'Codex', 'Sol', 'MOBA benchmark'], specs: [['Engine', 'Unreal Engine 5'], ['Agents', 'Codex + Sol'], ['Scope', 'Vertical slice']]
    }),
    defineProject({
      k: 'playwright', title: 'Maia Local MCP Toolkit', category: 'agents-mcp', artifactType: 'Packaged tool', status: 'Packaged Windows tool', collection: 'selected',
      summary: 'A self-contained Windows MCP server and native control center that makes local agent authority visible across Mendix, Git, widgets, builds, tasks, browsers, and documentation.',
      problem: 'A useful local agent needs files, processes, browsers, builds, and documentation, but unrestricted desktop authority is too broad.',
      griffinsRole: 'I designed the safety model and built the TypeScript/Node MCP server, native control center, packaging path, and interdependent capability gates.',
      roleOfGenAI: 'A coding agent uses the exposed local tools only when their capabilities are enabled; I decide the authority model and allowed workspace.',
      proof: 'The project includes the tool inventory, Streamable HTTP transport, standalone executable, documented gates, and browser-safe control-center walkthrough.',
      validation: 'Tool groups, gate dependencies, workspace boundaries, transport, and packaged launch path were tested locally.',
      limitations: 'The public reconstruction cannot exercise desktop authority; safety still depends on deliberate gate and workspace configuration by the operator.',
      relatedProjects: ['mcp-dev', 'flights-mcp', 'hub'], tags: ['MCP', 'Mendix', 'TypeScript', 'Windows'], specs: [['Tools', '62'], ['Control', 'Capability gates'], ['Package', 'Standalone EXE']],
      alt: 'Maia control center showing local MCP capabilities and explicit enablement gates for desktop tools.'
    }),
    defineProject({
      k: 'pricebook', title: 'PriceBook Knowledge Graph', category: 'industrial-applications', artifactType: 'Research prototype', status: 'Working prototype', collection: 'archive',
      summary: 'A local Neo4j graph, Siemens iX browser, and grounded chat assistant for inspecting relationships across software, hardware, and service price-book workbooks.',
      problem: 'Spreadsheet price books hide relationships across products and services, and a chat answer is hard to trust without a visible grounding path.',
      griffinsRole: 'I modeled the workbook data as a graph, built the local ingestion and API, designed the iX graph browser, and connected grounded chat.',
      roleOfGenAI: 'The assistant answers against retrieved graph context; I defined the graph structure and kept the supporting nodes visible for review.',
      proof: 'The prototype includes Neo4j ingestion, a graph viewer, and chat responses tied to the displayed product relationships.',
      validation: 'Sample questions were checked against the sanitized graph and source workbook relationships.',
      limitations: 'The public preview contains no live commercial data, prices, or customer terms and is not a quoting system.',
      relatedProjects: ['graph-rag', 'graph', 'supply-risk'], tags: ['Neo4j', 'Siemens iX', 'FastAPI', 'Grounded chat'], specs: [['Source', 'Price-book workbooks'], ['Store', 'Neo4j'], ['Review', 'Visible grounding']]
    }),
    defineProject({
      k: 'progression', title: 'Progression Evidence System', category: 'local-tools', artifactType: 'Documentation system', status: 'Personal utility', collection: 'archive',
      summary: 'A private evidence and planning system that organizes progression expectations, project proof, development actions, and readiness gaps into a reviewable presentation.',
      problem: 'Professional-development evidence is easy to lose when goals, examples, gaps, and next actions are kept in unrelated notes.',
      griffinsRole: 'I designed the evidence model, merged the earlier goal draft into it, and built the organizer and presentation view.',
      roleOfGenAI: 'Generative AI helped structure and summarize evidence; I selected the records, protected private details, and made readiness judgments.',
      proof: 'The application assembles evidence items into required sections, development planning, and a readiness view.',
      validation: 'The system was checked against anonymized sample entries and the expected presentation structure.',
      limitations: 'The public interaction is fictionalized and cannot substantiate private performance or employment claims.',
      relatedProjects: ['goals', 'notes'], tags: ['Evidence system', 'Planning', 'Presentation', 'Private data'], specs: [['Unit', 'Evidence item'], ['Output', 'Review presentation'], ['Preview', 'Anonymized']]
    }),
    defineProject({
      k: 'racer', title: 'Eifel Apex — Godot GenAI Game Benchmark', category: 'experiments', artifactType: 'GenAI benchmark', status: 'Packaged experiment', collection: 'explorations',
      summary: 'A benchmark of how far Codex and Sol could take a native 3D Godot racing game from brief to packaged build; cars, circuits, controls, checkpoints, and laps are evidence of the benchmark rather than the entire point.',
      problem: 'The experiment asked whether coding agents could turn a game brief into a coherent native 3D Godot build with multiple interacting driving and race-progression systems.',
      griffinsRole: 'I set the benchmark brief, directed Codex and Sol, reviewed builds, corrected the implementation, and judged what was playable and what remained weak.',
      roleOfGenAI: 'Codex and Sol produced and iterated the Godot implementation under my direction, making their successes and missed requirements the subject of the project.',
      proof: 'Packaged builds preserve selectable cars and circuits, driving controls, checkpoints, and lap progression created during the benchmark.',
      validation: 'I ran and played the packaged game against the brief and recorded qualitative successes and shortcomings without inventing benchmark scores.',
      limitations: 'The benchmark reached a playable build but visual polish, vehicle feel, agent consistency, and overall game completeness remained limited.',
      relatedProjects: ['personal'], tags: ['Godot', 'Codex', 'Sol', '3D racing benchmark'], specs: [['Engine', 'Godot'], ['Agents', 'Codex + Sol'], ['Proof', 'Packaged game']]
    }),
    defineProject({
      k: 'protein', title: 'Gene / Protein Interaction Explorer', category: 'experiments', artifactType: 'Research prototype', status: 'Experimental prototype', collection: 'archive',
      summary: 'A bounded experiment in whether a coding agent could enter an unfamiliar scientific domain and produce an interactive gene/protein model with its synthetic assumptions clearly exposed.',
      problem: 'Scientific-looking interfaces can imply authority they do not have, so the experiment needed to make activator, repressor, and dependency assumptions explorable without suggesting clinical conclusions.',
      griffinsRole: 'I scoped the test, directed the implementation, built the interaction and visual model with the agent, and insisted on explicit synthetic-data boundaries.',
      roleOfGenAI: 'A coding agent helped research terminology and produce the simulator; I treated every scientific claim as provisional and constrained the output to an interface experiment.',
      proof: 'The live React build lets a visitor define binding motifs and inspect changing synthetic activity beside mocked dependency context.',
      validation: 'The interface and its deterministic simulation behavior were checked; it was not biologically or clinically validated.',
      limitations: 'All dependency context is synthetic or mocked, the model is illustrative, and the tool must not be used for scientific or clinical decisions.',
      relatedProjects: ['codex'], tags: ['React', 'Synthetic biology context', 'Interactive model', 'Bounded experiment'], specs: [['Interaction', 'Activator + repressor motifs'], ['Context', 'Mock dependency data'], ['Claim', 'No clinical validity']],
      alt: 'Gene and protein interaction explorer with synthetic activity controls, binding motifs, and mocked dependency context.'
    }),
    defineProject({
      k: 'siemens-ppts', title: 'Siemens Deck Builder', category: 'local-tools', artifactType: 'Documentation system', status: 'Internal utility', collection: 'archive',
      summary: 'A structured deck-building workflow that assembles on-brand presentation files from a content library and an explicit outline.',
      problem: 'Recurring presentations waste time when the content structure, visual rules, and file generation are rebuilt independently for every deck.',
      griffinsRole: 'I defined the outline and content contracts and built the Node-based PowerPoint assembly workflow.',
      roleOfGenAI: 'Generative AI helps draft and organize slide content within the supplied structure; I review facts, emphasis, and the final visual sequence.',
      proof: 'The source includes the content-library inputs, structured outline, and generated PPTX output path.',
      validation: 'Generated decks were opened and visually reviewed for structure, brand consistency, and overflow.',
      limitations: 'Automatic assembly does not replace factual review or presentation design judgment, and the tool targets its configured visual system.',
      relatedProjects: ['one-pager', 'rl26'], tags: ['Node.js', 'PPTX', 'Content library', 'Structured outline'], specs: [['Input', 'Outline + content library'], ['Output', 'PPTX'], ['QA', 'Visual review']]
    }),
    defineProject({
      k: 'nx', title: 'NX MCP Automation Server', category: 'agents-mcp', artifactType: 'Integration', status: 'Working prototype', collection: 'selected',
      summary: 'An MCP server that turns 68 Siemens NXOpen operations for modeling, features, file handling, and finite-element-analysis results into typed tools an AI client can call.',
      problem: 'CAD automation is difficult to reuse conversationally when geometry and analysis operations remain isolated in recorded journals or opaque desktop commands.',
      griffinsRole: 'I traced the NXOpen operation patterns, designed the typed tool contracts, built the FastMCP server, and assembled inspectable CAD and analysis evidence.',
      roleOfGenAI: 'An AI client can plan and call the explicit NX tools; I supply the CAD intent, parameter boundaries, runtime environment, and review of generated geometry.',
      proof: 'The project includes the 68-operation inventory, NX runtime capture, cargo-ship benchmark artifact, and representative solid-modeling and stress-result previews.',
      validation: 'Representative tools were run inside NX and their resulting geometry, files, and analysis outputs were inspected.',
      limitations: 'The public portfolio cannot run NX, and agent-generated CAD still needs an engineer to verify geometry, units, constraints, and analysis assumptions.',
      relatedProjects: ['nx-journals', 'custom-dirs', '4090', 'nx-mendix'], tags: ['FastMCP', 'NXOpen', 'Python', 'CAD automation'], specs: [['Tools', '68'], ['Host', 'Siemens NX'], ['Protocol', 'MCP']],
      alt: 'Siemens NX showing the SS Charlie cargo-ship benchmark model, construction planes, solid geometry, and analysis evidence.'
    }),
    defineProject({
      k: 'graph', title: 'GraphStudio · RDF Integration', category: 'plm-cad', artifactType: 'Integration', status: 'Working prototype', collection: 'explorations',
      summary: 'Pulled Teamcenter data through Mendix, converted it into a semantic graph, and verified that parts, revisions, and relationships appeared correctly in Graph Studio.',
      problem: 'Product-lifecycle records cannot support graph exploration until their objects and relationships are translated into an ontology the graph platform can traverse.',
      griffinsRole: 'I built the paged Mendix AGS REST ingestion, RDF transformation, SPARQL representation, and visible-edge validation workflow.',
      roleOfGenAI: 'Generative AI helped implement and inspect the transformation pipeline; I defined the Teamcenter-to-ontology mapping and checked the resulting relationships.',
      proof: 'The pipeline, RDF/SPARQL artifacts, and Graph Studio capture show item-to-revision nodes and their visible semantic edges.',
      validation: 'Parts, revisions, identifiers, and expected relationships were compared from source responses through the rendered graph.',
      limitations: 'The portfolio uses a bounded dataset and does not claim a complete enterprise ontology or production synchronization.',
      relatedProjects: ['info-site', 'change-graph', 'tc-story', 'pricebook'], tags: ['Teamcenter', 'Mendix', 'RDF', 'Graph Studio'], specs: [['Source', 'Teamcenter via Mendix AGS'], ['Model', 'RDF/SPARQL'], ['Check', 'Visible ontology edges']],
      alt: 'Graph Studio showing Teamcenter item and revision nodes connected by a verified RDF relationship.'
    }),
    defineProject({
      k: 'capital', title: 'Capital Copilot Local Model Connector', category: 'plm-cad', artifactType: 'Integration', status: 'Working prototype', collection: 'archive',
      summary: 'Extended the model-provider path for Capital Copilot, an electrical-systems engineering assistant, so it could use locally hosted and open-weight language models.',
      problem: 'The assistant’s original provider path limited which models could be evaluated in local or more accessible environments.',
      griffinsRole: 'I implemented the custom connector and adapted the provider path between Capital Copilot and locally hosted or open-weight models.',
      roleOfGenAI: 'The connected open-weight model supplies the assistant responses; I built the integration and evaluated whether that provider path worked in the engineering-assistant surface.',
      proof: 'The retained connector and workflow demonstrate Capital Copilot using the additional model-provider route.',
      validation: 'Connection and response behavior were checked with the intended locally hosted model setup.',
      limitations: 'The portfolio does not claim official provider support, production readiness, model equivalence, or access to proprietary electrical designs.',
      relatedProjects: ['capital-mcp', 'ml-dev', 'llms'], tags: ['Capital Copilot', 'Local models', 'Open-weight LLMs', 'Custom connector'], specs: [['Surface', 'Electrical-systems assistant'], ['Extension', 'Model-provider path'], ['Models', 'Local + open-weight']]
    }),
    defineProject({
      k: 'flights-mcp', title: 'Flights MCP Server', category: 'agents-mcp', artifactType: 'Integration', status: 'Working prototype', collection: 'archive',
      summary: 'A deliberately minimal, well-typed MCP server that wraps a live flights API to test how small a useful agent tool surface can be.',
      problem: 'MCP examples can obscure the protocol with scaffolding, making it hard to see the smallest useful boundary around an external API.',
      griffinsRole: 'I chose the narrow read-only use case, designed the typed flight tools, and built the FastMCP-to-REST adapter.',
      roleOfGenAI: 'An AI client discovers and calls the flight tools; I kept the surface compact enough to study tool descriptions and results directly.',
      proof: 'The runnable server and its reference implementation expose the small tool set and response mapping.',
      validation: 'Tool inputs and returned flight records were exercised against the API and checked for typed, readable output.',
      limitations: 'Availability and freshness depend on the third-party API; the server is a design experiment, not an official flight or booking service.',
      relatedProjects: ['mcp-dev', 'playwright'], tags: ['FastMCP', 'Flights API', 'Python', 'Read-only'], specs: [['Protocol', 'MCP'], ['Boundary', 'Minimal tool surface'], ['Source', 'Third-party API']]
    }),
    defineProject({
      k: 'graph-rag', title: 'GraphRAG Research Fragment', category: 'experiments', artifactType: 'Lab fragment', status: 'Research fragment', collection: 'archive',
      summary: 'An early exploration of grounding language-model answers through typed graph traversal, retained as a research fragment because the available artifact does not establish a finished corpus or comparison.',
      problem: 'The question was whether graph relationships could make retrieval paths more inspectable than an unstructured answer or flat context lookup.',
      griffinsRole: 'I explored the retrieval shape and retained the implementation fragment without promoting it beyond the evidence available.',
      roleOfGenAI: 'A language model consumes retrieved graph context; I kept the concept bounded and chose not to present an unsupported performance conclusion.',
      proof: 'The repository preserves the retrieval implementation fragment and its graph-grounding intent.',
      validation: 'Only the local retrieval path was inspected; no complete benchmark or verified corpus comparison is claimed.',
      limitations: 'The record does not prove a finished engine, defined production corpus, or that GraphRAG outperformed vector retrieval.',
      relatedProjects: ['pricebook', 'graph', 'neo4j-lab'], tags: ['GraphRAG', 'Typed graph', 'Grounding', 'Research fragment'], specs: [['State', 'Fragment'], ['Claim', 'No retrieval benchmark'], ['Use', 'Lineage']]
    }),
    defineProject({
      k: 'capital-mcp', title: 'Capital ECAD MCP Server', category: 'agents-mcp', artifactType: 'Integration', status: 'Working prototype', collection: 'archive',
      summary: 'Wrapped Capital’s existing REST API in a local MCP server, turning selected electrical computer-aided design operations into typed tools an AI client can discover and call.',
      problem: 'Capital already exposes engineering operations through REST, but an MCP client needs explicit tool names, inputs, and outputs to use selected operations.',
      griffinsRole: 'I built the local MCP wrapper, selected the REST operations to expose, and translated their request and response shapes into typed tools.',
      roleOfGenAI: 'The AI client discovers and invokes the tools; I control which existing Capital REST operations are represented and how their parameters are described.',
      proof: 'The server implementation and interactive tool flow show MCP discovery and calls mapped to the existing Capital REST API.',
      validation: 'The wrapper’s tool schemas and REST request mappings were exercised in the local development setup.',
      limitations: 'I did not create Capital’s API, and the portfolio makes no unsupported claim about write governance, security controls, or production safety.',
      relatedProjects: ['capital', 'mcp-dev'], tags: ['Capital', 'ECAD', 'MCP', 'REST API'], specs: [['Source', 'Existing Capital REST API'], ['Surface', 'Local MCP server'], ['Tools', 'Typed operations']]
    }),
    defineProject({
      k: 'nx-mendix', title: 'Mendix-to-NX Configuration Bridge', category: 'plm-cad', artifactType: 'Integration', status: 'Working prototype', collection: 'archive',
      summary: 'A Mendix product configurator drives native NX templates and expressions, exports the requested CAD formats, and returns the generated result to the app.',
      problem: 'A low-code configurator only becomes an engineering workflow when its parameters can drive native CAD and return usable generated files.',
      griffinsRole: 'I built the polling connector, mapped Mendix configurations into NX templates and expressions, automated exports, and patched results back to the app.',
      roleOfGenAI: 'Generative AI accelerated connector and NXOpen implementation while I supplied the parametric model rules, export contract, and result checks.',
      proof: 'The project includes the connector flow and a multi-view generated enclosure artifact with dimensions and configured details.',
      validation: 'Requested parameters and output formats were checked against the resulting NX model and files returned to Mendix.',
      limitations: 'The public portfolio shows sanitized configurations and artifacts; it is not connected to a production Mendix or NX deployment.',
      relatedProjects: ['nx', 'widgets'], tags: ['Mendix', 'NXOpen', 'Parametric CAD', 'Automation'], specs: [['Input', 'Mendix configuration'], ['Engine', 'NX templates + expressions'], ['Exports', 'JT · STEP · 3MF · JPEG · STL']],
      alt: 'Configured electronics enclosure shown in four CAD views with dimensions, flange details, and embossed text.'
    }),
    defineProject({
      k: 'tc-change', title: 'Teamcenter Change KPI Dashboard', category: 'plm-cad', artifactType: 'Working application', status: 'Working prototype', collection: 'selected',
      summary: 'A query-backed Teamcenter dashboard that replaces spreadsheet rollups with a reviewable view of change KPIs, workflow state, ownership, aging, and downstream impact.',
      problem: 'Saved-query results, workflow state, and downstream impact are difficult to review when they must be reconstructed across spreadsheet exports.',
      griffinsRole: 'I built the reporting dashboard and its saved-query and SOA hydration flow, then shaped the KPI, workflow, and impact views.',
      roleOfGenAI: 'Generative AI accelerated implementation and helped organize the reporting surfaces; I defined the Teamcenter queries, evidence fields, and review logic.',
      proof: 'The documented implementation and sanitized walkthrough show query input, hydrated change records, KPI summaries, workflow stages, and linked impact context.',
      validation: 'Dashboard records and aggregates were checked back to the sanitized saved-query results and hydrated change objects.',
      limitations: 'The public walkthrough uses sanitized data and cannot demonstrate live Teamcenter authentication or production reporting scale.',
      relatedProjects: ['soa', 'change-graph', 'tc-story', 'info-site'], tags: ['Teamcenter', 'SOA', 'Change management', 'Reporting'], specs: [['Input', 'Saved queries'], ['Views', 'KPI · workflow · impact'], ['Proof', 'Sanitized walkthrough']],
      alt: 'Teamcenter Change KPI Dashboard showing workflow completion, aging, ownership, disposition, and task bottlenecks.'
    }),
    defineProject({
      k: 'tc-story', title: 'Cross-System Change Story', category: 'plm-cad', artifactType: 'Interactive demo', status: 'Case study', collection: 'archive',
      summary: 'A plain-language walkthrough of one change-impact event traced across Teamcenter, enterprise planning, customer relationship, manufacturing execution, graph data, and Mendix.',
      problem: 'A product change can affect engineering, supply, sales, and manufacturing, but audiences lose the thread when each system is demonstrated separately.',
      griffinsRole: 'I modeled one connected event, assembled its system-specific artifacts, and built the staged narrative and traversal.',
      roleOfGenAI: 'Generative AI helped implement the story presentation while I supplied the cross-system relationships and decided what evidence belonged in each step.',
      proof: 'The case-study interaction connects the same change event across all six system perspectives and exposes the critical relationship path.',
      validation: 'Identifiers and transitions were checked across the bundled story fixture so each scene refers to the same event.',
      limitations: 'The public scenario is a constructed demonstration and does not represent a live customer process or measured business outcome.',
      relatedProjects: ['change-graph', 'tc-change', 'info-site', 'explore'], tags: ['Teamcenter', 'ERP', 'CRM', 'MES'], specs: [['Event', 'One change-impact story'], ['Systems', 'Six'], ['Data', 'Demonstration fixture']]
    }),
    defineProject({
      k: 'mcp-dev', title: 'MCP Reference Workspace', category: 'agents-mcp', artifactType: 'Documentation system', status: 'Reference lineage', collection: 'supporting',
      summary: 'A reference workspace that keeps a small read-only web-data MCP server beside a broader Windows desktop MCP implementation to document how later agent tooling evolved.',
      problem: 'It is easier to reason about MCP authority when a narrow API adapter and a local desktop tool surface can be studied side by side.',
      griffinsRole: 'I organized the two reference implementations and retained their contrasting tool and authority boundaries as lineage.',
      roleOfGenAI: 'AI clients consume both tool surfaces; I used the comparison to refine descriptions and capability boundaries in later MCP projects.',
      proof: 'The workspace contains the Flights MCP implementation and the Windows desktop reference with their tool definitions.',
      validation: 'Both examples were run and compared for transport, schema, result, and authority behavior.',
      limitations: 'It is documentation and lineage, not a general scaffolding product or a third standalone MCP system.',
      relatedProjects: ['flights-mcp', 'playwright', 'capital-mcp'], tags: ['MCP', 'Reference implementations', 'Flights', 'Windows'], specs: [['Examples', '2'], ['Contrast', 'Web data vs desktop authority'], ['Role', 'Lineage']]
    }),
    defineProject({
      k: 'nx-journals', title: 'NX Journal Automations', category: 'plm-cad', artifactType: 'Supporting artifact', status: 'Automation lineage', collection: 'supporting',
      summary: 'Recorded NXOpen journals that revealed the ordered calls and hardcoded assumptions later turned into reusable typed NX MCP operations.',
      problem: 'Recorded CAD automation captures a working sequence but usually locks in files, selections, and parameters that prevent reuse.',
      griffinsRole: 'I studied two C# journals for simulation setup and algorithmic-feature logic, documented their ordered calls, and identified what needed parameterization.',
      roleOfGenAI: 'The journals grounded later GenAI-assisted tool design in known NXOpen call sequences instead of asking an agent to invent the API flow.',
      proof: 'Both recorded C# journals and their hardcoded-input risks are preserved in the repository.',
      validation: 'The call order was compared with the recorded NX operations and used as lineage for the typed automation surface.',
      limitations: 'The journals are not general tools by themselves and retain session-specific assumptions; they are supporting evidence for the later server.',
      relatedProjects: ['nx', 'custom-dirs'], tags: ['NXOpen', 'C# journals', 'Automation lineage'], specs: [['Scripts', '2'], ['Scope', 'Simulation + algorithmic feature'], ['Evolution', 'Recorded calls → typed tools']]
    }),
    defineProject({
      k: 'et-site', title: 'Frontend Design Skill for Coding Agents', category: 'local-tools', artifactType: 'Documentation system', status: 'Reusable agent skill', collection: 'explorations',
      summary: 'A reusable instruction package that helps coding agents turn a real subject, audience, and content model into a distinctive interface instead of generic generated frontend output.',
      problem: 'Coding agents tend toward interchangeable interfaces when the brief does not force them to understand the subject, choose a visual thesis, and critique the result.',
      griffinsRole: 'I distilled my design process into the skill’s discovery, direction, implementation, responsive review, and critique instructions.',
      roleOfGenAI: 'The coding agent follows the skill as an operating guide; I authored the constraints and examples that steer its design decisions.',
      proof: 'The portable skill package contains the complete brief-to-build-to-critique workflow used with coding agents.',
      validation: 'The instructions were exercised on frontend work and revised around recurring generic-output and responsive-design failures.',
      limitations: 'A skill improves process but cannot guarantee taste, accessibility, factual content, or a finished design without human review.',
      relatedProjects: ['widgets', 'one-pager'], tags: ['Coding agents', 'Frontend design', 'Design direction', 'Critique loop'], specs: [['Input', 'Subject + audience + content'], ['Output', 'Distinctive interface direction'], ['Loop', 'Discover → build → critique']]
    }),
    defineProject({
      k: 'info-site', title: 'Teamcenter Semantic Graph API', category: 'plm-cad', artifactType: 'Integration', status: 'Working prototype', collection: 'archive',
      summary: 'A read-only API that turns Teamcenter data in Microsoft SQL Server into graph-ready nodes and edges with search and request-correlated diagnostics.',
      problem: 'Semantic and change applications need a stable, inspectable path from Teamcenter-backed tables to graph ingestion without granting write authority.',
      griffinsRole: 'I designed the read-only node and edge contract, implemented search and ingestion endpoints, and added request IDs and system logging for diagnosis.',
      roleOfGenAI: 'Generative AI helped implement the API and graph consumers; I fixed the read-only boundary and reviewed the Teamcenter semantics.',
      proof: 'The server exposes node, edge, and search routes plus request-correlated diagnostics over the documented database source.',
      validation: 'Returned nodes and edges were checked against source records and downstream graph ingestion expectations.',
      limitations: 'The portfolio cannot expose the internal database or live records; the API is read-only and represents a bounded schema.',
      relatedProjects: ['graph', 'change-graph', 'tc-story', 'tc-change'], tags: ['Teamcenter', 'REST', 'Microsoft SQL Server', 'Semantic graph'], specs: [['Access', 'Read-only'], ['Data', 'Nodes + edges'], ['Diagnostics', 'Request ID + syslog']]
    }),
    defineProject({
      k: 'codex', title: 'Source-Backed Genealogy Research', category: 'experiments', artifactType: 'Research prototype', status: 'Documented experiment', collection: 'explorations',
      summary: 'A test of using a research agent to build a family tree from cited sources while preserving unresolved evidence gaps; the public demonstration is entirely fictionalized.',
      problem: 'A plausible family narrative is easy for a model to invent, so a useful research workflow must attach claims to sources and keep uncertainty visible.',
      griffinsRole: 'I directed the research, set citation and uncertainty rules, reviewed the evidence, and built the HTML and PDF presentation.',
      roleOfGenAI: 'Codex helped locate, organize, and present candidate evidence; I decided which relationships were supported and which remained unresolved.',
      proof: 'The project produces a cited tree and records open evidence gaps alongside the narrative.',
      validation: 'Claims in the private workflow were checked against their cited sources; the public fixture validates presentation behavior only.',
      limitations: 'The public names and records are fictional, research sources can conflict, and no generated relationship is accepted without source review.',
      relatedProjects: ['notes', 'protein'], tags: ['Codex', 'Citations', 'Family tree', 'Research boundaries'], specs: [['Evidence', 'Source citations'], ['Output', 'HTML + PDF'], ['Public data', 'Fictionalized']]
    }),
    defineProject({
      k: 'goals', title: 'Goal Evidence Draft', category: 'local-tools', artifactType: 'Supporting artifact', status: 'Merged lineage', collection: 'merged', public: false, mergedInto: 'progression',
      summary: 'An earlier private goal-and-evidence draft now absorbed into the broader Progression Evidence System.',
      problem: 'The first draft separated goal levels from the fuller body of project proof and readiness context.',
      griffinsRole: 'I created the minimum, stretch, and evidence structure and later consolidated it into the more complete system.',
      roleOfGenAI: 'Generative AI helped structure draft goal language; I selected evidence and chose to merge rather than publicly duplicate the work.',
      proof: 'The private Markdown draft preserves the structure that became part of the successor.',
      validation: 'Its useful sections were carried into the consolidated evidence model.',
      limitations: 'It is hidden, contains private planning context, and is not presented as an independent public project.',
      relatedProjects: ['progression'], tags: ['Planning', 'Evidence', 'Private lineage'], specs: [['State', 'Merged'], ['Successor', 'Progression Evidence System'], ['Public', 'No']]
    }),
    defineProject({
      k: 'luma', title: 'Dotmatics Luma API Explorer', category: 'experiments', artifactType: 'Research prototype', status: 'Research fragment', collection: 'archive',
      summary: 'A bounded investigation of how Dotmatics Luma laboratory applications, repositories, tables, and flows can be accessed through GraphQL and REST.',
      problem: 'The available integration surface needed to be mapped before anyone could judge which laboratory objects and operations were practical to automate.',
      griffinsRole: 'I documented the observed operations and built small client experiments across the application, repository, table, and flow surfaces.',
      roleOfGenAI: 'Generative AI assisted API exploration and client drafting; I kept unsupported behavior and operational risk explicit.',
      proof: 'Research notes and client experiments preserve the observed GraphQL and REST request shapes.',
      validation: 'Requests were checked only in the available research environment and recorded with their observed boundaries.',
      limitations: 'The investigated surface is unsupported and may change; the work is not a production connector and must not be treated as official API guidance.',
      relatedProjects: ['graph'], tags: ['Dotmatics Luma', 'GraphQL', 'REST', 'API research'], specs: [['Objects', 'Apps · repositories · tables · flows'], ['State', 'Unsupported surface'], ['Claim', 'Research only']]
    }),
    defineProject({
      k: 'ml-dev', title: 'AI Studio Open-Weight LLM Connector', category: 'local-tools', artifactType: 'Integration', status: 'Working extension', collection: 'archive',
      summary: 'Extended an existing AI Studio LLM connector JAR so the low-code machine-learning environment could use open-weight models, broadening access beyond its original model path.',
      problem: 'AI Studio pairs with AI Hub for authoring and publishing scoring processes, but the existing connector’s original model route limited access to other model choices.',
      griffinsRole: 'I took the existing connector JAR, added the open-weight model path, integrated it with the AI Studio connection workflow, and checked the connection behavior.',
      roleOfGenAI: 'The open-weight language model is the newly reachable runtime; I extended the connector rather than building the original JAR or the separate MCP agent extension.',
      proof: 'The enhanced connector JAR and connection workflow show the additional open-weight provider path.',
      validation: 'The connector was checked by configuring the model profile and running the connection path in AI Studio.',
      limitations: 'The original connector predates my work, the public portfolio cannot include configured model endpoints, and this project is distinct from MCP agent behavior.',
      relatedProjects: ['ai-studio-mcp', 'ai-studio-millon', 'capital', 'llms'], tags: ['AI Studio', 'Existing connector JAR', 'Open-weight models', 'AI Hub'], specs: [['Contribution', 'Enhanced existing JAR'], ['Model path', 'Open-weight'], ['Distinct from', 'MCP agent extension']]
    }),
    defineProject({
      k: 'time', title: 'Customer Opportunity Time Intelligence', category: 'local-tools', artifactType: 'Working application', status: 'Internal workflow', collection: 'archive',
      summary: 'A GenAI workflow that uses Microsoft 365 Copilot, calendar, email, and WorkIQ context to estimate weekly hours by customer opportunity, then reconciles the result with an internal Salesforce agent and a reviewable CSV dashboard.',
      problem: 'Weekly opportunity time is scattered across meetings and messages, while a manual timesheet cannot easily reconstruct which customer work the week actually contained.',
      griffinsRole: 'I designed the opportunity-matching workflow, connected the Microsoft 365 and internal Salesforce context, and built the CSV review and adjustment surface.',
      roleOfGenAI: 'Microsoft 365 Copilot reasons over calendar, email, and WorkIQ context to propose hours; the Salesforce agent supplies opportunity context and I review every estimate.',
      proof: 'The workflow and dashboard expose source-derived weekly estimates, opportunity reconciliation, manual adjustment, totals, and CSV export.',
      validation: 'Proposed hours are reconciled to internal Salesforce opportunities and reviewed by the user before the CSV is accepted.',
      limitations: 'The result is an estimate, not automatic timekeeping; private Microsoft 365 and Salesforce data are absent from the public review surface.',
      relatedProjects: ['copilot365', 'sfdc-main', 'sfdc-v1'], tags: ['Microsoft 365 Copilot', 'WorkIQ', 'Salesforce', 'CSV review'], specs: [['Context', 'Calendar + email + WorkIQ'], ['Reconcile', 'Internal Salesforce agent'], ['Control', 'Human review']]
    }),
    defineProject({
      k: 'widgets', title: 'Mendix Widget Foundry', category: 'local-tools', artifactType: 'Packaged tool', status: 'Packaged collection', collection: 'selected',
      summary: 'Ten packaged Mendix pluggable widgets plus reusable agent specifications and skills that capture how to build, validate, make accessible, and package complete .mpk outputs.',
      problem: 'Each widget repeats XML, generated typing, accessibility, build, packaging, and deployment decisions unless the working procedure is captured.',
      griffinsRole: 'I built and packaged the widget collection, identified the recurring constraints, and authored the reusable specifications and skills shared with other Mendix builders.',
      roleOfGenAI: 'Coding agents helped implement widgets from the captured contracts; I turned repeated failures and checks into explicit instructions and reviewed every packaged result.',
      proof: 'The portfolio includes the live Agent Graph Editor layer, a packaged Diagram Editor, additional working captures, three agent specifications, and two reusable skills.',
      validation: 'Widgets were built, type-checked, reviewed for accessibility, packaged as .mpk files, and exercised in Mendix or the public React lab as appropriate.',
      limitations: 'The browser lab substitutes sample values and local adapters for Mendix runtime services; each widget still needs validation in its target app and platform version.',
      relatedProjects: ['new-view', 'bom', 'supply-risk', 'et-site'], tags: ['Mendix widgets', 'React + TypeScript', 'Agent specifications', '.mpk'], specs: [['Collection', '10 packaged widgets'], ['Knowledge', '3 agent specs + 2 skills'], ['Proof', 'Live React layer lab']],
      alt: 'Mendix Widget Foundry showing an Agent Graph Editor and the reusable build, validation, and packaging workflow.'
    }),
    defineProject({
      k: 'evora', title: 'Drone Fleet Control Center', category: 'industrial-applications', artifactType: 'Interactive demo', status: 'Interface benchmark', collection: 'archive',
      summary: 'A single-file GenAI frontend benchmark for whether a coding agent could organize fleet filters, aircraft selection, mission status, a map, battery state, and telemetry into a coherent control interface.',
      problem: 'The test asked whether a generated industrial interface could maintain operational hierarchy and readable state density without a framework or backend.',
      griffinsRole: 'I supplied the fleet-control brief, directed the generated interface, and judged its information hierarchy, interaction, and visual coherence.',
      roleOfGenAI: 'A coding agent produced and iterated the single-file interface; I constrained the scenario and made the final design decisions.',
      proof: 'The artifact is an inspectable HTML interface with working filters, selection, map, status, battery, and telemetry views.',
      validation: 'The controls and responsive layout were exercised against the bundled illustrative fleet fixture.',
      limitations: 'It is an interface benchmark with synthetic aircraft and telemetry, not a flight-control or production fleet-management system.',
      relatedProjects: ['world', 'et-site'], tags: ['GenAI frontend benchmark', 'Fleet interface', 'Map', 'Telemetry'], specs: [['Format', 'Single HTML file'], ['Data', 'Synthetic fleet'], ['Claim', 'Interface only']]
    }),
    defineProject({
      k: 'lunch', title: 'AI Lunch Concierge', category: 'experiments', artifactType: 'Working application', status: 'Working prototype', collection: 'archive',
      summary: 'A tool-using lunch recommender that compares offers, prices, and locations on a map and shows why it recommended each option.',
      problem: 'A useful recommendation should account for location, preferences, cost, and available deals instead of returning an unexplained random pick.',
      griffinsRole: 'I designed the comparison workflow, built the deal and MapLibre surfaces, connected the tool calls, and made the recommendation rationale visible.',
      roleOfGenAI: 'The model calls scoped comparison tools and explains its recommendation; I control the candidate data, tool results, and presentation of the reasoning.',
      proof: 'The working prototype displays candidates, map locations, price and distance comparisons, and the selected option’s rationale.',
      validation: 'Recommendations were checked against the visible input preferences and comparison values in the demonstration fixture.',
      limitations: 'Offers and locations in the public experience are demonstration data; it is not a live restaurant, ordering, or dietary-safety service.',
      relatedProjects: ['flights-mcp'], tags: ['Tool-using agent', 'MapLibre', 'Price comparison', 'Recommendations'], specs: [['Input', 'Location + preferences'], ['Compare', 'Offers + price + distance'], ['Output', 'Visible rationale']]
    }),
    defineProject({
      k: 'world', title: 'Real-Time WorldView', category: 'experiments', artifactType: 'Interactive demo', status: 'Interface prototype', collection: 'archive',
      summary: 'A Cesium globe interface for exploring satellites, aircraft, vessels, trains, threats, imagery layers, cameras, and entity details in one multi-domain view.',
      problem: 'Moving entities from different domains become difficult to compare when their location, source, status, and imagery context are separated.',
      griffinsRole: 'I defined the multi-domain interface question and built the globe, layers, entity inspection, camera controls, and synthetic data adapters.',
      roleOfGenAI: 'Generative AI helped implement and iterate the Cesium interface while I set the source labels, interaction rules, and explicit fixture boundary.',
      proof: 'The interactive artifact supports layer toggles, moving entities, camera views, and a selected-entity detail panel.',
      validation: 'Layer, camera, selection, and update behavior were tested with the bundled fixture streams.',
      limitations: 'The public entities and feeds are synthetic; the prototype does not provide live tracking, operational awareness, or verified threat intelligence.',
      relatedProjects: ['evora'], tags: ['Cesium', '3D globe', 'Synthetic streams', 'Entity inspection'], specs: [['Domains', 'Air · sea · space · rail'], ['Actions', 'Layer + inspect + camera'], ['Data', 'Synthetic fixtures']]
    }),
    defineProject({
      k: 'hello', title: 'Animated Hello World', category: 'experiments', artifactType: 'Lab fragment', status: 'Visual fragment', collection: 'lab-fragments',
      summary: 'A deliberately tiny single-page animation study retained as a lab fragment rather than presented as a full project.',
      problem: 'The exercise tested whether a minimal HTML and CSS artifact could still establish timing, hierarchy, and a distinct visual gesture.',
      griffinsRole: 'I set the visual prompt, directed the implementation, and kept the experiment intentionally small.',
      roleOfGenAI: 'A coding agent helped produce the animation from the compact brief; I selected the final motion and composition.',
      proof: 'The complete artifact is one inspectable static page.',
      validation: 'The page was checked in a browser for animation, layout, and reduced-motion behavior.',
      limitations: 'It is a visual sketch with no application workflow, data integration, or claim beyond the animation exercise.',
      relatedProjects: ['et-site'], tags: ['HTML', 'CSS', 'Animation', 'Lab fragment'], specs: [['Files', '1 page'], ['Scope', 'Visual study'], ['Collection', 'Lab fragments']]
    }),
    defineProject({
      k: 'custom-dirs', title: 'NX Custom Directory Configuration', category: 'plm-cad', artifactType: 'Supporting artifact', status: 'Automation support', collection: 'supporting',
      summary: 'NX startup configuration that points customDirs.dat to a managed directory, loads NXHostFacade.dll, and records diagnostics for the surrounding automation environment.',
      problem: 'NX automation cannot start predictably when its managed extension and startup location are configured by hand on each machine.',
      griffinsRole: 'I assembled the custom-directory and startup deployment, wired the managed DLL load, and added diagnostic logging.',
      roleOfGenAI: 'The configuration enables the runtime used by GenAI-assisted NX tooling; I defined and verified the host setup rather than presenting it as a standalone agent.',
      proof: 'The retained customDirs.dat, startup structure, DLL path, and logs document the runtime arrangement.',
      validation: 'NX startup and extension loading were checked through the diagnostic output.',
      limitations: 'The paths and binaries are environment-specific support artifacts and are not a general NX installer.',
      relatedProjects: ['nx', 'nx-journals'], tags: ['NX', 'customDirs.dat', 'Managed DLL', 'Startup diagnostics'], specs: [['Entry', 'customDirs.dat'], ['Load', 'NXHostFacade.dll'], ['Role', 'NX automation support']]
    }),
    defineProject({
      k: 'neo4j-lab', title: 'Neo4j Desktop MCP Server', category: 'agents-mcp', artifactType: 'Integration', status: 'Working prototype', collection: 'archive',
      summary: 'A 24-tool MCP server that makes local Neo4j Desktop environments discoverable and operable through explicit tools for lifecycle, databases, read-only Cypher, plugins, backups, settings, and connections.',
      problem: 'An agent cannot use a local graph environment reliably if projects, databases, and operations are hidden behind desktop state and undifferentiated commands.',
      griffinsRole: 'I built automatic Neo4j Desktop discovery, designed the 24 typed operations, and separated read-only query behavior from lifecycle and administration actions.',
      roleOfGenAI: 'An AI client discovers and composes the explicit graph tools; I define the boundaries and keep each operation visible rather than granting arbitrary shell access.',
      proof: 'The server registers the documented tool inventory and the portfolio interaction exposes discovery, project state, query, plugin, backup, and connection surfaces.',
      validation: 'Discovery and representative tool paths were exercised against a local Neo4j Desktop installation.',
      limitations: 'Administrative operations remain powerful and require local operator judgment; the public demo is a reconstruction without a live database.',
      relatedProjects: ['graph', 'graph-rag', 'pricebook', 'mcp-dev'], tags: ['Neo4j Desktop', 'MCP', 'Cypher', 'TypeScript'], specs: [['Tools', '24'], ['Discovery', 'Local automatic discovery'], ['Query', 'Read-only Cypher surface']]
    }),
    defineProject({
      k: 'copilot365', title: 'Microsoft 365 Copilot CLI + MCP', category: 'agents-mcp', artifactType: 'Integration', status: 'Working prototype', collection: 'explorations',
      summary: 'A read-only Windows desktop bridge that exposes work-grounded Microsoft 365 Copilot responses to local command-line and MCP workflows.',
      problem: 'Local automation needed a bounded way to reuse answers from an already signed-in Microsoft 365 Copilot desktop session without claiming an unsupported official API integration.',
      griffinsRole: 'I built the Python CLI and MCP surface, automated the signed-in desktop app through accessibility and window messages, and constrained the bridge to read and reason.',
      roleOfGenAI: 'Microsoft 365 Copilot supplies work-grounded answers; a local MCP client can request and reuse that text while my bridge controls the desktop interaction.',
      proof: 'The implementation and interaction show CLI and MCP requests moving through the desktop Copilot surface and returning text.',
      validation: 'Requests were exercised against the signed-in desktop app and checked for focus behavior and returned read-only responses.',
      limitations: 'This is an unofficial local desktop bridge, not a Microsoft API or endorsed integration; UI changes can break automation and no write actions are exposed.',
      relatedProjects: ['time', 'sfdc-main', 'playwright'], tags: ['Microsoft 365 Copilot', 'MCP', 'Python', 'Windows accessibility'], specs: [['Surface', 'CLI + MCP'], ['Source', 'Signed-in desktop app'], ['Authority', 'Read / reason only']]
    }),
    defineProject({
      k: 'notes', title: '_notes — Engineering Memory System', category: 'local-tools', artifactType: 'Documentation system', status: 'Active personal system', collection: 'archive',
      summary: 'A local, plaintext knowledge base that keeps engineering notes, decisions, and runbooks searchable and reusable across projects.',
      problem: 'Technical context disappears between projects and agent sessions unless decisions, failed approaches, commands, and runbooks are retained in a durable format.',
      griffinsRole: 'I designed the plaintext organization; I write and curate the engineering notes and decide which context is reliable enough to reuse.',
      roleOfGenAI: 'Coding agents search the retained engineering memory to recover project context and reuse prior decisions; they do not replace my curation or create hidden memory.',
      proof: 'The artifact is the local Markdown corpus and its searchable organization across engineering subjects and projects.',
      validation: 'Useful notes are checked by applying their commands, decisions, and runbooks in later work and correcting stale context when found.',
      limitations: 'It is a local plaintext knowledge base, not an autonomous knowledge graph, and its usefulness depends on ongoing human curation.',
      relatedProjects: ['obsidian', 'progression', 'codex'], tags: ['Plaintext', 'Markdown', 'Engineering context', 'Search'], specs: [['Format', 'Local plaintext'], ['Purpose', 'Retain context'], ['Use', 'Search + reuse']]
    }),
    defineProject({
      k: 'obsidian', title: 'Obsidian Workspace Configuration', category: 'local-tools', artifactType: 'Lab fragment', status: 'Configuration artifact', collection: 'lab-fragments',
      summary: 'The Obsidian workspace and plugin configuration used around the engineering notes, retained as a small configuration artifact rather than a standalone application.',
      problem: 'A plaintext notes system still needs a predictable editor workspace and versioning preferences, but that setup should not be confused with the knowledge base itself.',
      griffinsRole: 'I configured the core and community plugins and the obsidian-git settings used by the local workspace.',
      roleOfGenAI: 'The configuration supports the note environment consulted by coding agents; no generative capability is attributed to Obsidian itself.',
      proof: 'The workspace and plugin JSON files preserve the configured state.',
      validation: 'The settings were inspected against the local workspace and plugin inventory.',
      limitations: 'It is configuration only—not a repair tool, sync product, or substitute for the actual plaintext engineering memory.',
      relatedProjects: ['notes'], tags: ['Obsidian', 'Workspace config', 'Plugin settings', 'Lab fragment'], specs: [['Artifact', 'Configuration files'], ['Plugins', 'Core + community'], ['Collection', 'Lab fragments']]
    }),
    defineProject({
      k: 'mx-docker', title: 'MXDocker Snapshot Deployment', category: 'edge-manufacturing', artifactType: 'Packaged tool', status: 'Recovery utility', collection: 'archive',
      summary: 'A repeatable Docker recovery environment for a copied Mendix application, including database migration, filestore seeding, health checks, and recovery controls.',
      problem: 'A copied Mendix release with an HSQLDB snapshot and filestore needs a controlled path into an isolated, repeatable runtime.',
      griffinsRole: 'I built the container setup, one-time PostgreSQL migration, filestore seed, health checks, and recovery controls around the copied application artifacts.',
      roleOfGenAI: 'Generative AI assisted the deployment and diagnostic scripting while I controlled the snapshot, migration order, persistence, and recovery decisions.',
      proof: 'The environment includes the Docker configuration and explicit migration, seed, health, and recovery paths.',
      validation: 'The copied application was started in isolation and checked for migrated database state, filestore availability, and health.',
      limitations: 'It targets a specific copied snapshot and is a recovery environment, not a universal Mendix production deployment blueprint.',
      relatedProjects: ['mx-migration'], tags: ['Mendix', 'Docker', 'PostgreSQL', 'Recovery'], specs: [['Input', 'MDA + HSQLDB snapshot'], ['Migration', 'HSQLDB → PostgreSQL'], ['Controls', 'Health + recovery']]
    }),
    defineProject({
      k: 'soa', title: 'MCP-Teamcenter · SOA Gateway', category: 'agents-mcp', artifactType: 'Integration', status: 'Working prototype', collection: 'selected',
      summary: 'A FastMCP gateway that lets an AI client work through authenticated Teamcenter service-oriented-architecture sessions while read, edit, and full-write authority remain explicit.',
      problem: 'An agent needs authenticated Teamcenter context to be useful, but a single undifferentiated permission level makes enterprise operations difficult to govern.',
      griffinsRole: 'I built the gateway, session authentication, local and Eureka discovery modes, resources, prompts, 77 registered tools, and runtime write gates.',
      roleOfGenAI: 'The AI client chooses among named Teamcenter tools; I designed the tool surface and operator-controlled authority levels around the real SOA sessions.',
      proof: 'The implementation documents the 77 tools and includes a redacted walkthrough of search, object loading, bill-of-materials expansion, and permission changes.',
      validation: 'Authentication, discovery, representative reads, BOM traversal, and gate transitions were exercised in the intended Teamcenter environment.',
      limitations: 'The public walkthrough is sanitized and cannot run a Teamcenter session; operator gates reduce accidental scope but do not replace enterprise authorization or review.',
      relatedProjects: ['tc-change', 'bom', 'info-site', 'tc-story'], tags: ['FastMCP', 'Teamcenter SOA', 'Python', 'Authority gates'], specs: [['Tools', '77 registered'], ['Modes', 'Local + Eureka'], ['Gates', 'Read · edit · full write']],
      alt: 'Architecture showing an AI client entering an authenticated MCP gateway, passing an explicit read, edit, or full-write gate, and reaching Teamcenter SOA through local or Eureka discovery.'
    })
  ]);

  const BUILD_THREADS = Object.freeze([
    Object.freeze({ id: 'open-models', title: 'Open model workflows', summary: 'An existing connector gains an open-weight path, then deployed predictive output becomes an inspectable application.', projects: Object.freeze([
      Object.freeze({ key: 'ml-dev', label: 'Open-weight connector' }),
      Object.freeze({ label: 'AI Studio + AI Hub' }),
      Object.freeze({ key: 'ai-studio-millon', label: 'Engineering-change cost dashboard' })
    ]) }),
    Object.freeze({ id: 'virtual-edge', title: 'Virtual edge anywhere', summary: 'A virtual edge runtime supports telemetry and a hands-on Mendix experience without physical shop-floor hardware.', projects: Object.freeze([
      Object.freeze({ key: 'hyperv', label: 'Hyper-V · IEVD + IEM' }),
      Object.freeze({ key: 'edge', label: 'Industrial Edge telemetry' }),
      Object.freeze({ label: 'Mendix experience' })
    ]) }),
    Object.freeze({ id: 'opportunity-intelligence', title: 'Opportunity intelligence', summary: 'Work-grounded context becomes an opportunity estimate that a person can reconcile and adjust.', projects: Object.freeze([
      Object.freeze({ key: 'copilot365', label: 'Microsoft 365 Copilot + WorkIQ' }),
      Object.freeze({ key: 'sfdc-main', label: 'Internal Salesforce context' }),
      Object.freeze({ key: 'time', label: 'Weekly opportunity review' })
    ]) }),
    Object.freeze({ id: 'capital-stack', title: 'Capital agent stack', summary: 'An existing engineering API becomes MCP tools while a separate connector broadens the assistant’s model choice.', projects: Object.freeze([
      Object.freeze({ label: 'Existing Capital REST API' }),
      Object.freeze({ key: 'capital-mcp', label: 'Capital ECAD MCP server' }),
      Object.freeze({ key: 'capital', label: 'Local / open-weight model connector' })
    ]) }),
    Object.freeze({ id: 'game-benchmarks', title: 'Agentic game benchmarks', summary: 'Godot and Unreal builds expose what Codex and Sol achieved, and where both native-game experiments remained rough.', projects: Object.freeze([
      Object.freeze({ key: 'racer', label: 'Godot · Eifel Apex' }),
      Object.freeze({ key: 'personal', label: 'Unreal · RUNE DIFF' })
    ]) }),
    Object.freeze({ id: 'teamcenter-stack', title: 'Teamcenter semantic/change stack', summary: 'Read-only product data becomes semantic relationships, reporting evidence, and a connected change story.', projects: Object.freeze([
      Object.freeze({ key: 'info-site', label: 'Semantic graph API' }),
      Object.freeze({ key: 'graph', label: 'RDF integration' }),
      Object.freeze({ key: 'change-graph', label: 'Change cockpit' }),
      Object.freeze({ key: 'tc-change', label: 'Change KPI evidence' })
    ]) }),
    Object.freeze({ id: 'nx-evolution', title: 'NX automation evolution', summary: 'Recorded NXOpen sequences become reusable typed agent tools and inspectable CAD outputs.', projects: Object.freeze([
      Object.freeze({ key: 'nx-journals', label: 'Recorded NXOpen journals' }),
      Object.freeze({ key: 'custom-dirs', label: 'NX runtime configuration' }),
      Object.freeze({ key: 'nx', label: '68 typed NX tools' }),
      Object.freeze({ label: 'Generated benchmark artifacts' })
    ]) })
  ]);

  const EXPLORATION_GROUPS = Object.freeze([
    Object.freeze({
      id: 'game-benchmarks',
      title: 'Godot vs. Unreal — Agentic Game-Building Benchmarks',
      summary: 'Two native-engine builds compare what Codex and Sol could produce under my direction, with playable evidence and candid limits instead of invented scores.',
      projects: Object.freeze(['racer', 'personal'])
    })
  ]);

  const INTERACTIVE_DEMO_KEYS = Object.freeze([
    'playwright', 'dt-composer', 'nx', 'soa', 'tc-change', 'widgets', 'mro', 'video',
    'graph', 'new-view', 'edge', 'llms', 'change-graph', 'protein', 'copilot365', 'racer', 'personal',
    'hub', 'ix', 'ai-studio-mcp', 'ai-studio-millon', 'nx-mendix', 'neo4j-lab', 'lunch', 'world'
  ]);
  const LAB_FRAGMENT_KEYS = Object.freeze(['hello', 'obsidian']);

  const CATEGORY_BY_KEY = Object.freeze(Object.fromEntries(PROJECTS.map((project) => [project.k, project.category])));
  const STATUS_BY_KEY = Object.freeze(Object.fromEntries(PROJECTS.map((project) => [project.k, project.status])));
  const ARTIFACT_TYPE_BY_KEY = Object.freeze(Object.fromEntries(PROJECTS.map((project) => [project.k, project.artifactType])));
  const STORIES = Object.freeze(Object.fromEntries(PROJECTS.map((project) => [project.k, Object.freeze({
    summary: project.summary,
    problem: project.problem,
    contribution: project.griffinsRole,
    griffinsRole: project.griffinsRole,
    roleOfGenAI: project.roleOfGenAI,
    proof: project.proof,
    result: project.validation,
    validation: project.validation,
    limitations: project.limitations,
    relatedProjects: project.relatedProjects,
    externalEvidence: project.externalEvidence
  })])));
  const MEDIA_ALT = Object.freeze(Object.fromEntries(PROJECTS.map((project) => [project.k, project.alt || (project.title + ' project artifact.')])));

  const expectedKeys = Object.freeze([
    'mro', 'edge', 'hub', 'ix', 'ai-studio-mcp', 'ai-studio-millon', 'change-graph', 'new-view', 'rl26', 'mx-migration', 'mx-sap', 'sap-replace',
    'sfdc-v1', 'sfdc-main', 'supply-risk', 'plm-vis', 'db-jdbc', '4090', 'bom', 'dt-composer', 'hyperv', 'llms', 'video', 'explore', 'networking',
    'one-pager', 'personal', 'playwright', 'pricebook', 'progression', 'racer', 'protein', 'siemens-ppts', 'nx', 'graph', 'capital', 'flights-mcp',
    'graph-rag', 'capital-mcp', 'nx-mendix', 'tc-change', 'tc-story', 'mcp-dev', 'nx-journals', 'et-site', 'info-site', 'codex', 'goals', 'luma',
    'ml-dev', 'time', 'widgets', 'evora', 'lunch', 'world', 'hello', 'custom-dirs', 'neo4j-lab', 'copilot365', 'notes', 'obsidian', 'mx-docker', 'soa'
  ]);
  const keySet = new Set(PROJECTS.map((project) => project.k));
  const categorySet = new Set(CATEGORIES.map((category) => category.key));
  if (PROJECTS.length !== 63 || keySet.size !== 63 || expectedKeys.some((key) => !keySet.has(key))) {
    throw new Error('Portfolio content model must contain the expected 63 unique projects.');
  }
  PROJECTS.forEach((project) => {
    ['title', 'summary', 'category', 'artifactType', 'status', 'collection', 'problem', 'roleOfGenAI', 'griffinsRole', 'proof', 'validation', 'limitations'].forEach((field) => {
      if (!project[field]) throw new Error('Missing ' + field + ' for project ' + project.k + '.');
    });
    if (!categorySet.has(project.category)) throw new Error('Unknown category for project ' + project.k + '.');
    project.relatedProjects.forEach((key) => {
      if (!keySet.has(key)) throw new Error('Unknown related project ' + key + ' on ' + project.k + '.');
    });
  });

  window.PORTFOLIO_CONTENT = Object.freeze({
    projects: PROJECTS,
    allProjectKeys: expectedKeys,
    selectedKeys: SELECTED_KEYS,
    explorationKeys: EXPLORATION_KEYS,
    explorationGroups: EXPLORATION_GROUPS,
    labFragmentKeys: LAB_FRAGMENT_KEYS,
    interactiveDemoKeys: INTERACTIVE_DEMO_KEYS,
    buildThreads: BUILD_THREADS,
    categories: CATEGORIES,
    categoryByKey: CATEGORY_BY_KEY,
    statusByKey: STATUS_BY_KEY,
    artifactTypeByKey: ARTIFACT_TYPE_BY_KEY,
    caseStudySlugs: CASE_STUDY_SLUGS,
    stories: STORIES,
    mediaAlt: MEDIA_ALT,
    projectOverrides: Object.freeze({}),
    profile: Object.freeze({ linkedin: '' })
  });
})();
