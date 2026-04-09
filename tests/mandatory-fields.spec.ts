import { test, expect } from '@playwright/test';
import { ProfilePage } from '../pages/ProfilePage';
import { submitAndCaptureAlert, submitAndExpectSuccess } from '../utils/helpers';
import { validMinimalUser } from '../test-data/fixtures';

test.describe('Feature Group 1 – Form Access & Page Load', () => {
  test('HP_TC-001 – Page loads and form is visible', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.goto();
    await expect(p.firstNameInput).toBeVisible();
    await expect(p.lastNameInput).toBeVisible();
    await expect(p.emailInput).toBeVisible();
    await expect(p.passwordInput).toBeVisible();
    await expect(p.confirmPasswordInput).toBeVisible();
    await expect(p.submitButton).toBeVisible();
  });

  test('HP_TC-002 – All mandatory field labels are visible and marked required', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.goto();
    await expect(page.getByLabel('First Name (mandatory):')).toBeVisible();
    await expect(page.getByLabel('Last Name (mandatory):')).toBeVisible();
    await expect(page.getByLabel('Email (mandatory):')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirmPassword')).toBeVisible();
  });

  test('HP_TC-003 – All optional field labels are visible', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.goto();
    await expect(p.genderSelect).toBeVisible();
    await expect(p.dateOfBirthInput).toBeVisible();
    await expect(p.phoneNumberInput).toBeVisible();
    await expect(p.addressInput).toBeVisible();
    await expect(p.linkedinUrlInput).toBeVisible();
    await expect(p.githubUrlInput).toBeVisible();
  });
});

test.describe('Feature Group 2 – First Name', () => {
  test.beforeEach(async ({ page }) => {
    await new ProfilePage(page).goto();
  });

  test('HP_TC-004 – Valid alphabetical first name is accepted', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields(validMinimalUser);
    await submitAndExpectSuccess(page);
  });

  test('VC_TC-005 – Empty first name blocks form submission', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillMandatoryFields({ ...validMinimalUser, firstName: '' });
    const msg = await submitAndCaptureAlert(page, () => p.submit());
    expect(msg, 'Expected alert when first name is empty').not.toBe('');
  });

  test('VC_TC-006 – First name containing numbers is blocked', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillMandatoryFields({ ...validMinimalUser, firstName: 'John123' });
    const msg = await submitAndCaptureAlert(page, () => p.submit());
    expect(msg, 'Expected alert for first name with numbers').not.toBe('');
  });

  test('VC_TC-007 – First name containing special characters is blocked', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillMandatoryFields({ ...validMinimalUser, firstName: 'John!' });
    const msg = await submitAndCaptureAlert(page, () => p.submit());
    expect(msg, 'Expected alert for first name with special chars').not.toBe('');
  });

  test('EC_TC-008 – First name at single-character minimum length is accepted', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields({ ...validMinimalUser, firstName: 'A' });
    await submitAndExpectSuccess(page);
  });

  test('EC_TC-009 – First name at maximum allowed length is accepted', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields({ ...validMinimalUser, firstName: 'A'.repeat(50) });
    await submitAndExpectSuccess(page);
  });
});

test.describe('Feature Group 3 – Last Name', () => {
  test.beforeEach(async ({ page }) => {
    await new ProfilePage(page).goto();
  });

  test('HP_TC-010 – Valid alphabetical last name is accepted', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields(validMinimalUser);
    await submitAndExpectSuccess(page);
  });

  test('VC_TC-011 – Empty last name blocks form submission', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillMandatoryFields({ ...validMinimalUser, lastName: '' });
    const msg = await submitAndCaptureAlert(page, () => p.submit());
    expect(msg, 'Expected alert when last name is empty').not.toBe('');
  });

  test('VC_TC-012 – Last name containing numbers is blocked', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillMandatoryFields({ ...validMinimalUser, lastName: 'Sm1th' });
    const msg = await submitAndCaptureAlert(page, () => p.submit());
    expect(msg, 'Expected alert for last name with numbers').not.toBe('');
  });

  test('VC_TC-013 – Last name containing special characters is blocked', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillMandatoryFields({ ...validMinimalUser, lastName: 'Smith!' });
    const msg = await submitAndCaptureAlert(page, () => p.submit());
    expect(msg, 'Expected alert for last name with special chars').not.toBe('');
  });

  test('EC_TC-014 – Last name at maximum allowed length is accepted', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields({ ...validMinimalUser, lastName: 'B'.repeat(50) });
    await submitAndExpectSuccess(page);
  });
});

test.describe('Feature Group 4 – Email', () => {
  test.beforeEach(async ({ page }) => {
    await new ProfilePage(page).goto();
  });

  test('HP_TC-015 – Valid email address is accepted', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields(validMinimalUser);
    await submitAndExpectSuccess(page);
  });

  test('VC_TC-016 – Empty email blocks form submission', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillMandatoryFields({ ...validMinimalUser, email: '' });
    const msg = await submitAndCaptureAlert(page, () => p.submit());
    expect(msg, 'Expected alert when email is empty').not.toBe('');
  });

  test('VC_TC-017 – Email missing @ symbol is blocked', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillMandatoryFields({ ...validMinimalUser, email: 'johnsmithexample.com' });
    const msg = await submitAndCaptureAlert(page, () => p.submit());
    expect(msg, 'Expected alert for email missing @').not.toBe('');
  });

  test('VC_TC-018 – Email missing domain extension is blocked', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillMandatoryFields({ ...validMinimalUser, email: 'john@' });
    const msg = await submitAndCaptureAlert(page, () => p.submit());
    expect(msg, 'Expected alert for email missing domain').not.toBe('');
  });

  test('EC_TC-019 – Email with subdomain is accepted', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields({ ...validMinimalUser, email: 'john.smith@mail.example.co.uk' });
    await submitAndExpectSuccess(page);
  });

  test('EC_TC-020 – Email with plus sign in local part is accepted', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields({ ...validMinimalUser, email: 'john+test@example.com' });
    await submitAndExpectSuccess(page);
  });
});

test.describe('Feature Group 5 – Password', () => {
  test.beforeEach(async ({ page }) => {
    await new ProfilePage(page).goto();
  });

  test('HP_TC-021 – Valid alphanumeric and symbol password is accepted', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields(validMinimalUser);
    await submitAndExpectSuccess(page);
  });

  test('VC_TC-022 – Empty password blocks form submission', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillMandatoryFields({ ...validMinimalUser, password: '', confirmPassword: '' });
    const msg = await submitAndCaptureAlert(page, () => p.submit());
    expect(msg, 'Expected alert when password is empty').not.toBe('');
  });

  test('VC_TC-023 – Password below minimum length blocks form submission', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillMandatoryFields({ ...validMinimalUser, password: 'Ab1', confirmPassword: 'Ab1' });
    const msg = await submitAndCaptureAlert(page, () => p.submit());
    expect(msg, 'Expected alert for password below minimum length').not.toBe('');
  });

  test('EC_TC-024 – Password containing only symbol characters is accepted', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields({ ...validMinimalUser, password: '!@#$%^&*()', confirmPassword: '!@#$%^&*()' });
    await submitAndExpectSuccess(page);
  });

  test('EC_TC-025 – Password at maximum allowed length is accepted', async ({ page }) => {
    const p = new ProfilePage(page);
    const maxPwd = 'Aa1!'.repeat(32);
    await p.fillAllFields({ ...validMinimalUser, password: maxPwd, confirmPassword: maxPwd });
    await submitAndExpectSuccess(page);
  });
});

test.describe('Feature Group 6 – Confirm Password', () => {
  test.beforeEach(async ({ page }) => {
    await new ProfilePage(page).goto();
  });

  test('HP_TC-026 – Confirm password matching the password is accepted', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields(validMinimalUser);
    await submitAndExpectSuccess(page);
  });

  test('VC_TC-027 – Empty confirm password blocks form submission', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillMandatoryFields({ ...validMinimalUser, confirmPassword: '' });
    const msg = await submitAndCaptureAlert(page, () => p.submit());
    expect(msg, 'Expected alert when confirm password is empty').not.toBe('');
  });

  test('VC_TC-028 – Mismatched confirm password blocks form submission', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillMandatoryFields({ ...validMinimalUser, confirmPassword: 'DifferentPass1!' });
    const msg = await submitAndCaptureAlert(page, () => p.submit());
    expect(msg, 'Expected alert when passwords do not match').not.toBe('');
  });

  test('EC_TC-029 – Confirm password remains valid after editing the password field', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields({ ...validMinimalUser, password: 'Initial#1', confirmPassword: 'Initial#1' });
    await p.clearField(p.passwordInput);
    await p.passwordInput.fill(validMinimalUser.password!);
    await p.clearField(p.confirmPasswordInput);
    await p.confirmPasswordInput.fill(validMinimalUser.password!);
    await submitAndExpectSuccess(page);
  });
});
