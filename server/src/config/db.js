import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "./logger.js";

mongoose.set("strictQuery", true);

/** Connect to MongoDB with sane pool + retry-friendly options. */
export async function connectDB(uri = env.MONGO_URI) {
  const conn = await mongoose.connect(uri, {
    autoIndex: env.NODE_ENV !== "production",
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 10000,
  });
  logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}

export async function disconnectDB() {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
}
