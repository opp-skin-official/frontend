import Link from "next/link";
import { Icon } from "./icon";

/** 최근 상담 리스트 항목: 흰 카드 + 오른쪽 화살표. Figma radius 24, padding 16. */
export function LinkCard({ href, title }: { href: string; title: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-card border border-border bg-surface p-4"
    >
      <span className="type-chat text-foreground">{title}</span>
      <Icon name="arrow-circle" />
    </Link>
  );
}
