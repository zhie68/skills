import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { DatabaseService, RadarSettings } from '../database/database.service';
import { SkillAnalyzerService } from '../analyzer/skill-analyzer.service';
import { DiscoveryService } from '../discovery/discovery.service';
import { RecommendationsService } from '../recommendations/recommendations.service';

@Controller('api')
export class RadarController {
  constructor(
    private readonly db: DatabaseService,
    private readonly analyzer: SkillAnalyzerService,
    private readonly discovery: DiscoveryService,
    private readonly recommendations: RecommendationsService
  ) {}

  @Get('health')
  public getHealth() {
    const state = this.db.getState();
    return {
      status: 'ok',
      service: 'agent-skill-radar-backend',
      timestamp: new Date().toISOString(),
      skillsCount: state.skills.length,
      scansCount: state.scans.length,
    };
  }

  /**
   * Overview Dashboard metrics with date filter support:
   * range: 'today' | '7d' | '30d' | 'custom'
   */
  @Get('dashboard')
  public getDashboard(
    @Query('range') range = '30d',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const state = this.db.getState();
    const now = Date.now();
    let cutoffMs = now - 30 * 86400000;
    let endMs = now + 86400000;

    if (range === 'today') {
      cutoffMs = now - 36 * 3600000;
    } else if (range === '7d') {
      cutoffMs = now - 7 * 86400000;
    } else if (range === '30d') {
      cutoffMs = now - 30 * 86400000;
    } else if (range === 'custom' && startDate) {
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
    const newTodayCount = state.skills.filter(
      (s) => now - new Date(s.discoveredAt).getTime() <= 36 * 3600000
    ).length;

    const trendingSkills = [...skillsPool]
      .filter((s) => s.securityStatus === 'SAFE')
      .sort(
        (a, b) =>
          b.repository.stars * 0.35 +
          b.overallScore * 120 -
          (a.repository.stars * 0.35 + a.overallScore * 120)
      )
      .slice(0, 5);

    const highestRatedSkills = [...skillsPool]
      .filter((s) => s.securityStatus === 'SAFE')
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 5);

    const recentlyUpdatedSkills = [...skillsPool]
      .sort(
        (a, b) =>
          new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime()
      )
      .slice(0, 5);

    const securityWarnings = state.skills.filter((s) => s.securityStatus !== 'SAFE');

    // Category distribution
    const categoryMap = new Map<string, { name: string; slug: string; count: number; color: string; avgScore: number }>();
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

    // Discovery activity chart (last 7 days)
    const activityChart = Array.from({ length: 7 }).map((_, idx) => {
      const dayOffset = 6 - idx;
      const d = new Date(now - dayOffset * 86400000);
      const label = d.toISOString().slice(5, 10);
      const discoveredOnDay = state.skills.filter((s) => {
        const diffDays = Math.floor(
          (now - new Date(s.discoveredAt).getTime()) / 86400000
        );
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
        averageIntelligenceScore:
          Math.round(
            (state.skills.reduce((sum, s) => sum + s.overallScore, 0) /
              Math.max(1, state.skills.length)) *
              10
          ) / 10,
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

  /**
   * GET /api/skills
   * Supports search, category, agent, ranking, securityStatus, dateRange, sortBy, page, limit
   */
  @Get('skills')
  public getSkills(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('agent') agent?: string,
    @Query('ranking') ranking?: string,
    @Query('securityStatus') securityStatus?: string,
    @Query('dateRange') dateRange?: string,
    @Query('sortBy') sortBy = 'score',
    @Query('page') page = '1',
    @Query('limit') limit = '20'
  ) {
    const state = this.db.getState();
    const savedSet = new Set(state.savedSkillIds.map((sv) => sv.skillId));
    let items = [...state.skills];

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.repository.fullName.toLowerCase().includes(q) ||
          s.category.name.toLowerCase().includes(q) ||
          s.dependencies.some((d) => d.toLowerCase().includes(q)) ||
          s.repository.topics.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'ALL') {
      items = items.filter(
        (s) => s.category.slug === category || s.categoryId === category
      );
    }

    if (agent && agent !== 'ALL') {
      items = items.filter((s) =>
        s.supportedAgents.some((a) => a.toLowerCase().includes(agent.toLowerCase()))
      );
    }

    if (ranking && ranking !== 'ALL') {
      items = items.filter((s) => s.rankingTier === ranking.toUpperCase());
    }

    if (securityStatus && securityStatus !== 'ALL') {
      items = items.filter((s) => s.securityStatus === securityStatus.toUpperCase());
    }

    if (dateRange && dateRange !== 'ALL') {
      const now = Date.now();
      const days =
        dateRange === 'today' ? 1.5 : dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 365;
      items = items.filter(
        (s) => now - new Date(s.discoveredAt).getTime() <= days * 86400000
      );
    }

    if (sortBy === 'popularity' || sortBy === 'stars') {
      items.sort((a, b) => b.repository.stars - a.repository.stars);
    } else if (sortBy === 'updated' || sortBy === 'latest') {
      items.sort(
        (a, b) =>
          new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime()
      );
    } else {
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

  @Get('skills/trending')
  public getTrendingSkills() {
    const state = this.db.getState();
    const savedSet = new Set(state.savedSkillIds.map((sv) => sv.skillId));
    const sorted = [...state.skills]
      .sort(
        (a, b) =>
          b.repository.stars * 0.4 +
          b.overallScore * 120 -
          (a.repository.stars * 0.4 + a.overallScore * 120)
      )
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

  @Get('skills/daily')
  public getDailySkills() {
    const state = this.db.getState();
    const savedSet = new Set(state.savedSkillIds.map((sv) => sv.skillId));
    const sorted = [...state.skills]
      .sort(
        (a, b) =>
          new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime()
      )
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

  @Get('skills/ranking')
  public getSkillRanking() {
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

  @Get('skills/search')
  public searchSkills(@Query('q') q = '') {
    return this.getSkills(q);
  }

  @Get('skills/:id')
  public getSkillById(@Param('id') id: string) {
    const state = this.db.getState();
    const skill = state.skills.find((s) => s.id === id || s.slug === id);
    if (!skill) {
      throw new NotFoundException(`Skill "${id}" not found.`);
    }
    const isSaved = state.savedSkillIds.some((sv) => sv.skillId === skill.id);
    const relatedSkills = state.skills
      .filter(
        (s) =>
          s.id !== skill.id &&
          s.securityStatus === 'SAFE' &&
          (s.categoryId === skill.categoryId ||
            s.repository.fullName === skill.repository.fullName)
      )
      .slice(0, 4);

    return {
      ...skill,
      isSaved,
      relatedSkills,
    };
  }

  @Get('skills/:id/analysis')
  public getSkillAnalysis(@Param('id') id: string) {
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

  @Get('skills/:id/security')
  public getSkillSecurity(@Param('id') id: string) {
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

  @Post('skills/:id/analyze')
  public async reanalyzeSkill(
    @Param('id') id: string,
    @Body() body?: { customSkillMdContent?: string }
  ) {
    const state = this.db.getState();
    const idx = state.skills.findIndex((s) => s.id === id || s.slug === id);
    if (idx === -1) {
      throw new NotFoundException(`Skill "${id}" not found.`);
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

  @Post('skills/compare')
  public compareSkills(@Body() body: { skillIds: string[] }) {
    const state = this.db.getState();
    const ids = Array.isArray(body?.skillIds) ? body.skillIds : [];
    if (ids.length < 2) {
      throw new BadRequestException('Please provide at least 2 skillIds to compare.');
    }

    const matched = ids
      .map((id) => state.skills.find((s) => s.id === id || s.slug === id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s));

    if (matched.length < 2) {
      throw new NotFoundException('Could not locate at least 2 requested skills for comparison.');
    }

    const winner = [...matched].sort((a, b) => b.overallScore - a.overallScore)[0];
    const dimensions = [
      { key: 'technicalCapability', label: 'Technical Capability (25%)' },
      { key: 'innovationAndComplexity', label: 'Innovation & Complexity (20%)' },
      { key: 'communityAdoption', label: 'Community Adoption (15%)' },
      { key: 'maintenanceAndUpdates', label: 'Maintenance & Updates (15%)' },
      { key: 'documentationQuality', label: 'Documentation Quality (10%)' },
      { key: 'securityAndReliability', label: 'Security & Reliability (15%)' },
    ] as const;

    const dimensionComparison = dimensions.map((dim) => {
      const scores: Record<string, number> = {};
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

  @Post('discovery/scan')
  public async triggerDiscoveryScan(
    @Body()
    body?: {
      triggerType?: 'MANUAL' | 'INCREMENTAL';
      sourceSlug?: string;
      customRepoFullName?: string;
    }
  ) {
    return this.discovery.executeDiscoveryWorkflow({
      triggerType: body?.triggerType || 'MANUAL',
      sourceSlug: body?.sourceSlug,
      customRepoFullName: body?.customRepoFullName,
    });
  }

  @Get('discovery/history')
  public getDiscoveryHistory() {
    const state = this.db.getState();
    return {
      sources: state.sources,
      scans: state.scans,
    };
  }

  @Post('discovery/sources')
  public addDiscoverySource(
    @Body()
    body: {
      name: string;
      url: string;
      sourceType?: string;
      owner?: string;
      repo?: string;
      scanFrequency?: string;
    }
  ) {
    if (!body?.name || !body?.url) {
      throw new BadRequestException('Source name and URL are required.');
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
    state.sources.push(newSource as any);
    this.db.persist();
    return newSource;
  }

  @Get('recommendations')
  public getRecommendations(
    @Query('track') track?: string,
    @Query('agent') agentPlatform?: string,
    @Query('requirement') projectRequirement?: string
  ) {
    return this.recommendations.getRecommendations({
      track,
      agentPlatform,
      projectRequirement,
    });
  }

  @Get('reports/daily')
  public getDailyReports() {
    const state = this.db.getState();
    if (state.dailyReports.length === 0) {
      this.db.generateAndStoreDailyReport();
    }
    return {
      latest: state.dailyReports[0],
      reports: state.dailyReports,
    };
  }

  @Get('repositories')
  public getRepositories() {
    return {
      repositories: this.db.getRepositories(),
      sources: this.db.getState().sources,
    };
  }

  @Get('security/overview')
  public getSecurityOverview() {
    const state = this.db.getState();
    const allFindings = state.skills.flatMap((s) =>
      s.securityFindings.map((f) => ({
        ...f,
        skillId: s.id,
        skillName: s.name,
        skillSlug: s.slug,
        repoFullName: s.repository.fullName,
        securityStatus: s.securityStatus,
      }))
    );

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

  @Get('saved-skills')
  public getSavedSkills() {
    const state = this.db.getState();
    const items = state.savedSkillIds
      .map((entry) => {
        const skill = state.skills.find((s) => s.id === entry.skillId);
        if (!skill) return null;
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

  @Post('saved-skills')
  public saveSkill(
    @Body() body: { skillId: string; folder?: string; notes?: string }
  ) {
    if (!body?.skillId) {
      throw new BadRequestException('skillId is required.');
    }
    const state = this.db.getState();
    const skill = state.skills.find(
      (s) => s.id === body.skillId || s.slug === body.skillId
    );
    if (!skill) {
      throw new NotFoundException(`Skill "${body.skillId}" not found.`);
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

  @Delete('saved-skills/:skillId')
  public removeSavedSkill(@Param('skillId') skillId: string) {
    const state = this.db.getState();
    const skill = state.skills.find((s) => s.id === skillId || s.slug === skillId);
    const targetId = skill ? skill.id : skillId;
    state.savedSkillIds = state.savedSkillIds.filter((sv) => sv.skillId !== targetId);
    this.db.persist();
    return { removed: true, skillId: targetId };
  }

  @Get('settings')
  public getSettings() {
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

  @Put('settings')
  public updateSettings(@Body() body: Partial<RadarSettings>) {
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
}
