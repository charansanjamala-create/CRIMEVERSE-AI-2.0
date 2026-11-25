import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { Case } from '../models/Case';
import { Entity } from '../models/Entity';
import { Evidence } from '../models/Evidence';
import { TimelineEvent } from '../models/TimelineEvent';
import { Alert } from '../models/Alert';
import { createError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

export const getCases = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, priority, page = 1, limit = 20, search } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) filter.$or = [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];

    const skip = (Number(page) - 1) * Number(limit);
    const [cases, total] = await Promise.all([
      Case.find(filter).populate('assignedTo', 'name email').populate('createdBy', 'name email').sort({ lastActivityAt: -1 }).skip(skip).limit(Number(limit)),
      Case.countDocuments(filter),
    ]);
    res.json({ success: true, data: cases, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) { next(err); }
};

export const createCase = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, priority, tags } = req.body;
    if (!title || !description) return next(createError('Title and description are required', 400));
    const caseDoc = await Case.create({
      caseId: `CV-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`,
      title, description,
      priority: priority || 'MEDIUM',
      tags: tags || [],
      createdBy: req.user!.id,
    });
    res.status(201).json({ success: true, data: caseDoc });
  } catch (err) { next(err); }
};

export const getCaseById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const caseDoc = await Case.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');
    if (!caseDoc) return next(createError('Case not found', 404));
    res.json({ success: true, data: caseDoc });
  } catch (err) { next(err); }
};

export const updateCase = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const allowed = ['title', 'description', 'status', 'priority', 'assignedTo', 'tags', 'summary', 'riskScore'];
    const updates: any = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    updates.lastActivityAt = new Date();
    const caseDoc = await Case.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!caseDoc) return next(createError('Case not found', 404));
    res.json({ success: true, data: caseDoc });
  } catch (err) { next(err); }
};

export const deleteCase = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!['ADMIN', 'INVESTIGATOR'].includes(req.user!.role)) return next(createError('Insufficient permissions', 403));
    const caseDoc = await Case.findByIdAndDelete(req.params.id);
    if (!caseDoc) return next(createError('Case not found', 404));
    res.json({ success: true, message: 'Case deleted successfully' });
  } catch (err) { next(err); }
};

export const getCaseEntities = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const entities = await Entity.find({ caseId: req.params.id }).sort({ riskScore: -1 });
    res.json({ success: true, data: entities });
  } catch (err) { next(err); }
};

export const getCaseEvidence = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const evidence = await Evidence.find({ caseId: req.params.id }).populate('uploadedBy', 'name').sort({ createdAt: -1 });
    res.json({ success: true, data: evidence });
  } catch (err) { next(err); }
};

export const getCaseTimeline = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const events = await TimelineEvent.find({ caseId: req.params.id }).sort({ eventDate: -1 });
    res.json({ success: true, data: events });
  } catch (err) { next(err); }
};
