import mongoose, { Document } from 'mongoose';
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
export declare const Case: mongoose.Model<ICase, {}, {}, {}, mongoose.Document<unknown, {}, ICase, {}, {}> & ICase & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Case.d.ts.map