import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import { AgentGraphEditor } from "../../../../supplychainrisk-main/supplychainrisk-main/pluggable-widgets/AgentGraphEditor/src/AgentGraphEditor";
import type { AgentGraph } from "../../../../supplychainrisk-main/supplychainrisk-main/pluggable-widgets/AgentGraphEditor/src/types/agent-graph";
import { SupplyChainCharts } from "../../../../supplychainrisk-main/supplychainrisk-main/pluggable-widgets/SupplyChainCharts/src/SupplyChainCharts";
import type { ChartType } from "../../../../supplychainrisk-main/supplychainrisk-main/pluggable-widgets/SupplyChainCharts/src/types/charts";

import { ExpectedCostOfChangeView } from "../../../../widgets/expected-cost-of-change-widget/src/components/ExpectedCostOfChangeView";
import { parseExpectedCostModel } from "../../../../widgets/expected-cost-of-change-widget/src/model/expectedCostModel";
import "../../../../widgets/expected-cost-of-change-widget/src/ui/ExpectedCostOfChange.css";

import { GraphStudioGraphView } from "../../../../widgets/Siemens_ICX_GraphStudioGraph_1.0.0_source/src/components/GraphStudioGraphView";
import { parseGraphData } from "../../../../widgets/Siemens_ICX_GraphStudioGraph_1.0.0_source/src/utils/graphData";
import "../../../../widgets/Siemens_ICX_GraphStudioGraph_1.0.0_source/src/ui/GraphStudioGraph.css";

import "./lab.css";

type Surface = "graph" | "cost" | "graphstudio" | "charts" | "diagram";
type Theme = "dark" | "light";

const MODEL = { name: "GPT-4o", uuid: "deployed-model-reference" };
const EMPTY_DATA = { value: "[]" };

const SURFACES: Array<{ id: Surface; label: string; detail: string }> = [
  { id: "graph", label: "Agent graph", detail: "React Flow" },
  { id: "cost", label: "Cost of change", detail: "ML model" },
  { id: "graphstudio", label: "Graph studio", detail: "Cytoscape" },
  { id: "charts", label: "Risk charts", detail: "Nivo" },
  { id: "diagram", label: "Diagram editor", detail: "LocalLab" }
];

const CHARTS: Array<{ id: ChartType; label: string }> = [
  { id: "riskMatrix", label: "Risk matrix" },
  { id: "eventsByType", label: "Events" },
  { id: "remediationFunnel", label: "Remediation" },
  { id: "inventoryHealth", label: "Inventory" }
];

const SAMPLE_COST_MODEL_JSON = JSON.stringify({
  schemaVersion: "1.0",
  title: "Expected cost of change",
  subtitle: "ML-estimated operational exposure for ECO-1847",
  currency: "USD",
  locale: "en-US",
  defaultScenarioId: "likely",
  metadata: {
    modelName: "ICX Change Impact Model",
    modelVersion: "2.4.1",
    predictedAt: "2026-07-24T18:30:00-04:00",
    trainingWindow: "36 months",
    similarChanges: 428
  },
  scenarios: [
    {
      id: "likely",
      label: "Likely",
      badge: "P50 scenario",
      expectedCost: 184000,
      range: { low: 112000, p50: 184000, high: 296000 },
      confidence: { score: 78, label: "Strong comparable history" },
      interpretation: "Most exposure is concentrated in production disruption and inventory already in motion.",
      scheduleRisk: {
        label: "Include schedule-risk uplift",
        upliftPercent: 18,
        description: "Applies modeled downstream cost when implementation threatens committed production."
      },
      drivers: [
        { id: "production", label: "Production disruption", amount: 68000, category: "Operations" },
        { id: "rework", label: "Scrap and rework", amount: 41000, category: "Quality" },
        { id: "inventory", label: "Inventory exposure", amount: 33000, category: "Inventory" },
        { id: "supplier", label: "Supplier expedite", amount: 24000, category: "Supply chain" },
        { id: "engineering", label: "Engineering and validation", amount: 18000, category: "Engineering" }
      ],
      evidence: [
        { label: "Similar ECO history", value: "428 changes", source: "Teamcenter", impact: "high" },
        { label: "Current WIP", value: "1,280 units", source: "Opcenter", impact: "high" },
        { label: "Supplier lead time", value: "11 weeks", source: "ERP", impact: "medium" }
      ]
    },
    {
      id: "conservative",
      label: "Conservative",
      badge: "P10 risk-adjusted",
      expectedCost: 296000,
      range: { low: 184000, p50: 296000, high: 420000 },
      confidence: { score: 64, label: "High supplier lead-time variance" },
      interpretation: "Extended supplier lead times and line stoppage could drive significant secondary expediting costs.",
      drivers: [
        { id: "production", label: "Production disruption", amount: 120000, category: "Operations" },
        { id: "inventory", label: "Inventory exposure", amount: 75000, category: "Inventory" },
        { id: "rework", label: "Scrap and rework", amount: 55000, category: "Quality" },
        { id: "supplier", label: "Supplier expedite", amount: 46000, category: "Supply chain" }
      ],
      evidence: [
        { label: "Critical path part", value: "3 components", source: "Teamcenter", impact: "high" },
        { label: "Customer SLA penalty", value: "$50k/day", source: "Contract", impact: "high" }
      ]
    }
  ],
  disclaimer: "Expected cost represents modeled operational exposure, not approved spend, an accounting accrual, or a guaranteed outcome."
});

const INITIAL_GRAPH: AgentGraph = {
  agents: [
    {
      uuid: "sc-risk-analyst",
      title: "🔍 Risk Analyst",
      description: "Analyzes disruptions, severity, and cascade effects across the supply network.",
      versionTitle: "v1",
      modelName: MODEL.name,
      modelUuid: MODEL.uuid,
      tools: [
        tool("ra-tool-get-risk-exposure", "get_risk_exposure", "Returns current active risk events.", "MyFirstModule.TOOL_GetRiskExposure"),
        tool("ra-tool-get-bom-impact", "get_bom_impact", "Returns supplier BOM impact and days of cover.", "MyFirstModule.TOOL_GetBOMImpact"),
        tool("ra-tool-kg-impact-by-risk-event", "kg_get_impact_by_risk_event", "Reads impact metrics for a disruption event.", "MyFirstModule.TOOL_KG_GetImpactByRiskEvent"),
        tool("ra-tool-kg-supplier-profile", "kg_get_supplier_profile", "Reads the supplier capability and compliance profile.", "MyFirstModule.TOOL_KG_GetSupplierProfile")
      ]
    },
    {
      uuid: "sc-procurement-advisor",
      title: "🛒 Procurement Advisor",
      description: "Finds supply alternatives and compares cost, capacity, and qualification gaps.",
      versionTitle: "v1",
      modelName: MODEL.name,
      modelUuid: MODEL.uuid,
      tools: [
        tool("pa-tool-find-alternative-suppliers", "find_alternative_suppliers", "Finds qualified alternative suppliers.", "MyFirstModule.TOOL_FindAlternativeSuppliers"),
        tool("pa-tool-get-inventory-position", "get_inventory_position", "Returns inventory days of cover.", "MyFirstModule.TOOL_GetInventoryPosition"),
        tool("pa-tool-kg-alternatives", "kg_get_alternatives", "Ranks alternative suppliers and activation gaps.", "MyFirstModule.TOOL_KG_GetAlternatives"),
        tool("pa-tool-kg-regulatory", "kg_get_regulatory", "Returns regulatory requirements for a component category.", "MyFirstModule.TOOL_KG_GetRegulatory")
      ]
    },
    {
      uuid: "sc-response-planner",
      title: "📋 Response Planner",
      description: "Builds remediation options from impact, sourcing, inventory, and regulatory evidence.",
      versionTitle: "v1",
      modelName: MODEL.name,
      modelUuid: MODEL.uuid,
      tools: [
        tool("rp-tool-kg-remediation", "kg_get_remediation", "Builds a complete remediation plan for a disruption.", "MyFirstModule.TOOL_KG_GetRemediation"),
        tool("rp-tool-get-risk-exposure", "get_risk_exposure", "Returns current active risk events.", "MyFirstModule.TOOL_GetRiskExposure"),
        tool("rp-tool-find-alternative-suppliers", "find_alternative_suppliers", "Finds qualified alternative suppliers.", "MyFirstModule.TOOL_FindAlternativeSuppliers"),
        tool("rp-tool-get-inventory-position", "get_inventory_position", "Returns inventory days of cover.", "MyFirstModule.TOOL_GetInventoryPosition"),
        tool("rp-tool-kg-alternatives", "kg_get_alternatives", "Ranks alternative suppliers and activation gaps.", "MyFirstModule.TOOL_KG_GetAlternatives")
      ]
    }
  ]
};

function tool(uuid: string, name: string, description: string, microflow: string) {
  return { uuid, name, description, microflow };
}

function useCompact(): boolean {
  const [compact, setCompact] = useState(() => window.matchMedia("(max-width: 720px)").matches);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 720px)");
    const update = () => setCompact(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return compact;
}

function GraphLab({ compact }: { compact: boolean }) {
  const [graph, setGraph] = useState(INITIAL_GRAPH);
  const [theme, setTheme] = useState<Theme>("dark");
  const [narration, setNarration] = useState("");
  const [bridgeMessage, setBridgeMessage] = useState("Sample adapter ready");
  const pending = useRef({ title: "", description: "" });
  const selectedUuid = useRef("");

  function replayHandoff() {
    setNarration("");
    window.setTimeout(() => {
      setNarration(`🔍 Risk Analyst reviewed the disruption. 🛒 Procurement Advisor checked alternatives. 📋 Response Planner assembled the response. ${Date.now()}`);
    }, 20);
    setBridgeMessage("Replaying Mendix narration value");
  }

  function openCreateAgent(attempt = 0) {
    const canvas = document.querySelector<HTMLElement>(".graph-stage .agw-canvas");
    if (!canvas) {
      if (attempt < 30) window.setTimeout(() => openCreateAgent(attempt + 1), 50);
      return;
    }
    const drop = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(drop, "dataTransfer", {
      value: {
        types: ["application/x-agentgraph-palette"],
        getData: (type: string) => type === "application/x-agentgraph-palette" ? "new-agent" : ""
      }
    });
    canvas.dispatchEvent(drop);
  }

  function createAgent() {
    const title = pending.current.title.trim();
    if (!title) return;
    const uuid = `portfolio-agent-${Date.now()}`;
    setGraph((current) => ({
      agents: [
        ...current.agents,
        {
          uuid,
          title,
          description: pending.current.description || "Created through the browser-safe Mendix action adapter.",
          versionTitle: "draft",
          modelName: MODEL.name,
          modelUuid: MODEL.uuid,
          tools: []
        }
      ]
    }));
    setBridgeMessage(`onCreateAgent · ${title}`);
    pending.current = { title: "", description: "" };
  }

  return (
    <section className={`lab-surface graph-surface graph-surface--${theme}`} aria-label="Live Agent Graph Editor React layer">
      <div className="surface-bar">
        <div className="surface-heading">
          <b>Agent Graph Editor</b>
          <small>Real widget source · sample AgentCommons JSON</small>
        </div>
        <output className="bridge-status" aria-live="polite"><span>Adapter</span>{bridgeMessage}</output>
        <div className="surface-actions">
          <button type="button" onClick={openCreateAgent}>Add agent</button>
          <button type="button" onClick={replayHandoff}>Replay</button>
          <button type="button" onClick={() => setTheme((value) => value === "dark" ? "light" : "dark")} aria-label={`Use ${theme === "dark" ? "light" : "dark"} theme`}>
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </div>
      <div className="graph-stage">
        <AgentGraphEditor
          key={compact ? "compact" : "wide"}
          agentsData={{ value: JSON.stringify(graph) }}
          selectedAgentUuid={{
            value: selectedUuid.current,
            setValue: (value) => {
              selectedUuid.current = value;
              setBridgeMessage(`selectedAgentUuid · ${value}`);
            }
          }}
          pendingAgentTitle={{ value: pending.current.title, setValue: (value) => { pending.current.title = value; } }}
          pendingAgentDescription={{ value: pending.current.description, setValue: (value) => { pending.current.description = value; } }}
          narrationSource={{ value: narration }}
          onAgentClick={{ execute: () => setBridgeMessage(`onAgentClick · ${selectedUuid.current}`) }}
          onCreateAgent={{ execute: createAgent }}
          theme={theme}
          showControls
          showPalette
          paletteCollapsedByDefault={compact}
          showInspector
          inspectorCollapsedByDefault={compact}
          toolsCollapsedByDefault={compact}
          spotlightStepMs={1400}
        />
      </div>
    </section>
  );
}

function CostLab() {
  const [density, setDensity] = useState<"standard" | "compact" | "expanded">("standard");
  const [detailsExecuting, setDetailsExecuting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Microflow adapter ready");

  const parseResult = parseExpectedCostModel(SAMPLE_COST_MODEL_JSON);

  function handleOpenDetails() {
    setDetailsExecuting(true);
    setStatusMessage("Executing Mendix action: SUB_ExpectedCost_OpenDetails");
    setTimeout(() => {
      setDetailsExecuting(false);
      setStatusMessage("Details microflow completed");
    }, 800);
  }

  if (!parseResult.data) {
    return <div className="lab-error">Failed to parse cost model: {parseResult.error}</div>;
  }

  return (
    <section className="lab-surface cost-surface" aria-label="Live Expected Cost of Change React layer">
      <div className="surface-bar">
        <div className="surface-heading">
          <b>Expected Cost of Change</b>
          <small>ML-estimated operational exposure &amp; scenario model view</small>
        </div>
        <output className="bridge-status" aria-live="polite"><span>Adapter</span>{statusMessage}</output>
        <div className="surface-actions">
          <label style={{ color: "#9aa8bd", fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
            Density:
            <select
              value={density}
              onChange={(e) => setDensity(e.target.value as any)}
              style={{ background: "#121e31", color: "#d9e4f5", border: "1px solid #35445e", borderRadius: 6, padding: "4px 8px", fontSize: 11 }}
            >
              <option value="compact">Compact</option>
              <option value="standard">Standard</option>
              <option value="expanded">Expanded</option>
            </select>
          </label>
        </div>
      </div>
      <div className="cost-stage">
        <ExpectedCostOfChangeView
          name="ExpectedCostOfChange_Lab"
          model={parseResult.data}
          density={density}
          showScenarioSelector={true}
          showEvidence={true}
          showModelMetadata={true}
          showDisclaimer={true}
          detailsEnabled={true}
          detailsExecuting={detailsExecuting}
          onOpenDetails={handleOpenDetails}
        />
      </div>
    </section>
  );
}

function GraphStudioLab() {
  const [selectedInfo, setSelectedInfo] = useState<string>("Click any graph node or edge to inspect attributes");

  const parseResult = parseGraphData("", true, "ECR-4471 — Operational Impact Evidence");

  return (
    <section className="lab-surface graphstudio-surface" aria-label="Live GraphStudio Graph Explorer React layer">
      <div className="surface-bar">
        <div className="surface-heading">
          <b>GraphStudio Graph Explorer</b>
          <small>Siemens ICX Cytoscape graph canvas &amp; node inspector</small>
        </div>
        <output className="bridge-status" aria-live="polite"><span>Selection</span>{selectedInfo}</output>
      </div>
      <div className="graphstudio-stage">
        <GraphStudioGraphView
          id="graph-studio-lab-widget"
          height={600}
          parseResult={parseResult}
          showExplorer={true}
          showInspector={true}
          showMinimap={true}
          onSelectionChange={(sel) => {
            if (sel) {
              setSelectedInfo(`${sel.kind.toUpperCase()}: ${sel.id}`);
            } else {
              setSelectedInfo("Selection cleared");
            }
          }}
        />
      </div>
    </section>
  );
}

function ChartsLab() {
  const [chartType, setChartType] = useState<ChartType>("riskMatrix");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <section className="lab-surface charts-surface" aria-label="Live Supply Chain Charts React layer">
      <div className="surface-bar surface-bar--charts">
        <div className="surface-heading">
          <b>Supply Chain Charts</b>
          <small>Real widget source · JSON attributes stand in for Mendix values</small>
        </div>
        <div className="chart-switcher" role="tablist" aria-label="Chart type">
          {CHARTS.map((chart) => (
            <button
              type="button"
              role="tab"
              aria-selected={chartType === chart.id}
              className={chartType === chart.id ? "active" : ""}
              key={chart.id}
              onClick={() => setChartType(chart.id)}
            >
              {chart.label}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-stage">
        <SupplyChainCharts
          chartType={chartType}
          riskMatrixData={EMPTY_DATA}
          eventsByTypeData={EMPTY_DATA}
          remediationData={EMPTY_DATA}
          inventoryData={EMPTY_DATA}
          animate={!reduceMotion}
        />
      </div>
    </section>
  );
}

function DiagramLab() {
  function fitDiagram(frame: HTMLIFrameElement, attempt = 0) {
    const fit = frame.contentDocument?.querySelector<HTMLButtonElement>('button[aria-label^="Fit View:"]');
    if (fit) {
      fit.click();
      return;
    }
    if (attempt < 30) window.setTimeout(() => fitDiagram(frame, attempt + 1), 100);
  }

  return (
    <section className="lab-surface diagram-surface" aria-label="Live Diagram Editor LocalLab">
      <div className="surface-bar">
        <div className="surface-heading">
          <b>Diagram Editor</b>
          <small>Packaged widget’s compiled React LocalLab</small>
        </div>
        <span className="surface-note">Selection write-back uses local sample values</span>
      </div>
      <iframe
        className="diagram-frame"
        src="../widgets/index.html"
        title="Diagram Editor React LocalLab"
        sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
        onLoad={(event) => {
          const frame = event.currentTarget;
          window.setTimeout(() => fitDiagram(frame), 120);
        }}
      />
    </section>
  );
}

function App() {
  const [surface, setSurface] = useState<Surface>("graph");
  const compact = useCompact();

  return (
    <main className="foundry-shell">
      <header className="foundry-header">
        <div className="foundry-title">
          <span className="foundry-mark" aria-hidden="true">MX</span>
          <span><b>Widget Foundry</b><small>React layers from the Mendix builds</small></span>
        </div>
        <nav className="foundry-tabs" aria-label="Widget labs">
          {SURFACES.map((item) => (
            <button
              type="button"
              key={item.id}
              className={surface === item.id ? "active" : ""}
              aria-pressed={surface === item.id}
              onClick={() => setSurface(item.id)}
            >
              <span>{item.label}</span>
              <small>{item.detail}</small>
            </button>
          ))}
        </nav>
      </header>

      <div className="foundry-body">
        {surface === "graph" && <GraphLab compact={compact} />}
        {surface === "cost" && <CostLab />}
        {surface === "graphstudio" && <GraphStudioLab />}
        {surface === "charts" && <ChartsLab />}
        {surface === "diagram" && <DiagramLab />}
      </div>

      <p className="foundry-boundary">
        The React UI is running here. Sample values and local action adapters replace the parts Mendix normally supplies.
      </p>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
