"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCaseTimeline = exports.createEntity = exports.createRelationship = exports.getNetwork = void 0;
const Entity_1 = require("../models/Entity");
const Relationship_1 = require("../models/Relationship");
const TimelineEvent_1 = require("../models/TimelineEvent");
const Case_1 = require("../models/Case");
const errorHandler_1 = require("../middleware/errorHandler");
const getNetwork = async (req, res, next) => {
    try {
        const { caseId } = req.params;
        const [entities, relationships] = await Promise.all([
            Entity_1.Entity.find({ caseId }).sort({ riskScore: -1 }),
            Relationship_1.Relationship.find({ caseId }).populate('sourceEntity', 'name type').populate('targetEntity', 'name type'),
        ]);
        const nodes = entities.map(e => ({
            id: e._id.toString(), label: e.name, type: e.type,
            riskLevel: e.riskLevel, riskScore: e.riskScore,
            data: { ...e.toObject() },
        }));
        const edges = relationships.map(r => ({
            id: r._id.toString(),
            source: r.sourceEntity._id.toString(),
            target: r.targetEntity._id.toString(),
            label: r.relationshipType,
            strength: r.strength, confidence: r.confidence,
            isConfirmed: r.isConfirmed,
        }));
        res.json({ success: true, data: { nodes, edges, entityCount: entities.length, relationshipCount: relationships.length } });
    }
    catch (err) {
        next(err);
    }
};
exports.getNetwork = getNetwork;
const createRelationship = async (req, res, next) => {
    try {
        const { caseId, sourceEntity, targetEntity, relationshipType, strength, confidence, description } = req.body;
        if (!caseId || !sourceEntity || !targetEntity || !relationshipType) {
            return next((0, errorHandler_1.createError)('caseId, sourceEntity, targetEntity and relationshipType are required', 400));
        }
        const rel = await Relationship_1.Relationship.create({
            caseId, sourceEntity, targetEntity, relationshipType,
            strength: strength || 50, confidence: confidence || 50,
            description, createdBy: req.user.id,
        });
        res.status(201).json({ success: true, data: rel });
    }
    catch (err) {
        next(err);
    }
};
exports.createRelationship = createRelationship;
const createEntity = async (req, res, next) => {
    try {
        const { caseId, type, name, identifier, riskLevel, description, attributes } = req.body;
        if (!caseId || !type || !name || !identifier) {
            return next((0, errorHandler_1.createError)('caseId, type, name and identifier are required', 400));
        }
        const entity = await Entity_1.Entity.create({
            caseId, type, name, identifier,
            riskLevel: riskLevel || 'UNKNOWN',
            description, attributes: attributes || {},
            createdBy: req.user.id,
        });
        await Case_1.Case.findByIdAndUpdate(caseId, { $inc: { entityCount: 1 }, lastActivityAt: new Date() });
        res.status(201).json({ success: true, data: entity });
    }
    catch (err) {
        next(err);
    }
};
exports.createEntity = createEntity;
const getCaseTimeline = async (req, res, next) => {
    try {
        const { caseId } = req.params;
        const events = await TimelineEvent_1.TimelineEvent.find({ caseId }).sort({ eventDate: -1 });
        res.json({ success: true, data: events });
    }
    catch (err) {
        next(err);
    }
};
exports.getCaseTimeline = getCaseTimeline;
//# sourceMappingURL=network.controller.js.map