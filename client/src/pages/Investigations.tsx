import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { casesAPI } from '../api'
import { Plus, Search, Filter, ChevronRight, AlertTriangle, Calendar, Shield } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const statusColors: Record<string, string> = { OPEN: 'status-open', ACTIVE: 'status-active', CLOSED: 'status-closed', PENDING_REVIEW: 'status-pending', ARCHIVED: 'status-closed' }
const priorityColors: Record<string, string> = { CRITICAL: 'badge-critical', HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' }

function NewCaseModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', tags: '' })

  const mutation = useMutation({
    mutationFn: (data: any) => casesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast.success('Investigation created successfully')
      onClose()
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create case'),
  })

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-lg p-6">
        <h2 className="text-lg font-bold text-white mb-5">New Investigation</h2>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }) }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Case Title *</label>
            <input className="input" placeholder="Operation Alpha" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description *</label>
            <textarea className="textarea" rows={3} placeholder="Brief description of the investigation..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Priority</label>
              <select className="select" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Tags (comma-separated)</label>
              <input className="input" placeholder="fraud, crypto" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 justify-center">
              {mutation.isPending ? <><div className="spinner w-4 h-4" /> Creating...</> : 'Create Investigation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function InvestigationsPage() {
  const navigate = useNavigate()
  const [showNewCase, setShowNewCase] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['cases', { search, status: statusFilter, priority: priorityFilter }],
    queryFn: () => casesAPI.getAll({ search: search || undefined, status: statusFilter || undefined, priority: priorityFilter || undefined }),
  })

  const cases = data?.data?.data || []

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Investigations</h1>
          <p className="page-subtitle">{data?.data?.pagination?.total || 0} total investigation(s)</p>
        </div>
        <button onClick={() => setShowNewCase(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Investigation
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input className="input pl-9" placeholder="Search investigations..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {['OPEN', 'ACTIVE', 'PENDING_REVIEW', 'CLOSED', 'ARCHIVED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="select w-auto" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="">All Priority</option>
          {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Cases grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40"><div className="spinner w-8 h-8" /></div>
      ) : cases.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Shield className="w-8 h-8" /></div>
          <p className="text-slate-300 font-medium">No investigations found</p>
          <p className="text-slate-500 text-sm mt-1">Create your first investigation to get started</p>
          <button onClick={() => setShowNewCase(true)} className="btn-primary mt-4"><Plus className="w-4 h-4" /> New Investigation</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cases.map((c: any) => (
            <button key={c._id} onClick={() => navigate(`/investigations/${c._id}`)}
              className="card p-5 text-left hover:border-cyber-600/50 hover:scale-[1.01] transition-all duration-200 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-2 flex-wrap">
                  <span className={statusColors[c.status] || 'badge-info'}>{c.status}</span>
                  <span className={priorityColors[c.priority] || 'badge-info'}>{c.priority}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyber-400 transition-colors flex-shrink-0" />
              </div>
              <h3 className="font-bold text-slate-100 mb-1 truncate">{c.title}</h3>
              <p className="text-xs font-mono text-slate-500 mb-2">{c.caseId}</p>
              <p className="text-sm text-slate-400 line-clamp-2 mb-3">{c.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(c.lastActivityAt || c.updatedAt), 'MMM d')}</span>
                <div className="flex items-center gap-3">
                  {c.alertCount > 0 && <span className="text-crimson-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{c.alertCount}</span>}
                  <span className="text-slate-400">{c.entityCount} entities</span>
                  <div className={`font-bold ${c.riskScore >= 70 ? 'text-crimson-400' : c.riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    Risk: {c.riskScore}
                  </div>
                </div>
              </div>
              {c.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {c.tags.slice(0, 3).map((t: string) => <span key={t} className="tag">{t}</span>)}
                  {c.tags.length > 3 && <span className="tag">+{c.tags.length - 3}</span>}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {showNewCase && <NewCaseModal onClose={() => setShowNewCase(false)} />}
    </div>
  )
}
