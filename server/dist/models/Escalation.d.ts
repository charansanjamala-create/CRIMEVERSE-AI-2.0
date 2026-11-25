import mongoose, { Document } from 'mongoose';
export type EscalationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EscalationStatus = 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'RETURNED' | 'RESOLVED';
export type EscalationTrigger = 'LOW_CONFIDENCE' | 'CONTRADICTORY_EVIDENCE' | 'HIGH_RISK_SCORE' | 'MISSING_INFORMATION' | 'CHALLENGE_UNCERTAINTY' | 'HUMAN_REVIEW_REQUIRED' | 'OTHER';
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
export declare const Escalation: mongoose.Model<IEscalation, {}, {}, {}, mongoose.Document<unknown, {}, IEscalation, {}, {}> & IEscalation & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Escalation.d.ts.map