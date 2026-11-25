import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailAnalysis extends Document {
  _id: mongoose.Types.ObjectId;
  caseId?: mongoose.Types.ObjectId;
  subject?: string;
  rawContent: string;
  senderEmail?: string;
  senderName?: string;
  recipientEmails: string[];
  replyTo?: string;
  extractedIPs: { ip: string; geolocation?: Record<string, any>; isSuspicious: boolean }[];
  extractedURLs: { url: string; domain: string; isSuspicious: boolean; threat?: string }[];
  extractedDomains: string[];
  extractedWallets: string[];
  headers: Record<string, any>;
  threatScore: number;
  riskLevel: string;
  threatCategories: string[];
  indicators: { name: string; description: string; severity: string }[];
  spfStatus?: string;
  dkimStatus?: string;
  dmarcStatus?: string;
  geolocations: Record<string, any>[];
  forensicSummary: string;
  requiresHumanReview: boolean;
  analyzedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmailAnalysisSchema = new Schema<IEmailAnalysis>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case' },
    subject: { type: String },
    rawContent: { type: String, required: true },
    senderEmail: { type: String },
    senderName: { type: String },
    recipientEmails: [{ type: String }],
    replyTo: { type: String },
    extractedIPs: [{ ip: String, geolocation: Schema.Types.Mixed, isSuspicious: Boolean }],
    extractedURLs: [{ url: String, domain: String, isSuspicious: Boolean, threat: String }],
    extractedDomains: [{ type: String }],
    extractedWallets: [{ type: String }],
    headers: { type: Schema.Types.Mixed, default: {} },
    threatScore: { type: Number, default: 0, min: 0, max: 100 },
    riskLevel: { type: String, default: 'UNKNOWN' },
    threatCategories: [{ type: String }],
    indicators: [{ name: String, description: String, severity: String }],
    spfStatus: { type: String },
    dkimStatus: { type: String },
    dmarcStatus: { type: String },
    geolocations: [{ type: Schema.Types.Mixed }],
    forensicSummary: { type: String, default: '' },
    requiresHumanReview: { type: Boolean, default: true },
    analyzedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

EmailAnalysisSchema.index({ caseId: 1 });
EmailAnalysisSchema.index({ threatScore: -1 });

export const EmailAnalysis = mongoose.model<IEmailAnalysis>('EmailAnalysis', EmailAnalysisSchema);
