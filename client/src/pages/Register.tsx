import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'ANALYST' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setIsLoading(true)
    try {
      await register(form.name, form.email, form.password, form.role)
      toast.success('Account created! Welcome to CRIMEVERSE AI 2.0')
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.')
    } finally { setIsLoading(false) }
  }

  return (
    <div className="min-h-screen cyber-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyber-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-cyber-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">CRIMEVERSE AI 2.0</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-crimson-600/10 border border-crimson-600/30 text-crimson-400 text-sm mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <input id="reg-name" type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" placeholder="Agent Name" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <input id="reg-email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input" placeholder="agent@agency.gov" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <input id="reg-password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input" placeholder="Min. 6 characters" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
              <select id="reg-role" value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="select">
                <option value="ANALYST">Analyst</option>
                <option value="INVESTIGATOR">Investigator</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>
            <button id="reg-submit" type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-2.5 text-base">
              {isLoading ? <><div className="spinner w-4 h-4" /> Creating account...</> : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account? <Link to="/login" className="text-cyber-400 hover:text-cyber-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
