import { migrateE2eDatabase } from "./database.js";

export default async function globalSetup(): Promise<void> {
  await migrateE2eDatabase();
}
