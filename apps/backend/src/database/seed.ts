import { SecurityScannerService } from '../security/security-scanner.service';
import { SkillAnalyzerService } from '../analyzer/skill-analyzer.service';
import { DatabaseService } from './database.service';

async function runSeed() {
  const scanner = new SecurityScannerService();
  const analyzer = new SkillAnalyzerService(scanner);
  const db = new DatabaseService(analyzer);
  await db.seedInitialState();
  console.log('Successfully seeded Agent Skill Radar database store.');
}

runSeed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
