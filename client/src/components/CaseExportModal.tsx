import React, { useRef } from 'react';
import {
  Printer,
  FileDown,
  X,
  Shield,
  AlertTriangle,
  MapPin,
  FileCheck,
  Cpu,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  caseDoc?: any;
  caseData?: any;
  entities?: any[];
  locations?: any[];
  evidence?: any[];
  findings?: any[];
  timeline?: any[];
}

export default function CaseExportModal({
  isOpen,
  onClose,
  caseDoc: caseDocProp,
  caseData,
  entities = [],
  locations = [],
  evidence = [],
  findings = [],
  timeline = [],
}: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const caseDoc = caseDocProp || caseData;

  if (!isOpen || !caseDoc) return null;



  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="card max-w-4xl w-full p-6 space-y-6 border border-cyber-600/40 shadow-2xl my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Toolbar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyber-600/20 border border-cyber-500/40 flex items-center justify-center text-cyber-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Case Intelligence Summary Dossier</h3>
              <p className="text-xs text-slate-400">Official export ready for law-enforcement review</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="btn-primary text-xs py-1.5 px-3">
              <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div
          ref={printRef}
          className="print-dossier overflow-y-auto pr-2 space-y-6 text-slate-200 text-xs leading-relaxed"
        >
          {/* Header Emblem & Confidentiality Watermark */}
          <div className="border-b-2 border-slate-700 pb-4 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xl font-black tracking-wider text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyber-400" />
                CRIMEVERSE AI 2.0
              </div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                OFFICIAL LAW ENFORCEMENT INVESTIGATION SUMMARY DOSSIER
              </div>
            </div>
            <div className="text-right font-mono text-[11px] text-slate-400">
              <div>Ref: {caseDoc.caseId}</div>
              <div>Generated: {format(new Date(), 'yyyy-MM-dd HH:mm')}</div>
              <div className="text-amber-400 font-bold uppercase tracking-wider">RESTRICTED USE</div>
            </div>
          </div>

          {/* AI Disclosure Warning Banner */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              <strong>LEGAL NOTICE & AI TRANSPARENCY:</strong> This document contains machine-learning
              inferences marked with <code className="font-bold">[AI-INFERRED]</code> or{' '}
              <code className="font-bold">[HYPOTHETICAL]</code>. All hypotheses and risk scores are
              investigative decision-support indicators and do NOT constitute proof of guilt without
              corroborated human evidence.
            </span>
          </div>

          {/* Case Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Case ID</div>
              <div className="font-mono text-sm font-bold text-white">{caseDoc.caseId}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Case Status</div>
              <div className="font-bold text-white">{caseDoc.status}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Priority</div>
              <div className="font-bold text-white">{caseDoc.priority}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Case Risk Score</div>
              <div className="text-base font-black text-crimson-400">{caseDoc.riskScore}/100</div>
            </div>
          </div>

          {/* Overview */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-100 uppercase tracking-wider text-xs border-b border-slate-800 pb-1">
              Case Description & Intelligence Objectives
            </h4>
            <p className="text-slate-300 whitespace-pre-line">{caseDoc.description}</p>
          </div>

          {/* Structured Locations */}
          {locations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-100 uppercase tracking-wider text-xs border-b border-slate-800 pb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyber-400" />
                Structured Case Locations ({locations.length})
              </h4>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                    <th className="py-1">Location Name</th>
                    <th className="py-1">Category</th>
                    <th className="py-1">Address</th>
                    <th className="py-1">Coordinates</th>
                    <th className="py-1">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {locations.map((loc) => (
                    <tr key={loc._id}>
                      <td className="py-1.5 font-medium text-slate-200">{loc.name}</td>
                      <td className="py-1.5 text-slate-400">{loc.locationType}</td>
                      <td className="py-1.5 text-slate-300">{loc.address}, {loc.city}</td>
                      <td className="py-1.5 font-mono text-[10px] text-slate-400">
                        {loc.coordinates?.lat?.toFixed(4)}, {loc.coordinates?.lng?.toFixed(4)}
                      </td>
                      <td className="py-1.5">
                        <span className="badge badge-info text-[9px]">{loc.verificationStatus}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Entities Index */}
          {entities.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-100 uppercase tracking-wider text-xs border-b border-slate-800 pb-1">
                Connected Intelligence Entities ({entities.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {entities.map((e) => (
                  <div key={e._id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white truncate">{e.name}</span>
                      <span className="badge text-[9px] bg-slate-800">{e.type}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{e.identifier}</div>
                    <div className="text-[10px] text-slate-500">Risk Level: {e.riskLevel} ({e.riskScore})</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Findings & Challenge AI Audit */}
          {findings.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-100 uppercase tracking-wider text-xs border-b border-slate-800 pb-1 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                AI Inferences & Challenge AI Audit Log ({findings.length})
              </h4>
              <div className="space-y-2.5">
                {findings.map((f) => (
                  <div key={f._id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white text-xs">{f.title}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-purple-300">Confidence: {f.confidence}%</span>
                        <span className="badge badge-info text-[9px]">{f.verificationStatus}</span>
                      </div>
                    </div>
                    <p className="text-slate-300">{f.finding}</p>

                    {f.contradictingEvidence?.length > 0 && (
                      <div className="text-[11px] text-rose-300 bg-rose-950/20 p-2 rounded border border-rose-900/40">
                        <strong>Contradicting Evidentiary Caveats:</strong>
                        <ul className="list-disc list-inside mt-0.5">
                          {f.contradictingEvidence.map((c: string, idx: number) => (
                            <li key={idx}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {f.alternativeExplanations?.length > 0 && (
                      <div className="text-[11px] text-amber-300 bg-amber-950/20 p-2 rounded border border-amber-900/40">
                        <strong>Alternative Non-Incriminating Hypotheses:</strong>
                        <ul className="list-disc list-inside mt-0.5">
                          {f.alternativeExplanations.map((a: string, idx: number) => (
                            <li key={idx}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Ledger */}
          {evidence.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-100 uppercase tracking-wider text-xs border-b border-slate-800 pb-1 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                Evidence Chain of Custody Index ({evidence.length})
              </h4>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                    <th className="py-1">Title</th>
                    <th className="py-1">Type</th>
                    <th className="py-1">Verification</th>
                    <th className="py-1">Uploaded Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {evidence.map((ev) => (
                    <tr key={ev._id}>
                      <td className="py-1.5 font-medium text-slate-200">{ev.title}</td>
                      <td className="py-1.5 text-slate-400">{ev.type}</td>
                      <td className="py-1.5 text-slate-300">{ev.verificationStatus || 'REPORTED'}</td>
                      <td className="py-1.5 text-slate-400 font-mono text-[10px]">
                        {format(new Date(ev.createdAt), 'yyyy-MM-dd')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Signatures & Certification block */}
          <div className="pt-6 border-t-2 border-slate-800 grid grid-cols-2 gap-8 text-[11px] text-slate-400">
            <div className="space-y-8">
              <div>Investigating Officer Signature & Badge:</div>
              <div className="border-b border-slate-700 w-48" />
            </div>
            <div className="space-y-8">
              <div>Supervising Officer Review & Seal:</div>
              <div className="border-b border-slate-700 w-48" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
