import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function bootstrap() {
  await prisma.$connect();
  logger.info("✅ Database connected");
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
    logger.info(`📖 Swagger UI at http://localhost:${env.PORT}/api-docs`);
  });
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down…`);
    server.close(async () => { await prisma.$disconnect(); process.exit(0); });
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((err) => { console.error("Fatal:", err); process.exit(1); });
