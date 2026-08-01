import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";
import { getPagination, buildMeta } from "../utils/pagination.js";

/** Build a Mongo filter from validated query params. */
const buildFilter = (q) => {
  const filter = {};
  if (q.category) filter.category = q.category;
  if (q.tag) filter.tags = q.tag;
  if (q.featured === "true") filter.isFeatured = true;
  if (q.popular === "true") filter.isPopular = true;
  if (q.vegetarian === "true") filter.isVegetarian = true;
  if (q.minPrice || q.maxPrice) {
    filter.price = {};
    if (q.minPrice) filter.price.$gte = Number(q.minPrice);
    if (q.maxPrice) filter.price.$lte = Number(q.maxPrice);
  }
  if (q.search) filter.$text = { $search: q.search };
  return filter;
};

export const productController = {
  list: asyncHandler(async (req, res) => {
    const q = req.validatedQuery || req.query;
    const { page, limit, skip, sort } = getPagination(q);
    const filter = buildFilter(q);

    const [items, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true }),
      Product.countDocuments(filter),
    ]);

    return ApiResponse.ok(res, items, "Products fetched", buildMeta({ page, limit, total }));
  }),

  getOne: asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate("category", "name slug");
    if (!product) throw ApiError.notFound("Product not found");

    const [reviews, related] = await Promise.all([
      Review.find({ product: product._id, status: "approved" })
        .populate("user", "name avatar")
        .sort({ createdAt: -1 })
        .limit(10),
      Product.find({ category: product.category, _id: { $ne: product._id }, isAvailable: true })
        .limit(6)
        .select("name slug price thumbnail ratingAverage"),
    ]);

    return ApiResponse.ok(res, { product, reviews, related });
  }),

  getBySlug: asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug }).populate(
      "category",
      "name slug"
    );
    if (!product) throw ApiError.notFound("Product not found");
    return ApiResponse.ok(res, product);
  }),

  create: asyncHandler(async (req, res) => {
    const product = await Product.create(req.body);
    return ApiResponse.created(res, product, "Product created");
  }),

  update: asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) throw ApiError.notFound("Product not found");
    return ApiResponse.ok(res, product, "Product updated");
  }),

  remove: asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throw ApiError.notFound("Product not found");
    return ApiResponse.ok(res, null, "Product deleted");
  }),
};
