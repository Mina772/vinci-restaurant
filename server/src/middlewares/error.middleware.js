import { ApiError } from "../utils/ApiError.js";
import { isProd } from "../config/env.js";
import { logger } from "../config/logger.js";

/** 404 handler for unmatched routes. */
export const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/** Translate common driver/library errors into ApiError instances. */
const normalize = (err) => {
  if (err instanceof ApiError) return err;

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return ApiError.badRequest("Validation failed", errors);
  }
  if (err.name === "CastError") return ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return ApiError.conflict(`Duplicate value for ${field}`);
  }
  if (err.name === "JsonWebTokenError") return ApiError.unauthorized("Invalid token");
  if (err.name === "TokenExpiredError") return ApiError.unauthorized("Token expired");

  return new ApiError(err.statusCode || 500, err.message || "Internal server error", {
    isOperational: false,
  });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  const apiErr = normalize(err);
  if (!apiErr.isOperational || apiErr.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} ->`, err.stack || err.message);
  }
  res.status(apiErr.statusCode).json({
    success: false,
    statusCode: apiErr.statusCode,
    message: apiErr.message,
    errors: apiErr.errors?.length ? apiErr.errors : undefined,
    stack: isProd ? undefined : err.stack,
  });
};
