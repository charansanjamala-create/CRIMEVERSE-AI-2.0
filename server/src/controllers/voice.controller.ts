import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { VoiceAnalysis } from '../models/VoiceAnalysis';
import { Case } from '../models/Case';
import { Evidence } from '../models/Evidence';
import { Alert } from '../models/Alert';
import { analyzeVoice } from '../ai/voiceAnalysis';
import { createError } from '../middleware/errorHandler';
import fs from 'fs';

export const analyzeVoiceFile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caseId } = req.body;
    const file = req.file;
    if (!file) return next(createError('Audio file is required', 400));

    const result = await analyzeVoice(file.originalname);

    const analysis = await VoiceAnalysis.create({
      caseId: caseId || undefined,
      fileName: file.originalname,
      fileSize: file.size,
      ...result,
      analyzedBy: req.user!.id,
    });

    if (caseId) {
      await Evidence.create({
        caseId, title: `Voice Analysis: ${file.originalname}`,
        type: 'AUDIO', fileName: file.filename, filePath: file.path,
        fileSize: file.size, mimeType: file.mimetype,
        isProcessed: true, processingStatus: 'completed',
        uploadedBy: req.user!.id,
      });
      await Case.findByIdAndUpdate(caseId, { $inc: { evidenceCount: 1 }, lastActivityAt: new Date() });

      if (result.suspicionScore >= 70) {
        await Alert.create({
          caseId, title: 'High Suspicion Voice Sample Detected',
          message: `Voice analysis of "${file.originalname}" returned suspicion score: ${result.suspicionScore}/100. Requires immediate human review.`,
          severity: 'HIGH', category: 'voice', source: 'VoiceShield AI',
        });
        await Case.findByIdAndUpdate(caseId, { $inc: { alertCount: 1 } });
      }
    }

    // Clean up uploaded file (we store results in DB, not files for demo)
    try { fs.unlinkSync(file.path); } catch {}

    res.status(201).json({ success: true, data: analysis, message: 'Voice analysis complete' });
  } catch (err) { next(err); }
};

export const getVoiceHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caseId } = req.query;
    const filter: any = caseId ? { caseId } : {};
    const analyses = await VoiceAnalysis.find(filter).populate('analyzedBy', 'name').sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: analyses });
  } catch (err) { next(err); }
};

export const getVoiceAnalysis = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const analysis = await VoiceAnalysis.findById(req.params.id).populate('analyzedBy', 'name email');
    if (!analysis) return next(createError('Voice analysis not found', 404));
    res.json({ success: true, data: analysis });
  } catch (err) { next(err); }
};
