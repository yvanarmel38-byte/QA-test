# QA Assessment — Playwright Automation Suite

[![Playwright Tests](https://github.com/yvanarmel38-byte/QA-test/actions/workflows/playwright.yml/badge.svg)](https://github.com/yvanarmel38-byte/QA-test/actions/workflows/playwright.yml)

Automated test suite for the [User Profile Creation](https://qa-assessment.pages.dev/) form, built with **Playwright** and **TypeScript**.

**Test results (latest run): 143 passed / 37 failed across 180 tests (60 tests × 3 browsers)**
All failures are documented real application bugs — see `Documents/new bug report.xlsx`.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Prerequisites](#prerequisites)
3. [Setup](#setup)
4. [Running Tests](#running-tests)
5. [Generating the Bug Report](#generating-the-bug-report)
6. [Reports](#reports)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Test Documents](#test-documents)
9. [Known Application Bugs](#known-application-bugs)
10. [Known Limitations & Workarounds](#known-limitations--workarounds)

---

## Project Structure

```
.
├── .github/
│   └── workflows/playwright.yml      # GitHub Actions CI/CD pipeline
├── Documents/
│   ├── Test case.docx.xlsx           # Test cases reference document
│   ├── Test plan.xlsx                # Test plan reference document
│   └── new bug report.xlsx          # Generated bug report (37 bugs, 3 browsers)
├── pages/
│   └── ProfilePage.ts               # Page Object Model for the profile form
├── scripts/
│   └── generate_bug_report.py       # Parses pw-results.json → styled XLSX bug report
├── test-data/
│   └── fixtures.ts                  # Typed valid/invalid test data & fixtures
├── tests/
│   ├── mandatory-fields.spec.ts     # TC-001–029: First Name, Last Name, Email, Password, Confirm Password
│   ├── optional-fields.spec.ts      # TC-030–056: Gender, DOB, Phone, Address, LinkedIn, GitHub
│   ├── form-submit.spec.ts          # TC-057–059: End-to-end form submission tests
│   └── performance.spec.ts          # Page load timing tests (TTFB, domContentLoaded, load)
├── utils/
│   └── helpers.ts                   # Shared alert capture, success assertions, timing helpers
├── playwright.config.ts             # Playwright config (3 browsers, JSON + HTML + Allure reporters)
├── .env.example                     # Environment variable template
└── tsconfig.json
```

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 18 LTS or later |
| npm | 9 or later |
| Python | 3.8 or later (for bug report generator only) |
| openpyxl | `pip install openpyxl` (for bug report generator only) |
| Git | any recent version |

> **Allure reports** (optional): install the Allure CLI globally.
> ```bash
> npm install -g allure-commandline
> ```

---

## Setup

```bash
# 1. Clone the repository
git clone https://github.com/yvanarmel38-byte/QA-test.git
cd "review Qa"

# 2. Install Node dependencies
npm install

# 3. Install Playwright browsers
npx playwright install --with-deps

# 4. Configure environment
cp .env.example .env
# Edit .env if you need to point to a different BASE_URL
```

---

## Running Tests

### All tests — all 3 browsers (Chromium, Firefox, WebKit)
```bash
npm test
```

### Single browser
```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

### Single spec file
```bash
npx playwright test tests/mandatory-fields.spec.ts
```

### Filter by test ID
```bash
npx playwright test --grep "HP_TC-004"
npx playwright test --grep "VC_TC-017"
```

### Interactive UI mode
```bash
npx playwright test --ui
```

### Headed (watch tests live)
```bash
npx playwright test --headed
```

---

## Generating the Bug Report

After running the tests, parse the JSON results and produce `Documents/new bug report.xlsx`:

```bash
# Default output → Documents/bug-report.xlsx
python scripts/generate_bug_report.py

# Custom output filename
python scripts/generate_bug_report.py "Documents/new bug report.xlsx"
```

The script requires the JSON results file to exist (`test-results/pw-results.json`), which is written automatically by `npm test`.

**Report columns:** Bug ID, Test Case ID, Feature Group, Title/Summary, Severity, Priority, Status, Steps to Reproduce, Expected Result, Actual Result, Browser, Environment URL, Date Found.

---

## Reports

### HTML Report (built-in)
Generated automatically after every run.

```bash
npm run report:html
# or directly:
npx playwright show-report
```

### Allure Report
Requires `allure-commandline` installed globally.

```bash
npm run report:allure
```

### JSON Results
Raw machine-readable results are written to `test-results/pw-results.json` after every run — used by the bug report generator.

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/playwright.yml`) runs on every `push` and `pull_request` targeting `main`/`master`.

**What it does:**

1. Checks out the code
2. Sets up Node.js 20
3. Installs dependencies (`npm ci`)
4. Installs Playwright browsers with OS dependencies
5. Runs all 60 tests across **Chromium, Firefox, and WebKit**
6. Uploads the **HTML report**, **Allure results**, and (on failure) screenshots/videos/traces — retained for 14 days

**Secrets:**

| Secret | Description | Default |
|--------|-------------|---------|
| `BASE_URL` | Target application URL | `https://qa-assessment.pages.dev` |

---

## Test Documents

All project documents are in the `Documents/` folder:

| File | Contents |
|------|---------|
| `Test plan.xlsx` | Scope, objectives, approach, entry/exit criteria |
| `Test case.docx.xlsx` | 60 detailed test cases mapped to form fields (HP / VC / EC) |
| `new bug report.xlsx` | 37 defects found across Chromium, Firefox, and WebKit |

---

## Known Application Bugs

The following defects were discovered and are documented in `Documents/new bug report.xlsx`:

| Bug | Severity | Browsers |
|-----|----------|----------|
| **LinkedIn URL field is required** despite being labeled "(optional)" — alert fires when left empty | High | All 3 |
| **Email format not validated** — form accepts emails missing `@` or domain extension | Medium | All 3 |
| **Phone number not validated** — form accepts letters, >10 digits, and special characters | Medium | All 3 |
| **Phone <10 digits rejected** via silent HTML5 browser constraint (no user-visible alert) | Low | All 3 |
| **LinkedIn URL content not validated** — any domain and missing `https://` are accepted | Medium | All 3 |
| **GitHub URL domain not validated** — non-GitHub domains (e.g. `gitlab.com`) are accepted | Medium | All 3 |
| **TTFB exceeds 800 ms threshold** — measured at 1544 ms on Firefox | Medium | Firefox |
| **WebKit date input accepts invalid formats** — `DD/MM/YYYY` and non-existent dates not rejected | Medium | WebKit |
| **Page load timeout on WebKit** for label-visibility assertion (HP_TC-002) | High | WebKit |

---

## Known Limitations & Workarounds

| Limitation | Detail | Workaround applied |
|-----------|--------|--------------------|
| **LinkedIn URL incorrectly required** | The live form rejects submission when LinkedIn URL is empty, despite labelling it optional. | `validMinimalUser` fixture includes a LinkedIn URL so tests focused on other fields are not blocked by this bug. |
| **Form reload on success** | After a valid submission, `validateForm()` returns `undefined`, which the browser treats as a native form GET — reloading the page before `<p class="success">` can be asserted. | `submitAndExpectSuccess()` patches `form.addEventListener('submit', preventDefault)` and `HTMLFormElement.prototype.submit` before clicking Submit. |
| **Browser dialog for validation** | The form uses `alert()` for validation feedback instead of inline DOM elements. | `submitAndCaptureAlert()` registers a `page.on('dialog')` handler before triggering submission. |
| **Date input cross-browser behaviour** | WebKit's native date picker does not sanitise typed invalid date strings the way Chromium and Firefox do. | TC-037/038 use `page.keyboard.type()` instead of `locator.fill()` to bypass driver-level validation, and assert the browser should reject the value. |
| **Allure CLI** | Allure report generation requires `allure-commandline` installed globally. | Install with `npm install -g allure-commandline`. |

