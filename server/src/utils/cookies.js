import { env, isProd } from "../config/env.js";

const parseDurationMs = (str) => {
  const m = /^(\d+)([smhd])$/.exec(str);
  if (!m) return 7 * 24 * 60 * 60 * 1000;
  const n = Number(m[1]);
  return n * { s: 1000, m: 60000, h: 3600000, d: 86400000 }[m[2]];
};

const baseCookie = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
};

/** Attach access + refresh tokens as secure, httpOnly cookies. */
export const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie("accessToken", accessToken, {
    ...baseCookie,
    maxAge: parseDurationMs(env.JWT_ACCESS_EXPIRES),
  });
  res.cookie("refreshToken", refreshToken, {
    ...baseCookie,
    maxAge: parseDurationMs(env.JWT_REFRESH_EXPIRES),
  });
};

export const clearAuthCookies = (res) => {
  res.clearCookie("accessToken", baseCookie);
  res.clearCookie("refreshToken", baseCookie);
};
