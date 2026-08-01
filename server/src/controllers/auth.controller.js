import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { authService } from "../services/auth.service.js";
import { setAuthCookies, clearAuthCookies } from "../utils/cookies.js";

export const authController = {
  register: asyncHandler(async (req, res) => {
    const { user, tokens } = await authService.register(req.body);
    setAuthCookies(res, tokens);
    return ApiResponse.created(res, { user, ...tokens }, "Registration successful");
  }),

  login: asyncHandler(async (req, res) => {
    const { user, tokens } = await authService.login(req.body);
    setAuthCookies(res, tokens);
    return ApiResponse.ok(res, { user, ...tokens }, "Login successful");
  }),

  refresh: asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    const { user, tokens } = await authService.refresh(token);
    setAuthCookies(res, tokens);
    return ApiResponse.ok(res, { user, ...tokens }, "Token refreshed");
  }),

  logout: asyncHandler(async (req, res) => {
    if (req.user) await authService.logoutAll(req.user._id);
    clearAuthCookies(res);
    return ApiResponse.ok(res, null, "Logged out");
  }),

  me: asyncHandler(async (req, res) =>
    ApiResponse.ok(res, { user: authService.publicUser(req.user) })
  ),

  verifyEmail: asyncHandler(async (req, res) => {
    const user = await authService.verifyEmail(req.body.token);
    return ApiResponse.ok(res, { user }, "Email verified");
  }),

  forgotPassword: asyncHandler(async (req, res) => {
    await authService.forgotPassword(req.body.email);
    return ApiResponse.ok(res, null, "If the email exists, a reset link has been sent");
  }),

  resetPassword: asyncHandler(async (req, res) => {
    const user = await authService.resetPassword(req.body.token, req.body.password);
    return ApiResponse.ok(res, { user }, "Password reset successful");
  }),

  changePassword: asyncHandler(async (req, res) => {
    const user = await authService.changePassword(
      req.user._id,
      req.body.currentPassword,
      req.body.newPassword
    );
    clearAuthCookies(res);
    return ApiResponse.ok(res, { user }, "Password changed, please log in again");
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const allowed = ["name", "phone", "avatar"];
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) req.user[f] = req.body[f];
    });
    await req.user.save();
    return ApiResponse.ok(res, { user: authService.publicUser(req.user) }, "Profile updated");
  }),
};
