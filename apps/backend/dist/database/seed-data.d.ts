export interface SeedSkillDefinition {
    slug: string;
    name: string;
    description: string;
    categorySlug: string;
    repoFullName: string;
    repoUrl: string;
    repoDescription: string;
    stars: number;
    forks: number;
    openIssues: number;
    watchers: number;
    language: string;
    license: string;
    topics: string[];
    lastPushedAt: string;
    sourceSlug: string;
    manifestPath: string;
    currentVersion: string;
    discoveredDaysAgo: number;
    skillMdContent: string;
    additionalFiles?: string[];
}
export declare const INITIAL_DISCOVERY_SOURCES: ({
    id: string;
    name: string;
    slug: string;
    sourceType: string;
    url: string;
    owner: string;
    repo: string;
    searchQuery: null;
    enabled: boolean;
    scanFrequency: string;
} | {
    id: string;
    name: string;
    slug: string;
    sourceType: string;
    url: string;
    owner: string;
    repo: string;
    searchQuery: string;
    enabled: boolean;
    scanFrequency: string;
} | {
    id: string;
    name: string;
    slug: string;
    sourceType: string;
    url: string;
    owner: null;
    repo: null;
    searchQuery: string;
    enabled: boolean;
    scanFrequency: string;
})[];
export declare const INITIAL_CATEGORIES: {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    color: string;
}[];
export declare const INITIAL_AGENT_PLATFORMS: {
    id: string;
    name: string;
    slug: string;
    vendor: string;
    websiteUrl: string;
}[];
export declare const INITIAL_SKILLS_SEED: SeedSkillDefinition[];
