import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { Entity } from '../models/Entity';
import { Relationship } from '../models/Relationship';
import { TimelineEvent } from '../models/TimelineEvent';
import { Case } from '../models/Case';
import { createError } from '../middleware/errorHandler';

export const getNetwork = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caseId } = req.params;
    const [entities, relationships] = await Promise.all([
      Entity.find({ caseId }).sort({ riskScore: -1 }),
      Relationship.find({ caseId }).populate('sourceEntity', 'name type').populate('targetEntity', 'name type'),
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
  } catch (err) { next(err); }
};

export const createRelationship = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caseId, sourceEntity, targetEntity, relationshipType, strength, confidence, description } = req.body;
    if (!caseId || !sourceEntity || !targetEntity || !relationshipType) {
      return next(createError('caseId, sourceEntity, targetEntity and relationshipType are required', 400));
    }
    const rel = await Relationship.create({
      caseId, sourceEntity, targetEntity, relationshipType,
      strength: strength || 50, confidence: confidence || 50,
      description, createdBy: req.user!.id,
    });
    res.status(201).json({ success: true, data: rel });
  } catch (err) { next(err); }
};

export const createEntity = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caseId, type, name, identifier, riskLevel, description, attributes } = req.body;
    if (!caseId || !type || !name || !identifier) {
      return next(createError('caseId, type, name and identifier are required', 400));
    }
    const entity = await Entity.create({
      caseId, type, name, identifier,
      riskLevel: riskLevel || 'UNKNOWN',
      description, attributes: attributes || {},
      createdBy: req.user!.id,
    });
    await Case.findByIdAndUpdate(caseId, { $inc: { entityCount: 1 }, lastActivityAt: new Date() });
    res.status(201).json({ success: true, data: entity });
  } catch (err) { next(err); }
};

export const getCaseTimeline = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caseId } = req.params;
    const events = await TimelineEvent.find({ caseId }).sort({ eventDate: -1 });
    res.json({ success: true, data: events });
  } catch (err) { next(err); }
};
