export interface ChatResponse {
    content: string;
    sources: string[];
    confidence: number;
    isAIGenerated: boolean;
}
interface CaseContext {
    caseTitle?: string;
    caseId?: string;
    entities?: string[];
    riskScore?: number;
    voiceAnalyses?: number;
    emailAnalyses?: number;
    identityAnalyses?: number;
    blockchainAnalyses?: number;
    alerts?: number;
}
export declare function generateChatResponse(userMessage: string, sessionHistory: {
    role: string;
    content: string;
}[], caseContext?: CaseContext): Promise<ChatResponse>;
export declare function generateUnifiedAnalysis(caseContext: CaseContext): Promise<ChatResponse>;
export {};
//# sourceMappingURL=chatbot.d.ts.map