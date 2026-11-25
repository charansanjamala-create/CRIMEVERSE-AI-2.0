import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authenticate';
import { Escalation, EscalationStatus, EscalationPriority } from '../models/Escalation';
import { Case } from '../models/Case';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { createError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

// List escalations (supervisor review queue)
export const getEscalations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, priority, caseId } = req.query;
    const filter: any = {};
    if (status && status !== 'ALL') filter.status = status;
    if (priority && priority !== 'ALL') filter.priority = priority;
    if (caseId) {
      if (mongoose.Types.ObjectId.isValid(caseId as string)) {
        filter.caseId = caseId;
      } else {
        const c = await Case.findOne({ caseId });
        if (c) filter.caseId = c._id;
      }
    }

    const escalations = await Escalation.find(filter)
      .populate('caseId', 'title caseId riskScore priority')
      .populate('submittedBy', 'name email role')
      .populate('supervisorId', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: escalations });
  } catch (err) {
    next(err);
  }
};

// Create escalation
export const createEscalation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caseId, reason, trigger, priority } = req.body;
    if (!caseId || !reason) {
      return next(createError('caseId and reason are required', 400));
    }

    let resolvedCaseId = caseId;
    if (caseId && !mongoose.Types.ObjectId.isValid(caseId)) {
      const c = await Case.findOne({ caseId });
      if (c) resolvedCaseId = c._id;
    }

    const escalationId = `ESC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${uuidv4().slice(0, 5).toUpperCase()}`;

    const escalation = await Escalation.create({
      escalationId,
      caseId: resolvedCaseId,
      reason,
      trigger: trigger || 'HUMAN_REVIEW_REQUIRED',
      priority: (priority as EscalationPriority) || 'HIGH',
      status: 'PENDING',
      submittedBy: req.user!.id,
      submittedByName: req.user!.name,
      reviewNotes: [
        {
          note: `Investigation escalated to supervisor: ${reason}`,
          authorName: req.user!.name,
          authorRole: req.user!.role,
          authorId: req.user!.id,
          createdAt: new Date(),
        },
      ],
    });

    // Notify all supervisors & admins
    const supervisors = await User.find({ role: { $in: ['SUPERVISOR', 'ADMIN'] } }).select('_id');
    const notifs = supervisors.map(s => ({
      userId: s._id,
      title: `Supervisor Escalation: ${escalationId}`,
      message: `Officer ${req.user!.name} escalated case for priority review. Reason: ${reason.slice(0, 100)}...`,
      type: 'escalation',
      link: `/escalations`,
    }));
    if (notifs.length > 0) {
      await Notification.insertMany(notifs);
    }

    res.status(201).json({ success: true, data: escalation });
  } catch (err) {
    next(err);
  }
};

// Update escalation status (Supervisor action)
export const updateEscalationStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, supervisorComments, supervisorNotes, notes, reviewNote } = req.body;

    const escalation = mongoose.Types.ObjectId.isValid(id)
      ? await Escalation.findById(id)
      : await Escalation.findOne({ escalationId: id });
    if (!escalation) return next(createError('Escalation not found', 404));

    if (status) {
      escalation.status = status as EscalationStatus;
      if (status === 'RESOLVED') escalation.dateResolved = new Date();
    }

    escalation.supervisorId = req.user!.id as any;
    escalation.supervisorName = req.user!.name;

    const finalFeedback = supervisorComments || supervisorNotes || notes || reviewNote;
    if (finalFeedback) {
      escalation.supervisorComments = finalFeedback;
      escalation.reviewNotes.push({
        note: finalFeedback,
        authorName: req.user!.name,
        authorRole: req.user!.role,
        authorId: req.user!.id as any,
        createdAt: new Date(),
      });
    }

    await escalation.save();

    // Notify submitting officer
    await Notification.create({
      userId: escalation.submittedBy,
      title: `Escalation ${escalation.escalationId} Updated`,
      message: `Supervisor ${req.user!.name} updated status to ${escalation.status}. ${supervisorComments ? `Feedback: ${supervisorComments}` : ''}`,
      type: 'escalation',
      link: `/escalations`,
    });

    res.json({ success: true, data: escalation });
  } catch (err) {
    next(err);
  }
};
