import mongoose, { Schema, Document } from 'mongoose';

export interface IInvestigationReport extends Document {
  _id: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  title: string;
  reportType: string;
  status: string;
  sections: {
    sectionId: string;
    title: string;
    content: string;
    isAIGenerated: boolean;
    confidence?: number;
  }[];
  riskSummary: {
    overallRisk: string;
    riskScore: number;
    keyIndicators: string[];
  };
  findings: string[];
  recommendations: string[];
  limitations: string[];
  uncertainties: string[];
  requiresHumanReview: boolean;
  generatedBy: mongoose.Types.ObjectId;
  aiProvider: string;
  version: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InvestigationReportSchema = new Schema<IInvestigationReport>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    title: { type: String, required: true },
    reportType: { type: String, default: 'UNIFIED_INTELLIGENCE' },
    status: { type: String, default: 'DRAFT' },
    sections: [
      {
        sectionId: String,
        title: String,
        content: String,
        isAIGenerated: { type: Boolean, default: false },
        confidence: Number,
      },
    ],
    riskSummary: {
      overallRisk: String,
      riskScore: Number,
      keyIndicators: [String],
    },
    findings: [{ type: String }],
    recommendations: [{ type: String }],
    limitations: [{ type: String }],
    uncertainties: [{ type: String }],
    requiresHumanReview: { type: Boolean, default: true },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    aiProvider: { type: String, default: 'mock' },
    version: { type: Number, default: 1 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

InvestigationReportSchema.index({ caseId: 1, createdAt: -1 });

export const InvestigationReport = mongoose.model<IInvestigationReport>('InvestigationReport', InvestigationReportSchema);
