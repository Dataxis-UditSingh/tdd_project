import { test, expect } from '@playwright/test';

test('application loads', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'TDD Challenge Lab' })
  ).toBeVisible();

  await expect(
    page.getByText('Write the test first. Make it fail. Make it pass. Refactor.')
  ).toBeVisible();
});

test('challenges load from backend', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Build a Counter')).toBeVisible();
  await expect(page.getByText('Health Endpoint')).toBeVisible();
  await expect(page.getByText('Filter Challenges')).toBeVisible();
});

test('challenge details render', async ({ page }) => {
  await page.goto('/');

  const challenge = page.getByText('Build a Counter');

  await expect(challenge).toBeVisible();
  await expect(page.getByText('React state')).toBeVisible();
  await expect(page.getByText('Events')).toBeVisible();
  await expect(page.getByText('Component tests')).toBeVisible();
});

test('shows an error when the challenges API fails', async ({ page }) => {
  await page.route('**/api/challenges', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Internal Server Error',
      }),
    });
  });

  await page.goto('/');

  await expect(
    page.getByRole('alert').filter({ hasText: 'Unable to load challenges' })
  ).toBeVisible();
});