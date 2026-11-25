import mongoose, { Schema, Document } from 'mongoose';

export type CaseStatus = 'OPEN' | 'ACTIVE' | 'PENDING_REVIEW' | 'CLOSED' | 'ARCHIVED';
export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IRiskFactors {
  connectedEntitiesScore: number;
  unresolvedRelationshipsScore: number;
  evidenceGapsScore: number;
  suspiciousActivityScore: number;
  networkComplexityScore: number;
  locationInconsistenciesScore: number;
  contradictoryInfoScore: number;
}

export interface ICase extends Document {
  _id: mongoose.Types.ObjectId;
  caseId: string;
  title: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  assignedTo?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  complaintId?: mongoose.Types.ObjectId;
  tags: string[];
  riskScore: number;
  riskConfidence: number;
  riskExplanation?: string;
  riskFactors: IRiskFactors;
  entityCount: number;
  evidenceCount: number;
  alertCount: number;
  summary?: string;
  lastActivityAt: Date;
  closedAt?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const CaseSchema = new Schema<ICase>(
  {
    caseId: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    status: { type: String, enum: ['OPEN', 'ACTIVE', 'PENDING_REVIEW', 'CLOSED', 'ARCHIVED'], default: 'OPEN' },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint' },
    tags: [{ type: String }],
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    riskConfidence: { type: Number, default: 75, min: 0, max: 100 },
    riskExplanation: { type: String, default: 'Initial baseline risk calculation based on case intelligence signals.' },
    riskFactors: {
      connectedEntitiesScore: { type: Number, default: 10 },
      unresolvedRelationshipsScore: { type: Number, default: 15 },
      evidenceGapsScore: { type: Number, default: 10 },
      suspiciousActivityScore: { type: Number, default: 15 },
      networkComplexityScore: { type: Number, default: 10 },
      locationInconsistenciesScore: { type: Number, default: 10 },
      contradictoryInfoScore: { type: Number, default: 5 },
    },
    entityCount: { type: Number, default: 0 },
    evidenceCount: { type: Number, default: 0 },
    alertCount: { type: Number, default: 0 },
    summary: { type: String },
    lastActivityAt: { type: Date, default: Date.now },
    closedAt: { type: Date },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

CaseSchema.index({ caseId: 1 });
CaseSchema.index({ status: 1, priority: -1 });
CaseSchema.index({ assignedTo: 1 });
CaseSchema.index({ createdBy: 1 });
CaseSchema.index({ riskScore: -1 });

export const Case = mongoose.model<ICase>('Case', CaseSchema);
