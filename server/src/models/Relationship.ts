import mongoose, { Schema, Document } from 'mongoose';

export interface IRelationship extends Document {
  _id: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  sourceEntity: mongoose.Types.ObjectId;
  targetEntity: mongoose.Types.ObjectId;
  relationshipType: string;
  strength: number;
  confidence: number;
  description?: string;
  evidenceIds: mongoose.Types.ObjectId[];
  isConfirmed: boolean;
  requiresReview: boolean;
  discoveredAt: Date;
  lastSeen?: Date;
  metadata: Record<string, any>;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RelationshipSchema = new Schema<IRelationship>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    sourceEntity: { type: Schema.Types.ObjectId, ref: 'Entity', required: true },
    targetEntity: { type: Schema.Types.ObjectId, ref: 'Entity', required: true },
    relationshipType: { type: String, required: true },
    strength: { type: Number, default: 50, min: 0, max: 100 },
    confidence: { type: Number, default: 50, min: 0, max: 100 },
    description: { type: String },
    evidenceIds: [{ type: Schema.Types.ObjectId, ref: 'Evidence' }],
    isConfirmed: { type: Boolean, default: false },
    requiresReview: { type: Boolean, default: true },
    discoveredAt: { type: Date, default: Date.now },
    lastSeen: { type: Date },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

RelationshipSchema.index({ caseId: 1 });
RelationshipSchema.index({ sourceEntity: 1, targetEntity: 1 });

export const Relationship = mongoose.model<IRelationship>('Relationship', RelationshipSchema);
