# TDD Challenge App

A production-style starter application built around a strict **Test-Driven Development (TDD)** workflow.

## Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- API: REST, static in-memory content only
- Frontend tests: Vitest + React Testing Library
- Backend tests: Vitest + Supertest
- No database

## TDD rule

For every feature:

1. Write a failing test.
2. Write the minimum implementation required to make it pass.
3. Refactor without breaking the tests.

The repository intentionally keeps test files alongside the feature code so the TDD workflow is visible.

## Run

```bash
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:4000

Run all tests:

```bash
npm test
```

Run frontend tests:

```bash
npm run test:frontend
```

Run backend tests:

```bash
npm run test:backend
```

Build everything:

```bash
npm run build
```

## API

- `GET /api/health`
- `GET /api/challenges`
- `GET /api/challenges/:id`

The API uses static TypeScript data. There is deliberately no database layer.

## TDD acceptance criteria

A feature is not considered complete until:

- tests exist before implementation,
- the tests fail for the right reason when the implementation is absent,
- the implementation is minimal,
- the full test suite passes,
- refactoring leaves the suite green.
