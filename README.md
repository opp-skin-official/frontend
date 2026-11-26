# frontend

Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · TanStack Query · openapi-fetch

## 실행

```bash
cp .env.example .env.local
npm install
npm run dev        # http://localhost:3000
```

- `npm run api:gen`: 실행 중인 백엔드(8080)의 OpenAPI 명세로 `src/lib/api/schema.d.ts` 재생성
- `npm run typecheck` / `npm run lint` / `npm run build`

## 스모크 테스트 (Playwright)

주요 화면(로그인 전 홈·로그인, 홈, 루틴 체크, 제품 목록·상세·리뷰, 상담 시작·리포트, AI 채팅, 설문, 프로필, 관리 정보)이 깨지지 않는지 확인한다. 백엔드·AI 없이 돈다.

```bash
npx playwright install chromium   # 처음 한 번
npm run test:e2e                   # 프로덕션 빌드(.next-e2e)를 3100 포트로 띄워 테스트
```

- 백엔드 응답은 `e2e/fixtures.ts`의 가짜 데이터(백엔드 OpenAPI 타입으로 작성, API가 바뀌면 `typecheck`에서 걸림)를 `e2e/mock-api.ts`가 돌려준다.
- 가짜 응답이 없는 API를 부르거나 페이지 스크립트 오류가 나면 테스트가 실패한다. 화면에 새 API를 붙이면 `mock-api.ts`에 규칙을 추가한다.
- PR마다 CI(`e2e` 작업)에서 돈다. 실패하면 Actions 실행 결과의 `playwright-report` 첨부에서 화면 기록(trace)을 볼 수 있다.

## 배포 (Cloudflare Workers)

[@opennextjs/cloudflare](https://opennext.js.org/cloudflare)로 Next.js를 Workers에서 돌린다. 설정: `wrangler.jsonc`, `open-next.config.ts`.

- `NEXT_PUBLIC_API_BASE_URL`은 **빌드할 때** 들어간다(`https://api.opp.skin`). 바꾸면 다시 배포해야 한다.
- 로컬에서 Workers 런타임으로 확인: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080 npm run preview` (`.dev.vars`에 `NEXTJS_ENV=development`)
- 직접 배포: `npx wrangler login` 후 `NEXT_PUBLIC_API_BASE_URL=https://api.opp.skin npm run deploy`
- Git 자동 배포(Workers Builds): Cloudflare 대시보드 > Workers > 저장소 연결
  - 빌드 명령 `npx opennextjs-cloudflare build`, 배포 명령 `npx opennextjs-cloudflare deploy`
  - 빌드 변수 `NEXT_PUBLIC_API_BASE_URL=https://api.opp.skin`
- 계정·도메인: `wrangler.jsonc`의 `account_id`(팀 계정, `opp.skin` 도메인이 있는 곳)와 `routes`(`opp.skin` 커스텀 도메인). 배포하면 DNS 레코드·인증서가 자동으로 만들어진다. 배포하려면 그 계정 멤버로 초대받아 `npx wrangler login`
- 로그인 쿠키를 같이 쓰려면 프론트가 `opp.skin` 아래여야 하고, 백엔드 `.env`의 `FRONTEND_URL`·`CORS_ALLOWED_ORIGINS`를 그 주소로 맞춘다.

주의: `cacheComponents`·`partialPrefetching`은 꺼 두었다. `@opennextjs/cloudflare` 1.20에서 켜면 Workers에서 모든 페이지가 응답 없이 멈춘다(빌드 경고, opennextjs-cloudflare PR #1318). 이미지 최적화도 Workers에 없어 `images.unoptimized`.
