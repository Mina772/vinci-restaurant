import { Router } from "express";
import { categoryController } from "../controllers/category.controller.js";
import { productController } from "../controllers/product.controller.js";
import { reviewController } from "../controllers/review.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import {
  createCategorySchema,
  updateCategorySchema,
  createProductSchema,
  updateProductSchema,
  listProductsSchema,
  idParamSchema,
} from "../validators/catalog.validator.js";
import { createReviewSchema } from "../validators/misc.validator.js";

const router = Router();
const staff = authorize("admin", "manager");

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Catalog]
 *     summary: List categories (with subcategories)
 *     responses:
 *       200: { description: OK }
 */
router.get("/categories", categoryController.list);
router.get("/categories/:id", validate(idParamSchema), categoryController.getOne);
router.post("/categories", protect, staff, validate(createCategorySchema), categoryController.create);
router.patch("/categories/:id", protect, staff, validate(updateCategorySchema), categoryController.update);
router.delete("/categories/:id", protect, staff, validate(idParamSchema), categoryController.remove);

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Catalog]
 *     summary: List products with filtering, search, sort & pagination
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: limit, schema: { type: integer } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: category, schema: { type: string } }
 *       - { in: query, name: sort, schema: { type: string, example: "-ratingAverage,price" } }
 *     responses:
 *       200: { description: OK }
 */
router.get("/products", validate(listProductsSchema), productController.list);
router.get("/products/slug/:slug", productController.getBySlug);
router.get("/products/:id", validate(idParamSchema), productController.getOne);
router.post("/products", protect, staff, validate(createProductSchema), productController.create);
router.patch("/products/:id", protect, staff, validate(updateProductSchema), productController.update);
router.delete("/products/:id", protect, staff, validate(idParamSchema), productController.remove);

// Product reviews
router.get("/products/:productId/reviews", reviewController.listForProduct);
router.post(
  "/products/:productId/reviews",
  protect,
  validate(createReviewSchema),
  reviewController.create
);

export default router;
