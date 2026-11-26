import { TERMS_VERSION } from "@/lib/terms";

/** 약관·개인정보 문서 틀: 초안 표시, 시행일(버전), 조항 목록 */
export function PolicyDoc({ sections }: { sections: { title: string; body: React.ReactNode }[] }) {
  return (
    <main className="flex flex-1 flex-col gap-6 px-4 py-6">
      {/* TODO: 법무 검토 후 확정 문구로 교체하고 이 안내를 지운다. 바꾸면 TERMS_VERSION도 올린다. */}
      <p className="rounded-panel bg-secondary px-4 py-3 type-caption text-muted-foreground">
        초안입니다. 확정 전 문구이며 바뀔 수 있어요. · 시행일 {TERMS_VERSION}
      </p>
      {sections.map((s) => (
        <section key={s.title} className="flex flex-col gap-2">
          <h2 className="type-body-strong">{s.title}</h2>
          <div className="flex flex-col gap-2 type-body text-muted-foreground">{s.body}</div>
        </section>
      ))}
    </main>
  );
}
