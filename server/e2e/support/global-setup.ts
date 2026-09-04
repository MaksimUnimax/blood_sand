import { migrateE2eDatabase, resetE2eDatabase } from "./database.js";

export default async function globalSetup(): Promise<void> {
  await migrateE2eDatabase();
  await resetE2eDatabase();
}
