import Link from "next/link";
import { type PlanView, FOCUS_GOALS, dDay, goalName, monthDay } from "@/lib/routine";

/** "나의 집중 관리" 카드 (Figma "루틴" 상단). 홈과 루틴 화면에서 함께 쓴다. */
export function FocusCard({ plan, href }: { plan: PlanView | null | undefined; href: string }) {
  if (!plan) {
    return (
      <Link href={href} className="flex flex-col gap-2 rounded-card bg-brand-strong p-5">
        <span className="type-section">관리 계획을 만들어 보세요</span>
        <span className="type-caption">휴가·외출 같은 목표일에 맞춰 매일 할 관리를 정리해 드려요.</span>
      </Link>
    );
  }
  const focus = FOCUS_GOALS.find((f) => f.value === plan.focusGoal)?.label;
  return (
    <Link href={href} className="flex flex-col gap-2 rounded-card bg-brand-strong p-5" data-testid="focus-card">
      <span className="text-[28px] leading-[34px] font-semibold">
        {goalName(plan)}까지 {dDay(plan.daysLeft)}
      </span>
      <span className="type-caption">
        {monthDay(plan.targetDate)} · {focus}
      </span>
    </Link>
  );
}
