import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { upload } from '../middleware/upload';
import { analyzeVoiceFile, getVoiceHistory, getVoiceAnalysis } from '../controllers/voice.controller';
import { analyzeEmailContent, getEmailHistory, getEmailAnalysis } from '../controllers/email.controller';
import { analyzeIdentityDoc, getIdentityHistory, getIdentityAnalysis } from '../controllers/identity.controller';
import { analyzeBlockchain, getBlockchainHistory, getBlockchainAnalysis } from '../controllers/blockchain.controller';
import { getNetwork, createRelationship, createEntity, getCaseTimeline } from '../controllers/network.controller';
import { chat, unifiedAnalysis, getChatHistory } from '../controllers/ai.controller';
import { generateReport, getReportsByCase, getReport } from '../controllers/reports.controller';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { getAlerts, markAlertRead, markAllRead, acknowledgeAlert } from '../controllers/alerts.controller';
import { getEvidence, createEvidence, getEvidenceById, deleteEvidence } from '../controllers/evidence.controller';
import { getCameras, getCameraById, updatePTZ, detectThreats, matchFace, saveSnapshotEvidence } from '../controllers/cctv.controller';
import { getIncidents, getIncidentById, createIncident, getPatrolUnits, updatePatrolStatus, getSuspectTrail } from '../controllers/geo.controller';
import { sendSmsDispatch, triggerEmergencySos, getDispatchHistory, getTemplates, getContacts } from '../controllers/sms.controller';
import casesRoutes from './cases.routes';
import complaintsRoutes from './complaints.routes';
import locationsRoutes from './locations.routes';
import challengeRoutes from './challenge.routes';
import simulationRoutes from './simulation.routes';
import escalationsRoutes from './escalations.routes';
import auditRoutes from './audit.routes';

const router = Router();

// Complaints (has both public submit/track and protected routes)
router.use('/complaints', complaintsRoutes);

router.use(authenticate);

// Voice
router.post('/voice/analyze', upload.single('audio'), analyzeVoiceFile);
router.get('/voice/history', getVoiceHistory);
router.get('/voice/:id', getVoiceAnalysis);

// Email
router.post('/email/analyze', analyzeEmailContent);
router.get('/email/history', getEmailHistory);
router.get('/email/:id', getEmailAnalysis);

// Identity
router.post('/identity/analyze', upload.single('document'), analyzeIdentityDoc);
router.get('/identity/history', getIdentityHistory);
router.get('/identity/:id', getIdentityAnalysis);

// Blockchain
router.post('/blockchain/analyze', analyzeBlockchain);
router.get('/blockchain/history', getBlockchainHistory);
router.get('/blockchain/:id', getBlockchainAnalysis);

// Network
router.get('/network/:caseId', getNetwork);
router.post('/network/relationships', createRelationship);
router.post('/network/entities', createEntity);
router.get('/network/:caseId/timeline', getCaseTimeline);

// AI
router.post('/ai/chat', chat);
router.post('/ai/unified-analysis', unifiedAnalysis);
router.get('/ai/chat/history', getChatHistory);

// Reports
router.post('/reports/generate', generateReport);
router.get('/reports/case/:caseId', getReportsByCase);
router.get('/reports/:id', getReport);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Alerts
router.get('/alerts', getAlerts);
router.put('/alerts/read-all', markAllRead);
router.put('/alerts/:id/read', markAlertRead);
router.put('/alerts/:id/acknowledge', acknowledgeAlert);

// Evidence
router.get('/evidence', getEvidence);
router.post('/evidence', upload.single('file'), createEvidence);
router.get('/evidence/:id', getEvidenceById);
router.delete('/evidence/:id', deleteEvidence);

// Cases
router.use('/cases', casesRoutes);

// Locations
router.use('/locations', locationsRoutes);

// Challenge AI
router.use('/challenge', challengeRoutes);

// What-If Simulation
router.use('/simulation', simulationRoutes);
router.use('/simulations', simulationRoutes);

// Supervisor Escalations
router.use('/escalations', escalationsRoutes);

// Security & Audit Logs
router.use('/audit', auditRoutes);

// CCTV Surveillance
router.get('/cctv/cameras', getCameras);
router.get('/cctv/cameras/:id', getCameraById);
router.put('/cctv/cameras/:id/ptz', updatePTZ);
router.post('/cctv/detect', detectThreats);
router.post('/cctv/face-match', matchFace);
router.post('/cctv/snapshot', saveSnapshotEvidence);

// Geospatial Tactical Mapping
router.get('/geo/incidents', getIncidents);
router.post('/geo/incidents', createIncident);
router.get('/geo/incidents/:id', getIncidentById);
router.get('/geo/patrols', getPatrolUnits);
router.put('/geo/patrols/:id', updatePatrolStatus);
router.get('/geo/suspect-trail/:caseId', getSuspectTrail);

// Emergency SMS & Tactical Dispatch
router.post('/sms/send', sendSmsDispatch);
router.post('/sms/sos', triggerEmergencySos);
router.get('/sms/history', getDispatchHistory);
router.get('/sms/templates', getTemplates);
router.get('/sms/contacts', getContacts);

export default router;
