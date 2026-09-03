import { describe, expect, it } from "vitest";
import { SensitiveLogPaths } from "./index.js";

describe("SensitiveLogPaths", () => {
  it("protects the recognized secret aliases", () => {
    expect(SensitiveLogPaths).toEqual(
      expect.arrayContaining([
        "authorization",
        "cookie",
        '["set-cookie"]',
        "password",
        "token",
        "secret",
        "refresh_token",
        "refreshToken",
        "access_token",
        "accessToken",
        "api_key",
        "apiKey",
        "req.headers.authorization",
        "req.headers.cookie",
        'req.headers["set-cookie"]',
      ]),
    );
  });
});
