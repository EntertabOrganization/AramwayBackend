import { defineConfig } from "@playwright/test";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const baseURL = `http://localhost:${PORT}/api`;

// API-only Playwright suite that hits the real Express app backed by the
// real Postgres database (via DATABASE_URL in .env) — distinct from the
// Jest suite in tests/, which mocks Prisma and needs no live database.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL,
  },
  webServer: {
    command: "npm run dev",
    url: `http://localhost:${PORT}/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
