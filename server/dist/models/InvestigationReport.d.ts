import mongoose, { Document } from 'mongoose';
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
export declare const InvestigationReport: mongoose.Model<IInvestigationReport, {}, {}, {}, mongoose.Document<unknown, {}, IInvestigationReport, {}, {}> & IInvestigationReport & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=InvestigationReport.d.ts.map