/**
 * Wraps an async route handler and forwards rejected promises to Express' error pipeline,
 * removing the need for repetitive try/catch blocks in controllers.
 * @param {Function} fn
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
