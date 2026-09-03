import { describe, expect, it, vi } from "vitest";
import { loadSmtpConfig, SmtpEmailProvider } from "./index.js";

describe("P2.2 SMTP adapter", () => {
  const config = {
    host: "smtp.example.test",
    port: 587,
    secure: false,
    from: "no-reply@example.test",
  };
  it("SMTP-01..06 owns the fixed structured OTP message", async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: "safe-id" });
    const provider = new SmtpEmailProvider(config, { sendMail } as never);
    await expect(
      provider.sendLoginOtp({
        deliveryId: "job-1",
        recipient: "person@example.test",
        otpCode: "012345",
        expiresAt: new Date("2030-01-01T00:00:00.000Z"),
      }),
    ).resolves.toEqual({ providerMessageId: "safe-id" });
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "person@example.test",
        subject: "Your sign-in code",
        messageId: "<job-1@product-control-plane>",
      }),
    );
    const mail = sendMail.mock.calls[0]?.[0] as { text: string; html?: string };
    expect(mail.text).toContain("012345");
    expect(mail.text).toContain("2030-01-01T00:00:00.000Z");
    expect(mail.html).toBeUndefined();
  });
  it("SMTP-07..09 keeps provider failures opaque and validates TLS/auth config", async () => {
    const provider = new SmtpEmailProvider(config, {
      sendMail: vi.fn().mockRejectedValue(new Error("smtp password leaked")),
    } as never);
    await expect(
      provider.sendLoginOtp({
        deliveryId: "job-2",
        recipient: "person@example.test",
        otpCode: "012345",
        expiresAt: new Date(),
      }),
    ).rejects.toThrow("smtp password leaked");
    expect(
      loadSmtpConfig({
        SMTP_HOST: "smtp.example.test",
        SMTP_PORT: "587",
        SMTP_SECURE: "false",
        SMTP_FROM: "no-reply@example.test",
      }).secure,
    ).toBe(false);
    expect(() =>
      loadSmtpConfig({
        NODE_ENV: "production",
        SMTP_HOST: "smtp.example.test",
        SMTP_PORT: "587",
        SMTP_SECURE: "false",
        SMTP_FROM: "no-reply@example.test",
      }),
    ).toThrow();
    expect(() =>
      loadSmtpConfig({
        SMTP_HOST: "smtp.example.test",
        SMTP_PORT: "587",
        SMTP_SECURE: "true",
        SMTP_USERNAME: "u",
        SMTP_FROM: "no-reply@example.test",
      }),
    ).toThrow();
  });
});
