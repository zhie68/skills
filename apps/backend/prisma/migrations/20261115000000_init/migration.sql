-- CreateTable: Initial Normalized Schema for Agent Skill Radar (14 Models)

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ARCHITECT',
    "preferences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DiscoverySource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "owner" TEXT,
    "repo" TEXT,
    "searchQuery" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "scanFrequency" TEXT NOT NULL DEFAULT 'DAILY',
    "lastScannedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DiscoverySource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "htmlUrl" TEXT NOT NULL,
    "description" TEXT,
    "defaultBranch" TEXT NOT NULL DEFAULT 'main',
    "stars" INTEGER NOT NULL DEFAULT 0,
    "forks" INTEGER NOT NULL DEFAULT 0,
    "openIssues" INTEGER NOT NULL DEFAULT 0,
    "watchers" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT,
    "license" TEXT,
    "topics" TEXT[],
    "lastPushedAt" TIMESTAMP(3),
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SkillCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SkillCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentPlatform" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "vendor" TEXT,
    "websiteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AgentPlatform_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "technicalSummary" TEXT,
    "repositoryId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "manifestPath" TEXT NOT NULL DEFAULT 'SKILL.md',
    "skillMdContent" TEXT NOT NULL,
    "installCommand" TEXT NOT NULL,
    "installMethod" TEXT NOT NULL DEFAULT 'npx skills add',
    "installSourceDoc" TEXT NOT NULL DEFAULT 'SKILL.md',
    "installVerified" BOOLEAN NOT NULL DEFAULT true,
    "currentVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "overallScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rankingTier" TEXT NOT NULL DEFAULT 'C',
    "securityStatus" TEXT NOT NULL DEFAULT 'SAFE',
    "isDuplicate" BOOLEAN NOT NULL DEFAULT false,
    "canonicalSkillId" TEXT,
    "verifiedEvidence" JSONB NOT NULL,
    "aiInferredAnalysis" JSONB NOT NULL,
    "capabilities" JSONB NOT NULL,
    "dependencies" TEXT[],
    "useCases" TEXT[],
    "strengths" JSONB NOT NULL,
    "weaknesses" JSONB NOT NULL,
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAnalyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SkillVersion" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "commitSha" TEXT,
    "changelog" TEXT,
    "contentHash" TEXT NOT NULL,
    "releasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SkillVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SkillCompatibility" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "agentPlatformId" TEXT NOT NULL,
    "supportLevel" TEXT NOT NULL DEFAULT 'NATIVE',
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SkillCompatibility_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SkillScore" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "technicalCapability" DOUBLE PRECISION NOT NULL,
    "innovationAndComplexity" DOUBLE PRECISION NOT NULL,
    "communityAdoption" DOUBLE PRECISION NOT NULL,
    "maintenanceAndUpdates" DOUBLE PRECISION NOT NULL,
    "documentationQuality" DOUBLE PRECISION NOT NULL,
    "securityAndReliability" DOUBLE PRECISION NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "rankingTier" TEXT NOT NULL,
    "llmProvider" TEXT NOT NULL DEFAULT 'heuristic',
    "rationale" JSONB,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SkillScore_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SecurityFinding" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "lineNumber" INTEGER,
    "snippet" TEXT,
    "evidenceType" TEXT NOT NULL DEFAULT 'VERIFIED_EVIDENCE',
    "remediation" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SecurityFinding_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DiscoveryScan" (
    "id" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL DEFAULT 'MANUAL',
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "sourceId" TEXT,
    "repositoriesScanned" INTEGER NOT NULL DEFAULT 0,
    "manifestsDiscovered" INTEGER NOT NULL DEFAULT 0,
    "newSkillsFound" INTEGER NOT NULL DEFAULT 0,
    "updatedSkillsCount" INTEGER NOT NULL DEFAULT 0,
    "duplicatesDetected" INTEGER NOT NULL DEFAULT 0,
    "securityWarnings" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "logs" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    CONSTRAINT "DiscoveryScan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ScanJob" (
    "id" TEXT NOT NULL,
    "discoveryScanId" TEXT NOT NULL,
    "targetSource" TEXT NOT NULL,
    "jobType" TEXT NOT NULL DEFAULT 'REPO_DISCOVERY',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 1,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "rateLimitRemaining" INTEGER,
    "errorLog" TEXT,
    "resultSummary" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    CONSTRAINT "ScanJob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SavedSkill" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "notes" TEXT,
    "folder" TEXT NOT NULL DEFAULT 'Default',
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedSkill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DailyReport" (
    "id" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "totalSkillsTracked" INTEGER NOT NULL,
    "newSkillsDiscovered" INTEGER NOT NULL,
    "updatedSkills" INTEGER NOT NULL,
    "securityAlertsCount" INTEGER NOT NULL,
    "averageScore" DOUBLE PRECISION NOT NULL,
    "topSkillIds" TEXT[],
    "trendingSkillIds" TEXT[],
    "categoryBreakdown" JSONB NOT NULL,
    "executiveSummary" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyReport_pkey" PRIMARY KEY ("id")
);

-- Unique Indexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "DiscoverySource_slug_key" ON "DiscoverySource"("slug");
CREATE UNIQUE INDEX "Repository_fullName_key" ON "Repository"("fullName");
CREATE UNIQUE INDEX "Repository_owner_name_key" ON "Repository"("owner", "name");
CREATE UNIQUE INDEX "SkillCategory_name_key" ON "SkillCategory"("name");
CREATE UNIQUE INDEX "SkillCategory_slug_key" ON "SkillCategory"("slug");
CREATE UNIQUE INDEX "AgentPlatform_name_key" ON "AgentPlatform"("name");
CREATE UNIQUE INDEX "AgentPlatform_slug_key" ON "AgentPlatform"("slug");
CREATE UNIQUE INDEX "Skill_slug_key" ON "Skill"("slug");
CREATE UNIQUE INDEX "Skill_repositoryId_manifestPath_key" ON "Skill"("repositoryId", "manifestPath");
CREATE UNIQUE INDEX "SkillVersion_skillId_version_key" ON "SkillVersion"("skillId", "version");
CREATE UNIQUE INDEX "SkillCompatibility_skillId_agentPlatformId_key" ON "SkillCompatibility"("skillId", "agentPlatformId");
CREATE UNIQUE INDEX "SavedSkill_userId_skillId_key" ON "SavedSkill"("userId", "skillId");
CREATE UNIQUE INDEX "DailyReport_reportDate_key" ON "DailyReport"("reportDate");

-- Foreign Keys
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DiscoverySource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SkillCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SkillVersion" ADD CONSTRAINT "SkillVersion_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SkillCompatibility" ADD CONSTRAINT "SkillCompatibility_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SkillCompatibility" ADD CONSTRAINT "SkillCompatibility_agentPlatformId_fkey" FOREIGN KEY ("agentPlatformId") REFERENCES "AgentPlatform"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SkillScore" ADD CONSTRAINT "SkillScore_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SecurityFinding" ADD CONSTRAINT "SecurityFinding_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DiscoveryScan" ADD CONSTRAINT "DiscoveryScan_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DiscoverySource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ScanJob" ADD CONSTRAINT "ScanJob_discoveryScanId_fkey" FOREIGN KEY ("discoveryScanId") REFERENCES "DiscoveryScan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SavedSkill" ADD CONSTRAINT "SavedSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SavedSkill" ADD CONSTRAINT "SavedSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
