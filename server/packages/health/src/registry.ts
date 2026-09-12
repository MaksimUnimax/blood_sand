import { createHash } from "node:crypto";
import { canonicalizeJson } from "@product/remote-config";
import {
  HealthSuiteDefinitionSchema,
  type HealthSuiteDefinition,
} from "./types.js";

export function healthSuiteFingerprint(input: unknown): string {
  const definition = HealthSuiteDefinitionSchema.parse(input);
  return createHash("sha256")
    .update(canonicalizeJson(definition))
    .digest("hex");
}

export class HealthSuiteRegistry {
  public readonly definitions: readonly HealthSuiteDefinition[];
  private readonly byIdentity: ReadonlyMap<string, HealthSuiteDefinition>;

  public constructor(definitions: readonly unknown[]) {
    const parsed = definitions.map((definition) =>
      HealthSuiteDefinitionSchema.parse(definition),
    );
    const entries = parsed.map((definition) => {
      const identity = `${definition.machineKey}@${definition.revision}`;
      return [identity, definition] as const;
    });
    if (
      new Set(entries.map(([identity]) => identity)).size !== entries.length
    ) {
      throw new Error("DUPLICATE_HEALTH_SUITE_KEY_REVISION");
    }
    this.definitions = Object.freeze(parsed.slice());
    this.byIdentity = new Map(entries);
  }

  public get(
    machineKey: string,
    revision: number,
  ): HealthSuiteDefinition | undefined {
    return this.byIdentity.get(`${machineKey}@${revision}`);
  }
}

export function createHealthSuiteRegistry(
  definitions: readonly unknown[],
): HealthSuiteRegistry {
  return new HealthSuiteRegistry(definitions);
}
