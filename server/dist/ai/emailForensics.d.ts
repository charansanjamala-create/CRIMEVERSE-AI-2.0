export interface EmailForensicsResult {
    subject?: string;
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
    spfStatus: string;
    dkimStatus: string;
    dmarcStatus: string;
    forensicSummary: string;
    requiresHumanReview: boolean;
}
export declare function analyzeEmail(content: string): Promise<EmailForensicsResult>;
//# sourceMappingURL=emailForensics.d.ts.map