import { verifyAccessToken } from "../utils/tokens.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

/** Extract a bearer/cookie access token from the request. */
const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.slice(7);
  if (req.cookies?.accessToken) return req.cookies.accessToken;
  return null;
};

/**
 * Require a valid access token. Loads the user and attaches it to req.user.
 */
export const protect = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized("Authentication required");

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw ApiError.unauthorized("User no longer active");

  if (user.passwordChangedAt && payload.iat) {
    const changedSec = Math.floor(user.passwordChangedAt.getTime() / 1000);
    if (payload.iat < changedSec) throw ApiError.unauthorized("Password changed, please re-login");
  }

  req.user = user;
  next();
});

/**
 * Restrict a route to one or more roles.
 * @param {...string} roles
 */
export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role))
      return next(ApiError.forbidden("You do not have permission for this action"));
    next();
  };

/** Optional auth — attaches req.user when a valid token is present, never throws. */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (user && user.isActive) req.user = user;
  } catch {
    /* ignore — treat as guest */
  }
  next();
});
