import { Injectable } from '@nestjs/common';
import { DatabaseService, StoredSkillRecord } from '../database/database.service';

export interface RecommendationQuery {
  track?: string;
  agentPlatform?: string;
  projectRequirement?: string;
}

export interface RecommendationTrack {
  id: string;
  title: string;
  categorySlug: string;
  description: string;
  rationale: string;
  recommendedSkills: Array<{
    skill: StoredSkillRecord;
    matchScore: number;
    matchReasons: string[];
  }>;
}

@Injectable()
export class RecommendationsService {
  constructor(private readonly db: DatabaseService) {}

  public getRecommendations(query: RecommendationQuery = {}) {
    const state = this.db.getState();
    const safeSkills = state.skills.filter((s) => s.securityStatus === 'SAFE');
    const savedIds = new Set(state.savedSkillIds.map((sv) => sv.skillId));
    const savedSkills = state.skills.filter((s) => savedIds.has(s.id));

    const tracksDefinition = [
      {
        id: 'coding-agents',
        title: 'Best Skills for Coding Agents',
        categorySlug: 'coding-agents',
        description: 'High-leverage TypeScript, Next.js, MCP server, and UI architecture skills.',
        rationale: 'Selected based on technical capability (25%) and documentation clarity for IDE coding agents.',
      },
      {
        id: 'autonomous-agents',
        title: 'Best Skills for Autonomous Agents',
        categorySlug: 'autonomous-agents',
        description: 'Multi-agent swarm orchestration, task decomposition, and verification gates.',
        rationale: 'Optimized for long-horizon goal execution and parallel subagent coordination.',
      },
      {
        id: 'browser-automation',
        title: 'Best Skills for Browser Automation',
        categorySlug: 'browser-automation',
        description: 'Playwright DOM inspection, E2E verification, and live web app interaction.',
        rationale: 'Highest reliability scores for headless Chromium control and network trace assertion.',
      },
      {
        id: 'research-agents',
        title: 'Best Skills for Research Agents',
        categorySlug: 'research-agents',
        description: 'Multi-hop technical synthesis, citation verification, and evidence matrices.',
        rationale: 'Enforces strict separation between primary source evidence and AI inference.',
      },
      {
        id: 'devops',
        title: 'Best Skills for DevOps',
        categorySlug: 'devops',
        description: 'Multi-stage Dockerfiles, Compose stacks, Kubernetes SRE, and CI/CD automation.',
        rationale: 'Verified safe containerization and infrastructure reliability skills.',
      },
      {
        id: '3d-development',
        title: 'Best Skills for 3D Development',
        categorySlug: '3d-development',
        description: 'Three.js, React Three Fiber, custom GLSL shaders, and 60fps WebGL optimization.',
        rationale: 'Top-ranked graphics and shader engineering skills from full-stack-skills/threejs-skills.',
      },
      {
        id: 'backend-development',
        title: 'Best Skills for Backend Development',
        categorySlug: 'backend-development',
        description: 'NestJS modular architecture, Prisma ORM, PostgreSQL indexing, and Redis queues.',
        rationale: 'High-throughput API and relational database architecture skills.',
      },
      {
        id: 'security-analysis',
        title: 'Best Skills for Security Analysis',
        categorySlug: 'security-analysis',
        description: 'Static SAST auditing, secret detection, and prompt injection guardrails.',
        rationale: 'Hardened zero-execution static analysis and defense-in-depth skills.',
      },
    ];

    const filteredDefs = query.track
      ? tracksDefinition.filter((t) => t.id === query.track || t.categorySlug === query.track)
      : tracksDefinition;

    const tracks: RecommendationTrack[] = filteredDefs.map((track) => {
      const candidates = safeSkills
        .filter((s) => {
          if (query.agentPlatform) {
            const matchesAgent = s.supportedAgents.some((a) =>
              a.toLowerCase().includes(query.agentPlatform!.toLowerCase())
            );
            if (!matchesAgent) return false;
          }
          return (
            s.category.slug === track.categorySlug ||
            s.repository.topics?.some((tp) => track.id.includes(tp.toLowerCase()))
          );
        })
        .sort((a, b) => b.overallScore - a.overallScore);

      // If category has fewer than 2 items, supplement with top overall complementary skills
      const pool =
        candidates.length >= 2
          ? candidates
          : [
              ...candidates,
              ...safeSkills
                .filter((s) => !candidates.some((c) => c.id === s.id))
                .sort((a, b) => b.overallScore - a.overallScore)
                .slice(0, 2 - candidates.length),
            ];

      const recommendedSkills = pool.slice(0, 4).map((skill) => {
        let matchBonus = 0;
        const matchReasons: string[] = [
          `${skill.rankingTier}-Tier Intelligence Score (${skill.overallScore}/100)`,
          `Verified SAFE static security posture (${skill.repository.stars.toLocaleString()} GitHub stars)`,
        ];

        if (savedSkills.some((sv) => sv.repository.fullName === skill.repository.fullName)) {
          matchBonus += 4;
          matchReasons.push(`Synergizes with your saved skills from ${skill.repository.fullName}`);
        }
        if (
          query.projectRequirement &&
          `${skill.name} ${skill.description} ${skill.skillMdContent}`
            .toLowerCase()
            .includes(query.projectRequirement.toLowerCase())
        ) {
          matchBonus += 6;
          matchReasons.push(`Directly matches requirement "${query.projectRequirement}"`);
        }

        const matchScore = Math.min(99, Math.round(skill.overallScore + matchBonus));
        return {
          skill,
          matchScore,
          matchReasons,
        };
      });

      return {
        ...track,
        recommendedSkills,
      };
    });

    // Personalized workflow suggestions based on saved skills
    const personalizedSynergies = safeSkills
      .filter((s) => !savedIds.has(s.id))
      .slice(0, 4)
      .map((s) => ({
        skill: s,
        synergyReason:
          savedSkills.length > 0
            ? `Complements your saved stack (${savedSkills.map((sv) => sv.name).slice(0, 2).join(' + ')}) with ${s.category.name} capabilities.`
            : `High-impact ${s.rankingTier}-Tier skill ready for immediate agent integration.`,
      }));

    return {
      generatedAt: new Date().toISOString(),
      savedSkillsCount: savedSkills.length,
      personalizedSynergies,
      tracks,
    };
  }
}
