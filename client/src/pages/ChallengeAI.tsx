import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  HelpCircle, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Sparkles, 
  RotateCw, 
  ChevronRight, 
  Filter, 
  Eye, 
  BookOpen, 
  Info,
  Scale
} from 'lucide-react';
import { challengeAPI } from '../api';
import { useActiveCase } from '../context/CaseContext';
import { useLanguage } from '../context/LanguageContext';
import AITransparencyBadge from '../components/AITransparencyBadge';

interface AlternativeHypothesis {
  title: string;
  plausibility: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  supportingEvidence: string[];
  counterEvidence: string[];
}

interface Finding {
  _id: string;
  caseId: string;
  type: 'CONTRADICTION' | 'ASSUMPTION' | 'GAP' | 'BIAS_RISK' | 'ALTERNATIVE_HYPOTHESIS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  confidenceScore: number;
  contradictoryEvidence?: Array<{
    itemA: string;
    itemB: string;
    explanation: string;
  }>;
  criticalQuestions?: string[];
  alternativeHypotheses?: AlternativeHypothesis[];
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED' | 'INVESTIGATING';
  humanReviews?: Array<{
    reviewer: string;
    status: string;
    notes: string;
    reviewedAt: string;
  }>;
  createdAt: string;
}

const ChallengeAI: React.FC = () => {
  const { activeCase, cases } = useActiveCase();
  const { t } = useLanguage();
  
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  // Hypothesis Generation State
  const [generatingHypothesis, setGeneratingHypothesis] = useState(false);
  const [customContext, setCustomContext] = useState('');
  const [generatedHypotheses, setGeneratedHypotheses] = useState<AlternativeHypothesis[]>([]);

  // Review Form State
  const [reviewStatus, setReviewStatus] = useState<'REVIEWED' | 'DISMISSED' | 'INVESTIGATING'>('REVIEWED');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const effectiveCaseId = activeCase?._id || (cases.length > 0 ? cases[0]._id : '');

  const fetchFindings = async () => {
    if (!effectiveCaseId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await challengeAPI.getByCase(effectiveCaseId);
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setFindings(list);
      if (list && list.length > 0) {
        setSelectedFinding(list[0]);
      } else {
        setSelectedFinding(null);
      }
    } catch (err) {
      console.error('Failed to load challenge findings:', err);
      setFindings([]);
      setSelectedFinding(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFindings();
    setGeneratedHypotheses([]);
  }, [effectiveCaseId]);

  const handleGenerateHypotheses = async () => {
    if (!effectiveCaseId) return;
    try {
      setGeneratingHypothesis(true);
      const res = await challengeAPI.generateHypotheses({
        caseId: effectiveCaseId,
        findingId: selectedFinding?._id,
        context: customContext || undefined,
      });
      const hypos = res.data?.data?.hypotheses || res.data?.hypotheses || [];
      setGeneratedHypotheses(hypos);
    } catch (err) {
      console.error('Hypothesis generation failed:', err);
    } finally {
      setGeneratingHypothesis(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedFinding) return;
    try {
      setSubmittingReview(true);
      const res = await challengeAPI.submitReview(selectedFinding._id, {
        status: reviewStatus,
        notes: reviewNotes || 'Review completed by investigator',
      });
      
      const updated = res.data?.data || res.data;
      // Update local finding
      setFindings(prev => prev.map(f => f._id === selectedFinding._id ? updated : f));
      setSelectedFinding(updated);
      setFeedbackMsg('Audit review recorded successfully.');
      setReviewNotes('');
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      console.error('Failed to submit review:', err);
      setFeedbackMsg('Failed to submit review. Try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-950/80 text-red-400 border border-red-800">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-950/80 text-yellow-300 border border-yellow-800">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-950/80 text-blue-400 border border-blue-800">LOW</span>;
    }
  };

  const filteredFindings = findings.filter(f => {
    if (filterType === 'ALL') return true;
    return f.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header with Advisory Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Scale className="h-6 w-6 text-indigo-400" />
              {t('challengeAi')}
            </h1>
            <AITransparencyBadge status="AI_INFERRED" confidenceScore={88} size="sm" />
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Autonomous adversarial audit engine. Exposes investigative tunnel vision, contradictions, unchecked assumptions, and rival hypotheses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchFindings}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-sm transition"
          >
            <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Audit
          </button>
        </div>
      </div>

      {/* Mandatory Human Oversight Advisory Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 border border-indigo-500/30 flex items-start gap-3">
        <ShieldAlert className="h-6 w-6 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-sm">
          <h4 className="font-semibold text-indigo-200">Ethical AI Mandate & Evidentiary Standard</h4>
          <p className="text-slate-300 mt-0.5">
            Challenge AI outputs are <strong className="text-white">advisory investigative aids</strong> designed to prevent bias and oversight. They must not be treated as prosecutorial determinations without independent corroboration by a sworn human investigator.
          </p>
        </div>
      </div>

      {/* Active Case indicator */}
      {activeCase && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
          <span className="flex items-center gap-2">
            <span className="text-slate-500">Active Case Audit Target:</span>
            <strong className="text-cyan-400 font-mono">{activeCase.caseNumber}</strong> - {activeCase.title}
          </span>
          <span className="text-slate-400">
            Audit Findings Detected: <span className="text-white font-bold">{findings.length}</span>
          </span>
        </div>
      )}

      {/* Main Grid: Left List, Right Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Finding Selector */}
        <div className="lg:col-span-5 space-y-3">
          {/* Filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 text-xs">
            {['ALL', 'CONTRADICTION', 'ASSUMPTION', 'GAP', 'BIAS_RISK', 'ALTERNATIVE_HYPOTHESIS'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  filterType === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-xl">
              <RotateCw className="h-6 w-6 text-indigo-400 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Auditing case evidence & graph nodes...</p>
            </div>
          ) : filteredFindings.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-xl">
              <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-200">No Findings for this Category</p>
              <p className="text-xs text-slate-400 mt-1">Current evidence chain exhibits no obvious anomalies under this criterion.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
              {filteredFindings.map(item => {
                const isSelected = selectedFinding?._id === item._id;
                return (
                  <div
                    key={item._id}
                    onClick={() => setSelectedFinding(item)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition text-left ${
                      isSelected
                        ? 'bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-950/30'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {getSeverityBadge(item.severity)}
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                          {item.type.replace('_', ' ')}
                        </span>
                      </div>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        item.status === 'REVIEWED' ? 'text-emerald-400 bg-emerald-950/50' :
                        item.status === 'DISMISSED' ? 'text-slate-400 bg-slate-800' :
                        item.status === 'INVESTIGATING' ? 'text-amber-400 bg-amber-950/50' :
                        'text-indigo-400 bg-indigo-950/50'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-100 line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                    
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Model Confidence: <span className="text-slate-300 font-mono font-medium">{item.confidenceScore}%</span></span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Finding Deep Inspection & Alternative Generator */}
        <div className="lg:col-span-7 space-y-4">
          {selectedFinding ? (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
              {/* Finding Header */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(selectedFinding.severity)}
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono uppercase bg-indigo-950/60 text-indigo-300 border border-indigo-800">
                      {selectedFinding.type.replace('_', ' ')}
                    </span>
                    <AITransparencyBadge status="AI_INFERRED" confidenceScore={selectedFinding.confidenceScore} size="sm" />
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    ID: {selectedFinding._id.slice(-8)}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-2">{selectedFinding.title}</h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">{selectedFinding.description}</p>
              </div>

              {/* Contradictory Evidence Pairs (if present) */}
              {selectedFinding.contradictoryEvidence && selectedFinding.contradictoryEvidence.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Contradictory Evidentiary Points
                  </h3>
                  <div className="space-y-2">
                    {selectedFinding.contradictoryEvidence.map((contra, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-red-950/20 border border-red-900/40 text-xs space-y-1.5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300">
                          <div className="p-2 rounded bg-slate-900/80 border border-red-900/20">
                            <span className="text-[10px] text-red-400 font-bold uppercase">Evidence Point A:</span>
                            <p className="mt-0.5 text-slate-200">{contra.itemA}</p>
                          </div>
                          <div className="p-2 rounded bg-slate-900/80 border border-red-900/20">
                            <span className="text-[10px] text-amber-400 font-bold uppercase">Evidence Point B:</span>
                            <p className="mt-0.5 text-slate-200">{contra.itemB}</p>
                          </div>
                        </div>
                        <p className="text-red-300/90 italic pt-1">
                          <strong className="not-italic text-red-300">Analysis:</strong> {contra.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Critical Questions to Probe */}
              {selectedFinding.criticalQuestions && selectedFinding.criticalQuestions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Critical Questions for Investigator
                  </h3>
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-2">
                    {selectedFinding.criticalQuestions.map((q, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                        <span className="font-mono text-amber-400 shrink-0">{idx + 1}.</span>
                        <p>{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Embedded Alternative Hypotheses */}
              {selectedFinding.alternativeHypotheses && selectedFinding.alternativeHypotheses.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Rival Hypothesis Profiles
                  </h3>
                  <div className="space-y-2">
                    {selectedFinding.alternativeHypotheses.map((hypo, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-950/60 border border-cyan-900/40 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-cyan-300">{hypo.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            hypo.plausibility === 'HIGH' ? 'bg-emerald-950 text-emerald-400' :
                            hypo.plausibility === 'MEDIUM' ? 'bg-yellow-950 text-yellow-300' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            Plausibility: {hypo.plausibility}
                          </span>
                        </div>
                        <p className="text-slate-300">{hypo.description}</p>
                        {hypo.supportingEvidence?.length > 0 && (
                          <div className="text-[11px] text-emerald-400/90 pt-1">
                            <strong>Consistent with:</strong> {hypo.supportingEvidence.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Alternative Hypothesis Generator */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                    Adversarial Hypothesis Synthesis
                  </h4>
                  <button
                    onClick={handleGenerateHypotheses}
                    disabled={generatingHypothesis}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50 shadow-sm"
                  >
                    <RotateCw className={`h-3 w-3 ${generatingHypothesis ? 'animate-spin' : ''}`} />
                    Synthesize Hypotheses
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Optional prompt nuance (e.g. 'Assume device spoofing was involved' or 'Consider inside accomplice')..."
                  value={customContext}
                  onChange={e => setCustomContext(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />

                {generatedHypotheses.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Generated Alternatives:</p>
                    {generatedHypotheses.map((gh, gidx) => (
                      <div key={gidx} className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-900/30 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-indigo-300">{gh.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-200 font-mono">
                            {gh.plausibility} PLAUSIBILITY
                          </span>
                        </div>
                        <p className="text-slate-300">{gh.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Human Investigator Review & Disposition Box */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  Investigator Formal Audit Disposition
                </h4>

                <div className="grid grid-cols-3 gap-2">
                  {(['REVIEWED', 'INVESTIGATING', 'DISMISSED'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setReviewStatus(st)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                        reviewStatus === st
                          ? 'bg-indigo-600/90 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={2}
                  placeholder="Mandatory review notes (e.g., 'Alibi independently verified via CCTV timestamp #104' or 'Follow-up subpoena requested')..."
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />

                <div className="flex items-center justify-between pt-1">
                  {feedbackMsg ? (
                    <span className="text-xs text-emerald-400 font-medium">{feedbackMsg}</span>
                  ) : (
                    <span className="text-[11px] text-slate-500">Recorded in case audit trail with timestamp.</span>
                  )}
                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Record Audit Review'}
                  </button>
                </div>
              </div>

              {/* Review History */}
              {selectedFinding.humanReviews && selectedFinding.humanReviews.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Review Audit Trail:</span>
                  {selectedFinding.humanReviews.map((rev, ridx) => (
                    <div key={ridx} className="p-2 rounded bg-slate-900 text-[11px] text-slate-300 flex items-start justify-between gap-2 border border-slate-800">
                      <div>
                        <span className="font-semibold text-white">{rev.reviewer}</span> ({rev.status}): {rev.notes}
                      </div>
                      <span className="text-slate-500 font-mono text-[10px] shrink-0">
                        {new Date(rev.reviewedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
              <Eye className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-300">Select an Audit Finding</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Choose any challenge item from the left panel to inspect evidentiary contradictions, critical probe questions, and rival hypothesis syntheses.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeAI;
