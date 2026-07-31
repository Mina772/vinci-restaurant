import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Order } from "../models/order.model.js";
import { orderService } from "../services/order.service.js";
import { getPagination, buildMeta } from "../utils/pagination.js";

export const orderController = {
  checkout: asyncHandler(async (req, res) => {
    const order = await orderService.checkout(req.user, req.body);
    return ApiResponse.created(res, order, "Order placed successfully");
  }),

  myOrders: asyncHandler(async (req, res) => {
    const { page, limit, skip, sort } = getPagination(req.query);
    const filter = { user: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    const [items, total] = await Promise.all([
      Order.find(filter).sort(sort).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);
    return ApiResponse.ok(res, items, "Orders fetched", buildMeta({ page, limit, total }));
  }),

  getOne: asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) throw ApiError.notFound("Order not found");
    const isOwner = req.user && String(order.user?._id || order.user) === String(req.user._id);
    const isStaff = ["admin", "manager", "staff", "kitchen", "delivery"].includes(req.user.role);
    if (!isOwner && !isStaff) throw ApiError.forbidden();
    return ApiResponse.ok(res, order);
  }),

  cancel: asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) throw ApiError.notFound("Order not found");
    if (String(order.user) !== String(req.user._id)) throw ApiError.forbidden();
    if (!["pending", "confirmed"].includes(order.status))
      throw ApiError.badRequest("Order can no longer be cancelled");
    const updated = await orderService.updateStatus(order._id, "cancelled", "Cancelled by customer");
    return ApiResponse.ok(res, updated, "Order cancelled");
  }),

  listAll: asyncHandler(async (req, res) => {
    const { page, limit, skip, sort } = getPagination(req.query);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    const [items, total] = await Promise.all([
      Order.find(filter).populate("user", "name email").sort(sort).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);
    return ApiResponse.ok(res, items, "Orders fetched", buildMeta({ page, limit, total }));
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const order = await orderService.updateStatus(req.params.id, req.body.status, req.body.note);
    return ApiResponse.ok(res, order, "Order status updated");
  }),

  assignDriver: asyncHandler(async (req, res) => {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { driver: req.body.driverId },
      { new: true }
    );
    if (!order) throw ApiError.notFound("Order not found");
    return ApiResponse.ok(res, order, "Driver assigned");
  }),
};
