import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    priceDelta: { type: Number, default: 0 },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120, index: "text" },
    slug: { type: String, unique: true, index: true },
    description: { type: String, default: "", index: "text" },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    currency: { type: String, default: "EGP" },

    images: [{ type: String }],
    thumbnail: { type: String, default: "" },

    tags: [{ type: String, index: true }],
    isFeatured: { type: Boolean, default: false, index: true },
    isPopular: { type: Boolean, default: false, index: true },
    isNew: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },

    calories: { type: Number, min: 0 },
    ingredients: [String],
    allergens: [String],
    isVegetarian: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    isGlutenFree: { type: Boolean, default: false },
    spicyLevel: { type: Number, min: 0, max: 3, default: 0 },
    preparationTime: { type: Number, default: 15 },

    sizes: [optionSchema],
    extras: [optionSchema],
    addons: [optionSchema],

    stock: { type: Number, default: 1000, min: 0 },
    isAvailable: { type: Boolean, default: true, index: true },

    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.index({ price: 1, ratingAverage: -1 });
productSchema.index({ name: "text", description: "text", tags: "text" });

productSchema.pre("validate", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug =
      this.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") +
      "-" +
      Math.random().toString(36).slice(2, 7);
  }
  next();
});

productSchema.virtual("discountPercent").get(function () {
  if (!this.compareAtPrice || this.compareAtPrice <= this.price) return 0;
  return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
});

export const Product = mongoose.model("Product", productSchema);
