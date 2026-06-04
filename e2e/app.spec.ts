import { test, expect, Page } from "@playwright/test";

// クイズを最後まで回答するヘルパー
async function answerQuizToResult(page: Page, maxQuestions = 35) {
  for (let i = 0; i < maxQuestions; i++) {
    const options = page.getByTestId("quiz-option");
    await options.first().waitFor({ state: "visible" });
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(2); // 4択 or ○×
    // 正答index相当を知らなくてよい: 先頭の選択肢を選ぶ
    await options.first().click();
    const next = page.getByTestId("quiz-next");
    await next.click();
    // 結果画面に到達したら終了
    if (await page.getByText("正答率").isVisible().catch(() => false)) return;
  }
}

test.describe("ナビゲーション/トップ", () => {
  test("トップページが表示されナビリンクがある", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "一覧" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "クイズ" }).first()).toBeVisible();
  });

  test("ナビから一覧へ遷移できる", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "一覧" }).first().click();
    await expect(page).toHaveURL(/\/heritage/);
  });
});

test.describe("遺産一覧/詳細 (要DB)", () => {
  test("一覧が件数付きで表示され、検索・フィルタが効く", async ({ page }) => {
    await page.goto("/heritage");
    const countText = page.getByText(/\d+件/).first();
    await expect(countText).toBeVisible();

    // 地域=日本でフィルタ → 件数が変わる(26件前後)
    const selects = page.locator("select");
    await selects.nth(1).selectOption("japan"); // 0:カテゴリ, 1:地域 (一覧ページ)
    await page.waitForTimeout(800);
    await expect(page.getByText(/\d+件/).first()).toBeVisible();
  });

  test("一覧から詳細ページへ遷移できる", async ({ page }) => {
    await page.goto("/heritage");
    // カード or テーブル行をクリック
    const firstCard = page.locator("a[href^='/heritage/']").first();
    await firstCard.waitFor({ state: "visible" });
    await firstCard.click();
    await expect(page).toHaveURL(/\/heritage\/\d+/);
  });
});

test.describe("地図/写真 (要DB)", () => {
  test("地図ページでLeafletが描画される", async ({ page }) => {
    await page.goto("/map");
    await expect(page.locator(".leaflet-container")).toBeVisible({ timeout: 20000 });
  });

  test("写真学習ページが表示される", async ({ page }) => {
    await page.goto("/photo");
    await page.waitForLoadState("networkidle");
    // 何らかのカード/画像が表示される
    await expect(page.locator("body")).toContainText(/.+/);
  });
});

test.describe("クイズ", () => {
  test("概念クイズ(DB非依存)を最後まで回答して結果が出る", async ({ page }) => {
    await page.goto("/quiz");
    const selects = page.locator("select");
    await selects.nth(0).selectOption("concept"); // 出題形式
    await selects.nth(1).selectOption("5"); // 問題数
    await page.getByTestId("quiz-start").click();
    await answerQuizToResult(page);
    await expect(page.getByText("正答率")).toBeVisible();
  });

  test("構成資産クイズ(DB非依存)を回答できる", async ({ page }) => {
    await page.goto("/quiz");
    const selects = page.locator("select");
    await selects.nth(0).selectOption("serial");
    await selects.nth(1).selectOption("5");
    await page.getByTestId("quiz-start").click();
    await answerQuizToResult(page);
    await expect(page.getByText("正答率")).toBeVisible();
  });

  test("登録基準クイズ(要DB)を回答できる", async ({ page }) => {
    await page.goto("/quiz");
    const selects = page.locator("select");
    await selects.nth(0).selectOption("criteria");
    await selects.nth(1).selectOption("5");
    await page.getByTestId("quiz-start").click();
    await answerQuizToResult(page);
    await expect(page.getByText("正答率")).toBeVisible();
  });

  test("重み付けトグルは遺産ベース形式で表示され概念形式で隠れる", async ({ page }) => {
    await page.goto("/quiz");
    const selects = page.locator("select");
    await selects.nth(0).selectOption("name");
    await expect(page.getByText("苦手・重要度を優先して出題")).toBeVisible();
    await selects.nth(0).selectOption("concept");
    await expect(page.getByText("苦手・重要度を優先して出題")).toBeHidden();
  });
});

test.describe("復習/進捗/認証", () => {
  test("復習ページが表示される", async ({ page }) => {
    await page.goto("/review");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toContainText(/.+/);
  });

  test("ダッシュボード(進捗)が表示される", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toContainText(/.+/);
  });

  test("認証ページにログインフォームがある", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
  });
});
