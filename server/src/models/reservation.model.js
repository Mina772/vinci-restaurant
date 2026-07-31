import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    partySize: { type: Number, required: true, min: 1, max: 30 },
    date: { type: Date, required: true, index: true },
    time: { type: String, required: true },
    tableNumber: { type: Number },
    notes: String,
    status: {
      type: String,
      enum: ["pending", "confirmed", "seated", "completed", "cancelled", "no_show"],
      default: "pending",
      index: true,
    },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  },
  { timestamps: true }
);

reservationSchema.index({ date: 1, time: 1, tableNumber: 1 });

export const Reservation = mongoose.model("Reservation", reservationSchema);
