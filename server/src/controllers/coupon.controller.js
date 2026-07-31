import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Coupon } from "../models/coupon.model.js";

export const couponController = {
  list: asyncHandler(async (_req, res) => {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return ApiResponse.ok(res, coupons);
  }),

  create: asyncHandler(async (req, res) => {
    const coupon = await Coupon.create({ ...req.body, code: req.body.code.toUpperCase() });
    return ApiResponse.created(res, coupon, "Coupon created");
  }),

  update: asyncHandler(async (req, res) => {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!coupon) throw ApiError.notFound("Coupon not found");
    return ApiResponse.ok(res, coupon, "Coupon updated");
  }),

  remove: asyncHandler(async (req, res) => {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) throw ApiError.notFound("Coupon not found");
    return ApiResponse.ok(res, null, "Coupon deleted");
  }),

  validate: asyncHandler(async (req, res) => {
    const coupon = await Coupon.findOne({ code: req.body.code.toUpperCase() });
    if (!coupon) throw ApiError.notFound("Coupon not found");
    const result = coupon.evaluate(Number(req.body.subtotal) || 0, req.user?._id);
    return ApiResponse.ok(res, result);
  }),
};
