import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { Coupon } from "../models/coupon.model.js";

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

/** Compute unit price = base + size delta + extras deltas. */
const computeUnitPrice = (product, selectedSize, selectedExtras = []) => {
  let price = product.price;
  if (selectedSize?.priceDelta) price += selectedSize.priceDelta;
  price += selectedExtras.reduce((s, e) => s + (e.priceDelta || 0), 0);
  return Math.round(price * 100) / 100;
};

export const cartController = {
  get: asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.user._id);
    await cart.populate("items.product", "name thumbnail isAvailable stock");
    return ApiResponse.ok(res, cart);
  }),

  addItem: asyncHandler(async (req, res) => {
    const { productId, quantity, selectedSize, selectedExtras, notes } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.isAvailable) throw ApiError.badRequest("Product unavailable");
    if (product.stock < quantity) throw ApiError.badRequest("Insufficient stock");

    const cart = await getOrCreateCart(req.user._id);
    const unitPrice = computeUnitPrice(product, selectedSize, selectedExtras);

    const sameConfig = (i) =>
      String(i.product) === productId &&
      i.selectedSize?.name === selectedSize?.name &&
      JSON.stringify((i.selectedExtras || []).map((e) => e.name).sort()) ===
        JSON.stringify((selectedExtras || []).map((e) => e.name).sort());

    const existing = cart.items.find(sameConfig);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        product: product._id,
        name: product.name,
        image: product.thumbnail,
        unitPrice,
        quantity,
        selectedSize,
        selectedExtras,
        notes,
      });
    }
    await cart.save();
    return ApiResponse.ok(res, cart, "Item added to cart");
  }),

  updateItem: asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.id(req.params.itemId);
    if (!item) throw ApiError.notFound("Cart item not found");
    if (req.body.quantity === 0) item.deleteOne();
    else item.quantity = req.body.quantity;
    await cart.save();
    return ApiResponse.ok(res, cart, "Cart updated");
  }),

  removeItem: asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.id(req.params.itemId);
    if (!item) throw ApiError.notFound("Cart item not found");
    item.deleteOne();
    await cart.save();
    return ApiResponse.ok(res, cart, "Item removed");
  }),

  clear: asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    cart.coupon = null;
    await cart.save();
    return ApiResponse.ok(res, cart, "Cart cleared");
  }),

  applyCoupon: asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.user._id);
    const coupon = await Coupon.findOne({ code: req.body.code.toUpperCase() });
    if (!coupon) throw ApiError.notFound("Coupon not found");
    const { valid, reason, discount } = coupon.evaluate(cart.subtotal, req.user._id);
    if (!valid) throw ApiError.badRequest(reason);
    cart.coupon = coupon._id;
    await cart.save();
    return ApiResponse.ok(res, { cart, discount }, "Coupon applied");
  }),
};
