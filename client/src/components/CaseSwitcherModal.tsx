import React, { useState } from 'react';
import { useActiveCase } from '../context/CaseContext';
import { useTranslation } from '../context/LanguageContext';
import {
  FolderOpen,
  Search,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

interface CaseSwitcherModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function CaseSwitcherModal({ isOpen: propIsOpen, onClose: propOnClose }: CaseSwitcherModalProps = {}) {
  const {
    activeCaseId,
    setActiveCaseId,
    availableCases,
    isSwitcherOpen,
    setIsSwitcherOpen,
  } = useActiveCase();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const open = propIsOpen !== undefined ? propIsOpen : isSwitcherOpen;
  const handleClose = () => {
    if (propOnClose) propOnClose();
    setIsSwitcherOpen(false);
  };

  if (!open) return null;

  const filteredCases = availableCases.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-switcher-title"
    >
      <div
        className="card max-w-2xl w-full p-6 space-y-4 border border-cyber-600/40 shadow-2xl animate-fade-in"

        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-500 to-purple-600 flex items-center justify-center text-white shadow-cyber">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 id="case-switcher-title" className="text-base font-bold text-white">
                Multi-Case Switcher
              </h2>
              <p className="text-xs text-slate-400">
                Switch between active investigations across all intelligence modules
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSwitcherOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close Case Switcher"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="input pl-9 text-xs"
            placeholder="Search by Case ID or title (e.g., CV-PHOENIX, Hawala, CyberShield)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        {/* Case List */}
        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
          {filteredCases.map((c) => {
            const isActive = c.caseId === activeCaseId || c._id === activeCaseId;
            return (
              <div
                key={c._id || c.caseId}
                onClick={() => {
                  setActiveCaseId(c.caseId);
                  setIsSwitcherOpen(false);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-cyber-600/20 border-cyber-500/70 shadow-md shadow-cyber-950/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="mono text-[11px] font-bold text-cyber-400">
                      {c.caseId}
                    </span>
                    <span
                      className={`badge text-[10px] ${
                        c.priority === 'CRITICAL'
                          ? 'badge-critical'
                          : c.priority === 'HIGH'
                          ? 'badge-high'
                          : 'badge-medium'
                      }`}
                    >
                      {c.priority}
                    </span>
                    <span className="badge text-[10px] bg-slate-800 text-slate-300">
                      {c.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">{c.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{c.description}</p>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-base font-black ${
                        c.riskScore >= 70
                          ? 'text-crimson-400'
                          : c.riskScore >= 40
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {c.riskScore}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      Risk
                    </div>
                  </div>

                  {isActive ? (
                    <div className="w-7 h-7 rounded-full bg-cyber-500 flex items-center justify-center text-white">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : (
                    <button
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-cyber-600 hover:text-white border border-slate-700 transition-colors flex items-center gap-1"
                    >
                      <span>Switch</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredCases.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs">
              No matching investigations found.
            </div>
          )}
        </div>

        {/* Safety isolation footer */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            <strong>Data Isolation Guarantee:</strong> Switching cases strictly segregates network
            entities, maps, evidence logs, and timeline events to prevent cross-case contamination.
          </span>
        </div>
      </div>
    </div>
  );
}
