import { useState } from 'react'
import {
  Zap, Server, Database, Cpu, Shield, Network, Globe, Lock,
  ChevronDown, ChevronUp, Mic, Mail, Bitcoin, Box, Layers, ArrowRight
} from 'lucide-react'

interface Layer {
  id: string
  label: string
  color: string
  gradient: string
  items: string[]
}

const layers: Layer[] = [
  {
    id: 'frontend',
    label: 'Frontend Layer',
    color: 'text-cyber-400',
    gradient: 'from-cyber-600/20 to-blue-600/10',
    items: ['React 18 + TypeScript', 'Vite Build System', 'TailwindCSS', 'React Router v6', 'React Query (TanStack)', 'Recharts (Visualization)', 'Lucide Icons', 'React Hot Toast'],
  },
  {
    id: 'api',
    label: 'API Gateway',
    color: 'text-purple-400',
    gradient: 'from-purple-600/20 to-violet-600/10',
    items: ['Node.js + Express', 'JWT Authentication', 'Rate Limiting', 'CORS + Helmet', 'Multer (File Uploads)', 'Morgan (Logging)', 'Compression Middleware'],
  },
  {
    id: 'ai',
    label: 'AI Intelligence Core',
    color: 'text-amber-400',
    gradient: 'from-amber-600/20 to-orange-600/10',
    items: ['Google Gemini Pro (Primary)', 'Anthropic Claude (Fallback)', 'Mock AI Engine (Demo)', 'NLP Processing Pipeline', 'Computer Vision Module', 'Time-series Analysis'],
  },
  {
    id: 'database',
    label: 'Data Layer',
    color: 'text-emerald-400',
    gradient: 'from-emerald-600/20 to-teal-600/10',
    items: ['MongoDB Atlas', 'Mongoose ODM', 'GridFS (File Storage)', 'Index Optimization', 'Data Encryption at Rest'],
  },
  {
    id: 'security',
    label: 'Security Layer',
    color: 'text-crimson-400',
    gradient: 'from-crimson-600/20 to-rose-600/10',
    items: ['JWT Token Auth', 'Role-based Access Control (RBAC)', 'Input Validation & Sanitization', 'Audit Logging', 'TLS/HTTPS Encryption', 'Rate Limiting per IP'],
  },
]

const modules = [
  { icon: Mic, name: 'VoiceShield AI', route: '/voice-shield', color: 'from-purple-500 to-pink-600', tech: 'Deep Neural Network + MFC Analysis', desc: 'Deepfake audio detection and voice authenticity analysis' },
  { icon: Mail, name: 'MailGuard', route: '/mail-guard', color: 'from-blue-500 to-cyan-600', tech: 'NLP Classification + Header Analysis', desc: 'Phishing detection and email forensics' },
  { icon: Shield, name: 'VeriTrust AI', route: '/veri-trust', color: 'from-emerald-500 to-teal-600', tech: 'OCR + Computer Vision + MRZ Validation', desc: 'Identity document authenticity verification' },
  { icon: Bitcoin, name: 'ChainTrace AI', route: '/chain-trace', color: 'from-amber-500 to-orange-600', tech: 'Graph Analytics + Blockchain API', desc: 'Crypto wallet tracing and transaction analysis' },
  { icon: Network, name: 'Crime Network', route: '/network', color: 'from-rose-500 to-red-600', tech: 'D3.js Force Graph + Neo4j-style Analysis', desc: 'Criminal network mapping and entity relationships' },
  { icon: Cpu, name: 'AI Assistant', route: '/ai-assistant', color: 'from-violet-500 to-purple-600', tech: 'LLM + RAG Pipeline', desc: 'Natural language investigation assistant' },
]

const dataFlow = [
  { from: 'Officer Input', to: 'API Gateway', desc: 'Authenticated REST API request with JWT' },
  { from: 'API Gateway', to: 'Intelligence Module', desc: 'Routed to relevant AI module controller' },
  { from: 'Intelligence Module', to: 'AI Engine', desc: 'Feature extraction and model inference' },
  { from: 'AI Engine', to: 'MongoDB', desc: 'Results persisted with full audit trail' },
  { from: 'MongoDB', to: 'Entity/Alert Engine', desc: 'Triggers entity extraction and alert generation' },
  { from: 'Entity/Alert Engine', to: 'Officer Dashboard', desc: 'Real-time update via React Query polling' },
]

export default function ArchitecturePage() {
  const [expandedLayer, setExpandedLayer] = useState<string | null>('frontend')

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Zap className="w-6 h-6 text-cyber-400" />
          System Architecture
        </h1>
        <p className="page-subtitle">Technical architecture and technology stack of CRIMEVERSE AI 2.0</p>
      </div>

      {/* High-level diagram */}
      <div className="card p-6">
        <h2 className="font-bold text-slate-200 mb-6 flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyber-400" /> System Overview
        </h2>
        <div className="relative">
          {/* Architecture boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Globe, label: 'Client Layer', sub: 'React + TypeScript', color: 'from-cyber-500 to-blue-600', items: ['Dashboard', 'Intelligence Modules', 'Reports & Analytics'] },
              { icon: Server, label: 'Application Layer', sub: 'Node.js + Express', color: 'from-purple-500 to-violet-600', items: ['REST API (JWT Auth)', 'AI Controllers', 'File Upload (Multer)'] },
              { icon: Database, label: 'Data Layer', sub: 'MongoDB Atlas', color: 'from-emerald-500 to-teal-600', items: ['Cases & Evidence', 'Analyses History', 'Alerts & Reports'] },
            ].map(({ icon: Icon, label, sub, color, items }) => (
              <div key={label} className="border border-slate-700/50 rounded-xl p-4 bg-slate-800/30">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="font-bold text-slate-200 text-sm">{label}</div>
                <div className="text-xs text-slate-500 mb-3">{sub}</div>
                <ul className="space-y-1.5">
                  {items.map(item => (
                    <li key={item} className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* AI Engine box */}
          <div className="mt-4 border border-amber-600/30 rounded-xl p-4 bg-amber-600/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-amber-300">AI Intelligence Engine</div>
                <div className="text-xs text-amber-600">Google Gemini Pro · Anthropic Claude · Mock Engine (Demo)</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {modules.map(({ icon: Icon, name, color }) => (
                <div key={name} className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-slate-800/60">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[9px] text-slate-400 text-center leading-tight">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Intelligence Modules */}
      <div>
        <h2 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Box className="w-5 h-5 text-purple-400" /> Intelligence Modules
        </h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {modules.map(({ icon: Icon, name, color, tech, desc }) => (
            <div key={name} className="card p-4 hover:border-cyber-600/40 transition-all">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-slate-200 text-sm">{name}</div>
                  <div className="text-[10px] text-cyber-400 font-medium mt-0.5">{tech}</div>
                  <div className="text-xs text-slate-400 mt-1.5 leading-relaxed">{desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Flow */}
      <div>
        <h2 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
          <ArrowRight className="w-5 h-5 text-emerald-400" /> Data Flow
        </h2>
        <div className="card overflow-hidden">
          <div className="divide-y divide-slate-800/50">
            {dataFlow.map((step, i) => (
              <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-800/20 transition-colors">
                <div className="w-6 h-6 rounded-full bg-cyber-600/20 border border-cyber-600/30 flex items-center justify-center text-[10px] font-bold text-cyber-400 flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-sm font-semibold text-slate-200 whitespace-nowrap">{step.from}</span>
                  <ArrowRight className="w-3 h-3 text-cyber-500 flex-shrink-0" />
                  <span className="text-sm font-semibold text-slate-200 whitespace-nowrap">{step.to}</span>
                </div>
                <p className="text-xs text-slate-500 flex-shrink-0 hidden md:block max-w-[250px] text-right">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tech Stack Layers */}
      <div>
        <h2 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" /> Technology Stack
        </h2>
        <div className="space-y-2">
          {layers.map((layer) => (
            <div key={layer.id} className={`card overflow-hidden border-slate-700/50 bg-gradient-to-r ${layer.gradient}`}>
              <button onClick={() => setExpandedLayer(expandedLayer === layer.id ? null : layer.id)}
                className="w-full flex items-center justify-between p-4">
                <span className={`font-bold ${layer.color}`}>{layer.label}</span>
                {expandedLayer === layer.id
                  ? <ChevronUp className="w-4 h-4 text-slate-400" />
                  : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {expandedLayer === layer.id && (
                <div className="px-4 pb-4 animate-fade-in">
                  <div className="flex flex-wrap gap-2">
                    {layer.items.map(item => (
                      <span key={item} className="tag">{item}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Security Compliance */}
      <div className="card p-6">
        <h2 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-400" /> Security & Compliance
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Authentication', items: ['JWT tokens (15 min expiry)', 'Bcrypt password hashing (12 rounds)', 'Role-based access control (4 roles)'] },
            { title: 'Data Protection', items: ['MongoDB encryption at rest', 'TLS/HTTPS in transit', 'File upload sanitization'] },
            { title: 'API Security', items: ['Rate limiting (100 req/15min)', 'Helmet.js security headers', 'CORS origin restriction'] },
            { title: 'Audit & Compliance', items: ['All actions logged with timestamps', 'User activity audit trail', 'Evidence chain of custody'] },
            { title: 'AI Ethics', items: ['Mandatory disclaimers on all AI output', 'Human-in-the-loop validation', 'No autonomous decision-making'] },
            { title: 'Scalability', items: ['Stateless API design', 'MongoDB horizontal scaling', 'Docker-ready containerization'] },
          ].map(({ title, items }) => (
            <div key={title} className="bg-slate-800/30 rounded-xl p-4">
              <div className="text-sm font-bold text-slate-300 mb-2">{title}</div>
              <ul className="space-y-1">
                {items.map(item => (
                  <li key={item} className="text-xs text-slate-500 flex items-start gap-1.5">
                    <span className="text-emerald-400 flex-shrink-0 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
