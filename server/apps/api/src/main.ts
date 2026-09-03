import { loadConfig } from '@product/shared';
import { createApiApp } from './app.js';

const config = loadConfig(process.env);
const app = createApiApp({ config });
let closing = false;
async function shutdown(signal: string): Promise<void> {
  if (closing) return;
  closing = true;
  app.log.info({ signal }, 'API shutdown requested');
  await app.close();
}
process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));
await app.listen({ host: '127.0.0.1', port: config.apiPort });
