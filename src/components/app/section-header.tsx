import Link from "next/link";
import { Icon } from "./icon";

/** 섹션 제목 + 오른쪽 "더보기/전체보기" 링크. Figma 높이 44px, 좌우 16px. */
export function SectionHeader({
  title,
  moreHref,
  moreLabel = "더보기",
}: {
  title: string;
  moreHref?: string;
  moreLabel?: string;
}) {
  return (
    <div className="flex h-11 items-center justify-between px-4">
      <h2 className="type-body-strong">{title}</h2>
      {moreHref && (
        <Link
          href={moreHref}
          className="flex items-center text-xs leading-4 text-foreground"
        >
          {moreLabel}
          <Icon name="chevron-right" />
        </Link>
      )}
    </div>
  );
}
