import { Link, useNavigate } from 'react-router-dom'
import { Zap, Shield, Mic, Mail, Bitcoin, Network, Cpu, ArrowRight, CheckCircle } from 'lucide-react'

const modules = [
  { icon: Mic, name: 'VoiceShield AI', desc: 'Detect synthetic & cloned voice impersonation attacks', color: 'from-purple-500 to-pink-600', problem: 'SIH26104' },
  { icon: Mail, name: 'MailGuard Intelligence', desc: 'Email threat detection, geolocation & forensic analysis', color: 'from-blue-500 to-cyan-600', problem: 'SIH26106' },
  { icon: Shield, name: 'VeriTrust AI', desc: 'AI-based fake identity & document screening system', color: 'from-emerald-500 to-teal-600', problem: 'SIH26188' },
  { icon: Bitcoin, name: 'ChainTrace AI', desc: 'Fraud-linked cryptocurrency exchange identification', color: 'from-amber-500 to-orange-600', problem: 'SIH26183' },
  { icon: Network, name: 'CRIMEVERSE Network', desc: 'Criminal network analysis & relationship mapping', color: 'from-rose-500 to-red-600', problem: 'SIH26189' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen cyber-bg text-slate-100">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-cyber-600/20 backdrop-blur-md bg-slate-950/80 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyber-500 to-purple-600 flex items-center justify-center shadow-cyber">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">CRIMEVERSE AI</div>
            <div className="text-[10px] text-cyber-400">2.0 — Intelligence Platform</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 py-24 text-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <div className="w-[600px] h-[600px] rounded-full border-2 border-cyber-500 animate-pulse-slow" />
          <div className="absolute w-[400px] h-[400px] rounded-full border border-cyber-500" />
          <div className="absolute w-[200px] h-[200px] rounded-full border border-purple-500" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-600/10 border border-cyber-600/30 text-cyber-400 text-xs font-semibold mb-8">
            <span className="w-2 h-2 bg-cyber-400 rounded-full animate-pulse" />
            SIH 2024 — 5 Problem Statements, ONE Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="text-gradient-blue">CRIMEVERSE</span>
            <br />
            <span className="text-white">AI 2.0</span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Unified Multi-Source Crime Intelligence & Prevention Platform.
            Voice • Email • Identity • Blockchain • Network — fused by AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/login')} className="btn-primary text-base px-8 py-3 rounded-xl">
              Launch Platform <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/register')} className="btn-secondary text-base px-8 py-3 rounded-xl">
              Create Account
            </button>
          </div>
          {/* Demo credentials */}
          <div className="mt-8 inline-flex flex-col items-center gap-1 px-6 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Demo Access</p>
            <p className="text-xs text-slate-400"><span className="text-slate-300">Email:</span> admin@crimeverse.demo</p>
            <p className="text-xs text-slate-400"><span className="text-slate-300">Password:</span> CrimeVerse@2024!</p>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">5 Intelligence Modules, 1 Platform</h2>
        <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">Each module maps to a specific SIH 2024 problem statement. Together, they form a unified crime intelligence ecosystem.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <div key={mod.name} className="card p-6 hover:border-cyber-600/50 transition-all duration-300 group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <mod.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{mod.problem}</div>
              <h3 className="text-lg font-bold text-white mb-2">{mod.name}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{mod.desc}</p>
            </div>
          ))}
          <div className="card p-6 bg-gradient-to-br from-cyber-600/10 to-purple-600/10 border-cyber-600/40 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyber-500 to-purple-600 flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Intelligence Core</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Cross-module entity correlation, risk fusion, and explainable investigation reports.</p>
            </div>
            <div className="mt-4 space-y-2">
              {['Multi-source fusion', 'Risk indicators', 'Investigation chatbot'].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center border-t border-cyber-600/20">
        <h2 className="text-3xl font-bold mb-4">Ready to investigate?</h2>
        <p className="text-slate-400 mb-8">Use demo credentials to explore Operation Phoenix — a complete synthetic investigation case.</p>
        <button onClick={() => navigate('/login')} className="btn-primary text-lg px-10 py-4 rounded-xl">
          Open CRIMEVERSE AI 2.0 <ArrowRight className="w-5 h-5" />
        </button>
      </section>

      <footer className="border-t border-cyber-600/20 py-8 text-center text-xs text-slate-600">
        CRIMEVERSE AI 2.0 — SIH 2024 | For authorized investigative use only | AI outputs require human expert review
      </footer>
    </div>
  )
}
