import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 120 },
    comment: { type: String, maxlength: 2000 },
    images: [String],
    reply: { text: String, at: Date },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
      index: true,
    },
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

/** Recompute the denormalised rating aggregate on the parent product. */
reviewSchema.statics.recalcProductRating = async function (productId) {
  const Product = mongoose.model("Product");
  const [agg] = await this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), status: "approved" } },
    { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  await Product.findByIdAndUpdate(productId, {
    ratingAverage: agg ? Math.round(agg.avg * 10) / 10 : 0,
    ratingCount: agg ? agg.count : 0,
  });
};

reviewSchema.post("save", function () {
  this.constructor.recalcProductRating(this.product);
});
reviewSchema.post("findOneAndDelete", function (doc) {
  if (doc) doc.constructor.recalcProductRating(doc.product);
});

export const Review = mongoose.model("Review", reviewSchema);
