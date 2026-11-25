export interface VoiceAnalysisResult {
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
}
export declare function analyzeVoice(fileName: string, fileBuffer?: Buffer): Promise<VoiceAnalysisResult>;
export declare function analyzeVoiceDemo(type?: 'high' | 'medium' | 'low'): Promise<VoiceAnalysisResult>;
//# sourceMappingURL=voiceAnalysis.d.ts.map