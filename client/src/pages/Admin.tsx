import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authAPI, casesAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import {
  Users, Shield, Database, Search, AlertTriangle, Activity, Trash2,
  UserCheck, UserX, RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Only ADMIN can access
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  const { data: casesData, isLoading: casesLoading } = useQuery({
    queryKey: ['admin-cases'],
    queryFn: () => casesAPI.getAll({ limit: 100 }),
  })

  const cases = casesData?.data?.data || []

  const roleColors: Record<string, string> = {
    ADMIN: 'badge-critical', INVESTIGATOR: 'badge-info', ANALYST: 'badge-medium', VIEWER: 'badge'
  }

  const stats = [
    { label: 'Total Cases', value: cases.length, icon: Search, color: 'from-cyber-500 to-blue-600' },
    { label: 'Active Cases', value: cases.filter((c: any) => c.status === 'ACTIVE').length, icon: Activity, color: 'from-emerald-500 to-teal-600' },
    { label: 'Critical Risk', value: cases.filter((c: any) => c.riskScore >= 70).length, icon: AlertTriangle, color: 'from-crimson-600 to-rose-600' },
    { label: 'High Priority', value: cases.filter((c: any) => c.priority === 'CRITICAL' || c.priority === 'HIGH').length, icon: Shield, color: 'from-amber-500 to-orange-600' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Shield className="w-6 h-6 text-crimson-400" />
            Admin Panel
          </h1>
          <p className="page-subtitle">System administration and oversight — ADMIN only</p>
        </div>
        <div className="badge badge-critical text-sm px-3 py-1">
          🔴 ADMIN ACCESS
        </div>
      </div>

      {/* Warning banner */}
      <div className="p-4 rounded-xl border border-crimson-600/30 bg-crimson-600/5 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-crimson-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-bold text-crimson-300">Restricted Access Zone</div>
          <div className="text-xs text-crimson-400/70 mt-0.5">
            All actions performed here are logged and audited. Misuse of admin privileges is a serious offense.
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-3xl font-black text-white">{value}</div>
            <div className="text-xs text-slate-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Cases table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <Database className="w-4 h-4 text-cyber-400" /> All Cases
          </h3>
          <button onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-cases'] })}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        {casesLoading ? (
          <div className="flex items-center justify-center h-32"><div className="spinner w-6 h-6" /></div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Risk</th>
                  <th>Created By</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c: any) => (
                  <tr key={c._id}>
                    <td className="mono">{c.caseId}</td>
                    <td>
                      <div className="text-slate-200 font-medium text-sm truncate max-w-[180px]">{c.title}</div>
                    </td>
                    <td>
                      <span className={`badge ${c.status === 'ACTIVE' ? 'badge-low' : c.status === 'CLOSED' ? '' : 'badge-info'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${c.priority === 'CRITICAL' ? 'badge-critical' : c.priority === 'HIGH' ? 'badge-high' : c.priority === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`font-black text-sm ${c.riskScore >= 70 ? 'text-crimson-400' : c.riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {c.riskScore}
                      </span>
                    </td>
                    <td className="text-slate-400 text-xs">{c.createdBy?.name || '—'}</td>
                    <td className="text-slate-500 text-xs">{format(new Date(c.createdAt), 'MMM d, yyyy')}</td>
                    <td>
                      <button
                        onClick={() => toast('Case deletion disabled in demo mode', { icon: '⚠️' })}
                        className="p-1 rounded text-slate-600 hover:text-crimson-400 hover:bg-crimson-400/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {cases.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-slate-600 py-8 text-sm">No cases found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Status */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" /> System Health
          </h3>
          {[
            { service: 'API Server', status: 'Operational', color: 'text-emerald-400', dot: 'bg-emerald-400' },
            { service: 'MongoDB Database', status: 'Operational', color: 'text-emerald-400', dot: 'bg-emerald-400' },
            { service: 'AI Engine (Mock)', status: 'Operational', color: 'text-emerald-400', dot: 'bg-emerald-400' },
            { service: 'File Storage', status: 'Operational', color: 'text-emerald-400', dot: 'bg-emerald-400' },
            { service: 'WebSocket', status: 'Not configured', color: 'text-amber-400', dot: 'bg-amber-400' },
          ].map(({ service, status, color, dot }) => (
            <div key={service} className="flex items-center justify-between py-1">
              <span className="text-sm text-slate-300">{service}</span>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${dot} animate-pulse`} />
                <span className={`text-xs font-medium ${color}`}>{status}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyber-400" /> Quick Admin Actions
          </h3>
          <div className="space-y-2">
            {[
              { label: 'Export All Cases (CSV)', desc: 'Download all case data' },
              { label: 'Clear AI Chat History', desc: 'Remove all chat sessions' },
              { label: 'Rebuild Network Graph', desc: 'Re-compute entity relationships' },
              { label: 'Force Re-seed Database', desc: 'Reset demo data' },
            ].map(({ label, desc }) => (
              <button key={label}
                onClick={() => toast(`"${label}" — Feature available in production build`, { icon: 'ℹ️' })}
                className="w-full text-left p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-cyber-600/40 hover:bg-slate-800 transition-all">
                <div className="text-sm font-medium text-slate-200">{label}</div>
                <div className="text-xs text-slate-500">{desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
