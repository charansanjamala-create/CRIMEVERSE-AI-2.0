"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEscalationStatus = exports.createEscalation = exports.getEscalations = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Escalation_1 = require("../models/Escalation");
const Case_1 = require("../models/Case");
const Notification_1 = require("../models/Notification");
const User_1 = require("../models/User");
const errorHandler_1 = require("../middleware/errorHandler");
const uuid_1 = require("uuid");
// List escalations (supervisor review queue)
const getEscalations = async (req, res, next) => {
    try {
        const { status, priority, caseId } = req.query;
        const filter = {};
        if (status && status !== 'ALL')
            filter.status = status;
        if (priority && priority !== 'ALL')
            filter.priority = priority;
        if (caseId) {
            if (mongoose_1.default.Types.ObjectId.isValid(caseId)) {
                filter.caseId = caseId;
            }
            else {
                const c = await Case_1.Case.findOne({ caseId });
                if (c)
                    filter.caseId = c._id;
            }
        }
        const escalations = await Escalation_1.Escalation.find(filter)
            .populate('caseId', 'title caseId riskScore priority')
            .populate('submittedBy', 'name email role')
            .populate('supervisorId', 'name email role')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: escalations });
    }
    catch (err) {
        next(err);
    }
};
exports.getEscalations = getEscalations;
// Create escalation
const createEscalation = async (req, res, next) => {
    try {
        const { caseId, reason, trigger, priority } = req.body;
        if (!caseId || !reason) {
            return next((0, errorHandler_1.createError)('caseId and reason are required', 400));
        }
        let resolvedCaseId = caseId;
        if (caseId && !mongoose_1.default.Types.ObjectId.isValid(caseId)) {
            const c = await Case_1.Case.findOne({ caseId });
            if (c)
                resolvedCaseId = c._id;
        }
        const escalationId = `ESC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${(0, uuid_1.v4)().slice(0, 5).toUpperCase()}`;
        const escalation = await Escalation_1.Escalation.create({
            escalationId,
            caseId: resolvedCaseId,
            reason,
            trigger: trigger || 'HUMAN_REVIEW_REQUIRED',
            priority: priority || 'HIGH',
            status: 'PENDING',
            submittedBy: req.user.id,
            submittedByName: req.user.name,
            reviewNotes: [
                {
                    note: `Investigation escalated to supervisor: ${reason}`,
                    authorName: req.user.name,
                    authorRole: req.user.role,
                    authorId: req.user.id,
                    createdAt: new Date(),
                },
            ],
        });
        // Notify all supervisors & admins
        const supervisors = await User_1.User.find({ role: { $in: ['SUPERVISOR', 'ADMIN'] } }).select('_id');
        const notifs = supervisors.map(s => ({
            userId: s._id,
            title: `Supervisor Escalation: ${escalationId}`,
            message: `Officer ${req.user.name} escalated case for priority review. Reason: ${reason.slice(0, 100)}...`,
            type: 'escalation',
            link: `/escalations`,
        }));
        if (notifs.length > 0) {
            await Notification_1.Notification.insertMany(notifs);
        }
        res.status(201).json({ success: true, data: escalation });
    }
    catch (err) {
        next(err);
    }
};
exports.createEscalation = createEscalation;
// Update escalation status (Supervisor action)
const updateEscalationStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, supervisorComments, supervisorNotes, notes, reviewNote } = req.body;
        const escalation = mongoose_1.default.Types.ObjectId.isValid(id)
            ? await Escalation_1.Escalation.findById(id)
            : await Escalation_1.Escalation.findOne({ escalationId: id });
        if (!escalation)
            return next((0, errorHandler_1.createError)('Escalation not found', 404));
        if (status) {
            escalation.status = status;
            if (status === 'RESOLVED')
                escalation.dateResolved = new Date();
        }
        escalation.supervisorId = req.user.id;
        escalation.supervisorName = req.user.name;
        const finalFeedback = supervisorComments || supervisorNotes || notes || reviewNote;
        if (finalFeedback) {
            escalation.supervisorComments = finalFeedback;
            escalation.reviewNotes.push({
                note: finalFeedback,
                authorName: req.user.name,
                authorRole: req.user.role,
                authorId: req.user.id,
                createdAt: new Date(),
            });
        }
        await escalation.save();
        // Notify submitting officer
        await Notification_1.Notification.create({
            userId: escalation.submittedBy,
            title: `Escalation ${escalation.escalationId} Updated`,
            message: `Supervisor ${req.user.name} updated status to ${escalation.status}. ${supervisorComments ? `Feedback: ${supervisorComments}` : ''}`,
            type: 'escalation',
            link: `/escalations`,
        });
        res.json({ success: true, data: escalation });
    }
    catch (err) {
        next(err);
    }
};
exports.updateEscalationStatus = updateEscalationStatus;
//# sourceMappingURL=escalations.controller.js.map