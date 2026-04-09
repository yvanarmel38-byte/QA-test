/**
 * test-data/fixtures.ts
 *
 * Static, typed test data for the User Profile Creation form.
 * Import the exported objects directly into your spec files.
 */

// ── Shared types ─────────────────────────────────────────────────────────────

export interface MandatoryFields {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface OptionalFields {
  gender?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export type UserProfile = MandatoryFields & OptionalFields;

// ── Valid data ────────────────────────────────────────────────────────────────

/** A fully valid user profile that should result in a successful submission. */
export const validUser: UserProfile = {
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@example.com',
  password: 'P@ssw0rd',
  confirmPassword: 'P@ssw0rd',
  gender: 'male',
  dateOfBirth: '1990-01-01',
  phoneNumber: '1234567890',
  address: '123 Main St, Apt 1',
  linkedinUrl: 'https://www.linkedin.com/in/johnsmith',
  githubUrl: 'https://github.com/johnsmith',
};

/**
 * Minimum fields required to successfully submit the form.
 * NOTE: The live form incorrectly requires linkedinUrl despite labeling it
 * "(optional)". A LinkedIn URL is included here as a workaround so tests
 * that focus on OTHER fields are not blocked by the LinkedIn required bug.
 */
export const validMinimalUser: UserProfile = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
  password: 'Secure#99',
  confirmPassword: 'Secure#99',
  linkedinUrl: 'https://www.linkedin.com/in/janetest',
};

// ── Boundary / edge-case valid data ───────────────────────────────────────────

/** Single-character first and last name (minimum length boundary). */
export const singleCharNameUser: UserProfile = {
  ...validMinimalUser,
  firstName: 'A',
  lastName: 'B',
};

/** Phone number at exactly the 10-digit maximum. */
export const maxPhoneUser: UserProfile = {
  ...validUser,
  phoneNumber: '9876543210', // exactly 10 digits
};

// ── Invalid data scenarios ────────────────────────────────────────────────────

/**
 * Each entry represents one invalid scenario.
 * `description` is used as the test title.
 */
export interface InvalidScenario {
  description: string;
  data: Partial<UserProfile>;
  /** The field label whose error message should be checked. */
  errorField: string;
}

export const invalidScenarios: InvalidScenario[] = [
  // ── Mandatory field missing ────────────────────────────────────────────────
  {
    description: 'should show error when First Name is empty',
    data: { ...validMinimalUser, firstName: '' },
    errorField: 'First Name (mandatory):',
  },
  {
    description: 'should show error when Last Name is empty',
    data: { ...validMinimalUser, lastName: '' },
    errorField: 'Last Name (mandatory):',
  },
  {
    description: 'should show error when Email is empty',
    data: { ...validMinimalUser, email: '' },
    errorField: 'Email (mandatory):',
  },
  {
    description: 'should show error when Password is empty',
    data: { ...validMinimalUser, password: '', confirmPassword: '' },
    errorField: 'Password (mandatory):',
  },
  {
    description: 'should show error when Confirm Password is empty',
    data: { ...validMinimalUser, confirmPassword: '' },
    errorField: 'Confirm Password (mandatory):',
  },

  // ── Format violations — mandatory fields ───────────────────────────────────
  {
    description: 'should reject non-alphabetical characters in First Name',
    data: { ...validMinimalUser, firstName: 'John123' },
    errorField: 'First Name (mandatory):',
  },
  {
    description: 'should reject non-alphabetical characters in Last Name',
    data: { ...validMinimalUser, lastName: 'Sm!th' },
    errorField: 'Last Name (mandatory):',
  },
  {
    description: 'should reject an invalid email format',
    data: { ...validMinimalUser, email: 'not-an-email' },
    errorField: 'Email (mandatory):',
  },
  {
    description: 'should reject email without domain',
    data: { ...validMinimalUser, email: 'user@' },
    errorField: 'Email (mandatory):',
  },
  {
    description: 'should show error when passwords do not match',
    data: { ...validMinimalUser, confirmPassword: 'DifferentPass1!' },
    errorField: 'Confirm Password (mandatory):',
  },

  // ── Optional field format violations ──────────────────────────────────────
  {
    description: 'should reject phone number longer than 10 digits',
    data: { ...validMinimalUser, phoneNumber: '12345678901' }, // 11 digits
    errorField: 'Phone Number (optional):',
  },
  {
    description: 'should reject non-numeric phone number',
    data: { ...validMinimalUser, phoneNumber: 'abc123' },
    errorField: 'Phone Number (optional):',
  },
  {
    description: 'should reject an invalid LinkedIn URL',
    data: { ...validMinimalUser, linkedinUrl: 'https://twitter.com/johnsmith' },
    errorField: 'LinkedIn URL (optional):',
  },
  {
    description: 'should reject a LinkedIn URL without https',
    data: { ...validMinimalUser, linkedinUrl: 'linkedin.com/in/johnsmith' },
    errorField: 'LinkedIn URL (optional):',
  },
  {
    description: 'should reject an invalid GitHub URL',
    data: { ...validMinimalUser, githubUrl: 'https://gitlab.com/johnsmith' },
    errorField: 'GitHub URL (optional):',
  },
  {
    description: 'should reject a GitHub URL without https',
    data: { ...validMinimalUser, githubUrl: 'github.com/johnsmith' },
    errorField: 'GitHub URL (optional):',
  },
  {
    description: 'should reject an invalid date of birth format',
    data: { ...validMinimalUser, dateOfBirth: '01-01-1990' }, // wrong format
    errorField: 'Date ofBirth (optional):', // note: live page has this typo
  },
];

// ── Gender options ────────────────────────────────────────────────────────────

/** All valid gender option values as they appear on the live page (radio buttons). */
export const genderOptions = ['male', 'female', 'prefer not to say'] as const;
export type GenderOption = (typeof genderOptions)[number];
