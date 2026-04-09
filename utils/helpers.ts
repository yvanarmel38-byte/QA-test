import { type Page, expect } from '@playwright/test';

/**
 * utils/helpers.ts
 *
 * Shared assertion helpers and wait utilities used across all spec files.
 *
 * IMPORTANT: The live page (https://qa-assessment.pages.dev/) uses browser
 * alert() dialogs for validation feedback — not inline DOM error elements.
 * All error-capture helpers below intercept dialogs before clicking Submit.
 */

// ── Alert-based validation helpers ───────────────────────────────────────────

/**
 * Register a one-shot dialog listener and click submit.
 * Returns the alert message text, or an empty string if no dialog fired.
 *
 * Usage:
 *   const msg = await submitAndCaptureAlert(page, () => page.click('#submit'));
 *   expect(msg).toContain('First name must');
 */
export async function submitAndCaptureAlert(
  page: Page,
  submitFn: () => Promise<void>,
): Promise<string> {
  let dialogMessage = '';

  // Register listener BEFORE triggering the dialog
  const dialogHandler = (dialog: { message: () => string; dismiss: () => Promise<void> }) => {
    dialogMessage = dialog.message();
    // Dismiss so the page does not hang
    void dialog.dismiss();
  };

  page.once('dialog', dialogHandler);
  await submitFn();

  // Give the JS event loop a tick to fire any synchronous alert
  await page.waitForTimeout(500);

  return dialogMessage;
}

/**
 * Assert that submitting the form triggers an alert containing the expected message.
 */
export async function expectAlertMessage(
  page: Page,
  submitFn: () => Promise<void>,
  expectedText: string,
): Promise<void> {
  const msg = await submitAndCaptureAlert(page, submitFn);
  expect(
    msg,
    `Expected alert to contain "${expectedText}" but got: "${msg}"`,
  ).toContain(expectedText);
}

/**
 * Assert that submitting the form triggers NO alert (validation passes).
 * After a clean submit the page appends <p class="success">Success!</p>.
 */
export async function expectNoAlert(
  page: Page,
  submitFn: () => Promise<void>,
): Promise<void> {
  const msg = await submitAndCaptureAlert(page, submitFn);
  expect(
    msg,
    `Expected no alert dialog but got: "${msg}"`,
  ).toBe('');
}

// ── Success assertion ─────────────────────────────────────────────────────────

/**
 * Submit the form while intercepting the subsequent page reload that would
 * otherwise destroy the success element.
 *
 * The live page has `<form onsubmit="return validateForm()">` with no explicit
 * `action`, so a successful validation causes a GET reload that wipes the DOM.
 * We intercept that reload request so the success message remains visible.
 *
 * Usage: call this INSTEAD of `profilePage.submit()` when asserting success.
 */
export async function submitAndExpectSuccess(page: Page): Promise<void> {
  // Override form.submit() and the onsubmit default action so the page doesn't
  // navigate away — validateForm() appends <p class="success"> then returns
  // undefined, which the browser treats as "submit the form" (GET reload).
  // Patching both prevents the reload while allowing the DOM mutation to occur.
  await page.evaluate(() => {
    // Disable the form's native submit so the GET reload never fires.
    // Use a generic 'form' selector — the form name attribute may vary.
    const form = document.querySelector('form') as HTMLFormElement | null;
    if (form) {
      form.addEventListener('submit', (e) => e.preventDefault(), true);
    }
    // Also patch HTMLFormElement.prototype.submit (called by some browsers implicitly)
    HTMLFormElement.prototype.submit = function () { /* no-op */ };
  });

  // Capture any unexpected validation alert so the failure message is descriptive
  let unexpectedAlert = '';
  page.once('dialog', (dialog) => {
    unexpectedAlert = dialog.message();
    void dialog.dismiss();
  });

  await page.locator('[type="submit"], button[type="submit"], input[type="submit"], button:has-text("Submit")').first().click();

  // Allow synchronous alerts to fire before asserting success
  await page.waitForTimeout(300);

  if (unexpectedAlert) {
    throw new Error(`Expected success but form showed validation alert: "${unexpectedAlert}"`);
  }

  // Wait for the script to append <p class="success">
  await expect(page.locator('p.success')).toBeVisible({ timeout: 5_000 });
}

/**
 * Assert that the success paragraph is visible after a successful submit.
 *
 * @deprecated Prefer `submitAndExpectSuccess(page)` which handles the form
 * reload interception automatically. This overload exists for tests that
 * call `page.submit()` separately.
 */
export async function expectSuccessMessage(page: Page): Promise<void> {
  // Wait for the success element the script appends asynchronously
  await expect(page.locator('p.success')).toBeVisible({ timeout: 10_000 });
}

// ── Legacy no-op ─────────────────────────────────────────────────────────────

/**
 * @deprecated Use `submitAndCaptureAlert` + `expectAlertMessage` instead.
 * Left for backward compatibility — checks alert presence via dialog interception.
 */
export async function expectFieldError(page: Page, _label: string): Promise<void> {
  // On this page, errors are shown as alerts, not DOM elements.
  // This function is a no-op placeholder; use expectAlertMessage in new tests.
  void page;
}

// ── Wait utilities ────────────────────────────────────────────────────────────

/** Wait for the page to reach the "networkidle" state. */
export async function waitForNetworkIdle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

// ── Performance helpers ───────────────────────────────────────────────────────

/** Performance timing thresholds in milliseconds. */
export const PERF_THRESHOLDS = {
  domContentLoaded: 3_000,
  load: 5_000,
  ttfb: 800,
} as const;

/**
 * Collect page timing metrics using the browser's PerformanceTiming API.
 */
export async function collectPageTimings(page: Page): Promise<{
  ttfb: number;
  domContentLoaded: number;
  load: number;
}> {
  // page.evaluate runs inside the browser — PerformanceTiming and window are
  // browser globals not available in the Node/TypeScript compilation context.
  const timings = await page.evaluate<{ ttfb: number; domContentLoaded: number; load: number }>(
    () => {
      /* global window */
      // @ts-ignore: browser-only API
      const t = window.performance.timing; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
      return {
        // @ts-ignore: browser-only API
        ttfb: t.responseStart - t.navigationStart,
        // @ts-ignore: browser-only API
        domContentLoaded: t.domContentLoadedEventEnd - t.navigationStart,
        // @ts-ignore: browser-only API
        load: t.loadEventEnd - t.navigationStart,
      };
    },
  );
  return timings;
}
