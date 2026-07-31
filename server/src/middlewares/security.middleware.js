import xss from "xss";

/**
 * Recursively sanitise strings in an object to strip XSS payloads.
 * Applied to req.body since query/params are read-only getters in Express 5.
 */
const sanitizeValue = (value) => {
  if (typeof value === "string") return xss(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) value[key] = sanitizeValue(value[key]);
    return value;
  }
  return value;
};

export const xssClean = (req, _res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  next();
};
