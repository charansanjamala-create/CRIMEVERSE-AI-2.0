import mongoose, { Schema, Document } from 'mongoose';

export interface IVoiceAnalysis extends Document {
  _id: mongoose.Types.ObjectId;
  caseId?: mongoose.Types.ObjectId;
  evidenceId?: mongoose.Types.ObjectId;
  fileName: string;
  fileSize?: number;
  duration?: number;
  suspicionScore: number;
  riskLevel: string;
  verdict: string;
  indicators: {
    name: string;
    description: string;
    severity: string;
    confidence: number;
  }[];
  spectralAnalysis: Record<string, any>;
  temporalFeatures: Record<string, any>;
  modelFindings: string[];
  disclaimer: string;
  requiresHumanReview: boolean;
  analyzedBy: mongoose.Types.ObjectId;
  analysisProvider: string;
  rawResult?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const VoiceAnalysisSchema = new Schema<IVoiceAnalysis>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case' },
    evidenceId: { type: Schema.Types.ObjectId, ref: 'Evidence' },
    fileName: { type: String, required: true },
    fileSize: { type: Number },
    duration: { type: Number },
    suspicionScore: { type: Number, required: true, min: 0, max: 100 },
    riskLevel: { type: String, default: 'UNKNOWN' },
    verdict: { type: String, required: true },
    indicators: [
      {
        name: String,
        description: String,
        severity: String,
        confidence: Number,
      },
    ],
    spectralAnalysis: { type: Schema.Types.Mixed, default: {} },
    temporalFeatures: { type: Schema.Types.Mixed, default: {} },
    modelFindings: [{ type: String }],
    disclaimer: { type: String, default: 'This analysis is an AI-generated indicator and requires human review before any action is taken.' },
    requiresHumanReview: { type: Boolean, default: true },
    analyzedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    analysisProvider: { type: String, default: 'mock' },
    rawResult: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

VoiceAnalysisSchema.index({ caseId: 1 });
VoiceAnalysisSchema.index({ suspicionScore: -1 });

export const VoiceAnalysis = mongoose.model<IVoiceAnalysis>('VoiceAnalysis', VoiceAnalysisSchema);
