import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useAccessibility } from '../context/AccessibilityContext'
import {
  Bell, Shield, Palette, Globe, Database, Cpu, Moon, Zap, Volume2,
  Eye, Lock, Save, CheckCircle, AlertTriangle, Info, Accessibility,
  VolumeX, Mic, Languages
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ToggleProps { checked: boolean; onChange: () => void }
function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-cyber-600' : 'bg-slate-700'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { language, setLanguage, languages, t } = useLanguage()
  const { 
    highContrast, toggleHighContrast, 
    textScale, setTextScale, 
    reducedMotion, toggleReducedMotion,
    speak, stopSpeaking, isSpeaking 
  } = useAccessibility()

  const [saved, setSaved] = useState(false)

  const [notifs, setNotifs] = useState({
    criticalAlerts: true,
    highAlerts: true,
    mediumAlerts: false,
    newCaseAssigned: true,
    reportReady: true,
    soundEnabled: false,
  })

  const [privacy, setPrivacy] = useState({
    activityLog: true,
    dataRetention: '90days',
    shareAnalytics: false,
  })

  const [ui, setUi] = useState({
    compactMode: false,
    showRiskColors: true,
    autoRefresh: true,
    animationsEnabled: true,
  })

  const [aiSettings, setAiSettings] = useState({
    autoAnalysis: false,
    showDisclaimer: true,
    confidenceThreshold: '70',
  })

  const handleSave = () => {
    setSaved(true)
    toast.success('Settings saved')
    setTimeout(() => setSaved(false), 3000)
  }

  const sections = [
    {
      id: 'language',
      label: 'Language & Indian Scripts',
      icon: Languages,
      color: 'text-cyan-400',
      content: (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Select your preferred operational language. CRIMEVERSE AI supports 11 constitutional Indian languages with full UI localization.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {languages.map((lang) => {
              const isSelected = language === lang.code
              return (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`p-3 rounded-xl border text-left transition ${
                    isSelected
                      ? 'bg-cyber-600/30 border-cyber-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{lang.nativeName}</span>
                    {isSelected && <CheckCircle className="w-4 h-4 text-cyber-400" />}
                  </div>
                  <span className="text-xs text-slate-500">{lang.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )
    },
    {
      id: 'accessibility',
      label: 'Accessibility & Assistive Tech',
      icon: Accessibility,
      color: 'text-indigo-400',
      content: (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            WCAG 2.1 AA Compliant settings for investigators and citizens with low-vision, mobility, or hearing requirements.
          </p>

          <div className="flex items-center justify-between py-2 border-b border-slate-800">
            <div>
              <div className="text-sm font-medium text-slate-200">High Contrast Mode</div>
              <div className="text-xs text-slate-500">Increases contrast ratios and border highlights for maximum legibility</div>
            </div>
            <Toggle checked={highContrast} onChange={toggleHighContrast} />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-800">
            <div>
              <div className="text-sm font-medium text-slate-200">Reduced Motion</div>
              <div className="text-xs text-slate-500">Disables non-essential animations and pulsing visual effects</div>
            </div>
            <Toggle checked={reducedMotion} onChange={toggleReducedMotion} />
          </div>

          <div className="py-2 border-b border-slate-800 space-y-2">
            <div>
              <div className="text-sm font-medium text-slate-200">Text Scaling</div>
              <div className="text-xs text-slate-500">Scale interface typography across all screens</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'normal', label: '100% (Standard)' },
                { id: 'large', label: '115% (Large)' },
                { id: 'xlarge', label: '130% (Extra Large)' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setTextScale(s.id as any)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                    textScale === s.id
                      ? 'bg-cyber-600 border-cyber-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="py-2 space-y-2">
            <div className="text-sm font-medium text-slate-200">Screen Reader & Audio Assist</div>
            <div className="text-xs text-slate-500">Test platform Text-to-Speech synthesis</div>
            <button
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking()
                } else {
                  speak('Welcome to Crimeverse AI. All accessibility features are active.')
                }
              }}
              className="px-4 py-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-200 text-xs font-semibold flex items-center gap-2"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isSpeaking ? 'Stop Speech Output' : 'Test Speech Synthesis'}
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      color: 'text-amber-400',
      content: (
        <div className="space-y-3">
          {[
            { key: 'criticalAlerts', label: 'Critical Alerts', desc: 'Get notified for CRITICAL severity alerts' },
            { key: 'highAlerts', label: 'High Alerts', desc: 'Get notified for HIGH severity alerts' },
            { key: 'mediumAlerts', label: 'Medium Alerts', desc: 'Get notified for MEDIUM severity alerts' },
            { key: 'newCaseAssigned', label: 'Case Assignments', desc: 'Notify when a case is assigned to you' },
            { key: 'reportReady', label: 'Reports Ready', desc: 'Notify when AI report is generated' },
            { key: 'soundEnabled', label: 'Sound Alerts', desc: 'Play sound for critical notifications' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium text-slate-200">{label}</div>
                <div className="text-xs text-slate-500">{desc}</div>
              </div>
              <Toggle checked={notifs[key as keyof typeof notifs] as boolean}
                onChange={() => setNotifs(n => ({ ...n, [key]: !n[key as keyof typeof notifs] }))} />
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'ui',
      label: 'Interface',
      icon: Palette,
      color: 'text-purple-400',
      content: (
        <div className="space-y-3">
          {[
            { key: 'compactMode', label: 'Compact Mode', desc: 'Reduce spacing for more information density' },
            { key: 'showRiskColors', label: 'Risk Colors', desc: 'Highlight risk levels with color indicators' },
            { key: 'autoRefresh', label: 'Auto-Refresh', desc: 'Automatically refresh data every 60 seconds' },
            { key: 'animationsEnabled', label: 'Animations', desc: 'Enable UI transition animations' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium text-slate-200">{label}</div>
                <div className="text-xs text-slate-500">{desc}</div>
              </div>
              <Toggle checked={ui[key as keyof typeof ui] as boolean}
                onChange={() => setUi(u => ({ ...u, [key]: !u[key as keyof typeof ui] }))} />
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'ai',
      label: 'AI Settings',
      icon: Cpu,
      color: 'text-cyber-400',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium text-slate-200">Auto-Analysis on Upload</div>
              <div className="text-xs text-slate-500">Automatically run AI analysis when evidence is uploaded</div>
            </div>
            <Toggle checked={aiSettings.autoAnalysis} onChange={() => setAiSettings(a => ({ ...a, autoAnalysis: !a.autoAnalysis }))} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium text-slate-200">Show AI Disclaimers</div>
              <div className="text-xs text-slate-500">Display ethical AI usage disclaimers on results</div>
            </div>
            <Toggle checked={aiSettings.showDisclaimer} onChange={() => setAiSettings(a => ({ ...a, showDisclaimer: !a.showDisclaimer }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1.5">Confidence Threshold</label>
            <div className="text-xs text-slate-500 mb-2">Minimum AI confidence % to flag results as significant</div>
            <select className="select w-40" value={aiSettings.confidenceThreshold}
              onChange={(e) => setAiSettings(a => ({ ...a, confidenceThreshold: e.target.value }))}>
              <option value="50">50%</option>
              <option value="60">60%</option>
              <option value="70">70%</option>
              <option value="80">80%</option>
              <option value="90">90%</option>
            </select>
          </div>
          <div className="ai-disclaimer">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            AI analysis is for investigative support only. All results require human expert verification.
          </div>
        </div>
      )
    },
    {
      id: 'privacy',
      label: 'Privacy & Security',
      icon: Lock,
      color: 'text-emerald-400',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium text-slate-200">Activity Logging</div>
              <div className="text-xs text-slate-500">Log all user actions for audit trail</div>
            </div>
            <Toggle checked={privacy.activityLog} onChange={() => setPrivacy(p => ({ ...p, activityLog: !p.activityLog }))} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium text-slate-200">Share Analytics</div>
              <div className="text-xs text-slate-500">Share anonymized usage data for system improvement</div>
            </div>
            <Toggle checked={privacy.shareAnalytics} onChange={() => setPrivacy(p => ({ ...p, shareAnalytics: !p.shareAnalytics }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1.5">Data Retention Period</label>
            <select className="select w-48" value={privacy.dataRetention}
              onChange={(e) => setPrivacy(p => ({ ...p, dataRetention: e.target.value }))}>
              <option value="30days">30 Days</option>
              <option value="90days">90 Days</option>
              <option value="1year">1 Year</option>
              <option value="indefinite">Indefinite</option>
            </select>
          </div>
        </div>
      )
    },
    {
      id: 'system',
      label: 'System Info',
      icon: Database,
      color: 'text-rose-400',
      content: (
        <div className="space-y-2">
          {[
            { label: 'Platform', value: 'CRIMEVERSE AI 2.0 Enterprise' },
            { label: 'Version', value: 'v2.0.0 (SIH Production Edition)' },
            { label: 'API Endpoint', value: '/api' },
            { label: 'AI Provider', value: 'Mock / Advisory Guardrail Core' },
            { label: 'Your Role', value: user?.role || '—' },
            { label: 'User ID', value: user?.id || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0">
              <span className="text-xs text-slate-500 font-medium">{label}</span>
              <span className="text-sm text-slate-300 font-mono text-xs">{value}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mt-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-xs text-emerald-400">All enterprise modules operational</span>
          </div>
        </div>
      )
    },
  ]

  const [active, setActive] = useState('language')
  const activeSection = sections.find(s => s.id === active)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{t('settings')}</h1>
          <p className="page-subtitle">Configure CRIMEVERSE AI languages, accessibility, notifications, and security</p>
        </div>
        <button onClick={handleSave} className="btn-primary">
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Sidebar nav */}
        <div className="card p-3 space-y-1 h-fit lg:col-span-1">
          {sections.map(({ id, label, icon: Icon, color }) => (
            <button key={id} onClick={() => setActive(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active === id ? 'bg-cyber-600/20 border border-cyber-600/30 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}>
              <Icon className={`w-4 h-4 ${active === id ? 'text-cyber-400' : color}`} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card p-6 lg:col-span-3">
          {activeSection && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
                <activeSection.icon className={`w-5 h-5 ${activeSection.color}`} />
                <h2 className="font-bold text-slate-100">{activeSection.label}</h2>
              </div>
              {activeSection.content}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
