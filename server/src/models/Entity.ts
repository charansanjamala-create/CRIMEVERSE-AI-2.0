import mongoose, { Schema, Document } from 'mongoose';

export type EntityType =
  | 'PERSON'
  | 'ORGANIZATION'
  | 'EMAIL'
  | 'PHONE'
  | 'WALLET'
  | 'DEVICE'
  | 'IP'
  | 'DOMAIN'
  | 'DOCUMENT'
  | 'LOCATION'
  | 'VEHICLE'
  | 'TRANSACTION'
  | 'EVIDENCE';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';

export interface IEntity extends Document {
  _id: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  type: EntityType;
  name: string;
  identifier: string;
  riskLevel: RiskLevel;
  riskScore: number;
  description?: string;
  aliases: string[];
  attributes: Record<string, any>;
  connections: mongoose.Types.ObjectId[];
  evidenceIds: mongoose.Types.ObjectId[];
  isVerified: boolean;
  requiresReview: boolean;
  tags: string[];
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EntitySchema = new Schema<IEntity>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    type: {
      type: String,
      enum: [
        'PERSON',
        'ORGANIZATION',
        'EMAIL',
        'PHONE',
        'WALLET',
        'DEVICE',
        'IP',
        'DOMAIN',
        'DOCUMENT',
        'LOCATION',
        'VEHICLE',
        'TRANSACTION',
        'EVIDENCE',
      ],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    identifier: { type: String, required: true },
    riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN'], default: 'UNKNOWN' },
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    description: { type: String },
    aliases: [{ type: String }],
    attributes: { type: Schema.Types.Mixed, default: {} },
    connections: [{ type: Schema.Types.ObjectId, ref: 'Entity' }],
    evidenceIds: [{ type: Schema.Types.ObjectId, ref: 'Evidence' }],
    isVerified: { type: Boolean, default: false },
    requiresReview: { type: Boolean, default: true },
    tags: [{ type: String }],
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

EntitySchema.index({ caseId: 1, type: 1 });
EntitySchema.index({ identifier: 1 });
EntitySchema.index({ riskScore: -1 });

export const Entity = mongoose.model<IEntity>('Entity', EntitySchema);
