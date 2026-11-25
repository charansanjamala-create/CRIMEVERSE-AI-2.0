import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { dashboardAPI, complaintsAPI } from '../api'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import {
  Search, Mic, Mail, Shield, Bitcoin, Network, Cpu,
  AlertTriangle, TrendingUp, Activity, Users, FileText, Bell, Plus, Video, MapPin, Radio,
  Scale, GitBranch, ShieldAlert, Compass, FileCheck, ArrowUpRight, CheckCircle, HelpCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { useActiveCase } from '../context/CaseContext'
import { useLanguage } from '../context/LanguageContext'
import AITransparencyBadge from '../components/AITransparencyBadge'

const quickActions = [
  { label: 'Citizen Complaints', icon: FileCheck, to: '/complaints', color: 'from-emerald-600 to-teal-600' },
  { label: 'Challenge AI', icon: Scale, to: '/challenge-ai', color: 'from-indigo-600 to-purple-600' },
  { label: 'What-If Simulation', icon: GitBranch, to: '/what-if', color: 'from-purple-600 to-pink-600' },
  { label: 'Case Geospatial', icon: Compass, to: '/case-map', color: 'from-cyan-600 to-teal-600' },
  { label: 'Escalations', icon: ShieldAlert, to: '/escalations', color: 'from-amber-600 to-orange-600' },
  { label: 'Live CCTV Wall', icon: Video, to: '/cctv', color: 'from-purple-600 to-indigo-600' },
  { label: 'Crime Network', icon: Network, to: '/network', color: 'from-rose-500 to-red-600' },
  { label: 'VoiceShield AI', icon: Mic, to: '/voice-shield', color: 'from-pink-500 to-rose-600' },
  { label: 'MailGuard', icon: Mail, to: '/mail-guard', color: 'from-blue-500 to-cyan-600' },
  { label: 'VeriTrust AI', icon: Shield, to: '/veri-trust', color: 'from-emerald-500 to-teal-600' },
  { label: 'ChainTrace AI', icon: Bitcoin, to: '/chain-trace', color: 'from-amber-500 to-yellow-600' },
  { label: 'Emergency SMS', icon: Radio, to: '/dispatch', color: 'from-crimson-600 to-red-600' },
]

const RISK_COLORS = ['#f43f5e', '#f97316', '#f59e0b', '#10b981']

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="stat-card group cursor-default">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-black text-white">{value}</div>
        <div className="text-xs font-semibold text-slate-300 leading-tight">{label}</div>
        {sub && <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

const priorityColor: Record<string, string> = { CRITICAL: 'badge-critical', HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' }
const severityColor: Record<string, string> = { CRITICAL: 'text-crimson-400', HIGH: 'text-orange-400', WARNING: 'text-amber-400', INFO: 'text-cyber-400' }

export default function DashboardPage() {
  const navigate = useNavigate()
  const { activeCase } = useActiveCase()
  const { t } = useLanguage()

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardAPI.getStats(),
    refetchInterval: 60000,
  })

  const { data: complaintsData } = useQuery({
    queryKey: ['complaints-count'],
    queryFn: () => complaintsAPI.getAll().catch(() => ({ data: [] })),
    refetchInterval: 60000,
  })

  const stats = data?.data?.data
  const complaintCount = complaintsData?.data?.length || 0

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="spinner w-8 h-8 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading intelligence dashboard...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <p className="text-slate-300 font-medium">Failed to load dashboard</p>
        <p className="text-slate-500 text-sm mt-1">Check that the backend server is running on port 5000</p>
      </div>
    </div>
  )

  const { overview, analyses, casesByStatus, casesByPriority, recentCases, recentAlerts, trendData } = stats || {}

  const pieData = [
    { name: 'CRITICAL', value: casesByPriority?.CRITICAL || 0 },
    { name: 'HIGH', value: casesByPriority?.HIGH || 0 },
    { name: 'MEDIUM', value: casesByPriority?.MEDIUM || 0 },
    { name: 'LOW', value: casesByPriority?.LOW || 0 },
  ].filter(d => d.value > 0)

  // Factor breakdown for active case
  const riskFactors = activeCase?.riskFactors || {
    connectedEntitiesScore: 24,
    unresolvedRelationshipsScore: 22,
    evidenceGapsScore: 18,
    contradictionsScore: 18,
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">{t('dashboard')}</h1>
          <p className="page-subtitle">Unified crime intelligence & autonomous case management — {format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/complaints')} className="px-3.5 py-2 rounded-lg bg-emerald-600/20 border border-emerald-500/50 hover:bg-emerald-600/40 text-emerald-300 text-xs font-bold transition flex items-center gap-1.5">
            <FileCheck className="w-4 h-4" /> Report Complaint / FIR
          </button>
          <button onClick={() => navigate('/investigations')} className="btn-primary">
            <Plus className="w-4 h-4" /> New Investigation
          </button>
        </div>
      </div>

      {/* Stats grid with Citizen Complaints Integration */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <StatCard icon={Search} label="Total Cases" value={overview?.totalCases ?? 0} sub={`${overview?.activeCases ?? 0} active`} color="from-cyber-500 to-blue-600" />
        <StatCard icon={FileCheck} label="Citizen Complaints" value={complaintCount} sub="FIR & citizen intake" color="from-emerald-500 to-teal-600" />
        <StatCard icon={AlertTriangle} label="High Risk" value={overview?.highRiskCases ?? 0} sub="Risk score ≥70" color="from-crimson-600 to-rose-600" />
        <StatCard icon={Bell} label="Active Alerts" value={overview?.unreadAlerts ?? 0} sub={`${overview?.criticalAlerts ?? 0} critical`} color="from-amber-500 to-orange-600" />
        <StatCard icon={Network} label="Network Nodes" value={overview?.totalEntities ?? 0} sub="Entities correlated" color="from-purple-500 to-violet-600" />
      </div>

      {/* Transparent Case Risk Score & Active Investigation Banner */}
      {activeCase && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-slate-950 border border-cyber-500/30 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyber-950 text-cyber-300 border border-cyber-800">
                  ACTIVE CASE CONTEXT
                </span>
                <span className="text-xs text-slate-400 font-mono">{activeCase.caseNumber}</span>
                <AITransparencyBadge status="AI_INFERRED" confidenceScore={91} size="sm" />
              </div>
              <h2 className="text-base font-bold text-white mt-1">{activeCase.title}</h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-black font-mono text-crimson-400 leading-none">
                  {activeCase.riskScore || 0}<span className="text-xs text-slate-500">/100</span>
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Risk Score</div>
              </div>
              <button
                onClick={() => navigate(`/investigations/${activeCase._id}`)}
                className="px-3 py-1.5 rounded-lg bg-cyber-600 hover:bg-cyber-500 text-white text-xs font-semibold flex items-center gap-1 transition"
              >
                Inspect Dossier <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Factor Breakdown */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-cyber-400" /> Transparent Risk Factor Breakdown (Deterministic Formula)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">No Black-Box Bias</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Connected Entities</span>
                  <span className="font-mono text-white">{riskFactors.connectedEntitiesScore}/25</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyber-500" style={{ width: `${(riskFactors.connectedEntitiesScore / 25) * 100}%` }} />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Unresolved Links</span>
                  <span className="font-mono text-white">{riskFactors.unresolvedRelationshipsScore}/25</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${(riskFactors.unresolvedRelationshipsScore / 25) * 100}%` }} />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Evidence Gaps</span>
                  <span className="font-mono text-white">{riskFactors.evidenceGapsScore}/25</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${(riskFactors.evidenceGapsScore / 25) * 100}%` }} />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Contradictions / Flags</span>
                  <span className="font-mono text-white">{riskFactors.contradictionsScore}/25</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-crimson-500" style={{ width: `${(riskFactors.contradictionsScore / 25) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions (Expanded with New Features) */}
      <div>
        <h3 className="section-label">Enterprise & AI Operations</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <button key={action.label} onClick={() => navigate(action.to)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:border-cyber-600/40 hover:bg-slate-800/60 transition-all duration-200 group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-medium text-slate-300 group-hover:text-white text-center leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Trend chart */}
        <div className="lg:col-span-2 chart-container">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200">Incident & Case Velocity (Last 7 Days)</h3>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-cyber-400 inline-block rounded" />Cases</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-crimson-500 inline-block rounded" />Alerts</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trendData || []}>
              <defs>
                <linearGradient id="caseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b6df5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b6df5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a2438', border: '1px solid rgba(59,109,245,0.3)', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="cases" stroke="#3b6df5" strokeWidth={2} fill="url(#caseGrad)" />
              <Area type="monotone" dataKey="alerts" stroke="#f43f5e" strokeWidth={2} fill="url(#alertGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Priority pie */}
        <div className="chart-container">
          <h3 className="text-sm font-bold text-slate-200 mb-4">Cases by Priority</h3>
          {pieData.length > 0 ? (
            <div className="flex flex-col items-center gap-4">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={RISK_COLORS[i % RISK_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a2438', border: '1px solid rgba(59,109,245,0.3)', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 w-full">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: RISK_COLORS[i] }} />
                    <span className="text-slate-400">{d.name}: <span className="text-slate-200 font-semibold">{d.value}</span></span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-600 text-sm">No cases yet</div>
          )}
        </div>
      </div>

      {/* Bottom row — Recent Cases + Recent Alerts */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Cases */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-cyber-600/20">
            <h3 className="text-sm font-bold text-slate-200">Recent Investigations</h3>
            <button onClick={() => navigate('/investigations')} className="text-xs text-cyber-400 hover:text-cyber-300">View all →</button>
          </div>
          <div className="divide-y divide-slate-800/50">
            {(recentCases || []).length === 0 ? (
              <div className="p-6 text-center text-slate-600 text-sm">No investigations yet</div>
            ) : (recentCases || []).map((c: any) => (
              <button key={c._id} onClick={() => navigate(`/investigations/${c._id}`)}
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-800/30 transition-colors text-left">
                <div>
                  <div className="text-sm font-medium text-slate-200 truncate max-w-[180px]">{c.title}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{c.caseId || c.caseNumber}</div>
                </div>
                <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                  <span className={priorityColor[c.priority] || 'badge-info'}>{c.priority}</span>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-200">{c.riskScore}</div>
                    <div className="text-[10px] text-slate-600">risk</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-cyber-600/20">
            <h3 className="text-sm font-bold text-slate-200">Recent Alerts</h3>
            <button onClick={() => navigate('/alerts')} className="text-xs text-cyber-400 hover:text-cyber-300">View all →</button>
          </div>
          <div className="divide-y divide-slate-800/50">
            {(recentAlerts || []).length === 0 ? (
              <div className="p-6 text-center text-slate-600 text-sm">No alerts</div>
            ) : (recentAlerts || []).map((a: any) => (
              <div key={a._id} className="flex items-start gap-3 p-3">
                <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${severityColor[a.severity] || 'text-slate-400'}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-200 truncate">{a.title}</div>
                  <div className="text-[11px] text-slate-500 truncate">{a.message?.slice(0, 60)}...</div>
                </div>
                {!a.isRead && <div className="w-2 h-2 bg-cyber-500 rounded-full flex-shrink-0 mt-1" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
