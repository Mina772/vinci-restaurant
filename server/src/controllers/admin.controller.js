import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Reservation } from "../models/reservation.model.js";

const REVENUE_STATUSES = ["delivered", "completed", "out_for_delivery", "ready"];

export const adminController = {
  /** High-level KPIs + charts for the admin dashboard. */
  dashboard: asyncHandler(async (_req, res) => {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingReservations,
      revenueAgg,
      monthRevenueAgg,
      statusBreakdown,
      revenueByDay,
      topProducts,
    ] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: "customer" }),
      Product.countDocuments(),
      Reservation.countDocuments({ status: "pending" }),
      Order.aggregate([
        { $match: { status: { $in: REVENUE_STATUSES } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        { $match: { status: { $in: REVENUE_STATUSES }, createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { status: { $in: REVENUE_STATUSES } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 30 },
      ]),
      Product.find().sort({ soldCount: -1 }).limit(5).select("name soldCount price thumbnail"),
    ]);

    return ApiResponse.ok(res, {
      kpis: {
        totalOrders,
        totalCustomers,
        totalProducts,
        pendingReservations,
        totalRevenue: revenueAgg[0]?.total || 0,
        monthRevenue: monthRevenueAgg[0]?.total || 0,
      },
      statusBreakdown,
      revenueByDay,
      topProducts,
    });
  }),

  /** Sales report grouped by period for the reporting module. */
  salesReport: asyncHandler(async (req, res) => {
    const { from, to } = req.query;
    const match = { status: { $in: REVENUE_STATUSES } };
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }
    const report = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          tax: { $sum: "$tax" },
          discount: { $sum: "$discount" },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return ApiResponse.ok(res, report);
  }),
};
