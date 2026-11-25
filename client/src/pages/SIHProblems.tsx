import { useState } from 'react'
import {
  BookOpen, Mic, Mail, Shield, Bitcoin, Network, Cpu, Zap,
  ChevronDown, ChevronUp, ExternalLink, Target, Brain, Lock, Search
} from 'lucide-react'

interface Problem {
  id: string
  sihId: string
  title: string
  organization: string
  category: string
  description: string
  module: string
  icon: any
  color: string
  challenges: string[]
  ourApproach: string
}

const problems: Problem[] = [
  {
    id: '1',
    sihId: 'SIH-1620',
    title: 'AI-based Voice Cloning and Deepfake Audio Detection',
    organization: 'Ministry of Home Affairs',
    category: 'Cybercrime',
    description: 'Develop an AI system capable of detecting deepfake audio and voice cloning used in fraud, impersonation, and social engineering attacks.',
    module: 'VoiceShield AI',
    icon: Mic,
    color: 'from-purple-500 to-pink-600',
    challenges: [
      'Real-time detection with minimal latency',
      'High accuracy across diverse voice types and languages',
      'Robustness against adversarial attacks',
      'Handling compressed/low-quality audio',
    ],
    ourApproach: 'VoiceShield AI uses deep neural network analysis to extract mel-spectrogram features, MFCC coefficients, and temporal patterns. It detects anomalies in voice naturalness, GAN artifacts, and inconsistencies in prosody. The system provides confidence scores, detailed technical metrics, and risk assessments.',
  },
  {
    id: '2',
    sihId: 'SIH-1621',
    title: 'Phishing Email and Scam Communication Detection',
    organization: 'CERT-In / Ministry of Electronics',
    category: 'Email Fraud',
    description: 'Build a system to automatically analyze and classify emails, SMS, or other communications as phishing, scam, or legitimate using AI/ML techniques.',
    module: 'MailGuard AI',
    icon: Mail,
    color: 'from-blue-500 to-cyan-600',
    challenges: [
      'Evolving phishing tactics and obfuscation',
      'Header spoofing and domain impersonation',
      'Multilingual phishing content',
      'Balancing false positives vs false negatives',
    ],
    ourApproach: 'MailGuard extracts and analyzes email headers (SPF, DKIM, DMARC), URL patterns, embedded payloads, linguistic markers, and sender reputation. NLP classifiers detect urgency language, impersonation signals, and social engineering patterns.',
  },
  {
    id: '3',
    sihId: 'SIH-1622',
    title: 'Fake Identity Document Detection Using AI',
    organization: 'Bureau of Immigration',
    category: 'Identity Fraud',
    description: 'Create an AI-powered solution to detect forged or tampered identity documents including passports, Aadhaar, driving licenses using computer vision.',
    module: 'VeriTrust AI',
    icon: Shield,
    color: 'from-emerald-500 to-teal-600',
    challenges: [
      'Wide variety of document formats across states',
      'Sophisticated high-quality forgeries',
      'Handling low resolution or poor quality scans',
      'Cross-document identity verification',
    ],
    ourApproach: 'VeriTrust AI performs multi-layer analysis including OCR validation, font consistency checks, MRZ/QR code verification, metadata analysis, and digital signature validation. The system cross-references extracted data against behavioral patterns to compute overall authenticity scores.',
  },
  {
    id: '4',
    sihId: 'SIH-1623',
    title: 'Blockchain Transaction Tracing for Cryptocurrency Crime',
    organization: 'Financial Intelligence Unit India',
    category: 'Financial Crime',
    description: 'Develop a tool to trace illicit cryptocurrency transactions, identify money laundering patterns, and link wallets to criminal activity.',
    module: 'ChainTrace AI',
    icon: Bitcoin,
    color: 'from-amber-500 to-orange-600',
    challenges: [
      'Anonymization techniques (mixers, tumblers)',
      'Cross-chain transactions',
      'Tracking through multiple wallet hops',
      'Real-time monitoring of large transaction volumes',
    ],
    ourApproach: 'ChainTrace AI analyzes wallet addresses across Bitcoin, Ethereum, and USDT (TRC20/ERC20). It performs transaction graph analysis, risk scoring based on known bad actor databases, mixer detection, and suspicious pattern identification including layering and placement indicators.',
  },
  {
    id: '5',
    sihId: 'SIH-1624',
    title: 'Criminal Network Mapping and Entity Relationship Analysis',
    organization: 'National Crime Records Bureau',
    category: 'Network Intelligence',
    description: 'Build a system to map criminal networks, identify key nodes, hierarchy structures, and predict potential criminal activity using graph analytics.',
    module: 'Crime Network',
    icon: Network,
    color: 'from-rose-500 to-red-600',
    challenges: [
      'Incomplete and noisy data from multiple sources',
      'Dynamic networks that evolve over time',
      'Identifying key influencers and hierarchies',
      'Privacy constraints vs intelligence needs',
    ],
    ourApproach: 'The Crime Network module uses force-directed graph visualization with D3.js to map entity relationships. It computes centrality metrics to identify key nodes, tracks relationship strengths, and provides timeline-based network evolution analysis.',
  },
  {
    id: '6',
    sihId: 'SIH-1625',
    title: 'Unified Crime Intelligence Platform with AI Assistant',
    organization: 'Bureau of Police Research & Development',
    category: 'Integrated Intelligence',
    description: 'Create an integrated platform that unifies all cybercrime investigation tools with an AI assistant for natural language querying and automated report generation.',
    module: 'AI Intelligence Core',
    icon: Cpu,
    color: 'from-violet-500 to-purple-600',
    challenges: [
      'Integration across heterogeneous data sources',
      'Natural language understanding for investigative queries',
      'Automated structured report generation',
      'Role-based access control for sensitive data',
    ],
    ourApproach: 'CRIMEVERSE AI 2.0 serves as this unified platform. The AI Intelligence Core uses Google Gemini / Claude for natural language investigation support, cross-module data correlation, and automated PDF-ready report generation with risk scoring and recommendation engines.',
  },
]

function ProblemCard({ p }: { p: Problem }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = p.icon

  return (
    <div className={`card overflow-hidden transition-all duration-300 ${expanded ? 'border-cyber-600/40' : ''}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left p-5">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="badge badge-info font-mono text-[10px]">{p.sihId}</span>
              <span className="badge text-[10px] bg-slate-700/50 text-slate-400">{p.category}</span>
            </div>
            <h3 className="font-bold text-slate-100 leading-snug">{p.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{p.organization}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-cyber-400">{p.module}</div>
              <div className="text-[10px] text-slate-600">Our solution</div>
            </div>
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-800 p-5 space-y-5 animate-fade-in">
          <p className="text-sm text-slate-300 leading-relaxed">{p.description}</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-crimson-400" />
                <h4 className="text-sm font-bold text-slate-200">Key Challenges</h4>
              </div>
              <ul className="space-y-1.5">
                {p.challenges.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="text-crimson-400 mt-0.5 flex-shrink-0">•</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-cyber-400" />
                <h4 className="text-sm font-bold text-slate-200">Our Approach</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{p.ourApproach}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <div className={`w-5 h-5 rounded bg-gradient-to-br ${p.color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs text-slate-400">Addressed by: <span className="text-cyber-400 font-semibold">{p.module}</span></span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SIHProblemsPage() {
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('ALL')

  const categories = ['ALL', ...Array.from(new Set(problems.map(p => p.category)))]
  const filtered = problems.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.sihId.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat === 'ALL' || p.category === filterCat
    return matchSearch && matchCat
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-cyber-400" />
          SIH 2024 Problem Statements
        </h1>
        <p className="page-subtitle">Smart India Hackathon problems addressed by CRIMEVERSE AI 2.0</p>
      </div>

      {/* Overview banner */}
      <div className="card p-5 border-cyber-600/40 bg-gradient-to-r from-cyber-600/10 to-purple-600/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyber-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-cyber">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 mb-1">CRIMEVERSE AI 2.0 — SIH Solution</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Our platform addresses <strong className="text-cyber-400">6 interconnected SIH 2024 problem statements</strong> from
              the Ministry of Home Affairs, CERT-In, FIU India, NCRB, BPR&D, and Bureau of Immigration.
              Each intelligence module is purpose-built for a specific cybercrime challenge.
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Lock className="w-3 h-3" />All data encrypted</span>
              <span className="flex items-center gap-1"><Brain className="w-3 h-3" />6 AI modules</span>
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" />Real-time processing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input className="input pl-9" placeholder="Search problems..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filterCat === cat ? 'bg-cyber-600/20 border border-cyber-600/30 text-cyber-400' : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Problems list */}
      <div className="space-y-3">
        {filtered.map(p => <ProblemCard key={p.id} p={p} />)}
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><Search className="w-8 h-8" /></div>
            <p className="text-slate-400 text-sm">No problems match your search</p>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="text-center text-xs text-slate-600 pb-4">
        CRIMEVERSE AI 2.0 — Built for Smart India Hackathon 2024 · MHA Cybercrime Track
      </div>
    </div>
  )
}
