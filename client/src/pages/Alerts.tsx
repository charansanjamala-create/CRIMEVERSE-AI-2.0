import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { alertsAPI } from '../api'
import { Bell, AlertTriangle, CheckCircle, X, Filter } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const sevColor: Record<string, string> = { CRITICAL: 'text-crimson-400 border-crimson-600/30', HIGH: 'text-orange-400 border-orange-600/30', WARNING: 'text-amber-400 border-amber-600/30', INFO: 'text-cyber-400 border-cyber-600/30' }
const sevBg: Record<string, string> = { CRITICAL: 'bg-crimson-600/5', HIGH: 'bg-orange-600/5', WARNING: 'bg-amber-600/5', INFO: 'bg-cyber-600/5' }

export default function AlertsPage() {
  const queryClient = useQueryClient()
  const [severityFilter, setSeverityFilter] = useState('')
  const [readFilter, setReadFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['alerts', severityFilter, readFilter],
    queryFn: () => alertsAPI.getAll({ severity: severityFilter || undefined, isRead: readFilter || undefined, limit: 100 }),
  })

  const markRead = useMutation({
    mutationFn: (id: string) => alertsAPI.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  })

  const markAllRead = useMutation({
    mutationFn: () => alertsAPI.markAllRead(),
    onSuccess: () => { toast.success('All alerts marked as read'); queryClient.invalidateQueries({ queryKey: ['alerts'] }) },
  })

  const acknowledge = useMutation({
    mutationFn: (id: string) => alertsAPI.acknowledge(id),
    onSuccess: () => { toast.success('Alert acknowledged'); queryClient.invalidateQueries({ queryKey: ['alerts'] }) },
  })

  const alerts = data?.data?.data || []
  const unread = alerts.filter((a: any) => !a.isRead).length

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-crimson-600 to-rose-700 flex items-center justify-center">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <h1 className="page-title">Alerts</h1>
          </div>
          <p className="page-subtitle">{unread} unread alert{unread !== 1 ? 's' : ''} of {alerts.length} total</p>
        </div>
        {unread > 0 && (
          <button onClick={() => markAllRead.mutate()} className="btn-secondary text-sm">
            <CheckCircle className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <select className="select w-auto" value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
          <option value="">All Severity</option>
          {['CRITICAL', 'HIGH', 'WARNING', 'INFO'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="select w-auto" value={readFilter} onChange={e => setReadFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40"><div className="spinner w-8 h-8" /></div>
      ) : alerts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Bell className="w-8 h-8" /></div>
          <p className="text-slate-300 font-medium">No alerts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a: any) => (
            <div key={a._id} className={`card p-4 flex items-start gap-4 border ${sevColor[a.severity] || ''} ${sevBg[a.severity] || ''} ${!a.isRead ? 'border-l-4' : ''}`}>
              <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${sevColor[a.severity]?.split(' ')[0] || 'text-slate-400'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-200 text-sm">{a.title}</span>
                  {!a.isRead && <span className="w-2 h-2 bg-cyber-500 rounded-full flex-shrink-0" />}
                  <span className={`badge text-[10px] ml-auto ${a.severity === 'CRITICAL' ? 'badge-critical' : a.severity === 'HIGH' ? 'badge-high' : 'badge-medium'}`}>{a.severity}</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{a.message}</p>
                <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-600">
                  <span>Source: {a.source}</span>
                  <span>{format(new Date(a.createdAt), 'MMM d, yyyy HH:mm')}</span>
                  {a.isAcknowledged && <span className="text-emerald-400">✓ Acknowledged</span>}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!a.isRead && (
                  <button onClick={() => markRead.mutate(a._id)} className="p-1.5 rounded text-slate-500 hover:text-cyber-400 hover:bg-slate-700/50" title="Mark read">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                {!a.isAcknowledged && (
                  <button onClick={() => acknowledge.mutate(a._id)} className="text-xs px-2 py-1 rounded border border-slate-700/50 text-slate-400 hover:text-emerald-400 hover:border-emerald-600/30 transition-colors">
                    Ack
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
