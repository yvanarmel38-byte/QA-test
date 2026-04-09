import { test, expect } from '@playwright/test';
import { ProfilePage } from '../pages/ProfilePage';
import { collectPageTimings, PERF_THRESHOLDS } from '../utils/helpers';

test.use({ trace: 'on' });

test.describe('Performance – Page Load Timings', () => {
  test('Page load timing meets all performance thresholds', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.goto();

    const timings = await collectPageTimings(page);

    expect(
      timings.ttfb,
      `TTFB ${timings.ttfb}ms exceeds threshold of ${PERF_THRESHOLDS.ttfb}ms`,
    ).toBeLessThanOrEqual(PERF_THRESHOLDS.ttfb);

    expect(
      timings.domContentLoaded,
      `DOMContentLoaded ${timings.domContentLoaded}ms exceeds threshold of ${PERF_THRESHOLDS.domContentLoaded}ms`,
    ).toBeLessThanOrEqual(PERF_THRESHOLDS.domContentLoaded);

    expect(
      timings.load,
      `Load event ${timings.load}ms exceeds threshold of ${PERF_THRESHOLDS.load}ms`,
    ).toBeLessThanOrEqual(PERF_THRESHOLDS.load);
  });
});
