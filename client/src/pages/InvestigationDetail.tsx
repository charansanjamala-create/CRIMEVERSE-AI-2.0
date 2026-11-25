import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { casesAPI, reportsAPI, aiAPI, locationsAPI, challengeAPI, escalationsAPI } from '../api'
import { format } from 'date-fns'
import {
  ArrowLeft, Shield, AlertTriangle, FileText, Mic, Mail, Bitcoin, Network,
  Clock, Users, FileSearch, Cpu, ChevronDown, Edit2, Plus, Printer,
  MapPin, Scale, GitBranch, ShieldAlert, CheckCircle, HelpCircle, Send
} from 'lucide-react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import CaseExportModal from '../components/CaseExportModal'
import AITransparencyBadge from '../components/AITransparencyBadge'
import { useActiveCase } from '../context/CaseContext'

const tabs = [
  { id: 'overview', label: 'Overview', icon: Shield },
  { id: 'locations', label: 'Case Locations', icon: MapPin },
  { id: 'challenge', label: 'Challenge AI Audit', icon: Scale },
  { id: 'entities', label: 'Entities', icon: Users },
  { id: 'evidence', label: 'Evidence', icon: FileSearch },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'ai', label: 'AI Insights', icon: Cpu },
]

const priorityColor: Record<string, string> = { CRITICAL: 'badge-critical', HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' }
const entityTypeIcon: Record<string, string> = { PERSON: '👤', ORGANIZATION: '🏢', EMAIL: '📧', PHONE: '📱', WALLET: '💰', DEVICE: '💻', IP: '🌐', DOMAIN: '🔗', DOCUMENT: '📄', LOCATION: '📍', VEHICLE: '🚗', TRANSACTION: '💳' }

export default function InvestigationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setActiveCaseId } = useActiveCase()
  const [activeTab, setActiveTab] = useState('overview')
  const [exportModalOpen, setExportModalOpen] = useState(false)

  // Escalate Modal State
  const [escalateModalOpen, setEscalateModalOpen] = useState(false)
  const [escalateReason, setEscalateReason] = useState('HIGH_RISK_THRESHOLD')
  const [escalatePriority, setEscalatePriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH')
  const [escalateNotes, setEscalateNotes] = useState('')
  const [submittingEscalation, setSubmittingEscalation] = useState(false)

  const { data: caseData, isLoading } = useQuery({
    queryKey: ['case', id],
    queryFn: () => casesAPI.getById(id!),
    enabled: !!id,
  })

  const { data: entitiesData } = useQuery({
    queryKey: ['case-entities', id],
    queryFn: () => casesAPI.getEntities(id!),
    enabled: !!id && activeTab === 'entities',
  })

  const { data: evidenceData } = useQuery({
    queryKey: ['case-evidence', id],
    queryFn: () => casesAPI.getEvidence(id!),
    enabled: !!id && activeTab === 'evidence',
  })

  const { data: timelineData } = useQuery({
    queryKey: ['case-timeline', id],
    queryFn: () => casesAPI.getTimeline(id!),
    enabled: !!id && activeTab === 'timeline',
  })

  const { data: reportsData } = useQuery({
    queryKey: ['case-reports', id],
    queryFn: () => reportsAPI.getByCase(id!),
    enabled: !!id && activeTab === 'reports',
  })

  const { data: locationsData } = useQuery({
    queryKey: ['case-locations', id],
    queryFn: () => locationsAPI.getByCase(id!),
    enabled: !!id && activeTab === 'locations',
  })

  const { data: challengeData } = useQuery({
    queryKey: ['case-challenge', id],
    queryFn: () => challengeAPI.getByCase(id!),
    enabled: !!id && activeTab === 'challenge',
  })

  const [aiInsight, setAiInsight] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const generateInsight = async () => {
    setAiLoading(true)
    try {
      const res = await aiAPI.unifiedAnalysis({ caseId: id! })
      setAiInsight(res.data.data.content)
    } catch { toast.error('Failed to generate AI analysis') }
    finally { setAiLoading(false) }
  }

  const generateReportMutation = useMutation({
    mutationFn: () => reportsAPI.generate({ caseId: id! }),
    onSuccess: () => { toast.success('Report generated!'); queryClient.invalidateQueries({ queryKey: ['case-reports', id] }); setActiveTab('reports') },
    onError: () => toast.error('Failed to generate report'),
  })

  const handleEscalateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    try {
      setSubmittingEscalation(true)
      await escalationsAPI.create({
        caseId: id,
        reason: escalateReason,
        priority: escalatePriority,
        notes: escalateNotes,
      })
      toast.success('Dispatched to supervisor command queue!')
      setEscalateModalOpen(false)
      setEscalateNotes('')
    } catch {
      toast.error('Escalation dispatch failed')
    } finally {
      setSubmittingEscalation(false)
    }
  }

  const c = caseData?.data?.data

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="spinner w-8 h-8" /></div>
  if (!c) return <div className="empty-state"><AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" /><p className="text-slate-300">Case not found</p></div>

  const riskFactors = c.riskFactors || {
    connectedEntitiesScore: 24,
    unresolvedRelationshipsScore: 20,
    evidenceGapsScore: 16,
    contradictionsScore: 18,
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <button onClick={() => navigate('/investigations')} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 mt-1">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={priorityColor[c.priority] || 'badge-info'}>{c.priority}</span>
              <span className={`badge ${c.status === 'ACTIVE' ? 'badge-low' : c.status === 'OPEN' ? 'badge-info' : 'badge'}`}>{c.status}</span>
              <span className="mono">{c.caseId || c.caseNumber}</span>
              <AITransparencyBadge status="AI_INFERRED" confidenceScore={89} size="sm" />
            </div>
            <h1 className="text-2xl font-black text-white truncate">{c.title}</h1>
            <p className="text-slate-400 text-sm mt-1 line-clamp-2">{c.description}</p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2.5 flex-shrink-0 flex-wrap">
          <button
            onClick={() => setActiveCaseId(c._id)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold"
          >
            Set as Active Case
          </button>
          <button
            onClick={() => setEscalateModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-600/40 text-xs font-bold flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Escalate
          </button>
          <button
            onClick={() => setExportModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-cyber-600/20 hover:bg-cyber-600/40 text-cyber-300 border border-cyber-600/40 text-xs font-bold flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Export Dossier
          </button>
          <div className="text-right pl-2 border-l border-slate-800">
            <div className={`text-2xl font-black font-mono ${c.riskScore >= 70 ? 'text-crimson-400' : c.riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>{c.riskScore || 0}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Risk Score</div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Entities', value: c.entityCount || 0, icon: Users, onClick: () => setActiveTab('entities') },
          { label: 'Evidence', value: c.evidenceCount || 0, icon: FileSearch, onClick: () => setActiveTab('evidence') },
          { label: 'Alerts', value: c.alertCount || 0, icon: AlertTriangle, onClick: () => navigate('/alerts') },
          { label: 'Last Activity', value: format(new Date(c.lastActivityAt || c.updatedAt || Date.now()), 'MMM d'), icon: Clock, onClick: () => setActiveTab('timeline') },
        ].map((stat) => (
          <button key={stat.label} onClick={stat.onClick}
            className="card p-3 flex items-center gap-3 hover:border-cyber-600/50 transition-all text-left group">
            <stat.icon className="w-5 h-5 text-cyber-400 flex-shrink-0" />
            <div>
              <div className="text-lg font-black text-white">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Intelligence module shortcuts */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Challenge AI Audit', icon: Scale, to: '/challenge-ai', color: 'from-indigo-500 to-purple-600' },
          { label: 'What-If Counterfactual', icon: GitBranch, to: '/what-if', color: 'from-purple-500 to-pink-600' },
          { label: 'Case Geospatial Map', icon: MapPin, to: '/case-map', color: 'from-cyan-500 to-teal-600' },
          { label: 'View Network Graph', icon: Network, to: `/network/${id}`, color: 'from-rose-500 to-red-600' },
          { label: 'VoiceShield AI', icon: Mic, to: '/voice-shield', color: 'from-purple-500 to-pink-600' },
          { label: 'MailGuard', icon: Mail, to: '/mail-guard', color: 'from-blue-500 to-cyan-600' },
          { label: 'VeriTrust AI', icon: Shield, to: '/veri-trust', color: 'from-emerald-500 to-teal-600' },
          { label: 'ChainTrace AI', icon: Bitcoin, to: '/chain-trace', color: 'from-amber-500 to-orange-600' },
        ].map((action) => (
          <button key={action.label} onClick={() => navigate(action.to)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:border-cyber-600/40 transition-all text-xs text-slate-400 hover:text-slate-200">
            <div className={`w-5 h-5 rounded bg-gradient-to-br ${action.color} flex items-center justify-center`}>
              <action.icon className="w-3 h-3 text-white" />
            </div>
            {action.label}
          </button>
        ))}
        <button onClick={() => generateReportMutation.mutate()} disabled={generateReportMutation.isPending}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-cyber-600/30 bg-cyber-600/10 text-cyber-400 hover:bg-cyber-600/20 transition-all text-xs font-semibold">
          <FileText className="w-4 h-4" />
          {generateReportMutation.isPending ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-800 overflow-x-auto pb-0">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-cyber-500 text-cyber-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-slate-200">Case Information</h3>
              {[
                { label: 'Case ID / Number', value: c.caseId || c.caseNumber },
                { label: 'Status', value: c.status },
                { label: 'Priority', value: c.priority },
                { label: 'Risk Score', value: `${c.riskScore || 0}/100` },
                { label: 'Assigned To', value: c.assignedTo?.name || 'Unassigned' },
                { label: 'Created By', value: c.createdBy?.name || 'Evidence Intake' },
                { label: 'Created', value: format(new Date(c.createdAt || Date.now()), 'PPP') },
                { label: 'Last Activity', value: format(new Date(c.lastActivityAt || c.updatedAt || Date.now()), 'PPP p') },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0">
                  <span className="text-xs text-slate-500 font-medium">{label}</span>
                  <span className="text-sm text-slate-200 font-medium">{value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {/* Transparent Risk Breakdown */}
              <div className="card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-cyber-400" />
                    Transparent Risk Breakdown
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">Standard Formula</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Connected Entities Load</span>
                      <span className="font-mono text-white">{riskFactors.connectedEntitiesScore}/25</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyber-500" style={{ width: `${(riskFactors.connectedEntitiesScore / 25) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Unresolved Critical Links</span>
                      <span className="font-mono text-white">{riskFactors.unresolvedRelationshipsScore}/25</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${(riskFactors.unresolvedRelationshipsScore / 25) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Missing Evidentiary Pieces</span>
                      <span className="font-mono text-white">{riskFactors.evidenceGapsScore}/25</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${(riskFactors.evidenceGapsScore / 25) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Contradictions & Red Flags</span>
                      <span className="font-mono text-white">{riskFactors.contradictionsScore}/25</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-crimson-500" style={{ width: `${(riskFactors.contradictionsScore / 25) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-bold text-slate-200 mb-3">Tags & Labels</h3>
                <div className="flex flex-wrap gap-2">
                  {c.tags?.length > 0 ? c.tags.map((t: string) => <span key={t} className="tag">{t}</span>) : <span className="text-slate-600 text-sm">No tags</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Case Locations Tab */}
        {activeTab === 'locations' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-200">Structured Case Locations</h3>
              <button onClick={() => navigate('/case-map')} className="btn-secondary text-xs">
                <MapPin className="w-3.5 h-3.5" /> Open Tactical Case Map
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {(locationsData?.data || []).map((loc: any) => (
                <div key={loc._id} className="card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{loc.title}</span>
                    <AITransparencyBadge status={loc.verificationStatus || 'VERIFIED'} size="sm" />
                  </div>
                  <div className="text-xs text-slate-300">
                    <p>{loc.address?.street}</p>
                    <p className="font-semibold">{loc.address?.city}, {loc.address?.state}</p>
                    <p className="font-mono text-cyan-400 text-[11px] mt-1">
                      GPS: {loc.coordinates?.lat?.toFixed(4)}, {loc.coordinates?.lng?.toFixed(4)}
                    </p>
                  </div>
                  {loc.notes && <p className="text-xs text-slate-400 pt-1 italic">{loc.notes}</p>}
                </div>
              ))}
              {(locationsData?.data || []).length === 0 && (
                <div className="col-span-2 empty-state">
                  <div className="empty-state-icon"><MapPin className="w-8 h-8" /></div>
                  <p className="text-slate-400 text-sm">No structured locations registered for this case.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Challenge AI Audit Tab */}
        {activeTab === 'challenge' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-200">Challenge AI Audit Findings</h3>
              <button onClick={() => navigate('/challenge-ai')} className="btn-secondary text-xs">
                <Scale className="w-3.5 h-3.5" /> Full Audit Engine
              </button>
            </div>
            <div className="space-y-3">
              {(challengeData?.data || []).map((f: any) => (
                <div key={f._id} className="card p-4 space-y-2 border-indigo-900/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {f.type}
                      </span>
                      <span className="font-bold text-white text-sm">{f.title}</span>
                    </div>
                    <AITransparencyBadge status="AI_INFERRED" confidenceScore={f.confidenceScore} size="sm" />
                  </div>
                  <p className="text-xs text-slate-300">{f.description}</p>
                  {f.criticalQuestions?.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/30 text-xs text-amber-200 space-y-1">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-amber-400 block">Critical Inquest Question:</span>
                      <p>{f.criticalQuestions[0]}</p>
                    </div>
                  )}
                </div>
              ))}
              {(challengeData?.data || []).length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon"><Scale className="w-8 h-8" /></div>
                  <p className="text-slate-400 text-sm">No adversarial findings detected yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Entities */}
        {activeTab === 'entities' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-200">Network Entities ({entitiesData?.data?.data?.length || 0})</h3>
              <button onClick={() => navigate(`/network/${id}`)} className="btn-secondary text-xs"><Network className="w-3 h-3" /> View Graph</button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {(entitiesData?.data?.data || []).map((e: any) => (
                <div key={e._id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{entityTypeIcon[e.type] || '🔷'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-200 text-sm truncate">{e.name}</span>
                        <span className={`badge text-[10px] ${e.riskLevel === 'HIGH' || e.riskLevel === 'CRITICAL' ? 'badge-high' : e.riskLevel === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}>{e.riskLevel}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{e.identifier}</p>
                      {e.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{e.description}</p>}
                    </div>
                    <div className={`text-lg font-black ${e.riskScore >= 70 ? 'text-crimson-400' : e.riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>{e.riskScore}</div>
                  </div>
                </div>
              ))}
              {(entitiesData?.data?.data || []).length === 0 && (
                <div className="col-span-2 empty-state">
                  <div className="empty-state-icon"><Users className="w-8 h-8" /></div>
                  <p className="text-slate-400 text-sm">No entities yet. Run intelligence analyses to extract entities.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Evidence */}
        {activeTab === 'evidence' && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-200">Evidence Items ({evidenceData?.data?.data?.length || 0})</h3>
            {(evidenceData?.data?.data || []).map((ev: any) => (
              <div key={ev._id} className="card p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-lg flex-shrink-0">
                  {ev.type === 'AUDIO' ? '🎵' : ev.type === 'EMAIL' ? '📧' : ev.type === 'BLOCKCHAIN' ? '⛓️' : ev.type === 'DOCUMENT' ? '📄' : '📁'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-200 text-sm">{ev.title}</span>
                    <span className="badge-info badge text-[10px]">{ev.type}</span>
                  </div>
                  {ev.description && <p className="text-xs text-slate-400">{ev.description}</p>}
                  <div className="text-[11px] text-slate-600 mt-1">Added by {ev.uploadedBy?.name} · {format(new Date(ev.createdAt), 'MMM d, HH:mm')}</div>
                </div>
                <div className={`text-xs font-semibold px-2 py-1 rounded ${ev.isProcessed ? 'text-emerald-400 bg-emerald-400/10' : 'text-amber-400 bg-amber-400/10'}`}>
                  {ev.isProcessed ? '✓ Processed' : 'Pending'}
                </div>
              </div>
            ))}
            {(evidenceData?.data?.data || []).length === 0 && (
              <div className="empty-state"><div className="empty-state-icon"><FileSearch className="w-8 h-8" /></div><p className="text-slate-400 text-sm">No evidence items. Run intelligence modules to collect evidence.</p></div>
            )}
          </div>
        )}

        {/* Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-200">Investigation Timeline</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-cyber-600/50 via-cyber-600/20 to-transparent" />
              <div className="space-y-4 pl-10">
                {(timelineData?.data?.data || []).map((ev: any) => (
                  <div key={ev._id} className="relative animate-fade-in">
                    <div className={`absolute -left-10 top-3 w-4 h-4 rounded-full border-2 ${ev.significance === 'CRITICAL' ? 'bg-crimson-500 border-crimson-400' : ev.significance === 'HIGH' ? 'bg-amber-500 border-amber-400' : 'bg-cyber-500 border-cyber-400'}`} />
                    <div className="card p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-semibold text-slate-200 text-sm">{ev.title}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {ev.significance === 'CRITICAL' && <span className="badge-critical badge text-[10px]">CRITICAL</span>}
                          {ev.significance === 'HIGH' && <span className="badge-high badge text-[10px]">HIGH</span>}
                          <span className="text-[11px] text-slate-500">{format(new Date(ev.eventDate), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">{ev.description}</p>
                      <div className="text-[11px] text-slate-600 mt-2">Source: {ev.source}</div>
                    </div>
                  </div>
                ))}
                {(timelineData?.data?.data || []).length === 0 && (
                  <div className="empty-state"><div className="empty-state-icon"><Clock className="w-8 h-8" /></div><p className="text-slate-400 text-sm">No timeline events recorded.</p></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reports */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-200">Investigation Reports</h3>
              <button onClick={() => generateReportMutation.mutate()} disabled={generateReportMutation.isPending} className="btn-primary text-sm">
                <FileText className="w-4 h-4" /> {generateReportMutation.isPending ? 'Generating...' : 'Generate New Report'}
              </button>
            </div>
            {(reportsData?.data?.data || []).map((r: any) => (
              <div key={r._id} className="card overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200">{r.title}</h4>
                    <p className="text-xs text-slate-500">Generated {format(new Date(r.createdAt), 'PPP p')} · AI Provider: {r.aiProvider}</p>
                  </div>
                  <div className={`badge ${r.riskSummary?.overallRisk === 'HIGH' ? 'badge-high' : 'badge-medium'}`}>{r.riskSummary?.overallRisk} Risk</div>
                </div>
                <div className="p-4 space-y-4">
                  {(r.sections || []).map((s: any) => (
                    <div key={s.sectionId}>
                      <h5 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                        {s.title}
                        {s.isAIGenerated && <span className="badge-info badge text-[10px]">AI Generated</span>}
                      </h5>
                      <pre className="text-xs text-slate-400 whitespace-pre-wrap font-sans leading-relaxed">{s.content}</pre>
                    </div>
                  ))}
                  <div className="ai-disclaimer mt-4">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    This report contains AI-generated content. All findings require human expert review before any action is taken.
                  </div>
                </div>
              </div>
            ))}
            {(reportsData?.data?.data || []).length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon"><FileText className="w-8 h-8" /></div>
                <p className="text-slate-400 text-sm">No reports generated yet</p>
                <button onClick={() => generateReportMutation.mutate()} className="btn-primary mt-4">Generate Intelligence Report</button>
              </div>
            )}
          </div>
        )}

        {/* AI Insights */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-200">AI Intelligence Analysis</h3>
              <button onClick={generateInsight} disabled={aiLoading} className="btn-primary text-sm">
                <Cpu className="w-4 h-4" /> {aiLoading ? 'Analyzing...' : 'Run Unified Analysis'}
              </button>
            </div>
            <div className="ai-disclaimer mb-4">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              AI-generated intelligence analysis. Requires human review. Does not constitute legal evidence.
            </div>
            {aiInsight ? (
              <div className="card p-5">
                <div className="prose prose-invert prose-sm max-w-none [&>h1]:text-lg [&>h2]:text-base [&>table]:text-xs">
                  <ReactMarkdown>{aiInsight}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon"><Cpu className="w-8 h-8" /></div>
                <p className="text-slate-300 font-medium">Run Unified AI Analysis</p>
                <p className="text-slate-500 text-sm mt-1">The AI Intelligence Core will correlate all five intelligence modules for this case.</p>
                <button onClick={generateInsight} className="btn-primary mt-4">
                  <Cpu className="w-4 h-4" /> Generate Unified Analysis
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Printable / Dossier Export Modal */}
      <CaseExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        caseData={c}
      />

      {/* Escalate Modal */}
      {escalateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleEscalateSubmit}
            className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-400" />
                Dispatch Case Escalation
              </h3>
              <button
                type="button"
                onClick={() => setEscalateModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Reason *
              </label>
              <select
                value={escalateReason}
                onChange={e => setEscalateReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value="HIGH_RISK_THRESHOLD">High Risk Threshold Exceeded</option>
                <option value="CONTRADICTORY_EVIDENCE">Major Unresolved Evidence Contradiction</option>
                <option value="JURISDICTION_CONFLICT">Multi-Jurisdiction / Agency Conflict</option>
                <option value="RESOURCE_REQUEST">Tactical Resource Request</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Priority Tier *
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setEscalatePriority(p)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                      escalatePriority === p
                        ? 'bg-amber-600 border-amber-500 text-slate-950'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Filing Notes & Justification *
              </label>
              <textarea
                required
                rows={3}
                placeholder="State specific reason for supervisor intervention..."
                value={escalateNotes}
                onChange={e => setEscalateNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEscalateModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingEscalation}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                {submittingEscalation ? 'Dispatching...' : 'Dispatch Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
