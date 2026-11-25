import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Send, 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  AlertOctagon, 
  UserCheck, 
  MessageSquare, 
  Filter, 
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { escalationsAPI } from '../api';
import { useActiveCase } from '../context/CaseContext';
import { useLanguage } from '../context/LanguageContext';

interface EscalationItem {
  _id: string;
  caseId: {
    _id: string;
    caseNumber: string;
    title: string;
  } | string;
  requestedBy: {
    name: string;
    role: string;
  } | string;
  reason: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'ACCEPTED' | 'RESOLVED' | 'RETURNED';
  notes?: string;
  supervisorNotes?: string;
  reviewedBy?: {
    name: string;
    role: string;
  } | string;
  createdAt: string;
  resolvedAt?: string;
}

const Escalations: React.FC = () => {
  const { activeCase, cases } = useActiveCase();
  const { t } = useLanguage();

  const [escalations, setEscalations] = useState<EscalationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<EscalationItem | null>(null);

  // New Escalation Ticket Form
  const [showNewModal, setShowNewModal] = useState(false);
  const [ticketReason, setTicketReason] = useState('HIGH_RISK_THRESHOLD');
  const [ticketPriority, setTicketPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');
  const [ticketNotes, setTicketNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Supervisor Response Form
  const [respStatus, setRespStatus] = useState<'ACCEPTED' | 'RESOLVED' | 'RETURNED'>('ACCEPTED');
  const [respNotes, setRespNotes] = useState('');
  const [responding, setResponding] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchEscalations = async () => {
    try {
      setLoading(true);
      const res = await escalationsAPI.getAll();
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setEscalations(list);
      if (list && list.length > 0) {
        setSelectedItem(list[0]);
      } else {
        setSelectedItem(null);
      }
    } catch (err) {
      console.error('Failed to load escalations:', err);
      setEscalations([]);
      setSelectedItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const caseId = activeCase?._id || (cases.length > 0 ? cases[0]._id : '');
    if (!caseId) return;

    try {
      setSubmitting(true);
      const res = await escalationsAPI.create({
        caseId,
        reason: ticketReason,
        priority: ticketPriority,
        notes: ticketNotes,
      });
      const created = res.data?.data || res.data;
      setEscalations(prev => [created, ...prev]);
      setSelectedItem(created);
      setShowNewModal(false);
      setTicketNotes('');
      setActionSuccess('Escalation ticket dispatched to command supervisor queue.');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      console.error('Failed to create escalation ticket:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSupervisorResponse = async () => {
    if (!selectedItem) return;
    try {
      setResponding(true);
      const res = await escalationsAPI.respond(selectedItem._id, {
        status: respStatus,
        supervisorNotes: respNotes || 'Supervisor action logged.',
      });

      const updated = res.data?.data || res.data;
      setEscalations(prev => prev.map(item => item._id === selectedItem._id ? updated : item));
      setSelectedItem(updated);
      setRespNotes('');
      setActionSuccess(`Ticket updated to ${respStatus}`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      console.error('Failed to respond to escalation:', err);
    } finally {
      setResponding(false);
    }
  };

  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-950 text-red-400 border border-red-800 animate-pulse">URGENT</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-950 text-amber-400 border border-amber-800">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-950 text-yellow-300 border border-yellow-800">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-950 text-blue-400 border border-blue-800">LOW</span>;
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'ACCEPTED':
        return <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-800">ACCEPTED</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">RESOLVED</span>;
      case 'RETURNED':
        return <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">RETURNED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-yellow-950 text-yellow-400 border border-yellow-800">PENDING REVIEW</span>;
    }
  };

  const filteredEscalations = escalations.filter(item => {
    if (statusFilter === 'ALL') return true;
    return item.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-amber-400" />
            {t('escalations')} & Supervisor Queue
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Formal command-chain escalation portal. Route high-risk anomalies, cross-jurisdiction warrants, and evidence contradictions to supervising officers.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-sm transition shadow-lg shadow-amber-950/40"
        >
          <Plus className="h-4 w-4" />
          Escalate Current Case
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {actionSuccess}
        </div>
      )}

      {/* New Escalation Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateTicket}
            className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-400" />
                Dispatch Escalation to Command
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <span className="text-slate-500">Target Case:</span>{' '}
              <strong className="text-cyan-400">{activeCase?.caseNumber || 'Active Target'}</strong> - {activeCase?.title}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Reason for Escalation *
              </label>
              <select
                value={ticketReason}
                onChange={e => setTicketReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="HIGH_RISK_THRESHOLD">High Risk Score Threshold Exceeded</option>
                <option value="CONTRADICTORY_EVIDENCE">Major Unresolved Evidence Contradiction</option>
                <option value="JURISDICTION_CONFLICT">Multi-Jurisdictional / Inter-Agency Conflict</option>
                <option value="UNRESOLVED_LEAD">High Priority Unresolved Lead</option>
                <option value="RESOURCE_REQUEST">Tactical Forensic / Intercept Resource Request</option>
                <option value="MANUAL_SUPERVISOR_REVIEW">Discretionary Supervisor Review</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Priority Tier *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTicketPriority(p)}
                    className={`py-2 text-xs font-bold rounded-lg border transition ${
                      ticketPriority === p
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
                Investigator Case Notes & Justification *
              </label>
              <textarea
                required
                rows={3}
                placeholder="State specific evidentiary reasons requiring supervisor sign-off or authorization..."
                value={ticketNotes}
                onChange={e => setTicketNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                {submitting ? 'Transmitting...' : 'Dispatch Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Escalation Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tickets Queue */}
        <div className="lg:col-span-5 space-y-3">
          {/* Status filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['ALL', 'PENDING', 'ACCEPTED', 'RESOLVED', 'RETURNED'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  statusFilter === st
                    ? 'bg-amber-600 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-xl">
              <Clock className="h-6 w-6 text-amber-400 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading supervisor docket...</p>
            </div>
          ) : filteredEscalations.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-xl">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-200">No Escalations Found</p>
              <p className="text-xs text-slate-400 mt-1">Queue is clear for this filter status.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
              {filteredEscalations.map(item => {
                const isSelected = selectedItem?._id === item._id;
                const caseObj = typeof item.caseId === 'object' ? item.caseId : null;

                return (
                  <div
                    key={item._id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition text-left ${
                      isSelected
                        ? 'bg-slate-800/90 border-amber-500 shadow-md shadow-amber-950/30'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {getPriorityBadge(item.priority)}
                        {getStatusBadge(item.status)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      {item.reason.replace(/_/g, ' ')}
                    </h4>

                    {caseObj && (
                      <p className="text-xs text-cyan-400 font-mono mt-0.5">
                        {caseObj.caseNumber} - {caseObj.title}
                      </p>
                    )}

                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {item.notes || 'No description notes provided.'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Ticket Inspection & Command Action */}
        <div className="lg:col-span-7 space-y-4">
          {selectedItem ? (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
              {/* Header */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(selectedItem.priority)}
                    {getStatusBadge(selectedItem.status)}
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    Docket ID: {selectedItem._id.slice(-8)}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-white mt-2">
                  {selectedItem.reason.replace(/_/g, ' ')}
                </h2>

                <div className="mt-2 text-xs text-slate-300">
                  {typeof selectedItem.caseId === 'object' && (
                    <p className="font-mono text-cyan-400">
                      Case: {selectedItem.caseId.caseNumber} - {selectedItem.caseId.title}
                    </p>
                  )}
                </div>
              </div>

              {/* Investigator notes */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Investigator Filing Brief:
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {selectedItem.notes || 'No notes entered.'}
                </p>
                <div className="text-[10px] text-slate-500 pt-1 font-mono">
                  Filed: {new Date(selectedItem.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Supervisor Recorded Directives */}
              {selectedItem.supervisorNotes && (
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5" />
                      Command Supervisor Directive
                    </span>
                    {selectedItem.resolvedAt && (
                      <span className="text-[10px] text-amber-400/80 font-mono">
                        {new Date(selectedItem.resolvedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-200">{selectedItem.supervisorNotes}</p>
                </div>
              )}

              {/* Supervisor Action Console */}
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-900/30 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <AlertOctagon className="h-4 w-4" />
                  Command Supervisor Disposition Console
                </h4>

                <div className="grid grid-cols-3 gap-2">
                  {(['ACCEPTED', 'RESOLVED', 'RETURNED'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setRespStatus(st)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${
                        respStatus === st
                          ? 'bg-amber-600 border-amber-500 text-slate-950 shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  placeholder="Record supervisor directions (e.g., 'Authorize secondary surveillance warrant' or 'Request re-interrogation with forensic alibi checks')..."
                  value={respNotes}
                  onChange={e => setRespNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    Will update case docket and notify lead investigator.
                  </span>
                  <button
                    onClick={handleSupervisorResponse}
                    disabled={responding}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 transition disabled:opacity-50"
                  >
                    {responding ? 'Logging Directive...' : 'Commit Command Directive'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
              <ShieldAlert className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-300">Select an Escalation Ticket</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Choose a ticket from the left queue to review investigator justification and issue formal supervisory orders.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Escalations;
