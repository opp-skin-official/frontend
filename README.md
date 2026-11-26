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

## 배포 (Cloudflare Workers)

[@opennextjs/cloudflare](https://opennext.js.org/cloudflare)로 Next.js를 Workers에서 돌린다. 설정: `wrangler.jsonc`, `open-next.config.ts`.

- `NEXT_PUBLIC_API_BASE_URL`은 **빌드할 때** 들어간다(`https://api.opp.skin`). 바꾸면 다시 배포해야 한다.
- 로컬에서 Workers 런타임으로 확인: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080 npm run preview` (`.dev.vars`에 `NEXTJS_ENV=development`)
- 직접 배포: `npx wrangler login` 후 `NEXT_PUBLIC_API_BASE_URL=https://api.opp.skin npm run deploy`
- Git 자동 배포(Workers Builds): Cloudflare 대시보드 > Workers > 저장소 연결
  - 빌드 명령 `npx opennextjs-cloudflare build`, 배포 명령 `npx opennextjs-cloudflare deploy`
  - 빌드 변수 `NEXT_PUBLIC_API_BASE_URL=https://api.opp.skin`
- 도메인: 대시보드 Workers > `opp-skin-frontend` > 설정 > 도메인에서 `opp.skin`(또는 `app.opp.skin`) 추가. DNS가 Cloudflare라 레코드는 자동으로 만들어진다.
- 로그인 쿠키를 같이 쓰려면 프론트가 `opp.skin` 아래여야 하고, 백엔드 `.env`의 `FRONTEND_URL`·`CORS_ALLOWED_ORIGINS`를 그 주소로 맞춘다.

주의: `cacheComponents`·`partialPrefetching`은 꺼 두었다. `@opennextjs/cloudflare` 1.20에서 켜면 Workers에서 모든 페이지가 응답 없이 멈춘다(빌드 경고, opennextjs-cloudflare PR #1318). 이미지 최적화도 Workers에 없어 `images.unoptimized`.
