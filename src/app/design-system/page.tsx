import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { BottomTabBar } from "@/components/app/bottom-tab-bar";
import { ChatBubble } from "@/components/app/chat-bubble";
import { Chip } from "@/components/app/chip";
import { DotList } from "@/components/app/dot-list";
import { Icon } from "@/components/app/icon";
import { LinkCard } from "@/components/app/link-card";
import { Rating } from "@/components/app/rating";
import { SectionHeader } from "@/components/app/section-header";
import { TopBar } from "@/components/app/top-bar";
import { Button } from "@/components/ui/button";
import { ChatInputDemo } from "./chat-input-demo";

export const metadata: Metadata = { title: "디자인 시스템 · OPP" };

const COLORS = [
  ["초 (brand)", "bg-brand"],
  ["진초 (brand-strong)", "bg-brand-strong"],
  ["배경흰 (background)", "bg-background"],
  ["라이트 그레이 (secondary)", "bg-secondary"],
  ["카드 (surface)", "bg-surface"],
  ["외곽 (border)", "bg-border"],
  ["약한 글 (muted-foreground)", "bg-muted-foreground"],
  ["검 (foreground)", "bg-foreground"],
] as const;

export default function DesignSystemPage() {
  return (
    <AppShell>
      <TopBar title="디자인 시스템" />
      <main className="flex flex-1 flex-col gap-2 pb-8">
        <SectionHeader title="색상" />
        <ul className="grid grid-cols-2 gap-2 px-4">
          {COLORS.map(([name, cls]) => (
            <li key={name} className="flex items-center gap-2 type-caption">
              <span className={`size-8 rounded-md border border-border ${cls}`} />
              {name}
            </li>
          ))}
        </ul>

        <SectionHeader title="타이포그래피" />
        <div className="flex flex-col gap-1 px-4">
          <p className="type-title">이렇게 정리했어요 (title 24)</p>
          <p className="type-section">상담 시작하기 (section 20)</p>
          <p className="type-body-strong">최근 상담 리스트 (본문강조 16)</p>
          <p className="type-chat">오늘 아침 면도 한 뒤 (채팅 대화 16)</p>
          <p className="type-body text-muted-foreground">다른 내용이 있다면 수정해주세요. (본문 14)</p>
          <p className="type-label text-muted-foreground">관리 가능 시간 (label 13)</p>
          <p className="type-caption">사용 중인 보습 제품 (보조 12)</p>
        </div>

        <SectionHeader title="버튼" />
        <div className="grid grid-cols-2 gap-[21px] px-4">
          <Button variant="secondary" size="cta">대화 내용 수정</Button>
          <Button size="cta">확인했어요</Button>
        </div>

        <SectionHeader title="태그" />
        <div className="flex flex-wrap gap-2 px-4">
          <Chip variant="dark">면도 후 자극</Chip>
          <Chip variant="dark">건조함</Chip>
          <Chip variant="outline">흔적 개선</Chip>
          <Chip variant="brand">여드름 완화 1등</Chip>
        </div>

        <SectionHeader title="피부 정보 카드" moreHref="/profile" />
        <div className="mx-4 rounded-card bg-surface p-4 shadow-[0_1px_4px_rgba(0,0,0,0.15)]">
          <p className="text-[13px] leading-5 font-medium">피부 타입</p>
          <p className="mt-1 text-[20px] leading-6 font-medium">
            <DotList items={["건성", "예민한 편"]} />
          </p>
          <div className="mt-2 flex gap-[11px]">
            <Chip variant="dark">면도 후 자극</Chip>
            <Chip variant="dark">건조함</Chip>
          </div>
        </div>

        <SectionHeader title="상담 시작 카드" />
        <div className="mx-4 flex h-[232px] flex-col justify-between rounded-card bg-gradient-to-r from-secondary to-brand p-4">
          <div className="flex justify-between">
            <Icon name="chat-start" />
            <Icon name="arrow-up-right-circle" />
          </div>
          <div>
            <p className="type-body text-muted-foreground">
              AI 비서에게 불편한 점을
              <br />
              대화로 편하게 알려주세요.
            </p>
            <p className="mt-6 type-section">상담 시작하기</p>
          </div>
        </div>

        <SectionHeader title="상담 요약 패널" />
        <div className="mx-4 flex flex-col gap-4 rounded-panel border border-border bg-secondary p-7">
          <div>
            <p className="type-body-strong"><DotList items={["왼쪽 볼", "뾰루지 1개"]} /></p>
            <p className="type-label text-muted-foreground"><DotList items={["붉어짐", "따가움"]} /></p>
          </div>
          <div>
            <p className="type-label text-muted-foreground"><DotList items={["발생", "지속"]} /></p>
            <p className="type-body-strong"><DotList items={["오늘 면도 직후", "약 5시간"]} /></p>
          </div>
        </div>

        <SectionHeader title="최근 상담 리스트" moreHref="/records" moreLabel="전체보기" />
        <div className="flex flex-col gap-2 px-4">
          <LinkCard href="/records/1" title="면도 후 턱 따가움" />
          <LinkCard href="/records/2" title="풋살 전 행동 리스트" />
        </div>

        <SectionHeader title="별점" />
        <div className="px-4"><Rating score={4} count={10} /></div>

        <SectionHeader title="대화" />
        <div className="flex flex-col gap-4 px-4">
          <ChatBubble from="user">{"오늘 아침 면도 한 뒤\n왼쪽 볼에 뾰루지가 생겼어요."}</ChatBubble>
          <ChatBubble from="assistant">{"어디가 어떻게 불편한지\n아바타에 표시해볼까요?"}</ChatBubble>
          <p className="flex items-center gap-3 type-body-strong">
            <Icon name="check-circle" />표시를 완료했어요
          </p>
        </div>
        <ChatInputDemo />
      </main>
      <BottomTabBar />
    </AppShell>
  );
}
