import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";

export const userController = {
  listFavorites: asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate("favorites");
    return ApiResponse.ok(res, user.favorites);
  }),
  toggleFavorite: asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const id = req.params.productId;
    const idx = user.favorites.findIndex((f) => String(f) === id);
    if (idx >= 0) user.favorites.splice(idx, 1);
    else user.favorites.push(id);
    await user.save();
    return ApiResponse.ok(res, user.favorites, idx >= 0 ? "Removed" : "Added");
  }),

  listAddresses: asyncHandler(async (req, res) =>
    ApiResponse.ok(res, req.user.addresses)
  ),
  addAddress: asyncHandler(async (req, res) => {
    const user = req.user;
    if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
    user.addresses.push(req.body);
    await user.save();
    return ApiResponse.created(res, user.addresses, "Address added");
  }),
  updateAddress: asyncHandler(async (req, res) => {
    const user = req.user;
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) throw ApiError.notFound("Address not found");
    if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
    Object.assign(addr, req.body);
    await user.save();
    return ApiResponse.ok(res, user.addresses, "Address updated");
  }),
  removeAddress: asyncHandler(async (req, res) => {
    const user = req.user;
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) throw ApiError.notFound("Address not found");
    addr.deleteOne();
    await user.save();
    return ApiResponse.ok(res, user.addresses, "Address removed");
  }),

  listNotifications: asyncHandler(async (req, res) => {
    const items = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unread = await Notification.countDocuments({ user: req.user._id, isRead: false });
    return ApiResponse.ok(res, { items, unread });
  }),
  markNotificationRead: asyncHandler(async (req, res) => {
    await Notification.updateOne(
      { _id: req.params.id, user: req.user._id },
      { isRead: true }
    );
    return ApiResponse.ok(res, null, "Marked read");
  }),
  markAllRead: asyncHandler(async (req, res) => {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    return ApiResponse.ok(res, null, "All marked read");
  }),

  listUsers: asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search)
      filter.$or = [
        { name: new RegExp(req.query.search, "i") },
        { email: new RegExp(req.query.search, "i") },
      ];
    const users = await User.find(filter).sort({ createdAt: -1 }).limit(100);
    return ApiResponse.ok(res, users);
  }),
  updateUserRole: asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    );
    if (!user) throw ApiError.notFound("User not found");
    return ApiResponse.ok(res, user, "Role updated");
  }),
  toggleUserActive: asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw ApiError.notFound("User not found");
    user.isActive = !user.isActive;
    await user.save();
    return ApiResponse.ok(res, user, "User status updated");
  }),
};
