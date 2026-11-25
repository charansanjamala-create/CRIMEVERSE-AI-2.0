import mongoose, { Schema, Document } from 'mongoose';

export interface IIdentityAnalysis extends Document {
  _id: mongoose.Types.ObjectId;
  caseId?: mongoose.Types.ObjectId;
  documentType: string;
  documentNumber?: string;
  subjectName?: string;
  dateOfBirth?: string;
  nationality?: string;
  issuingAuthority?: string;
  issueDate?: string;
  expiryDate?: string;
  fileName?: string;
  extractedFields: Record<string, any>;
  inconsistencies: { field: string; description: string; severity: string }[];
  riskScore: number;
  verificationStatus: string;
  riskLevel: string;
  indicators: { name: string; description: string; severity: string }[];
  ocrText?: string;
  metadataFlags: string[];
  requiresHumanReview: boolean;
  disclaimer: string;
  analyzedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const IdentityAnalysisSchema = new Schema<IIdentityAnalysis>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case' },
    documentType: { type: String, required: true },
    documentNumber: { type: String },
    subjectName: { type: String },
    dateOfBirth: { type: String },
    nationality: { type: String },
    issuingAuthority: { type: String },
    issueDate: { type: String },
    expiryDate: { type: String },
    fileName: { type: String },
    extractedFields: { type: Schema.Types.Mixed, default: {} },
    inconsistencies: [{ field: String, description: String, severity: String }],
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    verificationStatus: { type: String, default: 'PENDING' },
    riskLevel: { type: String, default: 'UNKNOWN' },
    indicators: [{ name: String, description: String, severity: String }],
    ocrText: { type: String },
    metadataFlags: [{ type: String }],
    requiresHumanReview: { type: Boolean, default: true },
    disclaimer: { type: String, default: 'This analysis does not constitute legal verification. Human review is required before any official action.' },
    analyzedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

IdentityAnalysisSchema.index({ caseId: 1 });
IdentityAnalysisSchema.index({ riskScore: -1 });

export const IdentityAnalysis = mongoose.model<IIdentityAnalysis>('IdentityAnalysis', IdentityAnalysisSchema);
