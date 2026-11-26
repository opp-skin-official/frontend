"use client";

import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, api, readXsrfToken } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type ConversationView = components["schemas"]["ConversationView"];
export type ConversationSummary = components["schemas"]["ConversationSummary"];
export type MessageView = components["schemas"]["MessageView"];

class NotFoundError extends Error {}

export function useConversation(id: number | null) {
  return useQuery({
    queryKey: ["conversation", id],
    enabled: id != null,
    queryFn: async () => {
      const { data, response } = await api.GET("/api/conversations/{id}", { params: { path: { id: id! } } });
      if (response.status === 404) throw new NotFoundError("대화를 찾을 수 없어요.");
      if (!data) throw new Error("대화를 불러오지 못했어요.");
      return data;
    },
    // 없는 대화는 다시 시도해도 없다.
    retry: (count, error) => !(error instanceof NotFoundError) && count < 2,
  });
}

export function useConversations(enabled: boolean, limit = 5) {
  return useQuery({
    queryKey: ["conversations", limit],
    enabled,
    queryFn: async () => {
      const { data, response } = await api.GET("/api/conversations", { params: { query: { limit } } });
      if (!data) throw new Error(`conversations failed: ${response.status}`);
      return data;
    },
  });
}

export async function createConversation(): Promise<ConversationView> {
  const { data, response } = await api.POST("/api/conversations", { body: { useSavedProfile: true } });
  if (!data) throw new Error(`대화를 시작하지 못했어요. (${response.status})`);
  return data;
}

export type StreamHandlers = {
  /** 저장된 질문 */
  onQuestion: (message: MessageView) => void;
  /** 글자 조각 (띄어쓰기가 빠질 수 있어 onDone의 content로 바꿔야 한다) */
  onDelta: (text: string) => void;
  /** 저장된 답변 */
  onDone: (message: MessageView) => void;
  onError: (message: string) => void;
};

/**
 * 질문을 보내고 답변을 SSE로 받는다(POST라 EventSource 대신 fetch 스트림).
 * 이벤트: question → delta(여러 번) → done | error
 */
export async function sendMessage(conversationId: number, content: string, handlers: StreamHandlers, signal?: AbortSignal) {
  const token = readXsrfToken();
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages`, {
      method: "POST",
      credentials: "include",
      signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...(token ? { "X-XSRF-TOKEN": token } : {}),
      },
      body: JSON.stringify({ content }),
    });
  } catch (e) {
    if ((e as Error).name !== "AbortError") handlers.onError("서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.");
    return;
  }
  if (!response.ok || !response.body) {
    handlers.onError(response.status === 401 ? "로그인이 필요해요." : "질문을 보내지 못했어요. 잠시 후 다시 시도해 주세요.");
    return;
  }

  let finished = false;
  const dispatch = (event: string, data: string) => {
    if (!data) return;
    const payload = JSON.parse(data);
    if (event === "question") handlers.onQuestion(payload);
    else if (event === "delta") handlers.onDelta(payload.text ?? "");
    else if (event === "done") {
      finished = true;
      handlers.onDone(payload);
    } else if (event === "error") {
      finished = true;
      handlers.onError(payload.message ?? "답변을 만들지 못했어요.");
    }
  };

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      // SSE 이벤트는 빈 줄로 나뉜다.
      let end: number;
      while ((end = buffer.search(/\r?\n\r?\n/)) >= 0) {
        const block = buffer.slice(0, end);
        buffer = buffer.slice(buffer[end] === "\r" ? end + 4 : end + 2);
        let event = "message";
        const data: string[] = [];
        for (const line of block.split(/\r?\n/)) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          else if (line.startsWith("data:")) data.push(line.slice(5).replace(/^ /, ""));
        }
        dispatch(event, data.join("\n"));
      }
    }
  } catch (e) {
    if ((e as Error).name === "AbortError") return;
  }
  if (!finished) handlers.onError("답변이 중간에 끊겼어요. 잠시 후 다시 시도해 주세요.");
}
