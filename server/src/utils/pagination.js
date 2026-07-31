/**
 * Normalise pagination + sorting query params into Mongoose-friendly values.
 * @param {object} query Express req.query
 * @returns {{page:number, limit:number, skip:number, sort:object}}
 */
export const getPagination = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 12));
  const skip = (page - 1) * limit;

  let sort = { createdAt: -1 };
  if (query.sort) {
    sort = String(query.sort)
      .split(",")
      .reduce((acc, field) => {
        const clean = field.trim();
        if (!clean) return acc;
        if (clean.startsWith("-")) acc[clean.slice(1)] = -1;
        else acc[clean] = 1;
        return acc;
      }, {});
  }
  return { page, limit, skip, sort };
};

/** Build a pagination meta block for response envelopes. */
export const buildMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 1,
  hasNext: page * limit < total,
  hasPrev: page > 1,
});
