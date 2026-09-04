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

/** SemVer 2.0 precedence. Inputs are deliberately parsed through the frozen P3.1 grammar. */
export function compareSemVerV1(a: string, b: string): -1 | 0 | 1 {
  const left = SemVerV1Schema.parse(a);
  const right = SemVerV1Schema.parse(b);
  const parse = (value: string) => {
    const withoutBuild = value.split("+", 1)[0]!;
    const [core, prerelease] = withoutBuild.split("-", 2);
    const parts = core!.split(".").map(Number);
    const [major, minor, patch] = parts as [number, number, number];
    return { major, minor, patch, prerelease: prerelease?.split(".") ?? [] };
  };
  const x = parse(left),
    y = parse(right);
  for (const key of ["major", "minor", "patch"] as const) {
    if (x[key] !== y[key]) return x[key] < y[key] ? -1 : 1;
  }
  if (!x.prerelease.length || !y.prerelease.length)
    return x.prerelease.length === y.prerelease.length
      ? 0
      : x.prerelease.length
        ? -1
        : 1;
  for (let i = 0; i < Math.min(x.prerelease.length, y.prerelease.length); i++) {
    const l = x.prerelease[i]!,
      r = y.prerelease[i]!;
    if (l === r) continue;
    const ln = /^\d+$/.test(l),
      rn = /^\d+$/.test(r);
    if (ln && rn) return Number(l) < Number(r) ? -1 : 1;
    if (ln !== rn) return ln ? -1 : 1;
    return l < r ? -1 : 1; // ASCII code-unit ordering; never locale-sensitive.
  }
  return x.prerelease.length === y.prerelease.length
    ? 0
    : x.prerelease.length < y.prerelease.length
      ? -1
      : 1;
}

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
