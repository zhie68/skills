import { SkillAnalysisReport } from '@agent-skill-radar/shared';
import { SecurityScannerService } from '../security/security-scanner.service';
export interface SkillAnalyzerInput {
    slug: string;
    name: string;
    description: string;
    repoFullName: string;
    manifestPath: string;
    skillMdContent: string;
    stars: number;
    forks: number;
    openIssues: number;
    watchers: number;
    lastPushedAt: string;
    topics: string[];
    additionalFiles?: string[];
}
export declare class SkillAnalyzerService {
    private readonly securityScanner;
    private readonly logger;
    constructor(securityScanner: SecurityScannerService);
    analyzeSkill(input: SkillAnalyzerInput): Promise<SkillAnalysisReport>;
    extractInstallationMethod(repoFullName: string, manifestPath: string, content: string): SkillAnalysisReport['installationInstructions'];
    private extractDependencies;
    private extractSupportedAgents;
    private extractCapabilities;
    private inferCategoryLabel;
    private inferUseCases;
    private tryExternalLlmSummary;
}
