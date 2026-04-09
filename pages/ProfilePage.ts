import { type Page, type Locator } from '@playwright/test';

/**
 * ProfilePage — Page Object Model for the User Profile Creation form.
 * URL: https://qa-assessment.pages.dev/
 *
 * Locators use accessible label-based selectors so they remain stable
 * when the DOM structure changes, as long as <label> elements are kept.
 */
export class ProfilePage {
  readonly page: Page;

  // ── Mandatory fields ──────────────────────────────────────────────────────
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;

  // ── Optional fields ───────────────────────────────────────────────────────
  readonly genderSelect: Locator;
  readonly dateOfBirthInput: Locator;
  readonly phoneNumberInput: Locator;
  readonly addressInput: Locator;
  readonly linkedinUrlInput: Locator;
  readonly githubUrlInput: Locator;

  // ── Actions ───────────────────────────────────────────────────────────────
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Mandatory — labels on the live page include "(mandatory):"
    this.firstNameInput = page.getByLabel('First Name (mandatory):');
    this.lastNameInput = page.getByLabel('Last Name (mandatory):');
    this.emailInput = page.getByLabel('Email (mandatory):');
    // Use the input #id to avoid ambiguity between "Password (mandatory):" and
    // "Confirm Password (mandatory):" — both match a partial label search
    this.passwordInput = page.locator('#password');
    this.confirmPasswordInput = page.locator('#confirmPassword');

    // Optional — labels include "(optional):"
    // Gender is rendered as radio buttons; this locator points to the group
    this.genderSelect = page.locator('fieldset, [role="radiogroup"]').filter({ hasText: 'Gender' }).first();
    this.dateOfBirthInput = page.getByLabel('Date ofBirth (optional):');
    this.phoneNumberInput = page.getByLabel('Phone Number (optional):');
    this.addressInput = page.getByLabel('Address (optioal):'); // note: typo in the live page
    this.linkedinUrlInput = page.getByLabel('LinkedIn URL (optional):');
    this.githubUrlInput = page.getByLabel('GitHub URL (optional):');

    // Submit
    this.submitButton = page.getByRole('button', { name: /submit/i });
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  /** Navigate to the profile creation page and wait until fully loaded. */
  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ── Fill helpers ──────────────────────────────────────────────────────────

  /** Fill mandatory fields only. Pass null to skip a specific field. */
  async fillMandatoryFields(data: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    password?: string | null;
    confirmPassword?: string | null;
  }): Promise<void> {
    if (data.firstName !== null && data.firstName !== undefined) {
      await this.firstNameInput.fill(data.firstName);
    }
    if (data.lastName !== null && data.lastName !== undefined) {
      await this.lastNameInput.fill(data.lastName);
    }
    if (data.email !== null && data.email !== undefined) {
      await this.emailInput.fill(data.email);
    }
    if (data.password !== null && data.password !== undefined) {
      await this.passwordInput.fill(data.password);
    }
    if (data.confirmPassword !== null && data.confirmPassword !== undefined) {
      await this.confirmPasswordInput.fill(data.confirmPassword);
    }
  }

  /** Fill optional fields. Pass null to skip a field. */
  async fillOptionalFields(data: {
    gender?: string | null;
    dateOfBirth?: string | null;
    phoneNumber?: string | null;
    address?: string | null;
    linkedinUrl?: string | null;
    githubUrl?: string | null;
  }): Promise<void> {
    if (data.gender !== null && data.gender !== undefined) {
      // Gender is rendered as radio buttons — click the exact label to avoid partial matches
      // e.g. "male" must NOT accidentally match "feMale"
      await this.page.getByRole('radio', { name: new RegExp(`^${data.gender}$`, 'i') }).click();
    }
    if (data.dateOfBirth !== null && data.dateOfBirth !== undefined) {
      await this.dateOfBirthInput.fill(data.dateOfBirth);
    }
    if (data.phoneNumber !== null && data.phoneNumber !== undefined) {
      await this.phoneNumberInput.fill(data.phoneNumber);
    }
    if (data.address !== null && data.address !== undefined) {
      await this.addressInput.fill(data.address);
    }
    if (data.linkedinUrl !== null && data.linkedinUrl !== undefined) {
      await this.linkedinUrlInput.fill(data.linkedinUrl);
    }
    if (data.githubUrl !== null && data.githubUrl !== undefined) {
      await this.githubUrlInput.fill(data.githubUrl);
    }
  }

  /** Fill all fields (mandatory + optional) from a single data object. */
  async fillAllFields(data: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    password?: string | null;
    confirmPassword?: string | null;
    gender?: string | null;
    dateOfBirth?: string | null;
    phoneNumber?: string | null;
    address?: string | null;
    linkedinUrl?: string | null;
    githubUrl?: string | null;
  }): Promise<void> {
    await this.fillMandatoryFields(data);
    await this.fillOptionalFields(data);
  }

 
  /** Click the Submit button. */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /** Fill all fields and submit in one call. */
  async fillAndSubmit(data: Parameters<ProfilePage['fillAllFields']>[0]): Promise<void> {
    await this.fillAllFields(data);
    await this.submit();
  }

  // ── Error / feedback helpers ──────────────────────────────────────────────

  /**
   * Return the visible error or validation message associated with a field label.
   * Looks for text that follows the labelled input within its parent container.
   *
   * NOTE: Adjust the selector below once the exact DOM structure of error
   * messages is confirmed on the live page.
   */
  async getFieldError(fieldLabel: string): Promise<string> {
    // Strategy: locate the label, get the closest ancestor container, then
    // find the first error element inside it.
    const errorLocator = this.page
      .getByLabel(fieldLabel)
      .locator('xpath=ancestor::*[contains(@class,"field") or contains(@class,"form") or self::div][1]')
      .locator('[class*="error"],[class*="invalid"],[role="alert"]')
      .first();

    return (await errorLocator.textContent()) ?? '';
  }

  /**
   * Return TRUE when the page shows a success confirmation after submit.
   * Adjust the selector to match the actual success element on the page.
   */
  async isSuccessVisible(): Promise<boolean> {
    const successLocator = this.page.locator(
      '[class*="success"],[class*="confirmation"],[role="status"]',
    );
    return successLocator.isVisible();
  }

  /** Clear a specific field by its Locator. */
  async clearField(locator: Locator): Promise<void> {
    await locator.clear();
  }

  /** Clear all form fields back to their initial state. */
  async resetForm(): Promise<void> {
    await this.page.reload();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
