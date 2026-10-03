import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
    testTimeout: 120000,
    hookTimeout: 120000,
    globalSetup: ['./tests/globalSetup.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'file:./data/pgtest',
      AUTH_SECRET: 'test-auth-secret-value-1234567890',
      ENCRYPTION_KEY: 'test-encryption-key-value-1234567890',
      JUNKIE_MOCK: 'true',
      AI_MOCK: 'true',
      APP_URL: 'http://localhost:3000',
      RATE_LIMIT_SCALE: '100'
    }
  }
});
