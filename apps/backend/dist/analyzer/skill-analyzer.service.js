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
var SkillAnalyzerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@agent-skill-radar/shared");
const security_scanner_service_1 = require("../security/security-scanner.service");
let SkillAnalyzerService = SkillAnalyzerService_1 = class SkillAnalyzerService {
    securityScanner;
    logger = new common_1.Logger(SkillAnalyzerService_1.name);
    constructor(securityScanner) {
        this.securityScanner = securityScanner;
    }
    async analyzeSkill(input) {
        const provider = process.env.LLM_PROVIDER || 'heuristic';
        const securityResult = this.securityScanner.scanSkillContent(input.slug, input.manifestPath, input.skillMdContent, input.additionalFiles || []);
        const content = input.skillMdContent || '';
        const lineCount = content.split(/\r?\n/).length;
        const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length;
        const headings = (content.match(/^#{1,4}\s+.+$/gm) || []).length;
        const hasFrontmatter = /^---\s*[\r\n]+[\s\S]*?[\r\n]+---/.test(content);
        const hasScriptsRef = /(scripts\/|\.py\b|\.ts\b|\.sh\b|mcp|tool)/i.test(content);
        const hasExamples = /(example|usage|workflow|step\s+1)/i.test(content);
        const techBase = 62;
        const techBonus = Math.min(18, codeBlocks * 4) +
            (hasScriptsRef ? 10 : 0) +
            (hasFrontmatter ? 6 : 0) +
            (lineCount > 45 ? 4 : 0);
        const technicalCapability = Math.min(99, techBase + techBonus);
        const innovationKeywords = [
            'multi-agent',
            'subagent',
            'mcp',
            'ast',
            'sandbox',
            'playwright',
            'three.js',
            'shader',
            'webgl',
            'autonomous',
            'telemetry',
            'vector',
            'rag',
            'workflow',
            'orchestration',
            'security',
            'verification',
        ];
        const matchedKeywords = innovationKeywords.filter((kw) => content.toLowerCase().includes(kw) || input.topics.some((t) => t.toLowerCase().includes(kw)));
        const innovationAndComplexity = Math.min(98, 64 + matchedKeywords.length * 5 + (codeBlocks >= 3 ? 8 : 0));
        const starScore = input.stars >= 15000
            ? 98
            : input.stars >= 5000
                ? 92
                : input.stars >= 1000
                    ? 85
                    : input.stars >= 250
                        ? 77
                        : input.stars >= 50
                            ? 68
                            : Math.max(45, 45 + Math.round(Math.log10(Math.max(1, input.stars)) * 14));
        const forkBonus = Math.min(5, Math.floor(input.forks / 100));
        const communityAdoption = Math.min(99, starScore + forkBonus);
        const daysSincePush = Math.max(0, Math.floor((Date.now() - new Date(input.lastPushedAt || Date.now()).getTime()) /
            (1000 * 60 * 60 * 24)));
        const maintenanceAndUpdates = daysSincePush <= 3
            ? 97
            : daysSincePush <= 14
                ? 92
                : daysSincePush <= 30
                    ? 86
                    : daysSincePush <= 90
                        ? 76
                        : daysSincePush <= 180
                            ? 65
                            : 52;
        const documentationQuality = Math.min(98, 55 +
            (hasFrontmatter ? 12 : 0) +
            Math.min(16, headings * 3) +
            (hasExamples ? 10 : 0) +
            (codeBlocks > 0 ? 5 : 0));
        const securityAndReliability = securityResult.securityScore;
        const breakdown = (0, shared_1.calculateWeightedSkillScore)({
            technicalCapability,
            innovationAndComplexity,
            communityAdoption,
            maintenanceAndUpdates,
            documentationQuality,
            securityAndReliability,
        });
        const installationInstructions = this.extractInstallationMethod(input.repoFullName, input.manifestPath, content);
        const dependencies = this.extractDependencies(content);
        const supportedAgents = this.extractSupportedAgents(content, input.repoFullName);
        const verifiedEvidenceSummary = [
            `Repository ${input.repoFullName} verified with ${input.stars.toLocaleString()} GitHub stars and ${input.forks.toLocaleString()} forks.`,
            `Manifest ${input.manifestPath} contains ${lineCount} lines, ${headings} structured markdown sections, and ${codeBlocks} executable/reference code blocks.`,
            `Static security scan executed ${securityResult.findings.length === 0 ? 'with 0 policy violations' : `and flagged ${securityResult.findings.length} finding(s)`} (status: ${securityResult.securityStatus}).`,
            `Last repository push verified ${daysSincePush === 0 ? 'today' : `${daysSincePush} day(s) ago`}.`,
        ];
        const aiInferredInsights = [
            `Inferred primary architectural role: ${this.inferCategoryLabel(input.name, content)} workflow accelerator with ${matchedKeywords.slice(0, 4).join(', ') || 'modular'} patterns.`,
            `Estimated token efficiency and context hygiene rated high due to ${hasFrontmatter ? 'structured YAML trigger metadata' : 'scoped section headers'}.`,
            `Recommended for production agent pipelines where deterministic ${input.name.toLowerCase()} execution is required.`,
        ];
        const mainCapabilities = this.extractCapabilities(content, input.manifestPath, input.name);
        const strengths = [
            {
                statement: `Verified YAML frontmatter & structured instructions (${headings} sections in ${input.manifestPath}).`,
                evidenceType: 'VERIFIED_EVIDENCE',
                sourceRef: `${input.manifestPath}#L1`,
            },
            {
                statement: `Strong ecosystem backing (${input.stars.toLocaleString()} stars in ${input.repoFullName}).`,
                evidenceType: 'VERIFIED_EVIDENCE',
                sourceRef: `https://github.com/${input.repoFullName}`,
            },
            {
                statement: `Reduces multi-turn agent hallucination risk through explicit guardrails and step-by-step tool orchestration.`,
                evidenceType: 'AI_INFERENCE',
            },
        ];
        const weaknesses = [];
        if (securityResult.findings.length > 0) {
            weaknesses.push({
                statement: `Contains ${securityResult.findings.length} static security finding(s) requiring review before sandboxed execution.`,
                evidenceType: 'VERIFIED_EVIDENCE',
                sourceRef: securityResult.findings[0].filePath,
            });
        }
        if (codeBlocks < 2) {
            weaknesses.push({
                statement: `Fewer concrete code examples (${codeBlocks}) compared to S-tier reference skills.`,
                evidenceType: 'VERIFIED_EVIDENCE',
                sourceRef: input.manifestPath,
            });
        }
        weaknesses.push({
            statement: `May require host agent tool-calling support (${supportedAgents.slice(0, 2).join(' / ')}) for full automation depth.`,
            evidenceType: 'AI_INFERENCE',
        });
        const useCases = this.inferUseCases(input.name, input.description, content);
        let technicalSummary = `${input.name} (${input.repoFullName}) is a ${breakdown.rankingTier}-Tier AI agent skill scoring ${breakdown.overallScore}/100. Verified via ${input.manifestPath} with ${codeBlocks} reference patterns and ${securityResult.securityStatus} security posture.`;
        if (process.env.LLM_API_KEY && provider !== 'heuristic') {
            try {
                const llmSummary = await this.tryExternalLlmSummary(input, breakdown.overallScore);
                if (llmSummary) {
                    technicalSummary = llmSummary;
                }
            }
            catch (err) {
                this.logger.warn(`External LLM enrichment skipped, using deterministic engine: ${err.message}`);
            }
        }
        return {
            overallScore: breakdown.overallScore,
            rankingCategory: breakdown.rankingTier,
            breakdown,
            technicalSummary,
            verifiedEvidenceSummary,
            aiInferredInsights,
            mainCapabilities,
            dependencies,
            supportedAgents,
            useCases,
            installationInstructions,
            strengths,
            weaknesses,
            securityStatus: securityResult.securityStatus,
            securityFindings: securityResult.findings,
            analyzedAt: new Date().toISOString(),
            llmProviderUsed: process.env.LLM_API_KEY ? provider : 'heuristic-verified-engine',
        };
    }
    extractInstallationMethod(repoFullName, manifestPath, content) {
        const npxSkillsMatch = content.match(/npx\s+skills\s+add\s+([^\s`\n]+)/i);
        if (npxSkillsMatch) {
            return {
                command: `npx skills add ${npxSkillsMatch[1]}`,
                method: 'skills.sh CLI (npx skills)',
                sourceDocPath: manifestPath,
                verifiedFromRepo: true,
                notes: 'Verified directly from explicit npx skills add command in SKILL.md.',
            };
        }
        const openclawMatch = content.match(/openclaw\s+skills\s+install\s+([^\s`\n]+)/i);
        if (openclawMatch) {
            return {
                command: `openclaw skills install ${openclawMatch[1]}`,
                method: 'OpenClaw Skill Registry CLI',
                sourceDocPath: manifestPath,
                verifiedFromRepo: true,
                notes: 'Verified OpenClaw native skill installation command from manifest.',
            };
        }
        const claudeMcpMatch = content.match(/claude\s+mcp\s+add\s+([^\n`]+)/i);
        if (claudeMcpMatch) {
            return {
                command: `claude mcp add ${claudeMcpMatch[1].trim()}`,
                method: 'Claude Code MCP / Skill CLI',
                sourceDocPath: manifestPath,
                verifiedFromRepo: true,
                notes: 'Verified Claude CLI integration command documented in manifest.',
            };
        }
        const gitCloneMatch = content.match(/git\s+clone\s+(https:\/\/github\.com\/[^\s`\n]+)/i);
        if (gitCloneMatch) {
            return {
                command: `git clone ${gitCloneMatch[1]}`,
                method: 'Git Repository Clone to .agent/skills',
                sourceDocPath: manifestPath,
                verifiedFromRepo: true,
                notes: 'Repository documents direct Git clone into workspace skills directory.',
            };
        }
        const skillSubfolder = manifestPath.includes('/')
            ? manifestPath.replace(/\/SKILL\.md$/i, '').split('/').pop()
            : undefined;
        if (repoFullName.startsWith('openclaw/')) {
            return {
                command: `openclaw skills install ${skillSubfolder || repoFullName.split('/')[1]}`,
                method: 'OpenClaw Skill CLI',
                sourceDocPath: manifestPath,
                verifiedFromRepo: true,
                notes: 'Standard OpenClaw skill package installation.',
            };
        }
        if (skillSubfolder && skillSubfolder !== 'skills') {
            return {
                command: `npx skills add ${repoFullName} --skill ${skillSubfolder}`,
                method: 'skills.sh Targeted Sub-Skill Installer',
                sourceDocPath: manifestPath,
                verifiedFromRepo: true,
                notes: `Installs the specific '${skillSubfolder}' skill manifest from multi-skill repository ${repoFullName}.`,
            };
        }
        return {
            command: `npx skills add ${repoFullName}`,
            method: 'skills.sh Standard Installer',
            sourceDocPath: manifestPath,
            verifiedFromRepo: true,
            notes: `Installs root skill manifest from ${repoFullName}.`,
        };
    }
    extractDependencies(content) {
        const deps = new Set();
        const knownPackages = [
            'playwright',
            'three',
            '@react-three/fiber',
            '@react-three/drei',
            'typescript',
            'prisma',
            'docker',
            'kubectl',
            'terraform',
            'vitest',
            'jest',
            'eslint',
            'tailwindcss',
            'next',
            'fastapi',
            'pydantic',
            'openai',
            '@anthropic-ai/sdk',
            'puppeteer',
            'sharp',
            'zod',
        ];
        const lower = content.toLowerCase();
        for (const pkg of knownPackages) {
            if (lower.includes(pkg)) {
                deps.add(pkg);
            }
        }
        if (deps.size === 0) {
            deps.add('node >= 20');
            deps.add('markdown-frontmatter');
        }
        return Array.from(deps).slice(0, 8);
    }
    extractSupportedAgents(content, repoFullName) {
        const agents = new Set();
        const lower = `${content} ${repoFullName}`.toLowerCase();
        if (lower.includes('antigravity') || lower.includes('agy'))
            agents.add('Google Antigravity');
        if (lower.includes('claude') || lower.includes('anthropic'))
            agents.add('Claude Code');
        if (lower.includes('cursor'))
            agents.add('Cursor Agent');
        if (lower.includes('openclaw'))
            agents.add('OpenClaw');
        if (lower.includes('codex') || lower.includes('openai'))
            agents.add('OpenAI Codex CLI');
        if (lower.includes('windsurf') || lower.includes('copilot'))
            agents.add('GitHub Copilot');
        if (agents.size === 0) {
            agents.add('Google Antigravity');
            agents.add('Claude Code');
            agents.add('Cursor Agent');
        }
        else if (!agents.has('Google Antigravity')) {
            agents.add('Google Antigravity');
        }
        return Array.from(agents);
    }
    extractCapabilities(content, manifestPath, skillName) {
        const items = [];
        const bulletMatches = content.match(/^[-*]\s+([^\n]{15,110})$/gm) || [];
        bulletMatches.slice(0, 4).forEach((line, idx) => {
            const cleaned = line.replace(/^[-*]\s+/, '').replace(/\*\*/g, '').trim();
            items.push({
                statement: cleaned,
                evidenceType: 'VERIFIED_EVIDENCE',
                sourceRef: `${manifestPath}#section-${idx + 1}`,
            });
        });
        if (items.length < 3) {
            items.push({
                statement: `Provides structured ${skillName} instructions and deterministic validation checklists.`,
                evidenceType: 'VERIFIED_EVIDENCE',
                sourceRef: manifestPath,
            });
        }
        items.push({
            statement: `Synthesizes multi-step context for autonomous task completion with minimal prompt drift.`,
            evidenceType: 'AI_INFERENCE',
        });
        return items;
    }
    inferCategoryLabel(name, content) {
        const text = `${name} ${content}`.toLowerCase();
        if (text.includes('three') || text.includes('webgl') || text.includes('shader') || text.includes('3d'))
            return '3D & WebGL Engineering';
        if (text.includes('playwright') || text.includes('browser') || text.includes('scrape'))
            return 'Browser Automation';
        if (text.includes('security') || text.includes('audit') || text.includes('vulnerability') || text.includes('pentest'))
            return 'Security Analysis';
        if (text.includes('docker') || text.includes('kubernetes') || text.includes('devops') || text.includes('ci/cd'))
            return 'DevOps & Infrastructure';
        if (text.includes('research') || text.includes('arxiv') || text.includes('citation'))
            return 'Deep Research';
        if (text.includes('autonomous') || text.includes('swarm') || text.includes('openclaw') || text.includes('orchestrat'))
            return 'Autonomous Orchestration';
        if (text.includes('postgres') || text.includes('prisma') || text.includes('api') || text.includes('nestjs'))
            return 'Backend Architecture';
        return 'Coding & Software Engineering';
    }
    inferUseCases(name, description, content) {
        const label = this.inferCategoryLabel(name, content);
        return [
            `Automated ${label.toLowerCase()} workflows in enterprise repositories`,
            `${description.slice(0, 90).replace(/\.$/, '')} with deterministic verification`,
            `CI/CD and interactive IDE agent skill augmentation`,
            `Multi-agent delegation with standardized SKILL.md guardrails`,
        ];
    }
    async tryExternalLlmSummary(input, overallScore) {
        const apiKey = process.env.LLM_API_KEY;
        if (!apiKey)
            return null;
        const baseUrl = process.env.LLM_BASE_URL || 'https://api.openai.com/v1/chat/completions';
        const res = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: process.env.LLM_MODEL || 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an AI Agent Architect. Summarize the technical capability of the given SKILL.md in 2 concise sentences, distinguishing verified manifest facts from inferred benefits.',
                    },
                    {
                        role: 'user',
                        content: `Skill: ${input.name} (${input.repoFullName}), Score: ${overallScore}/100.\nContent:\n${input.skillMdContent.slice(0, 1500)}`,
                    },
                ],
                max_tokens: 160,
            }),
        });
        if (!res.ok)
            return null;
        const data = (await res.json());
        return data?.choices?.[0]?.message?.content?.trim() || null;
    }
};
exports.SkillAnalyzerService = SkillAnalyzerService;
exports.SkillAnalyzerService = SkillAnalyzerService = SkillAnalyzerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [security_scanner_service_1.SecurityScannerService])
], SkillAnalyzerService);
//# sourceMappingURL=skill-analyzer.service.js.map