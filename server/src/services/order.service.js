import mongoose from "mongoose";
import { Cart } from "../models/cart.model.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Coupon } from "../models/coupon.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { sendEmail, emailTemplates } from "../utils/email.js";

const TAX_RATE = 0.14;
const BASE_DELIVERY_FEE = 30;
const FREE_DELIVERY_THRESHOLD = 500;
const LOYALTY_RATE = 0.05;

/** Calculate an order's monetary breakdown. */
export const calculateTotals = ({ subtotal, discount = 0, type = "delivery", tip = 0 }) => {
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * TAX_RATE * 100) / 100;
  const deliveryFee =
    type === "delivery" && subtotal < FREE_DELIVERY_THRESHOLD ? BASE_DELIVERY_FEE : 0;
  const total = Math.round((taxable + tax + deliveryFee + tip) * 100) / 100;
  return { subtotal, discount, tax, deliveryFee, tip, total };
};

export const orderService = {
  calculateTotals,

  /**
   * Create an order from the user's cart within a transaction:
   * validates stock, applies coupon, decrements stock, awards loyalty, clears cart.
   */
  async checkout(user, payload) {
    const cart = await Cart.findOne({ user: user._id });
    if (!cart || cart.items.length === 0) throw ApiError.badRequest("Cart is empty");

    const session = await mongoose.startSession();
    try {
      let created;
      await session.withTransaction(async () => {
        const productIds = cart.items.map((i) => i.product);
        const products = await Product.find({ _id: { $in: productIds } }).session(session);
        const map = new Map(products.map((p) => [String(p._id), p]));

        for (const item of cart.items) {
          const p = map.get(String(item.product));
          if (!p || !p.isAvailable) throw ApiError.badRequest(`${item.name} is unavailable`);
          if (p.stock < item.quantity)
            throw ApiError.badRequest(`Insufficient stock for ${item.name}`);
        }

        const subtotal = cart.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

        let discount = 0;
        let couponDoc = null;
        const code = payload.couponCode;
        if (code) {
          couponDoc = await Coupon.findOne({ code: code.toUpperCase() }).session(session);
          if (!couponDoc) throw ApiError.badRequest("Invalid coupon");
          const evalResult = couponDoc.evaluate(subtotal, user._id);
          if (!evalResult.valid) throw ApiError.badRequest(evalResult.reason);
          discount = evalResult.discount;
        }

        const totals = calculateTotals({
          subtotal,
          discount,
          type: payload.type,
          tip: payload.tip || 0,
        });

        const [order] = await Order.create(
          [
            {
              user: user._id,
              items: cart.items.map((i) => ({
                product: i.product,
                name: i.name,
                image: i.image,
                unitPrice: i.unitPrice,
                quantity: i.quantity,
                selectedSize: i.selectedSize,
                selectedExtras: i.selectedExtras,
                notes: i.notes,
              })),
              ...totals,
              coupon: couponDoc ? { code: couponDoc.code, discount } : undefined,
              type: payload.type,
              address: payload.address,
              notes: payload.notes,
              scheduledFor: payload.scheduledFor,
              status: "pending",
              payment: {
                method: payload.paymentMethod,
                status: "pending",
              },
            },
          ],
          { session }
        );

        for (const item of cart.items) {
          await Product.updateOne(
            { _id: item.product },
            { $inc: { stock: -item.quantity, soldCount: item.quantity } },
            { session }
          );
        }

        if (couponDoc) {
          await Coupon.updateOne(
            { _id: couponDoc._id },
            { $inc: { usedCount: 1 }, $addToSet: { usedBy: user._id } },
            { session }
          );
        }

        const points = Math.floor(totals.total * LOYALTY_RATE);
        if (points > 0)
          await User.updateOne(
            { _id: user._id },
            { $inc: { loyaltyPoints: points } },
            { session }
          );

        cart.items = [];
        cart.coupon = null;
        await cart.save({ session });

        created = order;
      });

      await Notification.create({
        user: user._id,
        title: "Order placed",
        body: `Your order ${created.orderNumber} has been received.`,
        type: "order",
        link: `/orders/${created._id}`,
      });
      const tpl = emailTemplates.orderConfirmed(user.name, created.orderNumber);
      await sendEmail({ to: user.email, ...tpl });

      return created;
    } finally {
      session.endSession();
    }
  },

  /** Transition an order to a new status, appending to the audit history. */
  async updateStatus(orderId, status, note) {
    const order = await Order.findById(orderId);
    if (!order) throw ApiError.notFound("Order not found");
    order.status = status;
    order.statusHistory.push({ status, note });
    if (status === "delivered" || status === "completed") {
      if (order.payment.method === "cash") {
        order.payment.status = "paid";
        order.payment.paidAt = new Date();
      }
    }
    await order.save();
    await Notification.create({
      user: order.user,
      title: "Order update",
      body: `Order ${order.orderNumber} is now ${status.replace(/_/g, " ")}.`,
      type: "order",
      link: `/orders/${order._id}`,
    });
    return order;
  },
};
