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

test.describe("약관 동의 전", () => {
  test("어느 화면이든 동의 화면으로 보내고, 모두 동의해야 시작할 수 있다", async ({ page }) => {
    let agreed = false;
    const posted: unknown[] = [];
    // 기본 가짜 응답보다 나중에 등록한 규칙이 먼저 적용된다.
    await page.route(`${API_ORIGIN}/api/me`, (route) =>
      route.fulfill({
        status: 200,
        headers: { "access-control-allow-origin": route.request().headers()["origin"] ?? "*", "access-control-allow-credentials": "true" },
        json: { ...data.me, termsAgreed: agreed },
      }),
    );
    await page.route(`${API_ORIGIN}/api/me/terms`, async (route) => {
      const cors = {
        "access-control-allow-origin": route.request().headers()["origin"] ?? "*",
        "access-control-allow-credentials": "true",
        "access-control-allow-methods": "POST",
        "access-control-allow-headers": "Content-Type,X-XSRF-TOKEN",
      };
      if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
      posted.push(route.request().postDataJSON());
      agreed = true;
      return route.fulfill({ status: 204, headers: cors });
    });

    await page.goto("/routine");
    await expect(page).toHaveURL(/\/agree$/);
    const start = page.getByRole("button", { name: "동의하고 시작하기" });
    await expect(start).toBeDisabled();

    await page.getByLabel("[필수] 서비스 이용약관").check();
    await expect(start).toBeDisabled(); // 필수 하나만으로는 안 된다
    await page.getByLabel("모두 동의해요").check();
    await expect(page.getByLabel("[필수] 개인정보 수집·이용")).toBeChecked();
    await start.click();

    await expect(page).toHaveURL(/\/$/);
    expect(posted).toEqual([{ version: data.me.termsVersion }]);
    await expect(page.getByTestId("home-greeting")).toContainText(`${data.me.nickname}님`);
  });

  test("약관과 개인정보 문서는 동의 전에도 볼 수 있다", async ({ page }) => {
    await page.route(`${API_ORIGIN}/api/me`, (route) =>
      route.fulfill({
        status: 200,
        headers: { "access-control-allow-origin": route.request().headers()["origin"] ?? "*", "access-control-allow-credentials": "true" },
        json: { ...data.me, termsAgreed: false },
      }),
    );
    await page.goto("/terms");
    await expect(page.getByText("의학적 진단이나 치료가 아닙니다").first()).toBeVisible();
    await page.goto("/privacy");
    await expect(page.getByText("수집하는 항목").first()).toBeVisible();
    await expect(page).toHaveURL(/\/privacy$/);
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

  test("제품 하트: 누르는 즉시 채워지며 톡 튀고, 관심 등록 요청을 보낸다", async ({ page, api }) => {
    await page.goto("/products");
    const product = data.products.items!.find((p) => !p.interested)!;
    const heart = page.getByRole("button", { name: `${product.name} 관심 등록` });
    await heart.click();
    const liked = page.getByRole("button", { name: `${product.name} 관심 해제` });
    await expect(liked).toHaveAttribute("aria-pressed", "true");
    await expect(liked.locator("svg")).toHaveAttribute("data-liked", "true");
    await expect.poll(() => api.calls).toContain("POST /api/my-products");
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

  test("AI 채팅: 지난 질문과 마크다운 답변(제목·목록·강조)", async ({ page }) => {
    await page.goto(`/chat/${data.conversation.id}`);
    await expect(page.getByText(data.conversation.messages![0].content!).first()).toBeVisible();
    await expect(page.getByText("야외훈련 중이면 2~3시간마다 다시 바르는 게 좋아요.")).toBeVisible();
    await expect(page.getByText("실천 팁", { exact: true })).toBeVisible();
    await expect(page.locator("li", { hasText: "덧바르기" }).locator("strong")).toHaveText("땀을 닦은 뒤");
    await expect(page.getByText("###")).toHaveCount(0); // 마크다운 기호가 그대로 보이면 안 된다
    await expect(page.getByRole("region", { name: "실천 팁" })).toHaveCount(0); // 본문에 있는 팁을 따로 또 보여 주지 않는다
  });

  test("AI 채팅: 답변을 신고하면 사유를 골라 보내고 완료 안내를 보여 준다", async ({ page }) => {
    const posted: unknown[] = [];
    const answer = data.conversation.messages!.find((m) => m.role === "ASSISTANT")!;
    await page.route(`${API_ORIGIN}/api/conversations/${data.conversation.id}/messages/${answer.id}/reports`, async (route) => {
      const cors = {
        "access-control-allow-origin": route.request().headers()["origin"] ?? "*",
        "access-control-allow-credentials": "true",
        "access-control-allow-methods": "POST",
        "access-control-allow-headers": "Content-Type,X-XSRF-TOKEN",
      };
      if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
      posted.push(route.request().postDataJSON());
      return route.fulfill({ status: 204, headers: cors });
    });

    await page.goto(`/chat/${data.conversation.id}`);
    await page.getByRole("button", { name: "이 답변 신고" }).click();
    const dialog = page.getByRole("dialog", { name: "이 답변을 신고할까요?" });
    const send = dialog.getByRole("button", { name: "보내기" });
    await expect(send).toBeDisabled(); // 사유를 고르기 전에는 보낼 수 없다
    await dialog.getByLabel("진단·처방처럼 말해요").check();
    await dialog.getByLabel("덧붙일 내용 (선택)").fill("  병원 처방처럼 들려요 ");
    await send.click();

    await expect(page.getByRole("status")).toHaveText("신고했어요. 검토 후 반영할게요.");
    expect(posted).toEqual([{ reason: "MEDICAL", detail: "병원 처방처럼 들려요" }]);
  });

  test("상담 리포트: 리포트 신고 버튼이 있다", async ({ page }) => {
    await page.goto(`/consult/${data.consultation.id}`);
    await page.getByRole("button", { name: "이 리포트 신고" }).click();
    await expect(page.getByRole("dialog", { name: "이 리포트를 신고할까요?" })).toBeVisible();
    await page.getByRole("button", { name: "취소" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
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
