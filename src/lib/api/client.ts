import createClient from "openapi-fetch";
import type { paths } from "./schema";

// 타입은 백엔드 OpenAPI 명세에서 생성한다: npm run api:gen
export const api = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
});
