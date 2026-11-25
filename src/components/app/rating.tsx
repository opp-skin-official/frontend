import { Icon } from "./icon";

/** 별점 "★ 4.0 (10)" */
export function Rating({ score, count }: { score: number; count: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm leading-5 text-subtle-foreground">
      <Icon name="star" />
      <span>{score.toFixed(1)}</span>
      <span>({count})</span>
    </span>
  );
}
