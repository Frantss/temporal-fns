import { beforeEach, afterEach, vi } from 'vite-plus/test';

if (process.env.TEMPORAL_TEST_NATIVE !== '1') {
  await import('temporal-polyfill/global');
}
beforeEach(() => {
  vi.stubEnv('TZ', 'UTC');
});
afterEach(() => {
  vi.unstubAllEnvs();
});
