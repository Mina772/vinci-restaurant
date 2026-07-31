import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Category } from "../models/category.model.js";

export const categoryController = {
  list: asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.parent === "null") filter.parent = null;
    else if (req.query.parent) filter.parent = req.query.parent;
    if (req.query.active !== "false") filter.isActive = true;

    const categories = await Category.find(filter)
      .populate("subcategories")
      .sort({ order: 1, name: 1 });
    return ApiResponse.ok(res, categories);
  }),

  getOne: asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id).populate("subcategories");
    if (!category) throw ApiError.notFound("Category not found");
    return ApiResponse.ok(res, category);
  }),

  create: asyncHandler(async (req, res) => {
    const category = await Category.create(req.body);
    return ApiResponse.created(res, category, "Category created");
  }),

  update: asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) throw ApiError.notFound("Category not found");
    return ApiResponse.ok(res, category, "Category updated");
  }),

  remove: asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) throw ApiError.notFound("Category not found");
    return ApiResponse.ok(res, null, "Category deleted");
  }),
};
