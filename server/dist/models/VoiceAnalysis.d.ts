import mongoose, { Document } from 'mongoose';
export interface IVoiceAnalysis extends Document {
    _id: mongoose.Types.ObjectId;
    caseId?: mongoose.Types.ObjectId;
    evidenceId?: mongoose.Types.ObjectId;
    fileName: string;
    fileSize?: number;
    duration?: number;
    suspicionScore: number;
    riskLevel: string;
    verdict: string;
    indicators: {
        name: string;
        description: string;
        severity: string;
        confidence: number;
    }[];
    spectralAnalysis: Record<string, any>;
    temporalFeatures: Record<string, any>;
    modelFindings: string[];
    disclaimer: string;
    requiresHumanReview: boolean;
    analyzedBy: mongoose.Types.ObjectId;
    analysisProvider: string;
    rawResult?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const VoiceAnalysis: mongoose.Model<IVoiceAnalysis, {}, {}, {}, mongoose.Document<unknown, {}, IVoiceAnalysis, {}, {}> & IVoiceAnalysis & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=VoiceAnalysis.d.ts.map