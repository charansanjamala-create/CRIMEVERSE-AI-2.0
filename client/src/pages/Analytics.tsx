import { useQuery } from '@tanstack/react-query'
import { dashboardAPI, casesAPI } from '../api'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PieChart, Pie, Cell
} from 'recharts'
import { TrendingUp, Activity, Shield, AlertTriangle, Mic, Mail, Bitcoin, Network } from 'lucide-react'

const COLORS = ['#3b6df5', '#f43f5e', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4']

const tooltipStyle = {
  contentStyle: { background: '#1a2438', border: '1px solid rgba(59,109,245,0.3)', borderRadius: '8px', fontSize: '12px' }
}

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardAPI.getStats(),
  })

  const { data: casesData } = useQuery({
    queryKey: ['cases-analytics'],
    queryFn: () => casesAPI.getAll({ limit: 100 }),
  })

  const stats = data?.data?.data
  const cases = casesData?.data?.data || []

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="spinner w-8 h-8 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading analytics...</p>
      </div>
    </div>
  )

  const { overview, analyses, casesByStatus, casesByPriority, trendData } = stats || {}

  // Build module radar data
  const radarData = [
    { subject: 'Voice', value: analyses?.voiceAnalyses || 0 },
    { subject: 'Email', value: analyses?.emailAnalyses || 0 },
    { subject: 'Identity', value: analyses?.identityAnalyses || 0 },
    { subject: 'Blockchain', value: analyses?.blockchainAnalyses || 0 },
    { subject: 'Network', value: overview?.totalEntities || 0 },
    { subject: 'AI Chat', value: 12 },
  ]

  // Risk distribution histogram
  const riskBuckets = [
    { range: '0–19', count: cases.filter((c: any) => c.riskScore < 20).length },
    { range: '20–39', count: cases.filter((c: any) => c.riskScore >= 20 && c.riskScore < 40).length },
    { range: '40–59', count: cases.filter((c: any) => c.riskScore >= 40 && c.riskScore < 60).length },
    { range: '60–79', count: cases.filter((c: any) => c.riskScore >= 60 && c.riskScore < 80).length },
    { range: '80–100', count: cases.filter((c: any) => c.riskScore >= 80).length },
  ]

  // Status pie
  const statusPie = Object.entries(casesByStatus || {}).map(([name, value]) => ({ name, value: value as number }))

  // Priority bars
  const priorityBars = [
    { name: 'Low', value: casesByPriority?.LOW || 0, fill: '#10b981' },
    { name: 'Medium', value: casesByPriority?.MEDIUM || 0, fill: '#f59e0b' },
    { name: 'High', value: casesByPriority?.HIGH || 0, fill: '#f97316' },
    { name: 'Critical', value: casesByPriority?.CRITICAL || 0, fill: '#f43f5e' },
  ]

  const kpis = [
    { label: 'Total Cases', value: overview?.totalCases ?? 0, icon: Shield, color: 'from-cyber-500 to-blue-600', delta: '+12%' },
    { label: 'High Risk Cases', value: overview?.highRiskCases ?? 0, icon: AlertTriangle, color: 'from-crimson-600 to-rose-600', delta: '+5%' },
    { label: 'Total Analyses', value: (analyses?.voiceAnalyses || 0) + (analyses?.emailAnalyses || 0) + (analyses?.identityAnalyses || 0) + (analyses?.blockchainAnalyses || 0), icon: Activity, color: 'from-purple-500 to-violet-600', delta: '+28%' },
    { label: 'Active Alerts', value: overview?.unreadAlerts ?? 0, icon: TrendingUp, color: 'from-amber-500 to-orange-600', delta: '-3%' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">Analytics & Insights</h1>
        <p className="page-subtitle">Intelligence performance metrics and trend analysis</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, delta }) => (
          <div key={label} className="card p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xs font-semibold ${delta.startsWith('+') ? 'text-emerald-400' : 'text-crimson-400'}`}>{delta}</span>
            </div>
            <div className="text-3xl font-black text-white">{value}</div>
            <div className="text-xs font-medium text-slate-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Activity trend */}
        <div className="lg:col-span-2 chart-container">
          <h3 className="text-sm font-bold text-slate-200 mb-4">Activity Trend — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData || []}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b6df5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b6df5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="cases" stroke="#3b6df5" strokeWidth={2} fill="url(#grad1)" name="Cases" />
              <Area type="monotone" dataKey="alerts" stroke="#f43f5e" strokeWidth={2} fill="url(#grad2)" name="Alerts" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status pie */}
        <div className="chart-container">
          <h3 className="text-sm font-bold text-slate-200 mb-4">Case Status Breakdown</h3>
          {statusPie.length > 0 ? (
            <div className="flex flex-col items-center gap-3">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusPie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {statusPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 w-full">
                {statusPie.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: COLORS[i] }} />
                    <span className="text-slate-400 truncate">{d.name}: <span className="text-slate-200 font-semibold">{String(d.value)}</span></span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-600 text-sm">No data</div>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Priority bars */}
        <div className="chart-container">
          <h3 className="text-sm font-bold text-slate-200 mb-4">Cases by Priority</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={priorityBars} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={55} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {priorityBars.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk distribution */}
        <div className="chart-container">
          <h3 className="text-sm font-bold text-slate-200 mb-4">Risk Score Distribution</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={riskBuckets}>
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" fill="#3b6df5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Module radar */}
        <div className="chart-container">
          <h3 className="text-sm font-bold text-slate-200 mb-4">Module Usage</h3>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(59,109,245,0.2)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
              <Radar name="Analyses" dataKey="value" stroke="#3b6df5" fill="#3b6df5" fillOpacity={0.2} />
              <Tooltip {...tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Module breakdown table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-200">Intelligence Module Performance</h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Module</th>
                <th>Analyses Run</th>
                <th>Utilization</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'VoiceShield AI', icon: Mic, count: analyses?.voiceAnalyses || 0, color: 'text-purple-400', status: 'Active' },
                { name: 'MailGuard', icon: Mail, count: analyses?.emailAnalyses || 0, color: 'text-blue-400', status: 'Active' },
                { name: 'VeriTrust AI', icon: Shield, count: analyses?.identityAnalyses || 0, color: 'text-emerald-400', status: 'Active' },
                { name: 'ChainTrace AI', icon: Bitcoin, count: analyses?.blockchainAnalyses || 0, color: 'text-amber-400', status: 'Active' },
                { name: 'Crime Network', icon: Network, count: overview?.totalEntities || 0, color: 'text-rose-400', status: 'Active' },
              ].map(({ name, icon: Icon, count, color, status }) => {
                const maxCount = Math.max(analyses?.voiceAnalyses || 1, analyses?.emailAnalyses || 1, analyses?.identityAnalyses || 1, analyses?.blockchainAnalyses || 1, 1)
                const pct = Math.round((count / maxCount) * 100)
                return (
                  <tr key={name}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <span className="text-slate-200 font-medium">{name}</span>
                      </div>
                    </td>
                    <td className="text-slate-300 font-semibold">{count}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="risk-bar flex-1 max-w-[120px]">
                          <div className="risk-fill bg-cyber-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{pct}%</span>
                      </div>
                    </td>
                    <td><span className="badge badge-low">{status}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
