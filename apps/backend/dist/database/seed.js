"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const security_scanner_service_1 = require("../security/security-scanner.service");
const skill_analyzer_service_1 = require("../analyzer/skill-analyzer.service");
const database_service_1 = require("./database.service");
async function runSeed() {
    const scanner = new security_scanner_service_1.SecurityScannerService();
    const analyzer = new skill_analyzer_service_1.SkillAnalyzerService(scanner);
    const db = new database_service_1.DatabaseService(analyzer);
    await db.seedInitialState();
    console.log('Successfully seeded Agent Skill Radar database store.');
}
runSeed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map