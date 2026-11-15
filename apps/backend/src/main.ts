import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('AgentSkillRadarBootstrap');
  const app = await NestFactory.create(AppModule);

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
