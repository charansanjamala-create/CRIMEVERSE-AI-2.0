import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { Evidence } from '../models/Evidence';
import { Case } from '../models/Case';
import { createError } from '../middleware/errorHandler';
import fs from 'fs';

export const getEvidence = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caseId, type } = req.query;
    const filter: any = {};
    if (caseId) filter.caseId = caseId;
    if (type) filter.type = type;
    const evidence = await Evidence.find(filter).populate('uploadedBy', 'name').sort({ createdAt: -1 });
    res.json({ success: true, data: evidence });
  } catch (err) { next(err); }
};

export const createEvidence = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caseId, title, description, type, content, tags } = req.body;
    const file = req.file;
    if (!caseId || !title || !type) return next(createError('caseId, title and type are required', 400));

    const ev = await Evidence.create({
      caseId, title, description, type, content, tags: tags || [],
      ...(file ? { fileName: file.originalname, filePath: file.path, fileSize: file.size, mimeType: file.mimetype } : {}),
      uploadedBy: req.user!.id,
    });
    await Case.findByIdAndUpdate(caseId, { $inc: { evidenceCount: 1 }, lastActivityAt: new Date() });
    res.status(201).json({ success: true, data: ev });
  } catch (err) { next(err); }
};

export const getEvidenceById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ev = await Evidence.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!ev) return next(createError('Evidence not found', 404));
    res.json({ success: true, data: ev });
  } catch (err) { next(err); }
};

export const deleteEvidence = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ev = await Evidence.findById(req.params.id);
    if (!ev) return next(createError('Evidence not found', 404));
    if (ev.filePath) { try { fs.unlinkSync(ev.filePath); } catch {} }
    await ev.deleteOne();
    await Case.findByIdAndUpdate(ev.caseId, { $inc: { evidenceCount: -1 } });
    res.json({ success: true, message: 'Evidence deleted' });
  } catch (err) { next(err); }
};
