import mongoose, { Schema, Document } from 'mongoose';

export interface ITimelineEvent extends Document {
  _id: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  eventType: string;
  title: string;
  description: string;
  eventDate: Date;
  entities: mongoose.Types.ObjectId[];
  evidenceIds: mongoose.Types.ObjectId[];
  source: string;
  significance: string;
  isVerified: boolean;
  metadata: Record<string, any>;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TimelineEventSchema = new Schema<ITimelineEvent>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    eventType: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    eventDate: { type: Date, required: true },
    entities: [{ type: Schema.Types.ObjectId, ref: 'Entity' }],
    evidenceIds: [{ type: Schema.Types.ObjectId, ref: 'Evidence' }],
    source: { type: String, default: 'manual' },
    significance: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
    isVerified: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

TimelineEventSchema.index({ caseId: 1, eventDate: -1 });

export const TimelineEvent = mongoose.model<ITimelineEvent>('TimelineEvent', TimelineEventSchema);
