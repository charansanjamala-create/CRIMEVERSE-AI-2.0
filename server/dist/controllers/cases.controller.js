"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCaseTimeline = exports.getCaseEvidence = exports.getCaseEntities = exports.deleteCase = exports.updateCase = exports.getCaseById = exports.createCase = exports.getCases = void 0;
const Case_1 = require("../models/Case");
const Entity_1 = require("../models/Entity");
const Evidence_1 = require("../models/Evidence");
const TimelineEvent_1 = require("../models/TimelineEvent");
const errorHandler_1 = require("../middleware/errorHandler");
const uuid_1 = require("uuid");
const getCases = async (req, res, next) => {
    try {
        const { status, priority, page = 1, limit = 20, search } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (priority)
            filter.priority = priority;
        if (search)
            filter.$or = [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
        const skip = (Number(page) - 1) * Number(limit);
        const [cases, total] = await Promise.all([
            Case_1.Case.find(filter).populate('assignedTo', 'name email').populate('createdBy', 'name email').sort({ lastActivityAt: -1 }).skip(skip).limit(Number(limit)),
            Case_1.Case.countDocuments(filter),
        ]);
        res.json({ success: true, data: cases, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
    }
    catch (err) {
        next(err);
    }
};
exports.getCases = getCases;
const createCase = async (req, res, next) => {
    try {
        const { title, description, priority, tags } = req.body;
        if (!title || !description)
            return next((0, errorHandler_1.createError)('Title and description are required', 400));
        const caseDoc = await Case_1.Case.create({
            caseId: `CV-${Date.now()}-${(0, uuid_1.v4)().slice(0, 6).toUpperCase()}`,
            title, description,
            priority: priority || 'MEDIUM',
            tags: tags || [],
            createdBy: req.user.id,
        });
        res.status(201).json({ success: true, data: caseDoc });
    }
    catch (err) {
        next(err);
    }
};
exports.createCase = createCase;
const getCaseById = async (req, res, next) => {
    try {
        const caseDoc = await Case_1.Case.findById(req.params.id)
            .populate('assignedTo', 'name email role')
            .populate('createdBy', 'name email role');
        if (!caseDoc)
            return next((0, errorHandler_1.createError)('Case not found', 404));
        res.json({ success: true, data: caseDoc });
    }
    catch (err) {
        next(err);
    }
};
exports.getCaseById = getCaseById;
const updateCase = async (req, res, next) => {
    try {
        const allowed = ['title', 'description', 'status', 'priority', 'assignedTo', 'tags', 'summary', 'riskScore'];
        const updates = {};
        allowed.forEach(k => { if (req.body[k] !== undefined)
            updates[k] = req.body[k]; });
        updates.lastActivityAt = new Date();
        const caseDoc = await Case_1.Case.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        if (!caseDoc)
            return next((0, errorHandler_1.createError)('Case not found', 404));
        res.json({ success: true, data: caseDoc });
    }
    catch (err) {
        next(err);
    }
};
exports.updateCase = updateCase;
const deleteCase = async (req, res, next) => {
    try {
        if (!['ADMIN', 'INVESTIGATOR'].includes(req.user.role))
            return next((0, errorHandler_1.createError)('Insufficient permissions', 403));
        const caseDoc = await Case_1.Case.findByIdAndDelete(req.params.id);
        if (!caseDoc)
            return next((0, errorHandler_1.createError)('Case not found', 404));
        res.json({ success: true, message: 'Case deleted successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteCase = deleteCase;
const getCaseEntities = async (req, res, next) => {
    try {
        const entities = await Entity_1.Entity.find({ caseId: req.params.id }).sort({ riskScore: -1 });
        res.json({ success: true, data: entities });
    }
    catch (err) {
        next(err);
    }
};
exports.getCaseEntities = getCaseEntities;
const getCaseEvidence = async (req, res, next) => {
    try {
        const evidence = await Evidence_1.Evidence.find({ caseId: req.params.id }).populate('uploadedBy', 'name').sort({ createdAt: -1 });
        res.json({ success: true, data: evidence });
    }
    catch (err) {
        next(err);
    }
};
exports.getCaseEvidence = getCaseEvidence;
const getCaseTimeline = async (req, res, next) => {
    try {
        const events = await TimelineEvent_1.TimelineEvent.find({ caseId: req.params.id }).sort({ eventDate: -1 });
        res.json({ success: true, data: events });
    }
    catch (err) {
        next(err);
    }
};
exports.getCaseTimeline = getCaseTimeline;
//# sourceMappingURL=cases.controller.js.map