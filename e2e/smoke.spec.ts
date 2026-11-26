import { test as base, expect } from "@playwright/test";
import * as data from "./fixtures";
import { API_ORIGIN, mockApi, type ApiLog, type MockOptions } from "./mock-api";

/**
 * 주요 화면이 깨지지 않고 백엔드 데이터를 보여 주는지 확인하는 스모크 테스트.
 * 모든 테스트에서: 가짜 응답이 없는 API 요청이 없어야 하고, 페이지 스크립트 오류가 없어야 한다.
 */
const test = base.extend<{ loggedIn: boolean; extra: NonNullable<MockOptions["extra"]>; api: ApiLog }>({
  loggedIn: [true, { option: true }],
  extra: [[], { option: true }],
  api: [
    async ({ page, loggedIn, extra }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const log = await mockApi(page, { loggedIn, extra });
      await use(log);
      expect(log.unmocked, "가짜 응답이 없는 API 요청").toEqual([]);
      expect(errors, "페이지 스크립트 오류").toEqual([]);
    },
    { auto: true },
  ],
});

test.describe("로그인 전", () => {
  test.use({ loggedIn: false });

  test("홈은 로그인 안내를 보여 준다", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("home-greeting")).toContainText("안녕하세요");
    await expect(page.getByRole("link", { name: "로그인하고 시작하기" })).toBeVisible();
  });

  test("로그인 화면의 카카오 버튼은 백엔드 로그인 주소로 간다", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator(`a[href="${API_ORIGIN}/oauth2/authorization/kakao"]`)).toBeVisible();
  });
});

test.describe("로그인 후", () => {
  test("홈: 인사, 집중 관리, 피부 정보, 추천 상품, 최근 상담", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("home-greeting")).toContainText(`${data.me.nickname}님`);
    await expect(page.getByText(`D-${data.plan.daysLeft}`).first()).toBeVisible();
    await expect(page.getByText(data.assessment.title!).first()).toBeVisible();
    await expect(page.getByText(data.recommendations.items![0].product!.name!).first()).toBeVisible();
    await expect(page.getByText(data.conversations[0].title!).first()).toBeVisible();
  });

  test("루틴: 오늘 할 일을 보여 주고 체크하면 저장 요청을 보낸다", async ({ page, api }) => {
    await page.goto("/routine");
    for (const item of data.today.items!) {
      await expect(page.getByText(item.title!).first()).toBeVisible();
    }
    const unchecked = data.today.items!.find((i) => !i.checked)!;
    await page.getByText(unchecked.title!).first().click();
    await expect
      .poll(() => api.calls.some((c) => c.startsWith(`PUT /api/routine-items/${unchecked.id}/checks/`)))
      .toBe(true);
  });

  test("제품 목록 → 상세: 이름, 주요 성분, 리뷰", async ({ page }) => {
    await page.goto("/products");
    const first = data.products.items![0];
    await expect(page.getByText(data.products.items![1].name!).first()).toBeVisible();
    await page.getByText(first.name!).first().click();
    await expect(page).toHaveURL(new RegExp(`/products/${first.id}$`));
    await expect(page.getByText(data.productDetail.name!).first()).toBeVisible();
    await expect(page.getByText(data.productDetail.keyIngredients![0].nameKo!).first()).toBeVisible();
    await expect(page.getByText(data.reviews.items![0].content!).first()).toBeVisible();
  });

  test("상담 리포트: 관찰·원인·해결과 루틴", async ({ page }) => {
    await page.goto(`/consult/${data.consultation.id}`);
    const pair = data.consultation.report!.pairs![0];
    await expect(page.getByText(pair.observation!).first()).toBeVisible();
    await expect(page.getByText(pair.solution!).first()).toBeVisible();
  });

  test("문진 상담: 지난 상담이 있으면 달라진 점부터 묻는다", async ({ page }) => {
    await page.goto("/consult");
    await expect(page.getByText("시간이나 쓸 수 있는 물품이 달라졌어요").first()).toBeVisible();
    await expect(page.getByText("더 불편해졌어요").first()).toBeVisible();
  });

  test.describe("처음 상담", () => {
    test.use({ extra: [{ method: "GET", path: /^\/api\/consultations\/latest$/, reply: () => ({ status: 404 }) }] });

    test("문진 상담: 지난 상담이 없으면 첫 질문부터", async ({ page }) => {
      await page.goto("/consult");
      await expect(page.getByText("어떤 점이 가장 불편한가요?").first()).toBeVisible();
    });
  });

  test("AI 채팅: 지난 대화의 질문과 답변", async ({ page }) => {
    await page.goto(`/chat/${data.conversation.id}`);
    for (const message of data.conversation.messages!) {
      await expect(page.getByText(message.content!).first()).toBeVisible();
    }
  });

  test("피부 유형 설문: 동의 → 첫 문항과 선택지", async ({ page }) => {
    await page.goto("/survey");
    await page.getByRole("button", { name: "시작하기" }).click(); // 민감정보 동의 단계 다음
    const q = data.survey.questions![0];
    await expect(page.getByText(q.text!).first()).toBeVisible();
    await expect(page.getByText(q.options![0].label!).first()).toBeVisible();
  });

  test("프로필: 닉네임과 피부 유형", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByText(data.me.nickname!).first()).toBeVisible();
    await expect(page.getByText(data.assessment.title!).first()).toBeVisible();
  });

  test("설정: 회원 탈퇴는 한 번 더 확인하고, 취소하면 지우지 않는다", async ({ page, api }) => {
    await page.goto("/settings");
    await page.getByRole("button", { name: "회원 탈퇴" }).click();
    await expect(page.getByRole("alertdialog")).toContainText("되돌릴 수 없어요");
    await page.getByRole("button", { name: "취소" }).click();
    await expect(page.getByRole("alertdialog")).toBeHidden();
    expect(api.calls).not.toContain("DELETE /api/me");

    await page.getByRole("button", { name: "회원 탈퇴" }).click();
    await page.getByRole("button", { name: "탈퇴하기" }).click();
    await expect(page).toHaveURL(/\/login$/);
    expect(api.calls).toContain("DELETE /api/me");
  });

  test("관리 정보: 등록한 주의 성분", async ({ page }) => {
    await page.goto("/profile/care-info");
    await expect(page.getByText(data.careInfo.alerts![0].target!).first()).toBeVisible();
  });
});
