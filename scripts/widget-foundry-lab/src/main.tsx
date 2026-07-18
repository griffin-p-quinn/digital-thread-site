import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import { AgentGraphEditor } from "../../../../supplychainrisk-main/supplychainrisk-main/pluggable-widgets/AgentGraphEditor/src/AgentGraphEditor";
import type { AgentGraph } from "../../../../supplychainrisk-main/supplychainrisk-main/pluggable-widgets/AgentGraphEditor/src/types/agent-graph";
import "./lab.css";

const MODEL = { name: "GPT-4o", uuid: "deployed-model-reference" };

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

function App() {
  const [graph, setGraph] = useState(INITIAL_GRAPH);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [narration, setNarration] = useState("");
  const [bridgeMessage, setBridgeMessage] = useState("Ready");
  const [compact, setCompact] = useState(() => window.matchMedia("(max-width: 720px)").matches);
  const pending = useRef({ title: "", description: "" });
  const selectedUuid = useRef("");

  useEffect(() => {
    const query = window.matchMedia("(max-width: 720px)");
    const update = () => setCompact(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  function replayHandoff() {
    setNarration("");
    window.setTimeout(() => {
      setNarration(`🔍 Risk Analyst reviewed the disruption. 🛒 Procurement Advisor checked alternatives. 📋 Response Planner assembled the response. ${Date.now()}`);
    }, 20);
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
          description: pending.current.description || "Created in the browser-safe widget lab.",
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
    <main className={`lab-shell lab-shell--${theme}`}>
      <header className="lab-bar">
        <div className="lab-title">
          <span className="lab-mark" aria-hidden="true">AG</span>
          <span><b>Agent Graph Editor</b><small>Actual Mendix widget display layer · sample AgentCommons data</small></span>
        </div>
        <output className="lab-bridge" aria-live="polite"><span>Mendix bridge</span>{bridgeMessage}</output>
        <div className="lab-actions">
          <button type="button" onClick={replayHandoff}>Replay handoff</button>
          <button type="button" onClick={() => setTheme((value) => value === "dark" ? "light" : "dark")} aria-label={`Use ${theme === "dark" ? "light" : "dark"} theme`}>
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </header>
      <section className="lab-widget" aria-label="Live Agent Graph Editor widget">
        <AgentGraphEditor
          agentsData={{ value: JSON.stringify(graph) }}
          selectedAgentUuid={{ value: selectedUuid.current, setValue: (value) => { selectedUuid.current = value; } }}
          pendingAgentTitle={{ value: pending.current.title, setValue: (value) => { pending.current.title = value; } }}
          pendingAgentDescription={{ value: pending.current.description, setValue: (value) => { pending.current.description = value; } }}
          narrationSource={{ value: narration }}
          onAgentClick={{ execute: () => setBridgeMessage(`onAgentClick · ${selectedUuid.current}`) }}
          onCreateAgent={{ execute: createAgent }}
          theme={theme}
          showControls
          showPalette={!compact}
          paletteCollapsedByDefault={false}
          showInspector={!compact}
          inspectorCollapsedByDefault={false}
          toolsCollapsedByDefault
          spotlightStepMs={1400}
        />
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
