import { cn } from "@/lib/utils";

/** AI 비서(왼쪽, 회색) / 사용자(오른쪽, 초록) 말풍선. 모서리 17px, 꼬리 쪽 모서리만 각짐. */
export function ChatBubble({
  from,
  children,
}: {
  from: "assistant" | "user";
  children: React.ReactNode;
}) {
  const isUser = from === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <p
        className={cn(
          "max-w-[282px] whitespace-pre-line px-5 py-[18px] type-chat",
          isUser
            ? "rounded-bubble rounded-tr-none bg-brand text-bubble-user-foreground"
            : "rounded-bubble rounded-bl-none bg-secondary text-muted-foreground",
        )}
      >
        {children}
      </p>
    </div>
  );
}
