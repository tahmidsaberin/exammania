import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { globalLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";
import { swaggerSpec } from "./utils/swagger";
import { authRouter } from "./routes/auth";
import { divisionsRouter } from "./routes/divisions";
import { examsRouter, attemptsRouter, usersRouter, adminRouter } from "./routes/index";

export function createApp() {
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://accounts.google.com"],
        frameSrc: ["'self'", "https://accounts.google.com"],
        imgSrc: ["'self'", "data:", "https://lh3.googleusercontent.com"],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }));

  app.use(cors({ origin: env.CLIENT_URL, credentials: true, methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"] }));
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(globalLimiter);

  if (env.NODE_ENV !== "test") {
    app.use((req, _res, next) => { logger.info(`${req.method} ${req.path}`); next(); });
  }

  app.get("/health", (_req, res) => { res.json({ status: "ok", ts: new Date().toISOString() }); });
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/api/auth", authRouter);
  app.use("/api/divisions", divisionsRouter);
  app.use("/api/exams", examsRouter);
  app.use("/api/subjects", examsRouter);
  app.use("/api/attempts", attemptsRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/admin", adminRouter);

  app.use((_req, res) => { res.status(404).json({ success: false, error: "Route not found" }); });
  app.use(errorHandler);

  return app;
}
