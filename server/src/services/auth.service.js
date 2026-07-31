import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { issueTokenPair, verifyRefreshToken } from "../utils/tokens.js";
import { sendEmail, emailTemplates } from "../utils/email.js";
import { env } from "../config/env.js";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  avatar: u.avatar,
  isEmailVerified: u.isEmailVerified,
  loyaltyPoints: u.loyaltyPoints,
  membershipTier: u.membershipTier,
});

export const authService = {
  publicUser,

  async register({ name, email, phone, password }) {
    const exists = await User.findOne({ email });
    if (exists) throw ApiError.conflict("Email already registered");

    const user = await User.create({ name, email, phone, password });
    const rawToken = user.createHashedToken("verify", 24 * 60 * 60 * 1000);
    await user.save();

    const url = `${env.CLIENT_URL}/verify-email?token=${rawToken}`;
    const tpl = emailTemplates.verify(user.name, url);
    await sendEmail({ to: user.email, ...tpl });

    return { user: publicUser(user), tokens: issueTokenPair(user) };
  },

  async login({ email, password }) {
    const user = await User.findOne({ email }).select("+password");
    if (!user) throw ApiError.unauthorized("Invalid credentials");

    if (user.isLocked)
      throw ApiError.tooMany("Account temporarily locked due to failed attempts");
    if (!user.isActive) throw ApiError.forbidden("Account disabled");

    const match = await user.comparePassword(password);
    if (!match) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
        user.failedLoginAttempts = 0;
      }
      await user.save();
      throw ApiError.unauthorized("Invalid credentials");
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    return { user: publicUser(user), tokens: issueTokenPair(user) };
  },

  async refresh(refreshToken) {
    if (!refreshToken) throw ApiError.unauthorized("No refresh token");
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized("Invalid refresh token");
    }
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) throw ApiError.unauthorized("User not found");
    if ((payload.tv ?? 0) !== (user.tokenVersion ?? 0))
      throw ApiError.unauthorized("Refresh token revoked");

    return { user: publicUser(user), tokens: issueTokenPair(user) };
  },

  async logoutAll(userId) {
    await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
  },

  async verifyEmail(token) {
    const hash = User.hashToken(token);
    const user = await User.findOne({
      emailVerifyTokenHash: hash,
      emailVerifyExpires: { $gt: new Date() },
    }).select("+emailVerifyTokenHash +emailVerifyExpires");
    if (!user) throw ApiError.badRequest("Invalid or expired verification token");
    user.isEmailVerified = true;
    user.emailVerifyTokenHash = undefined;
    user.emailVerifyExpires = undefined;
    await user.save();
    return publicUser(user);
  },

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) return;
    const rawToken = user.createHashedToken("reset", 15 * 60 * 1000);
    await user.save();
    const url = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;
    const tpl = emailTemplates.reset(user.name, url);
    await sendEmail({ to: user.email, ...tpl });
  },

  async resetPassword(token, newPassword) {
    const hash = User.hashToken(token);
    const user = await User.findOne({
      passwordResetTokenHash: hash,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetTokenHash +passwordResetExpires");
    if (!user) throw ApiError.badRequest("Invalid or expired reset token");
    user.password = newPassword;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    user.tokenVersion += 1;
    await user.save();
    return publicUser(user);
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select("+password");
    const ok = await user.comparePassword(currentPassword);
    if (!ok) throw ApiError.badRequest("Current password is incorrect");
    user.password = newPassword;
    user.tokenVersion += 1;
    await user.save();
    return publicUser(user);
  },
};
