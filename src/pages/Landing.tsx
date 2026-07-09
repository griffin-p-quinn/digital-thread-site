import { Link } from 'react-router-dom'
import { edgeCensus, totalEdges, totalItems, totalRevisions, totalDatasets } from '../data/graphData'

export default function Landing() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="page-hero">
        <div className="eyebrow">Teamcenter × AntiGravity Graph Studio</div>
        <h1>
          Turn PLM Data into<br />
          <em>Explainable Intelligence</em>
        </h1>
        <p className="sub">
          We proved that raw Teamcenter semantics — items, revisions, datasets, changes, workflows —
          survive end-to-end into a graph that AI agents can reason over. Here's the evidence.
        </p>

        <div className="signals-row">
          <div className="signal-card">
            <div className="signal-label">Total Edges</div>
            <div className="signal-value">{totalEdges.toLocaleString()}</div>
            <div className="signal-detail">Verified relationships</div>
          </div>
          <div className="signal-card">
            <div className="signal-label">Items</div>
            <div className="signal-value">{totalItems.toLocaleString()}</div>
            <div className="signal-detail">Engineering items indexed</div>
          </div>
          <div className="signal-card">
            <div className="signal-label">Revisions</div>
            <div className="signal-value">{totalRevisions.toLocaleString()}</div>
            <div className="signal-detail">Tracked revision nodes</div>
          </div>
          <div className="signal-card">
            <div className="signal-label">Datasets</div>
            <div className="signal-value">{totalDatasets.toLocaleString()}</div>
            <div className="signal-detail">Attached file records</div>
          </div>
        </div>
      </section>

      <div className="sep" />

      {/* ── What we proved ── */}
      <section className="content-section reveal">
        <div className="section-eyebrow">Validation Story</div>
        <h2>Five Phases of Cross-Stack Proof</h2>
        <p className="section-desc">
          Every claim in this system is backed by live evidence — from Teamcenter SOA ground truth
          through SQL projection to AGS graph materialization.
        </p>

        <div className="timeline">
          <div className="timeline-item done">
            <div className="t-label">Phase 1</div>
            <h4>SOA Ground Truth Baseline</h4>
            <p>
              Established canonical business facts from raw Teamcenter payloads.
              Validated change objects, relation families, and key property availability
              from 5 production artifact bundles.
            </p>
          </div>
          <div className="timeline-item done">
            <div className="t-label">Phase 1b</div>
            <h4>Live Credentialed Extraction</h4>
            <p>
              Executed live MCP/SOA calls against Teamcenter. Confirmed CMHasProblemItem
              relations with 8 deterministic change→item links and 5 unique target revisions.
            </p>
          </div>
          <div className="timeline-item done">
            <div className="t-label">Phase 2</div>
            <h4>REST/SQL Projection Baseline</h4>
            <p>
              Validated the AntiGravity REST contract as black box — auth, pagination,
              schema, and predicate surfaces confirmed stable and deterministic.
            </p>
          </div>
          <div className="timeline-item done">
            <div className="t-label">Phase 3</div>
            <h4>AGS Content Scorecard</h4>
            <p>
              Compared graph content against SOA truth. Nodes present with correct UIDs.
              Identified semantic gaps in edge materialization. Strict filter validation passed.
            </p>
          </div>
          <div className="timeline-item done">
            <div className="t-label">Phase 4–5</div>
            <h4>Cross-Stack Diff & Remediation</h4>
            <p>
              Quantified losses by class/predicate/property. Produced deployable fix pack
              with SQL view edits, endpoint corrections, and acceptance test suite.
            </p>
          </div>
        </div>
      </section>

      <div className="sep" />

      {/* ── Edge Census ── */}
      <section className="content-section reveal">
        <div className="section-eyebrow">Live Edge Census</div>
        <h2>Verified Relationship Composition</h2>
        <p className="section-desc">
          {edgeCensus.length} predicate families extracted from Teamcenter, projected through
          SQL views, and validated end-to-end.
        </p>

        <div className="card-grid cols-2" style={{ marginBottom: 32 }}>
          {edgeCensus.map((edge) => (
            <div key={edge.predicate} className={`fabric-card accent-${edge.color === 'coral' ? 'amber' : edge.color}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <h3 style={{ fontSize: 14 }}>{edge.predicate}</h3>
                <span className={`tag-pill ${edge.color}`}>{edge.count.toLocaleString()}</span>
              </div>
              <p>{edge.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="sep" />

      {/* ── Explore cards ── */}
      <section className="content-section reveal">
        <div className="section-eyebrow">Explore</div>
        <h2>Deep Dive into the Graph</h2>

        <div className="card-grid cols-3">
          <Link to="/briefing" className="fabric-card accent-teal" style={{ cursor: 'pointer' }}>
            <div className="card-icon teal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18M3 9h18" />
              </svg>
            </div>
            <h3>Architecture</h3>
            <p>How Teamcenter data flows from SOA through SQL projection to AGS graph endpoints.</p>
            <div className="card-mono">SOA → REST → SPARQL →</div>
          </Link>

          <Link to="/decision-engine" className="fabric-card accent-purple" style={{ cursor: 'pointer' }}>
            <div className="card-icon purple">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <h3>Decision Engine</h3>
            <p>When an AI agent chooses graph query vs. MCP/SOA call — and why it matters.</p>
            <div className="card-mono">confidence → route →</div>
          </Link>

          <Link to="/graph" className="fabric-card accent-amber" style={{ cursor: 'pointer' }}>
            <div className="card-icon amber">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="5" cy="12" r="2" />
                <circle cx="19" cy="6" r="2" />
                <circle cx="19" cy="18" r="2" />
                <line x1="7" y1="12" x2="17" y2="6" />
                <line x1="7" y1="12" x2="17" y2="18" />
              </svg>
            </div>
            <h3>Live Graph</h3>
            <p>Interactive visualization of real Teamcenter data with clickable nodes and edges.</p>
            <div className="card-mono">click → inspect → query →</div>
          </Link>
        </div>
      </section>
    </>
  )
}
