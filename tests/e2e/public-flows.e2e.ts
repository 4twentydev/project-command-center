import { expect, test, type Page } from "@playwright/test";

function failOnBrowserErrors(page: Page) {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") failures.push(message.text()); });
  return () => expect(failures).toEqual([]);
}

async function expectNoHorizontalDocumentOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(dimensions.document, `document width at ${dimensions.viewport}px`).toBeLessThanOrEqual(dimensions.viewport);
  expect(dimensions.body, `body width at ${dimensions.viewport}px`).toBeLessThanOrEqual(dimensions.viewport);
}

test("homepage renders and primary navigation reaches the about page", async ({ page }) => {
  const assertNoErrors = failOnBrowserErrors(page);
  const response = await page.goto("/");
  expect(response?.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(response?.headers()["permissions-policy"]).toContain("publickey-credentials-get=(self)");
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Software and automation");
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await page.getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("[data-nextjs-dialog]")).toHaveCount(0);
  assertNoErrors();
});

test("workflow audit form exposes native required-field validation", async ({ page }) => {
  const assertNoErrors = failOnBrowserErrors(page);
  await page.goto("/workflow-audit#audit-intake");
  await page.getByRole("button", { name: "Request workflow audit" }).click();
  await expect(page.locator("#audit-name")).toBeFocused();
  await expect(page.locator("#audit-name")).toHaveJSProperty("validity.valueMissing", true);
  await expect(page).toHaveURL(/\/workflow-audit/);
  assertNoErrors();
});

test("mobile layout keeps the primary owner entry point and audit navigation usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const assertNoErrors = failOnBrowserErrors(page);
  await page.goto("/");
  await expectNoHorizontalDocumentOverflow(page);
  await expect(page.getByRole("link", { name: "Command Center" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Contact", exact: true })).toBeHidden();
  await page.getByRole("link", { name: "Book a workflow audit" }).first().click();
  await expect(page).toHaveURL(/\/workflow-audit$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("work is getting stuck");
  await expectNoHorizontalDocumentOverflow(page);
  assertNoErrors();
});

test("service FAQ disclosure remains keyboard operable", async ({ page }) => {
  const assertNoErrors = failOnBrowserErrors(page);
  await page.goto("/services/workflow-automation");
  const firstDisclosure = page.locator("details").first();
  await firstDisclosure.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(firstDisclosure).toHaveAttribute("open", "");
  assertNoErrors();
});

test("login next parameter cannot create an external navigation target", async ({ page }) => {
  const assertNoErrors = failOnBrowserErrors(page);
  await page.goto("/login?next=https://evil.example/steal");
  await expect(page.getByRole("heading", { name: "Command Center" })).toBeVisible();
  await expect(page.locator("[data-nextjs-dialog]")).toHaveCount(0);
  await expect(page.locator('a[href*="evil.example"], form[action*="evil.example"]')).toHaveCount(0);
  assertNoErrors();
});
