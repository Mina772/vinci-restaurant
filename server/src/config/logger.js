/* Minimal structured logger — swap for pino/winston in production without changing call sites. */
const ts = () => new Date().toISOString();
const fmt = (level, args) => [`[${ts()}] ${level}`, ...args];

export const logger = {
  info: (...a) => console.log(...fmt("INFO", a)),
  warn: (...a) => console.warn(...fmt("WARN", a)),
  error: (...a) => console.error(...fmt("ERROR", a)),
  debug: (...a) => (process.env.DEBUG ? console.debug(...fmt("DEBUG", a)) : undefined),
};
