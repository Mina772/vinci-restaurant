import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

const start = async () => {
  try {
    await connectDB();
    const app = createApp();
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 VINCI API running on port ${env.PORT} (${env.NODE_ENV})`);
      logger.info(`📚 Swagger docs at http://localhost:${env.PORT}/docs`);
    });

    const shutdown = (signal) => {
      logger.warn(`${signal} received, shutting down gracefully...`);
      server.close(() => process.exit(0));
    };
    ["SIGINT", "SIGTERM"].forEach((sig) => process.on(sig, () => shutdown(sig)));

    process.on("unhandledRejection", (reason) => {
      logger.error("Unhandled Rejection:", reason);
      server.close(() => process.exit(1));
    });
  } catch (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
