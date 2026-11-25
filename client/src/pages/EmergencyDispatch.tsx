import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { smsAPI } from '../api'
import SosBroadcastModal from '../components/SosBroadcastModal'
import {
  Radio, Send, ShieldAlert, Users, PhoneCall, CheckCircle2, AlertTriangle,
  History, Clock, FileText, CheckCircle, RefreshCw, Siren, BellRing, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface DispatchItem {
  _id: string
  dispatchId: string
  title: string
  recipientGroup: string
  message: string
  priority: string
  status: string
  totalRecipients: number
  deliveredCount: number
  failedCount: number
  sentAt: string
  carrierResponse?: {
    gateway: string
    messageId: string
    deliveryRatePercent: number
    latencyMs: number
  }
}

export default function EmergencyDispatchPage() {
  const queryClient = useQueryClient()

  // Composer Form States
  const [title, setTitle] = useState('')
  const [recipientGroup, setRecipientGroup] = useState('ALL_UNITS')
  const [priority, setPriority] = useState('HIGH')
  const [message, setMessage] = useState('')
  const [customNumbers, setCustomNumbers] = useState('')
  const [sosModalOpen, setSosModalOpen] = useState(false)

  // Fetch dispatch history
  const { data: historyRes, isLoading: historyLoading, refetch } = useQuery({
    queryKey: ['sms-history'],
    queryFn: () => smsAPI.getHistory(),
    refetchInterval: 10000,
  })

  // Fetch templates
  const { data: templatesRes } = useQuery({
    queryKey: ['sms-templates'],
    queryFn: () => smsAPI.getTemplates(),
  })

  // Fetch recipient contacts
  const { data: contactsRes } = useQuery({
    queryKey: ['sms-contacts'],
    queryFn: () => smsAPI.getContacts(),
  })

  const history: DispatchItem[] = Array.isArray(historyRes?.data?.data)
    ? historyRes.data.data
    : Array.isArray(historyRes?.data)
    ? historyRes.data
    : []
  const templates = Array.isArray(templatesRes?.data?.data)
    ? templatesRes.data.data
    : Array.isArray(templatesRes?.data)
    ? templatesRes.data
    : []
  const contactGroups = Array.isArray(contactsRes?.data?.data)
    ? contactsRes.data.data
    : Array.isArray(contactsRes?.data)
    ? contactsRes.data
    : []

  // Send SMS Mutation
  const sendMutation = useMutation({
    mutationFn: (data: any) => smsAPI.send(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['sms-history'] })
      toast.success(`Dispatch successfully delivered to ${res.data.data.deliveredCount} recipients!`, {
        icon: '📡',
      })
      setTitle('')
      setMessage('')
      setCustomNumbers('')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to transmit dispatch')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message cannot be blank')
      return
    }

    const phoneArr = customNumbers
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)

    sendMutation.mutate({
      title,
      recipientGroup,
      message,
      priority,
      phoneNumbers: phoneArr,
    })
  }

  const handleApplyTemplate = (tpl: any) => {
    setTitle(tpl.title)
    setMessage(tpl.text)
    setPriority(tpl.priority)
    setRecipientGroup(tpl.recipientGroup)
    toast.success(`Template applied: ${tpl.title}`, { icon: '📋' })
  }

  // Recipient stats
  const totalDeliveredAllTime = history.reduce((acc, curr) => acc + curr.deliveredCount, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-crimson-400 mb-1">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>CRIMEVERSE EMERGENCY MULTI-CHANNEL TELECOM & TACTICAL DISPATCH</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            Emergency SMS & Alert Dispatch Hub
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
              GATEWAY READY
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Broadcast emergency advisories, APB suspect lookouts, SWAT mobilization alerts, and geo-fenced public safety warnings.
          </p>
        </div>

        <button
          onClick={() => setSosModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-crimson-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-red-950/60 transition-all active:scale-95 animate-pulse"
        >
          <Siren className="w-4 h-4" />
          1-Click Emergency SOS Lockdown
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Total SMS Broadcasts Sent</div>
          <div className="text-2xl font-black text-white">{history.length}</div>
          <div className="text-[11px] text-cyber-400 font-mono">100% Audit logged</div>
        </div>

        <div className="card p-4 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Delivered Recipients</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{totalDeliveredAllTime}</div>
          <div className="text-[11px] text-emerald-400/80 font-mono">98.8% Avg delivery rate</div>
        </div>

        <div className="card p-4 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Active Tactical Personnel</div>
          <div className="text-2xl font-black text-cyan-400 font-mono">76 Units</div>
          <div className="text-[11px] text-slate-400 font-mono">SWAT, Patrol, Cyber Wing</div>
        </div>

        <div className="card p-4 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Average Telecom Latency</div>
          <div className="text-2xl font-black text-amber-400 font-mono">92 ms</div>
          <div className="text-[11px] text-slate-400 font-mono">Gov-Priority-0 Carrier Link</div>
        </div>
      </div>

      {/* Main Grid: Composer & Templates (Left 2 cols), Carrier Stream (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Composer Form & Templates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pre-Built Law Enforcement Templates */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Pre-Approved Law Enforcement Alert Templates
              </h3>
              <span className="text-[11px] text-slate-500">Click to load</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {templates.map((tpl: any) => (
                <button
                  key={tpl.id}
                  onClick={() => handleApplyTemplate(tpl)}
                  className="text-left p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyber-500/50 hover:bg-slate-850/80 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white group-hover:text-cyber-300 transition-colors">
                      {tpl.title}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        tpl.priority === 'CRITICAL_SOS'
                          ? 'bg-crimson-500/20 text-crimson-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {tpl.priority.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{tpl.text}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Dispatch Composer Form */}
          <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-cyber-600/30 rounded-2xl p-6 space-y-5 shadow-glass">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-cyber-400" />
                Compose Tactical Broadcast
              </h3>
              <span className="text-xs text-slate-400 font-mono">PRIORITY QUEUE: CLEAR</span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Alert Title */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Broadcast Directive Title <span className="text-crimson-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., ALL UNITS APB: High-Risk Fugitive Sighting"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyber-500"
                />
              </div>

              {/* Recipient Group & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Target Recipient Group</label>
                  <select
                    value={recipientGroup}
                    onChange={(e) => setRecipientGroup(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyber-500"
                  >
                    <option value="ALL_UNITS">All Active Units (76 Tactical Personnel)</option>
                    <option value="TACTICAL_SWAT">Tactical SWAT Response Teams (16 Personnel)</option>
                    <option value="FIELD_PATROL">Field Beat & Highway Patrol Units (48 Units)</option>
                    <option value="CYBER_CELL">Special Cyber & Financial Crimes Wing (12 Specialists)</option>
                    <option value="CITIZEN_ALERT">Geo-Fenced Citizen Safety Network (2,450 Citizens)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Dispatch Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyber-500 font-bold"
                  >
                    <option value="CRITICAL_SOS">CRITICAL SOS (Bypass Silent Modes / Immediate Sirens)</option>
                    <option value="HIGH">HIGH PRIORITY (Field Advisory / Urgent Response)</option>
                    <option value="ROUTINE">ROUTINE (Standard Informational Briefing)</option>
                  </select>
                </div>
              </div>

              {/* Message Body */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-bold">
                    Official SMS Message Text <span className="text-crimson-400">*</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {message.length} chars • {Math.ceil(message.length / 160) || 1} SMS Segment(s)
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter the official law enforcement message to be relayed via carrier SMS broadcast..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyber-500 resize-none leading-relaxed"
                />
              </div>

              {/* Optional Phone Override */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Optional Direct Number Overrides (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="+919876543210, +919123456789"
                  value={customNumbers}
                  onChange={(e) => setCustomNumbers(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyber-500"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Telecom carrier handshake ready
              </span>

              <button
                type="submit"
                disabled={sendMutation.isPending}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyber-600 to-blue-600 hover:from-cyber-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyber-950 transition-all disabled:opacity-50"
              >
                <Send className={`w-4 h-4 ${sendMutation.isPending ? 'animate-spin' : ''}`} />
                {sendMutation.isPending ? 'TRANSMITTING DISPATCH...' : 'TRANSMIT TACTICAL SMS DISPATCH'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Active Roster & Telecom Node Status */}
        <div className="space-y-5">
          {/* Recipient Groups Info */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-cyber-400" />
              Tactical Roster Directory
            </h3>

            <div className="space-y-2.5">
              {contactGroups.map((g: any) => (
                <div key={g.key} className="p-3 rounded-xl bg-slate-950/70 border border-slate-850 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{g.label}</span>
                    <span className="font-mono text-cyan-400 font-bold">{g.activeCount} Units</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{g.description}</p>
                  <div className="text-[10px] font-mono text-emerald-400">
                    Est. Response: ~{g.avgResponseMinutes} mins
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Telecom Node Health */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gateway Telemetry</h4>
            <div className="flex justify-between text-slate-400">
              <span>Primary Gateway:</span>
              <span className="text-emerald-400">GOV-PRIORITY-0</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Failover Node:</span>
              <span className="text-slate-300">GSM-RADIO-CELL-02</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Delivery Protocol:</span>
              <span className="text-cyber-400">SMPP v3.4 Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dispatch History Audit Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyber-400" />
            <h3 className="text-sm font-bold text-white">Historical Dispatch Transmission Audit Log</h3>
          </div>
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {historyLoading ? (
          <div className="py-8 text-center text-slate-500 text-xs">Loading transmission records...</div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">No dispatch records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] font-mono text-slate-400 uppercase border-b border-slate-800 bg-slate-950/40">
                <tr>
                  <th className="py-2.5 px-3">Dispatch ID</th>
                  <th className="py-2.5 px-3">Directive Title</th>
                  <th className="py-2.5 px-3">Target Group</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Delivered</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {history.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-cyber-400">{d.dispatchId}</td>
                    <td className="py-3 px-3 font-sans font-semibold text-white max-w-xs truncate">
                      {d.title}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{d.recipientGroup}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.priority === 'CRITICAL_SOS'
                            ? 'bg-crimson-500/20 text-crimson-400 border border-crimson-500/40'
                            : d.priority === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {d.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">
                      {d.deliveredCount}/{d.totalRecipients}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {format(new Date(d.sentAt), 'MMM dd, HH:mm:ss')}
                    </td>
                    <td className="py-3 px-3">
                      <span className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Global SOS Lockdown Modal */}
      <SosBroadcastModal isOpen={sosModalOpen} onClose={() => setSosModalOpen(false)} />
    </div>
  )
}
