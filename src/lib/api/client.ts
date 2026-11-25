import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./schema";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

/** 백엔드(Spring Security SPA CSRF)가 내려준 XSRF-TOKEN 쿠키 값. */
export function readXsrfToken(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = document.cookie
    .split("; ")
    .find((c) => c.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];
  return value ? decodeURIComponent(value) : undefined;
}

/** GET이 아닌 요청에 CSRF 토큰 헤더를 붙인다. */
const csrf: Middleware = {
  onRequest({ request }) {
    if (request.method === "GET") return;
    const token = readXsrfToken();
    if (token) request.headers.set("X-XSRF-TOKEN", token);
  },
};

// 타입은 백엔드 OpenAPI 명세에서 생성한다: npm run api:gen
// 로그인 세션 쿠키를 보내기 위해 credentials: "include"
export const api = createClient<paths>({
  baseUrl: API_BASE_URL,
  credentials: "include",
});
api.use(csrf);
