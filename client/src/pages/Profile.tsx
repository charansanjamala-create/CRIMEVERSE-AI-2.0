import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import { User, Mail, Shield, Camera, Save, AlertTriangle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const roleColors: Record<string, string> = {
  ADMIN: 'badge-critical',
  INVESTIGATOR: 'badge-info',
  ANALYST: 'badge-medium',
  VIEWER: 'badge',
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [saved, setSaved] = useState(false)

  const { data } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authAPI.getMe(),
  })

  const profileData = data?.data?.user

  const updateMutation = useMutation({
    mutationFn: () => authAPI.updateProfile(form),
    onSuccess: (res) => {
      toast.success('Profile updated')
      setSaved(true)
      // Update auth context with new user data
      const updatedUser = res.data?.user
      if (updatedUser) {
        updateUser(updatedUser)
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setTimeout(() => setSaved(false), 3000)
    },
    onError: () => toast.error('Failed to update profile'),
  })

  const u = profileData || user

  const stats = [
    { label: 'Cases Created', value: u?.stats?.casesCreated ?? 0 },
    { label: 'Cases Assigned', value: u?.stats?.casesAssigned ?? 0 },
    { label: 'Analyses Run', value: u?.stats?.analysesRun ?? 0 },
    { label: 'Reports Generated', value: u?.stats?.reportsGenerated ?? 0 },
  ]

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account information and preferences</p>
      </div>

      {/* Profile header card */}
      <div className="card p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyber-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-cyber">
              {u?.name?.[0]?.toUpperCase()}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600 hover:bg-slate-600 transition-colors">
              <Camera className="w-3.5 h-3.5 text-slate-300" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{u?.name}</h2>
            <p className="text-slate-400 text-sm">{u?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`badge ${roleColors[u?.role || ''] || 'badge'}`}>{u?.role}</span>
              <span className={`badge ${u?.isActive ? 'badge-low' : 'badge-high'}`}>
                {u?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          {stats.map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-black text-white">{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit profile */}
      <div className="card p-6 space-y-5">
        <h3 className="font-bold text-slate-200 flex items-center gap-2">
          <User className="w-4 h-4 text-cyber-400" /> Personal Information
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Role</label>
            <div className="input opacity-60 cursor-not-allowed">{u?.role} (Cannot be changed by user)</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} className="btn-primary">
            {saved ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            {updateMutation.isPending ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Security card */}
      <div className="card p-6 space-y-4">
        <h3 className="font-bold text-slate-200 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" /> Security
        </h3>

        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div>
            <div className="text-sm font-medium text-slate-200">Password</div>
            <div className="text-xs text-slate-500">Last changed: Never</div>
          </div>
          <button className="btn-secondary text-xs">Change Password</button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div>
            <div className="text-sm font-medium text-slate-200">Two-Factor Authentication</div>
            <div className="text-xs text-slate-500">Add an extra layer of security</div>
          </div>
          <button className="btn-secondary text-xs">Enable 2FA</button>
        </div>

        <div className="ai-disclaimer">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          All access to this system is logged and monitored. Unauthorized access is prohibited.
        </div>
      </div>

      {/* Account info */}
      <div className="card p-6 space-y-3">
        <h3 className="font-bold text-slate-200 flex items-center gap-2">
          <Mail className="w-4 h-4 text-cyber-400" /> Account Details
        </h3>
        {[
          { label: 'User ID', value: u?._id || '—' },
          { label: 'Member Since', value: u?.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
          { label: 'Last Login', value: u?.lastLogin ? new Date(u.lastLogin).toLocaleString() : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0">
            <span className="text-xs text-slate-500 font-medium">{label}</span>
            <span className="text-sm text-slate-300 font-mono text-xs">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
