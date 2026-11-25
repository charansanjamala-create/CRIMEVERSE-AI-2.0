import mongoose, { Schema, Document } from 'mongoose';

export type FindingVerificationStatus =
  | 'AI_INFERRED'
  | 'VERIFIED'
  | 'CONTRADICTED'
  | 'REQUIRES_HUMAN_REVIEW'
  | 'UNDER_CHALLENGE';

export interface ICriticalQuestion {
  question: string;
  answer?: string;
  category: 'EVIDENCE' | 'ASSUMPTION' | 'CONTRADICTION' | 'ALTERNATIVE';
  status: 'PENDING' | 'ADDRESSED' | 'FLAGGED';
}

export interface IHumanReview {
  reviewerId: mongoose.Types.ObjectId;
  reviewerName: string;
  verdict: 'CONFIRMED' | 'DISPUTED' | 'INCONCLUSIVE' | 'REQUIRES_MORE_EVIDENCE';
  comment: string;
  timestamp: Date;
}

export interface IAIFinding extends Document {
  _id: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  findingId: string;
  title: string;
  finding: string;
  confidence: number;
  supportingEvidence: string[];
  contradictingEvidence: string[];
  missingInformation: string[];
  potentialAssumptions: string[];
  alternativeExplanations: string[];
  recommendedVerifications: string[];
  criticalQuestions: ICriticalQuestion[];
  verificationStatus: FindingVerificationStatus;
  humanReviews: IHumanReview[];
  category: string;
  isUnderReview: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AIFindingSchema = new Schema<IAIFinding>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
    findingId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    finding: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    supportingEvidence: [{ type: String }],
    contradictingEvidence: [{ type: String }],
    missingInformation: [{ type: String }],
    potentialAssumptions: [{ type: String }],
    alternativeExplanations: [{ type: String }],
    recommendedVerifications: [{ type: String }],
    criticalQuestions: [
      {
        question: { type: String, required: true },
        answer: { type: String },
        category: { type: String, enum: ['EVIDENCE', 'ASSUMPTION', 'CONTRADICTION', 'ALTERNATIVE'], default: 'EVIDENCE' },
        status: { type: String, enum: ['PENDING', 'ADDRESSED', 'FLAGGED'], default: 'PENDING' },
      },
    ],
    verificationStatus: {
      type: String,
      enum: ['AI_INFERRED', 'VERIFIED', 'CONTRADICTED', 'REQUIRES_HUMAN_REVIEW', 'UNDER_CHALLENGE'],
      default: 'AI_INFERRED',
      index: true,
    },
    humanReviews: [
      {
        reviewerId: { type: Schema.Types.ObjectId, ref: 'User' },
        reviewerName: { type: String },
        verdict: { type: String, enum: ['CONFIRMED', 'DISPUTED', 'INCONCLUSIVE', 'REQUIRES_MORE_EVIDENCE'] },
        comment: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    category: { type: String, default: 'CRIME_INTELLIGENCE' },
    isUnderReview: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

AIFindingSchema.index({ caseId: 1, confidence: -1 });

export const AIFinding = mongoose.model<IAIFinding>('AIFinding', AIFindingSchema);
