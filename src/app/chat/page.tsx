import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { TopBar } from "@/components/app/top-bar";
import { ChatView } from "./chat-view";

export const metadata: Metadata = { title: "AI 비서 · OPP" };

/** 새 피부 Q&A. 첫 질문을 보내면 대화가 만들어지고 주소가 /chat/{id}로 바뀐다. */
export default function ChatPage() {
  return (
    <AppShell>
      <TopBar title="AI 비서" />
      <ChatView />
    </AppShell>
  );
}
