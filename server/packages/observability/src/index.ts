import pino, { type Logger, type LoggerOptions } from "pino";

export const SensitiveLogPaths = [
  "authorization",
  "cookie",
  '["set-cookie"]',
  "password",
  "token",
  "refresh_token",
  "refreshToken",
  "access_token",
  "accessToken",
  "api_key",
  "apiKey",
  "secret",
  "authRootSecret",
  "authRootSecretB64",
  "smtpPassword",
  "req.headers.authorization",
  "req.headers.cookie",
  'req.headers["set-cookie"]',
] as const;

export function createLogger(level: string): Logger {
  const options: LoggerOptions = {
    level,
    redact: { paths: [...SensitiveLogPaths], censor: "[REDACTED]" },
  };
  return pino(options);
}
