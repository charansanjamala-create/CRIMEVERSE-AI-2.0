import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Layers, 
  Navigation, 
  Plus, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  Compass, 
  Eye, 
  Radio, 
  Maximize2
} from 'lucide-react';
import { locationsAPI } from '../api';
import { useActiveCase } from '../context/CaseContext';
import { useLanguage } from '../context/LanguageContext';
import AITransparencyBadge from '../components/AITransparencyBadge';

interface LocationRecord {
  _id: string;
  caseId: string;
  title: string;
  address: {
    street?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  category: 'CRIME_SCENE' | 'SUSPECT_LAST_SEEN' | 'EVIDENCE_RECOVERY' | 'WITNESS_LOCATION' | 'SAFE_HOUSE' | 'SURVEILLANCE_POST' | 'OTHER';
  coordinates: {
    lat: number;
    lng: number;
  };
  verificationStatus: 'VERIFIED' | 'REPORTED' | 'AI_INFERRED';
  confidenceScore?: number;
  notes?: string;
  recordedAt: string;
}

const CaseMap: React.FC = () => {
  const { activeCase, cases } = useActiveCase();
  const { t } = useLanguage();

  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoc, setSelectedLoc] = useState<LocationRecord | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // New Location Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [locTitle, setLocTitle] = useState('');
  const [locStreet, setLocStreet] = useState('');
  const [locCity, setLocCity] = useState('');
  const [locState, setLocState] = useState('');
  const [locPostal, setLocPostal] = useState('');
  const [locCategory, setLocCategory] = useState<LocationRecord['category']>('CRIME_SCENE');
  const [locLat, setLocLat] = useState<number>(17.3850);
  const [locLng, setLocLng] = useState<number>(78.4867);
  const [locStatus, setLocStatus] = useState<LocationRecord['verificationStatus']>('VERIFIED');
  const [locNotes, setLocNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const effectiveCaseId = activeCase?._id || (cases.length > 0 ? cases[0]._id : '');

  const fetchLocations = async () => {
    if (!effectiveCaseId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await locationsAPI.getByCase(effectiveCaseId);
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setLocations(list);
      if (list && list.length > 0) {
        setSelectedLoc(list[0]);
      } else {
        setSelectedLoc(null);
      }
    } catch (err) {
      console.error('Failed to load locations:', err);
      setLocations([]);
      setSelectedLoc(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [effectiveCaseId]);

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveCaseId || !locTitle.trim() || !locCity.trim()) return;

    try {
      setSubmitting(true);
      const res = await locationsAPI.create({
        caseId: effectiveCaseId,
        title: locTitle,
        name: locTitle,
        address: {
          street: locStreet,
          city: locCity,
          state: locState,
          postalCode: locPostal,
          country: 'India',
        },
        category: locCategory,
        locationType: locCategory,
        coordinates: {
          lat: Number(locLat),
          lng: Number(locLng),
        },
        verificationStatus: locStatus,
        confidenceScore: locStatus === 'VERIFIED' ? 100 : locStatus === 'REPORTED' ? 70 : 85,
        notes: locNotes,
      });

      const created = res.data?.data || res.data;
      setLocations(prev => [created, ...prev]);
      setSelectedLoc(created);
      setShowAddModal(false);
      setLocTitle('');
      setLocStreet('');
      setLocCity('');
      setLocNotes('');
    } catch (err) {
      console.error('Failed to create location:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'CRIME_SCENE':
        return 'text-red-400 bg-red-950/60 border-red-800';
      case 'SUSPECT_LAST_SEEN':
        return 'text-amber-400 bg-amber-950/60 border-amber-800';
      case 'EVIDENCE_RECOVERY':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-800';
      case 'WITNESS_LOCATION':
        return 'text-purple-400 bg-purple-950/60 border-purple-800';
      case 'SAFE_HOUSE':
        return 'text-indigo-400 bg-indigo-950/60 border-indigo-800';
      default:
        return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  const filteredLocations = locations.filter(loc => {
    if (categoryFilter !== 'ALL' && loc.category !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && loc.verificationStatus !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Compass className="h-6 w-6 text-cyan-400" />
              {t('caseMap')} & Structured Locations
            </h1>
            <AITransparencyBadge status="VERIFIED" size="sm" />
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Geospatial intelligence map. Correlates crime scenes, suspect sighting logs, evidence drops, and safehouses with cryptographic GPS verification.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-sm transition shadow-lg shadow-cyan-950/40"
        >
          <Plus className="h-4 w-4" />
          Add Case Location
        </button>
      </div>

      {/* New Location Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleAddLocation}
            className="w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-cyan-400" />
                Register Structured Case Location
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Location Title / Descriptor *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Primary Bank Vault Entry or Suspect Safehouse #3"
                value={locTitle}
                onChange={e => setLocTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={locCategory}
                  onChange={e => setLocCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="CRIME_SCENE">Crime Scene</option>
                  <option value="SUSPECT_LAST_SEEN">Suspect Sighting / Last Seen</option>
                  <option value="EVIDENCE_RECOVERY">Evidence Recovery Point</option>
                  <option value="WITNESS_LOCATION">Witness Location</option>
                  <option value="SAFE_HOUSE">Suspect Safehouse</option>
                  <option value="SURVEILLANCE_POST">Surveillance Post</option>
                  <option value="OTHER">Other Landmark</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Verification Status
                </label>
                <select
                  value={locStatus}
                  onChange={e => setLocStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="VERIFIED">VERIFIED (Court-admissible GPS/CCTV)</option>
                  <option value="REPORTED">REPORTED (Witness/Citizen report)</option>
                  <option value="AI_INFERRED">AI-INFERRED (Cell tower / triangulation)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Address Details
              </label>
              <input
                type="text"
                placeholder="Street Address (e.g. Plot 42, Road No. 12, Banjara Hills)"
                value={locStreet}
                onChange={e => setLocStreet(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="City (e.g. Hyderabad)"
                  value={locCity}
                  onChange={e => setLocCity(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  placeholder="State (e.g. Telangana)"
                  value={locState}
                  onChange={e => setLocState(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={locPostal}
                  onChange={e => setLocPostal(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={locLat}
                  onChange={e => setLocLat(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={locLng}
                  onChange={e => setLocLng(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Forensic Notes
              </label>
              <textarea
                rows={2}
                placeholder="Tactical or environmental observations..."
                value={locNotes}
                onChange={e => setLocNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition disabled:opacity-50"
              >
                {submitting ? 'Registering...' : 'Pin Location'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Category:
          </span>
          {['ALL', 'CRIME_SCENE', 'SUSPECT_LAST_SEEN', 'EVIDENCE_RECOVERY', 'WITNESS_LOCATION', 'SAFE_HOUSE'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                categoryFilter === cat
                  ? 'bg-cyan-600 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Verification:</span>
          {['ALL', 'VERIFIED', 'REPORTED', 'AI_INFERRED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Map Layout: Left Interactive Canvas, Right Location Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Map Viewport */}
        <div className="lg:col-span-8 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden relative min-h-[500px] flex flex-col justify-between p-4 shadow-2xl">
          {/* Cyber Topographic Grid Background */}
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          {/* Coordinate HUD */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono text-cyan-400">
              <Radio className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
              <span>GEOLOCAL SECTOR: HYD-METRO</span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-400">
              TRACKED NODES: <span className="text-white font-bold">{filteredLocations.length}</span>
            </div>
          </div>

          {/* Map Simulated Interactive Canvas with Pins */}
          <div className="relative z-10 my-auto h-80 flex items-center justify-center">
            <div className="w-full max-w-xl h-full relative border border-cyan-500/20 rounded-xl bg-slate-900/40 p-4 overflow-hidden">
              {/* Concentric radar rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 rounded-full border border-cyan-500/10 animate-ping opacity-20" />
                <div className="w-48 h-48 rounded-full border border-cyan-500/15" />
                <div className="w-24 h-24 rounded-full border border-cyan-500/25" />
              </div>

              {/* Render dynamic pins */}
              {filteredLocations.map((loc, index) => {
                // Pseudo positions distributed for visual map view
                const leftPercent = 15 + ((index * 27 + (loc.coordinates?.lng || 78) * 10) % 70);
                const topPercent = 20 + ((index * 33 + (loc.coordinates?.lat || 17) * 10) % 60);
                const isSelected = selectedLoc?._id === loc._id;

                return (
                  <div
                    key={loc._id}
                    onClick={() => setSelectedLoc(loc)}
                    style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition transform hover:scale-125"
                  >
                    <div className="relative flex flex-col items-center">
                      <div className={`p-2 rounded-full border shadow-lg transition ${
                        isSelected 
                          ? 'bg-cyan-500 text-slate-950 border-white ring-4 ring-cyan-500/40 animate-bounce' 
                          : 'bg-slate-900/90 text-cyan-400 border-cyan-500/60'
                      }`}>
                        <MapPin className="h-4 w-4" />
                      </div>
                      <span className="mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-black/80 text-white border border-slate-700 whitespace-nowrap shadow">
                        {loc.title.slice(0, 16)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Map Status Bar */}
          <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
            <span className="flex items-center gap-1.5 font-mono">
              <Navigation className="h-3.5 w-3.5 text-cyan-400" />
              Active Center: 17.3850° N, 78.4867° E
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Verified
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-400" /> Reported
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400" /> AI-Inferred
              </span>
            </div>
          </div>
        </div>

        {/* Right Locations List & Selected Pin Inspection */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected Location Card */}
          {selectedLoc && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryColor(selectedLoc.category)}`}>
                  {selectedLoc.category.replace(/_/g, ' ')}
                </span>
                <AITransparencyBadge 
                  status={selectedLoc.verificationStatus} 
                  confidenceScore={selectedLoc.confidenceScore} 
                  size="sm" 
                />
              </div>

              <h3 className="text-base font-bold text-white">{selectedLoc.title}</h3>

              <div className="space-y-1 text-xs text-slate-300">
                {selectedLoc.address?.street && <p>{selectedLoc.address.street}</p>}
                <p className="font-semibold text-slate-200">
                  {selectedLoc.address?.city}
                  {selectedLoc.address?.state ? `, ${selectedLoc.address.state}` : ''}
                  {selectedLoc.address?.postalCode ? ` - ${selectedLoc.address.postalCode}` : ''}
                </p>
                <p className="text-[11px] font-mono text-cyan-400 pt-1">
                  GPS: {selectedLoc.coordinates?.lat?.toFixed(4)}, {selectedLoc.coordinates?.lng?.toFixed(4)}
                </p>
              </div>

              {selectedLoc.notes && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                    Field Notes:
                  </span>
                  {selectedLoc.notes}
                </div>
              )}
            </div>
          )}

          {/* Scrollable list */}
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 block">
              Case Geotags ({filteredLocations.length})
            </span>
            {filteredLocations.map(loc => {
              const isSelected = selectedLoc?._id === loc._id;
              return (
                <div
                  key={loc._id}
                  onClick={() => setSelectedLoc(loc)}
                  className={`p-3 rounded-xl border cursor-pointer transition text-left ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white line-clamp-1">{loc.title}</span>
                    <span className="text-[10px] font-mono text-cyan-400">{loc.address?.city}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="capitalize">{loc.category.replace(/_/g, ' ').toLowerCase()}</span>
                    <span className="text-[10px] font-mono text-slate-500">{loc.verificationStatus}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseMap;
