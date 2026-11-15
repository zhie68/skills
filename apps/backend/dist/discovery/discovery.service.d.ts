import { DatabaseService, StoredDiscoveryScan } from '../database/database.service';
import { SkillAnalyzerService } from '../analyzer/skill-analyzer.service';
export interface TriggerScanOptions {
    triggerType?: 'MANUAL' | 'SCHEDULED' | 'INCREMENTAL';
    sourceSlug?: string;
    customRepoFullName?: string;
}
export declare class DiscoveryService {
    private readonly db;
    private readonly analyzer;
    private readonly logger;
    private isScanning;
    constructor(db: DatabaseService, analyzer: SkillAnalyzerService);
    handleScheduledDailyScan(): Promise<void>;
    executeDiscoveryWorkflow(options?: TriggerScanOptions): Promise<StoredDiscoveryScan>;
    private fetchGitHubRepoMetadata;
    private fetchLiveGitHubRepoWithRetry;
    private getIncrementalDiscoveryPool;
}
