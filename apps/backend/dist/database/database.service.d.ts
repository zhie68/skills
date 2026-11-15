import { OnModuleInit } from '@nestjs/common';
import { INITIAL_AGENT_PLATFORMS, INITIAL_CATEGORIES, INITIAL_DISCOVERY_SOURCES, SeedSkillDefinition } from './seed-data';
import { SkillAnalyzerService } from '../analyzer/skill-analyzer.service';
import { EvidenceTaggedItem, RankingTier, ScoreBreakdown, SecurityFindingItem, SecurityStatus } from '@agent-skill-radar/shared';
export interface StoredSkillRecord {
    id: string;
    slug: string;
    name: string;
    description: string;
    technicalSummary: string;
    repositoryId: string;
    repository: {
        id: string;
        fullName: string;
        owner: string;
        name: string;
        htmlUrl: string;
        description: string;
        defaultBranch: string;
        stars: number;
        forks: number;
        openIssues: number;
        watchers: number;
        language: string;
        license: string;
        topics: string[];
        lastPushedAt: string;
        sourceId: string;
    };
    categoryId: string;
    category: {
        id: string;
        name: string;
        slug: string;
        description: string;
        icon: string;
        color: string;
    };
    manifestPath: string;
    skillMdContent: string;
    installCommand: string;
    installMethod: string;
    installSourceDoc: string;
    installVerified: boolean;
    currentVersion: string;
    overallScore: number;
    rankingTier: RankingTier;
    scoreBreakdown: ScoreBreakdown;
    securityStatus: SecurityStatus;
    isDuplicate: boolean;
    canonicalSkillId: string | null;
    verifiedEvidence: string[];
    aiInferredAnalysis: string[];
    capabilities: EvidenceTaggedItem[];
    dependencies: string[];
    supportedAgents: string[];
    useCases: string[];
    strengths: EvidenceTaggedItem[];
    weaknesses: EvidenceTaggedItem[];
    securityFindings: SecurityFindingItem[];
    versions: Array<{
        id: string;
        version: string;
        commitSha: string;
        changelog: string;
        contentHash: string;
        releasedAt: string;
    }>;
    discoveredAt: string;
    lastUpdatedAt: string;
    lastAnalyzedAt: string;
    llmProviderUsed: string;
}
export interface StoredDiscoveryScan {
    id: string;
    triggerType: 'SCHEDULED' | 'MANUAL' | 'INCREMENTAL';
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PARTIAL';
    sourceId: string | null;
    sourceName: string;
    repositoriesScanned: number;
    manifestsDiscovered: number;
    newSkillsFound: number;
    updatedSkillsCount: number;
    duplicatesDetected: number;
    securityWarnings: number;
    errorMessage: string | null;
    logs: string[];
    startedAt: string;
    completedAt: string | null;
    durationMs: number;
    scanJobs: Array<{
        id: string;
        targetSource: string;
        jobType: string;
        status: string;
        attemptCount: number;
        rateLimitRemaining: number;
        resultSummary: string;
    }>;
}
export interface StoredDailyReport {
    id: string;
    reportDate: string;
    totalSkillsTracked: number;
    newSkillsDiscovered: number;
    updatedSkills: number;
    securityAlertsCount: number;
    averageScore: number;
    topSkillIds: string[];
    trendingSkillIds: string[];
    categoryBreakdown: Record<string, number>;
    executiveSummary: string;
    generatedAt: string;
}
export interface RadarSettings {
    llmProvider: 'heuristic' | 'openai' | 'anthropic' | 'gemini';
    llmModel: string;
    discoveryCron: string;
    rateLimitMs: number;
    maxReposPerScan: number;
    autoSecurityBlockCritical: boolean;
    incrementalScanOnly: boolean;
}
interface RadarStoreState {
    sources: typeof INITIAL_DISCOVERY_SOURCES;
    categories: typeof INITIAL_CATEGORIES;
    agentPlatforms: typeof INITIAL_AGENT_PLATFORMS;
    skills: StoredSkillRecord[];
    savedSkillIds: Array<{
        id: string;
        skillId: string;
        folder: string;
        notes: string;
        savedAt: string;
    }>;
    scans: StoredDiscoveryScan[];
    dailyReports: StoredDailyReport[];
    settings: RadarSettings;
}
export declare class DatabaseService implements OnModuleInit {
    private readonly analyzer;
    private readonly logger;
    private readonly storePath;
    private state;
    constructor(analyzer: SkillAnalyzerService);
    onModuleInit(): Promise<void>;
    initializeStore(): Promise<void>;
    seedInitialState(): Promise<void>;
    buildSkillRecordFromSeed(item: SeedSkillDefinition): Promise<StoredSkillRecord>;
    getState(): RadarStoreState;
    persist(): void;
    upsertSkill(skill: StoredSkillRecord): {
        isNew: boolean;
        isDuplicate: boolean;
    };
    generateAndStoreDailyReport(): StoredDailyReport;
    getRepositories(): ({
        id: string;
        fullName: string;
        owner: string;
        name: string;
        htmlUrl: string;
        description: string;
        defaultBranch: string;
        stars: number;
        forks: number;
        openIssues: number;
        watchers: number;
        language: string;
        license: string;
        topics: string[];
        lastPushedAt: string;
        sourceId: string;
    } & {
        skillCount: number;
        averageSkillScore: number;
        highestTier: RankingTier;
        skills: Array<{
            id: string;
            slug: string;
            name: string;
            overallScore: number;
            rankingTier: RankingTier;
            securityStatus: SecurityStatus;
        }>;
    })[];
}
export {};
