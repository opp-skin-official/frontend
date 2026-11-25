import { Fragment } from "react";
import { cn } from "@/lib/utils";

/** "붉어짐 • 따가움"처럼 점으로 구분한 짧은 목록. */
export function DotList({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-[7px]", className)}>
      {items.map((item, i) => (
        <Fragment key={item}>
          {i > 0 && (
            <span aria-hidden className="size-1 rounded-full bg-current opacity-60" />
          )}
          <span>{item}</span>
        </Fragment>
      ))}
    </span>
  );
}
