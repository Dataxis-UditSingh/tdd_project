# 1. Introduction & Role Overview

## 1.1 Overview

The LDD Backend is the server-side component responsible for handling application APIs, business logic, service-to-service communication, and backend operations for the LDD platform.

The backend is implemented using **.NET 10 / ASP.NET Core** and follows a service-oriented architecture where the main backend communicates with dedicated internal services.

The primary backend application acts as the API layer between the frontend and backend services.

At a high level, the architecture is:

```text
                         ┌──────────────────────┐
                         │      Frontend        │
                         │    Application 2     │
                         └──────────┬───────────┘
                                    │
                                    │ HTTP Request
                                    ▼
                         ┌──────────────────────┐
                         │    LDD Backend       │
                         │     .NET 10 API      │
                         │      Port: 5002      │
                         └──────────┬───────────┘
                                    │
                                    │ HTTP
                                    ▼
                         ┌──────────────────────┐
                         │      InfoService     │
                         │      .NET 10         │
                         │      Port: 5001      │
                         └──────────────────────┘ 
```

# 2. Development Environment

Before starting LDD Backend development, make sure the local development machine has all required runtimes, tools, and dependencies installed.

The backend development environment is based on **.NET 10**, Git, Docker, and the tools required to build, test, debug, and containerize the application.

---

## 2.1 Development Environment Requirements

The following software and tools are required for LDD Backend development.

| Category | Requirement | Purpose |
|---|---|---|
| Operating System | macOS / Linux / Windows | Development environment |
| Runtime | .NET 10 SDK | Build and run the backend |
| Language | C# | Backend development |
| Package Manager | NuGet | Manage .NET dependencies |
| Version Control | Git | Source code management |
| Containerization | Docker | Build and run backend containers |
| API Documentation | Swagger / OpenAPI | API documentation and testing |
| API Testing | Browser / curl / Postman | Test backend APIs |
| IDE | VS Code / Visual Studio / Rider | Backend development |
| Kubernetes CLI | kubectl | Kubernetes debugging and validation |
| Kubernetes | Minikube / Kubernetes Cluster | Local deployment testing |
| CI/CD CLI | Tekton CLI (`tkn`) | Pipeline validation |
| GitOps CLI | Flux CLI (`flux`) | FluxCD validation |

---

## 2.2 Required Runtime

### .NET 10 SDK

The LDD Backend is developed using **.NET 10**.

The **SDK** is required, not only the .NET runtime.

The SDK provides the tools required to:

- Create .NET applications.
- Restore dependencies.
- Build the application.
- Run the application.
- Execute tests.
- Publish the application.

Verify the installation:

```bash
dotnet --version
```

### Git Setup

Git is the primary version control system used for managing the frontend application's source code and collaborating with the development team.

## 1. Prerequisites

Before configuring Git, ensure that:

- Git is installed.
- A Git hosting account has been provided.
- The developer has access to the required frontend repository.
- The developer's official name and email are available for Git configuration.

## 2. Verify Git Installation

Check the installed Git version:

```bash
git --version
```
## Branching Strategy

### 1. Branch Structure

The frontend repository follows a controlled branching strategy:

```text
main
  │
  └── staging
        │
        ├── feature/*
        ├── bugfix/*
        └── hotfix/*
```

## Commit Standards

### 1. Commit Message Format

Use the following format for commit messages:

```text
<type>: <short-description>
```

## Pull Request Workflow

### 1. Overview

The Pull Request (PR) workflow ensures that all frontend changes are reviewed, validated, tested, and approved before being merged into the shared codebase.

### 2. Pull Request Flow

```text
Feature Branch
      ↓
Local Validation
      ↓
Push Changes
      ↓
Create Pull Request
      ↓
CI Validation
      ↓
Code Review
      ↓
Resolve Feedback
      ↓
Approval
      ↓
Merge to Staging
      ↓
Staging Validation
      ↓
Merge to Main
```

# 4. Project Structure

## 4.1 Overview

The LDD Backend follows a lightweight and modular **Node.js + TypeScript** project structure.

The backend keeps the application source code inside the `src/` directory while configuration files remain at the project root.

The current project structure is:

```text
backend/
├── coverage/
│   ├── app.ts.html
│   ├── base.css
│   ├── block-navigation.js
│   ├── clover.xml
│   ├── coverage-final.json
│   ├── data.ts.html
│   ├── favicon.png
│   ├── index.html
│   ├── prettify.css
│   ├── prettify.js
│   ├── server.ts.html
│   ├── sort-arrow-sprite.png
│   └── sorter.js
│
├── node_modules/
│   └── ...
│
├── src/
│   ├── app.test.ts
│   ├── app.ts
│   ├── data.ts
│   └── server.ts
│
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

# API Development

## 5.1 API Overview

The backend exposes a small REST API built with **Node.js, Express, and TypeScript**.
The API is responsible for serving the challenge content used by the frontend application.

The current implementation uses static, in-memory data from `backend/src/data.ts`.
There is no database or persistence layer in this version of the application.

The API runs on port `4000` by default:

```text
http://localhost:4000
```

The Express application is defined in `backend/src/app.ts`, while the server entry point is
`backend/src/server.ts`.

## 5.2 Running the Backend

Run these commands from the `backend/` directory:

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run the API test suite:

```bash
npm test
```

Build the TypeScript project:

```bash
npm run build
```

The port can be changed with the `PORT` environment variable:

```bash
PORT=4001 npm run dev
```

## 5.3 Common API Configuration

The Express application enables the following middleware:

- `cors()` allows requests from the frontend application.
- `express.json()` enables JSON request body parsing for future endpoints.

All current endpoints use the `/api` prefix and return JSON responses.

## 5.4 API Endpoints

| Method | Endpoint | Description | Success Status |
|---|---|---|---|
| `GET` | `/api/health` | Check whether the API is running | `200 OK` |
| `GET` | `/api/challenges` | Return all challenges | `200 OK` |
| `GET` | `/api/challenges?difficulty={difficulty}` | Return challenges matching a difficulty | `200 OK` |
| `GET` | `/api/challenges/:id` | Return one challenge by ID | `200 OK` |

### 5.4.1 Health Check

The health endpoint is used to confirm that the backend is available.

Request:

```http
GET /api/health
```

Example using curl:

```bash
curl http://localhost:4000/api/health
```

Response:

```json
{
      "status": "ok"
}
```

The endpoint returns HTTP status `200`.

### 5.4.2 Get All Challenges

Request:

```http
GET /api/challenges
```

Example using curl:

```bash
curl http://localhost:4000/api/challenges
```

The response is an array of challenge objects. Each challenge contains:

- `id`: Unique challenge identifier.
- `title`: Challenge title.
- `description`: Challenge description.
- `difficulty`: Challenge difficulty.
- `concepts`: Concepts covered by the challenge.
- `steps`: Steps required to complete the challenge.

Example response:

```json
[
      {
            "id": "react-counter",
            "title": "Build a Counter",
            "description": "Create a counter by starting with behavior tests, then implement the smallest solution.",
            "difficulty": "Beginner",
            "concepts": ["React state", "Events", "Component tests"],
            "steps": ["Write the failing test", "Implement the counter", "Refactor"]
      }
]
```

### 5.4.3 Filter Challenges by Difficulty

The challenges endpoint supports an optional `difficulty` query parameter.

Request:

```http
GET /api/challenges?difficulty=Beginner
```

Example using curl:

```bash
curl "http://localhost:4000/api/challenges?difficulty=Beginner"
```

The filter performs an exact match against the challenge's `difficulty` value.
If no challenge matches, the API returns an empty array with HTTP status `200`.

Example response:

```json
[
      {
            "id": "react-counter",
            "title": "Build a Counter",
            "description": "Create a counter by starting with behavior tests, then implement the smallest solution.",
            "difficulty": "Beginner",
            "concepts": ["React state", "Events", "Component tests"],
            "steps": ["Write the failing test", "Implement the counter", "Refactor"]
      }
]
```

Unknown difficulty example:

```bash
curl "http://localhost:4000/api/challenges?difficulty=Unknown"
```

Response:

```json
[]
```

### 5.4.4 Get a Challenge by ID

Request:

```http
GET /api/challenges/:id
```

Example using curl:

```bash
curl http://localhost:4000/api/challenges/api-health
```

For a valid ID, the API returns one challenge object with HTTP status `200`.

If the ID does not exist, the API returns HTTP status `404`:

```json
{
      "message": "Challenge not found"
}
```

## 5.5 TDD API Development Workflow

Backend API features are developed using the following TDD cycle:

1. Write an API contract test in `backend/src/app.test.ts`.
2. Run `npm test` and confirm that the test fails for the expected reason.
3. Add the minimum Express route implementation in `backend/src/app.ts`.
4. Run `npm test` again and confirm that the test passes.
5. Refactor the implementation while keeping the test suite green.

The API tests use **Vitest** and **Supertest**. They call the Express `app` directly, so the
tests do not need a running server or a database.

The current tests verify:

- Health check response and status code.
- Complete challenge collection response.
- Challenge lookup by ID.
- `404` response for an unknown challenge ID.
- Filtering by a known difficulty.
- Empty response for an unknown difficulty.

Example API contract test:

```ts
it('returns an unknown challenge error', async () => {
      const response = await request(app).get('/api/challenges/unknown');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Challenge not found' });
});
```

# Swagger API Documentation Implementation

## Overview

Swagger (OpenAPI) was integrated into the **Application_1 Backend** to provide interactive REST API documentation. It allows developers to visualize, understand, and test API endpoints directly from the browser without using external API testing tools such as Postman.

The Swagger UI is automatically generated based on the API definitions written inside the Express route files.

---

# Objectives

- Provide interactive API documentation.
- Allow developers to test APIs directly from the browser.
- Improve API readability and maintainability.
- Follow industry-standard OpenAPI documentation practices.
- Integrate documentation without affecting the existing CI/CD and GitOps pipeline.

---

# Technology Used

| Component | Purpose |
|-----------|---------|
| swagger-jsdoc | Generates OpenAPI specification from code comments |
| swagger-ui-express | Serves interactive Swagger UI |
| OpenAPI 3.0 | API documentation standard |
| Express.js | Backend Framework |

---

# Implementation Steps

## Step 1: Install Swagger Packages

Install Swagger dependencies.

```bash
npm install swagger-jsdoc swagger-ui-express
```

Install TypeScript typings.

```bash
npm install -D @types/swagger-jsdoc @types/swagger-ui-express
```

---

## Step 2: Create Swagger Configuration

Create a new configuration file.

```
src/
└── config/
      └── swagger.ts
```

This configuration defines:

- OpenAPI Version
- API Title
- Version
- Description
- Server URLs
- Route scanning paths

Example configuration includes:

- Local Development Server
- Kubernetes Server

The Swagger specification is generated using:

```
swagger-jsdoc(options)
```

---

## Step 3: Register Swagger Middleware

Inside **app.ts**, import Swagger modules.

```ts
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
```

Register the Swagger endpoint.

```ts
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);
```

After registration, Swagger becomes available at

```
http://localhost:5000/api-docs
```

---

## Step 4: Document API Endpoints

Each Express route was documented using OpenAPI annotations.

Example:

```ts
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Retrieve all users
 *     description: Fetches all users from MongoDB.
 *     tags:
 *       - Users
 */
```

Similar documentation was added for:

- GET /api/users
- GET /api/users/{id}
- POST /api/users
- PUT /api/users/{id}
- DELETE /api/users/{id}

---

# Swagger UI Verification

Start the backend server.

```bash
npm run dev
```

Open the browser.

```
http://localhost:5000/api-docs
```

The following endpoints are displayed.

```
Users

GET     /api/users

GET     /api/users/{id}

POST    /api/users

PUT     /api/users/{id}

DELETE  /api/users/{id}
```

Each endpoint provides:

- Summary
- Description
- Parameters
- Request Body
- Response Codes
- Interactive "Try it out" feature

Developers can execute API requests directly from the browser.

---

# Swagger Architecture

```
Browser
    │
    ▼
http://localhost:5000/api-docs
    │
    ▼
Swagger UI
    │
    ▼
swagger-ui-express
    │
    ▼
swagger-jsdoc
    │
    ▼
Express Route Annotations
    │
    ▼
OpenAPI Documentation
```

---

# Integration with Existing Pipeline

Swagger does **not** change the existing CI/CD pipeline.

Current deployment workflow remains unchanged.

```
Developer

      │

      ▼

Git Push

      │

      ▼

GitHub Actions

      │

      ▼

Docker Build

      │

      ▼

Docker Hub

      │

      ▼

FluxCD

      │

      ▼

Kubernetes

      │

      ▼

Application_1 Backend

      ├──────────────┐
      ▼              ▼

 REST APIs      Swagger UI
                (/api-docs)
```

Swagger becomes part of the backend Docker image automatically during the Docker build process.

No additional container or Kubernetes deployment is required.

---

# Troubleshooting

## Issue 1: Cannot GET /api-docs

### Cause

The browser was accessing an old Docker container instead of the local development server.

Existing container:

```
application1-backend:v1
```

was already using port **5000**.

As a result, newly implemented Swagger routes were not accessible.

### Solution

Stop the existing backend container.

```bash
docker stop app1-backend
```

Restart the local development server.

```bash
npm run dev
```

Swagger UI became available at

```
http://localhost:5000/api-docs
```

---

## Issue 2: Swagger UI Opened but APIs Were Missing

### Cause

Route annotations were not added.

Swagger only generates documentation for APIs that contain OpenAPI comments.

### Solution

Add Swagger annotations above each Express route.

---

## Issue 3: Browser Showing Old API

### Cause

Docker container was serving the previous backend version.

### Solution

Stop the container before local development.

```bash
docker stop app1-backend
```

Run the backend locally.

```bash
npm run dev
```

---

## Issue 4: Swagger Packages Not Found

### Cause

Required packages were not installed.

### Solution

Install dependencies.

```bash
npm install swagger-jsdoc swagger-ui-express
```

Install TypeScript typings.

```bash
npm install -D @types/swagger-jsdoc @types/swagger-ui-express
```

---

## Issue 5: Changes Not Reflecting

### Cause

Backend server was not restarted after configuration changes.

### Solution

Restart the development server.

```bash
npm run dev
```

---

# Implementation Outcome

After successful implementation:

- Swagger UI integrated successfully.
- Interactive API documentation generated automatically.
- CRUD APIs documented using OpenAPI annotations.
- APIs executable directly from the browser.
- Existing Docker setup remained unchanged.
- CI/CD pipeline continued to function normally.
- FluxCD deployment workflow remained unaffected.
- No additional Kubernetes resources were required.

---

## Logging Library

The frontend application uses the approved Dataxis logging library for application logging, debugging, error tracking, and observability.

The logging implementation is integrated with OpenTelemetry (OTel) so that application events can be correlated with the application's observability infrastructure.

### 1. Logging Architecture

The standard logging flow is:

```text
React Application
       ↓
Logging Library
       ↓
OpenTelemetry
       ↓
Observability Backend
       ↓
Logs / Traces / Diagnostics
```

## OpenTelemetry (OTel)

OpenTelemetry (OTel) provides the observability foundation for collecting and correlating telemetry generated by the frontend application.

The frontend logging implementation uses OpenTelemetry as part of the application's observability architecture.

### 1. OpenTelemetry Overview

OpenTelemetry is used to collect application telemetry and provide a standardized observability layer.

The main telemetry signals are:

```text
Logs
Traces
Metrics
```

## Log Levels

The logging system uses predefined log levels to indicate the severity and purpose of application events.

The correct log level must be selected based on the nature and importance of the event.

### 1. Log Level Hierarchy

```text
DEBUG
  ↓
INFO
  ↓
WARN
  ↓
ERROR
```

## Logging Standards

The frontend application must follow consistent logging standards to ensure logs are useful, structured, secure, and compatible with the Dataxis observability architecture.

### 1. Centralized Logging

All application-level logging must use the approved Dataxis logging library.

Recommended:

```ts
import { logger } from "@/logging";

logger.info("User profile loaded");
```

# Docker Setup for React + Vite Project

This document explains the Docker implementation for the current `d:\DataAxis\Testing_Proj` React/Vite application.

## Files Created

- `Dockerfile`
- `.dockerignore`

## Goals

- Build the React/Vite application inside a container
- Produce a production-ready static build
- Serve the static site using `nginx`
- Keep the final runtime image small and secure

## File: `Dockerfile`

This is a multi-stage Dockerfile with two stages:

### Stage 1: Builder

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
```

Explanation:

1. `FROM node:20-alpine AS builder`
   - Uses the Node.js Alpine image for a small build environment.
   - This stage installs dependencies and builds the application.

2. `WORKDIR /app`
   - Sets the working directory in the container to `/app`.

3. `COPY package*.json ./`
   - Copies `package.json` and `package-lock.json` into the image.
   - This allows dependency installation before copying the full source tree.

4. `RUN npm ci`
   - Installs dependencies exactly as defined in `package-lock.json`.
   - `npm ci` is faster and more deterministic than `npm install`.

5. `COPY . .`
   - Copies the entire project into the container.
   - Source files, config files, and build scripts are included.

6. `RUN npm run build`
   - Runs the Vite production build.
   - Outputs static assets into the `dist` folder.

### Stage 2: Runtime

```dockerfile
FROM nginx:alpine AS runtime

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Explanation:

1. `FROM nginx:alpine AS runtime`
   - Uses a lightweight NGINX image to serve the static build.
   - This stage is separate from the builder to keep the final image small.

2. `COPY --from=builder /app/dist /usr/share/nginx/html`
   - Copies only the built static files from the builder stage.
   - The runtime image does not contain source code or build tools.

3. `EXPOSE 80`
   - Documents that the container listens on port `80`.

4. `CMD ["nginx", "-g", "daemon off;"]`
   - Starts NGINX in foreground mode so Docker keeps the container alive.

## File: `.dockerignore`

This file excludes unnecessary files and directories from the Docker build context:

```text
node_modules
npm-debug.log*
yarn-error.log*
pnpm-lock.yaml
.vscode
.git
.gitignore
Dockerfile
Dockerfile.*
*.log
.DS_Store
coverage
dist
build
```

Why these entries matter:

- `node_modules` prevents copying local dependencies into the image.
- `dist` and `build` exclude local build output, so the build uses fresh output from `npm run build`.
- `.git` and `.vscode` skip developer-only files.
- `Dockerfile` and `Dockerfile.*` prevent Docker from copying build definitions back into the context.

## Build and Run Commands

From the project root:

```powershell
docker build -t testing-proj .
docker run -d --name testing-proj-container -p 8080:80 testing-proj
```

Explanation:

- `docker build -t testing-proj .`
  - Builds the image using the `Dockerfile` in the current directory.
  - Tags the resulting image as `testing-proj`.

- `docker run -d --name testing-proj-container -p 8080:80 testing-proj`
  - Runs the container in detached mode.
  - Maps host port `8080` to container port `80`.
  - Names the container `testing-proj-container`.

## Accessing the App

Open this URL in your browser:

```
http://localhost:8080
```

## Why This Approach

- Builds assets inside a clean container environment.
- Avoids shipping dev dependencies into the runtime image.
- Uses `nginx` for stable, low-overhead static hosting.
- Keeps the final image minimal and production-ready.

## Notes

- If you change dependencies, re-run `docker build`.
- If you add files that should not be part of the build, add them to `.dockerignore`.
- The runtime image does not need Node.js installed.

---

# Development Build

The Development Build process is used to compile and validate the frontend application during local development.

The objective is to ensure that the application can be built successfully, TypeScript code is valid, dependencies are resolved, and the generated development artifacts are available for local testing.

## 1. Build Flow

The complete development build flow is:

```text
Source Code
    ↓
Install Dependencies
    ↓
Environment Configuration
    ↓
TypeScript Validation
    ↓
Development Build
    ↓
Build Output
    ↓
Run Application
    ↓
Verify Application
```

# Production Build

The Production Build process is used to create an optimized, deployable version of the frontend application.

The production build must generate the required production artifacts and pass all application, TypeScript, testing, linting, and build validations before deployment.

## 1. Production Build Flow

The complete production build flow is:

```text
Source Code
    ↓
Verify Git Branch
    ↓
Install Dependencies
    ↓
Configure Production Environment
    ↓
Run Tests
    ↓
TypeScript Validation
    ↓
Lint Validation
    ↓
Production Build
    ↓
Verify Build Output
    ↓
Run Production Artifact
    ↓
Runtime Verification
    ↓
Deployment Ready
```

# Build Validation

Build Validation is the final verification stage used to ensure that the frontend application is technically valid, buildable, and ready to proceed to deployment.

The validation process verifies source code, dependencies, TypeScript, tests, linting, build artifacts, runtime behavior, and environment configuration.

## 1. Build Validation Flow

The complete validation flow is:

```text
Source Code
    ↓
Git Validation
    ↓
Dependency Validation
    ↓
Environment Validation
    ↓
Test Validation
    ↓
TypeScript Validation
    ↓
Lint Validation
    ↓
Build Validation
    ↓
Build Artifact Validation
    ↓
Runtime Validation
    ↓
Final Verification
```

# TDD Testing Guide using vitest

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

# Browser DevTools

Browser DevTools is the primary browser-side debugging tool used to inspect, diagnose, and verify frontend application behavior.

It provides tools for inspecting the DOM, CSS, JavaScript execution, network requests, storage, performance, and browser runtime errors.

## 1. Purpose

Browser DevTools is used to:

- Inspect rendered HTML and React application output.
- Debug CSS and layout issues.
- Inspect JavaScript errors.
- Debug API requests and responses.
- Inspect request headers and payloads.
- Verify authentication and browser storage.
- Debug application state and runtime behavior.
- Analyze loading and performance issues.
- Verify frontend behavior across different viewport sizes.
- Identify browser-side failures before investigating backend or infrastructure issues.

## 2. Debugging Flow

The standard browser debugging flow is:

```text
Issue
  ↓
Reproduce the Problem
  ↓
Open Browser DevTools
  ↓
Check Console
  ↓
Inspect Network
  ↓
Inspect Elements
  ↓
Inspect Application / Storage
  ↓
Debug JavaScript
  ↓
Check Performance When Required
  ↓
Identify Root Cause
  ↓
Apply Fix
  ↓
Reproduce Again
  ↓
Verify Fix

```

# React Debugging

React Debugging is the process of identifying, analyzing, and resolving issues related to React components, props, state, hooks, rendering, events, and application behavior.

The debugging process should combine Browser DevTools with React Developer Tools to identify the root cause before applying a fix.

## 1. Purpose

React debugging is used to:

- Inspect the React component hierarchy.
- Verify component props.
- Inspect component state.
- Inspect hooks.
- Identify unnecessary re-renders.
- Debug component lifecycle behavior.
- Debug event handlers.
- Debug conditional rendering.
- Debug state updates.
- Debug Context usage.
- Debug API-driven UI behavior.
- Debug TanStack Query integration.
- Identify the root cause of React runtime issues.

## 2. React Debugging Architecture

The standard React debugging flow is:

```text
React Application
       ↓
Component
       ↓
Props / State / Hooks
       ↓
React Developer Tools
       ↓
Browser DevTools
       ↓
Console / Network / Sources
       ↓
Root Cause
       ↓
Fix
       ↓
Re-render
       ↓
Verification
```

# Network Debugging

Network Debugging is the process of identifying, analyzing, and resolving issues related to communication between the frontend application and external services such as backend APIs.

Browser DevTools Network panel is the primary tool used to inspect requests, responses, headers, payloads, status codes, timing, caching, and browser security behavior.

## 1. Purpose

Network Debugging is used to:

- Verify API requests.
- Inspect API responses.
- Identify failed requests.
- Debug HTTP status codes.
- Verify request headers.
- Verify request payloads.
- Debug authentication issues.
- Debug CORS issues.
- Debug API timeouts.
- Debug incorrect API URLs.
- Debug query parameters.
- Debug response data mismatches.
- Debug caching behavior.
- Analyze request timing.
- Correlate frontend errors with backend responses.

## 2. Network Debugging Flow

The standard flow is:

```text
Issue
  ↓
Reproduce the Issue
  ↓
Open Browser DevTools
  ↓
Open Network Panel
  ↓
Clear Existing Requests
  ↓
Perform User Action
  ↓
Identify Request
  ↓
Check Request URL
  ↓
Check HTTP Method
  ↓
Check Headers
  ↓
Check Payload
  ↓
Check Status Code
  ↓
Check Response
  ↓
Check Timing
  ↓
Identify Root Cause
  ↓
Fix Issue
  ↓
Repeat Request
  ↓
Verify Fix
```


# Docker Debugging

Docker Debugging is the process of identifying, analyzing, and resolving issues related to containerized frontend applications.

Docker debugging covers the complete container lifecycle, including image creation, container startup, networking, environment variables, ports, logs, filesystem access, and runtime behavior.

## 1. Purpose

Docker Debugging is used to:

- Debug Docker image build failures.
- Debug container startup failures.
- Inspect running containers.
- Inspect container logs.
- Verify container environment variables.
- Verify port mappings.
- Debug application connectivity.
- Debug Docker networking.
- Debug container filesystem issues.
- Debug application processes inside containers.
- Verify production frontend containers.
- Identify differences between local and container environments.

## 2. Docker Debugging Flow

The standard debugging flow is:

```text
Issue
  ↓
Check Docker Status
  ↓
Check Image
  ↓
Check Container Status
  ↓
Check Container Logs
  ↓
Inspect Container
  ↓
Verify Environment
  ↓
Verify Ports
  ↓
Verify Network
  ↓
Inspect Application Process
  ↓
Identify Root Cause
  ↓
Fix Configuration / Code
  ↓
Rebuild Image
  ↓
Restart Container
  ↓
Verify Application
```


# Backend Development Checklist

This checklist is the final verification point for the LDD Backend onboarding process.

A developer should complete the relevant items before starting independent backend development work.

The checklist covers:

- Backend understanding
- Development environment
- Git workflow
- Project structure
- API development
- Swagger / API documentation
- Logging and observability
- Docker
- Build
- Testing
- Debugging
- CI/CD awareness
- Kubernetes awareness

---

# 12.1 Backend Architecture Understanding

- [ ] Understand the purpose of the LDD Backend.
- [ ] Understand the role of the backend in the overall application architecture.
- [ ] Understand how the frontend communicates with the backend.
- [ ] Understand the backend request/response flow.
- [ ] Understand the role of the main backend application.
- [ ] Understand the role of internal services used by the backend.
- [ ] Understand the difference between application logic and server startup.
- [ ] Understand the local backend port.
- [ ] Understand how backend configuration is provided.
- [ ] Understand the difference between local and deployed environments.

---

# 12.2 Development Environment

- [ ] Node.js is installed.
- [ ] npm is installed and working.
- [ ] TypeScript development environment is configured.
- [ ] Git is installed.
- [ ] Docker is installed.
- [ ] Docker Engine / Docker Desktop is running.
- [ ] Docker Compose is available if required.
- [ ] VS Code / Visual Studio / Rider is configured.
- [ ] API testing tool is available.
- [ ] curl is available.
- [ ] kubectl is installed if Kubernetes validation is required.
- [ ] Minikube/local Kubernetes is available if required.
- [ ] Tekton CLI is installed if CI pipeline debugging is required.
- [ ] Flux CLI is installed if GitOps debugging is required.

---

# 12.3 Repository Setup

- [ ] Backend repository has been cloned successfully.
- [ ] Correct repository branch is checked out.
- [ ] Project dependencies have been installed.
- [ ] `node_modules/` is generated successfully.
- [ ] `package.json` has been reviewed.
- [ ] Available npm scripts have been understood.
- [ ] Local configuration has been reviewed.
- [ ] Required environment variables are understood.
- [ ] Sensitive configuration is not committed to Git.

Install dependencies using:

```bash
npm install