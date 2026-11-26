import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents·partialPrefetching은 끈다: @opennextjs/cloudflare 1.20이 아직 지원하지 않아
  // Workers에서 모든 페이지가 응답 없이 멈췄다(빌드 경고, opennextjs-cloudflare PR #1318). 앱은 'use cache'를 쓰지 않는다.
  // Cloudflare Workers에는 Next 이미지 최적화 서버가 없다(Cloudflare Images는 별도 서비스). 작은 PNG라 원본을 쓴다.
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

// next dev에서 Cloudflare 바인딩을 쓸 수 있게 한다(@opennextjs/cloudflare).
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
