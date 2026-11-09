const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

process.env.NODE_ENV = "test";
process.env.PORT = "5000";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/kazilink-test";
process.env.JWT_SECRET = "test-access-secret-that-is-long-enough-123";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-that-is-long-enough-456";
process.env.CLIENT_URL = "http://localhost:5173";

const mongoose = require("mongoose");
const { createApp } = require("../src/app");
const { requestBody, savedQuery } = require("../src/utils/schemas");
const app = createApp();

test("health reports whether MongoDB is connected", async () => {
  const response = await request(app).get("/api/v1/health");
  if (mongoose.connection.readyState === 1) {
    assert.equal(response.status, 200);
    assert.deepEqual(response.body.data, {
      status: "ok",
      database: "connected",
    });
  } else {
    assert.equal(response.status, 503);
    assert.equal(response.body.success, false);
    assert.equal(response.body.error, "Database unavailable.");
  }
});

test("registration validates input before accessing the database", async () => {
  const response = await request(app)
    .post("/api/v1/auth/register")
    .send({ name: "A", identity: "not-an-identity", password: "x", role: "admin" });
  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(typeof response.body.error, "string");
});

test("unknown API routes use the standard error response", async () => {
  const response = await request(app).get("/api/v1/not-a-route");
  assert.equal(response.status, 404);
  assert.equal(response.body.success, false);
  assert.match(response.body.error, /Route not found/);
});

test("protected endpoints reject requests without a bearer token", async () => {
  const response = await request(app).get("/api/v1/requests");
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("request deadlines reject impossible and past dates", () => {
  const base = {
    freelancerId: "507f1f77bcf86cd799439011",
    service: "Web design",
    description: "Build a website for my business.",
    budget: 5000,
    location: "Nairobi",
  };
  assert.equal(
    requestBody.safeParse({ ...base, deadline: "2026-02-31" }).success,
    false,
  );
  assert.equal(
    requestBody.safeParse({ ...base, deadline: "2000-01-01" }).success,
    false,
  );
});

test("saved-freelancer list supports bounded pagination", () => {
  assert.equal(savedQuery.safeParse({ page: "1", limit: "100" }).success, true);
  assert.equal(savedQuery.safeParse({ page: "0" }).success, false);
  assert.equal(savedQuery.safeParse({ limit: "101" }).success, false);
});
