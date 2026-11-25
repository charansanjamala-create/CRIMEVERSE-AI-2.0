import React, { useState } from 'react';
import { ShieldCheck, HelpCircle, Sparkles, AlertCircle, Eye, Info } from 'lucide-react';

export type TransparencyStatus =
  | 'VERIFIED'
  | 'REPORTED'
  | 'AI_INFERRED'
  | 'HYPOTHETICAL'
  | 'UNKNOWN';

interface Props {
  status: TransparencyStatus | string;
  confidence?: number;
  confidenceScore?: number;
  evidenceUsedCount?: number;
  assumptionsCount?: number;
  disclaimer?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

const statusConfig: Record<
  TransparencyStatus,
  { label: string; icon: any; badgeClass: string; desc: string }
> = {
  VERIFIED: {
    label: 'VERIFIED',
    icon: ShieldCheck,
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40',
    desc: 'Corroborated by authenticated forensic, physical or legal evidence.',
  },
  REPORTED: {
    label: 'REPORTED',
    icon: Eye,
    badgeClass: 'bg-cyber-500/15 text-cyber-400 border border-cyber-500/40',
    desc: 'Submitted by citizen, officer or witness testimony. Under active validation.',
  },
  AI_INFERRED: {
    label: 'AI-INFERRED',
    icon: Sparkles,
    badgeClass: 'bg-purple-500/15 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-950/50',
    desc: 'Generated via machine learning heuristics & graph correlation. Human verification mandatory.',
  },
  HYPOTHETICAL: {
    label: 'HYPOTHETICAL / SIMULATION',
    icon: AlertCircle,
    badgeClass: 'bg-amber-500/15 text-amber-300 border border-dashed border-amber-500/60',
    desc: 'What-If investigative scenario. Does NOT represent confirmed ground truth facts.',
  },
  UNKNOWN: {
    label: 'UNKNOWN / UNCONFIRMED',
    icon: HelpCircle,
    badgeClass: 'bg-slate-700/40 text-slate-400 border border-slate-600/40',
    desc: 'Insufficient evidentiary telemetry. Additional inquiry required.',
  },
};

export default function AITransparencyBadge({
  status,
  confidence,
  confidenceScore,
  evidenceUsedCount,
  assumptionsCount,
  disclaimer,
  size = 'md',
  showDetails = false,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const effectiveConfidence = confidence !== undefined ? confidence : confidenceScore;


  // Normalize status key
  const normalizedKey = (
    status?.toUpperCase().replace(/[-\s]/g, '_') as TransparencyStatus
  ) in statusConfig
    ? (status.toUpperCase().replace(/[-\s]/g, '_') as TransparencyStatus)
    : 'UNKNOWN';

  const cfg = statusConfig[normalizedKey];
  const Icon = cfg.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  return (
    <>
      <span
        onClick={(e) => {
          e.stopPropagation();
          setModalOpen(true);
        }}
        className={`inline-flex items-center font-bold tracking-wider rounded-md cursor-pointer transition-all hover:scale-105 select-none ${cfg.badgeClass} ${sizeClasses}`}
        title="Click to inspect AI Transparency & Evidentiary Provenance"
      >
        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{cfg.label}</span>
        {effectiveConfidence !== undefined && (
          <span className="opacity-80 font-mono text-[10px] ml-0.5">({effectiveConfidence}%)</span>
        )}
      </span>

      {/* Transparency Details Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="card max-w-md w-full p-5 space-y-4 border border-cyber-600/40 shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-cyber-400" />
                <h3 className="text-base font-bold text-white">AI Transparency & Status</h3>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-bold ${cfg.badgeClass}`}>
                {cfg.label}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <p className="font-semibold text-slate-200 mb-1">Standard Definition:</p>
              {cfg.desc}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {effectiveConfidence !== undefined && (
                <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="text-slate-500 font-semibold uppercase text-[10px]">AI Confidence</div>
                  <div className="text-base font-black text-cyber-400">{effectiveConfidence}%</div>
                </div>
              )}

              {evidenceUsedCount !== undefined && (
                <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="text-slate-500 font-semibold uppercase text-[10px]">Evidentiary Items</div>
                  <div className="text-base font-black text-emerald-400">{evidenceUsedCount} Sources</div>
                </div>
              )}
              {assumptionsCount !== undefined && (
                <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="text-slate-500 font-semibold uppercase text-[10px]">Assumptions Flagged</div>
                  <div className="text-base font-black text-amber-400">{assumptionsCount} Gaps</div>
                </div>
              )}
              <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="text-slate-500 font-semibold uppercase text-[10px]">Audit Requirement</div>
                <div className="text-xs font-bold text-slate-300 mt-1">Human Officer Oversight</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                {disclaimer ||
                  'CRIMEVERSE AI complies with ethical law-enforcement principles: AI inferences provide investigative leads, not legal proof of guilt. All conclusions require sworn human verification.'}
              </span>
            </div>

            <button
              onClick={() => setModalOpen(false)}
              className="w-full btn-secondary text-xs justify-center py-2"
            >
              Close Disclosures
            </button>
          </div>
        </div>
      )}
    </>
  );
}
