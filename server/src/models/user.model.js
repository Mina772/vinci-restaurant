import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const ROLES = ["customer", "staff", "kitchen", "delivery", "manager", "admin"];

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: String,
    country: { type: String, default: "Egypt" },
    postalCode: String,
    lat: Number,
    lng: Number,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true, maxlength: 80 },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ROLES, default: "customer", index: true },

    avatar: { type: String, default: "" },
    addresses: [addressSchema],

    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    loyaltyPoints: { type: Number, default: 0, min: 0 },
    membershipTier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      default: "bronze",
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    tokenVersion: { type: Number, default: 0 },
    twoFactorEnabled: { type: Boolean, default: false },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },

    emailVerifyTokenHash: { type: String, select: false },
    emailVerifyExpires: { type: Date, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    passwordChangedAt: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

/** Create a raw token, store only its hash, return the raw value for emailing. */
userSchema.methods.createHashedToken = function (field, ttlMs) {
  const raw = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  if (field === "verify") {
    this.emailVerifyTokenHash = hash;
    this.emailVerifyExpires = new Date(Date.now() + ttlMs);
  } else {
    this.passwordResetTokenHash = hash;
    this.passwordResetExpires = new Date(Date.now() + ttlMs);
  }
  return raw;
};

userSchema.statics.hashToken = (raw) =>
  crypto.createHash("sha256").update(raw).digest("hex");

export const User = mongoose.model("User", userSchema);
