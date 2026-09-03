import { describe, expect, it } from "vitest";
import { createLogger, SensitiveLogPaths } from "./index.js";

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

  it("redacts device-authorization secrets from structured log records", () => {
    const lines: string[] = [];
    const logger = createLogger("info", {
      write: (line: string) => {
        lines.push(line);
        return true;
      },
    });
    const values = {
      deviceCode: "synthetic-device-code",
      userCode: "synthetic-user-code",
      idempotency: "synthetic-idempotency-key",
      session: "synthetic-portal-session",
      csrf: "synthetic-csrf-token",
      envelope: "synthetic-envelope-ciphertext",
    };
    logger.info({
      deviceCode: values.deviceCode,
      userCode: values.userCode,
      ciphertext: values.envelope,
      req: {
        ip: "198.51.100.25",
        remoteAddress: "198.51.100.25",
        headers: {
          "idempotency-key": values.idempotency,
          cookie: `pcp_portal_session=${values.session}; pcp_csrf=${values.csrf}`,
          "x-csrf-token": values.csrf,
        },
      },
    });
    const serialized = lines.join("");
    for (const value of Object.values(values))
      expect(serialized).not.toContain(value);
    expect(serialized).not.toContain("198.51.100.25");
  });
});
