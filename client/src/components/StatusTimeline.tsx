import React from 'react';
import {
  FileText,
  Search,
  Zap,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Shield,
} from 'lucide-react';

export type ComplaintStepStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'INVESTIGATION_STARTED'
  | 'EVIDENCE_REVIEW'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'CLOSED';

interface Props {
  currentStatus: ComplaintStepStatus | string;
  statusHistory?: Array<{
    status: string;
    updatedBy: string;
    notes?: string;
    timestamp: string | Date;
  }>;
}

const STEPS: {
  id: ComplaintStepStatus;
  label: string;
  icon: any;
  desc: string;
}[] = [
  {
    id: 'SUBMITTED',
    label: 'Submitted',
    icon: FileText,
    desc: 'Intake registration recorded',
  },
  {
    id: 'UNDER_REVIEW',
    label: 'Under Review',
    icon: Search,
    desc: 'Preliminary screening & jurisdiction verify',
  },
  {
    id: 'INVESTIGATION_STARTED',
    label: 'Investigation Started',
    icon: Zap,
    desc: 'Assigned to investigation officer',
  },
  {
    id: 'EVIDENCE_REVIEW',
    label: 'Evidence Review',
    icon: FileCheck,
    desc: 'Forensic & intelligence correlation',
  },
  {
    id: 'ESCALATED',
    label: 'Escalated',
    icon: AlertTriangle,
    desc: 'Transferred for supervisor oversight',
  },
  {
    id: 'RESOLVED',
    label: 'Resolved / Closed',
    icon: CheckCircle2,
    desc: 'Investigation concluded & action taken',
  },
];

const getStepOrder = (status: string): number => {
  const norm = status?.toUpperCase();
  if (norm === 'SUBMITTED') return 0;
  if (norm === 'UNDER_REVIEW') return 1;
  if (norm === 'INVESTIGATION_STARTED') return 2;
  if (norm === 'EVIDENCE_REVIEW') return 3;
  if (norm === 'ESCALATED') return 4;
  if (norm === 'RESOLVED' || norm === 'CLOSED') return 5;
  return 0;
};

export default function StatusTimeline({ currentStatus, statusHistory = [] }: Props) {
  const currentStepIdx = getStepOrder(currentStatus);

  return (
    <div className="space-y-6">
      {/* Visual Stepper */}
      <div className="relative">
        <div className="hidden md:flex items-center justify-between w-full relative z-10">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center text-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                    isCompleted
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-950/60'
                      : isCurrent
                      ? 'bg-cyber-600 border-cyber-400 text-white shadow-lg shadow-cyber-600/40 animate-pulse'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`mt-2 text-xs font-bold ${
                    isCurrent
                      ? 'text-cyber-400'
                      : isCompleted
                      ? 'text-emerald-400'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[10px] text-slate-500 max-w-[120px] line-clamp-1">
                  {step.desc}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress line between steps for desktop */}
        <div className="hidden md:block absolute top-5 left-10 right-10 h-0.5 bg-slate-800 -z-0">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-cyber-500 to-purple-500 transition-all duration-500"
            style={{ width: `${Math.min(100, (currentStepIdx / (STEPS.length - 1)) * 100)}%` }}
          />
        </div>

        {/* Mobile vertical stepper */}
        <div className="md:hidden space-y-3">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`p-3 rounded-lg border flex items-center gap-3 ${
                  isCurrent
                    ? 'bg-cyber-600/20 border-cyber-500 text-white'
                    : isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-cyber-600 text-white'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold">{step.label}</div>
                  <div className="text-[10px] text-slate-400">{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Chronological Event History */}
      {statusHistory.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-cyber-400" />
            Official Action History & Remarks
          </h4>

          <div className="space-y-2.5">
            {statusHistory.map((item, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-info text-[10px]">{item.status}</span>
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {item.updatedBy}
                    </span>
                  </div>
                  {item.notes && <p className="text-slate-300 mt-1">{item.notes}</p>}
                </div>
                <span className="text-[10px] text-slate-500 whitespace-nowrap font-mono">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
