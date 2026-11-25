"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./icon";

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "홈", icon: "tab-home" },
  { href: "/chat", label: "챗봇", icon: "tab-chat" },
  { href: "/profile", label: "프로필", icon: "tab-profile" },
  { href: "/products", label: "제품", icon: "tab-products" },
  { href: "/settings", label: "설정", icon: "tab-settings" },
];

export function BottomTabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="주요 메뉴"
      className="sticky bottom-0 z-10 grid grid-cols-5 border-t border-border bg-background pb-[max(22px,env(safe-area-inset-bottom))]"
    >
      {TABS.map((tab) => {
        const active =
          tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            // Figma에 활성 탭 표시가 정의되지 않아 모든 탭을 같은 색으로 둔다.
            className="flex flex-col items-center gap-0.5 pt-3 type-tab text-foreground"
          >
            <Icon name={tab.icon} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
