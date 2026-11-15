export interface SkillRecord {
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
  rankingTier: 'S' | 'A' | 'B' | 'C' | 'D';
  scoreBreakdown: {
    technicalCapability: number;
    innovationAndComplexity: number;
    communityAdoption: number;
    maintenanceAndUpdates: number;
    documentationQuality: number;
    securityAndReliability: number;
    overallScore: number;
    rankingTier: 'S' | 'A' | 'B' | 'C' | 'D';
  };
  securityStatus: 'SAFE' | 'REVIEW' | 'WARNING' | 'CRITICAL';
  isDuplicate: boolean;
  canonicalSkillId: string | null;
  verifiedEvidence: string[];
  aiInferredAnalysis: string[];
  capabilities: Array<{
    statement: string;
    evidenceType: 'VERIFIED_EVIDENCE' | 'AI_INFERENCE';
    sourceRef?: string;
  }>;
  dependencies: string[];
  supportedAgents: string[];
  useCases: string[];
  strengths: Array<{
    statement: string;
    evidenceType: 'VERIFIED_EVIDENCE' | 'AI_INFERENCE';
    sourceRef?: string;
  }>;
  weaknesses: Array<{
    statement: string;
    evidenceType: 'VERIFIED_EVIDENCE' | 'AI_INFERENCE';
    sourceRef?: string;
  }>;
  securityFindings: Array<{
    id: string;
    ruleId: string;
    category: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    description: string;
    filePath: string;
    lineNumber?: number;
    snippet?: string;
    evidenceType: string;
    remediation: string;
  }>;
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
  isSaved?: boolean;
  relatedSkills?: SkillRecord[];
  trendingRank?: number;
  momentumIndex?: number;
}

const API_BASE =
  typeof window !== 'undefined'
    ? '/backend-api'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(errText || `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const radarApi = {
  getDashboard: (range = '30d', startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({ range });
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    return request<any>(`/dashboard?${params.toString()}`);
  },
  getSkills: (params: Record<string, string | undefined> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v && v !== 'ALL') qs.set(k, v);
    });
    return request<{
      data: SkillRecord[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
      filters: { categories: any[]; agentPlatforms: any[] };
    }>(`/skills?${qs.toString()}`);
  },
  getTrendingSkills: () => request<{ generatedAt: string; data: SkillRecord[] }>('/skills/trending'),
  getDailySkills: () =>
    request<{ date: string; latestReport: any; data: SkillRecord[] }>('/skills/daily'),
  getSkillRanking: () => request<any>('/skills/ranking'),
  getSkillById: (id: string) => request<SkillRecord>(`/skills/${encodeURIComponent(id)}`),
  reanalyzeSkill: (id: string, customSkillMdContent?: string) =>
    request<SkillRecord>(`/skills/${encodeURIComponent(id)}/analyze`, {
      method: 'POST',
      body: JSON.stringify({ customSkillMdContent }),
    }),
  compareSkills: (skillIds: string[]) =>
    request<any>('/skills/compare', {
      method: 'POST',
      body: JSON.stringify({ skillIds }),
    }),
  triggerScan: (payload?: {
    triggerType?: 'MANUAL' | 'INCREMENTAL';
    sourceSlug?: string;
    customRepoFullName?: string;
  }) =>
    request<any>('/discovery/scan', {
      method: 'POST',
      body: JSON.stringify(payload || { triggerType: 'MANUAL' }),
    }),
  getDiscoveryHistory: () => request<{ sources: any[]; scans: any[] }>('/discovery/history'),
  addDiscoverySource: (payload: {
    name: string;
    url: string;
    sourceType?: string;
    owner?: string;
    repo?: string;
  }) =>
    request<any>('/discovery/sources', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getRecommendations: (params?: { track?: string; agent?: string; requirement?: string }) => {
    const qs = new URLSearchParams();
    if (params?.track && params.track !== 'ALL') qs.set('track', params.track);
    if (params?.agent && params.agent !== 'ALL') qs.set('agent', params.agent);
    if (params?.requirement) qs.set('requirement', params.requirement);
    return request<any>(`/recommendations?${qs.toString()}`);
  },
  getDailyReports: () => request<any>('/reports/daily'),
  getRepositories: () => request<{ repositories: any[]; sources: any[] }>('/repositories'),
  getSecurityOverview: () => request<any>('/security/overview'),
  getSavedSkills: () => request<{ total: number; items: any[] }>('/saved-skills'),
  saveSkill: (skillId: string, folder?: string, notes?: string) =>
    request<any>('/saved-skills', {
      method: 'POST',
      body: JSON.stringify({ skillId, folder, notes }),
    }),
  removeSavedSkill: (skillId: string) =>
    request<any>(`/saved-skills/${encodeURIComponent(skillId)}`, {
      method: 'DELETE',
    }),
  getSettings: () => request<any>('/settings'),
  updateSettings: (settings: any) =>
    request<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
};
