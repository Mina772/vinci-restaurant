import { Router } from "express";
import { cartController } from "../controllers/cart.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  addToCartSchema,
  updateCartItemSchema,
  applyCouponSchema,
} from "../validators/order.validator.js";

const router = Router();
router.use(protect);

/**
 * @openapi
 * /cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get the authenticated user's cart
 *     responses:
 *       200: { description: OK }
 */
router.get("/", cartController.get);
router.post("/items", validate(addToCartSchema), cartController.addItem);
router.patch("/items/:itemId", validate(updateCartItemSchema), cartController.updateItem);
router.delete("/items/:itemId", cartController.removeItem);
router.delete("/", cartController.clear);
router.post("/coupon", validate(applyCouponSchema), cartController.applyCoupon);

export default router;
