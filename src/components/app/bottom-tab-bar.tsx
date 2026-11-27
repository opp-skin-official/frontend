"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type TabIconName = "home" | "chat" | "profile" | "products" | "settings";

const TABS: { href: string; label: string; icon: TabIconName }[] = [
  { href: "/", label: "홈", icon: "home" },
  { href: "/chat", label: "챗봇", icon: "chat" },
  { href: "/profile", label: "프로필", icon: "profile" },
  { href: "/products", label: "제품", icon: "products" },
  { href: "/settings", label: "설정", icon: "settings" },
];

export function BottomTabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="주요 메뉴"
      className="sticky bottom-0 z-10 grid grid-cols-5 border-t border-border bg-background pb-[max(22px,env(safe-area-inset-bottom))]"
    >
      {TABS.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            // 선택한 탭은 아이콘을 검정으로 채우고, 나머지는 선만 있는 빈 아이콘으로 둔다.
            className={cn("flex flex-col items-center gap-0.5 pt-3 type-tab", active ? "text-black" : "text-foreground")}
          >
            <TabIcon name={tab.icon} filled={active} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * 탭 아이콘: 빈 모양(선)과 채운 모양을 같은 도형으로 그린다(도형은 Lucide, ISC 라이선스).
 * 채운 모양에서 문·톱니 가운데처럼 뚫려 있어야 할 부분은 배경색으로 칠한다.
 */
function TabIcon({ name, filled }: { name: TabIconName; filled: boolean }) {
  const shape = {
    fill: filled ? "currentColor" : "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const hole = filled ? { fill: "var(--background)", stroke: "var(--background)", strokeWidth: 1.5 } : shape;
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden data-filled={filled} className="size-6">
      {name === "home" && (
        <>
          <path {...shape} d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path {...hole} d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
        </>
      )}
      {name === "chat" && (
        <path
          {...shape}
          d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"
        />
      )}
      {name === "profile" && (
        <>
          <path {...shape} d={`M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2${filled ? "z" : ""}`} />
          <circle {...shape} cx="12" cy="7" r="4" />
        </>
      )}
      {name === "products" && (
        <path
          {...shape}
          d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"
        />
      )}
      {name === "settings" && (
        <>
          <path
            {...shape}
            d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"
          />
          <circle {...hole} cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}
