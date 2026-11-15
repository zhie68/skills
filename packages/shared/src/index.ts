export type RankingTier = 'S' | 'A' | 'B' | 'C' | 'D';

export type SecurityStatus = 'SAFE' | 'REVIEW' | 'WARNING' | 'CRITICAL';

export type EvidenceType = 'VERIFIED_EVIDENCE' | 'AI_INFERENCE';

export type ScanStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PARTIAL';

export interface ScoreBreakdown {
  technicalCapability: number;      // Weight: 25% (0-100)
  innovationAndComplexity: number;  // Weight: 20% (0-100)
  communityAdoption: number;        // Weight: 15% (0-100)
  maintenanceAndUpdates: number;    // Weight: 15% (0-100)
  documentationQuality: number;     // Weight: 10% (0-100)
  securityAndReliability: number;   // Weight: 15% (0-100)
  overallScore: number;             // Weighted 0-100
  rankingTier: RankingTier;         // S / A / B / C / D
}

export interface EvidenceTaggedItem {
  statement: string;
  evidenceType: EvidenceType;
  sourceRef?: string;
}

export interface SecurityFindingItem {
  id: string;
  ruleId: string;
  category:
    | 'SUSPICIOUS_SHELL'
    | 'CREDENTIAL_HARVESTING'
    | 'HARDCODED_API_KEY'
    | 'DANGEROUS_FILESYSTEM'
    | 'UNAUTHORIZED_NETWORK'
    | 'OBFUSCATED_SCRIPT'
    | 'PROMPT_INJECTION'
    | 'UNEXPECTED_EXECUTABLE';
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

export const SCORE_WEIGHTS = {
  technicalCapability: 0.25,
  innovationAndComplexity: 0.20,
  communityAdoption: 0.15,
  maintenanceAndUpdates: 0.15,
  documentationQuality: 0.10,
  securityAndReliability: 0.15,
} as const;

export function calculateWeightedSkillScore(
  metrics: Omit<ScoreBreakdown, 'overallScore' | 'rankingTier'>
): ScoreBreakdown {
  const clamp = (val: number) => Math.max(0, Math.min(100, Math.round(val)));

  const technicalCapability = clamp(metrics.technicalCapability);
  const innovationAndComplexity = clamp(metrics.innovationAndComplexity);
  const communityAdoption = clamp(metrics.communityAdoption);
  const maintenanceAndUpdates = clamp(metrics.maintenanceAndUpdates);
  const documentationQuality = clamp(metrics.documentationQuality);
  const securityAndReliability = clamp(metrics.securityAndReliability);

  const rawOverall =
    technicalCapability * SCORE_WEIGHTS.technicalCapability +
    innovationAndComplexity * SCORE_WEIGHTS.innovationAndComplexity +
    communityAdoption * SCORE_WEIGHTS.communityAdoption +
    maintenanceAndUpdates * SCORE_WEIGHTS.maintenanceAndUpdates +
    documentationQuality * SCORE_WEIGHTS.documentationQuality +
    securityAndReliability * SCORE_WEIGHTS.securityAndReliability;

  const overallScore = Math.round(rawOverall * 10) / 10;
  const rankingTier = getRankingTier(overallScore);

  return {
    technicalCapability,
    innovationAndComplexity,
    communityAdoption,
    maintenanceAndUpdates,
    documentationQuality,
    securityAndReliability,
    overallScore,
    rankingTier,
  };
}

export function getRankingTier(score: number): RankingTier {
  if (score >= 90) return 'S';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  return 'D';
}
