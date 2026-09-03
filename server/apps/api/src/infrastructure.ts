import type { DatabaseRuntime } from "@product/db";

export function createInfrastructureReadiness(
  database: Pick<DatabaseRuntime, "ready">,
): () => Promise<boolean> {
  return async () => {
    try {
      await database.ready();
      return true;
    } catch {
      return false;
    }
  };
}
