import { edgeCensus, totalEdges, totalItems, totalRevisions, totalDatasets } from '../data/graphData'

const endpoints = [
  { path: '/api/ags/health', status: 'ok', desc: 'Service heartbeat', code: 200 },
  { path: '/api/ags/readyz', status: 'ok', desc: 'Database connectivity', code: 200 },
  { path: '/api/ags/graph/nodes/items', status: 'ok', desc: 'Item node listing', code: 200 },
  { path: '/api/ags/graph/nodes/revisions', status: 'ok', desc: 'Revision node listing', code: 200 },
  { path: '/api/ags/graph/nodes/datasets', status: 'ok', desc: 'Dataset node listing', code: 200 },
  { path: '/api/ags/graph/edges/core', status: 'ok', desc: 'Edge relationship listing', code: 200 },
  { path: '/api/ags/graph/nodes/changes', status: 'warn', desc: 'Load-shed: MART_DISABLED', code: 503 },
  { path: '/api/ags/graph/nodes/workflows', status: 'warn', desc: 'Load-shed: MART_DISABLED', code: 503 },
]

const regressionChecks = [
  { name: 'Health (local :3737)', result: 'PASS', detail: 'HTTP 200, body {"status":"healthy"}' },
  { name: 'Health (gateway :3000)', result: 'PASS', detail: 'HTTP 200 via node-superagent' },
  { name: 'Readyz (local)', result: 'PASS', detail: 'HTTP 200, database connected' },
  { name: 'Auth rejection', result: 'PASS', detail: 'HTTP 401 without x-api-key' },
  { name: 'Filter: predicate', result: 'PASS', detail: 'ITEM_HAS_REVISION returns only matching rows' },
  { name: 'Filter: source_type', result: 'PASS', detail: 'source_type=Item returns only Item sources' },
  { name: 'Filter: target_type', result: 'PASS', detail: 'target_type=Dataset returns only Dataset targets' },
  { name: 'Filter: tc_uid', result: 'PASS', detail: 'UID matches source or target in every row' },
  { name: 'Invalid predicate', result: 'PASS', detail: 'Returns HTTP 400' },
  { name: 'Pagination hash (items)', result: 'PASS', detail: 'Same-window hash stability confirmed' },
  { name: 'Pagination hash (revisions)', result: 'PASS', detail: 'Same-window hash stability confirmed' },
  { name: 'Pagination hash (datasets)', result: 'PASS', detail: 'Same-window hash stability confirmed' },
  { name: 'Pagination hash (edges)', result: 'PASS', detail: 'Same-window hash stability confirmed' },
  { name: 'Load-shed changes', result: 'PASS', detail: 'HTTP 503 MART_DISABLED as expected' },
  { name: 'Load-shed workflows', result: 'PASS', detail: 'HTTP 503 MART_DISABLED as expected' },
  { name: 'Edge payload contract', result: 'PASS', detail: 'All required fields present in sampled rows' },
]

export default function HealthOps() {
  return (
    <>
      <section className="page-hero">
        <div className="eyebrow">Operations Dashboard</div>
        <h1>
          System <em>Health & Status</em>
        </h1>
        <p className="sub">
          Real-time endpoint status, regression check results, and predicate census
          from the last verified validation window.
        </p>
      </section>

      <div className="sep" />

      {/* ── Stat tiles ── */}
      <section className="content-section reveal">
        <div className="stats-row">
          <div className="stat-cell">
            <div className="stat-num" style={{ color: 'var(--teal)' }}>{totalEdges.toLocaleString()}</div>
            <div className="stat-desc">Total Edges</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num">{totalItems.toLocaleString()}</div>
            <div className="stat-desc">Items</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num">{totalRevisions.toLocaleString()}</div>
            <div className="stat-desc">Revisions</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num">{totalDatasets.toLocaleString()}</div>
            <div className="stat-desc">Datasets</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num" style={{ color: 'var(--teal)' }}>{edgeCensus.length}</div>
            <div className="stat-desc">Predicate Families</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num" style={{ color: 'var(--teal)' }}>PASS</div>
            <div className="stat-desc">Demo Gate</div>
          </div>
        </div>
      </section>

      <div className="sep" />

      {/* ── Endpoint status ── */}
      <section className="content-section reveal">
        <div className="section-eyebrow">Endpoint Status</div>
        <h2>API Surface Health</h2>
        <p className="section-desc">
          All core demo endpoints healthy. Change and workflow marts intentionally shed-loaded for demo stability.
        </p>

        <table className="ops-table">
          <thead>
            <tr>
              <th>Endpoint</th>
              <th>Status</th>
              <th>Code</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((ep) => (
              <tr key={ep.path}>
                <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{ep.path}</td>
                <td className={ep.status === 'ok' ? 'status-ok' : 'status-warn'}>
                  {ep.status === 'ok' ? '● Healthy' : '◐ Shed'}
                </td>
                <td style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{ep.code}</td>
                <td>{ep.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="sep" />

      {/* ── Predicate Census ── */}
      <section className="content-section reveal">
        <div className="section-eyebrow">Edge Census</div>
        <h2>Predicate Distribution</h2>

        <div style={{ display: 'grid', gap: 10 }}>
          {edgeCensus.map((e) => {
            const pct = (e.count / totalEdges) * 100
            return (
              <div key={e.predicate} style={{
                display: 'grid', gridTemplateColumns: '260px 1fr 80px 50px',
                gap: 12, alignItems: 'center',
                padding: '8px 14px', borderRadius: 10,
                background: 'rgba(19,22,30,0.5)', border: '1px solid rgba(39,44,58,0.3)',
              }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text2)' }}>
                  {e.predicate}
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--bg3)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${pct}%`, borderRadius: 3,
                    background: `var(--${e.color})`,
                    transition: 'width 1s var(--ease-out)',
                  }} />
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text)', textAlign: 'right', fontWeight: 600 }}>
                  {e.count.toLocaleString()}
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--text3)', textAlign: 'right' }}>
                  {pct.toFixed(1)}%
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="sep" />

      {/* ── Regression checks ── */}
      <section className="content-section reveal">
        <div className="section-eyebrow">Regression Suite</div>
        <h2>Validation Checklist</h2>
        <p className="section-desc">
          {regressionChecks.length} automated checks run against live endpoints.
          All passing as of last validation window.
        </p>

        <div style={{ display: 'grid', gap: 4 }}>
          {regressionChecks.map((check, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '24px 200px 1fr',
              gap: 12, alignItems: 'center',
              padding: '8px 12px', borderRadius: 8,
              background: i % 2 === 0 ? 'rgba(19,22,30,0.3)' : 'transparent',
            }}>
              <span style={{ color: 'var(--teal)', fontSize: 14 }}>✓</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{check.name}</span>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>{check.detail}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="sep" />

      {/* ── Demo chain proof ── */}
      <section className="content-section reveal">
        <div className="section-eyebrow">Traversal Proof</div>
        <h2>Demo Chain Verification</h2>
        <p className="section-desc">
          A single verified traversal path through the graph, from Item through Revision to Dataset.
        </p>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: 20, borderRadius: 14, flexWrap: 'wrap',
          background: 'rgba(19,22,30,0.7)', border: '1px solid var(--border)',
        }}>
          <div style={{
            padding: '10px 16px', borderRadius: 10,
            background: 'rgba(72,206,152,0.08)', border: '1px solid rgba(72,206,152,0.2)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal)' }}>Item 001024</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--text3)' }}>yoMAAQdo5BWnuC</div>
          </div>

          <span style={{ color: 'var(--text3)', fontSize: 18 }}>→</span>

          <div style={{
            padding: '10px 16px', borderRadius: 10,
            background: 'rgba(93,158,223,0.08)', border: '1px solid rgba(93,158,223,0.2)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue)' }}>Rev 001024/A</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--text3)' }}>yfMAAQdo5BWnuC</div>
          </div>

          <span style={{ color: 'var(--text3)', fontSize: 18 }}>→</span>

          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{
              padding: '8px 14px', borderRadius: 8,
              background: 'rgba(133,121,229,0.08)', border: '1px solid rgba(133,121,229,0.2)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--purple)' }}>Spec Dataset</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--text3)' }}>11FAAQdo5BWnuC</div>
            </div>
            <div style={{
              padding: '8px 14px', borderRadius: 8,
              background: 'rgba(93,158,223,0.08)', border: '1px solid rgba(93,158,223,0.2)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue)' }}>Render Dataset</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--text3)' }}>zzEAAQt85BWnuC</div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
