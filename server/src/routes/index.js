import { Router } from "express";
import authRoutes from "./auth.routes.js";
import catalogRoutes from "./catalog.routes.js";
import cartRoutes from "./cart.routes.js";
import orderRoutes from "./order.routes.js";
import userRoutes from "./user.routes.js";
import reservationRoutes from "./reservation.routes.js";
import adminRoutes from "./admin.routes.js";

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Health check
 *     responses:
 *       200: { description: Service healthy }
 */
router.get("/health", (_req, res) =>
  res.json({ success: true, status: "ok", uptime: process.uptime(), timestamp: new Date() })
);

router.use("/auth", authRoutes);
router.use("/", catalogRoutes); // /categories, /products
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/users", userRoutes);
router.use("/reservations", reservationRoutes);
router.use("/admin", adminRoutes);

export default router;
