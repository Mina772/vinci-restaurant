import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createReviewSchema = z.object({
  params: z.object({ productId: objectId }),
  body: z.object({
    rating: z.number().int().min(1).max(5),
    title: z.string().max(120).optional(),
    comment: z.string().max(2000).optional(),
    images: z.array(z.string().url()).optional(),
  }),
});

export const createReservationSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(6),
    partySize: z.number().int().min(1).max(30),
    date: z.coerce.date(),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM"),
    notes: z.string().max(500).optional(),
  }),
});

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(2).max(40),
    description: z.string().optional(),
    type: z.enum(["percent", "fixed"]),
    value: z.number().positive(),
    minOrderAmount: z.number().nonnegative().optional(),
    maxDiscount: z.number().positive().optional(),
    usageLimit: z.number().int().nonnegative().optional(),
    perUserLimit: z.number().int().positive().optional(),
    startsAt: z.coerce.date().optional(),
    expiresAt: z.coerce.date().optional(),
    isActive: z.boolean().optional(),
  }),
});
