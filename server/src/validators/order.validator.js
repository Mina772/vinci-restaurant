import { z } from "zod";
import { ORDER_STATUSES } from "../models/order.model.js";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const addToCartSchema = z.object({
  body: z.object({
    productId: objectId,
    quantity: z.number().int().positive().max(50).default(1),
    selectedSize: z.object({ name: z.string(), priceDelta: z.number() }).optional(),
    selectedExtras: z
      .array(z.object({ name: z.string(), priceDelta: z.number() }))
      .optional(),
    notes: z.string().max(300).optional(),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({ itemId: objectId }),
  body: z.object({ quantity: z.number().int().min(0).max(50) }),
});

export const applyCouponSchema = z.object({
  body: z.object({ code: z.string().min(2).max(40) }),
});

const addressSchema = z.object({
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const checkoutSchema = z.object({
  body: z.object({
    type: z.enum(["delivery", "pickup", "dine_in"]).default("delivery"),
    address: addressSchema.optional(),
    paymentMethod: z.enum(["stripe", "paypal", "cash", "wallet"]).default("cash"),
    tip: z.number().nonnegative().default(0),
    notes: z.string().max(500).optional(),
    scheduledFor: z.coerce.date().optional(),
    couponCode: z.string().optional(),
    guestEmail: z.string().email().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    status: z.enum(ORDER_STATUSES),
    note: z.string().max(300).optional(),
  }),
});
