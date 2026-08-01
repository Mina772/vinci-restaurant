import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import swaggerUi from "swagger-ui-express";

import { env, isTest } from "./config/env.js";
import { swaggerSpec } from "./config/swagger.js";
import { globalLimiter } from "./middlewares/rateLimit.middleware.js";
import { xssClean } from "./middlewares/security.middleware.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import apiRouter from "./routes/index.js";

/** Build and configure the Express application (no network side effects). */
export const createApp = () => {
  const app = express();

  app.set("trust proxy", 1);

  // Security headers
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

  // CORS with credentials for cookie-based auth
  app.use(
    cors({
      origin: env.CLIENT_URL.split(",").map((s) => s.trim()),
      credentials: true,
    })
  );

  // Body & cookie parsing
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser(env.COOKIE_SECRET));

  // Sanitisation & hardening
  app.use(mongoSanitize());
  app.use(hpp());
  app.use(xssClean);
  app.use(compression());

  if (!isTest) app.use(morgan("dev"));

  // Rate limiting
  app.use(env.API_PREFIX, globalLimiter);

  // API docs
  app.get("/docs.json", (_req, res) => res.json(swaggerSpec));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: "VINCI API" }));

  // Root
  app.get("/", (_req, res) =>
    res.json({ name: "VINCI Restaurant API", version: "1.0.0", docs: "/docs" })
  );

  // Mounted API
  app.use(env.API_PREFIX, apiRouter);

  // 404 + centralized error handling
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
