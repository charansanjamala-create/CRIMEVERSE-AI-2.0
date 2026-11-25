import mongoose, { Document } from 'mongoose';
export type FindingVerificationStatus = 'AI_INFERRED' | 'VERIFIED' | 'CONTRADICTED' | 'REQUIRES_HUMAN_REVIEW' | 'UNDER_CHALLENGE';
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
export declare const AIFinding: mongoose.Model<IAIFinding, {}, {}, {}, mongoose.Document<unknown, {}, IAIFinding, {}, {}> & IAIFinding & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AIFinding.d.ts.map