export interface IdentityVerificationResult {
    documentType: string;
    documentNumber?: string;
    subjectName?: string;
    dateOfBirth?: string;
    nationality?: string;
    issuingAuthority?: string;
    issueDate?: string;
    expiryDate?: string;
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
    metadataFlags: string[];
    disclaimer: string;
    requiresHumanReview: boolean;
}
export declare function analyzeIdentity(documentType: string, fields: Record<string, string>, fileName?: string): Promise<IdentityVerificationResult>;
//# sourceMappingURL=identityVerification.d.ts.map