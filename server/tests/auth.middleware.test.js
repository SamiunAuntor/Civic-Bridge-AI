import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.FIREBASE_ADMIN_CREDENTIAL_BASE64 = Buffer.from("{}").toString(
  "base64",
);

const verifyIdToken = vi.fn();

vi.mock("firebase-admin/app", () => ({
  cert: vi.fn(() => ({})),
  getApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
  initializeApp: vi.fn(() => ({})),
}));

vi.mock("firebase-admin/auth", () => ({
  getAuth: vi.fn(() => ({
    verifyIdToken,
  })),
}));

const firebase = require("../src/config/firebase");
const userService = require("../src/services/user.service");
const verifyFirebaseToken = require("../src/middleware/auth.middleware");

describe("verifyFirebaseToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when bearer token is missing", async () => {
    const req = { headers: {} };
    const res = {
      status: vi.fn(() => res),
      json: vi.fn(() => res),
    };
    const next = vi.fn();

    await verifyFirebaseToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "No token provided",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when Firebase rejects the token", async () => {
    const verifyIdTokenSpy = vi
      .spyOn(firebase.auth, "verifyIdToken")
      .mockRejectedValue(new Error("invalid token"));
    const syncUserSpy = vi.spyOn(userService, "syncUser");
    const req = { headers: { authorization: "Bearer invalid" } };
    const res = {
      status: vi.fn(() => res),
      json: vi.fn(() => res),
    };
    const next = vi.fn();

    await verifyFirebaseToken(req, res, next);

    expect(verifyIdTokenSpy).toHaveBeenCalledWith("invalid");
    expect(syncUserSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
