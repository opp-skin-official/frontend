import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { TopBar } from "@/components/app/top-bar";
import { ChatView } from "../chat-view";

export const metadata: Metadata = { title: "AI 비서 · OPP" };

/** 저장된 피부 Q&A 이어가기. 대화 번호는 ChatView가 주소에서 읽는다. */
export default function ConversationPage() {
  return (
    <AppShell>
      <TopBar title="AI 비서" />
      <ChatView />
    </AppShell>
  );
}
