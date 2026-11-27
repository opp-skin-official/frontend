"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { REPORT_DETAIL_MAX, REPORT_REASONS, type ReportReason, type ReportRequest } from "@/lib/ai-report";
import { cn } from "@/lib/utils";

type State = "closed" | "open" | "sending" | "sent";

/**
 * AI가 만든 내용 아래의 작은 "신고" 버튼. 누르면 사유를 고르는 패널이 열린다.
 * label = 버튼 글자, title = 패널 제목 (예: "이 답변을 신고할까요?")
 */
export function ReportAiContent({
  label = "신고",
  title,
  onSubmit,
  className,
}: {
  label?: string;
  title: string;
  onSubmit: (body: ReportRequest) => Promise<void>;
  className?: string;
}) {
  const [state, setState] = useState<State>("closed");
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();

  if (state === "sent") {
    return (
      <p role="status" className={cn("type-caption text-muted-foreground", className)}>
        신고했어요. 검토 후 반영할게요.
      </p>
    );
  }
  if (state === "closed") {
    return (
      <button
        type="button"
        onClick={() => setState("open")}
        className={cn("self-start type-caption text-subtle-foreground underline", className)}
      >
        {label}
      </button>
    );
  }

  async function send() {
    if (!reason) return;
    setState("sending");
    setError(null);
    try {
      const text = detail.trim();
      await onSubmit(text ? { reason, detail: text } : { reason });
      setState("sent");
    } catch (e) {
      setError((e as Error).message || "신고를 보내지 못했어요.");
      setState("open");
    }
  }

  const sending = state === "sending";
  return (
    <section
      role="dialog"
      aria-labelledby={titleId}
      className={cn("flex w-full max-w-[320px] flex-col gap-3 rounded-panel border border-border bg-surface px-5 py-4", className)}
    >
      <p id={titleId} className="type-body-strong">{title}</p>
      <fieldset className="flex flex-col gap-2" disabled={sending}>
        <legend className="sr-only">신고 사유</legend>
        {REPORT_REASONS.map((r) => (
          <label key={r.value} className="flex items-center gap-2 type-body">
            <input
              type="radio"
              name={`${titleId}-reason`}
              value={r.value}
              checked={reason === r.value}
              onChange={() => setReason(r.value)}
              className="size-4 accent-[var(--brand-strong)]"
            />
            {r.label}
          </label>
        ))}
      </fieldset>
      <label className="flex flex-col gap-1 type-caption text-muted-foreground">
        덧붙일 내용 (선택)
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          maxLength={REPORT_DETAIL_MAX}
          rows={3}
          disabled={sending}
          className="resize-none rounded-[11px] border border-border bg-background px-3 py-2 type-body text-foreground"
        />
      </label>
      {error && <p role="alert" className="type-caption text-destructive">{error}</p>}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" disabled={sending} onClick={() => { setState("closed"); setError(null); }}>
          취소
        </Button>
        <Button disabled={!reason || sending} onClick={send}>
          {sending ? "보내는 중…" : "보내기"}
        </Button>
      </div>
    </section>
  );
}
