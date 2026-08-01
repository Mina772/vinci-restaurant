import request from "supertest";
import { createApp } from "../src/app.js";
import { setupTestDB } from "./setup.js";
import { Category } from "../src/models/category.model.js";
import { Product } from "../src/models/product.model.js";
import { calculateTotals } from "../src/services/order.service.js";

const app = createApp();
const api = "/api/v1";
setupTestDB();

const register = async () => {
  const res = await request(app)
    .post(`${api}/auth/register`)
    .send({ name: "Buyer", email: "buyer@vinci.test", password: "Passw0rd!" });
  return res.body.data.accessToken;
};

describe("Cart & checkout", () => {
  it("computes totals with tax and delivery fee", () => {
    const t = calculateTotals({ subtotal: 100, discount: 0, type: "delivery", tip: 10 });
    expect(t.tax).toBeCloseTo(14, 2);
    expect(t.deliveryFee).toBe(30);
    expect(t.total).toBeCloseTo(154, 2);
  });

  it("waives delivery fee above the free-delivery threshold", () => {
    const t = calculateTotals({ subtotal: 600, type: "delivery" });
    expect(t.deliveryFee).toBe(0);
  });

  it("adds an item to the cart and checks out", async () => {
    const token = await register();
    const cat = await Category.create({ name: "TestCat" });
    const product = await Product.create({
      name: "Test Pizza",
      category: cat._id,
      price: 100,
      stock: 10,
    });

    const add = await request(app)
      .post(`${api}/cart/items`)
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: String(product._id), quantity: 2 });
    expect(add.status).toBe(200);
    expect(add.body.data.items.length).toBe(1);

    const checkout = await request(app)
      .post(`${api}/orders/checkout`)
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "pickup", paymentMethod: "cash" });
    expect(checkout.status).toBe(201);
    expect(checkout.body.data.orderNumber).toMatch(/^VINCI-/);

    const refreshed = await Product.findById(product._id);
    expect(refreshed.stock).toBe(8); // stock decremented
    expect(refreshed.soldCount).toBe(2);
  });

  it("rejects checkout with an empty cart", async () => {
    const token = await register();
    const res = await request(app)
      .post(`${api}/orders/checkout`)
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "pickup", paymentMethod: "cash" });
    expect(res.status).toBe(400);
  });
});
