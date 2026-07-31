import request from "supertest";
import { createApp } from "../src/app.js";
import { setupTestDB } from "./setup.js";

const app = createApp();
const api = "/api/v1";

setupTestDB();

const validUser = {
  name: "Test User",
  email: "test@vinci.test",
  password: "Passw0rd!",
};

describe("Auth flow", () => {
  it("registers a new user and returns tokens", async () => {
    const res = await request(app).post(`${api}/auth/register`).send(validUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it("rejects duplicate email", async () => {
    await request(app).post(`${api}/auth/register`).send(validUser);
    const res = await request(app).post(`${api}/auth/register`).send(validUser);
    expect(res.status).toBe(409);
  });

  it("rejects weak passwords via validation", async () => {
    const res = await request(app)
      .post(`${api}/auth/register`)
      .send({ ...validUser, password: "weak" });
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it("logs in with correct credentials", async () => {
    await request(app).post(`${api}/auth/register`).send(validUser);
    const res = await request(app)
      .post(`${api}/auth/login`)
      .send({ email: validUser.email, password: validUser.password });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it("rejects invalid credentials", async () => {
    await request(app).post(`${api}/auth/register`).send(validUser);
    const res = await request(app)
      .post(`${api}/auth/login`)
      .send({ email: validUser.email, password: "WrongPass1!" });
    expect(res.status).toBe(401);
  });

  it("protects /auth/me and returns the user with a token", async () => {
    const reg = await request(app).post(`${api}/auth/register`).send(validUser);
    const token = reg.body.data.accessToken;
    const res = await request(app)
      .get(`${api}/auth/me`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(validUser.email);

    const noAuth = await request(app).get(`${api}/auth/me`);
    expect(noAuth.status).toBe(401);
  });
});
