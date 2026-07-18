import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import { AgentGraphEditor } from "../../../../supplychainrisk-main/supplychainrisk-main/pluggable-widgets/AgentGraphEditor/src/AgentGraphEditor";
import type { AgentGraph } from "../../../../supplychainrisk-main/supplychainrisk-main/pluggable-widgets/AgentGraphEditor/src/types/agent-graph";
import { SupplyChainCharts } from "../../../../supplychainrisk-main/supplychainrisk-main/pluggable-widgets/SupplyChainCharts/src/SupplyChainCharts";
import type { ChartType } from "../../../../supplychainrisk-main/supplychainrisk-main/pluggable-widgets/SupplyChainCharts/src/types/charts";
import "./lab.css";

type Surface = "graph" | "charts" | "diagram";
type Theme = "dark" | "light";

const MODEL = { name: "GPT-4o", uuid: "deployed-model-reference" };
const EMPTY_DATA = { value: "[]" };

const SURFACES: Array<{ id: Surface; label: string; detail: string }> = [
  { id: "graph", label: "Agent graph", detail: "React Flow" },
  { id: "charts", label: "Risk charts", detail: "Nivo" },
  { id: "diagram", label: "Diagram editor", detail: "LocalLab" }
];

const CHARTS: Array<{ id: ChartType; label: string }> = [
  { id: "riskMatrix", label: "Risk matrix" },
  { id: "eventsByType", label: "Events" },
  { id: "remediationFunnel", label: "Remediation" },
  { id: "inventoryHealth", label: "Inventory" }
];

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
