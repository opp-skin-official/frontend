import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { PolicyDoc } from "@/components/app/policy-doc";
import { TopBar } from "@/components/app/top-bar";

export const metadata: Metadata = { title: "서비스 이용약관 · OPP" };

export default function TermsPage() {
  return (
    <AppShell>
      <TopBar title="서비스 이용약관" />
      <PolicyDoc
        sections={[
          { title: "1. 목적", body: <p>이 약관은 OPP(이하 &quot;서비스&quot;)를 이용하는 조건과 절차, 이용자와 서비스의 권리·의무를 정합니다.</p> },
          {
            title: "2. 서비스 내용",
            body: (
              <p>
                서비스는 피부 유형 설문, AI 피부 상담·리포트, AI 채팅, 관리 루틴과 경과 기록, 제품 정보·추천을 제공합니다.
              </p>
            ),
          },
          {
            title: "3. 의료 행위가 아님",
            body: (
              <p>
                서비스가 제공하는 내용은 피부 관리를 위한 참고 정보이며 의학적 진단이나 치료가 아닙니다. 증상이 심하거나 오래가면
                의무실이나 피부과 등 의료진과 상담해 주세요.
              </p>
            ),
          },
          {
            title: "4. 계정",
            body: <p>카카오 계정으로 로그인해 이용합니다. 이용자는 자신의 계정을 다른 사람이 쓰지 않도록 관리해야 합니다.</p>,
          },
          {
            title: "5. 이용자가 하지 말아야 할 일",
            body: (
              <p>
                다른 사람의 정보를 도용하는 일, 서비스나 AI 기능을 비정상적으로 반복 호출해 운영을 방해하는 일, 거짓이거나 남을 해치는
                리뷰를 쓰는 일을 해서는 안 됩니다. AI 기능은 이용 횟수가 정해져 있을 수 있습니다.
              </p>
            ),
          },
          {
            title: "6. 탈퇴",
            body: <p>이용자는 언제든 설정 화면에서 탈퇴할 수 있으며, 탈퇴하면 이용자의 기록은 바로 삭제되고 되돌릴 수 없습니다.</p>,
          },
          {
            title: "7. 약관 변경",
            body: <p>약관을 바꾸면 시행일과 함께 서비스 안에서 알리고, 바뀐 약관에 다시 동의를 받습니다.</p>,
          },
        ]}
      />
    </AppShell>
  );
}
