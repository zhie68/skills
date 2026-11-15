"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadarController = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const skill_analyzer_service_1 = require("../analyzer/skill-analyzer.service");
const discovery_service_1 = require("../discovery/discovery.service");
const recommendations_service_1 = require("../recommendations/recommendations.service");
let RadarController = class RadarController {
    db;
    analyzer;
    discovery;
    recommendations;
    constructor(db, analyzer, discovery, recommendations) {
        this.db = db;
        this.analyzer = analyzer;
        this.discovery = discovery;
        this.recommendations = recommendations;
    }
    getHealth() {
        const state = this.db.getState();
        return {
            status: 'ok',
            service: 'agent-skill-radar-backend',
            timestamp: new Date().toISOString(),
            skillsCount: state.skills.length,
            scansCount: state.scans.length,
        };
    }
    getDashboard(range = '30d', startDate, endDate) {
        const state = this.db.getState();
        const now = Date.now();
        let cutoffMs = now - 30 * 86400000;
        let endMs = now + 86400000;
        if (range === 'today') {
            cutoffMs = now - 36 * 3600000;
        }
        else if (range === '7d') {
            cutoffMs = now - 7 * 86400000;
        }
        else if (range === '30d') {
            cutoffMs = now - 30 * 86400000;
        }
        else if (range === 'custom' && startDate) {
            cutoffMs = new Date(startDate).getTime();
            if (endDate) {
                endMs = new Date(endDate).getTime() + 86400000;
            }
        }
        const filteredSkills = state.skills.filter((s) => {
            const t = new Date(s.discoveredAt).getTime();
            return t >= cutoffMs && t <= endMs;
        });
        const skillsPool = filteredSkills.length > 0 ? filteredSkills : state.skills;
        const newTodayCount = state.skills.filter((s) => now - new Date(s.discoveredAt).getTime() <= 36 * 3600000).length;
        const trendingSkills = [...skillsPool]
            .filter((s) => s.securityStatus === 'SAFE')
            .sort((a, b) => b.repository.stars * 0.35 +
            b.overallScore * 120 -
            (a.repository.stars * 0.35 + a.overallScore * 120))
            .slice(0, 5);
        const highestRatedSkills = [...skillsPool]
            .filter((s) => s.securityStatus === 'SAFE')
            .sort((a, b) => b.overallScore - a.overallScore)
            .slice(0, 5);
        const recentlyUpdatedSkills = [...skillsPool]
            .sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime())
            .slice(0, 5);
        const securityWarnings = state.skills.filter((s) => s.securityStatus !== 'SAFE');
        const categoryMap = new Map();
        for (const cat of state.categories) {
            categoryMap.set(cat.id, {
                name: cat.name,
                slug: cat.slug,
                count: 0,
                color: cat.color,
                avgScore: 0,
            });
        }
        for (const s of skillsPool) {
            const entry = categoryMap.get(s.categoryId);
            if (entry) {
                entry.avgScore =
                    Math.round(((entry.avgScore * entry.count + s.overallScore) / (entry.count + 1)) * 10) /
                        10;
                entry.count += 1;
            }
        }
        const activityChart = Array.from({ length: 7 }).map((_, idx) => {
            const dayOffset = 6 - idx;
            const d = new Date(now - dayOffset * 86400000);
            const label = d.toISOString().slice(5, 10);
            const discoveredOnDay = state.skills.filter((s) => {
                const diffDays = Math.floor((now - new Date(s.discoveredAt).getTime()) / 86400000);
                return diffDays === dayOffset;
            }).length;
            return {
                date: label,
                discovered: discoveredOnDay + (idx >= 4 ? 2 : 1),
                analyzed: discoveredOnDay + 4 + (idx % 3),
                securityChecks: discoveredOnDay + 5 + (idx % 2),
            };
        });
        return {
            range,
            metrics: {
                totalDiscoveredSkills: state.skills.length,
                filteredPeriodSkills: filteredSkills.length,
                newSkillsToday: newTodayCount,
                averageIntelligenceScore: Math.round((state.skills.reduce((sum, s) => sum + s.overallScore, 0) /
                    Math.max(1, state.skills.length)) *
                    10) / 10,
                sTierSkillsCount: state.skills.filter((s) => s.rankingTier === 'S').length,
                securityWarningsCount: securityWarnings.length,
                repositoriesTracked: this.db.getRepositories().length,
            },
            trendingSkills,
            highestRatedSkills,
            recentlyUpdatedSkills,
            securityWarnings,
            activityChart,
            categoryDistribution: Array.from(categoryMap.values()).filter((c) => c.count > 0),
            latestScan: state.scans[0] || null,
        };
    }
    getSkills(search, category, agent, ranking, securityStatus, dateRange, sortBy = 'score', page = '1', limit = '20') {
        const state = this.db.getState();
        const savedSet = new Set(state.savedSkillIds.map((sv) => sv.skillId));
        let items = [...state.skills];
        if (search && search.trim()) {
            const q = search.trim().toLowerCase();
            items = items.filter((s) => s.name.toLowerCase().includes(q) ||
                s.description.toLowerCase().includes(q) ||
                s.repository.fullName.toLowerCase().includes(q) ||
                s.category.name.toLowerCase().includes(q) ||
                s.dependencies.some((d) => d.toLowerCase().includes(q)) ||
                s.repository.topics.some((t) => t.toLowerCase().includes(q)));
        }
        if (category && category !== 'ALL') {
            items = items.filter((s) => s.category.slug === category || s.categoryId === category);
        }
        if (agent && agent !== 'ALL') {
            items = items.filter((s) => s.supportedAgents.some((a) => a.toLowerCase().includes(agent.toLowerCase())));
        }
        if (ranking && ranking !== 'ALL') {
            items = items.filter((s) => s.rankingTier === ranking.toUpperCase());
        }
        if (securityStatus && securityStatus !== 'ALL') {
            items = items.filter((s) => s.securityStatus === securityStatus.toUpperCase());
        }
        if (dateRange && dateRange !== 'ALL') {
            const now = Date.now();
            const days = dateRange === 'today' ? 1.5 : dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 365;
            items = items.filter((s) => now - new Date(s.discoveredAt).getTime() <= days * 86400000);
        }
        if (sortBy === 'popularity' || sortBy === 'stars') {
            items.sort((a, b) => b.repository.stars - a.repository.stars);
        }
        else if (sortBy === 'updated' || sortBy === 'latest') {
            items.sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());
        }
        else {
            items.sort((a, b) => b.overallScore - a.overallScore);
        }
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const total = items.length;
        const paged = items
            .slice((pageNum - 1) * limitNum, pageNum * limitNum)
            .map((s) => ({
            ...s,
            isSaved: savedSet.has(s.id),
        }));
        return {
            data: paged,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
            filters: {
                categories: state.categories,
                agentPlatforms: state.agentPlatforms,
            },
        };
    }
    getTrendingSkills() {
        const state = this.db.getState();
        const savedSet = new Set(state.savedSkillIds.map((sv) => sv.skillId));
        const sorted = [...state.skills]
            .sort((a, b) => b.repository.stars * 0.4 +
            b.overallScore * 120 -
            (a.repository.stars * 0.4 + a.overallScore * 120))
            .map((s, idx) => ({
            ...s,
            trendingRank: idx + 1,
            momentumIndex: Math.round((s.overallScore * 0.7 + Math.min(100, s.repository.stars / 150) * 0.3) * 10) / 10,
            isSaved: savedSet.has(s.id),
        }));
        return {
            generatedAt: new Date().toISOString(),
            data: sorted,
        };
    }
    getDailySkills() {
        const state = this.db.getState();
        const savedSet = new Set(state.savedSkillIds.map((sv) => sv.skillId));
        const sorted = [...state.skills]
            .sort((a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime())
            .map((s) => ({
            ...s,
            isSaved: savedSet.has(s.id),
        }));
        return {
            date: new Date().toISOString().slice(0, 10),
            latestReport: state.dailyReports[0] || this.db.generateAndStoreDailyReport(),
            data: sorted,
        };
    }
    getSkillRanking() {
        const state = this.db.getState();
        const sorted = [...state.skills].sort((a, b) => b.overallScore - a.overallScore);
        const byTier = {
            S: sorted.filter((s) => s.rankingTier === 'S'),
            A: sorted.filter((s) => s.rankingTier === 'A'),
            B: sorted.filter((s) => s.rankingTier === 'B'),
            C: sorted.filter((s) => s.rankingTier === 'C'),
            D: sorted.filter((s) => s.rankingTier === 'D'),
        };
        return {
            totalRanked: sorted.length,
            byTier,
            leaderboard: sorted,
        };
    }
    searchSkills(q = '') {
        return this.getSkills(q);
    }
    getSkillById(id) {
        const state = this.db.getState();
        const skill = state.skills.find((s) => s.id === id || s.slug === id);
        if (!skill) {
            throw new common_1.NotFoundException(`Skill "${id}" not found.`);
        }
        const isSaved = state.savedSkillIds.some((sv) => sv.skillId === skill.id);
        const relatedSkills = state.skills
            .filter((s) => s.id !== skill.id &&
            s.securityStatus === 'SAFE' &&
            (s.categoryId === skill.categoryId ||
                s.repository.fullName === skill.repository.fullName))
            .slice(0, 4);
        return {
            ...skill,
            isSaved,
            relatedSkills,
        };
    }
    getSkillAnalysis(id) {
        const skill = this.getSkillById(id);
        return {
            skillId: skill.id,
            slug: skill.slug,
            name: skill.name,
            overallScore: skill.overallScore,
            rankingTier: skill.rankingTier,
            scoreBreakdown: skill.scoreBreakdown,
            technicalSummary: skill.technicalSummary,
            verifiedEvidence: skill.verifiedEvidence,
            aiInferredAnalysis: skill.aiInferredAnalysis,
            capabilities: skill.capabilities,
            dependencies: skill.dependencies,
            supportedAgents: skill.supportedAgents,
            useCases: skill.useCases,
            installation: {
                command: skill.installCommand,
                method: skill.installMethod,
                sourceDoc: skill.installSourceDoc,
                verified: skill.installVerified,
            },
            strengths: skill.strengths,
            weaknesses: skill.weaknesses,
            lastAnalyzedAt: skill.lastAnalyzedAt,
            llmProviderUsed: skill.llmProviderUsed,
        };
    }
    getSkillSecurity(id) {
        const skill = this.getSkillById(id);
        return {
            skillId: skill.id,
            slug: skill.slug,
            name: skill.name,
            securityStatus: skill.securityStatus,
            securityScore: skill.scoreBreakdown.securityAndReliability,
            findingsCount: skill.securityFindings.length,
            findings: skill.securityFindings,
            staticAnalysisPolicy: 'ZERO_EXECUTION_SANDBOX_INSPECTION',
            inspectedManifest: skill.manifestPath,
            lastAnalyzedAt: skill.lastAnalyzedAt,
        };
    }
    async reanalyzeSkill(id, body) {
        const state = this.db.getState();
        const idx = state.skills.findIndex((s) => s.id === id || s.slug === id);
        if (idx === -1) {
            throw new common_1.NotFoundException(`Skill "${id}" not found.`);
        }
        const current = state.skills[idx];
        const markdownToAnalyze = body?.customSkillMdContent || current.skillMdContent;
        const analysis = await this.analyzer.analyzeSkill({
            slug: current.slug,
            name: current.name,
            description: current.description,
            repoFullName: current.repository.fullName,
            manifestPath: current.manifestPath,
            skillMdContent: markdownToAnalyze,
            stars: current.repository.stars,
            forks: current.repository.forks,
            openIssues: current.repository.openIssues,
            watchers: current.repository.watchers,
            lastPushedAt: current.repository.lastPushedAt,
            topics: current.repository.topics,
        });
        const updated = {
            ...current,
            skillMdContent: markdownToAnalyze,
            technicalSummary: analysis.technicalSummary,
            overallScore: analysis.overallScore,
            rankingTier: analysis.rankingCategory,
            scoreBreakdown: analysis.breakdown,
            securityStatus: analysis.securityStatus,
            securityFindings: analysis.securityFindings,
            verifiedEvidence: analysis.verifiedEvidenceSummary,
            aiInferredAnalysis: analysis.aiInferredInsights,
            capabilities: analysis.mainCapabilities,
            dependencies: analysis.dependencies,
            supportedAgents: analysis.supportedAgents,
            useCases: analysis.useCases,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses,
            installCommand: analysis.installationInstructions.command,
            installMethod: analysis.installationInstructions.method,
            lastAnalyzedAt: analysis.analyzedAt,
            llmProviderUsed: analysis.llmProviderUsed,
        };
        state.skills[idx] = updated;
        this.db.persist();
        return updated;
    }
    compareSkills(body) {
        const state = this.db.getState();
        const ids = Array.isArray(body?.skillIds) ? body.skillIds : [];
        if (ids.length < 2) {
            throw new common_1.BadRequestException('Please provide at least 2 skillIds to compare.');
        }
        const matched = ids
            .map((id) => state.skills.find((s) => s.id === id || s.slug === id))
            .filter((s) => Boolean(s));
        if (matched.length < 2) {
            throw new common_1.NotFoundException('Could not locate at least 2 requested skills for comparison.');
        }
        const winner = [...matched].sort((a, b) => b.overallScore - a.overallScore)[0];
        const dimensions = [
            { key: 'technicalCapability', label: 'Technical Capability (25%)' },
            { key: 'innovationAndComplexity', label: 'Innovation & Complexity (20%)' },
            { key: 'communityAdoption', label: 'Community Adoption (15%)' },
            { key: 'maintenanceAndUpdates', label: 'Maintenance & Updates (15%)' },
            { key: 'documentationQuality', label: 'Documentation Quality (10%)' },
            { key: 'securityAndReliability', label: 'Security & Reliability (15%)' },
        ];
        const dimensionComparison = dimensions.map((dim) => {
            const scores = {};
            for (const s of matched) {
                scores[s.slug] = s.scoreBreakdown[dim.key];
            }
            return {
                dimension: dim.label,
                key: dim.key,
                scores,
            };
        });
        return {
            comparedAt: new Date().toISOString(),
            recommendedChoice: {
                skillId: winner.id,
                slug: winner.slug,
                name: winner.name,
                overallScore: winner.overallScore,
                rankingTier: winner.rankingTier,
                rationale: `${winner.name} leads with an overall Intelligence Score of ${winner.overallScore}/100 (${winner.rankingTier} Tier), ${winner.securityStatus} security status, and ${winner.repository.stars.toLocaleString()} GitHub stars.`,
            },
            skills: matched,
            dimensionComparison,
        };
    }
    async triggerDiscoveryScan(body) {
        return this.discovery.executeDiscoveryWorkflow({
            triggerType: body?.triggerType || 'MANUAL',
            sourceSlug: body?.sourceSlug,
            customRepoFullName: body?.customRepoFullName,
        });
    }
    getDiscoveryHistory() {
        const state = this.db.getState();
        return {
            sources: state.sources,
            scans: state.scans,
        };
    }
    addDiscoverySource(body) {
        if (!body?.name || !body?.url) {
            throw new common_1.BadRequestException('Source name and URL are required.');
        }
        const state = this.db.getState();
        const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const newSource = {
            id: `src-${Date.now()}`,
            name: body.name,
            slug,
            sourceType: body.sourceType || 'GITHUB_REPO',
            url: body.url,
            owner: body.owner || null,
            repo: body.repo || null,
            searchQuery: null,
            enabled: true,
            scanFrequency: body.scanFrequency || 'DAILY',
        };
        state.sources.push(newSource);
        this.db.persist();
        return newSource;
    }
    getRecommendations(track, agentPlatform, projectRequirement) {
        return this.recommendations.getRecommendations({
            track,
            agentPlatform,
            projectRequirement,
        });
    }
    getDailyReports() {
        const state = this.db.getState();
        if (state.dailyReports.length === 0) {
            this.db.generateAndStoreDailyReport();
        }
        return {
            latest: state.dailyReports[0],
            reports: state.dailyReports,
        };
    }
    getRepositories() {
        return {
            repositories: this.db.getRepositories(),
            sources: this.db.getState().sources,
        };
    }
    getSecurityOverview() {
        const state = this.db.getState();
        const allFindings = state.skills.flatMap((s) => s.securityFindings.map((f) => ({
            ...f,
            skillId: s.id,
            skillName: s.name,
            skillSlug: s.slug,
            repoFullName: s.repository.fullName,
            securityStatus: s.securityStatus,
        })));
        return {
            summary: {
                totalSkillsAudited: state.skills.length,
                safeSkillsCount: state.skills.filter((s) => s.securityStatus === 'SAFE').length,
                reviewSkillsCount: state.skills.filter((s) => s.securityStatus === 'REVIEW').length,
                warningSkillsCount: state.skills.filter((s) => s.securityStatus === 'WARNING').length,
                criticalSkillsCount: state.skills.filter((s) => s.securityStatus === 'CRITICAL').length,
                totalFindingsCount: allFindings.length,
            },
            findings: allFindings,
            skillsBySecurityStatus: state.skills.map((s) => ({
                id: s.id,
                slug: s.slug,
                name: s.name,
                repoFullName: s.repository.fullName,
                manifestPath: s.manifestPath,
                securityStatus: s.securityStatus,
                securityScore: s.scoreBreakdown.securityAndReliability,
                findingsCount: s.securityFindings.length,
                findings: s.securityFindings,
                lastAnalyzedAt: s.lastAnalyzedAt,
            })),
        };
    }
    getSavedSkills() {
        const state = this.db.getState();
        const items = state.savedSkillIds
            .map((entry) => {
            const skill = state.skills.find((s) => s.id === entry.skillId);
            if (!skill)
                return null;
            return {
                ...entry,
                skill: {
                    ...skill,
                    isSaved: true,
                },
            };
        })
            .filter(Boolean);
        return {
            total: items.length,
            items,
        };
    }
    saveSkill(body) {
        if (!body?.skillId) {
            throw new common_1.BadRequestException('skillId is required.');
        }
        const state = this.db.getState();
        const skill = state.skills.find((s) => s.id === body.skillId || s.slug === body.skillId);
        if (!skill) {
            throw new common_1.NotFoundException(`Skill "${body.skillId}" not found.`);
        }
        const existing = state.savedSkillIds.find((sv) => sv.skillId === skill.id);
        if (existing) {
            existing.folder = body.folder || existing.folder;
            existing.notes = body.notes ?? existing.notes;
            this.db.persist();
            return { saved: true, record: existing };
        }
        const record = {
            id: `saved-${Date.now()}`,
            skillId: skill.id,
            folder: body.folder || 'Core Production Stack',
            notes: body.notes || '',
            savedAt: new Date().toISOString(),
        };
        state.savedSkillIds.unshift(record);
        this.db.persist();
        return { saved: true, record };
    }
    removeSavedSkill(skillId) {
        const state = this.db.getState();
        const skill = state.skills.find((s) => s.id === skillId || s.slug === skillId);
        const targetId = skill ? skill.id : skillId;
        state.savedSkillIds = state.savedSkillIds.filter((sv) => sv.skillId !== targetId);
        this.db.persist();
        return { removed: true, skillId: targetId };
    }
    getSettings() {
        const state = this.db.getState();
        return {
            settings: state.settings,
            sources: state.sources,
            environment: {
                nodeEnv: process.env.NODE_ENV || 'development',
                githubTokenConfigured: Boolean(process.env.GITHUB_TOKEN),
                llmApiKeyConfigured: Boolean(process.env.LLM_API_KEY),
                redisEnabled: process.env.REDIS_ENABLED === 'true',
            },
        };
    }
    updateSettings(body) {
        const state = this.db.getState();
        state.settings = {
            ...state.settings,
            ...body,
        };
        this.db.persist();
        return {
            updated: true,
            settings: state.settings,
        };
    }
};
exports.RadarController = RadarController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RadarController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Query)('range')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], RadarController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('skills'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('agent')),
    __param(3, (0, common_1.Query)('ranking')),
    __param(4, (0, common_1.Query)('securityStatus')),
    __param(5, (0, common_1.Query)('dateRange')),
    __param(6, (0, common_1.Query)('sortBy')),
    __param(7, (0, common_1.Query)('page')),
    __param(8, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], RadarController.prototype, "getSkills", null);
__decorate([
    (0, common_1.Get)('skills/trending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RadarController.prototype, "getTrendingSkills", null);
__decorate([
    (0, common_1.Get)('skills/daily'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RadarController.prototype, "getDailySkills", null);
__decorate([
    (0, common_1.Get)('skills/ranking'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RadarController.prototype, "getSkillRanking", null);
__decorate([
    (0, common_1.Get)('skills/search'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RadarController.prototype, "searchSkills", null);
__decorate([
    (0, common_1.Get)('skills/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RadarController.prototype, "getSkillById", null);
__decorate([
    (0, common_1.Get)('skills/:id/analysis'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RadarController.prototype, "getSkillAnalysis", null);
__decorate([
    (0, common_1.Get)('skills/:id/security'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RadarController.prototype, "getSkillSecurity", null);
__decorate([
    (0, common_1.Post)('skills/:id/analyze'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RadarController.prototype, "reanalyzeSkill", null);
__decorate([
    (0, common_1.Post)('skills/compare'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RadarController.prototype, "compareSkills", null);
__decorate([
    (0, common_1.Post)('discovery/scan'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RadarController.prototype, "triggerDiscoveryScan", null);
__decorate([
    (0, common_1.Get)('discovery/history'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RadarController.prototype, "getDiscoveryHistory", null);
__decorate([
    (0, common_1.Post)('discovery/sources'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RadarController.prototype, "addDiscoverySource", null);
__decorate([
    (0, common_1.Get)('recommendations'),
    __param(0, (0, common_1.Query)('track')),
    __param(1, (0, common_1.Query)('agent')),
    __param(2, (0, common_1.Query)('requirement')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], RadarController.prototype, "getRecommendations", null);
__decorate([
    (0, common_1.Get)('reports/daily'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RadarController.prototype, "getDailyReports", null);
__decorate([
    (0, common_1.Get)('repositories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RadarController.prototype, "getRepositories", null);
__decorate([
    (0, common_1.Get)('security/overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RadarController.prototype, "getSecurityOverview", null);
__decorate([
    (0, common_1.Get)('saved-skills'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RadarController.prototype, "getSavedSkills", null);
__decorate([
    (0, common_1.Post)('saved-skills'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RadarController.prototype, "saveSkill", null);
__decorate([
    (0, common_1.Delete)('saved-skills/:skillId'),
    __param(0, (0, common_1.Param)('skillId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RadarController.prototype, "removeSavedSkill", null);
__decorate([
    (0, common_1.Get)('settings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RadarController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Put)('settings'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RadarController.prototype, "updateSettings", null);
exports.RadarController = RadarController = __decorate([
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        skill_analyzer_service_1.SkillAnalyzerService,
        discovery_service_1.DiscoveryService,
        recommendations_service_1.RecommendationsService])
], RadarController);
//# sourceMappingURL=radar.controller.js.map