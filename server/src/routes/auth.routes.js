import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
  updateProfileSchema,
} from "../validators/auth.validator.js";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication & account management
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               password: { type: string, format: password }
 *     responses:
 *       201: { description: Registered }
 *       409: { description: Email already registered }
 */
router.post("/register", authLimiter, validate(registerSchema), authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in and receive access + refresh tokens
 *     responses:
 *       200: { description: Logged in }
 *       401: { description: Invalid credentials }
 */
router.post("/login", authLimiter, validate(loginSchema), authController.login);

router.post("/refresh", authController.refresh);
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.me);

router.post("/verify-email", validate(verifyEmailSchema), authController.verifyEmail);
router.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);
router.patch(
  "/change-password",
  protect,
  validate(changePasswordSchema),
  authController.changePassword
);
router.patch("/profile", protect, validate(updateProfileSchema), authController.updateProfile);

export default router;
