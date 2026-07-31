import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Reservation } from "../models/reservation.model.js";
import { getPagination, buildMeta } from "../utils/pagination.js";
import { sendEmail } from "../utils/email.js";

export const reservationController = {
  create: asyncHandler(async (req, res) => {
    const reservation = await Reservation.create({
      ...req.body,
      user: req.user?._id,
    });
    await sendEmail({
      to: reservation.email,
      subject: "Reservation received — VINCI",
      html: `<h2>Hi ${reservation.name}</h2><p>We received your reservation for ${reservation.partySize} on ${new Date(
        reservation.date
      ).toDateString()} at ${reservation.time}. We'll confirm shortly.</p>`,
    });
    return ApiResponse.created(res, reservation, "Reservation requested");
  }),

  mine: asyncHandler(async (req, res) => {
    const items = await Reservation.find({ user: req.user._id }).sort({ date: -1 });
    return ApiResponse.ok(res, items);
  }),

  listAll: asyncHandler(async (req, res) => {
    const { page, limit, skip, sort } = getPagination(req.query);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const [items, total] = await Promise.all([
      Reservation.find(filter).sort(sort).skip(skip).limit(limit),
      Reservation.countDocuments(filter),
    ]);
    return ApiResponse.ok(res, items, "Reservations fetched", buildMeta({ page, limit, total }));
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, tableNumber: req.body.tableNumber },
      { new: true }
    );
    if (!reservation) throw ApiError.notFound("Reservation not found");
    return ApiResponse.ok(res, reservation, "Reservation updated");
  }),
};
