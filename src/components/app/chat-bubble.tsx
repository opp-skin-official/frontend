import { cn } from "@/lib/utils";

/** AI 비서(왼쪽, 회색) / 사용자(오른쪽, 초록) 말풍선. 모서리 17px, 꼬리 쪽 모서리만 각짐. 나타날 때 꼬리 쪽에서 톡 튀어나온다. */
export function ChatBubble({
  from,
  children,
  rich = false,
}: {
  from: "assistant" | "user";
  children: React.ReactNode;
  /** 마크다운처럼 문단·목록을 직접 그리는 내용이면 true (줄바꿈 그대로 표시를 끈다) */
  rich?: boolean;
}) {
  const isUser = from === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "bubble-in max-w-[282px] px-5 py-[18px] type-chat",
          !rich && "whitespace-pre-line",
          isUser
            ? "origin-top-right rounded-bubble rounded-tr-none bg-brand text-bubble-user-foreground"
            : "origin-bottom-left rounded-bubble rounded-bl-none bg-secondary text-muted-foreground",
        )}
      >
        {children}
      </div>
    </div>
  );
}
