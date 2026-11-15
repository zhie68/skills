export type RankingTier = 'S' | 'A' | 'B' | 'C' | 'D';
export type SecurityStatus = 'SAFE' | 'REVIEW' | 'WARNING' | 'CRITICAL';
export type EvidenceType = 'VERIFIED_EVIDENCE' | 'AI_INFERENCE';
export type ScanStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PARTIAL';
export interface ScoreBreakdown {
    technicalCapability: number;
    innovationAndComplexity: number;
    communityAdoption: number;
    maintenanceAndUpdates: number;
    documentationQuality: number;
    securityAndReliability: number;
    overallScore: number;
    rankingTier: RankingTier;
}
export interface EvidenceTaggedItem {
    statement: string;
    evidenceType: EvidenceType;
    sourceRef?: string;
}
export interface SecurityFindingItem {
    id: string;
    ruleId: string;
    category: 'SUSPICIOUS_SHELL' | 'CREDENTIAL_HARVESTING' | 'HARDCODED_API_KEY' | 'DANGEROUS_FILESYSTEM' | 'UNAUTHORIZED_NETWORK' | 'OBFUSCATED_SCRIPT' | 'PROMPT_INJECTION' | 'UNEXPECTED_EXECUTABLE';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    description: string;
    filePath: string;
    lineNumber?: number;
    snippet?: string;
    evidenceType: EvidenceType;
    remediation: string;
}
export interface SkillAnalysisReport {
    overallScore: number;
    rankingCategory: RankingTier;
    breakdown: ScoreBreakdown;
    technicalSummary: string;
    verifiedEvidenceSummary: string[];
    aiInferredInsights: string[];
    mainCapabilities: EvidenceTaggedItem[];
    dependencies: string[];
    supportedAgents: string[];
    useCases: string[];
    installationInstructions: {
        command: string;
        method: string;
        sourceDocPath: string;
        verifiedFromRepo: boolean;
        notes?: string;
    };
    strengths: EvidenceTaggedItem[];
    weaknesses: EvidenceTaggedItem[];
    securityStatus: SecurityStatus;
    securityFindings: SecurityFindingItem[];
    analyzedAt: string;
    llmProviderUsed: string;
}
export declare const SCORE_WEIGHTS: {
    readonly technicalCapability: 0.25;
    readonly innovationAndComplexity: 0.2;
    readonly communityAdoption: 0.15;
    readonly maintenanceAndUpdates: 0.15;
    readonly documentationQuality: 0.1;
    readonly securityAndReliability: 0.15;
};
export declare function calculateWeightedSkillScore(metrics: Omit<ScoreBreakdown, 'overallScore' | 'rankingTier'>): ScoreBreakdown;
export declare function getRankingTier(score: number): RankingTier;
