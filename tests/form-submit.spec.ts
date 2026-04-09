import { test, expect } from '@playwright/test';
import { ProfilePage } from '../pages/ProfilePage';
import { submitAndCaptureAlert, submitAndExpectSuccess } from '../utils/helpers';
import { validUser } from '../test-data/fixtures';

test.describe('Feature Group 13 – Full Form Submission', () => {
  test.beforeEach(async ({ page }) => {
    await new ProfilePage(page).goto();
  });

  test('HP_TC-057 – All mandatory fields valid — profile is created successfully', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillMandatoryFields({
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      password: 'P@ssw0rd',
      confirmPassword: 'P@ssw0rd',
    });
    await submitAndExpectSuccess(page);
  });

  test('VC_TC-058 – All mandatory fields empty — validation errors are displayed', async ({ page }) => {
    const p = new ProfilePage(page);
    const msg = await submitAndCaptureAlert(page, () => p.submit());
    expect(msg, 'Expected at least one validation alert when all mandatory fields are empty').not.toBe('');
  });

  test('HP_TC-059 – All fields (mandatory and optional) filled — profile is created successfully', async ({ page }) => {
    const p = new ProfilePage(page);
    await p.fillAllFields(validUser);
    await submitAndExpectSuccess(page);
  });
});
