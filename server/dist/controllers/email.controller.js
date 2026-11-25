"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmailAnalysis = exports.getEmailHistory = exports.analyzeEmailContent = void 0;
const EmailAnalysis_1 = require("../models/EmailAnalysis");
const Case_1 = require("../models/Case");
const Evidence_1 = require("../models/Evidence");
const Alert_1 = require("../models/Alert");
const emailForensics_1 = require("../ai/emailForensics");
const errorHandler_1 = require("../middleware/errorHandler");
const analyzeEmailContent = async (req, res, next) => {
    try {
        const { content, caseId } = req.body;
        if (!content || content.trim().length < 10)
            return next((0, errorHandler_1.createError)('Email content is required (minimum 10 characters)', 400));
        const result = await (0, emailForensics_1.analyzeEmail)(content);
        const analysis = await EmailAnalysis_1.EmailAnalysis.create({
            caseId: caseId || undefined,
            rawContent: content,
            ...result,
            analyzedBy: req.user.id,
        });
        if (caseId) {
            await Evidence_1.Evidence.create({
                caseId, title: `Email Analysis: ${result.subject || 'Unknown Subject'}`,
                type: 'EMAIL', content: content.slice(0, 500),
                isProcessed: true, processingStatus: 'completed',
                uploadedBy: req.user.id,
            });
            await Case_1.Case.findByIdAndUpdate(caseId, { $inc: { evidenceCount: 1 }, lastActivityAt: new Date() });
            if (result.threatScore >= 60) {
                await Alert_1.Alert.create({
                    caseId, title: 'High-Threat Email Detected',
                    message: `Email analysis returned threat score: ${result.threatScore}/100. Categories: ${result.threatCategories.join(', ')}.`,
                    severity: result.threatScore >= 80 ? 'CRITICAL' : 'HIGH',
                    category: 'email', source: 'MailGuard Intelligence',
                });
                await Case_1.Case.findByIdAndUpdate(caseId, { $inc: { alertCount: 1 } });
            }
        }
        res.status(201).json({ success: true, data: analysis, message: 'Email analysis complete' });
    }
    catch (err) {
        next(err);
    }
};
exports.analyzeEmailContent = analyzeEmailContent;
const getEmailHistory = async (req, res, next) => {
    try {
        const { caseId } = req.query;
        const filter = caseId ? { caseId } : {};
        const analyses = await EmailAnalysis_1.EmailAnalysis.find(filter).populate('analyzedBy', 'name').sort({ createdAt: -1 }).limit(50);
        res.json({ success: true, data: analyses });
    }
    catch (err) {
        next(err);
    }
};
exports.getEmailHistory = getEmailHistory;
const getEmailAnalysis = async (req, res, next) => {
    try {
        const analysis = await EmailAnalysis_1.EmailAnalysis.findById(req.params.id).populate('analyzedBy', 'name email');
        if (!analysis)
            return next((0, errorHandler_1.createError)('Email analysis not found', 404));
        res.json({ success: true, data: analysis });
    }
    catch (err) {
        next(err);
    }
};
exports.getEmailAnalysis = getEmailAnalysis;
//# sourceMappingURL=email.controller.js.map