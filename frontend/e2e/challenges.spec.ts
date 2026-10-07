import { test, expect } from '@playwright/test';

test.describe('TDD Challenge Lab', () => {
  test('loads the application successfully', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', {
        name: 'TDD Challenge Lab',
      }),
    ).toBeVisible();

    await expect(
      page.getByText('Tests before functional code. Red → Green → Refactor.'),
    ).toBeVisible();
  });

  test('loads challenges from the backend API', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', {
        name: 'Build a Counter',
      }),
    ).toBeVisible();

    await expect(
      page.getByRole('heading', {
        name: 'Health Endpoint',
      }),
    ).toBeVisible();

    await expect(
      page.getByRole('heading', {
        name: 'Filter Challenges',
      }),
    ).toBeVisible();

    await expect(page.getByText('3 challenges')).toBeVisible();
  });

  test('displays challenge details', async ({ page }) => {
    await page.goto('/');

    const challenge = page.locator('article.card').filter({
      hasText: 'Build a Counter',
    });

    await expect(challenge).toBeVisible();

    await expect(
      challenge.getByText('Beginner'),
    ).toBeVisible();

    await expect(
      challenge.getByText('React state'),
    ).toBeVisible();

    await expect(
      challenge.getByText('Write the failing test'),
    ).toBeVisible();

    await expect(
      challenge.getByText('Implement the counter'),
    ).toBeVisible();

    await expect(
      challenge.getByText('Refactor'),
    ).toBeVisible();
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
      page.getByRole('alert'),
    ).toHaveText('Unable to load challenges');

    await expect(
      page.getByText('0 challenges'),
    ).toBeVisible();
  });
});