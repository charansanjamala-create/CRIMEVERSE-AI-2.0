import mongoose, { Schema, Document } from 'mongoose';

export type EscalationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EscalationStatus = 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'RETURNED' | 'RESOLVED';
export type EscalationTrigger =
  | 'LOW_CONFIDENCE'
  | 'CONTRADICTORY_EVIDENCE'
  | 'HIGH_RISK_SCORE'
  | 'MISSING_INFORMATION'
  | 'CHALLENGE_UNCERTAINTY'
  | 'HUMAN_REVIEW_REQUIRED'
  | 'OTHER';

export interface IEscalationReviewNote {
  note: string;
  authorName: string;
  authorRole: string;
  authorId: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface IEscalation extends Document {
  _id: mongoose.Types.ObjectId;
  escalationId: string;
  caseId: mongoose.Types.ObjectId;
  reason: string;
  trigger: EscalationTrigger;
  priority: EscalationPriority;
  status: EscalationStatus;
  submittedBy: mongoose.Types.ObjectId;
  submittedByName: string;
  supervisorId?: mongoose.Types.ObjectId;
  supervisorName?: string;
  supervisorComments?: string;
  reviewNotes: IEscalationReviewNote[];
  dateSubmitted: Date;
  dateResolved?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EscalationSchema = new Schema<IEscalation>(
  {
    escalationId: { type: String, required: true, unique: true, index: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
    reason: { type: String, required: true, maxlength: 2000 },
    trigger: {
      type: String,
      enum: [
        'LOW_CONFIDENCE',
        'CONTRADICTORY_EVIDENCE',
        'HIGH_RISK_SCORE',
        'MISSING_INFORMATION',
        'CHALLENGE_UNCERTAINTY',
        'HUMAN_REVIEW_REQUIRED',
        'OTHER',
      ],
      default: 'HUMAN_REVIEW_REQUIRED',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'HIGH',
    },
    status: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'RETURNED', 'RESOLVED'],
      default: 'PENDING',
      index: true,
    },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    submittedByName: { type: String, required: true },
    supervisorId: { type: Schema.Types.ObjectId, ref: 'User' },
    supervisorName: { type: String },
    supervisorComments: { type: String },
    reviewNotes: [
      {
        note: { type: String, required: true },
        authorName: { type: String, required: true },
        authorRole: { type: String, required: true },
        authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    dateSubmitted: { type: Date, default: Date.now },
    dateResolved: { type: Date },
  },
  { timestamps: true }
);

EscalationSchema.index({ status: 1, priority: -1 });

export const Escalation = mongoose.model<IEscalation>('Escalation', EscalationSchema);
