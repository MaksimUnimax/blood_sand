import { describe, expect, it } from 'vitest';
import { loadConfig } from './index.js';

describe('loadConfig', () => {
  it('rejects an absent required database URL deterministically', () => {
    expect(() => loadConfig({ NODE_ENV: 'test' })).toThrow();
  });
});
