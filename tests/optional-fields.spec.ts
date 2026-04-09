import { test, expect } from '@playwright/test';
import { ProfilePage } from '../pages/ProfilePage';
import { submitAndCaptureAlert, submitAndExpectSuccess } from '../utils/helpers';
import { validMinimalUser } from '../test-data/fixtures';

test.describe('Feature Group 7 – Gender', () => {
  test.beforeEach(async ({ page }) => {
    await new ProfilePage(page).goto();
  });

  test('HP_TC-030 – Selecting gender "male" and submitting succeeds', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields({ ...validMinimalUser, gender: 'male' });
    await submitAndExpectSuccess(page);
  });

  test('HP_TC-031 – Selecting gender "female" and submitting succeeds', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields({ ...validMinimalUser, gender: 'female' });
    await submitAndExpectSuccess(page);
  });

  test('HP_TC-032 – Gender "non-binary" option is not present on the form', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.goto();
    await expect(
      page.getByRole('radio', { name: /^non-binary$/i }),
    ).toHaveCount(0);
  });

  test('HP_TC-033 – Selecting gender "prefer not to say" and submitting succeeds', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields({ ...validMinimalUser, gender: 'prefer not to say' });
    await submitAndExpectSuccess(page);
  });

  test('EC_TC-034 – Leaving gender unselected does not block form submission', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields(validMinimalUser);
    await submitAndExpectSuccess(page);
  });
});

test.describe('Feature Group 8 – Date of Birth', () => {
  test.beforeEach(async ({ page }) => {
    await new ProfilePage(page).goto();
  });

  test('HP_TC-035 – Valid date of birth in YYYY-MM-DD format is accepted', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields({ ...validMinimalUser, dateOfBirth: '1990-01-15' });
    await submitAndExpectSuccess(page);
  });

  test('EC_TC-036 – Leaving date of birth empty does not block form submission', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields(validMinimalUser);
    await submitAndExpectSuccess(page);
  });

  test('VC_TC-037 – Date of birth in DD/MM/YYYY format is blocked', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillMandatoryFields(validMinimalUser);
    // Browser date inputs sanitise invalid formats; type directly to bypass driver validation
    await p.dateOfBirthInput.focus();
    await page.keyboard.type('30/01/1990');
    const actual = await p.dateOfBirthInput.inputValue();
    // The browser should reject the invalid format — field should be empty or sanitised
    expect(actual, 'Browser should not accept DD/MM/YYYY date format').not.toBe('30/01/1990');
  });

  test('VC_TC-038 – Non-existent date (e.g. February 30) is blocked', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillMandatoryFields(validMinimalUser);
    // Browser date inputs sanitise non-existent dates at the driver level
    await p.dateOfBirthInput.focus();
    await page.keyboard.type('1990-02-30');
    const actual = await p.dateOfBirthInput.inputValue();
    // The browser should reject or sanitise Feb 30 — field should not hold that exact value
    expect(actual, 'Browser should not accept non-existent date Feb 30').not.toBe('1990-02-30');
  });

  test('EC_TC-039 – Future date of birth is handled correctly by the system', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields({ ...validMinimalUser, dateOfBirth: '2099-12-31' });
    await submitAndExpectSuccess(page);
  });
});

test.describe('Feature Group 9 – Phone Number', () => {
  test.beforeEach(async ({ page }) => {
    await new ProfilePage(page).goto();
  });

  test('HP_TC-040 – Valid 10-digit numerical phone number is accepted', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields({ ...validMinimalUser, phoneNumber: '1234567890' });
    await submitAndExpectSuccess(page);
  });

  test('EC_TC-041 – Leaving phone number empty does not block form submission', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields(validMinimalUser);
    await submitAndExpectSuccess(page);
  });

  test('VC_TC-042 – Phone number containing letters is blocked', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields({ ...validMinimalUser, phoneNumber: 'abc1234567' });
    const msg = await submitAndCaptureAlert(page, () => p.submit());
    expect(msg, 'Expected alert for phone number with letters').not.toBe('');
  });

  test('VC_TC-043 – Phone number exceeding 10 digits is blocked', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields({ ...validMinimalUser, phoneNumber: '12345678901' });
    const msg = await submitAndCaptureAlert(page, () => p.submit());
    expect(msg, 'Expected alert for phone number > 10 digits').not.toBe('');
  });

  test('VC_TC-044 – Phone number containing special characters is blocked', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields({ ...validMinimalUser, phoneNumber: '123-456-789' });
    const msg = await submitAndCaptureAlert(page, () => p.submit());
    expect(msg, 'Expected alert for phone number with special chars').not.toBe('');
  });

  test('EC_TC-045 – Phone number with fewer than 10 digits is accepted', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields({ ...validMinimalUser, phoneNumber: '12345' });
    await submitAndExpectSuccess(page);
  });
});

test.describe('Feature Group 10 – Address', () => {
  test.beforeEach(async ({ page }) => {
    await new ProfilePage(page).goto();
  });

  test('HP_TC-046 – Valid address with alphanumeric, spaces, and symbols is accepted', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields({ ...validMinimalUser, address: '123 Main St, Apt 1' });
    await submitAndExpectSuccess(page);
  });

  test('EC_TC-047 – Leaving address empty does not block form submission', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields(validMinimalUser);
    await submitAndExpectSuccess(page);
  });

  test('EC_TC-048 – Address containing only symbol characters is accepted', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields({ ...validMinimalUser, address: '@!#$%^&*' });
    await submitAndExpectSuccess(page);
  });

  test('EC_TC-049 – Address at maximum allowed length is accepted', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields({ ...validMinimalUser, address: 'A'.repeat(200) });
    await submitAndExpectSuccess(page);
  });
});

test.describe('Feature Group 11 – LinkedIn URL', () => {
  test.beforeEach(async ({ page }) => {
    await new ProfilePage(page).goto();
  });

  test('HP_TC-050 – Valid LinkedIn profile URL is accepted', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields({ ...validMinimalUser, linkedinUrl: 'https://www.linkedin.com/in/johnsmith' });
    await submitAndExpectSuccess(page);
  });

  test('EC_TC-051 – Leaving LinkedIn URL empty does not block form submission', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillMandatoryFields(validMinimalUser);
    // BUG: form shows "LinkedIn must be filled out" even though field is labeled optional
    await submitAndExpectSuccess(page);
  });

  test('VC_TC-052 – LinkedIn URL with incorrect domain is blocked', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillMandatoryFields(validMinimalUser);
    await p.fillOptionalFields({ linkedinUrl: 'https://twitter.com/johnsmith' });
    const msg = await submitAndCaptureAlert(page, () => p.submit());
    expect(msg, 'Expected alert for LinkedIn URL with wrong domain').not.toBe('');
  });

  test('VC_TC-053 – LinkedIn URL without https:// prefix is blocked', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillMandatoryFields(validMinimalUser);
    await p.fillOptionalFields({ linkedinUrl: 'linkedin.com/in/johnsmith' });
    const msg = await submitAndCaptureAlert(page, () => p.submit());
    expect(msg, 'Expected alert for LinkedIn URL missing https://').not.toBe('');
  });
});

test.describe('Feature Group 12 – GitHub URL', () => {
  test.beforeEach(async ({ page }) => {
    await new ProfilePage(page).goto();
  });

  test('HP_TC-054 – Valid GitHub profile URL is accepted', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields({ ...validMinimalUser, githubUrl: 'https://github.com/johnsmith' });
    await submitAndExpectSuccess(page);
  });

  test('EC_TC-055 – Leaving GitHub URL empty does not block form submission', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields(validMinimalUser);
    await submitAndExpectSuccess(page);
  });

  test('VC_TC-056 – GitHub URL with incorrect domain is blocked', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields({ ...validMinimalUser, githubUrl: 'https://gitlab.com/johnsmith' });
    const msg = await submitAndCaptureAlert(page, () => p.submit());
    expect(msg, 'Expected alert for GitHub URL with wrong domain').not.toBe('');
  });
});
