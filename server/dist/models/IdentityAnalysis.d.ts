import mongoose, { Document } from 'mongoose';
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
    inconsistencies: {
        field: string;
        description: string;
        severity: string;
    }[];
    riskScore: number;
    verificationStatus: string;
    riskLevel: string;
    indicators: {
        name: string;
        description: string;
        severity: string;
    }[];
    ocrText?: string;
    metadataFlags: string[];
    requiresHumanReview: boolean;
    disclaimer: string;
    analyzedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const IdentityAnalysis: mongoose.Model<IIdentityAnalysis, {}, {}, {}, mongoose.Document<unknown, {}, IIdentityAnalysis, {}, {}> & IIdentityAnalysis & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=IdentityAnalysis.d.ts.map