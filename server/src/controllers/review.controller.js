import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Review } from "../models/review.model.js";
import { Order } from "../models/order.model.js";
import { getPagination, buildMeta } from "../utils/pagination.js";

export const reviewController = {
  listForProduct: asyncHandler(async (req, res) => {
    const { page, limit, skip, sort } = getPagination(req.query);
    const filter = { product: req.params.productId, status: "approved" };
    const [items, total] = await Promise.all([
      Review.find(filter).populate("user", "name avatar").sort(sort).skip(skip).limit(limit),
      Review.countDocuments(filter),
    ]);
    return ApiResponse.ok(res, items, "Reviews fetched", buildMeta({ page, limit, total }));
  }),

  create: asyncHandler(async (req, res) => {
    const purchased = await Order.exists({
      user: req.user._id,
      "items.product": req.params.productId,
      status: { $in: ["delivered", "completed"] },
    });

    const existing = await Review.findOne({
      product: req.params.productId,
      user: req.user._id,
    });
    if (existing) throw ApiError.conflict("You already reviewed this product");

    const review = await Review.create({
      product: req.params.productId,
      user: req.user._id,
      rating: req.body.rating,
      title: req.body.title,
      comment: req.body.comment,
      images: req.body.images,
      status: purchased ? "approved" : "pending",
    });
    return ApiResponse.created(res, review, "Review submitted");
  }),

  remove: asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) throw ApiError.notFound("Review not found");
    const owner = String(review.user) === String(req.user._id);
    const isAdmin = ["admin", "manager"].includes(req.user.role);
    if (!owner && !isAdmin) throw ApiError.forbidden();
    await Review.findOneAndDelete({ _id: review._id });
    return ApiResponse.ok(res, null, "Review deleted");
  }),

  moderate: asyncHandler(async (req, res) => {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!review) throw ApiError.notFound("Review not found");
    await Review.recalcProductRating(review.product);
    return ApiResponse.ok(res, review, "Review moderated");
  }),

  reply: asyncHandler(async (req, res) => {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { reply: { text: req.body.text, at: new Date() } },
      { new: true }
    );
    if (!review) throw ApiError.notFound("Review not found");
    return ApiResponse.ok(res, review, "Reply added");
  }),
};
