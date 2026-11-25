"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = require("../middleware/authenticate");
const upload_1 = require("../middleware/upload");
const voice_controller_1 = require("../controllers/voice.controller");
const email_controller_1 = require("../controllers/email.controller");
const identity_controller_1 = require("../controllers/identity.controller");
const blockchain_controller_1 = require("../controllers/blockchain.controller");
const network_controller_1 = require("../controllers/network.controller");
const ai_controller_1 = require("../controllers/ai.controller");
const reports_controller_1 = require("../controllers/reports.controller");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const alerts_controller_1 = require("../controllers/alerts.controller");
const evidence_controller_1 = require("../controllers/evidence.controller");
const cctv_controller_1 = require("../controllers/cctv.controller");
const geo_controller_1 = require("../controllers/geo.controller");
const sms_controller_1 = require("../controllers/sms.controller");
const cases_routes_1 = __importDefault(require("./cases.routes"));
const complaints_routes_1 = __importDefault(require("./complaints.routes"));
const locations_routes_1 = __importDefault(require("./locations.routes"));
const challenge_routes_1 = __importDefault(require("./challenge.routes"));
const simulation_routes_1 = __importDefault(require("./simulation.routes"));
const escalations_routes_1 = __importDefault(require("./escalations.routes"));
const audit_routes_1 = __importDefault(require("./audit.routes"));
const router = (0, express_1.Router)();
// Complaints (has both public submit/track and protected routes)
router.use('/complaints', complaints_routes_1.default);
router.use(authenticate_1.authenticate);
// Voice
router.post('/voice/analyze', upload_1.upload.single('audio'), voice_controller_1.analyzeVoiceFile);
router.get('/voice/history', voice_controller_1.getVoiceHistory);
router.get('/voice/:id', voice_controller_1.getVoiceAnalysis);
// Email
router.post('/email/analyze', email_controller_1.analyzeEmailContent);
router.get('/email/history', email_controller_1.getEmailHistory);
router.get('/email/:id', email_controller_1.getEmailAnalysis);
// Identity
router.post('/identity/analyze', upload_1.upload.single('document'), identity_controller_1.analyzeIdentityDoc);
router.get('/identity/history', identity_controller_1.getIdentityHistory);
router.get('/identity/:id', identity_controller_1.getIdentityAnalysis);
// Blockchain
router.post('/blockchain/analyze', blockchain_controller_1.analyzeBlockchain);
router.get('/blockchain/history', blockchain_controller_1.getBlockchainHistory);
router.get('/blockchain/:id', blockchain_controller_1.getBlockchainAnalysis);
// Network
router.get('/network/:caseId', network_controller_1.getNetwork);
router.post('/network/relationships', network_controller_1.createRelationship);
router.post('/network/entities', network_controller_1.createEntity);
router.get('/network/:caseId/timeline', network_controller_1.getCaseTimeline);
// AI
router.post('/ai/chat', ai_controller_1.chat);
router.post('/ai/unified-analysis', ai_controller_1.unifiedAnalysis);
router.get('/ai/chat/history', ai_controller_1.getChatHistory);
// Reports
router.post('/reports/generate', reports_controller_1.generateReport);
router.get('/reports/case/:caseId', reports_controller_1.getReportsByCase);
router.get('/reports/:id', reports_controller_1.getReport);
// Dashboard
router.get('/dashboard/stats', dashboard_controller_1.getDashboardStats);
// Alerts
router.get('/alerts', alerts_controller_1.getAlerts);
router.put('/alerts/read-all', alerts_controller_1.markAllRead);
router.put('/alerts/:id/read', alerts_controller_1.markAlertRead);
router.put('/alerts/:id/acknowledge', alerts_controller_1.acknowledgeAlert);
// Evidence
router.get('/evidence', evidence_controller_1.getEvidence);
router.post('/evidence', upload_1.upload.single('file'), evidence_controller_1.createEvidence);
router.get('/evidence/:id', evidence_controller_1.getEvidenceById);
router.delete('/evidence/:id', evidence_controller_1.deleteEvidence);
// Cases
router.use('/cases', cases_routes_1.default);
// Locations
router.use('/locations', locations_routes_1.default);
// Challenge AI
router.use('/challenge', challenge_routes_1.default);
// What-If Simulation
router.use('/simulation', simulation_routes_1.default);
router.use('/simulations', simulation_routes_1.default);
// Supervisor Escalations
router.use('/escalations', escalations_routes_1.default);
// Security & Audit Logs
router.use('/audit', audit_routes_1.default);
// CCTV Surveillance
router.get('/cctv/cameras', cctv_controller_1.getCameras);
router.get('/cctv/cameras/:id', cctv_controller_1.getCameraById);
router.put('/cctv/cameras/:id/ptz', cctv_controller_1.updatePTZ);
router.post('/cctv/detect', cctv_controller_1.detectThreats);
router.post('/cctv/face-match', cctv_controller_1.matchFace);
router.post('/cctv/snapshot', cctv_controller_1.saveSnapshotEvidence);
// Geospatial Tactical Mapping
router.get('/geo/incidents', geo_controller_1.getIncidents);
router.post('/geo/incidents', geo_controller_1.createIncident);
router.get('/geo/incidents/:id', geo_controller_1.getIncidentById);
router.get('/geo/patrols', geo_controller_1.getPatrolUnits);
router.put('/geo/patrols/:id', geo_controller_1.updatePatrolStatus);
router.get('/geo/suspect-trail/:caseId', geo_controller_1.getSuspectTrail);
// Emergency SMS & Tactical Dispatch
router.post('/sms/send', sms_controller_1.sendSmsDispatch);
router.post('/sms/sos', sms_controller_1.triggerEmergencySos);
router.get('/sms/history', sms_controller_1.getDispatchHistory);
router.get('/sms/templates', sms_controller_1.getTemplates);
router.get('/sms/contacts', sms_controller_1.getContacts);
exports.default = router;
//# sourceMappingURL=api.routes.js.map