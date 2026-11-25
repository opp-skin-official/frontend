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
