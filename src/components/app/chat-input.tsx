"use client";

import { useState } from "react";
import { Icon } from "./icon";

/** 하단 채팅 입력창. Figma: 회색 바탕, 테두리, radius 24, 오른쪽 전송 버튼. */
export function ChatInput({
  placeholder,
  onSubmit,
  disabled,
}: {
  placeholder: string;
  onSubmit: (text: string) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const send = () => {
    const value = text.trim();
    if (!value) return;
    onSubmit(value);
    setText("");
  };
  return (
    <form
      className="px-4 pt-2 pb-5"
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <div className="flex items-center gap-2 rounded-card border border-border bg-secondary py-2 pr-3 pl-[23px]">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={placeholder}
          className="h-10 min-w-0 flex-1 bg-transparent type-chat outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          aria-label="보내기"
          disabled={disabled || !text.trim()}
          className="relative size-[31px] shrink-0 disabled:opacity-50"
        >
          <Icon
            name="send"
            className="absolute top-[-8px] left-[-12px] max-w-none"
          />
        </button>
      </div>
    </form>
  );
}
