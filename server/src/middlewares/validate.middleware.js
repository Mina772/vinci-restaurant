import { ApiError } from "../utils/ApiError.js";

/**
 * Validate req.body / req.query / req.params against a Zod schema.
 * On success, replaces the request segments with the parsed (coerced) values.
 * @param {import('zod').ZodTypeAny} schema Zod object with optional body/query/params keys
 */
export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const errors = result.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return next(ApiError.badRequest("Validation failed", errors));
  }

  if (result.data.body) req.body = result.data.body;
  if (result.data.query) req.validatedQuery = result.data.query;
  if (result.data.params) req.params = result.data.params;
  next();
};
