import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useActiveCase } from '../context/CaseContext'
import { useLanguage } from '../context/LanguageContext'
import ChatWidget from '../components/ChatWidget'
import SosBroadcastModal from '../components/SosBroadcastModal'
import LanguageSwitcher from '../components/LanguageSwitcher'
import AccessibilityPanel from '../components/AccessibilityPanel'
import CaseSwitcherModal from '../components/CaseSwitcherModal'
import {
  LayoutDashboard, Search, Mic, Mail, FileText, Bitcoin, Network, Shield, Bell, BarChart3,
  Settings, LogOut, ChevronLeft, ChevronRight, Zap, AlertTriangle, BookOpen, Cpu,
  Menu, X, FileSearch, Video, MapPin, Radio, Siren, Scale, GitBranch, ShieldAlert,
  Compass, FileCheck, Briefcase, Eye, UserCheck
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { alertsAPI } from '../api'

export default function AppLayout() {
  const { user, logout, updateUser } = useAuth()
  const { activeCase } = useActiveCase()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sosOpen, setSosOpen] = useState(false)
  const [caseModalOpen, setCaseModalOpen] = useState(false)
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)

  const { data: alertsData } = useQuery({
    queryKey: ['alerts-unread'],
    queryFn: () => alertsAPI.getAll({ isRead: false }),
    refetchInterval: 30000,
  })
  const unreadCount = alertsData?.data?.pagination?.total || 0

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleColors: Record<string, string> = {
    ADMIN: 'text-crimson-400 bg-crimson-950/60 border-crimson-800',
    SUPERVISOR: 'text-amber-400 bg-amber-950/60 border-amber-800',
    INVESTIGATOR: 'text-cyber-400 bg-cyber-950/60 border-cyber-800',
    CITIZEN: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
    ANALYST: 'text-purple-400 bg-purple-950/60 border-purple-800',
    VIEWER: 'text-slate-400 bg-slate-900 border-slate-700',
  }

  // Quick switch role for testing RBAC
  const handleQuickSwitchRole = (newRole: string) => {
    if (user && updateUser) {
      updateUser({ ...user, role: newRole as any })
    }
    setRoleMenuOpen(false)
  }

  const navGroups = [
    {
      label: 'Citizen Services',
      items: [
        { to: '/complaints', icon: FileCheck, label: t('complaints') },
      ],
    },
    {
      label: 'Case Operations',
      items: [
        { to: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
        { to: '/investigations', icon: Search, label: t('investigations') },
        { to: '/case-map', icon: Compass, label: t('caseMap') },
        { to: '/escalations', icon: ShieldAlert, label: t('escalations') },
        { to: '/evidence', icon: FileSearch, label: t('evidenceLocker') },
        { to: '/alerts', icon: Bell, label: t('alerts'), badge: true },
      ],
    },
    {
      label: 'Tactical Field',
      items: [
        { to: '/cctv', icon: Video, label: 'Live CCTV Wall' },
        { to: '/map', icon: MapPin, label: 'Tactical Map' },
        { to: '/dispatch', icon: Radio, label: 'Emergency SMS' },
      ],
    },
    {
      label: 'Intelligence & Audit',
      items: [
        { to: '/challenge-ai', icon: Scale, label: t('challengeAi') },
        { to: '/what-if', icon: GitBranch, label: t('whatIfSimulation') },
        { to: '/network', icon: Network, label: t('crimeNetwork') },
        { to: '/voice-shield', icon: Mic, label: 'VoiceShield AI' },
        { to: '/mail-guard', icon: Mail, label: 'MailGuard' },
        { to: '/veri-trust', icon: Shield, label: 'VeriTrust AI' },
        { to: '/chain-trace', icon: Bitcoin, label: 'ChainTrace AI' },
      ],
    },
    {
      label: 'Analysis & Architecture',
      items: [
        { to: '/ai-assistant', icon: Cpu, label: 'AI Assistant' },
        { to: '/reports', icon: FileText, label: t('reports') },
        { to: '/analytics', icon: BarChart3, label: t('analytics') },
        { to: '/sih-problems', icon: BookOpen, label: 'SIH Problems' },
        { to: '/architecture', icon: Zap, label: 'Architecture' },
      ],
    },
  ]

  return (
    <div className="flex h-screen overflow-hidden cyber-bg">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative z-50 flex flex-col h-full bg-slate-900/95 backdrop-blur-md border-r border-cyber-600/20
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-cyber-600/20 min-h-[64px]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-cyber">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-white leading-tight tracking-wider">CRIMEVERSE</div>
              <div className="text-[11px] text-cyber-400 font-mono font-medium">ENTERPRISE 2.0</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-colors hidden lg:flex"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button onClick={() => setMobileOpen(false)} className="ml-auto p-1 text-slate-400 hover:text-white lg:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <div className="px-2 mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{group.label}</div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span className="truncate text-xs font-medium">{item.label}</span>}
                    {item.badge && unreadCount > 0 && !collapsed && (
                      <span className="ml-auto bg-crimson-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                    {item.badge && unreadCount > 0 && collapsed && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-crimson-500 rounded-full" />
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-cyber-600/20 p-3 space-y-1 bg-slate-950/40">
          <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyber-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <div className="text-xs font-semibold text-slate-200 truncate">{user?.name}</div>
                <div className="text-[10px] font-mono text-slate-400">{user?.role}</div>
              </div>
            )}
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`}>
            <Settings className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="text-xs">{t('settings')}</span>}
          </NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="text-xs">Admin Panel</span>}
            </NavLink>
          )}
          <button onClick={handleLogout} className={`nav-item w-full text-crimson-400 hover:text-crimson-300 hover:bg-crimson-600/10 ${collapsed ? 'justify-center' : ''}`}>
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="text-xs">{t('logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-2.5 bg-slate-900/90 backdrop-blur-md border-b border-cyber-600/20 min-h-[64px]">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 lg:hidden">
            <Menu className="w-5 h-5" />
          </button>

          {/* Active Case Context Badge & Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCaseModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/90 border border-slate-700 text-xs text-slate-200 transition group"
              title="Click to switch active investigation case"
            >
              <Briefcase className="w-3.5 h-3.5 text-cyber-400" />
              <span className="text-slate-400 hidden sm:inline">Active Case:</span>
              <span className="font-mono font-bold text-white group-hover:text-cyber-300">
                {activeCase ? (activeCase.caseNumber || activeCase.caseId) : 'NO ACTIVE CASE'}
              </span>

              {activeCase && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  (activeCase.riskScore || 0) >= 70 ? 'bg-red-950 text-red-400 border border-red-800' :
                  (activeCase.riskScore || 0) >= 40 ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                  'bg-blue-950 text-blue-400 border border-blue-800'
                }`}>
                  Risk {activeCase.riskScore || 0}
                </span>
              )}
            </button>
          </div>

          <div className="flex-1" />

          {/* RBAC Role Simulator Quick Toggle */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition ${
                roleColors[user?.role || 'INVESTIGATOR'] || 'text-slate-300 bg-slate-800 border-slate-700'
              }`}
              title="Test view as another role (Citizen, Investigator, Supervisor, Admin)"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-mono">{user?.role || 'INVESTIGATOR'}</span>
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-50 text-xs">
                <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-500">Switch Role View</div>
                {['CITIZEN', 'INVESTIGATOR', 'SUPERVISOR', 'ADMIN'].map(r => (
                  <button
                    key={r}
                    onClick={() => handleQuickSwitchRole(r)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg font-medium transition ${
                      user?.role === r ? 'bg-cyber-600/30 text-cyber-300' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Multi-Language Switcher */}
          <LanguageSwitcher />

          {/* Accessibility Settings Tool Panel */}
          <AccessibilityPanel />

          {/* Emergency SOS Quick Button */}
          <button
            onClick={() => setSosOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-crimson-600/20 border border-crimson-500/50 hover:bg-crimson-600/40 text-crimson-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-crimson-950/50 animate-pulse"
            title="Trigger Code Red Emergency Broadcast"
          >
            <Siren className="w-4 h-4 text-crimson-400" />
            <span className="hidden xl:inline">EMERGENCY SOS</span>
          </button>

          {/* Alerts Bell */}
          <NavLink to="/alerts" className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-crimson-500 rounded-full" />
            )}
          </NavLink>

          {/* Profile link */}
          <NavLink to="/profile" className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-700/50 transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyber-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-slate-300 hidden sm:block">{user?.name}</span>
          </NavLink>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Global AI chat widget */}
      <ChatWidget />

      {/* Global Emergency SOS Broadcast Modal */}
      <SosBroadcastModal isOpen={sosOpen} onClose={() => setSosOpen(false)} />

      {/* Global Active Case Switcher Modal */}
      <CaseSwitcherModal isOpen={caseModalOpen} onClose={() => setCaseModalOpen(false)} />
    </div>
  )
}
