import { defineConfig } from 'vite-plus';
import { cucumber } from '@lotun/vitest-cucumber';

export default defineConfig({
  plugins: [cucumber({ import: ['test/behavior/steps.ts'] })],
  lint: {
    ignorePatterns: [
      'dist/**',
      'coverage/**',
      'website/.next/**',
      'website/.source/**',
      'website/out/**',
    ],
    options: { typeAware: true, typeCheck: true },
  },
  fmt: {
    singleQuote: true,
    printWidth: 100,
    sortImports: false,
    sortPackageJson: false,
    ignorePatterns: [
      'dist/**',
      'coverage/**',
      'test/features/**',
      'website/.next/**',
      'website/.source/**',
      'website/out/**',
      'website/next-env.d.ts',
    ],
  },
  test: {
    environment: 'node',
    server: { deps: { inline: ['@lotun/vitest-cucumber'] } },
    pool: 'forks',
    restoreMocks: true,
    testTimeout: 30000,
    include: ['test/**/*.test.ts', 'test/features/*.feature'],
    setupFiles: ['test/setup.ts'],
    sequence: { concurrent: false },
    forceRerunTriggers: ['**/package.json', '**/vite.config.*', 'test/features/**/*.feature'],
    typecheck: {
      enabled: true,
      tsconfig: 'tsconfig.test.json',
      include: ['test/**/*.test-d.ts'],
    },
  },
});
