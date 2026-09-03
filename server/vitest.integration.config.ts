import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // The integration suites deliberately reset one disposable database.  Keeping
    // files sequential also makes the concurrency assertions meaningful.
    fileParallelism: false,
    include: [
      "packages/db/src/**/*.integration.test.ts",
      "integration/**/*.integration.test.ts",
    ],
  },
});
