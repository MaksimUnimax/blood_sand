import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApiApp } from "../apps/api/src/app.js";
import { createInfrastructureReadiness } from "../apps/api/src/infrastructure.js";
import {
  createDatabaseRuntime,
  type DatabaseRuntime,
} from "../packages/db/src/index.js";
import type { AppConfig } from "../packages/shared/src/index.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is required for pnpm test:integration (real PostgreSQL is not optional).",
  );
}

const config: AppConfig = {
  environment: "test",
  databaseUrl: connectionString,
  logLevel: "info",
  apiPort: 3000,
  workerReadyDelayMs: 0,
};

let database: DatabaseRuntime;
let app: ReturnType<typeof createApiApp>;

describe("API PostgreSQL readiness integration", () => {
  beforeAll(async () => {
    database = createDatabaseRuntime(connectionString);
    app = createApiApp({
      config,
      isInfrastructureReady: createInfrastructureReadiness(database),
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("reports ready with PostgreSQL, then unready after the runtime closes while liveness remains live", async () => {
    expect((await app.inject("/health/ready")).statusCode).toBe(200);

    await database.close();

    expect((await app.inject("/health/ready")).statusCode).toBe(503);
    expect((await app.inject("/health/live")).statusCode).toBe(200);
  });
});
