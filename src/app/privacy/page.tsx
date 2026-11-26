import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { PolicyDoc } from "@/components/app/policy-doc";
import { TopBar } from "@/components/app/top-bar";

export const metadata: Metadata = { title: "개인정보 수집·이용 · OPP" };

export default function PrivacyPage() {
  return (
    <AppShell>
      <TopBar title="개인정보 수집·이용" />
      <PolicyDoc
        sections={[
          {
            title: "1. 수집하는 항목",
            body: (
              <ul className="list-disc pl-5">
                <li>카카오 로그인: 회원 식별값, 닉네임, 프로필 사진</li>
                <li>피부 유형 설문 답변 (가족력·흡연 문항은 따로 동의한 경우에만)</li>
                <li>상담 문진 답변: 불편한 점, 부위, 시작 시기, 증상 변화, 피부에 닿는 활동, 관리 가능한 시간과 제품</li>
                <li>AI 채팅 질문과 답변</li>
                <li>관리 계획, 루틴 체크, 경과 기록</li>
                <li>내 제품·관심 제품, 제품 리뷰, 주의(알레르기·자극) 성분</li>
                <li>복무 환경: 세안 가능 시간, 야외훈련 빈도, 알레르기 경험 여부</li>
                <li>서비스 이용 기록: 로그인 세션, AI 기능 이용 횟수</li>
              </ul>
            ),
          },
          {
            title: "2. 이용 목적",
            body: (
              <p>
                피부 상태 분석과 관리 방법 안내, 관리 루틴 제공, 피부에 맞는 제품 추천, 이전 상담을 이어서 하기, 서비스 운영과 비정상
                이용 방지에 씁니다.
              </p>
            ),
          },
          {
            title: "3. 보관 기간",
            body: <p>회원 탈퇴 시까지 보관하며, 탈퇴하면 바로 삭제합니다. 법령에 따라 보관해야 하는 정보가 있으면 그 기간 동안만 보관합니다.</p>,
          },
          {
            title: "4. AI 분석과 처리 위탁",
            body: (
              <>
                <p>
                  상담·채팅 답변을 만들기 위해 문진 답변과 질문, 피부 유형·주의 성분 같은 관련 정보를 자체 AI 모델 서버로 보내 처리합니다.
                </p>
                {/* TODO: 위탁 업체·국외 이전(서버·AI 호스팅 국가) 내용을 확정해 적는다. */}
                <p>서비스 운영을 위한 서버·AI 모델 호스팅 업체와 국외 이전 여부는 확정 후 이곳에 안내합니다.</p>
              </>
            ),
          },
          {
            title: "5. 동의를 거부할 권리",
            body: <p>동의하지 않을 수 있지만, 이 정보 없이는 피부 상담과 관리 기능을 제공할 수 없어 서비스를 이용할 수 없습니다.</p>,
          },
        ]}
      />
    </AppShell>
  );
}
