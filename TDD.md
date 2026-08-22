# TDD Development Guide

## 1. Overview

This project follows a Test-Driven Development (TDD) approach for both the frontend and backend.

The core rule is:

> **Tests must be written before functional code.**

The development cycle used in this project is:

```text
Requirement
     ↓
Write Test
     ↓
🔴 RED — Test fails
     ↓
Write Minimum Functional Code
     ↓
🟢 GREEN — Test passes
     ↓
♻️ REFACTOR
     ↓
🟢 GREEN — Tests still pass
```

The project intentionally uses:

* React + TypeScript for the frontend
* Node.js + Express + TypeScript for the backend
* Vitest as the primary testing framework
* React Testing Library for React component testing
* Supertest for backend HTTP API testing
* V8 coverage through Vitest
* Static TypeScript data instead of a database

There is no database in this application.

---

# 2. TDD Is Non-Negotiable

The project's development rule is:

> Engineers must write tests before writing functional code.

During feature development:

```text
❌ Wrong

Write Code
    ↓
Write Tests
```

The required approach is:

```text
✅ Correct

Write Test
    ↓
Run Test
    ↓
🔴 RED
    ↓
Write Code
    ↓
🟢 GREEN
    ↓
Refactor
    ↓
🟢 GREEN
```

This ensures that the implementation is driven by expected behavior rather than tests being written after the implementation.

---

# 3. Technology Stack

## Frontend

```text
React
TypeScript
Vite
Vitest
React Testing Library
Testing Library Jest DOM
Testing Library User Event
jsdom
```

## Backend

```text
Node.js
Express
TypeScript
Vitest
Supertest
```

## Coverage

```text
@vitest/coverage-v8
```

## Data

```text
Static TypeScript data
```

No database, ORM, or database service is required.

---

# 4. Project Structure

The relevant testing structure is:

```text
tdd-react-typescript-app/
│
├── frontend/
│   │
│   ├── src/
│   │   │
│   │   ├── components/
│   │   │   └── ChallengeCard/
│   │   │       ├── ChallengeCard.tsx
│   │   │       └── ChallengeCard.test.tsx
│   │   │
│   │   ├── test/
│   │   │   └── setup.ts
│   │   │
│   │   ├── App.tsx
│   │   ├── App.test.tsx
│   │   ├── api.ts
│   │   ├── api.test.ts
│   │   └── types.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/
│   │
│   ├── src/
│   │   │
│   │   ├── app.ts
│   │   ├── app.test.ts
│   │   ├── data.ts
│   │   └── server.ts
│   │
│   └── package.json
│
├── package.json
├── package-lock.json
└── TDD.md
```

---

# 5. Vitest Setup

Vitest is the primary test runner for the project.

The frontend uses Vitest through Vite configuration.

## Frontend Vitest Configuration

`frontend/vite.config.ts` contains:

```ts
test: {
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
  globals: true,

  coverage: {
    provider: 'v8',
  },
},
```

### `jsdom`

React components require a browser-like environment during tests.

Therefore:

```text
environment: 'jsdom'
```

allows components to be tested using DOM APIs.

### Test Setup

`frontend/src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

This enables assertions such as:

```ts
expect(element).toBeInTheDocument();
```

---

# 6. Vitest Scripts

## Root scripts

The root `package.json` provides commands for the complete project.

### Run all tests

```bash
npm run test
```

This runs:

```text
Frontend tests
     ↓
Backend tests
```

### Run tests in watch mode

```bash
npm run test:watch
```

Watch mode is particularly useful for TDD because tests automatically rerun whenever source files change.

### Generate coverage

```bash
npm run test:coverage
```

This runs Vitest with V8 coverage enabled.

---

# 7. Frontend Testing

Frontend tests use:

```text
Vitest
+
React Testing Library
+
User Event
+
jsdom
```

Example test:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Example Component', () => {
  it('renders the expected heading', () => {
    render(<ExampleComponent />);

    expect(
      screen.getByRole('heading', {
        name: /example/i,
      }),
    ).toBeInTheDocument();
  });
});
```

The test describes the behavior that the user should see.

---

# 8. Backend Testing

Backend API tests use:

```text
Vitest
+
Supertest
```

Example:

```ts
import request from 'supertest';
import { describe, expect, it } from 'vitest';

it('returns a healthy status', async () => {
  const response = await request(app)
    .get('/api/health');

  expect(response.status).toBe(200);

  expect(response.body).toEqual({
    status: 'ok',
  });
});
```

This tests the actual HTTP behavior of the Express application.

---

# 9. Static Backend Data

The application does not use a database.

Challenge information is stored in static TypeScript data.

Example:

```ts
export const challenges = [
  {
    id: 'react-counter',
    title: 'Build a Counter',
    description: 'Build a counter using TDD.',
    difficulty: 'Beginner',
    concepts: ['React State', 'Events'],
  },
];
```

The request flow is:

```text
React Frontend
      ↓
HTTP Request
      ↓
Express API
      ↓
Static TypeScript Data
      ↓
JSON Response
      ↓
React Frontend
```

There is no:

```text
MongoDB
PostgreSQL
MySQL
Prisma
Mongoose
```

in the architecture.

---

# 10. First TDD Feature — ChallengeCard

The first real TDD feature was the `ChallengeCard` component.

## Requirement

The card should:

* Display the challenge title
* Display the description
* Display the difficulty
* Display a Start Challenge button

---

## 10.1 Write the test first

The test file was created before the implementation:

```text
frontend/src/components/ChallengeCard/ChallengeCard.test.tsx
```

The tests verify:

```tsx
it('renders the challenge title', () => {
  ...
});

it('renders the challenge description', () => {
  ...
});

it('renders the challenge difficulty', () => {
  ...
});

it('renders the start challenge button', () => {
  ...
});
```

At this point the component implementation did not exist.

---

# 11. RED Phase

The test was executed:

```bash
npm run test:watch
```

Vitest reported:

```text
Failed to resolve import "./ChallengeCard"
```

because:

```text
ChallengeCard.test.tsx
        ↓
ChallengeCard.tsx
        ↓
Does not exist
```

This was the expected TDD failure.

```text
🔴 RED
```

The failing test proved that the test was actually driving the implementation.

---

# 12. GREEN Phase

After the failing test was established, the minimum implementation was created.

```tsx
export default function ChallengeCard({
  challenge,
}: ChallengeCardProps) {
  return (
    <article>
      <h2>{challenge.title}</h2>

      <p>{challenge.description}</p>

      <span>{challenge.difficulty}</span>

      <button type="button">
        Start Challenge
      </button>
    </article>
  );
}
```

Vitest automatically reran the test.

Result:

```text
✓ ChallengeCard.test.tsx

4 tests passed
```

The feature reached:

```text
🟢 GREEN
```

---

# 13. Refactoring ChallengeCard

After the tests passed, the implementation was reviewed.

The challenge type was moved to the shared TypeScript type definition.

Instead of defining the type directly inside the component:

```ts
type Challenge = {
  ...
};
```

the component uses the shared type:

```ts
import type { Challenge } from '../../types';
```

The component props became:

```ts
type ChallengeCardProps = {
  challenge: Challenge;
};
```

The tests were run again.

Result:

```text
✓ ChallengeCard.test.tsx
4 tests passed
```

Therefore:

```text
♻️ REFACTOR
     ↓
🟢 GREEN
```

---

# 14. Second TDD Behavior — Start Challenge

The next requirement was:

> When the user clicks "Start Challenge", the component must call the supplied `onStart` callback with the selected challenge.

The test was added before changing the component implementation.

The test used:

```ts
const user = userEvent.setup();

const onStart = vi.fn();
```

Then:

```ts
await user.click(
  screen.getByRole('button', {
    name: /start challenge/i,
  }),
);
```

The expected behavior:

```ts
expect(onStart).toHaveBeenCalledWith(challenge);
```

---

# 15. RED — Start Challenge

Before implementation, the test failed:

```text
Number of calls: 0
```

The button existed, but clicking it did not call the callback.

Therefore:

```text
🔴 RED
```

The test correctly identified the missing behavior.

---

# 16. GREEN — Start Challenge

The component was updated to accept:

```ts
type ChallengeCardProps = {
  challenge: Challenge;
  onStart: (challenge: Challenge) => void;
};
```

The callback was connected to the button:

```tsx
<button
  type="button"
  onClick={() => onStart(challenge)}
>
  Start Challenge
</button>
```

The test then passed:

```text
✓ calls onStart with the selected challenge when Start Challenge is clicked
```

Result:

```text
🟢 GREEN
```

---

# 17. Backend TDD — Difficulty Filtering

A backend behavior was then developed using TDD.

## Requirement

The API should support:

```text
GET /api/challenges?difficulty=Beginner
```

and return only challenges matching the requested difficulty.

---

# 18. RED — Difficulty Filtering

First, the test was added:

```ts
it('filters challenges by difficulty', async () => {
  const response = await request(app)
    .get('/api/challenges?difficulty=Beginner');

  expect(response.status).toBe(200);

  expect(response.body).toHaveLength(1);

  expect(response.body[0]).toMatchObject({
    id: 'react-counter',
    difficulty: 'Beginner',
  });
});
```

Before implementation, the API ignored the query parameter and returned all three challenges.

Vitest reported:

```text
Expected: 1
Received: 3
```

Therefore:

```text
🔴 RED
```

---

# 19. GREEN — Difficulty Filtering

The endpoint was updated:

```ts
app.get('/api/challenges', (req, res) => {
  const { difficulty } = req.query;

  if (!difficulty) {
    return res.json(challenges);
  }

  const filteredChallenges = challenges.filter(
    (challenge) => challenge.difficulty === difficulty,
  );

  return res.json(filteredChallenges);
});
```

The test then passed.

---

# 20. Unknown Difficulty

Another behavior was defined:

> An unknown difficulty should return an empty array.

Test:

```ts
it('returns an empty array for an unknown difficulty', async () => {
  const response = await request(app)
    .get('/api/challenges?difficulty=Unknown');

  expect(response.status).toBe(200);

  expect(response.body).toEqual([]);
});
```

The result:

```text
✓ returns an empty array for an unknown difficulty
```

The backend test suite reached:

```text
6 tests passed
```

---

# 21. Current Test Suite

At the current stage, the project contains:

## Frontend

```text
App.test.tsx
    3 tests

api.test.ts
    2 tests

ChallengeCard.test.tsx
    5 tests
```

Total:

```text
10 frontend tests
```

## Backend

```text
app.test.ts
    6 tests
```

Total:

```text
6 backend tests
```

## Overall

```text
Frontend → 10 tests
Backend  → 6 tests

Total → 16 tests
```

All implemented tests should pass before a feature is considered complete.

---

# 22. Coverage

Coverage is generated using:

```text
@vitest/coverage-v8
```

Run:

```bash
npm run test:coverage
```

The project has already successfully generated V8 coverage reports for both frontend and backend.

Coverage is used as a quality indicator.

It is not treated as a reason to write meaningless tests purely to reach 100%.

The goal is:

```text
Behavior coverage
      +
Meaningful tests
```

rather than:

```text
100% coverage at any cost
```

---

# 23. Recommended TDD Workflow

For every new feature, follow these steps.

## Step 1 — Understand the requirement

Example:

```text
User can start a challenge.
```

## Step 2 — Write the test

```text
feature.test.tsx
```

## Step 3 — Run the test

```bash
npm run test:watch
```

Expected:

```text
🔴 RED
```

## Step 4 — Write minimum implementation

Only implement enough functionality to satisfy the failing test.

## Step 5 — Run the test again

Expected:

```text
🟢 GREEN
```

## Step 6 — Refactor

Improve:

* readability
* structure
* types
* duplication

without changing behavior.

## Step 7 — Run tests again

Expected:

```text
🟢 GREEN
```

## Step 8 — Commit

Example:

```bash
git add .
git commit -m "feat: add challenge behavior"
```

## Step 9 — Push

```bash
git push origin main
```

---

# 24. Git and TDD

GitHub is not a requirement of TDD itself.

However, Git is used in this project to preserve development history.

A useful workflow is:

```text
Test
 ↓
🔴 RED
 ↓
Implementation
 ↓
🟢 GREEN
 ↓
Refactor
 ↓
🟢 GREEN
 ↓
Commit
 ↓
Push
```

For future features, test-first commits can be used when demonstrating the TDD workflow during live pairing.

Example:

```text
test: define challenge filtering behavior
        ↓
🔴 RED
        ↓
feat: implement challenge filtering
        ↓
🟢 GREEN
```

This makes the development process visible in Git history.

---

# 25. Commands Reference

## Install dependencies

From project root:

```bash
npm install
```

## Start frontend and backend

```bash
npm run dev
```

## Run all tests

```bash
npm run test
```

## Run tests continuously

```bash
npm run test:watch
```

## Generate coverage

```bash
npm run test:coverage
```

## Frontend tests

```bash
npm run test --workspace frontend
```

## Backend tests

```bash
npm run test --workspace backend
```

## Frontend watch mode

```bash
npm run test:watch --workspace frontend
```

## Backend watch mode

```bash
npm run test:watch --workspace backend
```

---

# 26. TDD Completion Criteria

A feature is considered complete when:

```text
[✓] Requirement is understood
[✓] Test is written first
[✓] Test initially fails
[✓] Minimum implementation is written
[✓] Test passes
[✓] Code is reviewed/refactored
[✓] Tests remain green
[✓] Full test suite passes
[✓] Changes are committed
[✓] Changes are pushed to GitHub
```

The most important requirement remains:

```text
TEST FIRST
```

Functional code must not be written first and tested afterward.

---

# 27. Final TDD Model

The project follows this development model:

```text
                    REQUIREMENT
                         │
                         ▼
                  WRITE TEST FIRST
                         │
                         ▼
                    🔴 RED
                 Test must fail
                         │
                         ▼
              MINIMUM IMPLEMENTATION
                         │
                         ▼
                    🟢 GREEN
                 Test must pass
                         │
                         ▼
                     REFACTOR
                         │
                         ▼
                    🟢 GREEN
                         │
                         ▼
                   RUN ALL TESTS
                         │
                         ▼
                    GIT COMMIT
                         │
                         ▼
                     GIT PUSH
                         │
                         ▼
                     GITHUB
```

This workflow is the project's agreed **Test-Driven Development standard**.
