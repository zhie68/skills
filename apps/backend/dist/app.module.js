"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const security_scanner_service_1 = require("./security/security-scanner.service");
const skill_analyzer_service_1 = require("./analyzer/skill-analyzer.service");
const database_service_1 = require("./database/database.service");
const discovery_service_1 = require("./discovery/discovery.service");
const recommendations_service_1 = require("./recommendations/recommendations.service");
const radar_controller_1 = require("./api/radar.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [schedule_1.ScheduleModule.forRoot()],
        controllers: [radar_controller_1.RadarController],
        providers: [
            security_scanner_service_1.SecurityScannerService,
            skill_analyzer_service_1.SkillAnalyzerService,
            database_service_1.DatabaseService,
            discovery_service_1.DiscoveryService,
            recommendations_service_1.RecommendationsService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map