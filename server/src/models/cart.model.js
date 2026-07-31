import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    image: String,
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    selectedSize: { name: String, priceDelta: Number },
    selectedExtras: [{ name: String, priceDelta: Number }],
    notes: String,
  },
  { _id: true }
);

cartItemSchema.virtual("lineTotal").get(function () {
  return this.unitPrice * this.quantity;
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: [cartItemSchema],
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

cartSchema.virtual("subtotal").get(function () {
  return this.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
});

cartSchema.virtual("itemCount").get(function () {
  return this.items.reduce((sum, i) => sum + i.quantity, 0);
});

export const Cart = mongoose.model("Cart", cartSchema);
