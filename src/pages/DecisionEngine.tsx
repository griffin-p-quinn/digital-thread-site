import { decisionScenarios } from '../data/graphData'

const routeColors: Record<string, string> = {
  graph: 'teal',
  hybrid: 'amber',
  mcp: 'purple',
}
const routeLabels: Record<string, string> = {
  graph: 'Graph Query',
  hybrid: 'Hybrid (Graph → MCP)',
  mcp: 'MCP / SOA Direct',
}

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 0.85 ? 'var(--teal)' : value >= 0.50 ? 'var(--amber)' : 'var(--purple)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg3)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${value * 100}%`,
          borderRadius: 3, background: color,
          transition: 'width 0.6s var(--ease-out)',
        }} />
      </div>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
        color: 'var(--text3)', minWidth: 36,
      }}>
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  )
}

export default function DecisionEngine() {
  return (
    <>
      <section className="page-hero">
        <div className="eyebrow">Agent Decision Logic</div>
        <h1>
          When to Query <em>Graph</em><br />
          vs. Call <em>Teamcenter</em>
        </h1>
        <p className="sub">
          An AI agent doesn't always call the same interface. It routes each request based on
          what data is in the graph, what requires live state, and what needs binary access.
        </p>
      </section>

      <div className="sep" />

      {/* ── Decision Policy ── */}
      <section className="content-section reveal">
        <div className="section-eyebrow">Routing Policy</div>
        <h2>Three-Tier Confidence Routing</h2>
        <p className="section-desc">
          The agent classifies each user request and assigns a graph-confidence score.
          This score determines the execution path.
        </p>

        <div className="card-grid cols-3" style={{ marginBottom: 40 }}>
          <div className="fabric-card accent-teal">
            <div className="card-icon teal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h3>Graph First</h3>
            <p>
              Confidence ≥ 0.85 — data is fully materialized in graph.
              Sub-millisecond SPARQL. No external call needed.
            </p>
            <div className="card-mono">Structure · Datasets · Relations</div>
          </div>

          <div className="fabric-card accent-amber">
            <div className="card-icon amber">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <h3>Hybrid</h3>
            <p>
              Confidence 0.50–0.84 — graph has partial data.
              Agent queries graph first, then confirms or enriches with MCP/SOA.
            </p>
            <div className="card-mono">Checkout · Approval · Status</div>
          </div>

          <div className="fabric-card accent-purple">
            <div className="card-icon purple">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h3>MCP / SOA Direct</h3>
            <p>
              Confidence &lt; 0.50 — data is outside graph scope.
              Agent routes directly to Teamcenter native interface.
            </p>
            <div className="card-mono">Files · BOM · Write Ops</div>
          </div>
        </div>
      </section>

      <div className="sep" />

      {/* ── Scenario walkthrough ── */}
      <section className="content-section reveal">
        <div className="section-eyebrow">Scenario Walkthrough</div>
        <h2>What the User Asks → Where the Agent Goes</h2>
        <p className="section-desc">
          Each scenario shows a real user question, the agent's routing decision,
          and the query or action that follows.
        </p>

        <div style={{ display: 'grid', gap: 20 }}>
          {decisionScenarios.map((s) => (
            <div key={s.id} className={`fabric-card accent-${routeColors[s.route]}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                <span className={`tag-pill ${routeColors[s.route]}`}>{routeLabels[s.route]}</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--text3)', letterSpacing: '0.08em' }}>
                  CONFIDENCE
                </span>
              </div>

              <div className="scenario-user" style={{
                fontSize: 15, fontStyle: 'italic', color: 'var(--amber)',
                padding: '12px 16px', borderRadius: 10,
                background: 'rgba(237,176,80,0.06)', border: '1px solid rgba(237,176,80,0.12)',
                marginBottom: 12,
              }}>
                {s.userAsk}
              </div>

              <ConfidenceBar value={s.confidence} />

              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.55, marginTop: 12 }}>
                {s.reason}
              </p>

              <div className="code-block" style={{ marginTop: 12, fontSize: 11, lineHeight: 1.6 }}>
                {s.sparql}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
