import type { Page, Route } from "@playwright/test";
import * as data from "./fixtures";

/** 테스트 빌드가 부르는 백엔드 주소. 실제로는 없는 주소라, 가짜 응답이 빠진 요청은 바로 드러난다. */
export const API_ORIGIN = "http://api.e2e.test";

type Reply = { status: number; body?: unknown };
type Rule = { method: string; path: RegExp; reply: (match: RegExpMatchArray) => Reply };

const ok = (body?: unknown): Reply => ({ status: body === undefined ? 204 : 200, body });

/** 로그인한 사용자 기준 기본 응답 (경로는 쿼리 없이 비교) */
const rules: Rule[] = [
  { method: "GET", path: /^\/api\/me$/, reply: () => ok(data.me) },
  { method: "DELETE", path: /^\/api\/me$/, reply: () => ok() },
  { method: "GET", path: /^\/api\/routines\/today$/, reply: () => ok(data.today) },
  { method: "GET", path: /^\/api\/care-plans\/current$/, reply: () => ok(data.plan) },
  { method: "GET", path: /^\/api\/progress-records$/, reply: () => ok(data.progressRecords) },
  { method: "PUT", path: /^\/api\/routine-items\/\d+\/checks\/[\d-]+$/, reply: () => ok() },
  { method: "DELETE", path: /^\/api\/routine-items\/\d+\/checks\/[\d-]+$/, reply: () => ok() },
  { method: "GET", path: /^\/api\/skin-survey$/, reply: () => ok(data.survey) },
  { method: "GET", path: /^\/api\/skin-survey\/assessments\/latest$/, reply: () => ok(data.assessment) },
  { method: "GET", path: /^\/api\/products\/recommendations$/, reply: () => ok(data.recommendations) },
  { method: "GET", path: /^\/api\/products$/, reply: () => ok(data.products) },
  { method: "GET", path: /^\/api\/products\/\d+$/, reply: () => ok(data.productDetail) },
  { method: "GET", path: /^\/api\/products\/\d+\/reviews$/, reply: () => ok(data.reviews) },
  { method: "GET", path: /^\/api\/products\/\d+\/review-form$/, reply: () => ok(data.reviewForm) },
  { method: "GET", path: /^\/api\/my-products$/, reply: () => ok(data.myProducts) },
  { method: "GET", path: /^\/api\/conversations$/, reply: () => ok(data.conversations) },
  { method: "GET", path: /^\/api\/conversations\/\d+$/, reply: () => ok(data.conversation) },
  { method: "GET", path: /^\/api\/consultations\/latest$/, reply: () => ok(data.consultation) },
  { method: "GET", path: /^\/api\/consultations\/\d+$/, reply: () => ok(data.consultation) },
  { method: "GET", path: /^\/api\/care-info$/, reply: () => ok(data.careInfo) },
];

export type ApiLog = {
  /** "GET /api/me" 형태로 받은 요청 */
  calls: string[];
  /** 가짜 응답이 없는 요청 (테스트가 끝날 때 비어 있어야 한다) */
  unmocked: string[];
};

export type MockOptions = {
  loggedIn?: boolean;
  /** 기본 응답을 덮어쓸 규칙 (앞에 있는 것이 먼저) */
  extra?: Rule[];
};

/** 페이지에서 나가는 백엔드 요청을 모두 가짜 응답으로 바꾼다. */
export async function mockApi(page: Page, { loggedIn = true, extra = [] }: MockOptions = {}): Promise<ApiLog> {
  const log: ApiLog = { calls: [], unmocked: [] };
  await page.route(`${API_ORIGIN}/**`, async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    const cors = {
      "access-control-allow-origin": request.headers()["origin"] ?? "*",
      "access-control-allow-credentials": "true",
      "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE",
      "access-control-allow-headers": "Content-Type,X-XSRF-TOKEN",
    };
    if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });

    const key = `${request.method()} ${url.pathname}`;
    log.calls.push(key);
    if (!loggedIn) return route.fulfill({ status: 401, headers: cors });

    for (const rule of [...extra, ...rules]) {
      const match = rule.method === request.method() ? url.pathname.match(rule.path) : null;
      if (!match) continue;
      const { status, body } = rule.reply(match);
      return route.fulfill({
        status,
        headers: { ...cors, ...(body === undefined ? {} : { "content-type": "application/json" }) },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    }
    log.unmocked.push(key);
    return route.fulfill({ status: 500, headers: cors, contentType: "application/json", body: '{"detail":"mock 없음"}' });
  });
  return log;
}
