import { describe, expect, it } from "vitest";
import {
  checkOpenApiArtifact,
  compareOpenApiArtifact,
  generateOpenApiRepresentation,
} from "./openapi.js";

describe("OpenAPI foundation", () => {
  it("compares matching and modified artifacts deterministically", () => {
    const artifact = '{\n  "openapi": "3.1.0"\n}\n';
    expect(compareOpenApiArtifact(artifact, artifact)).toBe(true);
    expect(
      compareOpenApiArtifact(artifact, '{\n  "openapi": "3.0.0"\n}\n'),
    ).toBe(false);
  });

  it("generates only the implemented health API surface", async () => {
    const document = JSON.parse(await generateOpenApiRepresentation()) as {
      openapi: string;
      paths: Record<string, unknown>;
    };
    expect(document.openapi).toBe("3.1.0");
    expect(document.paths).toHaveProperty("/health/live");
    expect(document.paths).toHaveProperty("/health/ready");
    expect(document.paths).not.toHaveProperty("/v1/auth/otp/request");
    expect(document.paths).not.toHaveProperty("/v1/bootstrap");
    expect(document.paths).not.toHaveProperty("/v1/billing/checkouts");
    expect(document.paths).not.toHaveProperty("/test-controlled-error");
  });

  it("accepts the tracked artifact when it is generated from the current routes", async () => {
    await expect(checkOpenApiArtifact()).resolves.toBe(true);
  });
});
