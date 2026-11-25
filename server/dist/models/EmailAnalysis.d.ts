import mongoose, { Document } from 'mongoose';
export interface IEmailAnalysis extends Document {
    _id: mongoose.Types.ObjectId;
    caseId?: mongoose.Types.ObjectId;
    subject?: string;
    rawContent: string;
    senderEmail?: string;
    senderName?: string;
    recipientEmails: string[];
    replyTo?: string;
    extractedIPs: {
        ip: string;
        geolocation?: Record<string, any>;
        isSuspicious: boolean;
    }[];
    extractedURLs: {
        url: string;
        domain: string;
        isSuspicious: boolean;
        threat?: string;
    }[];
    extractedDomains: string[];
    extractedWallets: string[];
    headers: Record<string, any>;
    threatScore: number;
    riskLevel: string;
    threatCategories: string[];
    indicators: {
        name: string;
        description: string;
        severity: string;
    }[];
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
export declare const EmailAnalysis: mongoose.Model<IEmailAnalysis, {}, {}, {}, mongoose.Document<unknown, {}, IEmailAnalysis, {}, {}> & IEmailAnalysis & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=EmailAnalysis.d.ts.map