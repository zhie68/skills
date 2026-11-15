"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DatabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const seed_data_1 = require("./seed-data");
const skill_analyzer_service_1 = require("../analyzer/skill-analyzer.service");
let DatabaseService = DatabaseService_1 = class DatabaseService {
    analyzer;
    logger = new common_1.Logger(DatabaseService_1.name);
    storePath = path.join(process.cwd(), 'data', 'radar-store.json');
    state;
    constructor(analyzer) {
        this.analyzer = analyzer;
    }
    async onModuleInit() {
        await this.initializeStore();
    }
    async initializeStore() {
        const dir = path.dirname(this.storePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (fs.existsSync(this.storePath)) {
            try {
                const raw = fs.readFileSync(this.storePath, 'utf-8');
                this.state = JSON.parse(raw);
                this.logger.log(`Loaded persistent Agent Skill Radar store (${this.state.skills.length} skills, ${this.state.scans.length} scans)`);
                return;
            }
            catch (e) {
                this.logger.warn(`Store file corrupted, re-initializing seed state: ${e.message}`);
            }
        }
        await this.seedInitialState();
    }
    async seedInitialState() {
        const skills = [];
        for (const item of seed_data_1.INITIAL_SKILLS_SEED) {
            const record = await this.buildSkillRecordFromSeed(item);
            skills.push(record);
        }
        const now = Date.now();
        const initialScans = [
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
                scanJobs: seed_data_1.INITIAL_DISCOVERY_SOURCES.map((src, i) => ({
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
            sources: seed_data_1.INITIAL_DISCOVERY_SOURCES,
            categories: seed_data_1.INITIAL_CATEGORIES,
            agentPlatforms: seed_data_1.INITIAL_AGENT_PLATFORMS,
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
                llmProvider: process.env.LLM_PROVIDER || 'heuristic',
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
    async buildSkillRecordFromSeed(item) {
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
        const category = seed_data_1.INITIAL_CATEGORIES.find((c) => c.slug === item.categorySlug) || seed_data_1.INITIAL_CATEGORIES[0];
        const source = seed_data_1.INITIAL_DISCOVERY_SOURCES.find((s) => s.slug === item.sourceSlug) ||
            seed_data_1.INITIAL_DISCOVERY_SOURCES[0];
        const [owner, repoName] = item.repoFullName.split('/');
        const discoveredAt = new Date(Date.now() - item.discoveredDaysAgo * 86400000).toISOString();
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
    getState() {
        return this.state;
    }
    persist() {
        const dir = path.dirname(this.storePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(this.storePath, JSON.stringify(this.state, null, 2), 'utf-8');
    }
    upsertSkill(skill) {
        const existingIdx = this.state.skills.findIndex((s) => s.slug === skill.slug ||
            (s.repository.fullName.toLowerCase() === skill.repository.fullName.toLowerCase() &&
                s.manifestPath === skill.manifestPath));
        const incomingHash = skill.versions[0]?.contentHash;
        const duplicateCandidate = this.state.skills.find((s) => s.slug !== skill.slug &&
            ((incomingHash && s.versions[0]?.contentHash === incomingHash) ||
                s.name.toLowerCase() === skill.name.toLowerCase()));
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
        }
        else {
            this.state.skills.unshift(skill);
            this.persist();
            return { isNew: true, isDuplicate: skill.isDuplicate };
        }
    }
    generateAndStoreDailyReport() {
        const todayStr = new Date().toISOString().slice(0, 10);
        const allSkills = this.state.skills;
        const newToday = allSkills.filter((s) => Date.now() - new Date(s.discoveredAt).getTime() <= 86400000 * 1.5);
        const updatedRecent = allSkills.filter((s) => Date.now() - new Date(s.lastUpdatedAt).getTime() <= 86400000 * 3);
        const securityAlerts = allSkills.filter((s) => s.securityStatus !== 'SAFE');
        const avgScore = allSkills.length > 0
            ? Math.round((allSkills.reduce((acc, s) => acc + s.overallScore, 0) / allSkills.length) * 10) / 10
            : 0;
        const sortedByScore = [...allSkills]
            .filter((s) => s.securityStatus === 'SAFE')
            .sort((a, b) => b.overallScore - a.overallScore);
        const sortedByTrending = [...allSkills]
            .filter((s) => s.securityStatus === 'SAFE')
            .sort((a, b) => b.repository.stars * 0.4 +
            b.overallScore * 100 -
            (a.repository.stars * 0.4 + a.overallScore * 100));
        const categoryBreakdown = {};
        for (const s of allSkills) {
            categoryBreakdown[s.category.name] = (categoryBreakdown[s.category.name] || 0) + 1;
        }
        const report = {
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
        }
        else {
            this.state.dailyReports.unshift(report);
        }
        this.persist();
        return report;
    }
    getRepositories() {
        const map = new Map();
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
            }
            else {
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
                    Math.round((existing.skills.reduce((sum, item) => sum + item.overallScore, 0) /
                        existing.skillCount) *
                        10) / 10;
            }
        }
        return Array.from(map.values()).sort((a, b) => b.stars - a.stars);
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = DatabaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [skill_analyzer_service_1.SkillAnalyzerService])
], DatabaseService);
//# sourceMappingURL=database.service.js.map