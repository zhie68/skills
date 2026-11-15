import { SecurityFindingItem, SecurityStatus } from '@agent-skill-radar/shared';
export declare class SecurityScannerService {
    private readonly rules;
    scanSkillContent(skillSlug: string, manifestPath: string, skillMdContent: string, additionalFilePaths?: string[]): {
        securityStatus: SecurityStatus;
        securityScore: number;
        findings: SecurityFindingItem[];
    };
}
