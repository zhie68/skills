import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  INITIAL_AGENT_PLATFORMS,
  INITIAL_CATEGORIES,
  INITIAL_DISCOVERY_SOURCES,
  INITIAL_SKILLS_SEED,
  SeedSkillDefinition,
} from './seed-data';
import { SkillAnalyzerService } from '../analyzer/skill-analyzer.service';
import {
  EvidenceTaggedItem,
  RankingTier,
  ScoreBreakdown,
  SecurityFindingItem,
  SecurityStatus,
} from '@agent-skill-radar/shared';

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

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly storePath = path.join(process.cwd(), 'data', 'radar-store.json');
  private state!: RadarStoreState;

  constructor(private readonly analyzer: SkillAnalyzerService) {}

  async onModuleInit() {
    await this.initializeStore();
  }

  public async initializeStore(): Promise<void> {
    const dir = path.dirname(this.storePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(this.storePath)) {
      try {
        const raw = fs.readFileSync(this.storePath, 'utf-8');
        this.state = JSON.parse(raw);
        this.logger.log(
          `Loaded persistent Agent Skill Radar store (${this.state.skills.length} skills, ${this.state.scans.length} scans)`
        );
        return;
      } catch (e) {
        this.logger.warn(`Store file corrupted, re-initializing seed state: ${(e as Error).message}`);
      }
    }

    await this.seedInitialState();
  }

  public async seedInitialState(): Promise<void> {
    const skills: StoredSkillRecord[] = [];
    for (const item of INITIAL_SKILLS_SEED) {
      const record = await this.buildSkillRecordFromSeed(item);
      skills.push(record);
    }

    const now = Date.now();
    const initialScans: StoredDiscoveryScan[] = [
      {
        id: 'scan-daily-001',
        triggerType: 'SCHEDULED',
        status: 'COMPLETED',
        sourceId: null,
        sourceName: 'All Configured Ecosystems (Daily Cron)',
        repositoriesScanned: 18,
        manifestsDiscovered: 14,
        newSkillsFound: 4,
        updatedSkillsCount: 6,
        duplicatesDetected: 1,
        securityWarnings: 1,
        errorMessage: null,
        logs: [
          '[02:00:01] Starting scheduled daily discovery scan across 6 sources...',
          '[02:00:03] Scanned anthropics/skills (18,420 stars) — verified mcp-builder, webapp-testing',
          '[02:00:05] Scanned sickn33/antigravity-awesome-skills — verified 4 skill manifests',
          '[02:00:07] Scanned full-stack-skills/threejs-skills — verified threejs-webgl-shader-studio',
          '[02:00:09] Scanned skills.sh / vercel-labs/agent-skills — verified nextjs-react-best-practices',
          '[02:00:11] Scanned OpenClaw ecosystem — flagged 1 unverified skill with CRITICAL security findings',
          '[02:00:13] Updated Skill Intelligence Scores and generated Daily Discovery Report.',
        ],
        startedAt: new Date(now - 3600000 * 4).toISOString(),
        completedAt: new Date(now - 3600000 * 4 + 12400).toISOString(),
        durationMs: 12400,
        scanJobs: INITIAL_DISCOVERY_SOURCES.map((src, i) => ({
          id: `job-init-${i + 1}`,
          targetSource: src.url,
          jobType: src.sourceType,
          status: 'COMPLETED',
          attemptCount: 1,
          rateLimitRemaining: 4920 - i * 8,
          resultSummary: `Verified ${src.name} manifests and metadata`,
        })),
      },
      {
        id: 'scan-daily-000',
        triggerType: 'SCHEDULED',
        status: 'COMPLETED',
        sourceId: null,
        sourceName: 'All Configured Ecosystems (Previous Day)',
        repositoriesScanned: 15,
        manifestsDiscovered: 10,
        newSkillsFound: 3,
        updatedSkillsCount: 4,
        duplicatesDetected: 0,
        securityWarnings: 0,
        errorMessage: null,
        logs: [
          '[02:00:01] Executed scheduled daily scan across GitHub & skills.sh sources.',
          '[02:00:09] Completed intelligence scoring and ranking calibration.',
        ],
        startedAt: new Date(now - 86400000 - 3600000 * 4).toISOString(),
        completedAt: new Date(now - 86400000 - 3600000 * 4 + 9800).toISOString(),
        durationMs: 9800,
        scanJobs: [],
      },
    ];

    this.state = {
      sources: INITIAL_DISCOVERY_SOURCES,
      categories: INITIAL_CATEGORIES,
      agentPlatforms: INITIAL_AGENT_PLATFORMS,
      skills,
      savedSkillIds: [
        {
          id: 'saved-1',
          skillId: skills[0].id,
          folder: 'Core Production Stack',
          notes: 'Primary MCP server builder skill for backend agent tools.',
          savedAt: new Date(now - 3600000 * 12).toISOString(),
        },
        {
          id: 'saved-2',
          skillId: skills[2].id,
          folder: 'Core Production Stack',
          notes: 'Antigravity multi-agent swarm orchestration standard.',
          savedAt: new Date(now - 3600000 * 6).toISOString(),
        },
      ],
      scans: initialScans,
      dailyReports: [],
      settings: {
        llmProvider: (process.env.LLM_PROVIDER as any) || 'heuristic',
        llmModel: process.env.LLM_MODEL || 'gpt-4o-mini',
        discoveryCron: process.env.DISCOVERY_CRON || '0 2 * * *',
        rateLimitMs: Number(process.env.DISCOVERY_RATE_LIMIT_MS || 1200),
        maxReposPerScan: Number(process.env.DISCOVERY_MAX_REPOS_PER_SCAN || 25),
        autoSecurityBlockCritical: true,
        incrementalScanOnly: false,
      },
    };

    this.generateAndStoreDailyReport();
    this.persist();
    this.logger.log(`Seeded initial Agent Skill Radar state with ${skills.length} skills.`);
  }

  public async buildSkillRecordFromSeed(item: SeedSkillDefinition): Promise<StoredSkillRecord> {
    const analysis = await this.analyzer.analyzeSkill({
      slug: item.slug,
      name: item.name,
      description: item.description,
      repoFullName: item.repoFullName,
      manifestPath: item.manifestPath,
      skillMdContent: item.skillMdContent,
      stars: item.stars,
      forks: item.forks,
      openIssues: item.openIssues,
      watchers: item.watchers,
      lastPushedAt: item.lastPushedAt,
      topics: item.topics,
      additionalFiles: item.additionalFiles,
    });

    const category =
      INITIAL_CATEGORIES.find((c) => c.slug === item.categorySlug) || INITIAL_CATEGORIES[0];
    const source =
      INITIAL_DISCOVERY_SOURCES.find((s) => s.slug === item.sourceSlug) ||
      INITIAL_DISCOVERY_SOURCES[0];
    const [owner, repoName] = item.repoFullName.split('/');

    const discoveredAt = new Date(
      Date.now() - item.discoveredDaysAgo * 86400000
    ).toISOString();
    const contentHash = crypto
      .createHash('sha256')
      .update(item.skillMdContent)
      .digest('hex')
      .slice(0, 16);

    return {
      id: `skill-${item.slug}`,
      slug: item.slug,
      name: item.name,
      description: item.description,
      technicalSummary: analysis.technicalSummary,
      repositoryId: `repo-${owner}-${repoName}`.toLowerCase(),
      repository: {
        id: `repo-${owner}-${repoName}`.toLowerCase(),
        fullName: item.repoFullName,
        owner,
        name: repoName,
        htmlUrl: item.repoUrl,
        description: item.repoDescription,
        defaultBranch: 'main',
        stars: item.stars,
        forks: item.forks,
        openIssues: item.openIssues,
        watchers: item.watchers,
        language: item.language,
        license: item.license,
        topics: item.topics,
        lastPushedAt: item.lastPushedAt,
        sourceId: source.id,
      },
      categoryId: category.id,
      category,
      manifestPath: item.manifestPath,
      skillMdContent: item.skillMdContent,
      installCommand: analysis.installationInstructions.command,
      installMethod: analysis.installationInstructions.method,
      installSourceDoc: analysis.installationInstructions.sourceDocPath,
      installVerified: analysis.installationInstructions.verifiedFromRepo,
      currentVersion: item.currentVersion,
      overallScore: analysis.overallScore,
      rankingTier: analysis.rankingCategory,
      scoreBreakdown: analysis.breakdown,
      securityStatus: analysis.securityStatus,
      isDuplicate: false,
      canonicalSkillId: null,
      verifiedEvidence: analysis.verifiedEvidenceSummary,
      aiInferredAnalysis: analysis.aiInferredInsights,
      capabilities: analysis.mainCapabilities,
      dependencies: analysis.dependencies,
      supportedAgents: analysis.supportedAgents,
      useCases: analysis.useCases,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      securityFindings: analysis.securityFindings,
      versions: [
        {
          id: `ver-${item.slug}-${item.currentVersion}`,
          version: item.currentVersion,
          commitSha: contentHash.slice(0, 7),
          changelog: `Verified manifest ${item.manifestPath} with score ${analysis.overallScore}/100 (${analysis.rankingCategory} Tier).`,
          contentHash,
          releasedAt: item.lastPushedAt,
        },
        {
          id: `ver-${item.slug}-1.0.0`,
          version: '1.0.0',
          commitSha: 'a1b2c3d',
          changelog: 'Initial skill discovery and baseline static security validation.',
          contentHash: '0011223344556677',
          releasedAt: new Date(new Date(item.lastPushedAt).getTime() - 14 * 86400000).toISOString(),
        },
      ],
      discoveredAt,
      lastUpdatedAt: item.lastPushedAt,
      lastAnalyzedAt: analysis.analyzedAt,
      llmProviderUsed: analysis.llmProviderUsed,
    };
  }

  public getState(): RadarStoreState {
    return this.state;
  }

  public persist(): void {
    const dir = path.dirname(this.storePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.storePath, JSON.stringify(this.state, null, 2), 'utf-8');
  }

  public upsertSkill(skill: StoredSkillRecord): { isNew: boolean; isDuplicate: boolean } {
    const existingIdx = this.state.skills.findIndex(
      (s) =>
        s.slug === skill.slug ||
        (s.repository.fullName.toLowerCase() === skill.repository.fullName.toLowerCase() &&
          s.manifestPath === skill.manifestPath)
    );

    // Duplicate detection across different repositories by content similarity
    const incomingHash = skill.versions[0]?.contentHash;
    const duplicateCandidate = this.state.skills.find(
      (s) =>
        s.slug !== skill.slug &&
        ((incomingHash && s.versions[0]?.contentHash === incomingHash) ||
          s.name.toLowerCase() === skill.name.toLowerCase())
    );

    if (duplicateCandidate && existingIdx === -1) {
      skill.isDuplicate = true;
      skill.canonicalSkillId = duplicateCandidate.id;
    }

    if (existingIdx >= 0) {
      const prev = this.state.skills[existingIdx];
      this.state.skills[existingIdx] = {
        ...prev,
        ...skill,
        id: prev.id,
        discoveredAt: prev.discoveredAt,
      };
      this.persist();
      return { isNew: false, isDuplicate: skill.isDuplicate };
    } else {
      this.state.skills.unshift(skill);
      this.persist();
      return { isNew: true, isDuplicate: skill.isDuplicate };
    }
  }

  public generateAndStoreDailyReport(): StoredDailyReport {
    const todayStr = new Date().toISOString().slice(0, 10);
    const allSkills = this.state.skills;
    const newToday = allSkills.filter(
      (s) => Date.now() - new Date(s.discoveredAt).getTime() <= 86400000 * 1.5
    );
    const updatedRecent = allSkills.filter(
      (s) => Date.now() - new Date(s.lastUpdatedAt).getTime() <= 86400000 * 3
    );
    const securityAlerts = allSkills.filter((s) => s.securityStatus !== 'SAFE');
    const avgScore =
      allSkills.length > 0
        ? Math.round(
            (allSkills.reduce((acc, s) => acc + s.overallScore, 0) / allSkills.length) * 10
          ) / 10
        : 0;

    const sortedByScore = [...allSkills]
      .filter((s) => s.securityStatus === 'SAFE')
      .sort((a, b) => b.overallScore - a.overallScore);

    const sortedByTrending = [...allSkills]
      .filter((s) => s.securityStatus === 'SAFE')
      .sort(
        (a, b) =>
          b.repository.stars * 0.4 +
          b.overallScore * 100 -
          (a.repository.stars * 0.4 + a.overallScore * 100)
      );

    const categoryBreakdown: Record<string, number> = {};
    for (const s of allSkills) {
      categoryBreakdown[s.category.name] = (categoryBreakdown[s.category.name] || 0) + 1;
    }

    const report: StoredDailyReport = {
      id: `report-${todayStr}`,
      reportDate: new Date().toISOString(),
      totalSkillsTracked: allSkills.length,
      newSkillsDiscovered: newToday.length,
      updatedSkills: updatedRecent.length,
      securityAlertsCount: securityAlerts.length,
      averageScore: avgScore,
      topSkillIds: sortedByScore.slice(0, 5).map((s) => s.id),
      trendingSkillIds: sortedByTrending.slice(0, 5).map((s) => s.id),
      categoryBreakdown,
      executiveSummary: `Agent Skill Radar tracked ${allSkills.length} skills across ${this.getRepositories().length} repositories today. ${newToday.length} newly discovered skills and ${updatedRecent.length} recently updated manifests were analyzed with a platform average Intelligence Score of ${avgScore}/100. Static security inspection flagged ${securityAlerts.length} skill(s) requiring quarantine/review.`,
      generatedAt: new Date().toISOString(),
    };

    const existingIdx = this.state.dailyReports.findIndex((r) => r.id === report.id);
    if (existingIdx >= 0) {
      this.state.dailyReports[existingIdx] = report;
    } else {
      this.state.dailyReports.unshift(report);
    }
    this.persist();
    return report;
  }

  public getRepositories() {
    const map = new Map<
      string,
      StoredSkillRecord['repository'] & {
        skillCount: number;
        averageSkillScore: number;
        highestTier: RankingTier;
        skills: Array<{ id: string; slug: string; name: string; overallScore: number; rankingTier: RankingTier; securityStatus: SecurityStatus }>;
      }
    >();

    for (const s of this.state.skills) {
      const existing = map.get(s.repository.fullName);
      if (!existing) {
        map.set(s.repository.fullName, {
          ...s.repository,
          skillCount: 1,
          averageSkillScore: s.overallScore,
          highestTier: s.rankingTier,
          skills: [
            {
              id: s.id,
              slug: s.slug,
              name: s.name,
              overallScore: s.overallScore,
              rankingTier: s.rankingTier,
              securityStatus: s.securityStatus,
            },
          ],
        });
      } else {
        existing.skills.push({
          id: s.id,
          slug: s.slug,
          name: s.name,
          overallScore: s.overallScore,
          rankingTier: s.rankingTier,
          securityStatus: s.securityStatus,
        });
        existing.skillCount = existing.skills.length;
        existing.averageSkillScore =
          Math.round(
            (existing.skills.reduce((sum, item) => sum + item.overallScore, 0) /
              existing.skillCount) *
              10
          ) / 10;
      }
    }

    return Array.from(map.values()).sort((a, b) => b.stars - a.stars);
  }
}
