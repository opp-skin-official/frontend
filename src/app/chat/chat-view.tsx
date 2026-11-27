"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChatBubble } from "@/components/app/chat-bubble";
import { ChatMarkdown } from "@/components/app/chat-markdown";
import { ChatInput } from "@/components/app/chat-input";
import { ReportAiContent } from "@/components/app/report-ai-content";
import { RequireLogin } from "@/components/app/require-login";
import { reportChatAnswer } from "@/lib/ai-report";
import { type MessageView, createConversation, sendMessage, toUserQuestion, useConversation } from "@/lib/chat";
import { cn } from "@/lib/utils";

const DEFAULT_NOTICE = "AI 비서의 안내는 피부 관리 참고용이며, 의학적 판단이나 개선 보장이 아니에요.";
const SUGGESTIONS = ["면도 후 턱이 따가워요", "야외훈련 뒤 얼굴이 건조하고 당겨요", "위장크림 바른 날 세안은 어떻게 하나요?"];
/** 이 시간이 지나도 첫 글자가 없으면 콜드 스타트 안내를 보여 준다. */
const SLOW_HINT_MS = 8000;

/** Figma "2-2 현재 피부 고민 및 상태 파악"(420:2325)의 대화 화면을 피부 Q&A에 쓴다. */
export function ChatView() {
  return (
    <RequireLogin message="AI 비서와 대화하려면 로그인이 필요해요.">
      {(me) => <ChatContent nickname={me.nickname ?? "사용자"} />}
    </RequireLogin>
  );
}

type Pending = {
  content: string;
  question?: MessageView;
  text: string;
  error?: string;
  slow: boolean;
};

function ChatContent({ nickname }: { nickname: string }) {
  const params = useParams<{ id?: string }>();
  const routeId = params.id ? Number(params.id) : null;
  const [conversationId, setConversationId] = useState<number | null>(routeId);
  const conversation = useConversation(routeId);
  const [messages, setMessages] = useState<MessageView[]>([]);
  const [loadedFrom, setLoadedFrom] = useState<number | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 저장된 대화를 처음 한 번만 불러온다(이후에는 화면 상태가 기준).
  if (conversation.data && loadedFrom !== conversation.data.id) {
    setLoadedFrom(conversation.data.id ?? null);
    setMessages(conversation.data.messages ?? []);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, pending?.text, pending?.error, pending?.slow]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const busy = pending != null && pending.error == null;

  async function ask(content: string) {
    if (busy) return;
    setPending({ content, text: "", slow: false });
    const slowTimer = setTimeout(() => setPending((p) => (p && !p.text && !p.error ? { ...p, slow: true } : p)), SLOW_HINT_MS);
    const fail = (error: string) => setPending((p) => (p ? { ...p, error } : p));
    try {
      let id = conversationId;
      if (id == null) {
        const created = await createConversation();
        id = created.id!;
        setConversationId(id);
        setLoadedFrom(id);
        // 화면을 다시 그리지 않고 주소만 바꿔, 새로고침해도 이 대화로 돌아오게 한다.
        window.history.replaceState(null, "", `/chat/${id}`);
      }
      abortRef.current = new AbortController();
      let question: MessageView | undefined;
      await sendMessage(
        id,
        content,
        {
          onQuestion: (q) => {
            question = q;
            setPending((p) => (p ? { ...p, question: q } : p));
          },
          onDelta: (text) => setPending((p) => (p ? { ...p, text: p.text + text } : p)),
          onDone: (answer) => {
            setMessages((list) => [...list, ...(question ? [question] : []), answer]);
            setPending(null);
          },
          onError: (message) => {
            // 질문은 저장됐으므로 목록에 남기고, 실패 안내만 보여 준다.
            if (question) {
              const saved = question;
              setMessages((list) => [...list, saved]);
            }
            fail(message);
          },
        },
        abortRef.current.signal,
      );
    } catch (e) {
      fail((e as Error).message || "질문을 보내지 못했어요.");
    } finally {
      clearTimeout(slowTimer);
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  }

  if (routeId != null && conversation.isPending) {
    return <p className="flex-1 px-4 py-8 type-body text-muted-foreground">불러오는 중…</p>;
  }
  if (routeId != null && conversation.isError) {
    return <p className="flex-1 px-4 py-8 type-body text-destructive">{conversation.error.message}</p>;
  }

  const lastAssistant = [...messages].reverse().find((m) => m.role === "ASSISTANT");
  const notice = lastAssistant?.notice ?? DEFAULT_NOTICE;

  return (
    <>
      <main data-chat className="flex flex-1 flex-col gap-5 px-4 pt-[25px] pb-6" aria-live="polite">
        <p className="type-caption text-subtle-foreground">{notice}</p>
        <ChatBubble from="assistant">
          {`안녕하세요, ${nickname}님.\n피부 고민을 편하게 물어보세요.`}
        </ChatBubble>
        {messages.length === 0 && !pending && (
          <FollowUps items={SUGGESTIONS} onPick={ask} />
        )}

        {messages.map((m, i) =>
          m.role === "USER" ? (
            <ChatBubble key={m.id} from="user">{m.content}</ChatBubble>
          ) : (
            <AssistantMessage
              key={m.id}
              conversationId={conversationId}
              message={m}
              // 이어서 할 질문은 마지막 답변에만 보여 준다.
              onFollowUp={i === messages.length - 1 && !pending ? ask : undefined}
            />
          ),
        )}

        {pending && (
          <>
            {/* 질문이 저장되기 전에는 입력한 글을 바로 보여 준다. 실패 후에는 저장된 질문이 목록에 있다. */}
            {!(pending.error && pending.question) && <ChatBubble from="user">{pending.content}</ChatBubble>}
            {pending.error ? (
              <div role="alert" className="flex flex-col items-start gap-2">
                <p className="type-body text-destructive">{pending.error}</p>
                <button
                  type="button"
                  onClick={() => ask(pending.content)}
                  className="pressable rounded-[11px] border border-border bg-surface px-3 py-1 type-caption"
                >
                  다시 보내기
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {pending.text ? (
                  // 모델 v6.3은 글자 조각도 마크다운으로 보낸다(빈 줄이 빠질 수 있어 끝나면 저장된 답변으로 바뀐다).
                  <ChatBubble from="assistant" rich>
                    <ChatMarkdown>{pending.text}</ChatMarkdown>
                  </ChatBubble>
                ) : (
                  <ChatBubble from="assistant">답변을 준비하고 있어요…</ChatBubble>
                )}
                {pending.slow && !pending.text && (
                  <p className="type-caption text-subtle-foreground">
                    한동안 대화가 없으면 첫 답변까지 30초 넘게 걸릴 수 있어요.
                  </p>
                )}
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </main>
      <div className="sticky bottom-0 bg-background">
        <ChatInput placeholder={`${nickname}님의 고민을 말해주세요.`} onSubmit={ask} disabled={busy} />
      </div>
    </>
  );
}

function AssistantMessage({
  conversationId,
  message,
  onFollowUp,
}: {
  conversationId: number | null;
  message: MessageView;
  onFollowUp?: (q: string) => void;
}) {
  const markdown = message.format === "markdown";
  // 마크다운 답변은 실천 팁이 본문에 들어 있어 따로 보여 주지 않는다.
  const tips = markdown ? [] : (message.actionTips ?? []);
  // 모델이 주는 질문은 AI 말투라, 사용자 말투로 바꾼 것만 버튼으로 보여 준다.
  const followUps = (message.followUpQuestions ?? []).map(toUserQuestion).filter((q): q is string => q !== null);
  return (
    <div className="flex flex-col gap-2">
      {markdown ? (
        <ChatBubble from="assistant" rich>
          <ChatMarkdown>{message.content ?? ""}</ChatMarkdown>
        </ChatBubble>
      ) : (
        <ChatBubble from="assistant">{message.content}</ChatBubble>
      )}
      {tips.length > 0 && (
        <section aria-label="실천 팁" className="max-w-[282px] rounded-panel border border-border bg-surface px-5 py-4">
          <p className="type-body-strong">이렇게 해 보세요</p>
          <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-4 type-body text-muted-foreground">
            {tips.map((tip) => <li key={tip}>{tip}</li>)}
          </ul>
        </section>
      )}
      {message.referToClinician && (
        <p className={cn("max-w-[282px] rounded-panel bg-brand px-5 py-3 type-body")}>
          {message.referralNotice ?? "증상이 심하거나 오래가면 의무대나 가까운 의료기관에 상담해 주세요."}
        </p>
      )}
      {conversationId != null && message.id != null && (
        <ReportAiContent
          label="이 답변 신고"
          title="이 답변을 신고할까요?"
          onSubmit={(body) => reportChatAnswer(conversationId, message.id!, body)}
        />
      )}
      {onFollowUp && followUps.length > 0 && <FollowUps items={followUps} onPick={onFollowUp} />}
    </div>
  );
}

function FollowUps({ items, onPick }: { items: string[]; onPick: (q: string) => void }) {
  return (
    <div className="flex flex-col items-end gap-2" aria-label="이어서 물어보기">
      {items.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onPick(q)}
          className="pressable max-w-[282px] rounded-bubble rounded-tr-none border border-brand-strong bg-surface px-4 py-2.5 text-left type-body"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
