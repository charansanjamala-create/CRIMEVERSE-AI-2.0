import mongoose, { Schema, Document } from 'mongoose';

export interface IAlert extends Document {
  _id: mongoose.Types.ObjectId;
  caseId?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  category: string;
  source: string;
  isRead: boolean;
  isAcknowledged: boolean;
  acknowledgedBy?: mongoose.Types.ObjectId;
  acknowledgedAt?: Date;
  relatedEntities: mongoose.Types.ObjectId[];
  metadata: Record<string, any>;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ['INFO', 'WARNING', 'HIGH', 'CRITICAL'], default: 'INFO' },
    category: { type: String, default: 'general' },
    source: { type: String, default: 'system' },
    isRead: { type: Boolean, default: false },
    isAcknowledged: { type: Boolean, default: false },
    acknowledgedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    acknowledgedAt: { type: Date },
    relatedEntities: [{ type: Schema.Types.ObjectId, ref: 'Entity' }],
    metadata: { type: Schema.Types.Mixed, default: {} },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

AlertSchema.index({ caseId: 1, severity: -1 });
AlertSchema.index({ isRead: 1, createdAt: -1 });

export const Alert = mongoose.model<IAlert>('Alert', AlertSchema);
