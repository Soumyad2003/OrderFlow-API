import { describe, it } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import jwtAuth from "../src/middlewares/jwt.middleware.js";
import errorHandler from "../src/middlewares/errorHandler.middleware.js";
import notFoundHandler from "../src/middlewares/notFound.middleware.js";
import { ApplicationError } from "../src/error-handler/applicationError.js";

function createMockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

describe("JWT Auth Middleware", () => {
  process.env.JWT_SECRET = "test-secret-key";

  it("returns 401 when authorization header is missing", () => {
    const req = { headers: {} };
    const res = createMockRes();
    let nextCalled = false;

    jwtAuth(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
  });

  it("returns 401 for an invalid token", () => {
    const req = { headers: { authorization: "Bearer invalid.token.here" } };
    const res = createMockRes();
    let nextCalled = false;

    jwtAuth(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, "Invalid token.");
  });

  it("returns 401 for an expired token", () => {
    const expiredToken = jwt.sign(
      { userID: "123", email: "a@b.com" },
      process.env.JWT_SECRET,
      { expiresIn: "-1s" }
    );
    const req = { headers: { authorization: `Bearer ${expiredToken}` } };
    const res = createMockRes();
    let nextCalled = false;

    jwtAuth(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.match(res.body.message, /expired/i);
  });

  it("calls next and attaches userID and userEmail for valid Bearer token", () => {
    const token = jwt.sign(
      { userID: "user-123", email: "test@example.com" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createMockRes();
    let nextCalled = false;

    jwtAuth(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(req.userID, "user-123");
    assert.equal(req.userEmail, "test@example.com");
  });
});

describe("Error Handler Middleware", () => {
  const dummyReq = { originalUrl: "/api/test", method: "POST" };

  it("handles ApplicationError with custom status code", () => {
    const err = new ApplicationError("Cart is empty", 400);
    const res = createMockRes();

    errorHandler(err, dummyReq, res, () => {});

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { success: false, message: "Cart is empty" });
  });

  it("handles Mongoose CastError with 400", () => {
    const err = new mongoose.Error.CastError("ObjectId", "bad-id", "_id");
    const res = createMockRes();

    errorHandler(err, dummyReq, res, () => {});

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Invalid _id/);
  });

  it("handles duplicate key error (11000) with 409", () => {
    const err = { code: 11000, keyValue: { email: "a@b.com" }, message: "Dup" };
    const res = createMockRes();

    errorHandler(err, dummyReq, res, () => {});

    assert.equal(res.statusCode, 409);
    assert.equal(res.body.message, "email already exists");
  });

  it("handles Multer LIMIT_FILE_SIZE error with 400", () => {
    const err = { name: "MulterError", code: "LIMIT_FILE_SIZE", message: "Too big" };
    const res = createMockRes();

    errorHandler(err, dummyReq, res, () => {});

    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /5MB/);
  });

  it("handles unknown errors with 500", () => {
    const err = new Error("Unexpected crash");
    const res = createMockRes();

    errorHandler(err, dummyReq, res, () => {});

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.message, "Internal server error");
  });
});

describe("Not Found Middleware", () => {
  it("returns 404 JSON response", () => {
    const req = { originalUrl: "/api/unknown" };
    const res = createMockRes();

    notFoundHandler(req, res);

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /\/api\/unknown/);
  });
});

