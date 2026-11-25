import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { EmailAnalysis } from '../models/EmailAnalysis';
import { Case } from '../models/Case';
import { Evidence } from '../models/Evidence';
import { Alert } from '../models/Alert';
import { analyzeEmail } from '../ai/emailForensics';
import { createError } from '../middleware/errorHandler';

export const analyzeEmailContent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { content, caseId } = req.body;
    if (!content || content.trim().length < 10) return next(createError('Email content is required (minimum 10 characters)', 400));

    const result = await analyzeEmail(content);

    const analysis = await EmailAnalysis.create({
      caseId: caseId || undefined,
      rawContent: content,
      ...result,
      analyzedBy: req.user!.id,
    });

    if (caseId) {
      await Evidence.create({
        caseId, title: `Email Analysis: ${result.subject || 'Unknown Subject'}`,
        type: 'EMAIL', content: content.slice(0, 500),
        isProcessed: true, processingStatus: 'completed',
        uploadedBy: req.user!.id,
      });
      await Case.findByIdAndUpdate(caseId, { $inc: { evidenceCount: 1 }, lastActivityAt: new Date() });

      if (result.threatScore >= 60) {
        await Alert.create({
          caseId, title: 'High-Threat Email Detected',
          message: `Email analysis returned threat score: ${result.threatScore}/100. Categories: ${result.threatCategories.join(', ')}.`,
          severity: result.threatScore >= 80 ? 'CRITICAL' : 'HIGH',
          category: 'email', source: 'MailGuard Intelligence',
        });
        await Case.findByIdAndUpdate(caseId, { $inc: { alertCount: 1 } });
      }
    }

    res.status(201).json({ success: true, data: analysis, message: 'Email analysis complete' });
  } catch (err) { next(err); }
};

export const getEmailHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caseId } = req.query;
    const filter: any = caseId ? { caseId } : {};
    const analyses = await EmailAnalysis.find(filter).populate('analyzedBy', 'name').sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: analyses });
  } catch (err) { next(err); }
};

export const getEmailAnalysis = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const analysis = await EmailAnalysis.findById(req.params.id).populate('analyzedBy', 'name email');
    if (!analysis) return next(createError('Email analysis not found', 404));
    res.json({ success: true, data: analysis });
  } catch (err) { next(err); }
};
