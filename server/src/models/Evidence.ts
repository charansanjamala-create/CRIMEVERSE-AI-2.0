import mongoose, { Schema, Document } from 'mongoose';

export type EvidenceType = 'AUDIO' | 'DOCUMENT' | 'IMAGE' | 'EMAIL' | 'BLOCKCHAIN' | 'NETWORK' | 'TEXT' | 'OTHER';

export type EvidenceVerificationStatus = 'VERIFIED' | 'REPORTED' | 'AI_INFERRED' | 'UNKNOWN';

export interface IEvidenceAccessLog {
  userId: mongoose.Types.ObjectId;
  userName: string;
  action: 'VIEW' | 'DOWNLOAD' | 'VERIFY';
  timestamp: Date;
}

export interface IEvidence extends Document {
  _id: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: EvidenceType;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  content?: string;
  metadata: Record<string, any>;
  linkedEntities: mongoose.Types.ObjectId[];
  linkedAnalyses: string[];
  relatedLocation?: string;
  verificationStatus: EvidenceVerificationStatus;
  accessHistory: IEvidenceAccessLog[];
  tags: string[];
  isProcessed: boolean;
  processingStatus: string;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceSchema = new Schema<IEvidence>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    type: { type: String, enum: ['AUDIO', 'DOCUMENT', 'IMAGE', 'EMAIL', 'BLOCKCHAIN', 'NETWORK', 'TEXT', 'OTHER'], required: true },
    fileName: { type: String },
    filePath: { type: String },
    fileSize: { type: Number },
    mimeType: { type: String },
    content: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
    linkedEntities: [{ type: Schema.Types.ObjectId, ref: 'Entity' }],
    linkedAnalyses: [{ type: String }],
    relatedLocation: { type: String },
    verificationStatus: {
      type: String,
      enum: ['VERIFIED', 'REPORTED', 'AI_INFERRED', 'UNKNOWN'],
      default: 'REPORTED',
    },
    accessHistory: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        userName: { type: String },
        action: { type: String, enum: ['VIEW', 'DOWNLOAD', 'VERIFY'], default: 'VIEW' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    tags: [{ type: String }],
    isProcessed: { type: Boolean, default: false },
    processingStatus: { type: String, default: 'pending' },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

EvidenceSchema.index({ caseId: 1, type: 1 });
EvidenceSchema.index({ uploadedBy: 1 });

export const Evidence = mongoose.model<IEvidence>('Evidence', EvidenceSchema);
