import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Request interceptor — inject auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crimeverse_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Request failed'
    if (error.response?.status === 401) {
      localStorage.removeItem('crimeverse_token')
      localStorage.removeItem('crimeverse_user')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    } else if (error.response?.status !== 400) {
      // Don't toast validation errors — let forms handle those
    }
    return Promise.reject(error)
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
}

// ─── Cases ───────────────────────────────────────────────────────────────────
export const casesAPI = {
  getAll: (params?: any) => api.get('/cases', { params }),
  create: (data: any) => api.post('/cases', data),
  getById: (id: string) => api.get(`/cases/${id}`),
  update: (id: string, data: any) => api.put(`/cases/${id}`, data),
  delete: (id: string) => api.delete(`/cases/${id}`),
  getEntities: (id: string) => api.get(`/cases/${id}/entities`),
  getEvidence: (id: string) => api.get(`/cases/${id}/evidence`),
  getTimeline: (id: string) => api.get(`/cases/${id}/timeline`),
}

// ─── Evidence ────────────────────────────────────────────────────────────────
export const evidenceAPI = {
  getAll: (params?: any) => api.get('/evidence', { params }),
  create: (formData: FormData) => api.post('/evidence', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getById: (id: string) => api.get(`/evidence/${id}`),
  delete: (id: string) => api.delete(`/evidence/${id}`),
}

// ─── Voice ───────────────────────────────────────────────────────────────────
export const voiceAPI = {
  analyze: (formData: FormData) => api.post('/voice/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 }),
  getHistory: (params?: any) => api.get('/voice/history', { params }),
  getById: (id: string) => api.get(`/voice/${id}`),
}

// ─── Email ───────────────────────────────────────────────────────────────────
export const emailAPI = {
  analyze: (data: { content: string; caseId?: string }) => api.post('/email/analyze', data),
  getHistory: (params?: any) => api.get('/email/history', { params }),
  getById: (id: string) => api.get(`/email/${id}`),
}

// ─── Identity ────────────────────────────────────────────────────────────────
export const identityAPI = {
  analyze: (formData: FormData) => api.post('/identity/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getHistory: (params?: any) => api.get('/identity/history', { params }),
  getById: (id: string) => api.get(`/identity/${id}`),
}

// ─── Blockchain ───────────────────────────────────────────────────────────────
export const blockchainAPI = {
  analyze: (data: { walletAddress: string; blockchain?: string; caseId?: string }) => api.post('/blockchain/analyze', data),
  getHistory: (params?: any) => api.get('/blockchain/history', { params }),
  getById: (id: string) => api.get(`/blockchain/${id}`),
}

// ─── Network ─────────────────────────────────────────────────────────────────
export const networkAPI = {
  getGraph: (caseId: string) => api.get(`/network/${caseId}`),
  createRelationship: (data: any) => api.post('/network/relationships', data),
  createEntity: (data: any) => api.post('/network/entities', data),
  getTimeline: (caseId: string) => api.get(`/network/${caseId}/timeline`),
}

export const entitiesAPI = {
  getByCase: (caseId: string) => casesAPI.getEntities(caseId),
  create: (data: any) => networkAPI.createEntity(data),
}

// ─── AI ──────────────────────────────────────────────────────────────────────
export const aiAPI = {
  chat: (data: { message: string; sessionId?: string; caseId?: string }) => api.post('/ai/chat', data),
  unifiedAnalysis: (data: { caseId: string }) => api.post('/ai/unified-analysis', data),
  getChatHistory: (params?: any) => api.get('/ai/chat/history', { params }),
}

// ─── Reports ─────────────────────────────────────────────────────────────────
export const reportsAPI = {
  generate: (data: { caseId: string }) => api.post('/reports/generate', data, { timeout: 60000 }),
  getByCase: (caseId: string) => api.get(`/reports/case/${caseId}`),
  getById: (id: string) => api.get(`/reports/${id}`),
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
}

// ─── Alerts ──────────────────────────────────────────────────────────────────
export const alertsAPI = {
  getAll: (params?: any) => api.get('/alerts', { params }),
  markRead: (id: string) => api.put(`/alerts/${id}/read`),
  markAllRead: () => api.put('/alerts/read-all'),
  acknowledge: (id: string) => api.put(`/alerts/${id}/acknowledge`),
}

// ─── CCTV Surveillance ────────────────────────────────────────────────────────
export const cctvAPI = {
  getAll: (params?: any) => api.get('/cctv/cameras', { params }),
  getById: (id: string) => api.get(`/cctv/cameras/${id}`),
  updatePTZ: (id: string, data: any) => api.put(`/cctv/cameras/${id}/ptz`, data),
  detectThreats: (data: any) => api.post('/cctv/detect', data),
  matchFace: (data: { suspectHint?: string; image?: string }) => api.post('/cctv/face-match', data),
  saveSnapshot: (data: any) => api.post('/cctv/snapshot', data),
}

// ─── Geospatial Tactical Mapping ─────────────────────────────────────────────
export const geoAPI = {
  getIncidents: (params?: any) => api.get('/geo/incidents', { params }),
  getIncidentById: (id: string) => api.get(`/geo/incidents/${id}`),
  createIncident: (data: any) => api.post('/geo/incidents', data),
  getPatrolUnits: (params?: any) => api.get('/geo/patrols', { params }),
  updatePatrolStatus: (id: string, data: any) => api.put(`/geo/patrols/${id}`, data),
  getSuspectTrail: (caseId: string) => api.get(`/geo/suspect-trail/${caseId}`),
}

// ─── Emergency SMS & Dispatch ────────────────────────────────────────────────
export const smsAPI = {
  send: (data: { title: string; recipientGroup: string; message: string; priority?: string; phoneNumbers?: string[]; caseId?: string }) =>
    api.post('/sms/send', data),
  triggerSos: (data: { reason?: string; coordinates?: { lat: number; lng: number }; sector?: string }) =>
    api.post('/sms/sos', data),
  getHistory: (params?: any) => api.get('/sms/history', { params }),
  getTemplates: () => api.get('/sms/templates'),
  getContacts: () => api.get('/sms/contacts'),
}

// ─── Citizen Complaints & FIR ────────────────────────────────────────────────
export const complaintsAPI = {
  submit: (data: any) => api.post('/complaints/submit', data),
  track: (complaintId: string) => api.get(`/complaints/track/${complaintId}`),
  getAll: (params?: any) => api.get('/complaints', { params }),
  create: (data: any) => api.post('/complaints', data),
  updateStatus: (id: string, data: { status: string; notes?: string; assignedDepartment?: string; assignedOfficer?: string }) =>
    api.put(`/complaints/${id}/status`, data),
  promoteToCase: (id: string) => api.post(`/complaints/${id}/promote-case`),
}

// ─── Case Locations ──────────────────────────────────────────────────────────
export const locationsAPI = {
  getByCase: (caseId: string, params?: any) => api.get(`/locations/case/${caseId}`, { params }),
  create: (data: any) => api.post('/locations', data),
  update: (id: string, data: any) => api.put(`/locations/${id}`, data),
  delete: (id: string) => api.delete(`/locations/${id}`),
}

// ─── Challenge AI ────────────────────────────────────────────────────────────
export const challengeAPI = {
  getByCase: (caseId: string, params?: any) => api.get(`/challenge/case/${caseId}`, { params }),
  challengeFinding: (id: string, data: { verdict?: string; comment?: string; contradictionNote?: string; requestedQuestions?: string[] }) =>
    api.post(`/challenge/findings/${id}/challenge`, data),
  generateAlternative: (id: string) => api.post(`/challenge/findings/${id}/alternative`),
  generateHypotheses: (data: { caseId: string; findingId?: string; context?: string }) =>
    api.post('/challenge/hypotheses', data),
  submitReview: (id: string, data: { status: string; notes?: string }) =>
    api.put(`/challenge/${id}/review`, data),
  requestReview: (id: string, data: { reason?: string; priority?: string }) =>
    api.post(`/challenge/findings/${id}/request-review`, data),
}

// ─── What-If Simulation ──────────────────────────────────────────────────────
export const simulationAPI = {
  getByCase: (caseId: string) => api.get(`/simulation/case/${caseId}`),
  create: (data: any) => api.post('/simulation', data),
  getComparison: (id: string) => api.get(`/simulation/${id}/compare`),
  delete: (id: string) => api.delete(`/simulation/${id}`),
}

// ─── Supervisor Escalations ──────────────────────────────────────────────────
export const escalationsAPI = {
  getAll: (params?: any) => api.get('/escalations', { params }),
  create: (data: { caseId: string; reason: string; trigger?: string; priority?: string; notes?: string }) =>
    api.post('/escalations', data),
  updateStatus: (id: string, data: { status: string; supervisorComments?: string; reviewNote?: string }) =>
    api.put(`/escalations/${id}/status`, data),
  respond: (id: string, data: { status: string; supervisorNotes?: string }) =>
    api.put(`/escalations/${id}/respond`, data),
}

// ─── Security & Audit ────────────────────────────────────────────────────────
export const auditAPI = {
  getAll: (params?: any) => api.get('/audit', { params }),
}

export default api



