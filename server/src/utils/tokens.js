import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/** Sign a short-lived access token. */
export const signAccessToken = (payload) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES });

/** Sign a long-lived refresh token. */
export const signRefreshToken = (payload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES });

export const verifyAccessToken = (token) => jwt.verify(token, env.JWT_ACCESS_SECRET);
export const verifyRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET);

/**
 * Build the standard access + refresh token pair for a user document.
 * @param {{_id: any, role: string, tokenVersion: number}} user
 */
export const issueTokenPair = (user) => {
  const base = { sub: String(user._id), role: user.role };
  return {
    accessToken: signAccessToken(base),
    refreshToken: signRefreshToken({ ...base, tv: user.tokenVersion ?? 0 }),
  };
};
