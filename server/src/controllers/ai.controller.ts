import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { ChatMessage } from '../models/ChatMessage';
import { Case } from '../models/Case';
import { VoiceAnalysis } from '../models/VoiceAnalysis';
import { EmailAnalysis } from '../models/EmailAnalysis';
import { IdentityAnalysis } from '../models/IdentityAnalysis';
import { BlockchainAnalysis } from '../models/BlockchainAnalysis';
import { Alert } from '../models/Alert';
import { Entity } from '../models/Entity';
import { generateChatResponse, generateUnifiedAnalysis } from '../ai/chatbot';
import { createError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

export const chat = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { message, sessionId, caseId } = req.body;
    if (!message) return next(createError('Message is required', 400));

    const sid = sessionId || uuidv4();

    // Save user message
    await ChatMessage.create({ sessionId: sid, caseId, userId: req.user!.id, role: 'user', content: message, isAIGenerated: false });

    // Get session history
    const history = await ChatMessage.find({ sessionId: sid }).sort({ createdAt: 1 }).limit(20);

    // Build case context if caseId provided
    let caseContext: any = {};
    if (caseId) {
      const [caseDoc, voiceCount, emailCount, identityCount, blockchainCount, alertCount, entities] = await Promise.all([
        Case.findById(caseId),
        VoiceAnalysis.countDocuments({ caseId }),
        EmailAnalysis.countDocuments({ caseId }),
        IdentityAnalysis.countDocuments({ caseId }),
        BlockchainAnalysis.countDocuments({ caseId }),
        Alert.countDocuments({ caseId, isRead: false }),
        Entity.find({ caseId }).select('name type').limit(20),
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

    const aiResult = await generateChatResponse(
      message,
      history.map(h => ({ role: h.role, content: h.content })),
      caseContext
    );

    const aiMessage = await ChatMessage.create({
      sessionId: sid, caseId, userId: req.user!.id,
      role: 'assistant', content: aiResult.content,
      sources: aiResult.sources, confidence: aiResult.confidence,
      isAIGenerated: true,
    });

    res.json({ success: true, data: { sessionId: sid, message: aiMessage, context: caseContext } });
  } catch (err) { next(err); }
};

export const unifiedAnalysis = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caseId } = req.body;
    if (!caseId) return next(createError('caseId is required', 400));

    const [caseDoc, voiceCount, emailCount, identityCount, blockchainCount, alertCount, entities] = await Promise.all([
      Case.findById(caseId),
      VoiceAnalysis.countDocuments({ caseId }),
      EmailAnalysis.countDocuments({ caseId }),
      IdentityAnalysis.countDocuments({ caseId }),
      BlockchainAnalysis.countDocuments({ caseId }),
      Alert.countDocuments({ caseId }),
      Entity.find({ caseId }).select('name type').limit(20),
    ]);

    if (!caseDoc) return next(createError('Case not found', 404));

    const context = {
      caseId, caseTitle: caseDoc.title, riskScore: caseDoc.riskScore,
      voiceAnalyses: voiceCount, emailAnalyses: emailCount,
      identityAnalyses: identityCount, blockchainAnalyses: blockchainCount,
      alerts: alertCount, entities: entities.map(e => `${e.name} (${e.type})`),
    };

    const result = await generateUnifiedAnalysis(context);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const getChatHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { sessionId, caseId } = req.query;
    const filter: any = { userId: req.user!.id };
    if (sessionId) filter.sessionId = sessionId;
    if (caseId) filter.caseId = caseId;
    const messages = await ChatMessage.find(filter).sort({ createdAt: 1 }).limit(100);
    res.json({ success: true, data: messages });
  } catch (err) { next(err); }
};
