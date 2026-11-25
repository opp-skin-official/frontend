import { cn } from "@/lib/utils";

/** 모바일 폭(최대 402px) 화면 틀. 디자인 기준 폭은 402px. */
export function AppShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-background",
        className,
      )}
    >
      {children}
    </div>
  );
}
