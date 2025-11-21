// tests/e2e-happy-path.spec.js
const { test, expect } = require("@playwright/test");

test("happy path: register → login → view offers → accept", async ({ page }) => {
  // unique user per run
  const email = `user${Date.now()}@test.com`;
  const password = "test1234"; // must satisfy Firebase rules

  // 1) REGISTER
  await page.goto("/register");

  // These match your actual labels: "Full name", "Email", "Password"
  await page.getByLabel(/full name/i).fill("Test User");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);

  // Button text is "Create account" in your JSX
  await page
    .getByRole("button", { name: /create account/i })
    .click();

  // Wait for Dashboard heading (your Dashboard page h1 = "Dashboard")
  await expect(
    page.getByRole("heading", { name: /dashboard/i })
  ).toBeVisible({ timeout: 20000 });

  // 2) LOGOUT
  // Sidebar has a Logout button
//   await page.getByRole("button", { name: /logout/i }).click();
await page
  .getByRole("complementary")
  .getByRole("button", { name: /logout/i })
  .click();


  // Now you are back on Login page, h1 = "Welcome back"
  await expect(
    page.getByRole("heading", { name: /welcome back/i })
  ).toBeVisible({ timeout: 20000 });

  // 3) LOGIN with same user
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);

  await page
    .getByRole("button", { name: /sign in/i })
    .click();

  await expect(
    page.getByRole("heading", { name: /dashboard/i })
  ).toBeVisible({ timeout: 20000 });

  // 4) GO TO OFFERS
  await page.goto("/offers");

  // Your Offers page likely has a heading containing "Offers" (e.g. "My Offers")
  await expect(
    page.getByRole("heading", { name: /offers/i })
  ).toBeVisible({ timeout: 20000 });

  // 5) ACCEPT FIRST OFFER (if any)
  const firstAcceptButton = page
    .getByRole("button", { name: /accept/i })
    .first();

  if (await firstAcceptButton.isVisible().catch(() => false)) {
    await firstAcceptButton.click();
    // tiny pause to let UI update
    await page.waitForTimeout(1000);
  }

  // Stay on offers page at the end
  await expect(page).toHaveURL(/\/offers/);
});
