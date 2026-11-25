import mongoose, { Document } from 'mongoose';
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
export declare const Evidence: mongoose.Model<IEvidence, {}, {}, {}, mongoose.Document<unknown, {}, IEvidence, {}, {}> & IEvidence & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Evidence.d.ts.map