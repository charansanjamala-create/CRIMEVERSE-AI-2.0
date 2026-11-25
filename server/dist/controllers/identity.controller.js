"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIdentityAnalysis = exports.getIdentityHistory = exports.analyzeIdentityDoc = void 0;
const IdentityAnalysis_1 = require("../models/IdentityAnalysis");
const Case_1 = require("../models/Case");
const Evidence_1 = require("../models/Evidence");
const Alert_1 = require("../models/Alert");
const identityVerification_1 = require("../ai/identityVerification");
const errorHandler_1 = require("../middleware/errorHandler");
const fs_1 = __importDefault(require("fs"));
const analyzeIdentityDoc = async (req, res, next) => {
    try {
        const { caseId, documentType, fields } = req.body;
        const file = req.file;
        if (!documentType)
            return next((0, errorHandler_1.createError)('Document type is required', 400));
        const parsedFields = typeof fields === 'string' ? JSON.parse(fields) : (fields || {});
        const result = await (0, identityVerification_1.analyzeIdentity)(documentType, parsedFields, file?.originalname);
        const analysis = await IdentityAnalysis_1.IdentityAnalysis.create({
            caseId: caseId || undefined,
            fileName: file?.originalname,
            ...result,
            analyzedBy: req.user.id,
        });
        if (caseId) {
            await Evidence_1.Evidence.create({
                caseId, title: `Identity Analysis: ${documentType} — ${result.subjectName || 'Unknown'}`,
                type: 'DOCUMENT',
                ...(file ? { fileName: file.filename, filePath: file.path, fileSize: file.size } : {}),
                isProcessed: true, processingStatus: 'completed',
                uploadedBy: req.user.id,
            });
            await Case_1.Case.findByIdAndUpdate(caseId, { $inc: { evidenceCount: 1 }, lastActivityAt: new Date() });
            if (result.riskScore >= 60) {
                await Alert_1.Alert.create({
                    caseId, title: 'Document Inconsistencies Detected',
                    message: `Identity analysis of ${documentType} document returned risk score: ${result.riskScore}/100. Status: ${result.verificationStatus}.`,
                    severity: result.riskScore >= 80 ? 'CRITICAL' : 'HIGH',
                    category: 'identity', source: 'VeriTrust AI',
                });
                await Case_1.Case.findByIdAndUpdate(caseId, { $inc: { alertCount: 1 } });
            }
        }
        if (file) {
            try {
                fs_1.default.unlinkSync(file.path);
            }
            catch { }
        }
        res.status(201).json({ success: true, data: analysis, message: 'Identity analysis complete' });
    }
    catch (err) {
        next(err);
    }
};
exports.analyzeIdentityDoc = analyzeIdentityDoc;
const getIdentityHistory = async (req, res, next) => {
    try {
        const { caseId } = req.query;
        const filter = caseId ? { caseId } : {};
        const analyses = await IdentityAnalysis_1.IdentityAnalysis.find(filter).populate('analyzedBy', 'name').sort({ createdAt: -1 }).limit(50);
        res.json({ success: true, data: analyses });
    }
    catch (err) {
        next(err);
    }
};
exports.getIdentityHistory = getIdentityHistory;
const getIdentityAnalysis = async (req, res, next) => {
    try {
        const analysis = await IdentityAnalysis_1.IdentityAnalysis.findById(req.params.id).populate('analyzedBy', 'name email');
        if (!analysis)
            return next((0, errorHandler_1.createError)('Identity analysis not found', 404));
        res.json({ success: true, data: analysis });
    }
    catch (err) {
        next(err);
    }
};
exports.getIdentityAnalysis = getIdentityAnalysis;
//# sourceMappingURL=identity.controller.js.map