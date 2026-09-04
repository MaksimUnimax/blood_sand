import { z } from "zod";

/** Shared P3 wire/persistence lexical rules.  These do not compare versions. */
export const SemVerV1Schema = z
  .string()
  .min(1)
  .max(64)
  .regex(
    /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/,
  );
export const StableMachineIdentifierV1Schema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9][a-z0-9._-]*$/);

const EnvironmentSchema = z.enum(["development", "test", "production"]);
export const AppConfigSchema = z.object({
  environment: EnvironmentSchema,
  databaseUrl: z.string().url(),
  logLevel: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  apiPort: z.coerce.number().int().min(1).max(65535).default(3000),
  workerReadyDelayMs: z.coerce.number().int().min(0).max(60_000).default(0),
});
export type AppConfig = z.infer<typeof AppConfigSchema>;

export function loadConfig(environment: NodeJS.ProcessEnv): AppConfig {
  return AppConfigSchema.parse({
    environment: environment.NODE_ENV ?? "development",
    databaseUrl: environment.DATABASE_URL,
    logLevel: environment.LOG_LEVEL,
    apiPort: environment.API_PORT,
    workerReadyDelayMs: environment.WORKER_READY_DELAY_MS,
  });
}
export * from "./browser";
