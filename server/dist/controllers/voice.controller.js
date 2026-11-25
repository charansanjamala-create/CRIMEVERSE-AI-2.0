"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVoiceAnalysis = exports.getVoiceHistory = exports.analyzeVoiceFile = void 0;
const VoiceAnalysis_1 = require("../models/VoiceAnalysis");
const Case_1 = require("../models/Case");
const Evidence_1 = require("../models/Evidence");
const Alert_1 = require("../models/Alert");
const voiceAnalysis_1 = require("../ai/voiceAnalysis");
const errorHandler_1 = require("../middleware/errorHandler");
const fs_1 = __importDefault(require("fs"));
const analyzeVoiceFile = async (req, res, next) => {
    try {
        const { caseId } = req.body;
        const file = req.file;
        if (!file)
            return next((0, errorHandler_1.createError)('Audio file is required', 400));
        const result = await (0, voiceAnalysis_1.analyzeVoice)(file.originalname);
        const analysis = await VoiceAnalysis_1.VoiceAnalysis.create({
            caseId: caseId || undefined,
            fileName: file.originalname,
            fileSize: file.size,
            ...result,
            analyzedBy: req.user.id,
        });
        if (caseId) {
            await Evidence_1.Evidence.create({
                caseId, title: `Voice Analysis: ${file.originalname}`,
                type: 'AUDIO', fileName: file.filename, filePath: file.path,
                fileSize: file.size, mimeType: file.mimetype,
                isProcessed: true, processingStatus: 'completed',
                uploadedBy: req.user.id,
            });
            await Case_1.Case.findByIdAndUpdate(caseId, { $inc: { evidenceCount: 1 }, lastActivityAt: new Date() });
            if (result.suspicionScore >= 70) {
                await Alert_1.Alert.create({
                    caseId, title: 'High Suspicion Voice Sample Detected',
                    message: `Voice analysis of "${file.originalname}" returned suspicion score: ${result.suspicionScore}/100. Requires immediate human review.`,
                    severity: 'HIGH', category: 'voice', source: 'VoiceShield AI',
                });
                await Case_1.Case.findByIdAndUpdate(caseId, { $inc: { alertCount: 1 } });
            }
        }
        // Clean up uploaded file (we store results in DB, not files for demo)
        try {
            fs_1.default.unlinkSync(file.path);
        }
        catch { }
        res.status(201).json({ success: true, data: analysis, message: 'Voice analysis complete' });
    }
    catch (err) {
        next(err);
    }
};
exports.analyzeVoiceFile = analyzeVoiceFile;
const getVoiceHistory = async (req, res, next) => {
    try {
        const { caseId } = req.query;
        const filter = caseId ? { caseId } : {};
        const analyses = await VoiceAnalysis_1.VoiceAnalysis.find(filter).populate('analyzedBy', 'name').sort({ createdAt: -1 }).limit(50);
        res.json({ success: true, data: analyses });
    }
    catch (err) {
        next(err);
    }
};
exports.getVoiceHistory = getVoiceHistory;
const getVoiceAnalysis = async (req, res, next) => {
    try {
        const analysis = await VoiceAnalysis_1.VoiceAnalysis.findById(req.params.id).populate('analyzedBy', 'name email');
        if (!analysis)
            return next((0, errorHandler_1.createError)('Voice analysis not found', 404));
        res.json({ success: true, data: analysis });
    }
    catch (err) {
        next(err);
    }
};
exports.getVoiceAnalysis = getVoiceAnalysis;
//# sourceMappingURL=voice.controller.js.map