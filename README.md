# TDD Challenge App

This repository is a production-oriented learning project for building, testing, containerizing, and operating a full-stack application. The project is currently incomplete. This README defines the intended implementation flow and delivery model before the remaining application and platform work is started.

## Project Overview

The application is a challenge catalog with a React frontend and an Express backend. It follows Test-Driven Development and currently uses static in-memory data rather than a database.

### Current stack

- Frontend: React, TypeScript, Vite, Vitest, and React Testing Library.
- Backend: Node.js, Express, TypeScript, Vitest, and Supertest.
- API: REST endpoints under `/api`.
- Delivery target: containerized frontend and backend on Kubernetes.
- Platform target: Terraform-managed cloud infrastructure, Helm packaging, Karpenter node scaling, and NGINX ingress.
- Delivery automation: Tekton CI and Flux GitOps CD.

## Documentation Map

The onboarding documents describe the responsibilities of each workstream:

- [Frontend Developer Onboarding](frontend-developer-onboarding.md): UI architecture, React and TypeScript standards, design system, state management, component documentation, testing, debugging, and frontend delivery.
- [Backend Developer Onboarding](backend-developer-onboarding.md): API architecture, Express services, endpoint contracts, TDD, API documentation, testing, and backend delivery.
- [DevOps Onboarding](devops-onboarding.md): Git workflow, container delivery, Tekton CI, Flux CD, Kubernetes manifests, Kustomize, NGINX, security, and release operations.
- [Cloud Engineering Onboarding](cloud-engineering-onboarding.md): cloud architecture, Kubernetes platform setup, Helm, Terraform, Karpenter, networking, infrastructure operations, and recovery.

## How the Project Works

The application flow is:

```text
User
  -> NGINX / Ingress
  -> React frontend
  -> Backend API
  -> In-memory challenge data
  -> JSON response
  -> Updated frontend state and UI
```

The delivery flow is:

```text
Feature branch
  -> TDD implementation
  -> Local tests and build
  -> Pull request
  -> Tekton CI
  -> Container image registry
  -> Reviewed GitOps change
  -> Flux reconciliation
  -> Kubernetes rollout
  -> NGINX and API smoke tests
  -> Monitoring and release record
```

## Work Waves

The work should be delivered in dependency order. Each wave has a clear output and a quality gate before the next wave starts.

### Wave 0: Planning and Baseline

**Purpose:** Confirm scope, ownership, technical decisions, and the current state before implementation.

Work:

1. Review the four onboarding documents and agree on responsibilities.
2. Confirm frontend, backend, DevOps, and cloud ownership.
3. Define `dev`, `staging`, and `prod` environments.
4. Define API contracts, deployment hostnames, security boundaries, availability targets, and cost limits.
5. Capture the current incomplete areas as tracked work.

Gate:

- Requirements, environment boundaries, owners, and acceptance criteria are documented.

### Wave 1: Local Development Foundation

**Purpose:** Make the repository easy to install, run, test, and build consistently.

Work:

1. Use the repository's Node.js LTS and lockfile.
2. Install dependencies from the repository root.
3. Run the frontend and backend together with `npm run dev`.
4. Confirm the frontend runs on port `5173` and the backend on port `4000`.
5. Standardize TypeScript, formatting, linting, environment configuration, and Git conventions.

Gate:

```bash
npm install
npm test
npm run build
```

### Wave 2: Backend API Development

**Purpose:** Build a stable, tested API contract for the frontend.

Work:

1. Define request, response, error, and status-code behavior.
2. Follow the backend TDD cycle: failing test, minimum implementation, refactor.
3. Implement and verify `/api/health`.
4. Implement and verify `GET /api/challenges`.
5. Implement and verify `GET /api/challenges/:id`.
6. Implement and verify difficulty filtering where required.
7. Keep the current in-memory data model until persistence is intentionally designed.
8. Add API documentation such as OpenAPI only after the contract is stable.

Gate:

```bash
npm run test:backend
npm run build --workspace backend
curl http://localhost:4000/api/health
```

### Wave 3: Frontend Development

**Purpose:** Build the user experience against the tested backend contract.

Work:

1. Define typed API and domain models.
2. Build focused, reusable React components.
3. Implement loading, success, empty, error, and retry states.
4. Connect the frontend to the backend API.
5. Apply the approved design system and accessibility standards.
6. Add component documentation and stories where required.
7. Keep UI behavior covered by tests before refactoring.

Gate:

```bash
npm run test:frontend
npm run build --workspace frontend
```

### Wave 4: Full-Stack Integration

**Purpose:** Prove that the browser, frontend, backend, and API contract work together.

Work:

1. Run frontend and backend locally at the same time.
2. Verify the frontend API base URL for each environment.
3. Test challenge listing, filtering, detail views, loading states, and API errors.
4. Verify CORS and browser network behavior.
5. Add integration or end-to-end checks for the critical user journey.
6. Confirm no database assumptions have been introduced accidentally.

Gate:

- The primary user journey works in a browser.
- Frontend and backend tests pass together.
- The root build completes successfully.

### Wave 5: Containerization

**Purpose:** Produce reproducible production artifacts.

Work:

1. Add a multi-stage Dockerfile for the frontend.
2. Build frontend assets with Node.js and serve them with NGINX.
3. Add a production Dockerfile for the compiled backend.
4. Use pinned base image versions, non-root users, minimal runtime layers, and `.dockerignore` files.
5. Expose only the required ports.
6. Tag images with the Git commit SHA or release version.
7. Run local container smoke tests for the frontend and `/api/health`.

Gate:

- Both images build reproducibly.
- Containers start with the expected commands.
- Health checks and critical API requests work from the running containers.

### Wave 6: Cloud Infrastructure with Terraform

**Purpose:** Provision the cloud foundation as code.

Work:

1. Configure remote encrypted Terraform state and locking.
2. Create isolated environment configurations.
3. Provision networking, private worker subnets, routing, security controls, and IAM/workload identity.
4. Provision the managed Kubernetes cluster and container registry.
5. Configure DNS, TLS, monitoring, logging, billing alerts, and Karpenter prerequisites.
6. Pin Terraform and provider versions.
7. Review plans through pull requests and apply only approved changes.

Gate:

```bash
terraform fmt -check -recursive
terraform init
terraform validate
terraform plan -var-file=environments/dev/dev.tfvars
```

### Wave 7: Kubernetes and Helm Deployment

**Purpose:** Deploy the application consistently into Kubernetes.

Work:

1. Create namespaces for each environment.
2. Create Helm templates for frontend/backend Deployments and Services.
3. Configure ConfigMaps, secret references, probes, resources, rolling updates, RBAC, and NetworkPolicies.
4. Use `/api/health` for backend readiness and liveness.
5. Use environment-specific Helm values without storing plaintext secrets.
6. Validate rendered templates before applying them.

Gate:

```bash
helm lint charts/tdd-challenge-app
helm template tdd-challenge-app charts/tdd-challenge-app -f charts/tdd-challenge-app/values-dev.yaml
kubectl get deployments,services -n <namespace>
kubectl rollout status deployment/frontend -n <namespace>
kubectl rollout status deployment/backend -n <namespace>
```

### Wave 8: Networking, NGINX, and Scaling

**Purpose:** Make the application reachable, secure, and capable of handling changing demand.

Work:

1. Configure DNS and HTTPS certificates.
2. Configure NGINX Ingress to route frontend traffic and `/api` traffic correctly.
3. Verify CORS against the actual frontend hostname.
4. Restrict firewall rules, pod traffic, and administrative access.
5. Configure Karpenter NodePools, node classes, instance limits, disruption rules, and cost controls.
6. Test node provisioning and scale-out in development before production.

Gate:

```bash
kubectl get ingress,svc,endpoints -n <namespace>
kubectl get nodepools,nodeclaims
curl -I https://<frontend-host>
curl https://<frontend-host>/api/health
```

### Wave 9: Tekton CI and Flux CD

**Purpose:** Automate validation, image publication, and GitOps delivery.

Tekton CI should:

1. Clone the commit.
2. Install dependencies.
3. Run `npm test` and `npm run test:coverage`.
4. Run `npm run build`.
5. Run dependency, secret, and image security scans.
6. Build and publish immutable frontend/backend images.
7. Capture image digests and propose a GitOps update.

Flux CD should:

1. Watch the GitOps repository.
2. Reconcile the selected Kustomize or Helm configuration.
3. Deploy approved image digests to the target namespace.
4. Report source, reconciliation, and rollout status.

Gate:

- Failed tests or builds cannot publish release images.
- Staging deployment succeeds before production approval.
- Production changes are represented in Git and can be rolled back through Git.

### Wave 10: Operations and Release

**Purpose:** Operate the system after deployment and verify the release.

Work:

1. Monitor frontend availability, backend health, latency, errors, pods, nodes, ingress, TLS, and cost.
2. Check logs and alerts after every deployment.
3. Document rollback, incident response, and disaster recovery.
4. Record the release tag, Git commit, image digest, Helm revision, Terraform apply, and verification evidence.
5. Review operational signals and improve the platform after each release.

Gate:

- The release is reachable over HTTPS.
- The frontend can call the backend.
- `/api/health` is healthy.
- Critical user flows pass.
- Dashboards and alerts receive data.
- Rollback has been tested or explicitly accepted as a release risk.

## End-to-End Development Process

Every application feature should follow this loop:

```text
Requirement
  -> API/UI design
  -> Failing test
  -> Minimum implementation
  -> Passing focused test
  -> Refactor
  -> Full test suite
  -> Build
  -> Pull request
  -> Tekton CI
  -> Review and merge
  -> Image publication
  -> GitOps update
  -> Flux deployment
  -> Smoke test
  -> Monitoring and release record
```

The frontend and backend can develop in parallel after their contracts are agreed, but containerization depends on working builds, Kubernetes deployment depends on container images, and production delivery depends on validated infrastructure and CI/CD.

## Local Development

Install and run the project from the repository root:

```bash
npm install
npm run dev
```

The local URLs are:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

### Standard validation commands

```bash
npm test
npm run test:frontend
npm run test:backend
npm run test:coverage
npm run build
```

## Definition of Done

A feature or release is complete only when:

- The scope and acceptance criteria are documented.
- Tests were written before the implementation for new behavior.
- Frontend and backend contracts are typed and verified.
- Focused tests and the complete test suite pass.
- Frontend and backend production builds pass.
- No secrets or generated artifacts are committed.
- Container images are reproducible and use immutable tags.
- Terraform, Helm, Kubernetes, and security validation pass where applicable.
- The application is deployed to staging and smoke-tested.
- Production promotion is reviewed and traceable through Git.
- Health, critical user flows, logs, metrics, alerts, and rollback are verified.
- Release evidence and known risks are recorded.

## Current Project Status

This repository is a starting point. The onboarding documents and this README describe the target process; infrastructure, container, Helm, Terraform, Tekton, Flux, and production operations should be implemented incrementally through the work waves above.
