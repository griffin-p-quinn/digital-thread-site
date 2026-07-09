import { useState, useCallback } from 'react'
import { graphNodes, graphEdges, type GraphNode, type GraphEdge } from '../data/graphData'

type Selection = { type: 'node'; data: GraphNode } | { type: 'edge'; data: GraphEdge } | null

const typeColors: Record<string, string> = {
  Item: '#48ce98',
  ItemRevision: '#5d9edf',
  Dataset: '#8579e5',
  ChangeNotice: '#edb050',
  Workflow: '#db7264',
}

const typeIcons: Record<string, string> = {
  Item: 'M12 2L4 7v10l8 5 8-5V7l-8-5z',
  ItemRevision: 'M4 7l8-5 8 5M4 7v10l8 5M4 7l8 5M20 7v10l-8 5M20 7l-8 5M12 12v10',
  Dataset: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6',
  ChangeNotice: 'M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  Workflow: 'M22 12h-4l-3 9L9 3l-3 9H2',
}

export default function InteractiveGraph() {
  const [selection, setSelection] = useState<Selection>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null)

  const clearSelection = useCallback(() => setSelection(null), [])

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelection((prev) =>
      prev?.type === 'node' && prev.data.id === node.id ? null : { type: 'node', data: node }
    )
  }, [])

  const handleEdgeClick = useCallback((edge: GraphEdge) => {
    setSelection((prev) =>
      prev?.type === 'edge' && prev.data.source === edge.source && prev.data.target === edge.target
        ? null
        : { type: 'edge', data: edge }
    )
  }, [])

  const isNodeHighlighted = (id: string) => {
    if (!selection) return false
    if (selection.type === 'node') return selection.data.id === id
    if (selection.type === 'edge') return selection.data.source === id || selection.data.target === id
    return false
  }

  const isEdgeHighlighted = (edge: GraphEdge) => {
    if (!selection) return false
    if (selection.type === 'edge') return selection.data.source === edge.source && selection.data.target === edge.target
    if (selection.type === 'node') return edge.source === selection.data.id || edge.target === selection.data.id
    return false
  }

  const nodeMap = Object.fromEntries(graphNodes.map((n) => [n.id, n]))

  return (
    <>
      <section className="page-hero">
        <div className="eyebrow">Interactive Visualization</div>
        <h1>
          Explore the <em>Live Graph</em>
        </h1>
        <p className="sub">
          Click any node or edge to inspect its properties, see the SPARQL query an agent would generate,
          and understand why this data matters.
        </p>
      </section>

      <div className="sep" />

      <section className="content-section">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>

          {/* ── SVG Graph ── */}
          <div className="graph-canvas" style={{ position: 'relative' }}>
            <svg viewBox="0 0 800 600" style={{ display: 'block' }}>
              <defs>
                {Object.entries(typeColors).map(([type, color]) => (
                  <filter key={type} id={`glow-${type}`}>
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feFlood floodColor={color} floodOpacity="0.3" result="color" />
                    <feComposite in="color" in2="blur" operator="in" result="glowColor" />
                    <feMerge>
                      <feMergeNode in="glowColor" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                ))}
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6" fill="var(--text3)" />
                </marker>
              </defs>

              {/* Grid background */}
              <g opacity="0.08">
                {Array.from({ length: 20 }).map((_, i) => (
                  <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="600" stroke="var(--text3)" strokeWidth="0.5" />
                ))}
                {Array.from({ length: 15 }).map((_, i) => (
                  <line key={`h${i}`} x1="0" y1={i * 40} x2="800" y2={i * 40} stroke="var(--text3)" strokeWidth="0.5" />
                ))}
              </g>

              {/* Edges */}
              {graphEdges.map((edge, i) => {
                const src = nodeMap[edge.source]
                const tgt = nodeMap[edge.target]
                if (!src || !tgt) return null
                const highlighted = isEdgeHighlighted(edge)
                const hovered = hoveredEdge === `${edge.source}-${edge.target}`
                const dimmed = selection && !highlighted

                return (
                  <g
                    key={i}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleEdgeClick(edge)}
                    onMouseEnter={() => setHoveredEdge(`${edge.source}-${edge.target}`)}
                    onMouseLeave={() => setHoveredEdge(null)}
                  >
                    {/* Wider invisible hit area */}
                    <line
                      x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                      stroke="transparent" strokeWidth="12"
                    />
                    <line
                      x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                      stroke={edge.color}
                      strokeWidth={highlighted || hovered ? 2.5 : 1.2}
                      strokeOpacity={dimmed ? 0.15 : highlighted || hovered ? 1 : 0.5}
                      markerEnd="url(#arrowhead)"
                      style={{ transition: 'stroke-width 0.2s, stroke-opacity 0.2s' }}
                    />
                    {/* Edge label */}
                    <text
                      x={(src.x + tgt.x) / 2}
                      y={(src.y + tgt.y) / 2 - 8}
                      fill={edge.color}
                      fontSize="8"
                      fontFamily="'IBM Plex Mono', monospace"
                      textAnchor="middle"
                      opacity={highlighted || hovered ? 0.9 : dimmed ? 0.1 : 0.4}
                      style={{ transition: 'opacity 0.2s', pointerEvents: 'none' }}
                    >
                      {edge.predicate}
                    </text>
                  </g>
                )
              })}

              {/* Nodes */}
              {graphNodes.map((node) => {
                const color = typeColors[node.type] || '#e6eaf3'
                const highlighted = isNodeHighlighted(node.id)
                const hovered = hoveredNode === node.id
                const dimmed = selection && !highlighted
                const r = 24

                return (
                  <g
                    key={node.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleNodeClick(node)}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    filter={highlighted ? `url(#glow-${node.type})` : undefined}
                  >
                    <circle
                      cx={node.x} cy={node.y} r={r}
                      fill="var(--bg2)"
                      stroke={color}
                      strokeWidth={highlighted || hovered ? 2 : 1.2}
                      opacity={dimmed ? 0.25 : 1}
                      style={{ transition: 'stroke-width 0.2s, opacity 0.2s' }}
                    />
                    <path
                      d={typeIcons[node.type] || 'M12 2a10 10 0 100 20 10 10 0 000-20z'}
                      fill={color}
                      opacity={dimmed ? 0.25 : 0.8}
                      transform={`translate(${node.x - 12}, ${node.y - 12})`}
                      style={{ pointerEvents: 'none', transition: 'opacity 0.2s' }}
                    />
                    <text
                      x={node.x} y={node.y + r + 14}
                      fill={dimmed ? 'var(--text3)' : 'var(--text)'}
                      fontSize="11"
                      fontWeight="500"
                      textAnchor="middle"
                      style={{ pointerEvents: 'none', transition: 'fill 0.2s' }}
                    >
                      {node.label}
                    </text>
                    <text
                      x={node.x} y={node.y + r + 26}
                      fill="var(--text3)"
                      fontSize="9"
                      fontFamily="'IBM Plex Mono', monospace"
                      textAnchor="middle"
                      opacity={dimmed ? 0.2 : 0.6}
                      style={{ pointerEvents: 'none', transition: 'opacity 0.2s' }}
                    >
                      {node.type}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* ── Inspector ── */}
          <div className="graph-inspector" style={{ position: 'sticky', top: 76 }}>
            {!selection ? (
              <div className="inspector-empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="1" style={{ marginBottom: 12 }}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                <div>Click a node or edge<br />to inspect details</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h4 style={{ margin: 0 }}>
                    {selection.type === 'node' ? (
                      <>
                        <span style={{ color: typeColors[selection.data.type] }}>●</span>
                        {' '}{selection.data.label}
                      </>
                    ) : (
                      <>
                        <span style={{ color: selection.data.color }}>━</span>
                        {' '}{selection.data.predicate}
                      </>
                    )}
                  </h4>
                  <button
                    onClick={clearSelection}
                    style={{
                      background: 'var(--bg3)', border: '1px solid var(--border)',
                      borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
                      fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
                      color: 'var(--text3)', letterSpacing: '0.06em',
                    }}
                  >
                    CLEAR
                  </button>
                </div>

                {selection.type === 'node' && (
                  <>
                    <div className="inspector-row">
                      <span className="inspector-key">Type</span>
                      <span className="inspector-val">
                        <span className={`tag-pill ${selection.data.type === 'Item' ? 'teal' : selection.data.type === 'ItemRevision' ? 'blue' : selection.data.type === 'Dataset' ? 'purple' : selection.data.type === 'ChangeNotice' ? 'amber' : 'coral'}`}>
                          {selection.data.type}
                        </span>
                      </span>
                    </div>
                    <div className="inspector-row">
                      <span className="inspector-key">UID</span>
                      <span className="inspector-val mono" style={{ fontSize: 11, color: 'var(--text2)' }}>{selection.data.uid}</span>
                    </div>
                    {Object.entries(selection.data.props).map(([k, v]) => (
                      <div key={k} className="inspector-row">
                        <span className="inspector-key">{k}</span>
                        <span className="inspector-val">{v || '—'}</span>
                      </div>
                    ))}
                  </>
                )}

                {selection.type === 'edge' && (
                  <>
                    <div className="inspector-row">
                      <span className="inspector-key">From</span>
                      <span className="inspector-val">{nodeMap[selection.data.source]?.label}</span>
                    </div>
                    <div className="inspector-row">
                      <span className="inspector-key">To</span>
                      <span className="inspector-val">{nodeMap[selection.data.target]?.label}</span>
                    </div>
                    <div className="inspector-row">
                      <span className="inspector-key">Predicate</span>
                      <span className="inspector-val" style={{ color: selection.data.color }}>{selection.data.predicate}</span>
                    </div>
                  </>
                )}

                {/* Agent story */}
                <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 10, background: 'rgba(72,206,152,0.06)', border: '1px solid rgba(72,206,152,0.12)' }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: '0.1em', color: 'var(--teal)', marginBottom: 6, textTransform: 'uppercase' }}>
                    Why an agent queries this
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.55 }}>
                    {selection.type === 'node' ? selection.data.agentStory : selection.data.agentStory}
                  </div>
                </div>

                {/* SPARQL */}
                <div className="inspector-sparql">
                  <h5>SPARQL Query</h5>
                  <div className="code-block" style={{ fontSize: 10, lineHeight: 1.55 }}>
                    {selection.type === 'node' ? selection.data.sparql : selection.data.sparql}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex', gap: 20, justifyContent: 'center',
          marginTop: 32, flexWrap: 'wrap',
        }}>
          {Object.entries(typeColors).map(([type, color]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--text2)' }}>{type}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
