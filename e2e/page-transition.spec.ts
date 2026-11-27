import { test, expect, type Page } from "@playwright/test";
import { mockApi } from "./mock-api";

/** 페이지 이동 모션: 다음 화면 전환(view transition)에서 실제로 돈 애니메이션 이름을 모은다. */
async function recordNextTransition(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as { __vt: Promise<string[]> };
    const orig = document.startViewTransition.bind(document);
    w.__vt = new Promise((resolve) => {
      document.startViewTransition = ((arg: Parameters<typeof orig>[0]) => {
        const t = orig(arg);
        t.ready
          .then(() =>
            resolve(
              document
                .getAnimations()
                .filter((a) => (a.effect as KeyframeEffect | null)?.pseudoElement)
                .map((a) => `${(a.effect as KeyframeEffect).pseudoElement} ${(a as CSSAnimation).animationName}`),
            ),
          )
          .catch((e) => resolve([`error ${e}`]));
        return t;
      }) as typeof document.startViewTransition;
    });
  });
  return () => page.evaluate(() => (window as unknown as { __vt: Promise<string[]> }).__vt);
}

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("탭을 옮기면 새 페이지가 떠오르며 나타나고, 탭바는 움직이지 않는다", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("home-greeting")).toContainText("님");
  const animations = await recordNextTransition(page);
  await page.getByRole("navigation", { name: "주요 메뉴" }).getByRole("link", { name: "제품" }).click();
  await expect(page).toHaveURL(/\/products$/);

  const names = await animations();
  expect(names.join("\n")).toMatch(/::view-transition-new\(.+\) page-rise/);
  expect(names.join("\n")).toMatch(/::view-transition-old\(.+\) page-fade/);
  expect(names.filter((n) => n.includes("(tab-bar)"))).toEqual([]); // 탭바는 애니메이션 없음
});

test("뒤로 가기(상단 바)는 돌아간 페이지가 왼쪽에서 밀려 들어온다", async ({ page }) => {
  await page.goto("/products");
  // 앱 안에서 이동해야 뒤로 가기도 앱 안 이동이 된다.
  await page.getByRole("navigation", { name: "주요 메뉴" }).getByRole("link", { name: "설정" }).click();
  await expect(page).toHaveURL(/\/settings$/);
  // 그려진 직후 시작하는 애니메이션의 첫 프레임을 모은다.
  await page.evaluate(() => {
    const w = window as unknown as { __frames: string[] };
    w.__frames = [];
    const orig = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) {
      w.__frames.push(JSON.stringify(Array.isArray(frames) ? frames[0] : frames));
      return orig.call(this, frames, options);
    };
  });
  await page.getByRole("button", { name: "뒤로 가기" }).click();
  await expect(page).toHaveURL(/\/products$/);

  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __frames: string[] }).__frames.join("\n")))
    .toContain('"translate":"-40px 0"');
});
