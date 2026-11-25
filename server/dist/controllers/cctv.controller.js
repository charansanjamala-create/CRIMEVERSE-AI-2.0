"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveSnapshotEvidence = exports.matchFace = exports.detectThreats = exports.updatePTZ = exports.getCameraById = exports.getCameras = exports.KNOWN_SUSPECTS = exports.findCameraSafe = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Camera_1 = require("../models/Camera");
const Evidence_1 = require("../models/Evidence");
const Alert_1 = require("../models/Alert");
const Case_1 = require("../models/Case");
const errorHandler_1 = require("../middleware/errorHandler");
// Helper to look up camera safely by _id or cameraId
const findCameraSafe = async (idOrCode) => {
    if (!idOrCode)
        return null;
    if (mongoose_1.default.Types.ObjectId.isValid(idOrCode)) {
        return await Camera_1.Camera.findOne({ $or: [{ _id: idOrCode }, { cameraId: idOrCode }] });
    }
    return await Camera_1.Camera.findOne({ cameraId: idOrCode });
};
exports.findCameraSafe = findCameraSafe;
// Suspect biometric database for AI face recognition
exports.KNOWN_SUSPECTS = [
    {
        id: 'SUSPECT-001',
        name: 'Viktor Lazarov',
        alias: 'The Ghost Broker',
        age: 42,
        nationality: 'Eastern European',
        threatLevel: 'CRITICAL',
        warrants: ['Interpol Red Notice #A-8921/2023', 'Federal Wire Fraud', 'Voice Cloning Heist'],
        caseIdTag: 'CV-PHOENIX-2024-001',
        biometricSignature: 'BIO-VL-9924-SHA256',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80',
        description: 'Specialist in multi-tier voice impersonation and synthetic identity laundering.',
    },
    {
        id: 'SUSPECT-002',
        name: 'Maria Santos',
        alias: 'Cipher M',
        age: 36,
        nationality: 'Spanish / Brazilian',
        threatLevel: 'HIGH',
        warrants: ['International Money Laundering Directive', 'Cryptocurrency Tumbler Operator'],
        caseIdTag: 'CV-PHOENIX-2024-001',
        biometricSignature: 'BIO-MS-7712-SHA256',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fit=crop&q=80',
        description: 'High-volume crypto cash-out broker utilizing mixer addresses and decentralized bridges.',
    },
    {
        id: 'SUSPECT-003',
        name: 'James Vance',
        alias: 'Spectre',
        age: 48,
        nationality: 'British',
        threatLevel: 'HIGH',
        warrants: ['Corporate Espionage Act', 'CEO Spear-Phishing Network'],
        caseIdTag: 'CV-VOICEID-2024-003',
        biometricSignature: 'BIO-JV-4431-SHA256',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&fit=crop&q=80',
        description: 'Targeted executive spear-phishing and executive voice clone dispatch engineer.',
    },
    {
        id: 'SUSPECT-004',
        name: 'Priya Sharma',
        alias: 'Kali',
        age: 31,
        nationality: 'Indian',
        threatLevel: 'MEDIUM',
        warrants: ['Section 66D IT Act - Cyber Impersonation', 'Mule Account Coordination'],
        caseIdTag: 'CV-PHOENIX-2024-001',
        biometricSignature: 'BIO-PS-1109-SHA256',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&fit=crop&q=80',
        description: 'Recruiter and controller of domestic banking mule accounts.',
    },
];
const getCameras = async (req, res, next) => {
    try {
        const count = await Camera_1.Camera.countDocuments();
        if (count === 0) {
            const { seedTacticalData } = await Promise.resolve().then(() => __importStar(require('../seed/seed')));
            const phoenixCase = await Case_1.Case.findOne({ caseId: 'CV-PHOENIX-2024-001' });
            await seedTacticalData(phoenixCase?._id, req.user?.id);
        }
        const { sector, status } = req.query;
        const filter = {};
        if (sector)
            filter.sector = sector;
        if (status)
            filter.status = status;
        const cameras = await Camera_1.Camera.find(filter).sort({ cameraId: 1 });
        res.json({
            success: true,
            data: cameras,
            meta: {
                total: cameras.length,
                onlineCount: cameras.filter(c => c.status === 'ONLINE' || c.status === 'ALERT').length,
                alertCount: cameras.filter(c => c.status === 'ALERT').length,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getCameras = getCameras;
const getCameraById = async (req, res, next) => {
    try {
        const camera = await (0, exports.findCameraSafe)(req.params.id);
        if (!camera)
            return next((0, errorHandler_1.createError)('Camera not found', 404));
        if (camera.caseId) {
            await camera.populate('caseId', 'caseId title priority');
        }
        res.json({ success: true, data: camera });
    }
    catch (err) {
        next(err);
    }
};
exports.getCameraById = getCameraById;
const updatePTZ = async (req, res, next) => {
    try {
        const { pan, tilt, zoom, nightVision, thermalMode } = req.body;
        const camera = await (0, exports.findCameraSafe)(req.params.id);
        if (!camera)
            return next((0, errorHandler_1.createError)('Camera not found', 404));
        if (pan !== undefined)
            camera.currentPan = Math.max(-180, Math.min(180, pan));
        if (tilt !== undefined)
            camera.currentTilt = Math.max(-90, Math.min(90, tilt));
        if (zoom !== undefined)
            camera.currentZoom = Math.max(1, Math.min(16, zoom));
        if (nightVision !== undefined)
            camera.nightVision = Boolean(nightVision);
        if (thermalMode !== undefined)
            camera.thermalMode = Boolean(thermalMode);
        await camera.save();
        res.json({ success: true, data: camera, message: 'PTZ telemetry updated' });
    }
    catch (err) {
        next(err);
    }
};
exports.updatePTZ = updatePTZ;
const detectThreats = async (req, res, next) => {
    try {
        const { cameraId, customDetections } = req.body;
        const camera = await (0, exports.findCameraSafe)(cameraId);
        if (!camera)
            return next((0, errorHandler_1.createError)('Camera not found', 404));
        // Simulated computer vision inference
        const detections = customDetections || [
            {
                id: `DET-${Date.now()}-1`,
                type: 'PERSON',
                label: 'Suspicious Individual (Facial Occlusion)',
                confidence: 0.942,
                bbox: [24, 32, 18, 45],
                threatSeverity: 'HIGH',
                timestamp: new Date(),
                suspectMatch: {
                    name: 'Viktor Lazarov',
                    alias: 'The Ghost Broker',
                    similarity: 91.8,
                },
            },
            {
                id: `DET-${Date.now()}-2`,
                type: 'WEAPON',
                label: 'Concealed Handgun Silhouette Detected',
                confidence: 0.884,
                bbox: [32, 54, 8, 12],
                threatSeverity: 'CRITICAL',
                timestamp: new Date(),
            },
            {
                id: `DET-${Date.now()}-3`,
                type: 'VEHICLE',
                label: 'ANPR: Stolen Black Sedan [DL-04-CK-8819]',
                confidence: 0.976,
                bbox: [58, 60, 32, 28],
                threatSeverity: 'HIGH',
                timestamp: new Date(),
            },
        ];
        camera.activeDetections = detections;
        camera.status = 'ALERT';
        await camera.save();
        // Generate real-time alert in database
        await Alert_1.Alert.create({
            caseId: camera.caseId,
            title: `Tactical Alert: Threat Detected on ${camera.name}`,
            message: `Computer Vision AI flagged critical weapon and suspect signature on ${camera.locationName} (${camera.sector}). Confidence: 94.2%. Immediate response advised.`,
            severity: 'CRITICAL',
            category: 'CCTV_THREAT',
            source: `CCTV:${camera.cameraId}`,
            metadata: { cameraId: camera.cameraId, location: camera.locationName, detections },
        });
        res.json({
            success: true,
            data: detections,
            cameraStatus: camera.status,
            message: 'Vision AI threat detection completed and alert registered',
        });
    }
    catch (err) {
        next(err);
    }
};
exports.detectThreats = detectThreats;
const matchFace = async (req, res, next) => {
    try {
        const { suspectHint } = req.body;
        // Pick top matching suspect based on hint or default top suspect
        const target = suspectHint
            ? exports.KNOWN_SUSPECTS.find(s => s.name.toLowerCase().includes(suspectHint.toLowerCase()) || s.alias.toLowerCase().includes(suspectHint.toLowerCase())) || exports.KNOWN_SUSPECTS[0]
            : exports.KNOWN_SUSPECTS[0];
        const matchScore = (89.5 + Math.random() * 8).toFixed(1); // 89.5% - 97.5%
        const result = {
            matched: true,
            similarityScore: parseFloat(matchScore),
            confidenceRating: parseFloat(matchScore) > 93 ? 'DEFINITIVE_MATCH' : 'HIGH_PROBABILITY',
            suspect: target,
            biometricFeatures: {
                eyeDistanceMm: 63.4,
                facialAspectRatio: 1.34,
                jawlineContourConfidence: 0.96,
                nasalBridgeMatch: 0.94,
                earBiometricHash: 'EAR-SIG-9912-B',
            },
            verifiedAgainst: 'National Law Enforcement Biometric Database & Interpol Watchlist',
            recommendedAction: 'Immediate geo-containment, notify nearest patrol unit, issue APB alert dispatch.',
        };
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.matchFace = matchFace;
const saveSnapshotEvidence = async (req, res, next) => {
    try {
        const { cameraId, caseId, title, description, tags } = req.body;
        const camera = await (0, exports.findCameraSafe)(cameraId);
        if (!camera)
            return next((0, errorHandler_1.createError)('Camera not found', 404));
        const linkedCaseId = caseId || camera.caseId;
        if (!linkedCaseId)
            return next((0, errorHandler_1.createError)('Case ID required to attach evidence', 400));
        const ev = await Evidence_1.Evidence.create({
            caseId: linkedCaseId,
            title: title || `CCTV Frame Capture - ${camera.name}`,
            description: description || `Automated CCTV snapshot captured from ${camera.locationName} (${camera.sector}). Pan: ${camera.currentPan}°, Tilt: ${camera.currentTilt}°, Zoom: ${camera.currentZoom}x. Threat level: ${camera.status}.`,
            type: 'IMAGE',
            content: JSON.stringify({
                cameraId: camera.cameraId,
                location: camera.locationName,
                sector: camera.sector,
                coordinates: camera.coordinates,
                timestamp: new Date().toISOString(),
                detections: camera.activeDetections,
            }),
            tags: tags || ['cctv', 'surveillance-frame', camera.sector.toLowerCase(), 'vision-ai'],
            uploadedBy: req.user.id,
        });
        await Case_1.Case.findByIdAndUpdate(linkedCaseId, {
            $inc: { evidenceCount: 1 },
            lastActivityAt: new Date(),
        });
        res.status(201).json({
            success: true,
            data: ev,
            message: 'CCTV frame successfully archived in Evidence Center',
        });
    }
    catch (err) {
        next(err);
    }
};
exports.saveSnapshotEvidence = saveSnapshotEvidence;
//# sourceMappingURL=cctv.controller.js.map