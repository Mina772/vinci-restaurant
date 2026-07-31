import { Router } from "express";
import { orderController } from "../controllers/order.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { checkoutSchema, updateOrderStatusSchema } from "../validators/order.validator.js";

const router = Router();
router.use(protect);

const staff = authorize("admin", "manager", "staff", "kitchen", "delivery");

/**
 * @openapi
 * /orders/checkout:
 *   post:
 *     tags: [Orders]
 *     summary: Place an order from the current cart
 *     responses:
 *       201: { description: Order placed }
 *       400: { description: Cart empty / stock issue }
 */
router.post("/checkout", validate(checkoutSchema), orderController.checkout);
router.get("/me", orderController.myOrders);

// Staff listing must precede the :id route.
router.get("/", staff, orderController.listAll);
router.get("/:id", orderController.getOne);
router.patch("/:id/cancel", orderController.cancel);
router.patch("/:id/status", staff, validate(updateOrderStatusSchema), orderController.updateStatus);
router.patch("/:id/assign-driver", authorize("admin", "manager"), orderController.assignDriver);

export default router;
