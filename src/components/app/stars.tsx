/** 별점 표시 (1~5). 값은 aria-label로 읽힌다. */
export function Stars({ value, className }: { value: number; className?: string }) {
  const full = Math.round(value);
  return (
    <span className={className} aria-label={`별점 ${value.toFixed(1)}점`} role="img">
      {"★★★★★".slice(0, full)}
      <span className="text-border">{"★★★★★".slice(full)}</span>
    </span>
  );
}
