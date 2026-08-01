import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    description: String,
    type: { type: String, enum: ["percent", "fixed"], default: "percent" },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    usageLimit: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

/**
 * Validate a coupon against an order subtotal and user.
 * @returns {{valid:boolean, reason?:string, discount:number}}
 */
couponSchema.methods.evaluate = function (subtotal, userId) {
  const now = new Date();
  if (!this.isActive) return { valid: false, reason: "Coupon inactive", discount: 0 };
  if (this.startsAt && now < this.startsAt)
    return { valid: false, reason: "Coupon not started", discount: 0 };
  if (this.expiresAt && now > this.expiresAt)
    return { valid: false, reason: "Coupon expired", discount: 0 };
  if (this.usageLimit && this.usedCount >= this.usageLimit)
    return { valid: false, reason: "Coupon usage limit reached", discount: 0 };
  if (subtotal < this.minOrderAmount)
    return {
      valid: false,
      reason: `Minimum order of ${this.minOrderAmount} required`,
      discount: 0,
    };
  if (userId && this.perUserLimit) {
    const used = this.usedBy.filter((id) => String(id) === String(userId)).length;
    if (used >= this.perUserLimit)
      return { valid: false, reason: "Coupon already used", discount: 0 };
  }

  let discount =
    this.type === "percent" ? (subtotal * this.value) / 100 : Math.min(this.value, subtotal);
  if (this.type === "percent" && this.maxDiscount) discount = Math.min(discount, this.maxDiscount);
  return { valid: true, discount: Math.round(discount * 100) / 100 };
};

export const Coupon = mongoose.model("Coupon", couponSchema);
