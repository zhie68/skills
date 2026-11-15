'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Radar,
  LayoutDashboard,
  Sparkles,
  Flame,
  Compass,
  FileSearch,
  GitCompare,
  Cpu,
  ShieldAlert,
  FolderGit2,
  Bookmark,
  History,
  Settings as SettingsIcon,
  Search,
  RefreshCw,
  Play,
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Star,
  Terminal,
  Trash2,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from 'recharts';
import { radarApi, SkillRecord } from '@/lib/api-client';
import { SkillCard } from '@/components/skill-card';
import { SkillDetailView } from '@/components/skill-detail-view';
import { EvidenceBadge, RankingBadge, SecurityBadge } from '@/components/ui/badges';

type PageId =
  | 'overview'
  | 'daily'
  | 'trending'
  | 'explorer'
  | 'details'
  | 'comparison'
  | 'recommendations'
  | 'security'
  | 'repositories'
  | 'saved'
  | 'history'
  | 'settings';

export default function AgentSkillRadarApp() {
  const [activePage, setActivePage] = useState<PageId>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Core data states
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [skillsData, setSkillsData] = useState<SkillRecord[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [agentPlatforms, setAgentPlatforms] = useState<any[]>([]);
  const [trendingSkills, setTrendingSkills] = useState<SkillRecord[]>([]);
  const [dailyData, setDailyData] = useState<any>(null);
  const [recommendationsData, setRecommendationsData] = useState<any>(null);
  const [securityOverview, setSecurityOverview] = useState<any>(null);
  const [repositoriesData, setRepositoriesData] = useState<any>(null);
  const [savedSkillsData, setSavedSkillsData] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<any>(null);
  const [settingsData, setSettingsData] = useState<any>(null);

  // Selected skill for detail page & comparison tray
  const [selectedSkill, setSelectedSkill] = useState<SkillRecord | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([
    'anthropics-mcp-builder',
    'antigravity-swarm-orchestrator',
  ]);
  const [comparisonResult, setComparisonResult] = useState<any>(null);

  // Dashboard date filter
  const [dashboardRange, setDashboardRange] = useState<'today' | '7d' | '30d' | 'custom'>('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Explorer filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [agentFilter, setAgentFilter] = useState('ALL');
  const [rankingFilter, setRankingFilter] = useState('ALL');
  const [securityFilter, setSecurityFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('score');

  // Recommendations filters
  const [recTrackFilter, setRecTrackFilter] = useState('ALL');
  const [recAgentFilter, setRecAgentFilter] = useState('ALL');
  const [recRequirement, setRecRequirement] = useState('');

  // Custom repo scan & source creation inputs
  const [customRepoScanInput, setCustomRepoScanInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const loadAllPlatformData = useCallback(async () => {
    try {
      setError(null);
      const [
        dash,
        skillsRes,
        trendingRes,
        dailyRes,
        recsRes,
        secRes,
        reposRes,
        savedRes,
        histRes,
        setRes,
      ] = await Promise.all([
        radarApi.getDashboard(dashboardRange, customStartDate, customEndDate),
        radarApi.getSkills({
          search: searchQuery,
          category: categoryFilter,
          agent: agentFilter,
          ranking: rankingFilter,
          securityStatus: securityFilter,
          dateRange: dateFilter,
          sortBy,
        }),
        radarApi.getTrendingSkills(),
        radarApi.getDailySkills(),
        radarApi.getRecommendations({
          track: recTrackFilter,
          agent: recAgentFilter,
          requirement: recRequirement,
        }),
        radarApi.getSecurityOverview(),
        radarApi.getRepositories(),
        radarApi.getSavedSkills(),
        radarApi.getDiscoveryHistory(),
        radarApi.getSettings(),
      ]);

      setDashboardData(dash);
      setSkillsData(skillsRes.data);
      setCategories(skillsRes.filters.categories || []);
      setAgentPlatforms(skillsRes.filters.agentPlatforms || []);
      setTrendingSkills(trendingRes.data);
      setDailyData(dailyRes);
      setRecommendationsData(recsRes);
      setSecurityOverview(secRes);
      setRepositoriesData(reposRes);
      setSavedSkillsData(savedRes.items || []);
      setHistoryData(histRes);
      setSettingsData(setRes);

      if (!selectedSkill && skillsRes.data.length > 0) {
        const detail = await radarApi.getSkillById(skillsRes.data[0].id);
        setSelectedSkill(detail);
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to load Agent Skill Radar data.');
    } finally {
      setLoading(false);
    }
  }, [
    dashboardRange,
    customStartDate,
    customEndDate,
    searchQuery,
    categoryFilter,
    agentFilter,
    rankingFilter,
    securityFilter,
    dateFilter,
    sortBy,
    recTrackFilter,
    recAgentFilter,
    recRequirement,
    selectedSkill,
  ]);

  useEffect(() => {
    loadAllPlatformData();
  }, [loadAllPlatformData]);

  useEffect(() => {
    if (compareIds.length >= 2) {
      radarApi
        .compareSkills(compareIds)
        .then((res) => setComparisonResult(res))
        .catch(() => null);
    }
  }, [compareIds]);

  const handleSelectSkill = async (skill: SkillRecord) => {
    try {
      const fullSkill = await radarApi.getSkillById(skill.id);
      setSelectedSkill(fullSkill);
      setActivePage('details');
    } catch {
      setSelectedSkill(skill);
      setActivePage('details');
    }
  };

  const handleToggleSave = async (skill: SkillRecord) => {
    try {
      if (skill.isSaved) {
        await radarApi.removeSavedSkill(skill.id);
        showToast(`Removed "${skill.name}" from Saved Skills.`);
      } else {
        await radarApi.saveSkill(skill.id, 'Core Production Stack');
        showToast(`Saved "${skill.name}" to Core Production Stack.`);
      }
      await loadAllPlatformData();
      if (selectedSkill && selectedSkill.id === skill.id) {
        const refreshed = await radarApi.getSkillById(skill.id);
        setSelectedSkill(refreshed);
      }
    } catch (err) {
      showToast(`Action failed: ${(err as Error).message}`);
    }
  };

  const handleToggleCompare = (skill: SkillRecord) => {
    setCompareIds((prev) => {
      const exists = prev.includes(skill.slug) || prev.includes(skill.id);
      if (exists) {
        const next = prev.filter((id) => id !== skill.slug && id !== skill.id);
        showToast(`Removed "${skill.name}" from Comparison.`);
        return next;
      }
      if (prev.length >= 4) {
        showToast('Comparison supports up to 4 skills at once. Replaced oldest selection.');
        return [...prev.slice(1), skill.slug];
      }
      showToast(`Added "${skill.name}" to Skill Comparison.`);
      return [...prev, skill.slug];
    });
  };

  const handleTriggerScan = async (
    triggerType: 'MANUAL' | 'INCREMENTAL' = 'MANUAL',
    customRepoFullName?: string
  ) => {
    setIsScanning(true);
    try {
      const scanRes = await radarApi.triggerScan({
        triggerType,
        customRepoFullName: customRepoFullName || undefined,
      });
      showToast(
        `Discovery scan completed: ${scanRes.manifestsDiscovered} manifests analyzed (${scanRes.newSkillsFound} new, ${scanRes.updatedSkillsCount} updated).`
      );
      setCustomRepoScanInput('');
      await loadAllPlatformData();
    } catch (err) {
      showToast(`Discovery scan error: ${(err as Error).message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleReanalyzeSkill = async (skillId: string, customMarkdown?: string) => {
    setIsReanalyzing(true);
    try {
      const updated = await radarApi.reanalyzeSkill(skillId, customMarkdown);
      setSelectedSkill(updated);
      showToast(
        `Re-analyzed "${updated.name}": Score ${updated.overallScore}/100 (Tier ${updated.rankingTier}).`
      );
      await loadAllPlatformData();
    } catch (err) {
      showToast(`Re-analysis failed: ${(err as Error).message}`);
    } finally {
      setIsReanalyzing(false);
    }
  };

  const navItems: Array<{ id: PageId; label: string; icon: any; badge?: string | number }> = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
    {
      id: 'daily',
      label: 'Daily Discoveries',
      icon: Sparkles,
      badge: dashboardData?.metrics?.newSkillsToday || undefined,
    },
    { id: 'trending', label: 'Trending Skills', icon: Flame },
    {
      id: 'explorer',
      label: 'Skill Explorer',
      icon: Compass,
      badge: dashboardData?.metrics?.totalDiscoveredSkills || undefined,
    },
    { id: 'details', label: 'Skill Details', icon: FileSearch },
    {
      id: 'comparison',
      label: 'Skill Comparison',
      icon: GitCompare,
      badge: compareIds.length,
    },
    { id: 'recommendations', label: 'AI Recommendations', icon: Cpu },
    {
      id: 'security',
      label: 'Security Analysis',
      icon: ShieldAlert,
      badge: dashboardData?.metrics?.securityWarningsCount || undefined,
    },
    { id: 'repositories', label: 'Repository Explorer', icon: FolderGit2 },
    {
      id: 'saved',
      label: 'Saved Skills',
      icon: Bookmark,
      badge: savedSkillsData.length || undefined,
    },
    { id: 'history', label: 'Scan History', icon: History },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex min-h-screen bg-[#070913] text-slate-100">
      {/* LEFT SIDEBAR NAVIGATION (12 Pages) */}
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col justify-between border-r border-slate-800/80 bg-[#0a0d1c]/90 px-3 py-5 backdrop-blur-xl">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-600/20">
              <Radar className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="block text-sm font-bold tracking-tight text-white">
                Agent Skill Radar
              </span>
              <span className="block text-[11px] text-purple-300/80">
                Intelligence & SAST Platform
              </span>
            </div>
          </div>

          {/* 12-Page Navigation List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivePage(item.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/25 to-blue-600/20 text-white border border-purple-500/40 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-900/70 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? 'text-purple-400' : 'text-slate-400'
                      }`}
                    />
                    {item.label}
                  </span>
                  {item.badge !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        item.id === 'security'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Daily Scan Trigger Card */}
        <div className="rounded-xl border border-purple-500/25 bg-gradient-to-b from-purple-950/30 to-slate-950/80 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-purple-200">Daily Discovery Engine</span>
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Monitors GitHub, skills.sh, Anthropic, Antigravity, Three.js & OpenClaw.
          </p>
          <button
            type="button"
            disabled={isScanning}
            onClick={() => handleTriggerScan('MANUAL')}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-2 text-xs font-semibold text-white hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Running Scan...' : 'Run Discovery Scan'}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 bg-[#070913]/85 px-8 py-4 backdrop-blur-xl">
          <div>
            <h2 className="text-lg font-bold text-white">
              {navItems.find((n) => n.id === activePage)?.label}
            </h2>
            <p className="text-xs text-slate-400">
              Verified GitHub & Ecosystem Telemetry • Zero-Execution Static Security • Weighted Intelligence Scoring
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Global quick search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activePage !== 'explorer') setActivePage('explorer');
                }}
                placeholder="Search skills, repos, MCP, Three.js..."
                className="w-64 rounded-lg border border-slate-800 bg-slate-900/90 pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setActivePage('comparison')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300 hover:bg-blue-500/20 transition-colors"
            >
              <GitCompare className="h-3.5 w-3.5" />
              Compare ({compareIds.length})
            </button>
          </div>
        </header>

        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-purple-500/40 bg-slate-900/95 px-4 py-3 text-xs font-medium text-purple-200 shadow-xl backdrop-blur-md">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            {toast}
          </div>
        )}

        {/* Loading & Error States */}
        <main className="flex-1 p-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="glass-panel h-48 animate-pulse rounded-xl p-5"
                />
              ))}
            </div>
          ) : error ? (
            <div className="glass-panel mx-auto max-w-xl rounded-2xl p-8 text-center space-y-4">
              <AlertTriangle className="mx-auto h-10 w-10 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Backend API Connection Warning
              </h3>
              <p className="text-xs text-slate-300">{error}</p>
              <button
                type="button"
                onClick={loadAllPlatformData}
                className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <>
              {/* =========================================================
                  PAGE 1: OVERVIEW DASHBOARD
              ========================================================= */}
              {activePage === 'overview' && dashboardData && (
                <div className="space-y-6">
                  {/* Date Filter Bar */}
                  <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-xl px-5 py-3.5">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Calendar className="h-4 w-4 text-purple-400" />
                      <span className="font-semibold">Discovery Telemetry Window:</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { id: 'today', label: 'Today' },
                        { id: '7d', label: 'Last 7 Days' },
                        { id: '30d', label: 'Last 30 Days' },
                        { id: 'custom', label: 'Custom Date' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setDashboardRange(f.id as any)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            dashboardRange === f.id
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}

                      {dashboardRange === 'custom' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200"
                          />
                          <span className="text-xs text-slate-400">to</span>
                          <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Top 6 KPI Metric Cards */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                    <div className="glass-panel rounded-xl p-4">
                      <span className="text-xs text-slate-400">Total Discovered Skills</span>
                      <div className="mt-1 text-2xl font-bold text-white">
                        {dashboardData.metrics.totalDiscoveredSkills}
                      </div>
                      <span className="text-[11px] text-purple-300">
                        Across {dashboardData.metrics.repositoriesTracked} repositories
                      </span>
                    </div>

                    <div className="glass-panel rounded-xl p-4">
                      <span className="text-xs text-slate-400">New Skills Today</span>
                      <div className="mt-1 text-2xl font-bold text-emerald-300">
                        +{dashboardData.metrics.newSkillsToday}
                      </div>
                      <span className="text-[11px] text-slate-400">Verified SKILL.md manifests</span>
                    </div>

                    <div className="glass-panel rounded-xl p-4">
                      <span className="text-xs text-slate-400">Avg Intelligence Score</span>
                      <div className="mt-1 text-2xl font-bold text-purple-300">
                        {dashboardData.metrics.averageIntelligenceScore}/100
                      </div>
                      <span className="text-[11px] text-slate-400">6-dimension weighted</span>
                    </div>

                    <div className="glass-panel rounded-xl p-4">
                      <span className="text-xs text-slate-400">S-Tier Reference Skills</span>
                      <div className="mt-1 text-2xl font-bold text-blue-300">
                        {dashboardData.metrics.sTierSkillsCount}
                      </div>
                      <span className="text-[11px] text-slate-400">Score 90.0+ verified</span>
                    </div>

                    <div className="glass-panel rounded-xl p-4">
                      <span className="text-xs text-slate-400">Security Warnings</span>
                      <div className="mt-1 text-2xl font-bold text-rose-400">
                        {dashboardData.metrics.securityWarningsCount}
                      </div>
                      <span className="text-[11px] text-rose-300/80">
                        Quarantined from recommendations
                      </span>
                    </div>

                    <div className="glass-panel rounded-xl p-4">
                      <span className="text-xs text-slate-400">Saved Workspace Skills</span>
                      <div className="mt-1 text-2xl font-bold text-cyan-300">
                        {savedSkillsData.length}
                      </div>
                      <span className="text-[11px] text-slate-400">Active stack bookmarks</span>
                    </div>
                  </div>

                  {/* Charts Row: Discovery Activity Chart + Skill Category Distribution */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="glass-panel rounded-xl p-5 lg:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-white">
                            Daily Discovery & Security Scan Activity
                          </h3>
                          <p className="text-xs text-slate-400">
                            Manifests discovered, AI-analyzed, and statically audited over the last 7 days
                          </p>
                        </div>
                      </div>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={dashboardData.activityChart}>
                            <defs>
                              <linearGradient id="colorAnalyzed" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.45} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="colorDiscovered" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.45} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                            <YAxis stroke="#94a3b8" fontSize={11} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#0f172a',
                                borderColor: '#334155',
                                borderRadius: '0.5rem',
                                fontSize: '12px',
                              }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Area
                              type="monotone"
                              dataKey="analyzed"
                              name="Skills Analyzed"
                              stroke="#8b5cf6"
                              fillOpacity={1}
                              fill="url(#colorAnalyzed)"
                            />
                            <Area
                              type="monotone"
                              dataKey="discovered"
                              name="New Manifests"
                              stroke="#3b82f6"
                              fillOpacity={1}
                              fill="url(#colorDiscovered)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="glass-panel rounded-xl p-5 space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          Skill Category Distribution
                        </h3>
                        <p className="text-xs text-slate-400">
                          Breakdown across specialized agent domains
                        </p>
                      </div>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={dashboardData.categoryDistribution}
                            layout="vertical"
                            margin={{ left: 15 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                            <YAxis
                              dataKey="name"
                              type="category"
                              stroke="#cbd5e1"
                              fontSize={11}
                              width={120}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#0f172a',
                                borderColor: '#334155',
                                borderRadius: '0.5rem',
                                fontSize: '12px',
                              }}
                            />
                            <Bar dataKey="count" name="Skills" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Security Warning Alert Banner (if any flagged skills exist) */}
                  {dashboardData.securityWarnings?.length > 0 && (
                    <div className="rounded-xl border border-rose-500/40 bg-rose-950/20 p-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                            Active Static Security Quarantine Alert ({dashboardData.securityWarnings.length} Skill Flagged)
                          </h4>
                          <p className="text-xs text-slate-300 mt-0.5">
                            {dashboardData.securityWarnings[0].name} ({dashboardData.securityWarnings[0].repository.fullName}) triggered CRITICAL static security rules (remote shell pipe / credential path access). Never executed automatically.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActivePage('security')}
                        className="rounded-lg border border-rose-500/40 bg-rose-500/20 px-3.5 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-500/30"
                      >
                        Inspect Security Findings
                      </button>
                    </div>
                  )}

                  {/* Three Columns: Trending, Highest-Rated, Recently Updated */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Trending */}
                    <div className="glass-panel rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <Flame className="h-4 w-4 text-amber-400" />
                          Trending Skills
                        </h3>
                        <button
                          type="button"
                          onClick={() => setActivePage('trending')}
                          className="text-xs text-purple-400 hover:text-purple-300"
                        >
                          View All
                        </button>
                      </div>
                      <div className="space-y-2.5">
                        {dashboardData.trendingSkills.map((s: SkillRecord) => (
                          <div
                            key={s.id}
                            onClick={() => handleSelectSkill(s)}
                            className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/60 p-3 hover:border-purple-500/40 transition-colors"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="truncate text-xs font-semibold text-slate-100">
                                {s.name}
                              </p>
                              <p className="truncate font-mono text-[11px] text-slate-400">
                                {s.repository.fullName} • ★ {s.repository.stars.toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <RankingBadge tier={s.rankingTier} />
                              <span className="font-mono text-xs font-bold text-purple-300">
                                {s.overallScore}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Highest-Rated */}
                    <div className="glass-panel rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-purple-400" />
                          Highest-Rated Skills
                        </h3>
                        <button
                          type="button"
                          onClick={() => setActivePage('explorer')}
                          className="text-xs text-purple-400 hover:text-purple-300"
                        >
                          Explore
                        </button>
                      </div>
                      <div className="space-y-2.5">
                        {dashboardData.highestRatedSkills.map((s: SkillRecord) => (
                          <div
                            key={s.id}
                            onClick={() => handleSelectSkill(s)}
                            className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/60 p-3 hover:border-purple-500/40 transition-colors"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="truncate text-xs font-semibold text-slate-100">
                                {s.name}
                              </p>
                              <p className="truncate text-[11px] text-slate-400">
                                {s.category.name}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <RankingBadge tier={s.rankingTier} />
                              <span className="font-mono text-xs font-bold text-emerald-300">
                                {s.overallScore}/100
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recently Updated */}
                    <div className="glass-panel rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <History className="h-4 w-4 text-blue-400" />
                          Recently Updated Skills
                        </h3>
                        <button
                          type="button"
                          onClick={() => setActivePage('daily')}
                          className="text-xs text-purple-400 hover:text-purple-300"
                        >
                          Daily Report
                        </button>
                      </div>
                      <div className="space-y-2.5">
                        {dashboardData.recentlyUpdatedSkills.map((s: SkillRecord) => (
                          <div
                            key={s.id}
                            onClick={() => handleSelectSkill(s)}
                            className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/60 p-3 hover:border-purple-500/40 transition-colors"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="truncate text-xs font-semibold text-slate-100">
                                {s.name}
                              </p>
                              <p className="truncate font-mono text-[11px] text-slate-400">
                                v{s.currentVersion} • {new Date(s.lastUpdatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <SecurityBadge status={s.securityStatus} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  PAGE 2: DAILY DISCOVERIES
              ========================================================= */}
              {activePage === 'daily' && dailyData && (
                <div className="space-y-6">
                  {/* Executive Daily Report Card */}
                  {dailyData.latestReport && (
                    <div className="glass-panel rounded-2xl p-6 space-y-4 border-l-4 border-l-purple-500">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                            Automated Daily Intelligence Briefing • {dailyData.date}
                          </span>
                          <h3 className="text-lg font-bold text-white mt-0.5">
                            Daily Skill Discovery Report ({dailyData.latestReport.id})
                          </h3>
                        </div>
                        <button
                          type="button"
                          disabled={isScanning}
                          onClick={() => handleTriggerScan('INCREMENTAL')}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                          Run Incremental Discovery
                        </button>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-300">
                        {dailyData.latestReport.executiveSummary}
                      </p>
                      <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
                        <div className="rounded-lg bg-slate-900/80 p-3">
                          <span className="text-[11px] text-slate-400">Total Tracked</span>
                          <p className="text-lg font-bold text-white">
                            {dailyData.latestReport.totalSkillsTracked}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-900/80 p-3">
                          <span className="text-[11px] text-slate-400">New Discoveries</span>
                          <p className="text-lg font-bold text-emerald-300">
                            +{dailyData.latestReport.newSkillsDiscovered}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-900/80 p-3">
                          <span className="text-[11px] text-slate-400">Updated Manifests</span>
                          <p className="text-lg font-bold text-blue-300">
                            {dailyData.latestReport.updatedSkills}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-900/80 p-3">
                          <span className="text-[11px] text-slate-400">Platform Avg Score</span>
                          <p className="text-lg font-bold text-purple-300">
                            {dailyData.latestReport.averageScore}/100
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Daily Skills Grid */}
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {dailyData.data.map((skill: SkillRecord) => (
                      <SkillCard
                        key={skill.id}
                        skill={skill}
                        onSelect={handleSelectSkill}
                        onToggleSave={handleToggleSave}
                        onToggleCompare={handleToggleCompare}
                        isSelectedForCompare={
                          compareIds.includes(skill.slug) || compareIds.includes(skill.id)
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* =========================================================
                  PAGE 3: TRENDING SKILLS
              ========================================================= */}
              {activePage === 'trending' && (
                <div className="space-y-6">
                  <div className="glass-panel rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Trending AI Agent Skills Leaderboard
                      </h3>
                      <p className="text-xs text-slate-400">
                        Ranked by combined GitHub star velocity, community adoption, and verified Skill Intelligence Score
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {trendingSkills.map((skill) => (
                      <SkillCard
                        key={skill.id}
                        skill={skill}
                        onSelect={handleSelectSkill}
                        onToggleSave={handleToggleSave}
                        onToggleCompare={handleToggleCompare}
                        isSelectedForCompare={
                          compareIds.includes(skill.slug) || compareIds.includes(skill.id)
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* =========================================================
                  PAGE 4: SKILL EXPLORER
              ========================================================= */}
              {activePage === 'explorer' && (
                <div className="space-y-6">
                  {/* Comprehensive Filter Bar (Section 7) */}
                  <div className="glass-panel rounded-xl p-5 space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
                      {/* Search */}
                      <div className="lg:col-span-2">
                        <label className="mb-1 block text-[11px] font-medium text-slate-400">
                          Full-Text Search
                        </label>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Name, repo, capability, dependency..."
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      {/* Category Filter */}
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-slate-400">
                          Category
                        </label>
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
                        >
                          <option value="ALL">All Categories</option>
                          {categories.map((c: any) => (
                            <option key={c.id} value={c.slug}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Agent Compatibility Filter */}
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-slate-400">
                          Agent Compatibility
                        </label>
                        <select
                          value={agentFilter}
                          onChange={(e) => setAgentFilter(e.target.value)}
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
                        >
                          <option value="ALL">All Agents</option>
                          {agentPlatforms.map((a: any) => (
                            <option key={a.id} value={a.name}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Ranking Filter */}
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-slate-400">
                          Ranking Tier
                        </label>
                        <select
                          value={rankingFilter}
                          onChange={(e) => setRankingFilter(e.target.value)}
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
                        >
                          <option value="ALL">All Tiers (S–D)</option>
                          <option value="S">Tier S (90+)</option>
                          <option value="A">Tier A (80–89)</option>
                          <option value="B">Tier B (70–79)</option>
                          <option value="C">Tier C (60–69)</option>
                          <option value="D">Tier D (&lt;60)</option>
                        </select>
                      </div>

                      {/* Sort By */}
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-slate-400">
                          Sort By
                        </label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
                        >
                          <option value="score">Intelligence Score</option>
                          <option value="popularity">Popularity (Stars)</option>
                          <option value="updated">Latest Updates</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-400">
                      <div className="flex items-center gap-3">
                        <span>Discovery Date:</span>
                        {['ALL', 'today', '7d', '30d'].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setDateFilter(d)}
                            className={`rounded px-2 py-0.5 text-xs ${
                              dateFilter === d
                                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {d === 'ALL' ? 'All Time' : d === 'today' ? 'Today' : `Last ${d}`}
                          </button>
                        ))}
                      </div>
                      <span>Showing {skillsData.length} matching skills</span>
                    </div>
                  </div>

                  {/* Explorer Results */}
                  {skillsData.length === 0 ? (
                    <div className="glass-panel rounded-xl p-12 text-center space-y-3">
                      <p className="text-sm font-semibold text-white">
                        No skills match your active filter criteria
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setCategoryFilter('ALL');
                          setAgentFilter('ALL');
                          setRankingFilter('ALL');
                          setSecurityFilter('ALL');
                          setDateFilter('ALL');
                        }}
                        className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {skillsData.map((skill) => (
                        <SkillCard
                          key={skill.id}
                          skill={skill}
                          onSelect={handleSelectSkill}
                          onToggleSave={handleToggleSave}
                          onToggleCompare={handleToggleCompare}
                          isSelectedForCompare={
                            compareIds.includes(skill.slug) || compareIds.includes(skill.id)
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================
                  PAGE 5: SKILL DETAILS
              ========================================================= */}
              {activePage === 'details' && selectedSkill && (
                <SkillDetailView
                  skill={selectedSkill}
                  onBack={() => setActivePage('explorer')}
                  onToggleSave={handleToggleSave}
                  onToggleCompare={handleToggleCompare}
                  onReanalyze={handleReanalyzeSkill}
                  onSelectRelated={handleSelectSkill}
                  isSelectedForCompare={
                    compareIds.includes(selectedSkill.slug) ||
                    compareIds.includes(selectedSkill.id)
                  }
                  isReanalyzing={isReanalyzing}
                />
              )}

              {/* =========================================================
                  PAGE 6: SKILL COMPARISON
              ========================================================= */}
              {activePage === 'comparison' && (
                <div className="space-y-6">
                  {/* Skill Selector Bar */}
                  <div className="glass-panel rounded-xl p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          Multi-Skill Side-by-Side Architecture Comparison
                        </h3>
                        <p className="text-xs text-slate-400">
                          Select 2 to 4 skills to compare weighted dimensions, security posture, dependencies, and installation methods
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {skillsData.map((s) => {
                        const selected =
                          compareIds.includes(s.slug) || compareIds.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => handleToggleCompare(s)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                              selected
                                ? 'border-purple-500 bg-purple-600/25 text-purple-200'
                                : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {selected ? '✓ ' : '+ '}
                            {s.name} ({s.overallScore})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {comparisonResult && comparisonResult.skills?.length >= 2 ? (
                    <>
                      {/* Recommended Winner Banner */}
                      <div className="glass-panel rounded-xl p-5 border-l-4 border-l-emerald-500 flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                            AI Comparison Verdict
                          </span>
                          <h4 className="text-base font-bold text-white">
                            Recommended Choice: {comparisonResult.recommendedChoice.name} (
                            {comparisonResult.recommendedChoice.overallScore}/100 • Tier{' '}
                            {comparisonResult.recommendedChoice.rankingTier})
                          </h4>
                          <p className="text-xs text-slate-300">
                            {comparisonResult.recommendedChoice.rationale}
                          </p>
                        </div>
                      </div>

                      {/* Side-by-Side Matrix Table */}
                      <div className="glass-panel overflow-x-auto rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-300">
                              <th className="p-4 font-semibold">Dimension / Attribute</th>
                              {comparisonResult.skills.map((s: SkillRecord) => (
                                <th key={s.id} className="p-4 font-semibold text-white">
                                  <div className="flex items-center gap-2">
                                    <span>{s.name}</span>
                                    <RankingBadge tier={s.rankingTier} />
                                  </div>
                                  <div className="mt-1 font-mono text-[11px] text-slate-400">
                                    {s.repository.fullName}
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/70">
                            <tr>
                              <td className="p-4 font-semibold text-slate-300">
                                Overall Intelligence Score
                              </td>
                              {comparisonResult.skills.map((s: SkillRecord) => (
                                <td
                                  key={s.id}
                                  className="p-4 font-mono text-base font-bold text-purple-300"
                                >
                                  {s.overallScore} / 100
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="p-4 font-semibold text-slate-300">
                                Security Posture
                              </td>
                              {comparisonResult.skills.map((s: SkillRecord) => (
                                <td key={s.id} className="p-4">
                                  <SecurityBadge status={s.securityStatus} />
                                </td>
                              ))}
                            </tr>
                            {comparisonResult.dimensionComparison.map((dim: any) => (
                              <tr key={dim.key}>
                                <td className="p-4 text-slate-300">{dim.dimension}</td>
                                {comparisonResult.skills.map((s: SkillRecord) => (
                                  <td key={s.id} className="p-4 font-mono text-slate-200">
                                    {dim.scores[s.slug]}/100
                                  </td>
                                ))}
                              </tr>
                            ))}
                            <tr>
                              <td className="p-4 text-slate-300">GitHub Stars / Forks</td>
                              {comparisonResult.skills.map((s: SkillRecord) => (
                                <td key={s.id} className="p-4 text-slate-200">
                                  ★ {s.repository.stars.toLocaleString()} • ⑂{' '}
                                  {s.repository.forks.toLocaleString()}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="p-4 text-slate-300">Supported Agents</td>
                              {comparisonResult.skills.map((s: SkillRecord) => (
                                <td key={s.id} className="p-4 text-slate-200">
                                  {s.supportedAgents.join(', ')}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="p-4 text-slate-300">Verified Install Command</td>
                              {comparisonResult.skills.map((s: SkillRecord) => (
                                <td key={s.id} className="p-4">
                                  <code className="rounded bg-slate-950 px-2 py-1 font-mono text-[11px] text-purple-200">
                                    {s.installCommand}
                                  </code>
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="glass-panel rounded-xl p-10 text-center text-xs text-slate-400">
                      Select at least 2 skills above to generate a live comparison matrix.
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================
                  PAGE 7: AI RECOMMENDATIONS
              ========================================================= */}
              {activePage === 'recommendations' && recommendationsData && (
                <div className="space-y-6">
                  {/* Recommendation Filter Bar */}
                  <div className="glass-panel rounded-xl p-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-slate-400">
                        Specialized Workflow Track
                      </label>
                      <select
                        value={recTrackFilter}
                        onChange={(e) => setRecTrackFilter(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
                      >
                        <option value="ALL">All 8 Recommendation Tracks</option>
                        <option value="coding-agents">Best for Coding Agents</option>
                        <option value="autonomous-agents">Best for Autonomous Agents</option>
                        <option value="browser-automation">Best for Browser Automation</option>
                        <option value="research-agents">Best for Research Agents</option>
                        <option value="devops">Best for DevOps</option>
                        <option value="3d-development">Best for 3D Development</option>
                        <option value="backend-development">Best for Backend Development</option>
                        <option value="security-analysis">Best for Security Analysis</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-slate-400">
                        Target Agent Platform
                      </label>
                      <select
                        value={recAgentFilter}
                        onChange={(e) => setRecAgentFilter(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
                      >
                        <option value="ALL">Any Compatible Agent</option>
                        {agentPlatforms.map((a: any) => (
                          <option key={a.id} value={a.name}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-slate-400">
                        Project Requirement Match
                      </label>
                      <input
                        type="text"
                        value={recRequirement}
                        onChange={(e) => setRecRequirement(e.target.value)}
                        placeholder="e.g. WebGL shaders, Playwright, Prisma, MCP..."
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
                      />
                    </div>
                  </div>

                  {/* All 8 Recommendation Tracks */}
                  <div className="space-y-6">
                    {recommendationsData.tracks.map((track: any) => (
                      <div key={track.id} className="glass-panel rounded-2xl p-6 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                          <div>
                            <h3 className="text-base font-bold text-white">{track.title}</h3>
                            <p className="text-xs text-slate-400">{track.description}</p>
                          </div>
                          <span className="rounded-lg bg-purple-500/10 border border-purple-500/30 px-3 py-1 text-xs text-purple-300">
                            {track.rationale}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          {track.recommendedSkills.map((item: any) => (
                            <div
                              key={item.skill.id}
                              onClick={() => handleSelectSkill(item.skill)}
                              className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-purple-500/40 transition-colors space-y-2.5"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-white">
                                    {item.skill.name}
                                  </span>
                                  <RankingBadge tier={item.skill.rankingTier} />
                                </div>
                                <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 font-mono text-xs font-bold text-emerald-300">
                                  {item.matchScore}% Match
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 line-clamp-2">
                                {item.skill.description}
                              </p>
                              <ul className="space-y-1 text-[11px] text-purple-300/90">
                                {item.matchReasons.map((reason: string, idx: number) => (
                                  <li key={idx}>• {reason}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* =========================================================
                  PAGE 8: SECURITY ANALYSIS
              ========================================================= */}
              {activePage === 'security' && securityOverview && (
                <div className="space-y-6">
                  {/* Top Security Summary Cards */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="glass-panel rounded-xl p-4">
                      <span className="text-xs text-slate-400">Skills Statically Audited</span>
                      <p className="mt-1 text-2xl font-bold text-white">
                        {securityOverview.summary.totalSkillsAudited}
                      </p>
                    </div>
                    <div className="glass-panel rounded-xl p-4">
                      <span className="text-xs text-slate-400">Verified SAFE</span>
                      <p className="mt-1 text-2xl font-bold text-emerald-400">
                        {securityOverview.summary.safeSkillsCount}
                      </p>
                    </div>
                    <div className="glass-panel rounded-xl p-4">
                      <span className="text-xs text-slate-400">Critical Risk</span>
                      <p className="mt-1 text-2xl font-bold text-rose-400">
                        {securityOverview.summary.criticalSkillsCount}
                      </p>
                    </div>
                    <div className="glass-panel rounded-xl p-4">
                      <span className="text-xs text-slate-400">Warnings / Review</span>
                      <p className="mt-1 text-2xl font-bold text-amber-400">
                        {securityOverview.summary.warningSkillsCount +
                          securityOverview.summary.reviewSkillsCount}
                      </p>
                    </div>
                    <div className="glass-panel rounded-xl p-4">
                      <span className="text-xs text-slate-400">Total Rule Findings</span>
                      <p className="mt-1 text-2xl font-bold text-purple-300">
                        {securityOverview.summary.totalFindingsCount}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Findings List */}
                  <div className="glass-panel rounded-2xl p-6 space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Static Security Scanner Findings (Untrusted Manifest Isolation)
                      </h3>
                      <p className="text-xs text-slate-400">
                        Detects suspicious shell commands, credential harvesting, hardcoded API keys, destructive FS operations, unauthorized network exfiltration, obfuscated scripts, prompt injection, and binary executables.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {securityOverview.findings.map((f: any) => (
                        <div
                          key={f.id}
                          className="rounded-xl border border-rose-500/35 bg-rose-950/20 p-4 space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-rose-500/20 px-2 py-0.5 font-mono text-xs font-bold text-rose-300">
                                {f.severity} • {f.ruleId} ({f.category})
                              </span>
                              <span className="text-xs font-bold text-white">
                                {f.skillName} ({f.repoFullName})
                              </span>
                            </div>
                            <EvidenceBadge type={f.evidenceType} />
                          </div>
                          <p className="text-xs text-slate-200">{f.description}</p>
                          {f.snippet && (
                            <div className="rounded bg-slate-950 p-2.5 font-mono text-xs text-rose-200 border border-rose-500/20">
                              {f.filePath}:{f.lineNumber || 1} → <code>{f.snippet}</code>
                            </div>
                          )}
                          <p className="text-xs text-emerald-300">
                            <strong>Remediation:</strong> {f.remediation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  PAGE 9: REPOSITORY EXPLORER
              ========================================================= */}
              {activePage === 'repositories' && repositoriesData && (
                <div className="space-y-6">
                  {/* Dynamic GitHub Repo Discovery Bar */}
                  <div className="glass-panel rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Dynamic GitHub Repository Skill Scanner
                      </h3>
                      <p className="text-xs text-slate-400">
                        Discover and index any compatible GitHub repository beyond the predefined list
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customRepoScanInput}
                        onChange={(e) => setCustomRepoScanInput(e.target.value)}
                        placeholder="owner/repository (e.g. modelcontextprotocol/servers)"
                        className="w-80 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
                      />
                      <button
                        type="button"
                        disabled={isScanning || !customRepoScanInput.includes('/')}
                        onClick={() => handleTriggerScan('MANUAL', customRepoScanInput)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
                      >
                        <Play className="h-3.5 w-3.5" />
                        Scan Repository
                      </button>
                    </div>
                  </div>

                  {/* Repositories Grid */}
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {repositoriesData.repositories.map((repo: any) => (
                      <div key={repo.fullName} className="glass-panel rounded-xl p-5 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <a
                              href={repo.htmlUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-base font-bold text-white hover:text-purple-300"
                            >
                              {repo.fullName}
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                            <p className="mt-1 text-xs text-slate-300">{repo.description}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono text-sm font-bold text-purple-300">
                              Avg {repo.averageSkillScore}/100
                            </span>
                            <span className="block text-[11px] text-slate-400">
                              {repo.skillCount} indexed skill(s)
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                          <span className="inline-flex items-center gap-1 text-amber-300">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {repo.stars.toLocaleString()} stars
                          </span>
                          <span> Forks: {repo.forks.toLocaleString()}</span>
                          <span>Language: {repo.language}</span>
                          <span>License: {repo.license}</span>
                        </div>

                        <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Discovered Skills in Repository:
                          </span>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {repo.skills.map((s: any) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => handleSelectSkill(s)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 hover:border-purple-500/50"
                              >
                                <span>{s.name}</span>
                                <span className="font-mono text-purple-300">({s.overallScore})</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* =========================================================
                  PAGE 10: SAVED SKILLS
              ========================================================= */}
              {activePage === 'saved' && (
                <div className="space-y-6">
                  {savedSkillsData.length === 0 ? (
                    <div className="glass-panel rounded-xl p-12 text-center space-y-3">
                      <Bookmark className="mx-auto h-8 w-8 text-purple-400" />
                      <h3 className="text-base font-bold text-white">No Saved Skills Yet</h3>
                      <p className="text-xs text-slate-400">
                        Bookmark skills from the Skill Explorer or Overview Dashboard to build your production agent stack.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActivePage('explorer')}
                        className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white"
                      >
                        Browse Skill Explorer
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {savedSkillsData.map((entry: any) => (
                        <SkillCard
                          key={entry.id}
                          skill={entry.skill}
                          onSelect={handleSelectSkill}
                          onToggleSave={handleToggleSave}
                          onToggleCompare={handleToggleCompare}
                          isSelectedForCompare={
                            compareIds.includes(entry.skill.slug) ||
                            compareIds.includes(entry.skill.id)
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================
                  PAGE 11: SCAN HISTORY
              ========================================================= */}
              {activePage === 'history' && historyData && (
                <div className="space-y-6">
                  <div className="glass-panel rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        13-Step Daily Discovery Engine Execution History
                      </h3>
                      <p className="text-xs text-slate-400">
                        Complete audit trail of scheduled, manual, and incremental discovery scans with rate-limit telemetry
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isScanning}
                        onClick={() => handleTriggerScan('INCREMENTAL')}
                        className="rounded-lg border border-purple-500/40 bg-purple-500/15 px-3.5 py-2 text-xs font-semibold text-purple-200 hover:bg-purple-500/25"
                      >
                        Trigger Incremental Scan
                      </button>
                      <button
                        type="button"
                        disabled={isScanning}
                        onClick={() => handleTriggerScan('MANUAL')}
                        className="rounded-lg bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-purple-500"
                      >
                        Trigger Full Scan
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {historyData.scans.map((scan: any) => (
                      <div key={scan.id} className="glass-panel rounded-xl p-5 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                              {scan.status}
                            </span>
                            <span className="font-mono text-xs font-bold text-white">
                              {scan.id}
                            </span>
                            <span className="text-xs text-slate-400">
                              ({scan.triggerType} • {scan.sourceName})
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">
                            Started {new Date(scan.startedAt).toLocaleString()} • Duration:{' '}
                            {scan.durationMs}ms
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 text-xs">
                          <div className="rounded-lg bg-slate-900/70 p-2.5">
                            <span className="text-slate-400 block">Repos Scanned</span>
                            <span className="font-bold text-white">{scan.repositoriesScanned}</span>
                          </div>
                          <div className="rounded-lg bg-slate-900/70 p-2.5">
                            <span className="text-slate-400 block">Manifests Found</span>
                            <span className="font-bold text-purple-300">
                              {scan.manifestsDiscovered}
                            </span>
                          </div>
                          <div className="rounded-lg bg-slate-900/70 p-2.5">
                            <span className="text-slate-400 block">New Skills</span>
                            <span className="font-bold text-emerald-300">+{scan.newSkillsFound}</span>
                          </div>
                          <div className="rounded-lg bg-slate-900/70 p-2.5">
                            <span className="text-slate-400 block">Updated Skills</span>
                            <span className="font-bold text-blue-300">
                              {scan.updatedSkillsCount}
                            </span>
                          </div>
                          <div className="rounded-lg bg-slate-900/70 p-2.5">
                            <span className="text-slate-400 block">Security Warnings</span>
                            <span className="font-bold text-rose-300">{scan.securityWarnings}</span>
                          </div>
                        </div>

                        {scan.logs && scan.logs.length > 0 && (
                          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-300 space-y-1">
                            {scan.logs.map((line: string, i: number) => (
                              <div key={i}>{line}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* =========================================================
                  PAGE 12: SETTINGS
              ========================================================= */}
              {activePage === 'settings' && settingsData && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* AI & Discovery Configuration */}
                  <div className="glass-panel rounded-xl p-6 space-y-4">
                    <h3 className="text-base font-bold text-white">
                      AI Analyzer & Scheduled Discovery Configuration
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="mb-1 block text-slate-300">
                          Configurable LLM Provider
                        </label>
                        <select
                          value={settingsData.settings.llmProvider}
                          onChange={(e) =>
                            setSettingsData({
                              ...settingsData,
                              settings: {
                                ...settingsData.settings,
                                llmProvider: e.target.value,
                              },
                            })
                          }
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200"
                        >
                          <option value="heuristic">
                            Deterministic Verified AST/Markdown Engine (Zero-Latency)
                          </option>
                          <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                          <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                          <option value="gemini">Google Gemini</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-slate-300">LLM Model Identifier</label>
                        <input
                          type="text"
                          value={settingsData.settings.llmModel}
                          onChange={(e) =>
                            setSettingsData({
                              ...settingsData,
                              settings: {
                                ...settingsData.settings,
                                llmModel: e.target.value,
                              },
                            })
                          }
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-slate-300">
                          Scheduled Daily Discovery Cron Expression
                        </label>
                        <input
                          type="text"
                          value={settingsData.settings.discoveryCron}
                          onChange={(e) =>
                            setSettingsData({
                              ...settingsData,
                              settings: {
                                ...settingsData.settings,
                                discoveryCron: e.target.value,
                              },
                            })
                          }
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-slate-300">
                          API Rate-Limit Delay Between Requests (ms)
                        </label>
                        <input
                          type="number"
                          value={settingsData.settings.rateLimitMs}
                          onChange={(e) =>
                            setSettingsData({
                              ...settingsData,
                              settings: {
                                ...settingsData.settings,
                                rateLimitMs: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          await radarApi.updateSettings(settingsData.settings);
                          showToast('Platform settings saved successfully.');
                        }}
                        className="rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-500"
                      >
                        Save Configuration
                      </button>
                    </div>
                  </div>

                  {/* Configured Discovery Sources */}
                  <div className="glass-panel rounded-xl p-6 space-y-4">
                    <h3 className="text-base font-bold text-white">
                      Active Discovery Sources & Registries
                    </h3>
                    <div className="space-y-2.5">
                      {settingsData.sources.map((src: any) => (
                        <div
                          key={src.id}
                          className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 p-3 text-xs"
                        >
                          <div>
                            <p className="font-semibold text-white">{src.name}</p>
                            <p className="font-mono text-[11px] text-slate-400">{src.url}</p>
                          </div>
                          <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                            {src.scanFrequency}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Add New Source */}
                    <div className="border-t border-slate-800 pt-4 space-y-2.5 text-xs">
                      <h4 className="font-semibold text-slate-200">
                        Add Custom Skill Repository or Registry Source
                      </h4>
                      <input
                        type="text"
                        placeholder="Source Name (e.g. MCP Community Skills)"
                        value={newSourceName}
                        onChange={(e) => setNewSourceName(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200"
                      />
                      <input
                        type="text"
                        placeholder="Repository or Registry URL (e.g. https://github.com/owner/repo)"
                        value={newSourceUrl}
                        onChange={(e) => setNewSourceUrl(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!newSourceName || !newSourceUrl) return;
                          await radarApi.addDiscoverySource({
                            name: newSourceName,
                            url: newSourceUrl,
                          });
                          setNewSourceName('');
                          setNewSourceUrl('');
                          showToast('Added new discovery source.');
                          await loadAllPlatformData();
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-600/20 px-3.5 py-2 font-semibold text-purple-200 hover:bg-purple-600/30"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Discovery Source
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
