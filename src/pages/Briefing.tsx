import { edgeCensus, totalEdges } from '../data/graphData'

const layers = [
  {
    label: 'Source',
    name: 'Teamcenter MSSQL',
    detail: 'PIMANRELATION, PITEM, PITEMREVISION, PDATASET — raw relational tables with PUIDs as primary keys.',
    color: 'amber',
  },
  {
    label: 'Projection',
    name: 'AntiGravity SQL Views',
    detail: 'Curated views normalize predicates (ITEM_HAS_REVISION, REVISION_HAS_DATASET, etc.), assign stable tc: URIs, flatten payloads for AGS ingestion.',
    color: 'teal',
  },
  {
    label: 'API',
    name: 'REST Endpoints (:3737)',
    detail: 'Auth-gated, paginated, filterable JSON endpoints. Supports predicate, source_type, target_type, tc_uid filters with strict validation.',
    color: 'blue',
  },
  {
    label: 'Ingestion',
    name: 'AGS Data Toolkit',
    detail: 'HttpSource connector pulls from REST API, maps flat JSON to RDF triples using ontology-aligned property mappings.',
    color: 'purple',
  },
  {
    label: 'Query',
    name: 'SPARQL / Graphmart',
    detail: 'Materialized graph enables sub-millisecond traversal queries. Agents generate SPARQL based on user intent classification.',
    color: 'teal',
  },
]

export default function Briefing() {
  return (
    <>
      <section className="page-hero">
        <div className="eyebrow">Platform Architecture</div>
        <h1>
          From <em>Relational Tables</em><br />
          to Knowledge Graph
        </h1>
        <p className="sub">
          The pipeline transforms Teamcenter's SQL-native PLM data into an RDF graph
          that preserves business semantics while enabling millisecond traversal.
        </p>
      </section>

      <div className="sep" />

      {/* ── Stack layers ── */}
      <section className="content-section reveal">
        <div className="section-eyebrow">Execution Stack</div>
        <h2>Five Layers of Data Flow</h2>
        <p className="section-desc">
          Each layer has a single responsibility. Data flows downward through projection,
          normalization, and materialization.
        </p>

        <div style={{ display: 'grid', gap: 2 }}>
          {layers.map((layer, i) => (
            <div key={i} className={`fabric-card accent-${layer.color}`} style={{ borderRadius: i === 0 ? '16px 16px 4px 4px' : i === layers.length - 1 ? '4px 4px 16px 16px' : 4 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                <span className={`tag-pill ${layer.color}`}>{layer.label}</span>
                <h3 style={{ fontSize: 16 }}>{layer.name}</h3>
              </div>
              <p>{layer.detail}</p>
              {i < layers.length - 1 && (
                <div style={{ textAlign: 'center', color: 'var(--text3)', marginTop: 8, fontSize: 14 }}>↓</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="sep" />

      {/* ── SOA vs REST vs SPARQL ── */}
      <section className="content-section reveal">
        <div className="section-eyebrow">Interface Comparison</div>
        <h2>Three Ways to Access the Same Data</h2>

        <div className="card-grid cols-3">
          <div className="fabric-card accent-amber">
            <div className="card-icon amber">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 6h16M4 12h16M4 18h10" />
              </svg>
            </div>
            <h3>Teamcenter SOA</h3>
            <p>
              Native interface. Multi-hop session-based calls. Required for: file downloads,
              BOM expansion, real-time checkout state, workflow signoff operations.
            </p>
            <div className="card-mono">Latency: 200–2000ms per hop</div>
          </div>

          <div className="fabric-card accent-blue">
            <div className="card-icon blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 12H3M21 6H3M21 18H3" />
              </svg>
            </div>
            <h3>REST Projection</h3>
            <p>
              Flattened, auth-gated JSON endpoints. Pre-computed from SQL views.
              Supports filtering, pagination, and deterministic ordering.
            </p>
            <div className="card-mono">Latency: 20–100ms</div>
          </div>

          <div className="fabric-card accent-teal">
            <div className="card-icon teal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M8 12l3 3 5-5" />
              </svg>
            </div>
            <h3>SPARQL Graph</h3>
            <p>
              Materialized RDF graph with full traversal capability. Agent generates
              queries from intent classification. Supports complex joins across predicates.
            </p>
            <div className="card-mono">Latency: 1–10ms</div>
          </div>
        </div>
      </section>

      <div className="sep" />

      {/* ── What's running? ── */}
      <section className="content-section reveal">
        <div className="section-eyebrow">Runtime Architecture</div>
        <h2>What's Running and When</h2>
        <p className="section-desc">
          Not all APIs run all the time. The architecture separates always-on services from
          on-demand capabilities.
        </p>

        <div className="card-grid cols-2">
          <div className="fabric-card">
            <h3 style={{ color: 'var(--teal)' }}>Always On</h3>
            <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
              <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(72,206,152,0.06)', border: '1px solid rgba(72,206,152,0.15)' }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>REST API Server (:3737)</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>Serves graph endpoints, health checks, readiness probes. Runs as Node.js process on the TC server.</div>
              </div>
              <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(72,206,152,0.06)', border: '1px solid rgba(72,206,152,0.15)' }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Gateway Proxy (:3000)</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>Reverse proxy with user-agent routing. Forwards to REST API. Handles TLS and external access.</div>
              </div>
              <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(72,206,152,0.06)', border: '1px solid rgba(72,206,152,0.15)' }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>AGS Graphmart</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>Cambridge Semantics Anzo graph platform. Runs SPARQL endpoint with materialized triples from HttpSource ingestion.</div>
              </div>
            </div>
          </div>

          <div className="fabric-card">
            <h3 style={{ color: 'var(--amber)' }}>On-Demand</h3>
            <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
              <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(237,176,80,0.06)', border: '1px solid rgba(237,176,80,0.15)' }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Teamcenter SOA / MCP</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>Only invoked when agent needs data outside graph scope: file downloads, live checkout, BOM expansion, write operations.</div>
              </div>
              <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(237,176,80,0.06)', border: '1px solid rgba(237,176,80,0.15)' }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Data Toolkit Refresh</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>Periodic or triggered re-ingestion from REST into AGS. Not continuous — runs on schedule or manual trigger.</div>
              </div>
              <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(237,176,80,0.06)', border: '1px solid rgba(237,176,80,0.15)' }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Cloudflare Tunnel</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>External access tunnel. Can be toggled for demo/dev access. Not required for local-network operation.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="sep" />

      {/* ── Edge composition chart ── */}
      <section className="content-section reveal">
        <div className="section-eyebrow">Graph Composition</div>
        <h2>Edge Distribution</h2>

        <div style={{ display: 'grid', gap: 8 }}>
          {edgeCensus.map((e) => {
            const pct = (e.count / totalEdges) * 100
            return (
              <div key={e.predicate} style={{ display: 'grid', gridTemplateColumns: '280px 1fr 60px', gap: 12, alignItems: 'center' }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text2)' }}>
                  {e.predicate}
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'var(--bg3)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    borderRadius: 4,
                    background: `var(--${e.color})`,
                    transition: 'width 1s var(--ease-out)',
                  }} />
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text3)', textAlign: 'right' }}>
                  {pct.toFixed(1)}%
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
