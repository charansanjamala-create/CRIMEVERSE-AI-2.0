import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, Search, Zap } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen cyber-bg flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* Glowing 404 */}
        <div className="relative mb-8">
          <div className="text-[8rem] font-black text-slate-900 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 text-[8rem] font-black leading-none select-none text-transparent"
            style={{ WebkitTextStroke: '2px rgba(59, 109, 245, 0.3)' }}>
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyber-500 to-purple-600 flex items-center justify-center shadow-cyber">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-black text-white mb-2">Page Not Found</h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          The intelligence module or page you're looking for doesn't exist or has been moved.
          Return to the dashboard to continue your investigation.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button onClick={() => navigate(-1)} className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            <Home className="w-4 h-4" /> Dashboard
          </button>
          <button onClick={() => navigate('/investigations')} className="btn-secondary">
            <Search className="w-4 h-4" /> Investigations
          </button>
        </div>

        <div className="mt-12 text-xs text-slate-700 font-mono">
          CRIMEVERSE AI 2.0 — Error 404
        </div>
      </div>
    </div>
  )
}
