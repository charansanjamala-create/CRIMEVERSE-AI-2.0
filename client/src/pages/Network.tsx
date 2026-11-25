import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { networkAPI } from '../api'
import { useState, useMemo } from 'react'
import ReactFlow, { MiniMap, Controls, Background, Node, Edge } from 'reactflow'
import 'reactflow/dist/style.css'
import { Network, AlertTriangle, Users, Link2, Filter, Eye, Layers, Compass, Car, CreditCard, Shield } from 'lucide-react'
import { useActiveCase } from '../context/CaseContext'
import AITransparencyBadge from '../components/AITransparencyBadge'

const ENTITY_COLORS: Record<string, string> = {
  PERSON: '#3b6df5',
  ORGANIZATION: '#f59e0b',
  WALLET: '#10b981',
  EMAIL: '#6366f1',
  PHONE: '#8b5cf6',
  IP: '#06b6d4',
  DOMAIN: '#ef4444',
  DOCUMENT: '#f97316',
  DEVICE: '#64748b',
  LOCATION: '#14b8a6',
  VEHICLE: '#ec4899',
  TRANSACTION: '#22c55e',
  EVIDENCE: '#a855f7',
}

const RISK_COLORS: Record<string, string> = {
  CRITICAL: '#f43f5e',
  HIGH: '#f97316',
  MEDIUM: '#f59e0b',
  LOW: '#10b981',
  UNKNOWN: '#64748b',
}

export default function NetworkPage() {
  const { caseId } = useParams()
  const { activeCase, cases, setActiveCaseId } = useActiveCase()
  const [filterType, setFilterType] = useState('ALL')
  const [selectedNodeData, setSelectedNodeData] = useState<any | null>(null)

  const effectiveCaseId = caseId || activeCase?._id || (cases.length > 0 ? cases[0]._id : '')

  const { data, isLoading } = useQuery({
    queryKey: ['network', effectiveCaseId],
    queryFn: () => networkAPI.getGraph(effectiveCaseId),
    enabled: !!effectiveCaseId,
  })

  const networkData = data?.data?.data

  const rawNodes = networkData?.nodes || []
  const rawEdges = networkData?.edges || []

  // Filter nodes if type selected
  const filteredRawNodes = useMemo(() => {
    if (filterType === 'ALL') return rawNodes
    return rawNodes.filter((n: any) => n.type === filterType)
  }, [rawNodes, filterType])

  const visibleNodeIds = useMemo(() => new Set(filteredRawNodes.map((n: any) => n.id)), [filteredRawNodes])

  const nodes: Node[] = useMemo(() => {
    return filteredRawNodes.map((e: any, i: number) => ({
      id: e.id,
      data: {
        label: `${e.label}\n[${e.type}]`,
        raw: e,
      },
      position: { x: 150 + 220 * (i % 4), y: 80 + 170 * Math.floor(i / 4) },
      style: {
        background: '#1a2438',
        border: `2px solid ${RISK_COLORS[e.riskLevel] || '#334155'}`,
        borderRadius: '12px',
        color: '#f1f5f9',
        fontSize: '11px',
        fontFamily: 'Inter, sans-serif',
        padding: '8px 12px',
        minWidth: '130px',
        textAlign: 'center' as const,
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      },
    }))
  }, [filteredRawNodes])

  const edges: Edge[] = useMemo(() => {
    return rawEdges
      .filter((r: any) => visibleNodeIds.has(r.source) && visibleNodeIds.has(r.target))
      .map((r: any) => ({
        id: r.id,
        source: r.source,
        target: r.target,
        label: r.label,
        animated: r.strength > 70,
        style: {
          stroke: r.isConfirmed ? '#3b6df5' : '#64748b',
          strokeWidth: Math.max(1.5, r.strength / 25),
        },
        labelStyle: { fill: '#94a3b8', fontSize: 10 },
        labelBgStyle: { fill: '#1a2438', fillOpacity: 0.8 },
      }))
  }, [rawEdges, visibleNodeIds])

  const handleNodeClick = (_: any, node: Node) => {
    setSelectedNodeData(node.data?.raw || null)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
              <Network className="w-4 h-4 text-white" />
            </div>
            <h1 className="page-title">Criminal Network Analysis & Graph Intelligence</h1>
          </div>
          <p className="page-subtitle">Multimodal correlation across persons, shell organizations, vehicles, locations, and crypto mule accounts</p>
        </div>

        {/* Case selector */}
        {cases.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Target Case:</span>
            <select
              value={effectiveCaseId}
              onChange={(e) => setActiveCaseId(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
            >
              {cases.map((c: any) => (
                <option key={c._id} value={c._id}>
                  {c.caseNumber || c.caseId} - {c.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="ai-disclaimer">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        Network connections are inferred from intelligence records and telecom/financial logs. All inferred links require human investigator corroboration.
      </div>

      {!effectiveCaseId ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Network className="w-8 h-8" /></div>
          <p className="text-slate-300 font-medium">No Case Selected</p>
          <p className="text-slate-500 text-sm mt-1">Select an active investigation above to inspect its interactive entity graph.</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-64"><div className="spinner w-8 h-8" /></div>
      ) : (
        <>
          {/* Quick Stats & Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Entities', value: networkData?.entityCount || 0, icon: Users },
              { label: 'Correlated Edges', value: networkData?.relationshipCount || 0, icon: Link2 },
            ].map(s => (
              <div key={s.label} className="card p-3 flex items-center gap-3">
                <s.icon className="w-5 h-5 text-cyber-400" />
                <div><div className="text-xl font-black text-white">{s.value}</div><div className="text-xs text-slate-500">{s.label}</div></div>
              </div>
            ))}

            {/* Legend */}
            <div className="card p-3 col-span-2">
              <div className="text-[10px] font-semibold uppercase text-slate-500 mb-1.5">Risk Level Thresholds</div>
              <div className="grid grid-cols-4 gap-1">
                {Object.entries(RISK_COLORS).map(([level, color]) => (
                  <div key={level} className="flex items-center gap-1 text-[10px] text-slate-400">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                    {level}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Entity Type Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 font-semibold text-[11px] flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Filter Type:
            </span>
            {['ALL', 'PERSON', 'ORGANIZATION', 'LOCATION', 'VEHICLE', 'WALLET', 'PHONE', 'DEVICE'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  filterType === type
                    ? 'bg-cyber-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Flow Container with Node Inspector Drawer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className={`${selectedNodeData ? 'lg:col-span-8' : 'lg:col-span-12'} card overflow-hidden transition-all`} style={{ height: '540px' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodeClick={handleNodeClick}
                fitView
                attributionPosition="bottom-right"
                style={{ background: '#0d1525' }}
                proOptions={{ hideAttribution: true }}
              >
                <MiniMap style={{ background: '#1a2438' }} nodeColor={(n) => n.style?.borderColor as string || '#334155'} />
                <Controls style={{ background: '#1a2438', border: '1px solid rgba(59,109,245,0.2)' }} />
                <Background color="#1e293b" gap={24} />
              </ReactFlow>
            </div>

            {/* Selected Node Details Drawer */}
            {selectedNodeData && (
              <div className="lg:col-span-4 card p-5 space-y-4 animate-fade-in flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyber-950 text-cyber-300 border border-cyber-800">
                        {selectedNodeData.type}
                      </span>
                      <AITransparencyBadge status="AI_INFERRED" confidenceScore={selectedNodeData.riskScore || 80} size="sm" />
                    </div>
                    <button
                      onClick={() => setSelectedNodeData(null)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white mt-3">{selectedNodeData.label}</h3>

                  <div className="space-y-2 mt-3 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Identifier:</span>
                      <span className="font-mono text-cyan-400">{selectedNodeData.data?.identifier || selectedNodeData.id}</span>
                    </div>

                    <div className="flex justify-between items-center py-1.5 border-y border-slate-800/80">
                      <span className="text-slate-400">Risk Assessment:</span>
                      <span className={`font-mono font-bold ${
                        selectedNodeData.riskScore >= 70 ? 'text-crimson-400' :
                        selectedNodeData.riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {selectedNodeData.riskScore || 0}/100 ({selectedNodeData.riskLevel || 'UNKNOWN'})
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Forensic Synopsis:</span>
                      <p className="text-slate-300 leading-relaxed mt-0.5">
                        {selectedNodeData.data?.description || 'Cross-referenced entity correlated through case telephone intercept and financial ledger analysis.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">ID: {selectedNodeData.id}</span>
                  <button
                    onClick={() => setSelectedNodeData(null)}
                    className="px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Deselect
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Entity list */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-cyber-600/20 flex items-center justify-between">
              <h3 className="font-bold text-slate-200">Cataloged Network Entities ({filteredRawNodes.length})</h3>
              <span className="text-xs text-slate-500">Filtered view</span>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead><tr><th>Entity</th><th>Type</th><th>Identifier</th><th>Risk Level</th><th>Risk Score</th></tr></thead>
                <tbody>
                  {filteredRawNodes.map((e: any) => (
                    <tr key={e.id} onClick={() => setSelectedNodeData(e)} className="cursor-pointer hover:bg-slate-800/40 transition">
                      <td className="text-slate-200 font-medium">{e.label}</td>
                      <td><span className="badge-info badge text-[10px]">{e.type}</span></td>
                      <td className="mono truncate max-w-[150px]">{e.data?.identifier || e.id}</td>
                      <td><span className={`badge ${e.riskLevel === 'HIGH' || e.riskLevel === 'CRITICAL' ? 'badge-high' : e.riskLevel === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}>{e.riskLevel}</span></td>
                      <td className={`font-bold ${e.riskScore >= 70 ? 'text-crimson-400' : e.riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>{e.riskScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
