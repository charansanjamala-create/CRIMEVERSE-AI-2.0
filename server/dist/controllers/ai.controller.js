"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatHistory = exports.unifiedAnalysis = exports.chat = void 0;
const ChatMessage_1 = require("../models/ChatMessage");
const Case_1 = require("../models/Case");
const VoiceAnalysis_1 = require("../models/VoiceAnalysis");
const EmailAnalysis_1 = require("../models/EmailAnalysis");
const IdentityAnalysis_1 = require("../models/IdentityAnalysis");
const BlockchainAnalysis_1 = require("../models/BlockchainAnalysis");
const Alert_1 = require("../models/Alert");
const Entity_1 = require("../models/Entity");
const chatbot_1 = require("../ai/chatbot");
const errorHandler_1 = require("../middleware/errorHandler");
const uuid_1 = require("uuid");
const chat = async (req, res, next) => {
    try {
        const { message, sessionId, caseId } = req.body;
        if (!message)
            return next((0, errorHandler_1.createError)('Message is required', 400));
        const sid = sessionId || (0, uuid_1.v4)();
        // Save user message
        await ChatMessage_1.ChatMessage.create({ sessionId: sid, caseId, userId: req.user.id, role: 'user', content: message, isAIGenerated: false });
        // Get session history
        const history = await ChatMessage_1.ChatMessage.find({ sessionId: sid }).sort({ createdAt: 1 }).limit(20);
        // Build case context if caseId provided
        let caseContext = {};
        if (caseId) {
            const [caseDoc, voiceCount, emailCount, identityCount, blockchainCount, alertCount, entities] = await Promise.all([
                Case_1.Case.findById(caseId),
                VoiceAnalysis_1.VoiceAnalysis.countDocuments({ caseId }),
                EmailAnalysis_1.EmailAnalysis.countDocuments({ caseId }),
                IdentityAnalysis_1.IdentityAnalysis.countDocuments({ caseId }),
                BlockchainAnalysis_1.BlockchainAnalysis.countDocuments({ caseId }),
                Alert_1.Alert.countDocuments({ caseId, isRead: false }),
                Entity_1.Entity.find({ caseId }).select('name type').limit(20),
            ]);
            if (caseDoc) {
                caseContext = {
                    caseId, caseTitle: caseDoc.title,
                    riskScore: caseDoc.riskScore,
                    voiceAnalyses: voiceCount, emailAnalyses: emailCount,
                    identityAnalyses: identityCount, blockchainAnalyses: blockchainCount,
                    alerts: alertCount,
                    entities: entities.map(e => `${e.name} (${e.type})`),
                };
            }
        }
        const aiResult = await (0, chatbot_1.generateChatResponse)(message, history.map(h => ({ role: h.role, content: h.content })), caseContext);
        const aiMessage = await ChatMessage_1.ChatMessage.create({
            sessionId: sid, caseId, userId: req.user.id,
            role: 'assistant', content: aiResult.content,
            sources: aiResult.sources, confidence: aiResult.confidence,
            isAIGenerated: true,
        });
        res.json({ success: true, data: { sessionId: sid, message: aiMessage, context: caseContext } });
    }
    catch (err) {
        next(err);
    }
};
exports.chat = chat;
const unifiedAnalysis = async (req, res, next) => {
    try {
        const { caseId } = req.body;
        if (!caseId)
            return next((0, errorHandler_1.createError)('caseId is required', 400));
        const [caseDoc, voiceCount, emailCount, identityCount, blockchainCount, alertCount, entities] = await Promise.all([
            Case_1.Case.findById(caseId),
            VoiceAnalysis_1.VoiceAnalysis.countDocuments({ caseId }),
            EmailAnalysis_1.EmailAnalysis.countDocuments({ caseId }),
            IdentityAnalysis_1.IdentityAnalysis.countDocuments({ caseId }),
            BlockchainAnalysis_1.BlockchainAnalysis.countDocuments({ caseId }),
            Alert_1.Alert.countDocuments({ caseId }),
            Entity_1.Entity.find({ caseId }).select('name type').limit(20),
        ]);
        if (!caseDoc)
            return next((0, errorHandler_1.createError)('Case not found', 404));
        const context = {
            caseId, caseTitle: caseDoc.title, riskScore: caseDoc.riskScore,
            voiceAnalyses: voiceCount, emailAnalyses: emailCount,
            identityAnalyses: identityCount, blockchainAnalyses: blockchainCount,
            alerts: alertCount, entities: entities.map(e => `${e.name} (${e.type})`),
        };
        const result = await (0, chatbot_1.generateUnifiedAnalysis)(context);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.unifiedAnalysis = unifiedAnalysis;
const getChatHistory = async (req, res, next) => {
    try {
        const { sessionId, caseId } = req.query;
        const filter = { userId: req.user.id };
        if (sessionId)
            filter.sessionId = sessionId;
        if (caseId)
            filter.caseId = caseId;
        const messages = await ChatMessage_1.ChatMessage.find(filter).sort({ createdAt: 1 }).limit(100);
        res.json({ success: true, data: messages });
    }
    catch (err) {
        next(err);
    }
};
exports.getChatHistory = getChatHistory;
//# sourceMappingURL=ai.controller.js.map