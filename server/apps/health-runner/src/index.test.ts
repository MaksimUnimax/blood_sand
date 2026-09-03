import { expect, it } from 'vitest';
import { NoopBrowserDriver } from './index.js';

it('keeps browser family explicit at the health-core boundary', async () => {
  const driver = new NoopBrowserDriver('yandex_chromium');
  await driver.start();
  expect(driver.family).toBe('yandex_chromium');
  await driver.stop();
});
