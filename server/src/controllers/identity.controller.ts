import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { IdentityAnalysis } from '../models/IdentityAnalysis';
import { Case } from '../models/Case';
import { Evidence } from '../models/Evidence';
import { Alert } from '../models/Alert';
import { analyzeIdentity } from '../ai/identityVerification';
import { createError } from '../middleware/errorHandler';
import fs from 'fs';

export const analyzeIdentityDoc = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caseId, documentType, fields } = req.body;
    const file = req.file;

    if (!documentType) return next(createError('Document type is required', 400));

    const parsedFields = typeof fields === 'string' ? JSON.parse(fields) : (fields || {});
    const result = await analyzeIdentity(documentType, parsedFields, file?.originalname);

    const analysis = await IdentityAnalysis.create({
      caseId: caseId || undefined,
      fileName: file?.originalname,
      ...result,
      analyzedBy: req.user!.id,
    });

    if (caseId) {
      await Evidence.create({
        caseId, title: `Identity Analysis: ${documentType} — ${result.subjectName || 'Unknown'}`,
        type: 'DOCUMENT',
        ...(file ? { fileName: file.filename, filePath: file.path, fileSize: file.size } : {}),
        isProcessed: true, processingStatus: 'completed',
        uploadedBy: req.user!.id,
      });
      await Case.findByIdAndUpdate(caseId, { $inc: { evidenceCount: 1 }, lastActivityAt: new Date() });

      if (result.riskScore >= 60) {
        await Alert.create({
          caseId, title: 'Document Inconsistencies Detected',
          message: `Identity analysis of ${documentType} document returned risk score: ${result.riskScore}/100. Status: ${result.verificationStatus}.`,
          severity: result.riskScore >= 80 ? 'CRITICAL' : 'HIGH',
          category: 'identity', source: 'VeriTrust AI',
        });
        await Case.findByIdAndUpdate(caseId, { $inc: { alertCount: 1 } });
      }
    }

    if (file) { try { fs.unlinkSync(file.path); } catch {} }

    res.status(201).json({ success: true, data: analysis, message: 'Identity analysis complete' });
  } catch (err) { next(err); }
};

export const getIdentityHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caseId } = req.query;
    const filter: any = caseId ? { caseId } : {};
    const analyses = await IdentityAnalysis.find(filter).populate('analyzedBy', 'name').sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: analyses });
  } catch (err) { next(err); }
};

export const getIdentityAnalysis = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const analysis = await IdentityAnalysis.findById(req.params.id).populate('analyzedBy', 'name email');
    if (!analysis) return next(createError('Identity analysis not found', 404));
    res.json({ success: true, data: analysis });
  } catch (err) { next(err); }
};
