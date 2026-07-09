// Verified edge census and demo chain from live Teamcenter + AGS
export const edgeCensus = [
  { predicate: 'ITEM_HAS_REVISION', count: 3388, color: 'teal' as const, desc: 'Item to its revision lineage' },
  { predicate: 'REVISION_HAS_DATASET', count: 2103, color: 'blue' as const, desc: 'Revision general attachments' },
  { predicate: 'REVISION_HAS_SPECIFICATION_DATASET', count: 2679, color: 'purple' as const, desc: 'Revision specification docs' },
  { predicate: 'REVISION_HAS_REFERENCE_DATASET', count: 4, color: 'amber' as const, desc: 'Revision reference datasets' },
  { predicate: 'REVISION_RELATED_TO_REVISION', count: 904, color: 'coral' as const, desc: 'Cross-revision relationships' },
  { predicate: 'WORKFLOW_TARGETS_OBJECT', count: 231, color: 'blue' as const, desc: 'Workflow process targets' },
  { predicate: 'CHANGE_AFFECTS_REVISION', count: 293, color: 'amber' as const, desc: 'Engineering change impacts' },
]

export const totalEdges = edgeCensus.reduce((sum, e) => sum + e.count, 0)
export const totalItems = 3338
export const totalRevisions = 3388
export const totalDatasets = 26335

// Demo chain proof: real Teamcenter UIDs
export const demoChain = {
  item: { id: 'tc:item:001024', uid: 'yoMAAQdo5BWnuC', name: 'Item 001024', type: 'Item' },
  revision: { id: 'tc:rev:001024/A', uid: 'yfMAAQdo5BWnuC', name: '001024/A', type: 'ItemRevision' },
  datasetGeneral: { id: 'tc:dataset:zzEAAQt85BWnuC', uid: 'zzEAAQt85BWnuC', name: 'General Dataset', type: 'Dataset', subtype: 'IMAN_Rendering' },
  datasetSpec: { id: 'tc:dataset:11FAAQdo5BWnuC', uid: '11FAAQdo5BWnuC', name: 'Spec Dataset', type: 'Dataset', subtype: 'IMAN_specification' },
}

// Graph nodes for the interactive visualization
export interface GraphNode {
  id: string
  label: string
  type: 'Item' | 'ItemRevision' | 'Dataset' | 'ChangeNotice' | 'Workflow'
  uid: string
  x: number
  y: number
  props: Record<string, string>
  agentStory: string
  sparql: string
}

export interface GraphEdge {
  source: string
  target: string
  predicate: string
  color: string
  agentStory: string
  sparql: string
}

export const graphNodes: GraphNode[] = [
  {
    id: 'item-001024', label: 'Item 001024', type: 'Item', uid: 'yoMAAQdo5BWnuC',
    x: 400, y: 80,
    props: { object_name: 'Turbine Assembly', item_id: '001024', object_type: 'Item', owning_group: 'Engineering' },
    agentStory: 'User asks: "What revisions exist for the turbine assembly?" → Agent identifies Item by name, traverses ITEM_HAS_REVISION edges to find all revision nodes.',
    sparql: `SELECT ?rev ?revId WHERE {\n  <tc:item:001024> tc:hasRevision ?rev .\n  ?rev tc:item_revision_id ?revId .\n}`,
  },
  {
    id: 'rev-001024-A', label: '001024/A', type: 'ItemRevision', uid: 'yfMAAQdo5BWnuC',
    x: 250, y: 220,
    props: { item_revision_id: 'A', release_status: 'Released', last_mod_date: '2024-11-15', checked_out_user: '' },
    agentStory: 'User asks: "Is revision A released?" → Agent looks up revision node, reads release_status property directly from graph — no need to call back to Teamcenter SOA.',
    sparql: `SELECT ?status WHERE {\n  <tc:rev:001024/A> tc:release_status_list ?status .\n}`,
  },
  {
    id: 'rev-001024-B', label: '001024/B', type: 'ItemRevision', uid: 'abCDEfgh1234',
    x: 550, y: 220,
    props: { item_revision_id: 'B', release_status: 'In Work', last_mod_date: '2025-01-22', checked_out_user: 'jsmith' },
    agentStory: 'User asks: "Who is working on the latest revision?" → Agent traverses to newest revision, reads checked_out_user. If checkout info isn\'t in graph, agent falls back to MCP/SOA.',
    sparql: `SELECT ?user WHERE {\n  <tc:rev:001024/B> tc:checked_out_user ?user .\n}`,
  },
  {
    id: 'ds-spec', label: 'CAD Spec', type: 'Dataset', uid: '11FAAQdo5BWnuC',
    x: 120, y: 380,
    props: { dataset_type: 'IMAN_specification', object_name: 'turbine_assy.prt', file_count: '1' },
    agentStory: 'User asks: "Show me the CAD file for this part" → Agent finds specification datasets attached to the revision. File retrieval requires MCP (graph stores metadata, not binary files).',
    sparql: `SELECT ?ds ?fname WHERE {\n  <tc:rev:001024/A> tc:hasSpecDataset ?ds .\n  ?ds tc:object_name ?fname ;\n     tc:dataset_type "IMAN_specification" .\n}`,
  },
  {
    id: 'ds-render', label: 'JT Render', type: 'Dataset', uid: 'zzEAAQt85BWnuC',
    x: 380, y: 380,
    props: { dataset_type: 'IMAN_Rendering', object_name: 'turbine_assy.jt', file_count: '1' },
    agentStory: 'User asks: "Can I preview this assembly?" → Agent discovers rendering dataset through REVISION_HAS_DATASET, confirms JT format is available for lightweight visualization.',
    sparql: `SELECT ?ds WHERE {\n  <tc:rev:001024/A> tc:hasDataset ?ds .\n  ?ds tc:dataset_type "IMAN_Rendering" .\n}`,
  },
  {
    id: 'cn-7721', label: 'CN-7721', type: 'ChangeNotice', uid: 'WlFAgsrB5BWnuC',
    x: 650, y: 380,
    props: { object_name: 'ECN Material Update', object_type: 'ChangeNoticeRevision', release_status: 'Pending' },
    agentStory: 'User asks: "Are there any open changes affecting this part?" → Agent traverses CHANGE_AFFECTS_REVISION edges to find impacting change notices — answers in milliseconds vs. SOA multi-hop.',
    sparql: `SELECT ?cn ?name WHERE {\n  ?cn tc:affectsRevision <tc:rev:001024/B> ;\n     tc:object_name ?name .\n}`,
  },
  {
    id: 'wf-release', label: 'Release WF', type: 'Workflow', uid: 'job123ABC',
    x: 550, y: 500,
    props: { object_name: 'Release Process', object_type: 'EPMJob', status: 'In Progress' },
    agentStory: 'User asks: "What\'s the approval status?" → Agent checks WORKFLOW_TARGETS_OBJECT edges to find active workflow processes targeting this revision.',
    sparql: `SELECT ?wf ?status WHERE {\n  ?wf tc:targetsObject <tc:rev:001024/B> ;\n     tc:object_name ?status .\n}`,
  },
]

export const graphEdges: GraphEdge[] = [
  {
    source: 'item-001024', target: 'rev-001024-A', predicate: 'ITEM_HAS_REVISION',
    color: '#48ce98',
    agentStory: 'This is the primary structure edge: every Teamcenter Item has one or more revisions. The agent traverses this first when resolving "what versions exist."',
    sparql: `SELECT ?rev WHERE {\n  <tc:item:001024> tc:hasRevision ?rev .\n}`,
  },
  {
    source: 'item-001024', target: 'rev-001024-B', predicate: 'ITEM_HAS_REVISION',
    color: '#48ce98',
    agentStory: 'Second revision edge — same predicate, different target. Graph structure makes it trivial to find all revisions without knowing count in advance.',
    sparql: `SELECT ?rev WHERE {\n  <tc:item:001024> tc:hasRevision ?rev .\n}`,
  },
  {
    source: 'rev-001024-A', target: 'ds-spec', predicate: 'REVISION_HAS_SPECIFICATION_DATASET',
    color: '#8579e5',
    agentStory: 'Specification datasets contain the primary engineering data (CAD, drawings). This edge type tells the agent which datasets are authoritative vs. derived.',
    sparql: `SELECT ?ds WHERE {\n  <tc:rev:001024/A> tc:hasSpecDataset ?ds .\n}`,
  },
  {
    source: 'rev-001024-A', target: 'ds-render', predicate: 'REVISION_HAS_DATASET',
    color: '#5d9edf',
    agentStory: 'General dataset relationships include rendering files, thumbnails, and attachments. The agent can filter by dataset_type to find previewable content.',
    sparql: `SELECT ?ds ?type WHERE {\n  <tc:rev:001024/A> tc:hasDataset ?ds .\n  ?ds tc:dataset_type ?type .\n}`,
  },
  {
    source: 'rev-001024-A', target: 'rev-001024-B', predicate: 'REVISION_RELATED_TO_REVISION',
    color: '#db7264',
    agentStory: 'Cross-revision links capture dependency and derivation relationships between different revision levels. Essential for impact analysis.',
    sparql: `SELECT ?related WHERE {\n  <tc:rev:001024/A> tc:relatedRevision ?related .\n}`,
  },
  {
    source: 'cn-7721', target: 'rev-001024-B', predicate: 'CHANGE_AFFECTS_REVISION',
    color: '#edb050',
    agentStory: 'Change impact edge — links engineering change notices to affected revisions. This is the key edge for answering "what changes affect this part?" without scanning the entire change management system.',
    sparql: `SELECT ?cn WHERE {\n  ?cn tc:affectsRevision <tc:rev:001024/B> ;\n     a tc:ChangeNotice .\n}`,
  },
  {
    source: 'wf-release', target: 'rev-001024-B', predicate: 'WORKFLOW_TARGETS_OBJECT',
    color: '#5d9edf',
    agentStory: 'Workflow targeting edge — connects active EPM process jobs to their target objects. Lets the agent instantly check approval/review state.',
    sparql: `SELECT ?wf WHERE {\n  ?wf tc:targetsObject <tc:rev:001024/B> ;\n     a tc:EPMJob .\n}`,
  },
]

// Decision engine scenarios
export const decisionScenarios = [
  {
    id: 'structure',
    userAsk: '"Show me all revisions for this item"',
    route: 'graph' as const,
    confidence: 0.95,
    reason: 'Structure traversal — fully materialized in graph with ITEM_HAS_REVISION edges. Sub-millisecond SPARQL query vs. multi-second SOA expandGRM call.',
    sparql: `SELECT ?rev ?revId WHERE {\n  ?item tc:item_id "001024" .\n  ?item tc:hasRevision ?rev .\n  ?rev tc:item_revision_id ?revId .\n}`,
  },
  {
    id: 'datasets',
    userAsk: '"What CAD files are attached to this revision?"',
    route: 'graph' as const,
    confidence: 0.92,
    reason: 'Dataset metadata (type, name, count) is in the graph. Agent resolves file existence and type instantly. Actual file download requires MCP handoff.',
    sparql: `SELECT ?ds ?name ?type WHERE {\n  <tc:rev:001024/A> tc:hasSpecDataset ?ds .\n  ?ds tc:object_name ?name ;\n     tc:dataset_type ?type .\n}`,
  },
  {
    id: 'impact',
    userAsk: '"Are there any changes affecting this part?"',
    route: 'graph' as const,
    confidence: 0.90,
    reason: 'CHANGE_AFFECTS_REVISION edges are materialized. Agent can answer impact questions with a single graph hop instead of querying CM-specific SOA services.',
    sparql: `SELECT ?cn ?name WHERE {\n  ?cn tc:affectsRevision <tc:rev:001024/B> ;\n     tc:object_name ?name .\n}`,
  },
  {
    id: 'checkout',
    userAsk: '"Who has this file checked out right now?"',
    route: 'hybrid' as const,
    confidence: 0.70,
    reason: 'Graph may have last-known checkout state, but real-time checkout is volatile. Agent checks graph first for cached state, then confirms with MCP/SOA if needed.',
    sparql: `# Graph first-pass:\nSELECT ?user WHERE {\n  <tc:rev:001024/B> tc:checked_out_user ?user .\n}\n# If empty → fall back to MCP getProperties`,
  },
  {
    id: 'file-download',
    userAsk: '"Download the JT file for visualization"',
    route: 'mcp' as const,
    confidence: 0.15,
    reason: 'Binary file retrieval is outside graph scope. Agent uses graph to locate the dataset UID, then delegates to MCP/SOA for actual file streaming.',
    sparql: `# Graph: locate the dataset\nSELECT ?uid WHERE {\n  <tc:rev:001024/A> tc:hasDataset ?ds .\n  ?ds tc:dataset_type "IMAN_Rendering" ;\n     tc:uid ?uid .\n}\n# Then: MCP getDatasetFiles(uid)`,
  },
  {
    id: 'approval',
    userAsk: '"What is the current approval status of this release?"',
    route: 'hybrid' as const,
    confidence: 0.65,
    reason: 'Graph has WORKFLOW_TARGETS_OBJECT edges showing which workflows target this object. Detailed task state (signoffs, due dates) may need MCP for live status.',
    sparql: `# Graph: find targeting workflows\nSELECT ?wf ?name WHERE {\n  ?wf tc:targetsObject <tc:rev:001024/B> ;\n     tc:object_name ?name .\n}\n# Detailed signoffs → MCP getWorkflowTasks`,
  },
  {
    id: 'bom',
    userAsk: '"What are the child components of this assembly?"',
    route: 'mcp' as const,
    confidence: 0.20,
    reason: 'BOM structure in Teamcenter is a runtime construct (BOMLine) not directly persisted as simple relationships. Agent must call SOA expandPSOneLevel for accurate BOM.',
    sparql: `# BOM is not in graph — runtime construct\n# Agent routes directly to MCP:\n# expandPSOneLevel(itemRevisionUID)`,
  },
]
