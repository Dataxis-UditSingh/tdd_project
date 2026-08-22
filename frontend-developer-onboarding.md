# Frontend Developer Onboarding

## 1. Introduction

This document provides the onboarding guidelines for Frontend Developers.

It covers the development standards, tools, architecture, implementation practices, testing, debugging, and verification required to work effectively on the frontend application.

## 2. Role Overview

The Frontend Developer is responsible for building and maintaining scalable, reusable, accessible, and maintainable frontend applications.

The role includes:

- Developing React applications using TypeScript.
- Following the defined project folder structure.
- Building reusable UI components.
- Following the project's design system.
- Using approved libraries and utilities.
- Managing server state using TanStack Query.
- Maintaining component documentation using Storybook.
- Following the defined Microfrontend architecture.
- Implementing application logging and OpenTelemetry integration.
- Creating and maintaining automated tests.
- Building and containerizing frontend applications.
- Debugging frontend applications and identifying issues.
- Following the project's Git and development workflow.

## 3. Frontend Development Objectives

By completing this onboarding, the developer should be able to:

- Understand the frontend project architecture.
- Navigate and follow the standard folder structure.
- Develop React components using TypeScript.
- Use the project's design system and UI libraries correctly.
- Manage server state using TanStack Query.
- Create reusable utility functions and libraries.
- Document components using Storybook.
- Understand and work with the Microfrontend architecture.
- Implement and use the project's logging and OpenTelemetry setup.
- Run frontend tests using Vitest.
- Create production-ready frontend builds.
- Build and run the frontend application using Docker.
- Debug common frontend development issues.

## 4. Onboarding Flow

The Frontend Developer onboarding follows this sequence:

```text
Development Environment
        ↓
Node.js LTS
        ↓
Git Workflow
        ↓
Project Folder Structure
        ↓
TypeScript Standards
        ↓
React Development
        ↓
Design System
        ↓
shadcn/ui
        ↓
TanStack Query
        ↓
Utility Libraries
        ↓
Logging & OpenTelemetry
        ↓
Storybook
        ↓
Microfrontend Architecture
        ↓
Docker
        ↓
Build
        ↓
Vitest Testing
        ↓
Debugging
        ↓
Final Verification
```

## 2. Development Environment

The frontend development environment must use the approved runtime, package manager, and development tools to ensure consistency across all development environments.

### 2.1 Node.js LTS

The project uses the Node.js Long-Term Support (LTS) release for frontend development.

Node.js LTS provides a stable and supported runtime for:

- Running the frontend development server.
- Installing and managing dependencies.
- Running build commands.
- Running tests.
- Executing development scripts.
- Running project tooling.

#### Verify Node.js

Run:

```bash
node --version
```

### 2.2 Package Manager

The frontend project must use the package manager defined by the repository's lock file. The lock file ensures that all developers install the same dependency versions.

#### Supported Package Managers

| Lock File | Package Manager | Install Command |
|---|---|---|
| `package-lock.json` | npm | `npm ci` |
| `yarn.lock` | Yarn | `yarn install --frozen-lockfile` |
| `pnpm-lock.yaml` | pnpm | `pnpm install --frozen-lockfile` |

Use only the package manager configured for the project.

Do not delete or regenerate the lock file unless the dependency configuration is intentionally being changed.

#### Verify Package Manager

For npm:

```bash
npm --version
```

## 2.3 Required Developer Tools

The following tools are required for frontend development:

| Tool | Purpose |
|---|---|
| Git | Source-code management and collaboration |
| Node.js LTS | JavaScript/TypeScript runtime |
| npm / Yarn / pnpm | Dependency management |
| Docker | Application containerization |
| VS Code / Approved IDE | Frontend development |
| Web Browser | Application execution and validation |
| Browser DevTools | Frontend debugging and inspection |
| TypeScript | Static type checking |
| Vitest | Frontend testing |
| Storybook | Component development and documentation |
| React Developer Tools | React component inspection and debugging |
| Terminal | Development commands and project execution |
| ESLint | Code quality and linting |
| Prettier | Code formatting |
| Environment Configuration | Local development configuration |


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

## Project Folder Structure

The frontend project follows the structure below. The structure is based on the current frontend repository layout. :contentReference[oaicite:0]{index=0} :contentReference[oaicite:1]{index=1}

```text
frontend/
├── coverage/
│   ├── base.css
│   ├── block-navigation.js
│   ├── clover.xml
│   ├── coverage-final.json
│   ├── favicon.png
│   ├── index.html
│   ├── prettify.css
│   ├── prettify.js
│   ├── sort-arrow-sprite.png
│   ├── sorter.js
│   └── src/
│       ├── App.tsx.html
│       ├── api.ts.html
│       ├── components/
│       │   └── ChallengeCard/
│       │       ├── ChallengeCard.tsx.html
│       │       └── index.html
│       ├── index.html
│       ├── main.tsx.html
│       └── types.ts.html
│
├── dist/
│   ├── assets/
│   │   ├── index-D1gVQO7N.css
│   │   └── index-Dl17vyHD.js
│   └── index.html
│
├── node_modules/
│   └── ...
│
├── src/
│   ├── App.test.tsx
│   ├── App.tsx
│   ├── api.test.ts
│   ├── api.ts
│   ├── components/
│   │   └── ChallengeCard/
│   │       ├── ChallengeCard.test.tsx
│   │       └── ChallengeCard.tsx
│   ├── main.tsx
│   ├── styles.css
│   ├── test/
│   │   └── setup.ts
│   └── types.ts
│
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts

```

## TypeScript

TypeScript is the standard programming language for frontend development. It is used as a strongly typed layer on top of JavaScript and helps maintain type safety, code quality, maintainability, and developer productivity across the application.

### 1. Why TypeScript Only

TypeScript is mandatory for frontend development for the following reasons:

- **Type Safety**  
  TypeScript detects many type-related issues during development before the application is executed.

- **Better Code Quality**  
  Explicit types make the code easier to understand, review, and maintain.

- **Improved Developer Experience**  
  TypeScript provides better autocomplete, navigation, refactoring, and inline error detection in supported IDEs.

- **Safer Refactoring**  
  Type information helps identify affected code when components, functions, interfaces, or APIs are changed.

- **API Contract Validation**  
  API request and response structures can be represented using TypeScript types and interfaces.

- **Component Reliability**  
  Props, state, function parameters, and return values can be explicitly typed.

- **Maintainability**  
  A typed codebase is easier for new developers to understand and maintain as the application grows.

- **Consistency**  
  Using TypeScript across the frontend codebase provides a consistent development standard.

### 2. TypeScript Standards

The following standards must be followed:

- Use TypeScript for frontend application source code.
- Use `.ts` for TypeScript files.
- Use `.tsx` for React components containing JSX.
- Define types for component props.
- Define types for API request and response structures.
- Avoid unnecessary use of `any`.
- Prefer specific types over broad types.
- Use interfaces or type aliases according to the project convention.
- Keep shared types in the appropriate type definition files.
- Do not disable TypeScript checks to hide errors.
- Do not use JavaScript files for new application functionality unless explicitly approved.

### 3. TypeScript Configuration

The project configuration is maintained in:

```text
tsconfig.json
```

## React Architecture

The frontend application follows a component-based React architecture designed to keep UI, application logic, API communication, shared utilities, and types organized and maintainable.

### 1. Architecture Overview

The React application follows this high-level flow:

```text
User Interaction
       ↓
React Component
       ↓
Event Handler
       ↓
Application Logic
       ↓
API / State Management
       ↓
Backend Service
       ↓
API Response
       ↓
State Update
       ↓
React Re-render
       ↓
Updated UI
```

## Components and Hooks

### 1. Components

React components are the primary building blocks of the frontend application. Components should be reusable, focused, predictable, and responsible for rendering a specific part of the user interface.

### 1.1 Component Structure

Reusable components should follow a consistent structure:

```text
src/
└── components/
    ├── Button/
    │   ├── Button.tsx
    │   └── Button.test.tsx
    ├── UserCard/
    │   ├── UserCard.tsx
    │   └── UserCard.test.tsx
    └── ChallengeCard/
        ├── ChallengeCard.tsx
        └── ChallengeCard.test.tsx
```

## Props and State

Props and State are core concepts used to manage data, communication, and UI behavior in React applications.

### 1. Props

Props are read-only values passed from a parent component to a child component.

```text
Parent Component
       ↓
      Props
       ↓
Child Component
```

## Coding Standards

The frontend codebase follows consistent coding standards to maintain readability, reliability, scalability, and long-term maintainability.

### 1. General Principles

- Write clean, readable, and maintainable code.
- Keep implementations simple and focused.
- Follow the existing project structure and conventions.
- Avoid unnecessary duplication.
- Prefer reusable components, hooks, and utilities.
- Keep functions and components focused on a single responsibility.
- Do not introduce unnecessary dependencies.
- Do not commit temporary or debugging code.
- Do not commit secrets or sensitive configuration.

### 2. TypeScript Standards

- Use TypeScript for all frontend application code.
- Use `.ts` for TypeScript files.
- Use `.tsx` for React components containing JSX.
- Define types for component props.
- Define types for API requests and responses.
- Avoid unnecessary use of `any`.
- Prefer specific types over broad types.
- Use `unknown` when the data type is genuinely unknown.
- Do not disable TypeScript checks to hide errors.

Example:

```ts
interface User {
  id: string;
  name: string;
  email: string;
}
```

# Design System

The Dataxis Design System provides reusable UI components, layouts, styling utilities, and common design patterns used across the LDS frontend applications.

## What You'll Find

The Design System contains reusable frontend building blocks such as:

- UI components
- Page layouts
- Styling utilities
- Tailwind CSS utilities
- Component variants
- Accessible UI primitives

### UI Components

| Component | Purpose |
|---|---|
| Button | User actions and clickable interactions |
| Input | User input fields |
| Card | Content grouping and presentation |
| Alert | User notifications and messages |
| Badge | Status and category indicators |
| Dialog | Modal and confirmation interactions |
| Label | Form field labels |

### Page Layouts

The Design System provides reusable layouts for common application pages:

- `AuthLayout`
- `UserLayout`

### Utilities

The Design System provides shared styling utilities, including:

- `cn` — class name merging utility

## Installation

Install the Design System package:

```bash
npm install @dataxis/lds-design-system
```

## shadcn/ui

shadcn/ui is used to provide reusable, accessible, and customizable UI components for the frontend application.

The implementation should follow the project's existing Design System and component conventions.

### 1. Prerequisites

Before using shadcn/ui, verify that:

- Node.js LTS is installed.
- The project dependencies are installed.
- Tailwind CSS is configured.
- TypeScript is configured.
- The Design System structure is available.
- The project uses the approved shadcn/ui configuration.

Verify the project:

```bash
npm install
```

## TanStack Query – Server State Management

TanStack Query is used to manage server state in the frontend application.

Server state represents data that is owned and managed by the backend, such as:

- API responses.
- User data.
- Lists and collections.
- Remote configuration.
- Backend resources.
- Cached API data.

TanStack Query manages the complete lifecycle of server state, including fetching, caching, synchronization, loading states, error states, and refetching.

### 1. Server State vs Client State

Server state and client state should be treated differently.

```text
Client State
    ↓
Owned by Frontend
    ↓
React State / Context / Approved State Solution
```

## Queries

TanStack Query queries are used to fetch, cache, synchronize, and manage server data in the frontend application.

### 1. Query Architecture

The standard query flow is:

```text
React Component
      ↓
Custom Query Hook
      ↓
useQuery
      ↓
Query Key + Query Function
      ↓
API Function
      ↓
Backend API
      ↓
Response
      ↓
TanStack Query Cache
      ↓
Component
      ↓
UI
```

## Mutations

TanStack Query mutations are used to perform server-side operations that create, update, or delete data.

Common mutation operations include:

- Create
- Update
- Delete
- Submit
- Approve
- Reject
- Upload

### 1. Mutation Architecture

The standard mutation flow is:

```text
React Component
      ↓
Custom Mutation Hook
      ↓
useMutation
      ↓
Mutation Function
      ↓
API Function
      ↓
Backend API
      ↓
Mutation Response
      ↓
Query Invalidation / Cache Update
      ↓
Updated UI
```

## Cache

TanStack Query Cache is used to store and manage previously fetched server state in the frontend application.

The cache helps reduce unnecessary network requests, improve application responsiveness, and keep server data synchronized across components.

### 1. Cache Architecture

The standard cache flow is:

```text
React Component
      ↓
TanStack Query
      ↓
Query Cache
      ↓
Cached Data Available?
   ┌──┴──┐
  Yes    No
   ↓      ↓
Return   API Request
Data       ↓
   │    Response
   │       ↓
   └──→ Query Cache
            ↓
        React Component
```

## Query Conventions

TanStack Query queries must follow consistent conventions across the frontend application to ensure predictable caching, reusable data-fetching logic, and maintainable server-state management.

### 1. Query Naming

Query hooks must use the `use` prefix followed by a descriptive resource name.

Recommended:

```text
useUsers
useUser
useOrders
useOrder
useProducts
useProduct
```


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

# Storybook — LDS Component Library

Storybook is used to develop, document, test, and visually verify reusable components provided by the LDS Design System.

It provides an isolated development environment where frontend developers can view component states, interact with component properties, and verify UI behavior before integrating components into applications.

## 1. Purpose

Storybook is used for:

- Developing reusable UI components in isolation.
- Documenting component usage and supported variants.
- Interactively testing component properties.
- Verifying component states and visual behavior.
- Providing a centralized reference for the LDS component library.
- Supporting consistent UI development across LDS micro-frontends.

## 2. Storybook Architecture

The development flow is:

```text
LDS Design System
       ↓
React Components
       ↓
Component Stories
       ↓
Storybook
       ↓
Interactive Documentation
       ↓
Component Verification
```

# 🏗️ LDS Micro Frontend Architecture

> **Reference Repository**
>
> The Micro Frontend Architecture section below is explained using the following repository as the reference implementation:
>
> **LDS React Repository:** https://github.com/Dataxis-UditSingh/LDS-React.git
>
> This repository must be used as the reference project for understanding and implementing the Micro Frontend Architecture described in this onboarding documentation.
>
> All architecture concepts, project structure, integration patterns, and implementation examples in the following sections should be understood in the context of the **LDS React** repository.

## 📁 Complete Project Structure

```
LDS/
├── design-system/              # ✨ UI LIBRARY (Presentational components only)
│   ├── package.json                # Library package configuration
│   ├── vite.config.ts              # Vite build configuration for library mode
│   ├── tsconfig.json               # TypeScript configuration
│   ├── README.md                   # Library documentation
│   │
│   └── src/
│       ├── index.ts                # Main entry point (exports everything)
│       ├── vite-env.d.ts           # Vite environment types
│       │
│       ├── components/             # 🎨 UI Components
│       │   ├── Button.tsx          # Button component
│       │   ├── Input.tsx           # Input component
│       │   ├── Card.tsx            # Card component
│       │   ├── Alert.tsx           # Alert component
│       │   ├── Badge.tsx           # Badge component
│       │   ├── Dialog.tsx          # Dialog/Modal component
│       │   ├── Label.tsx           # Label component
│       │   └── index.ts            # Component exports
│       │
│       ├── layouts/                # 📐 Page Layouts
│       │   ├── AuthLayout.tsx      # Layout for auth pages
│       │   ├── UserLayout.tsx      # Layout for user pages
│       │   └── index.ts            # Layout exports
│       │
│       └── utils/                  # 🛠️ Utility Functions
│           ├── utils.ts            # Tailwind merge utility (cn)
│           └── index.ts            # Utility exports
│
├── auth-lib/                       # 🔑 AUTH & LOGIC LIBRARY
│   ├── package.json                # Library package configuration
│   ├── vite.config.ts              # Vite build configuration
│   ├── tsconfig.json               # TypeScript configuration
│   ├── README.md                   # Library documentation
│   │
│   └── src/
│       ├── index.ts                # Main entry point
│       │
│       ├── hooks/                  # 🪝 React Hooks
│       │   ├── useAuth.ts          # Authentication hook
│       │   ├── useAuthContext.ts   # Auth context hook
│       │   └── index.ts            # Hook exports
│       │
│       ├── utils/                  # 🛠️ Utility Functions
│       │   ├── tokenManager.ts     # JWT token management
│       │   ├── validation.ts       # Form validation
│       │   └── index.ts            # Utility exports
│       │
│       ├── config/                 # ⚙️ Configurations
│       │   ├── axios.ts            # Axios instance with interceptors
│       │   ├── queryClient.ts      # React Query client
│       │   ├── constants.ts        # App constants
│       │   └── index.ts            # Config exports
│       │
│       └── contexts/               # 🌐 React Contexts
│           ├── AuthContext.tsx     # Authentication context
│           └── index.ts            # Context exports
│
├── barcode/                        # 📦 BARCODE APPLICATION (Consumer)
│   ├── package.json                # App package configuration
│   ├── vite.config.ts              # Vite configuration
│   ├── tsconfig.json               # TypeScript configuration
│   │
│   └── src/
│       ├── main.tsx                # App entry point
│       ├── App.tsx                 # Main app component
│       │
│       ├── pages/                  # 📄 App-specific pages
│       │   ├── Login.tsx           # Login page
│       │   ├── Home.tsx            # Home page (PO search)
│       │   └── Dashboard.tsx       # Dashboard page
│       │
│       ├── components/             # 🧩 App-specific components
│       │   ├── PrintOptionsModal.tsx  # Print modal
│       │   └── ProtectedRoute.tsx     # Route guard
│       │
│       └── services/               # 🔌 App-specific services
│           ├── authService.ts      # Auth API calls
│           └── dummyBackend.ts     # Mock backend
│
└── loan-app/                       # 💼 LOAN APPLICATION (Consumer)
    ├── package.json                # App package configuration
    ├── vite.config.ts              # Vite configuration
    ├── tsconfig.json               # TypeScript configuration
    ├── API_INTEGRATION.md          # API integration guide
    │
    └── src/
        ├── main.tsx                # App entry point
        ├── App.tsx                 # Main app component
        │
        ├── pages/                  # 📄 App-specific pages
        │   ├── Login.tsx           # Login page
        │   ├── Home.tsx            # Home page (loan application)
        │   └── Dashboard.tsx       # Dashboard page
        │
        ├── components/             # 🧩 App-specific components
        │   └── ProtectedRoute.tsx     # Route guard
        │
        ├── hooks/                  # 🪝 App-specific hooks
        │   ├── useAuthQuery.ts     # Auth queries
        │   ├── useLoanQuery.ts     # Loan queries
        │   └── usePOQuery.ts       # PO queries
        │
        ├── services/               # 🔌 App-specific services
        │   ├── authService.ts      # Auth API calls
        │   ├── loanService.ts      # Loan API calls
        │   └── api.ts              # API configuration
        │
        └── __tests__/              # 🧪 Test suite (42 tests)
            ├── useAuthQuery.test.tsx
            ├── useLoanQuery.test.tsx
            ├── authService.test.ts
            └── ...
```

---

## 🎯 Architecture Overview

### **Part 1: UI Components Library** (`@dataxis/lds-design-system`)

**Purpose**: Pure presentational UI components and layouts - no business logic.

**What's Included**:

- ✅ UI Components (Button, Input, Card, Alert, Badge, Dialog, Label)
- ✅ Layouts (AuthLayout, UserLayout)
- ✅ Utilities (cn - className merger)

**Benefits**:

- 🔄 **Reusability**: Write once, use everywhere
- 🎨 **Consistency**: Same UI/UX across all apps
- 🚀 **Faster Development**: No code duplication

---

### **Part 2: Authentication & Logic Library** (`@dataxis/lds-auth-lib`)

**Purpose**: Authentication, API configuration, and business logic utilities.

**What's Included**:

- ✅ React Hooks (useAuth, useAuthContext)
- ✅ Token Management (tokenManager)
- ✅ API Configuration (axios instance with auto-refresh)
- ✅ React Query Setup (queryClient)
- ✅ Validation Utilities (email, password, username validation)
- ✅ Auth Context (AuthProvider)

**Benefits**:

- 🔐 **Centralized Auth**: Single source of truth for authentication
- 🔧 **Centralized Updates**: Update library, all apps benefit
- 🛡️ **Security**: Consistent security patterns

---

### **Part 3: Barcode Application** (Consumer)

**Purpose**: Specific business logic for barcode/PO management.

**What's Included**:

- ✅ Pages (Login, Home, Dashboard)
- ✅ App-specific components (PrintOptionsModal, ProtectedRoute)
- ✅ Business logic services
- ✅ App-specific routing

**Uses Shared Libraries For**:

- ✅ UI Components (from design-system)
- ✅ Layouts (from design-system)
- ✅ Authentication (from auth-lib)
- ✅ API Configuration (from auth-lib)

---

## 🔄 How It Works

### **1. Development Workflow**

```
┌──────────────────────────────────────────────────────┐
│  Developer makes changes to:                         │
│  • design-system/src/components (UI)                 │
│  • auth-lib/src/ (Auth & Logic)                      │
└──────────────────┬───────────────────────────────────┘
                   │
                   ↓
┌──────────────────────────────────────────────────────┐
│  Vite builds both libraries                          │
│  (npm run build or npm run dev in each)              │
└──────────────────┬───────────────────────────────────┘
                   │
                   ↓
┌──────────────────────────────────────────────────────┐
│  Libraries linked to barcode app                     │
│  (npm link @dataxis/lds-design-system)               │
│  (npm link @dataxis/lds-auth-lib)                    │
└──────────────────┬───────────────────────────────────┘
                   │
                   ↓
┌──────────────────────────────────────────────────────┐
│  Barcode app imports from both libraries             │
│  UI: import { Button } from '@dataxis/lds-design-system' │
│  Auth: import { useAuth } from '@dataxis/lds-auth-lib'   │
└──────────────────────────────────────────────────────┘
```

### **2. Import Pattern**

**Before** (Monolithic):

```typescript
import { Button } from '@/design-system/components'
import { useAuth } from '@/hooks/useAuth'
import { tokenManager } from '@/utils/tokenManager'
import { AuthLayout } from '@/layouts'
```

**After** (Micro Frontend - 3 Packages):

```typescript
// UI Components from design-system
import { Button, Card, Input, AuthLayout } from '@dataxis/lds-design-system'

// Auth & Logic from auth-lib
import { useAuth, tokenManager, isValidEmail } from '@dataxis/lds-auth-lib'
```

---

## 🚀 Setup Steps

### **Step 1: Install Dependencies for All Packages**

```bash
# Install design-system dependencies
cd /Users/sanjeevsharma/Desktop/project2026/final_barcode/LDS/design-system
npm install

# Install auth-lib dependencies
cd ../auth-lib
npm install

# Install barcode app dependencies
cd ../barcode
npm install
```

### **Step 2: Build the Libraries**

```bash
# Build design-system
cd ../design-system
npm run build

# Build auth-lib
cd ../auth-lib
npm run build
```

### **Step 3: Link Libraries Locally**

```bash
# Link design-system
cd ../design-system
npm link

# Link auth-lib
cd ../auth-lib
npm link

# Link both in barcode app
cd ../barcode
npm link @dataxis/lds-design-system
npm link @dataxis/lds-auth-lib
```

### **Step 4: Update Barcode App Imports**

Update all imports in `barcode/src` to use the shared library.

---

## 📦 Module Exports

### Design System Library Exports

```typescript
// Main export (UI components)
import {
  Button,
  Input,
  Card,
  Badge,
  Alert,
  Dialog,
  Label,
} from '@dataxis/lds-design-system'
import { AuthLayout, UserLayout } from '@dataxis/lds-design-system'
import { cn } from '@dataxis/lds-design-system'

// Or import from specific paths
import { Button } from '@dataxis/lds-design-system/components'
import { AuthLayout } from '@dataxis/lds-design-system/layouts'
import { cn } from '@dataxis/lds-design-system/utils'
```

### Auth Library Exports

```typescript
// Main export (auth & logic)
import {
  useAuth,
  useAuthContext,
  tokenManager,
  axiosInstance,
  queryClient,
  AuthProvider,
  isValidEmail,
  isValidPassword,
} from '@dataxis/lds-auth-lib'

// Everything is exported from the main entry point
```

---

## 🎨 Future Applications

This architecture allows you to create new applications easily:

```
LDS/
├── design-system/        # Shared UI library (existing)
├── auth-lib/             # Shared auth & logic library (existing)
├── barcode/              # Barcode app (existing)
├── inventory/            # NEW: Inventory management app
├── warehouse/            # NEW: Warehouse app
├── analytics/            # NEW: Analytics dashboard
└── admin-panel/          # NEW: Admin panel
```

All these apps can use both shared libraries! 🎉

- **@dataxis/lds-design-system** for consistent UI
- **@dataxis/lds-auth-lib** for authentication & API

---

## 🔐 Security Features

- ✅ JWT Access Token (localStorage)
- ✅ Refresh Token (HttpOnly cookies)
- ✅ Automatic token refresh
- ✅ Axios interceptors
- ✅ Protected routes
- ✅ Auth context

---

## 📊 Technology Stack

| Technology       | Purpose                 |
| ---------------- | ----------------------- |
| **React 19**     | UI Framework            |
| **TypeScript**   | Type Safety             |
| **Vite**         | Build Tool & Dev Server |
| **Tailwind CSS** | Styling                 |
| **Radix UI**     | Accessible Components   |
| **React Query**  | Data Fetching           |
| **Axios**        | HTTP Client             |
| **React Router** | Navigation              |

---

## ✅ What We've Achieved

1. ✅ Created a reusable shared component library
2. ✅ Set up proper TypeScript configuration
3. ✅ Configured Vite for library mode
4. ✅ Organized code into logical modules
5. ✅ Prepared for future micro frontend apps
6. ✅ Maintained all existing functionality

---

## 🎯 Next Steps

1. **Install dependencies** in design-system
2. **Build the library**
3. **Link to barcode app**
4. **Update imports** in barcode app
5. **Test everything** works
6. **Deploy** when ready

---

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

# Common Issues

This section covers common issues that may occur during frontend development, build, debugging, Dockerization, and local application execution.

## 1. Node.js Version Mismatch

### Symptoms

```text
Dependency installation fails
Build fails
Runtime errors
Unexpected package behavior