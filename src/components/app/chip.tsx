import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex h-[22px] items-center whitespace-nowrap px-3 type-caption",
  {
    variants: {
      variant: {
        // 피부 정보 태그 (검정 바탕)
        dark: "h-[23px] rounded-[40px] bg-foreground text-secondary",
        // 제품 특징 태그 (초록 테두리)
        outline: "rounded-[11px] border border-brand bg-white text-foreground",
        // 강조 태그 (초록 바탕)
        brand: "rounded-[11px] bg-brand text-foreground",
      },
    },
    defaultVariants: { variant: "outline" },
  },
);

export function Chip({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof chipVariants>) {
  return (
    <span className={cn(chipVariants({ variant }), className)} {...props} />
  );
}
