# Wikipedia Interface Language Change — Playwright AQA Test

## Project Description

This project contains an automated UI test that verifies the functionality of changing the interface language for an authorized Wikipedia user.

The test is implemented using **Playwright + TypeScript** and can be executed both locally and inside a **Docker container**.

---

## Automated Test Case

**Test Name:**  
Change interface language for an authorized user

**Preconditions:**
- User is authorized in Wikipedia.
- User has access to Preferences → User profile → Internationalisation section.

**Test Steps:**
1. Open Wikipedia main page.
2. Verify the user is logged in.
3. Navigate to **Preferences**.
4. In the **Internationalisation** section, change interface language to **Deutsch**.
5. Save preferences.

**Expected Result:**
- The interface language is successfully changed.
- Preferences page is displayed in German.
- German UI text (e.g., "Einstellungen") is visible.

---

## Project Setup

Install project dependencies:

```bash
npm install
```

Install Playwright browsers (required for local execution only):

```bash
npx playwright install
```

---

## Environment Variables

User credentials must not be stored in the repository for security reasons.

To run the test, create a `.env` file in the project root directory and provide your own Wikipedia credentials:

```env
WIKI_USER=your_username
WIKI_PASS=your_password
```

An example template is provided in the repository:

```
.env.example
```

The real `.env` file is excluded from version control via `.gitignore` to prevent sensitive data leakage.

---

## Running Tests Locally

Run tests in headless mode:

```bash
npx playwright test
```

Run tests in headed mode (for debugging):

```bash
npx playwright test --headed
```

---

## Running Tests in Docker

### Build Docker image

```bash
docker build -t wiki-pw .
```

### Run tests inside Docker container

```bash
docker run --rm   --env-file .env   -v "$(pwd)/playwright-report:/app/playwright-report"   wiki-pw
```

---

## Test Report

After test execution, the HTML report is copied to the host machine:

```
playwright-report/index.html
```

Open the report:

```bash
open playwright-report/index.html
```

The report includes:

- Test execution status (Pass / Fail)
- Test steps
- Screenshots (on failure)
- Execution trace (if enabled)

---

## Security Notes

- Credentials are stored only in `.env`
- `.env` is excluded via `.gitignore`
- `.env.example` is provided as a template
- Authentication state (`auth.json`, if used) is not committed

---

## Authentication Note

Wikipedia may restrict or block automated UI login attempts in headless or containerized environments due to anti-bot protection.

To ensure stable test execution in Docker, authentication can be performed using Playwright `storageState` (saved session).

This is done by generating an `auth.json` file locally after manual login:

```bash
npx playwright codegen --save-storage=auth.json https://en.wikipedia.org/wiki/Main_Page
```

The file contains authenticated session data and allows tests to run without performing UI login each time.

**Important:**

- `auth.json` contains sensitive session data
- It must NOT be committed to the repository
- The file is excluded via `.gitignore`
- When running Docker tests, the file can be mounted into the container if needed

This approach is a standard Playwright practice for authorized user scenarios in CI/CD environments.

---

## Technologies Used

- Playwright
- TypeScript
- Node.js
- Docker
