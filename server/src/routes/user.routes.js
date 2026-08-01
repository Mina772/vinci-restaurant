import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(protect);

// Favorites
router.get("/favorites", userController.listFavorites);
router.post("/favorites/:productId", userController.toggleFavorite);

// Addresses
router.get("/addresses", userController.listAddresses);
router.post("/addresses", userController.addAddress);
router.patch("/addresses/:addressId", userController.updateAddress);
router.delete("/addresses/:addressId", userController.removeAddress);

// Notifications
router.get("/notifications", userController.listNotifications);
router.patch("/notifications/:id/read", userController.markNotificationRead);
router.patch("/notifications/read-all", userController.markAllRead);

export default router;
