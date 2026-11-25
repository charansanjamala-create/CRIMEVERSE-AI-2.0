import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, Eye, EyeOff, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back to CRIMEVERSE AI 2.0')
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemo = (role: string) => {
    const creds: Record<string, [string, string]> = {
      admin: ['admin@crimeverse.demo', 'CrimeVerse@2024!'],
      investigator: ['investigator@crimeverse.demo', 'CrimeVerse@2024!'],
      analyst: ['analyst@crimeverse.demo', 'CrimeVerse@2024!'],
    }
    const [e, p] = creds[role]
    setEmail(e); setPassword(p)
  }

  return (
    <div className="min-h-screen cyber-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyber-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-cyber-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">CRIMEVERSE AI</h1>
          <p className="text-slate-400 text-sm mt-1">Intelligence Platform 2.0</p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-bold text-white mb-6">Sign In</h2>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-crimson-600/10 border border-crimson-600/30 text-crimson-400 text-sm mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="agent@crimeverse.demo" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="input pr-10" placeholder="••••••••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button id="login-submit" type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-2.5 text-base">
              {isLoading ? <><div className="spinner w-4 h-4" /> Authenticating...</> : 'Sign In to Platform'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <p className="text-xs text-slate-500 text-center mb-3 font-semibold uppercase tracking-wider">Quick Demo Access</p>
            <div className="grid grid-cols-3 gap-2">
              {[['admin', 'Admin'], ['investigator', 'Investigator'], ['analyst', 'Analyst']].map(([key, label]) => (
                <button key={key} onClick={() => fillDemo(key)} className="py-2 px-2 rounded-lg text-xs font-medium border border-slate-700/50 hover:border-cyber-600/50 text-slate-400 hover:text-cyber-400 transition-all bg-slate-800/50 hover:bg-slate-800">
                  {label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-600 text-center mt-2">Click role → then Sign In</p>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          No account? <Link to="/register" className="text-cyber-400 hover:text-cyber-300 font-medium">Create one</Link>
        </p>
        <p className="text-center text-xs text-slate-700 mt-4">
          For authorized investigative use only
        </p>
      </div>
    </div>
  )
}
