import mongoose from "mongoose";

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "cooking",
  "ready",
  "out_for_delivery",
  "delivered",
  "completed",
  "cancelled",
  "refunded",
];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: String,
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    selectedSize: { name: String, priceDelta: Number },
    selectedExtras: [{ name: String, priceDelta: Number }],
    notes: String,
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES },
    at: { type: Date, default: Date.now },
    note: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    guestEmail: { type: String },
    items: { type: [orderItemSchema], validate: (v) => v.length > 0 },

    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    tip: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: "EGP" },
    coupon: { code: String, discount: Number },

    type: { type: String, enum: ["delivery", "pickup", "dine_in"], default: "delivery" },
    status: { type: String, enum: ORDER_STATUSES, default: "pending", index: true },
    statusHistory: [statusHistorySchema],
    scheduledFor: { type: Date },

    address: {
      line1: String,
      line2: String,
      city: String,
      country: String,
      postalCode: String,
      lat: Number,
      lng: Number,
    },
    notes: String,

    payment: {
      method: { type: String, enum: ["stripe", "paypal", "cash", "wallet"], default: "cash" },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      transactionId: String,
      paidAt: Date,
    },

    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },

    ratedByCustomer: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ user: 1, status: 1 });

orderSchema.pre("validate", function (next) {
  if (!this.orderNumber) {
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `VINCI-${Date.now().toString().slice(-8)}-${rand}`;
  }
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({ status: this.status });
  }
  next();
});

export const Order = mongoose.model("Order", orderSchema);
