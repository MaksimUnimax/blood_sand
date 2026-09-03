import nodemailer, { type Transporter } from "nodemailer";
import type { EmailProvider } from "@product/auth";
import { z } from "zod";
const SmtpSchema = z.object({
  host: z.string().min(1),
  port: z.coerce.number().int().min(1).max(65535),
  secure: z.preprocess(
    (value) => value === true || value === "true",
    z.boolean(),
  ),
  username: z.string().optional(),
  password: z.string().optional(),
  from: z.string().email(),
});
export type SmtpConfig = z.infer<typeof SmtpSchema>;
export function loadSmtpConfig(env: NodeJS.ProcessEnv): SmtpConfig {
  const config = SmtpSchema.parse({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    username: env.SMTP_USERNAME || undefined,
    password: env.SMTP_PASSWORD || undefined,
    from: env.SMTP_FROM,
  });
  if (
    (config.username && !config.password) ||
    (!config.username && config.password)
  )
    throw new Error("SMTP username and password must be configured together");
  if (env.NODE_ENV === "production" && !config.secure)
    throw new Error("production SMTP requires TLS");
  return config;
}
export class SmtpEmailProvider implements EmailProvider {
  public constructor(
    private readonly config: SmtpConfig,
    private readonly transport: Pick<
      Transporter,
      "sendMail"
    > = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.username
        ? { user: config.username, pass: config.password }
        : undefined,
      tls: { rejectUnauthorized: true },
    }),
  ) {}
  async sendLoginOtp(input: {
    deliveryId: string;
    recipient: string;
    otpCode: string;
    expiresAt: Date;
  }) {
    const response = await this.transport.sendMail({
      from: this.config.from,
      to: input.recipient,
      subject: "Your sign-in code",
      text: `Your sign-in code is ${input.otpCode}. It expires at ${input.expiresAt.toISOString()}.`,
      messageId: `<${input.deliveryId}@product-control-plane>`,
    });
    return { providerMessageId: response.messageId };
  }
}
