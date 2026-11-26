import Markdown, { type Components } from "react-markdown";

/**
 * AI 답변(마크다운) 표시. 모델 v6.3은 "### 실천 팁", "- 항목", "**강조**" 형태로 답한다.
 * HTML 태그는 그리지 않는다(react-markdown 기본값). 링크는 새 창으로 연다.
 */
const components: Components = {
  h1: ({ children }) => <p className="mt-3 type-body-strong text-foreground first:mt-0">{children}</p>,
  h2: ({ children }) => <p className="mt-3 type-body-strong text-foreground first:mt-0">{children}</p>,
  h3: ({ children }) => <p className="mt-3 type-body-strong text-foreground first:mt-0">{children}</p>,
  h4: ({ children }) => <p className="mt-3 type-body-strong text-foreground first:mt-0">{children}</p>,
  p: ({ children }) => <p className="mt-2 first:mt-0">{children}</p>,
  ul: ({ children }) => <ul className="mt-1.5 flex list-disc flex-col gap-1.5 pl-4">{children}</ul>,
  ol: ({ children }) => <ol className="mt-1.5 flex list-decimal flex-col gap-1.5 pl-4">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline">
      {children}
    </a>
  ),
};

export function ChatMarkdown({ children }: { children: string }) {
  return <Markdown components={components}>{children}</Markdown>;
}
