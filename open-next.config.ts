import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// ISR·revalidate를 쓰지 않아 증분 캐시(R2)는 두지 않는다. 필요해지면 r2IncrementalCache를 연결한다.
export default defineCloudflareConfig({});
