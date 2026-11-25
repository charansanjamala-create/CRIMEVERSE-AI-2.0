export interface BlockchainAnalysisResult {
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
    disclaimer: string;
    requiresHumanReview: boolean;
}
export declare function analyzeWallet(walletAddress: string, blockchain?: string): Promise<BlockchainAnalysisResult>;
//# sourceMappingURL=blockchainTrace.d.ts.map