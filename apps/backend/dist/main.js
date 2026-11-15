"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('AgentSkillRadarBootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    const port = Number(process.env.PORT || 4000);
    await app.listen(port);
    logger.log(`Agent Skill Radar Backend API listening on http://localhost:${port}/api`);
}
bootstrap().catch((err) => {
    console.error('Failed to start Agent Skill Radar backend:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map