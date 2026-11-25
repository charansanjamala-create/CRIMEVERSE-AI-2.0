import mongoose, { Document } from 'mongoose';
export interface IBlockchainAnalysis extends Document {
    _id: mongoose.Types.ObjectId;
    caseId?: mongoose.Types.ObjectId;
    walletAddress: string;
    blockchain: string;
    riskScore: number;
    riskLevel: string;
    transactionCount: number;
    totalValueUSD: number;
    suspiciousTransactions: number;
    indicators: {
        name: string;
        description: string;
        severity: string;
    }[];
    transactions: {
        txHash: string;
        from: string;
        to: string;
        value: number;
        timestamp: Date;
        isSuspicious: boolean;
        suspicionReason?: string;
    }[];
    relatedWallets: {
        address: string;
        relationship: string;
        riskScore: number;
    }[];
    exchangeConnections: {
        name: string;
        type: string;
        flagged: boolean;
    }[];
    patternAnalysis: Record<string, any>;
    investigationTimeline: {
        date: Date;
        event: string;
        details: string;
    }[];
    requiresHumanReview: boolean;
    disclaimer: string;
    analyzedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const BlockchainAnalysis: mongoose.Model<IBlockchainAnalysis, {}, {}, {}, mongoose.Document<unknown, {}, IBlockchainAnalysis, {}, {}> & IBlockchainAnalysis & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=BlockchainAnalysis.d.ts.map