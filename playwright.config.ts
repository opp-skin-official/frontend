import { defineConfig, devices } from "@playwright/test";
import { API_ORIGIN } from "./e2e/mock-api";

/**
 * 스모크 테스트: 프로덕션 빌드(next build → next start)를 띄우고, 백엔드는 가짜 응답(e2e/mock-api.ts)으로 대신한다.
 * 실행: npm run test:e2e (처음 한 번 npx playwright install chromium)
 */
const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    ...devices["Pixel 7"], // 모바일 화면 기준 앱
  },
  projects: [{ name: "chromium" }],
  webServer: {
    // 개발 서버(.next)와 겹치지 않게 빌드 결과를 따로 둔다.
    command: `npx next build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    timeout: 300_000,
    reuseExistingServer: !process.env.CI,
    env: { NEXT_PUBLIC_API_BASE_URL: API_ORIGIN, NEXT_DIST_DIR: ".next-e2e" },
  },
});
