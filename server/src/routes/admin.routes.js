import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { userController } from "../controllers/user.controller.js";
import { couponController } from "../controllers/coupon.controller.js";
import { reviewController } from "../controllers/review.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createCouponSchema } from "../validators/misc.validator.js";

const router = Router();
router.use(protect, authorize("admin", "manager"));

/**
 * @openapi
 * /admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Dashboard KPIs, revenue charts and top products
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       403: { description: Forbidden }
 */
router.get("/dashboard", adminController.dashboard);
router.get("/reports/sales", adminController.salesReport);

// User management
router.get("/users", userController.listUsers);
router.patch("/users/:id/role", userController.updateUserRole);
router.patch("/users/:id/toggle-active", userController.toggleUserActive);

// Coupons
router.get("/coupons", couponController.list);
router.post("/coupons", validate(createCouponSchema), couponController.create);
router.patch("/coupons/:id", couponController.update);
router.delete("/coupons/:id", couponController.remove);

// Review moderation
router.patch("/reviews/:id/moderate", reviewController.moderate);
router.patch("/reviews/:id/reply", reviewController.reply);
router.delete("/reviews/:id", reviewController.remove);

export default router;
