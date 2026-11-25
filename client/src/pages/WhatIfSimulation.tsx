import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Play, 
  Plus, 
  Trash2, 
  RotateCw, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Minus
} from 'lucide-react';
import { simulationAPI, entitiesAPI } from '../api';
import { useActiveCase } from '../context/CaseContext';
import { useLanguage } from '../context/LanguageContext';
import AITransparencyBadge from '../components/AITransparencyBadge';

interface Simulation {
  _id: string;
  caseId: string;
  name: string;
  description?: string;
  baselineRisk: number;
  simulatedRisk: number;
  riskScoreDelta: number;
  hypotheticalNodes: Array<{
    id: string;
    label: string;
    type: string;
    riskScore: number;
  }>;
  hypotheticalEdges: Array<{
    source: string;
    target: string;
    type: string;
  }>;
  removedEntityIds: string[];
  createdAt: string;
}

const WhatIfSimulation: React.FC = () => {
  const { activeCase, cases } = useActiveCase();
  const { t } = useLanguage();

  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [selectedSim, setSelectedSim] = useState<Simulation | null>(null);
  const [loading, setLoading] = useState(true);
  const [existingEntities, setExistingEntities] = useState<any[]>([]);

  // New Simulation Form State
  const [showBuilder, setShowBuilder] = useState(false);
  const [simName, setSimName] = useState('');
  const [simDescription, setSimDescription] = useState('');
  const [hypoNodes, setHypoNodes] = useState<Array<{ id: string; label: string; type: string; riskScore: number }>>([
    { id: 'hypo-1', label: 'Offshore Shell Corp (Cyprus)', type: 'ORGANIZATION', riskScore: 78 }
  ]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const effectiveCaseId = activeCase?._id || (cases.length > 0 ? cases[0]._id : '');

  const fetchSimulations = async () => {
    if (!effectiveCaseId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [simRes, entRes] = await Promise.all([
        simulationAPI.getByCase(effectiveCaseId),
        entitiesAPI.getByCase(effectiveCaseId).catch(() => ({ data: [] }))
      ]);
      const simList = Array.isArray(simRes.data) ? simRes.data : (simRes.data?.data || []);
      const entList = Array.isArray(entRes.data) ? entRes.data : (entRes.data?.data || []);
      setSimulations(simList);
      setExistingEntities(entList);
      if (simList && simList.length > 0) {
        setSelectedSim(simList[0]);
      } else {
        setSelectedSim(null);
      }
    } catch (err) {
      console.error('Failed to load simulations:', err);
      setSimulations([]);
      setSelectedSim(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulations();
  }, [effectiveCaseId]);

  const handleAddHypoNode = () => {
    const newId = `hypo-${Date.now().toString().slice(-4)}`;
    setHypoNodes(prev => [
      ...prev,
      { id: newId, label: 'Unidentified Syndicate Courier', type: 'PERSON', riskScore: 65 }
    ]);
  };

  const handleRemoveHypoNode = (id: string) => {
    setHypoNodes(prev => prev.filter(n => n.id !== id));
  };

  const toggleRemoveEntity = (id: string) => {
    setRemovedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCreateSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveCaseId || !simName.trim()) return;

    try {
      setSubmitting(true);
      const res = await simulationAPI.create({
        caseId: effectiveCaseId,
        title: simName,
        name: simName,
        description: simDescription,
        hypothesis: simDescription || simName,
        hypotheticalNodes: hypoNodes,
        addedHypotheticalEntities: hypoNodes.map(hn => ({
          id: hn.id,
          name: hn.label,
          type: hn.type,
          riskLevel: hn.riskScore >= 70 ? 'HIGH' : hn.riskScore >= 40 ? 'MEDIUM' : 'LOW',
          role: hn.label,
        })),
        hypotheticalEdges: hypoNodes.length > 0 ? [
          { source: hypoNodes[0].id, target: existingEntities[0]?._id || 'root', type: 'COORDINATED_WITH' }
        ] : [],
        removedEntityIds: removedIds,
        excludedEntityIds: removedIds,
      });

      const newSim = res.data?.data || res.data;
      setSimulations(prev => [newSim, ...prev]);
      setSelectedSim(newSim);
      setShowBuilder(false);
      setSimName('');
      setSimDescription('');
      setHypoNodes([]);
      setRemovedIds([]);
    } catch (err) {
      console.error('Failed to create simulation:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <GitBranch className="h-6 w-6 text-purple-400" />
              {t('whatIfSimulation')}
            </h1>
            <AITransparencyBadge status="HYPOTHETICAL" size="sm" />
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Sandbox counterfactual scenario branch engine. Model hypothetical links, sever false leads, and preview network impact without corrupting live evidentiary baseline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBuilder(!showBuilder)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition shadow-lg shadow-purple-950/40"
          >
            <Plus className="h-4 w-4" />
            {showBuilder ? 'Close Scenario Builder' : 'New What-If Branch'}
          </button>
        </div>
      </div>

      {/* Counterfactual Guardrail Warning */}
      <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs text-purple-200">
          <strong className="text-white block font-semibold text-sm">Isolated Counterfactual Sandbox</strong>
          All modifications, risk shifts, and synthetic nodes in this workspace exist strictly inside a sandboxed branch. They <span className="underline decoration-purple-400 underline-offset-2">do not modify</span> the official court record or live evidentiary chain.
        </div>
      </div>

      {/* Scenario Builder Modal / Slide-out */}
      {showBuilder && (
        <form onSubmit={handleCreateSimulation} className="p-5 rounded-2xl bg-slate-900/95 border border-purple-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-purple-400" />
              Configure Hypothetical Scenario Branch
            </h3>
            <span className="text-xs text-purple-300 font-mono">Case: {activeCase?.caseNumber || 'Active'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Scenario Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Branch: Suspect B Alibi Accepted & Vehicle Clone Suspected"
                value={simName}
                onChange={e => setSimName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Investigative Premise</label>
              <input
                type="text"
                placeholder="e.g. Test network cohesion if Suspect B is excluded and encrypted relay is introduced."
                value={simDescription}
                onChange={e => setSimDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Hypothetical Entities to Inject */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                1. Inject Hypothetical Entities
              </span>
              <button
                type="button"
                onClick={handleAddHypoNode}
                className="text-xs px-2.5 py-1 rounded bg-purple-900/40 hover:bg-purple-900/70 text-purple-300 border border-purple-700/50 transition flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Add Entity
              </button>
            </div>
            <div className="space-y-2">
              {hypoNodes.map((hn, idx) => (
                <div key={hn.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                  <div className="md:col-span-6">
                    <input
                      type="text"
                      value={hn.label}
                      onChange={e => {
                        const val = e.target.value;
                        setHypoNodes(prev => prev.map((item, i) => i === idx ? { ...item, label: val } : item));
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      placeholder="Entity Label / Identifier"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <select
                      value={hn.type}
                      onChange={e => {
                        const val = e.target.value;
                        setHypoNodes(prev => prev.map((item, i) => i === idx ? { ...item, type: val } : item));
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                    >
                      <option value="PERSON">Person</option>
                      <option value="ORGANIZATION">Organization / Shell</option>
                      <option value="VEHICLE">Vehicle</option>
                      <option value="LOCATION">Safehouse / Location</option>
                      <option value="DEVICE">Device / Burner</option>
                      <option value="TRANSACTION">Transaction / Mule</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">Risk:</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={hn.riskScore}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setHypoNodes(prev => prev.map((item, i) => i === idx ? { ...item, riskScore: val } : item));
                      }}
                      className="w-16 px-1.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white text-center"
                    />
                  </div>
                  <div className="md:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveHypoNode(hn.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sever / Exclude Existing Entities */}
          {existingEntities.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                2. Exclude / Sever Live Entities (Test Network Resilience)
              </span>
              <p className="text-[11px] text-slate-400">Select any entities to temporarily sever from the hypothetical graph:</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {existingEntities.map(ent => {
                  const isExcluded = removedIds.includes(ent._id);
                  return (
                    <button
                      key={ent._id}
                      type="button"
                      onClick={() => toggleRemoveEntity(ent._id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                        isExcluded
                          ? 'bg-red-950/60 border-red-500 text-red-300 line-through'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <span>{ent.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({ent.type})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowBuilder(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              {submitting ? 'Running Counterfactual Model...' : 'Execute Simulation Branch'}
            </button>
          </div>
        </form>
      )}

      {/* Main View: Simulation Selector & Deep Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List of Existing Simulations */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Simulated Branches ({simulations.length})
          </h3>

          {loading ? (
            <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-xl">
              <RotateCw className="h-6 w-6 text-purple-400 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading branch models...</p>
            </div>
          ) : simulations.length === 0 ? (
            <div className="p-6 text-center bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
              <GitBranch className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-300 font-semibold">No Simulation Branches Yet</p>
              <p className="text-[11px] text-slate-500">
                Click "New What-If Branch" to evaluate counterfactual scenarios for this case.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {simulations.map(sim => {
                const isSelected = selectedSim?._id === sim._id;
                const deltaPositive = sim.riskScoreDelta > 0;
                return (
                  <div
                    key={sim._id}
                    onClick={() => setSelectedSim(sim)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition text-left ${
                      isSelected
                        ? 'bg-slate-800/90 border-purple-500 shadow-md shadow-purple-950/30'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white line-clamp-1">{sim.name}</span>
                      <div className="flex items-center gap-1 font-mono text-xs">
                        {deltaPositive ? (
                          <span className="text-red-400 flex items-center font-bold">
                            <TrendingUp className="h-3 w-3 mr-0.5" />+{sim.riskScoreDelta}
                          </span>
                        ) : sim.riskScoreDelta < 0 ? (
                          <span className="text-emerald-400 flex items-center font-bold">
                            <TrendingDown className="h-3 w-3 mr-0.5" />{sim.riskScoreDelta}
                          </span>
                        ) : (
                          <span className="text-slate-400 flex items-center font-bold">
                            <Minus className="h-3 w-3 mr-0.5" />0
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">
                      {sim.description || 'Custom counterfactual scenario run.'}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Injected Nodes: {sim.hypotheticalNodes?.length || 0}</span>
                      <span>Severed: {sim.removedEntityIds?.length || 0}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Comparative Inspection */}
        <div className="lg:col-span-8 space-y-4">
          {selectedSim ? (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
              {/* Header with Risk Comparison */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono uppercase bg-purple-950 text-purple-300 border border-purple-800">
                      BRANCH MODEL
                    </span>
                    <AITransparencyBadge status="HYPOTHETICAL" size="sm" />
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    Sim ID: {selectedSim._id.slice(-8)}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">{selectedSim.name}</h2>
                <p className="text-xs text-slate-300 mt-1">{selectedSim.description}</p>

                {/* Score Delta Banner */}
                <div className="mt-4 grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Baseline Risk</span>
                    <span className="text-lg font-bold text-slate-300 font-mono">{selectedSim.baselineRisk}/100</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-purple-400 mb-0.5" />
                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                      selectedSim.riskScoreDelta > 0 ? 'bg-red-950/60 text-red-400' :
                      selectedSim.riskScoreDelta < 0 ? 'bg-emerald-950/60 text-emerald-400' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {selectedSim.riskScoreDelta > 0 ? `+${selectedSim.riskScoreDelta}` : selectedSim.riskScoreDelta} pts Delta
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-400 uppercase tracking-wider block">Simulated Risk</span>
                    <span className="text-lg font-bold text-purple-300 font-mono">{selectedSim.simulatedRisk}/100</span>
                  </div>
                </div>
              </div>

              {/* Side-by-side Comparative View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column 1: Baseline Real Network State */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      Live Baseline Evidence
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">VERIFIED</span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Official court-admissible entities tracked in the active investigation:
                  </p>

                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {existingEntities.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No base entities registered.</p>
                    ) : (
                      existingEntities.map(ent => {
                        const wasSevered = selectedSim.removedEntityIds?.includes(ent._id);
                        return (
                          <div
                            key={ent._id}
                            className={`p-2 rounded text-xs flex items-center justify-between border ${
                              wasSevered
                                ? 'bg-red-950/20 border-red-900/40 text-slate-500 line-through'
                                : 'bg-slate-900/80 border-slate-800 text-slate-300'
                            }`}
                          >
                            <span>{ent.name}</span>
                            <span className="text-[10px] font-mono text-slate-500">{ent.type}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Column 2: Simulated Counterfactual State */}
                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                      <GitBranch className="h-4 w-4 text-purple-400" />
                      Counterfactual Sandbox State
                    </span>
                    <span className="text-[10px] text-purple-400 font-mono">HYPOTHETICAL</span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Synthetic test entities and severed links introduced in this scenario:
                  </p>

                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {selectedSim.hypotheticalNodes?.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No hypothetical nodes added.</p>
                    ) : (
                      selectedSim.hypotheticalNodes.map(hn => (
                        <div
                          key={hn.id}
                          className="p-2 rounded text-xs flex items-center justify-between bg-purple-900/30 border border-purple-500/40 text-purple-200"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                            <span className="font-semibold">{hn.label}</span>
                          </div>
                          <span className="text-[10px] font-mono text-purple-400">
                            {hn.type} · Risk {hn.riskScore}
                          </span>
                        </div>
                      ))
                    )}

                    {selectedSim.removedEntityIds?.length > 0 && (
                      <div className="pt-2 text-[11px] text-red-400/90 font-medium">
                        Temporarily severed {selectedSim.removedEntityIds.length} base entities from this branch analysis.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Consequence Analysis */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-400" />
                  Investigative Implications of this Scenario
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  {selectedSim.riskScoreDelta > 0
                    ? `Injecting these hypothetical nodes significantly expands the case perimeter (+${selectedSim.riskScoreDelta} risk score). Indicates that if corroborated, this network spans beyond localized jurisdiction and may require federal liaison.`
                    : selectedSim.riskScoreDelta < 0
                    ? `Severing these entities drops estimated network cohesion by ${Math.abs(selectedSim.riskScoreDelta)} points. Suggests the primary threat cluster relies heavily on single points of contact.`
                    : 'The tested alterations maintain equilibrium with current risk estimates, indicating high redundancy in the network architecture.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
              <GitBranch className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-300">Select a Simulation Branch</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Choose an existing scenario from the left panel or click "New What-If Branch" above to model alternate case topologies.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatIfSimulation;
