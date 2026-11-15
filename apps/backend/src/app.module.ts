import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SecurityScannerService } from './security/security-scanner.service';
import { SkillAnalyzerService } from './analyzer/skill-analyzer.service';
import { DatabaseService } from './database/database.service';
import { DiscoveryService } from './discovery/discovery.service';
import { RecommendationsService } from './recommendations/recommendations.service';
import { RadarController } from './api/radar.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [RadarController],
  providers: [
    SecurityScannerService,
    SkillAnalyzerService,
    DatabaseService,
    DiscoveryService,
    RecommendationsService,
  ],
})
export class AppModule {}
