import { Router } from "express";
import { reservationController } from "../controllers/reservation.controller.js";
import { protect, authorize, optionalAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createReservationSchema } from "../validators/misc.validator.js";

const router = Router();
const staff = authorize("admin", "manager", "staff");

/**
 * @openapi
 * /reservations:
 *   post:
 *     tags: [Reservations]
 *     summary: Request a table reservation (guest or authenticated)
 *     responses:
 *       201: { description: Reservation requested }
 */
router.post("/", optionalAuth, validate(createReservationSchema), reservationController.create);
router.get("/me", protect, reservationController.mine);
router.get("/", protect, staff, reservationController.listAll);
router.patch("/:id/status", protect, staff, reservationController.updateStatus);

export default router;
