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
export declare class RecommendationsService {
    private readonly db;
    constructor(db: DatabaseService);
    getRecommendations(query?: RecommendationQuery): {
        generatedAt: string;
        savedSkillsCount: number;
        personalizedSynergies: {
            skill: StoredSkillRecord;
            synergyReason: string;
        }[];
        tracks: RecommendationTrack[];
    };
}
