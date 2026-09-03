import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { AppConfig } from "@product/shared";
import { createApiApp } from "./app.js";
import {
  AuthService,
  deriveAuthKeys,
  type AuthRepository,
} from "@product/auth";
import {
  DeviceAuthorizationService,
  deriveDeviceAuthKeys,
  type DeviceAuthorizationRepository,
} from "@product/device-auth";

type JsonPrimitive = boolean | null | number | string;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

const artifactPath = resolve(
  fileURLToPath(new URL("../../../openapi/openapi.json", import.meta.url)),
);
const generatorConfig: AppConfig = {
  environment: "test",
  databaseUrl: "postgres://openapi:openapi@127.0.0.1:5432/openapi",
  logLevel: "error",
  apiPort: 0,
  workerReadyDelayMs: 0,
};

export function canonicalizeJson(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(canonicalizeJson);
  if (value !== null && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalizeJson(value[key]!)]),
    );
  return value;
}

export function serializeCanonicalJson(value: JsonValue): string {
  return `${JSON.stringify(canonicalizeJson(value), null, 2)}\n`;
}

export function compareOpenApiArtifact(
  expected: string,
  actual: string,
): boolean {
  return expected === actual;
}

export async function generateOpenApiRepresentation(): Promise<string> {
  const fake: AuthRepository = {
    requestOtp: async () => ({ ok: false, code: "AUTH_RATE_LIMITED" }),
    verifyOtp: async () => ({ ok: false, code: "AUTH_OTP_INVALID" }),
    authenticate: async () => undefined,
    revoke: async () => "missing",
  };
  const app = createApiApp({
    config: generatorConfig,
    isInfrastructureReady: async () => true,
    authService: new AuthService(fake, deriveAuthKeys(Buffer.alloc(32, 1))),
    deviceAuthorizationService: new DeviceAuthorizationService(
      {
        start: async () => ({ ok: false, code: "DEVICE_AUTH_INVALID" }),
        approve: async () => ({ ok: false, code: "DEVICE_AUTH_INVALID" }),
        deny: async () => ({ ok: false, code: "DEVICE_AUTH_INVALID" }),
        expireDue: async () => 0,
      } satisfies DeviceAuthorizationRepository,
      deriveDeviceAuthKeys(Buffer.alloc(32, 1)),
    ),
  });
  try {
    await app.ready();
    return serializeCanonicalJson(app.swagger() as unknown as JsonValue);
  } finally {
    await app.close();
  }
}

export async function generateOpenApiArtifact(): Promise<void> {
  await mkdir(dirname(artifactPath), { recursive: true });
  await writeFile(artifactPath, await generateOpenApiRepresentation(), "utf8");
}

export async function checkOpenApiArtifact(): Promise<boolean> {
  const [expected, actual] = await Promise.all([
    generateOpenApiRepresentation(),
    readFile(artifactPath, "utf8"),
  ]);
  return compareOpenApiArtifact(expected, actual);
}

async function main(): Promise<void> {
  if (process.argv[2] === "generate") return generateOpenApiArtifact();
  if (process.argv[2] === "check") {
    if (await checkOpenApiArtifact()) return;
    console.error(
      "OpenAPI artifact drift detected: run pnpm openapi:generate and review the tracked artifact.",
    );
    process.exitCode = 1;
    return;
  }
  console.error("Usage: pnpm openapi:generate | pnpm openapi:check");
  process.exitCode = 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) void main();
