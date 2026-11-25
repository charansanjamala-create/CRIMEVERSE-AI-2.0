import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { AccessibilityProvider } from './context/AccessibilityContext'
import { CaseProvider } from './context/CaseContext'
import AppLayout from './layouts/AppLayout'

// Pages
import LandingPage from './pages/Landing'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import DashboardPage from './pages/Dashboard'
import InvestigationsPage from './pages/Investigations'
import InvestigationDetailPage from './pages/InvestigationDetail'
import VoiceShieldPage from './pages/VoiceShield'
import MailGuardPage from './pages/MailGuard'
import VeriTrustPage from './pages/VeriTrust'
import ChainTracePage from './pages/ChainTrace'
import NetworkPage from './pages/Network'
import EvidencePage from './pages/Evidence'
import AIAssistantPage from './pages/AIAssistant'
import AlertsPage from './pages/Alerts'
import ReportsPage from './pages/Reports'
import AnalyticsPage from './pages/Analytics'
import ProfilePage from './pages/Profile'
import SettingsPage from './pages/Settings'
import AdminPage from './pages/Admin'
import SIHPage from './pages/SIHProblems'
import ArchitecturePage from './pages/Architecture'
import CCTVPage from './pages/CCTV'
import TacticalMapPage from './pages/TacticalMap'
import EmergencyDispatchPage from './pages/EmergencyDispatch'
import NotFoundPage from './pages/NotFound'

// New Enterprise & Citizen Modules
import ComplaintsPage from './pages/Complaints'
import ChallengeAIPage from './pages/ChallengeAI'
import WhatIfSimulationPage from './pages/WhatIfSimulation'
import EscalationsPage from './pages/Escalations'
import CaseMapPage from './pages/CaseMap'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return (
    <div className="min-h-screen cyber-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-cyber-600/20 border-t-cyber-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Loading CRIMEVERSE AI 2.0...</p>
      </div>
    </div>
  )
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      {/* Citizen Complaint Portal is publicly accessible directly without requiring investigator login */}
      <Route path="/report" element={<ComplaintsPage />} />

      {/* Protected — inside AppLayout */}
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="complaints" element={<ComplaintsPage />} />
        <Route path="cctv" element={<CCTVPage />} />
        <Route path="map" element={<TacticalMapPage />} />
        <Route path="case-map" element={<CaseMapPage />} />
        <Route path="dispatch" element={<EmergencyDispatchPage />} />
        <Route path="investigations" element={<InvestigationsPage />} />
        <Route path="investigations/:id" element={<InvestigationDetailPage />} />
        <Route path="escalations" element={<EscalationsPage />} />
        <Route path="voice-shield" element={<VoiceShieldPage />} />
        <Route path="mail-guard" element={<MailGuardPage />} />
        <Route path="veri-trust" element={<VeriTrustPage />} />
        <Route path="chain-trace" element={<ChainTracePage />} />
        <Route path="network" element={<NetworkPage />} />
        <Route path="network/:caseId" element={<NetworkPage />} />
        <Route path="challenge-ai" element={<ChallengeAIPage />} />
        <Route path="what-if" element={<WhatIfSimulationPage />} />
        <Route path="evidence" element={<EvidencePage />} />
        <Route path="ai-assistant" element={<AIAssistantPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="sih-problems" element={<SIHPage />} />
        <Route path="architecture" element={<ArchitecturePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AccessibilityProvider>
          <CaseProvider>
            <BrowserRouter>
              <AppRoutes />
              <Toaster
                position="top-right"
                toastOptions={{
                  style: { background: '#1a2438', color: '#f1f5f9', border: '1px solid rgba(59,109,245,0.3)', fontSize: '14px' },
                  success: { iconTheme: { primary: '#10b981', secondary: '#1a2438' } },
                  error: { iconTheme: { primary: '#f43f5e', secondary: '#1a2438' } },
                }}
              />
            </BrowserRouter>
          </CaseProvider>
        </AccessibilityProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}

