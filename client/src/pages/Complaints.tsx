import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { complaintsAPI } from '../api';
import { useTranslation } from '../context/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import StatusTimeline from '../components/StatusTimeline';
import AITransparencyBadge from '../components/AITransparencyBadge';
import {
  FileText,
  Search,
  Plus,
  Clock,
  Shield,
  MapPin,
  Upload,
  User,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Mail,
  Car,
  Mic,
  ArrowRight,
  ExternalLink,
  Printer,
  ChevronRight,
  FolderPlus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const CATEGORIES = [
  { id: 'FINANCIAL_FRAUD', label: 'Financial Fraud / UPI Scam' },
  { id: 'CYBER_HARASSMENT', label: 'Cyber Harassment & Stalking' },
  { id: 'IDENTITY_THEFT', label: 'Identity Theft & KYC Forgery' },
  { id: 'EXTORTION', label: 'Ransomware & Extortion' },
  { id: 'BURGLARY_THEFT', label: 'Armed Robbery & Burglary' },
  { id: 'NARCOTICS', label: 'Narcotics & Illicit Trade' },
  { id: 'ASSAULT', label: 'Assault & Threat to Life' },
  { id: 'MISSING_PERSON', label: 'Missing Person' },
  { id: 'OTHER', label: 'Other Criminal Incident' },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

export default function ComplaintsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { startSpeechInput, isListening } = useAccessibility();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'file' | 'track' | 'queue'>('file');
  const [trackingIdInput, setTrackingIdInput] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    category: 'FINANCIAL_FRAUD',
    title: '',
    description: '',
    incidentDateTime: new Date().toISOString().slice(0, 16),
    complainant: {
      name: user?.name || '',
      phone: '',
      email: user?.email || '',
      nationalId: '',
      address: '',
      isAnonymous: false,
    },
    suspectInfo: {
      name: '',
      aliases: '',
      description: '',
      contactNumber: '',
      email: '',
      additionalDetails: '',
    },
    location: {
      fullAddress: '',
      city: '',
      district: '',
      state: 'Delhi',
      country: 'India',
      pinCode: '',
      lat: 28.6139,
      lng: 77.209,
    },
    relatedPersons: '',
    relatedLocations: '',
    relatedVehiclesDevices: '',
    additionalNotes: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  // Queries
  const { data: complaintsListRes, isLoading: isLoadingList } = useQuery({
    queryKey: ['complaints-list', filterStatus, filterCategory, searchQuery],
    queryFn: () =>
      complaintsAPI.getAll({
        status: filterStatus,
        category: filterCategory,
        search: searchQuery,
      }),
  });

  const complaints = complaintsListRes?.data?.data || [];

  // Track Single Complaint
  const trackQuery = useQuery({
    queryKey: ['track-complaint', trackingIdInput],
    queryFn: () => complaintsAPI.track(trackingIdInput.trim()),
    enabled: false,
  });

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingIdInput.trim()) {
      toast.error('Please enter a valid Complaint ID');
      return;
    }
    const res = await trackQuery.refetch();
    const compData = res.data?.data?.data || res.data?.data;
    if (compData && (compData.complaintId || compData._id)) {
      setSelectedComplaint(compData);
      toast.success('Complaint records retrieved');
    } else {
      toast.error('Complaint not found with this ID');
    }
  };

  // Submit Complaint Mutation
  const submitMutation = useMutation({
    mutationFn: (payload: any) => complaintsAPI.submit(payload),
    onSuccess: (res) => {
      const created = res.data.data;
      toast.success(t('complaints.submitSuccess'));
      setSelectedComplaint(created);
      setActiveTab('track');
      setTrackingIdInput(created.complaintId);
      queryClient.invalidateQueries({ queryKey: ['complaints-list'] });
      // Reset form
      setFormData({
        category: 'FINANCIAL_FRAUD',
        title: '',
        description: '',
        incidentDateTime: new Date().toISOString().slice(0, 16),
        complainant: {
          name: user?.name || '',
          phone: '',
          email: user?.email || '',
          nationalId: '',
          address: '',
          isAnonymous: false,
        },
        suspectInfo: {
          name: '',
          aliases: '',
          description: '',
          contactNumber: '',
          email: '',
          additionalDetails: '',
        },
        location: {
          fullAddress: '',
          city: '',
          district: '',
          state: 'Delhi',
          country: 'India',
          pinCode: '',
          lat: 28.6139,
          lng: 77.209,
        },
        relatedPersons: '',
        relatedLocations: '',
        relatedVehiclesDevices: '',
        additionalNotes: '',
      });
      setUploadedFiles([]);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    },
  });

  // Promote to Formal Case Mutation
  const promoteMutation = useMutation({
    mutationFn: (complaintId: string) => complaintsAPI.promoteToCase(complaintId),
    onSuccess: (res) => {
      toast.success('Complaint successfully converted to formal investigation case!');
      queryClient.invalidateQueries({ queryKey: ['complaints-list'] });
      queryClient.invalidateQueries({ queryKey: ['cases-switcher-list'] });
      if (selectedComplaint) {
        setSelectedComplaint({
          ...selectedComplaint,
          status: 'INVESTIGATION_STARTED',
          linkedCaseId: res.data.data.case._id,
        });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to promote complaint');
    },
  });

  // Update Status Mutation
  const statusUpdateMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      complaintsAPI.updateStatus(id, { status, notes }),
    onSuccess: (res) => {
      toast.success('Complaint status updated');
      queryClient.invalidateQueries({ queryKey: ['complaints-list'] });
      setSelectedComplaint(res.data.data);
    },
    onError: () => toast.error('Failed to update status'),
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    if (!formData.complainant.name || !formData.complainant.phone) {
      toast.error('Complainant name and contact phone are required');
      return;
    }
    if (!formData.location.fullAddress || !formData.location.city) {
      toast.error('Full address and city are required');
      return;
    }

    const payload = {
      ...formData,
      suspectInfo: {
        ...formData.suspectInfo,
        aliases: formData.suspectInfo.aliases
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
      },
      location: {
        ...formData.location,
        coordinates: { lat: formData.location.lat, lng: formData.location.lng },
      },
      relatedPersons: formData.relatedPersons
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean),
      relatedLocations: formData.relatedLocations
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean),
      relatedVehiclesDevices: formData.relatedVehiclesDevices
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
      evidenceFiles: uploadedFiles,
    };

    submitMutation.mutate(payload);
  };

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newEvidence = filesArray.map((f) => ({
        fileName: f.name.replace(/\s+/g, '_'),
        originalName: f.name,
        fileType: f.type.startsWith('audio')
          ? 'AUDIO'
          : f.type.startsWith('image')
          ? 'IMAGE'
          : f.type.startsWith('video')
          ? 'VIDEO'
          : 'DOCUMENT',
        fileSize: f.size,
        uploadedAt: new Date(),
      }));
      setUploadedFiles([...uploadedFiles, ...newEvidence]);
      toast.success(`${filesArray.length} evidence file(s) attached`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyber-500 to-indigo-600 flex items-center justify-center text-white shadow-cyber">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="page-title">{t('complaints.title')}</h1>
          </div>
          <p className="page-subtitle">{t('complaints.subtitle')}</p>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('file')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'file'
                ? 'bg-cyber-600 text-white shadow-cyber'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            {t('complaints.tabFile')}
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'track'
                ? 'bg-cyber-600 text-white shadow-cyber'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            {t('complaints.tabTrack')}
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'queue'
                ? 'bg-cyber-600 text-white shadow-cyber'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {t('complaints.tabIntake')} ({complaints.length})
          </button>
        </div>
      </div>

      {/* ─── TAB 1: FILE COMPLAINT FORM ────────────────────────────────────────── */}
      {activeTab === 'file' && (
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Section 1: Incident Categorisation */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyber-500/20 text-cyber-400 font-mono text-xs flex items-center justify-center">
                  1
                </span>
                Incident Categorisation & Overview
              </h3>
              <AITransparencyBadge status="REPORTED" size="sm" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t('complaints.category')} *
                </label>
                <select
                  className="select text-xs"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t('complaints.dateTime')} *
                </label>
                <input
                  type="datetime-local"
                  className="input text-xs"
                  value={formData.incidentDateTime}
                  onChange={(e) => setFormData({ ...formData, incidentDateTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  {t('complaints.incidentTitle')} *
                </label>
                <button
                  type="button"
                  onClick={() =>
                    startSpeechInput((text) =>
                      setFormData((prev) => ({ ...prev, title: text }))
                    )
                  }
                  className="text-[11px] text-cyber-400 hover:text-cyber-300 flex items-center gap-1 font-semibold"
                >
                  <Mic className="w-3 h-3" /> Dictate Title
                </button>
              </div>
              <input
                type="text"
                className="input text-xs"
                placeholder="e.g. Unauthorized Deepfake Voice Transfer from State Bank Account"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  {t('complaints.description')} *
                </label>
                <button
                  type="button"
                  onClick={() =>
                    startSpeechInput((text) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: prev.description ? `${prev.description} ${text}` : text,
                      }))
                    )
                  }
                  className="text-[11px] text-cyber-400 hover:text-cyber-300 flex items-center gap-1 font-semibold"
                >
                  <Mic className="w-3 h-3" /> Dictate Description
                </button>
              </div>
              <textarea
                className="textarea text-xs"
                rows={4}
                placeholder="Describe sequence of events, transaction identifiers, communications, messages or threats received..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Section 2: Complainant / Victim Details */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyber-500/20 text-cyber-400 font-mono text-xs flex items-center justify-center">
                  2
                </span>
                Complainant & Victim Information
              </h3>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.complainant.isAnonymous}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      complainant: { ...formData.complainant, isAnonymous: e.target.checked },
                    })
                  }
                  className="rounded bg-slate-800 border-slate-700 text-cyber-500"
                />
                <span className="font-semibold text-cyber-300">{t('complaints.anonymous')}</span>
              </label>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t('complaints.complainantName')} *
                </label>
                <input
                  type="text"
                  className="input text-xs"
                  placeholder="Full Legal Name"
                  value={formData.complainant.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      complainant: { ...formData.complainant, name: e.target.value },
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t('complaints.phone')} *
                </label>
                <input
                  type="tel"
                  className="input text-xs"
                  placeholder="+91 98765 43210"
                  value={formData.complainant.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      complainant: { ...formData.complainant, phone: e.target.value },
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t('complaints.email')} *
                </label>
                <input
                  type="email"
                  className="input text-xs"
                  placeholder="name@domain.com"
                  value={formData.complainant.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      complainant: { ...formData.complainant, email: e.target.value },
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  National / Government ID (Aadhaar / Passport / Voter)
                </label>
                <input
                  type="text"
                  className="input text-xs"
                  placeholder="e.g. XXXX-XXXX-4589"
                  value={formData.complainant.nationalId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      complainant: { ...formData.complainant, nationalId: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Residential Address
                </label>
                <input
                  type="text"
                  className="input text-xs"
                  placeholder="House/Apartment, Street, City"
                  value={formData.complainant.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      complainant: { ...formData.complainant, address: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Section 3: Structured Incident Location */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyber-500/20 text-cyber-400 font-mono text-xs flex items-center justify-center">
                  3
                </span>
                Structured Incident Location & Geospatial Pin
              </h3>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                Case Map Tagging
              </span>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t('complaints.address')} *
                </label>
                <input
                  type="text"
                  className="input text-xs"
                  placeholder="Plot/Building, Street, Landmark"
                  value={formData.location.fullAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, fullAddress: e.target.value },
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t('complaints.city')} *
                </label>
                <input
                  type="text"
                  className="input text-xs"
                  placeholder="City (e.g. New Delhi, Noida)"
                  value={formData.location.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, city: e.target.value },
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t('complaints.district')} *
                </label>
                <input
                  type="text"
                  className="input text-xs"
                  placeholder="District"
                  value={formData.location.district}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, district: e.target.value },
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t('complaints.state')} *
                </label>
                <select
                  className="select text-xs"
                  value={formData.location.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, state: e.target.value },
                    })
                  }
                  required
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Country</label>
                <input
                  type="text"
                  className="input text-xs bg-slate-900/50"
                  value={formData.location.country}
                  disabled
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t('complaints.pinCode')} *
                </label>
                <input
                  type="text"
                  className="input text-xs"
                  placeholder="e.g. 110001"
                  value={formData.location.pinCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, pinCode: e.target.value },
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Latitude Coordinate
                </label>
                <input
                  type="number"
                  step="0.0001"
                  className="input text-xs font-mono"
                  value={formData.location.lat}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, lat: parseFloat(e.target.value) || 0 },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Longitude Coordinate
                </label>
                <input
                  type="number"
                  step="0.0001"
                  className="input text-xs font-mono"
                  value={formData.location.lng}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, lng: parseFloat(e.target.value) || 0 },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Section 4: Suspect & Entity Associations */}
          <div className="card p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyber-500/20 text-cyber-400 font-mono text-xs flex items-center justify-center">
                  4
                </span>
                Suspect Information & Network Telemetry
              </h3>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t('complaints.suspectName')}
                </label>
                <input
                  type="text"
                  className="input text-xs"
                  placeholder="Suspect Name / Caller Alias"
                  value={formData.suspectInfo.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      suspectInfo: { ...formData.suspectInfo, name: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Suspect Contact / WhatsApp
                </label>
                <input
                  type="text"
                  className="input text-xs"
                  placeholder="+91 99112 33445"
                  value={formData.suspectInfo.contactNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      suspectInfo: { ...formData.suspectInfo, contactNumber: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Suspect Email / Domain
                </label>
                <input
                  type="text"
                  className="input text-xs"
                  placeholder="support@scam-domain.com"
                  value={formData.suspectInfo.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      suspectInfo: { ...formData.suspectInfo, email: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {t('complaints.suspectDesc')}
              </label>
              <textarea
                className="textarea text-xs"
                rows={2}
                placeholder="Physical attributes, vehicle description, dialect, accent, impersonated official designation..."
                value={formData.suspectInfo.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    suspectInfo: { ...formData.suspectInfo, description: e.target.value },
                  })
                }
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Related Persons (comma separated)
                </label>
                <input
                  type="text"
                  className="input text-xs"
                  placeholder="Manager Alok, Accountant..."
                  value={formData.relatedPersons}
                  onChange={(e) => setFormData({ ...formData, relatedPersons: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Related Locations (comma separated)
                </label>
                <input
                  type="text"
                  className="input text-xs"
                  placeholder="Branch Office, Metro Station..."
                  value={formData.relatedLocations}
                  onChange={(e) => setFormData({ ...formData, relatedLocations: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Related Vehicles / IMEI / UPI VPAs
                </label>
                <input
                  type="text"
                  className="input text-xs"
                  placeholder="DL-01-AB-1234, target@upi..."
                  value={formData.relatedVehiclesDevices}
                  onChange={(e) =>
                    setFormData({ ...formData, relatedVehiclesDevices: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Section 5: Evidence Attachment */}
          <div className="card p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyber-500/20 text-cyber-400 font-mono text-xs flex items-center justify-center">
                  5
                </span>
                Digital Evidence & Supporting Documents
              </h3>
              <span className="text-xs text-slate-400">{uploadedFiles.length} attached</span>
            </div>

            <div className="border-2 border-dashed border-cyber-600/30 hover:border-cyber-500/60 rounded-xl p-6 text-center transition-all bg-slate-900/40">
              <Upload className="w-8 h-8 text-cyber-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-200">{t('complaints.evidenceUpload')}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Supports Audio (.wav, .mp3), Screenshots (.png, .jpg), Bank Statements (.pdf), Videos
              </p>
              <label className="btn-secondary text-xs mt-3 inline-flex cursor-pointer">
                Browse Files
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileDrop}
                />
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-2">
                {uploadedFiles.map((f, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div className="truncate flex items-center gap-2">
                      <span className="badge badge-info text-[10px]">{f.fileType}</span>
                      <span className="text-slate-200 truncate">{f.originalName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedFiles(uploadedFiles.filter((_, idx) => idx !== i))}
                      className="text-rose-400 hover:text-rose-300 text-xs px-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('track')}
              className="btn-secondary text-sm px-5"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="btn-primary text-sm px-6 py-2.5"
            >
              {submitMutation.isPending ? (
                <>
                  <div className="spinner w-4 h-4" /> Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> {t('complaints.submitBtn')}
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ─── TAB 2: TRACK STATUS / MY COMPLAINTS ─────────────────────────────────── */}
      {activeTab === 'track' && (
        <div className="space-y-6">
          {/* Tracker Lookup Bar */}
          <div className="card p-5">
            <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  className="input pl-9 text-xs font-mono"
                  placeholder={t('complaints.trackInput')}
                  value={trackingIdInput}
                  onChange={(e) => setTrackingIdInput(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary text-xs px-5 justify-center">
                {t('complaints.trackBtn')}
              </button>
            </form>
          </div>

          {/* Selected Complaint Dossier */}
          {selectedComplaint ? (
            <div className="card p-6 space-y-6 border border-cyber-600/30">
              {/* Header Status & Acknowledgement */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="mono text-sm font-black text-cyber-400 bg-cyber-950/60 px-2 py-0.5 rounded border border-cyber-600/30">
                      {selectedComplaint.complaintId}
                    </span>
                    <span className="badge badge-info text-xs">{selectedComplaint.category}</span>
                    <AITransparencyBadge status="REPORTED" size="sm" />
                  </div>
                  <h2 className="text-xl font-black text-white">{selectedComplaint.title}</h2>
                  <p className="text-xs text-slate-400">
                    Lodged on {format(new Date(selectedComplaint.createdAt), 'PPP p')}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => window.print()}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Acknowledgement
                  </button>
                  {selectedComplaint.linkedCaseId && (
                    <span className="badge bg-emerald-600/20 text-emerald-400 border border-emerald-600/40 text-xs px-3 py-1.5">
                      Case Linked: Active Investigation
                    </span>
                  )}
                </div>
              </div>

              {/* 6-Stage Progress Stepper */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Investigation & FIR Progress Workflow
                </h4>
                <StatusTimeline
                  currentStatus={selectedComplaint.status}
                  statusHistory={selectedComplaint.statusHistory}
                />
              </div>

              {/* Department & Officer Assignment Info */}
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">
                    {t('complaints.assignedDept')}
                  </div>
                  <div className="text-xs font-bold text-slate-200">
                    {selectedComplaint.assignedDepartment || 'Cyber Crime Division'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">
                    {t('complaints.assignedOfficer')}
                  </div>
                  <div className="text-xs font-bold text-slate-200">
                    {selectedComplaint.assignedOfficer?.name || 'Agent Sarah Chen (Assigned)'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">
                    Current Formal Status
                  </div>
                  <div className="text-xs font-black text-cyber-400">
                    {t(`status.${selectedComplaint.status}`)}
                  </div>
                </div>
              </div>

              {/* Description & Location */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Complaint Summary & Allegations
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedComplaint.description}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    Incident Location Records
                  </h4>
                  <div className="text-xs text-slate-200 space-y-1">
                    <div>
                      <span className="text-slate-500">Address:</span>{' '}
                      {selectedComplaint.location.fullAddress}
                    </div>
                    <div>
                      <span className="text-slate-500">City / District:</span>{' '}
                      {selectedComplaint.location.city}, {selectedComplaint.location.district} (
                      {selectedComplaint.location.state} - {selectedComplaint.location.pinCode})
                    </div>
                    {selectedComplaint.location.coordinates && (
                      <div className="font-mono text-[11px] text-slate-400">
                        GPS Coordinates:{' '}
                        {selectedComplaint.location.coordinates.lat?.toFixed(4)},{' '}
                        {selectedComplaint.location.coordinates.lng?.toFixed(4)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Attached Evidence Files */}
              {selectedComplaint.evidenceFiles?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Submitted Evidence & Digital Artifacts ({selectedComplaint.evidenceFiles.length})
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {selectedComplaint.evidenceFiles.map((file: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="badge badge-info text-[9px]">{file.fileType}</span>
                          <span className="text-slate-200 truncate">{file.originalName}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">Verified</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Investigator Action Bar (Promote to Formal Case) */}
              {!selectedComplaint.linkedCaseId && user?.role !== 'CITIZEN' && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-cyber-950/60 to-purple-950/40 border border-cyber-600/30 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <FolderPlus className="w-4 h-4 text-cyber-400" />
                      Promote to Formal Case Investigation
                    </div>
                    <p className="text-xs text-slate-400">
                      Convert this citizen report into a full investigation dossier linked with
                      Network, CCTV, and Tactical Map modules.
                    </p>
                  </div>
                  <button
                    onClick={() => promoteMutation.mutate(selectedComplaint._id)}
                    disabled={promoteMutation.isPending}
                    className="btn-primary text-xs px-4 py-2 flex-shrink-0"
                  >
                    {promoteMutation.isPending ? 'Promoting...' : t('complaints.promoteToCase')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state card p-12">
              <Search className="w-12 h-12 text-slate-600 mb-3 mx-auto" />
              <h3 className="text-base font-bold text-white">Track Your Complaint</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mx-auto">
                Enter your unique Complaint Tracking ID in the box above to inspect investigation
                updates, assigned officers, and evidence reviews.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: INTAKE QUEUE ─────────────────────────────────────────────── */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold uppercase">Filter Status:</span>
              {[
                'ALL',
                'SUBMITTED',
                'UNDER_REVIEW',
                'INVESTIGATION_STARTED',
                'EVIDENCE_REVIEW',
                'RESOLVED',
              ].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filterStatus === st
                      ? 'bg-cyber-600 text-white shadow-sm'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'ALL' ? 'All Complaints' : t(`status.${st}`)}
                </button>
              ))}
            </div>

            <div className="w-64 relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                className="input pl-8 text-xs py-1.5"
                placeholder="Search complaints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Complaints Table / List */}
          <div className="space-y-3">
            {complaints.map((item: any) => (
              <div
                key={item._id}
                onClick={() => {
                  setSelectedComplaint(item);
                  setActiveTab('track');
                  setTrackingIdInput(item.complaintId);
                }}
                className="card p-4.5 hover:border-cyber-600/50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="mono text-xs font-bold text-cyber-400 bg-cyber-950/60 px-2 py-0.5 rounded border border-cyber-600/30">
                      {item.complaintId}
                    </span>
                    <span className="badge badge-info text-[10px]">{item.category}</span>
                    <span
                      className={`badge text-[10px] ${
                        item.status === 'RESOLVED'
                          ? 'badge-low'
                          : item.status === 'INVESTIGATION_STARTED'
                          ? 'badge-medium'
                          : 'badge-high'
                      }`}
                    >
                      {t(`status.${item.status}`)}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyber-300 transition-colors truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1">{item.description}</p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                    <span>Complainant: {item.complainant?.name}</span>
                    <span>•</span>
                    <span>
                      {item.location?.city}, {item.location?.state}
                    </span>
                    <span>•</span>
                    <span>{format(new Date(item.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <button className="btn-secondary text-xs px-3 py-1.5 group-hover:bg-cyber-600 group-hover:text-white transition-all flex items-center gap-1">
                    <span>Open File</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {complaints.length === 0 && !isLoadingList && (
              <div className="card p-12 text-center text-slate-500 text-xs">
                No complaints registered in this category.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
