import { test, expect } from "@playwright/test";

// Helpers to make unique test emails
function makeTestEmail() {
  const ts = Date.now();
  return `firebolt-e2e+${ts}@example.com`;
}

const TEST_PASSWORD = "Test1234!"; // make sure this passes your Firebase password rules

// 1) REGISTER + AUTO-LOGIN + DASHBOARD

test("user can register and land on dashboard", async ({ page }) => {
  const email = makeTestEmail();

  // Go to register page
  await page.goto("/register");

  // Fill form (adjust selectors if your labels/button text are slightly different)
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/^password$/i).fill(TEST_PASSWORD);
  await page.getByLabel(/confirm/i).fill(TEST_PASSWORD);

  // Submit
  await page.getByRole("button", { name: /register|sign up|create account/i }).click();

  // Expect redirect to dashboard (or /offers if that's your home)
  await page.waitForURL("**/dashboard", { timeout: 15000 });

  // Basic assertion that dashboard loaded
  await expect(page.getByText(/dashboard/i)).toBeVisible();
});

// 2) LOGIN → VIEW OFFERS → ACCEPT FIRST OFFER
//
// PRECONDITION:
// - You already have a known test user (email + password) created in Firebase Auth.
// - That user already has at least one PENDING offer in Firestore
//   (you can create it once via your Admin UI).
//
// Fill these with your real test user credentials:
const EXISTING_USER_EMAIL = "your-test-user@example.com";
const EXISTING_USER_PASSWORD = "Test1234!"; // same as whatever you set

test("existing user can login, view offers and accept one", async ({ page }) => {
  // Go to login page
  await page.goto("/login");

  // Fill login form
  await page.getByLabel(/email/i).fill(EXISTING_USER_EMAIL);
  await page.getByLabel(/^password$/i).fill(EXISTING_USER_PASSWORD);

  await page.getByRole("button", { name: /login|sign in/i }).click();

  // Wait for dashboard (or wherever ProtectedRoute sends you)
  await page.waitForURL("**/dashboard", { timeout: 15000 });

  // Navigate to offers page
  await page.goto("/offers");

  // Expect at least something on the offers page
  await expect(page.getByText(/offers/i)).toBeVisible();

  // Find first "Accept" button and click it
  // (Adjust the text if your button says something else, like "Accept offer")
  const acceptButton = page.getByRole("button", { name: /accept/i }).first();

  // Make sure the button exists
  await expect(acceptButton).toBeVisible();

  // Click accept
  await acceptButton.click();

  // Optional: assert that status changed to "accepted"
  // (Adjust selector based on how you show status in your UI)
  await expect(page.getByText(/accepted/i)).toBeVisible();
});
