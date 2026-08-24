 # DevOps Onboarding: TDD React TypeScript App

This document defines the proposed DevOps process for taking this project from local development to a Kubernetes production deployment. This project includes:

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Tests: Vitest, React Testing Library, and Supertest
- API: `/api/health`, `/api/challenges`, `/api/challenges/:id`
- Database: none; data is stored in in-memory TypeScript

The purpose of this document is to define the implementation plan and final verification steps. Application features will continue to follow the separate TDD workflow.

## 1. Introduction & DevOps Overview

### What DevOps means

DevOps connects development and operations through an automated process:

1. Push code to the Git repository.
2. Run installation, tests, coverage, and builds in the CI pipeline.
3. Build container images and publish them to a registry.
4. Update Kubernetes manifests in the GitOps repository or deployment directory.
5. Apply the desired state to the cluster through Flux.
6. Verify health, logs, and rollback procedures after deployment.

### Target architecture

```text
Developer -> Git repository -> Tekton CI -> Container Registry
										|                              |
										v                              v
							GitOps manifests <------------ image tag update
										|
										v
							Flux -> Kubernetes -> NGINX Ingress -> Frontend / Backend
```

### Environments

- `dev`: developer testing and manual smoke checks.
- `staging`: integration and release verification after CI.
- `prod`: controlled rollout after an approved GitOps change.

Define separate configuration, namespaces, hostnames, and resource limits for each environment.

## 2. Git & Repository Workflow

### Repository preparation

1. Identify the default branch of the existing repository.
2. Enable branch protection.
3. Add frontend tests, backend tests, and the build as required status checks.
4. Disable direct pushes to protected branches.
5. Define CODEOWNERS, contribution rules, and release versioning.
6. Ensure `.gitignore` covers `node_modules`, build output, coverage output, and local `.env` files.

### Suggested branches

- `main`: production-ready source.
- `feature/<name>`: feature development.
- `fix/<name>`: bug fixes.
- `release/<version>`: optional release stabilization.

### Pull request process

1. Create a feature branch.
2. Add a failing test first according to the TDD process.
3. Write the minimum implementation and make the local tests pass.
4. Run `npm test` and `npm run build`.
5. Open a pull request.
6. Merge after the Tekton CI checks succeed and the code review is complete.
7. Create a semantic version tag for a release, such as `v1.0.0`.

### Local checks

```bash
npm install
npm test
npm run test:coverage
npm run build
```

## 3. GitOps

### What GitOps means

With GitOps, the desired Kubernetes state is stored in Git files. Instead of manually running `kubectl apply` in the cluster, Flux watches the Git repository and reconciles changes.

### Suggested repository structure

```text
deploy/
	base/
		frontend-deployment.yaml
		backend-deployment.yaml
		services.yaml
		ingress.yaml
		kustomization.yaml
	overlays/
		dev/kustomization.yaml
		staging/kustomization.yaml
		prod/kustomization.yaml
```

### GitOps process

1. Keep common configuration in the base manifests.
2. Keep environment-specific image tags, hostnames, replicas, and resources in overlays.
3. Generate an immutable image tag after CI publishes the image.
4. Update the overlay image tag through approved automation or a pull request.
5. Let Flux detect the change and reconcile the cluster.
6. Verify the reconciliation status and rollout result.

## 4. Secrets & Security

### Rules

- Never commit passwords, tokens, registry credentials, or private keys to Git.
- Keep `.env` files local-only and use `.env.example` as a template.
- Store CI secrets in Tekton Secrets, an external secret manager, or a Kubernetes Secret integration.
- Manage production secrets with Sealed Secrets, External Secrets Operator, Vault, or a cloud secret manager.
- Push container images to a trusted registry.
- Add image vulnerability scanning and dependency auditing to CI.
- Run workloads as a non-root user with a read-only filesystem and least-privilege ServiceAccount.
- Apply network policies, resource limits, and pod security standards.

### Required secret categories

- Container registry authentication.
- Git webhook or SSH credentials.
- Flux source authentication, if the repository is private.
- Runtime configuration, if API secrets are added in the future.

### Security checks

```bash
npm audit
git diff --check
```

Make secret scanning and container scanning mandatory status checks in CI.

## 5. CI with Tekton

### CI purpose

Continuous Integration validates the source on every pull request or push. For this project, CI is successful only when tests and production builds pass.

### Tekton resources

- `Task`: reusable steps such as installation, testing, coverage, building, and image building.
- `Pipeline`: an ordered workflow of tasks.
- `PipelineRun`: a pipeline execution for a commit or pull request.
- `TriggerTemplate` and `TriggerBinding`: create a PipelineRun from a Git webhook.
- Workspace: share source code, the npm cache, and reports.

### Suggested pipeline stages

1. Clone the repository.
2. Install Node dependencies.
3. Run frontend and backend tests with `npm test`.
4. Generate coverage reports with `npm run test:coverage`.
5. Validate frontend and backend builds with `npm run build`.
6. Run dependency, secret, and vulnerability scans.
7. Build frontend and backend container images.
8. Push images to the registry with an immutable commit SHA or release tag.
9. Capture the image digest.
10. Create a pull request to update the image digest in the GitOps overlay.

### CI acceptance criteria

- An image is not published when a test fails.
- Deployment manifests are not updated when the build fails.
- Image tags do not depend on the mutable `latest` tag.
- Secrets are not printed in logs.
- The pipeline result is visible as a pull request status.

## 6. CD with Flux

### CD purpose

Continuous Delivery reliably deploys approved GitOps changes to the Kubernetes cluster. Flux continuously reconciles the desired state.

### Flux setup process

1. Install Flux in the cluster.
2. Connect Flux to the GitOps repository.
3. Define the source with a `GitRepository` resource.
4. Define the target path, namespace, and reconciliation interval with a `Kustomization` resource.
5. If image automation is required, configure `ImageRepository`, `ImagePolicy`, and `ImageUpdateAutomation`.
6. Use separate overlays and approval policies for staging and production.

### CD verification

```bash
flux get sources git
flux get kustomizations
kubectl get pods -A
kubectl rollout status deployment/frontend -n <namespace>
kubectl rollout status deployment/backend -n <namespace>
```

If a deployment fails, fix the manifest and commit it to Git, or roll back to the last known-good GitOps commit. Do not treat a manual cluster patch as the permanent solution.

## 7. Kubernetes

### Required resources

- Namespace: isolate environments.
- Deployment: manage frontend and backend replicas.
- Service: route internal traffic.
- ConfigMap: store non-secret configuration.
- Secret: store sensitive values.
- ServiceAccount and RBAC: provide least-privilege access.
- Ingress: route external HTTP/HTTPS traffic.
- HorizontalPodAutoscaler: scale when metrics are available.
- NetworkPolicy: restrict frontend/backend traffic.

### Workload expectations

- The frontend container serves production static assets through NGINX.
- The backend container starts from compiled Node.js output.
- The backend uses `/api/health` for readiness and liveness checks.
- Every container has CPU and memory requests and limits.
- A rolling update strategy and pod disruption settings are defined.
- Logs are written to stdout/stderr.

### Basic checks

```bash
kubectl get namespace
kubectl get deployments,services,ingress -n <namespace>
kubectl describe pod <pod-name> -n <namespace>
kubectl logs deployment/backend -n <namespace>
```

## 8. Kustomize

### Kustomize purpose

Kustomize manages a common base and environment-specific overlays without duplicating YAML.

### Base

- Frontend and backend Deployments.
- Services.
- Common labels/selectors.
- Health probes.
- Security context.
- Common resource defaults.

### Overlay

- Namespace.
- Image name and immutable tag/digest.
- Replica count.
- Hostnames.
- Environment-specific ConfigMap values.
- Resource limits.
- Patch-based settings.

### Validation

```bash
kubectl kustomize deploy/overlays/dev
kubectl apply --dry-run=client -k deploy/overlays/dev
kubectl diff -k deploy/overlays/staging
```

Review the rendered YAML before applying it to the cluster, and validate selectors, namespaces, and image references.

## 9. NGINX

### Frontend NGINX

The frontend image should use a multi-stage build:

1. The Node build stage installs dependencies and runs `npm run build`.
2. The final stage copies the generated `dist` files to the NGINX web root.
3. Configure cache headers for static assets.
4. Configure an `index.html` fallback for SPA routes.
5. Disable unnecessary NGINX version disclosure.

### Kubernetes traffic routing

- Route public frontend traffic from the NGINX Ingress to the frontend Service.
- Route frontend API requests to the backend Service or Ingress route.
- Configure an HTTPS certificate and an HTTP-to-HTTPS redirect.
- Verify the CORS policy against the actual frontend hostname.
- Keep `/api/health` reachable for monitoring and smoke tests.

### NGINX checks

```bash
kubectl get ingress -n <namespace>
curl -I https://<frontend-host>
curl https://<frontend-host>/api/health
```

## 10. CI/CD End-to-End Flow

### Process from implementation to final verification

1. Document DevOps requirements, environment names, and deployment ownership.
2. Configure repository branch protection, CODEOWNERS, and pull request checks.
3. Add reproducible container Dockerfiles for the frontend and backend.
4. Configure `.dockerignore`, a non-root runtime user, and a minimal production image.
5. Build the container images locally and run smoke tests.
6. Write Kubernetes base manifests and dev/staging/prod Kustomize overlays.
7. Configure probes, resources, security settings, Services, and Ingress.
8. Create Tekton Tasks, a Pipeline, and Triggers to automate pull request CI.
9. Enforce tests, coverage, builds, scans, and image publishing in CI.
10. Connect Flux to the GitOps repository and target cluster.
11. Update the staging overlay with the new immutable image digest and verify the deployment.
12. Review and approve the production GitOps pull request after staging tests pass.
13. Verify Flux reconciliation, the Kubernetes rollout, NGINX routing, and API health.
14. Check monitoring and logging alerts.
15. Record the release tag, deployed image digest, Git commit, and rollback instructions.

### Final release checklist

```bash
npm test
npm run test:coverage
npm run build
kubectl kustomize deploy/overlays/prod
kubectl get kustomizations -n flux-system
kubectl get pods,services,ingress -n <namespace>
curl https://<frontend-host>/api/health
```

## 11. Troubleshooting

| Problem | Checks | Typical action |
| --- | --- | --- |
| Problem | Checks | Typical action |
| --- | --- | --- |
| Tekton run fails | PipelineRun logs and failed Task | Verify the command, workspace, and credentials |
| Dependency installation fails | Node version, lockfile, and registry access | Use a pinned Node image and clean installation |
| Tests fail | Frontend/backend test output | Do not merge until the test failure is resolved |
| Image push fails | Registry Secret, repository, and permissions | Verify the Secret reference and ServiceAccount |
| Pod is `Pending` | `kubectl describe pod` events | Check resources, node capacity, and scheduling rules |
| Pod is `CrashLoopBackOff` | Container logs and probe events | Verify the start command, environment values, and health endpoint |
| Image pull fails | `kubectl describe pod` and image name | Correct the registry path, tag/digest, or pull Secret |
| Flux is not reconciling | `flux get sources git`, controller logs | Check the Git revision, path, credentials, and suspend state |
| Ingress returns 404/502 | Ingress, Service, and endpoints | Match the path rules, Service port, and selector |
| CORS error | Browser network output and backend configuration | Verify the allowed frontend origin |
| Deployment is unhealthy | Rollout status and readiness probe | Roll back to the last known-good image and fix the root cause |

### Rollback approach

1. Identify the failed rollout.
2. Restore the last known-good image digest in the GitOps overlay.
3. Follow the pull request review and approval process.
4. Wait for Flux reconciliation to complete.
5. Run pod, probe, API, and frontend smoke tests again.
6. Record the cause and corrective action in the incident notes.

## 12. DevOps Onboarding Checklist

### Repository

- [ ] Understand the repository structure and ownership.
- [ ] Branch protection and the pull request workflow are configured.
- [ ] `.gitignore` covers secrets, dependencies, and generated files.
- [ ] TDD checks and local commands have been verified.

### CI

- [ ] Tekton Pipelines/Tasks are installed.
- [ ] A Git webhook triggers a PipelineRun.
- [ ] `npm test` passes.
- [ ] Coverage and `npm run build` pass.
- [ ] Secret, dependency, and image scans are enabled.
- [ ] Images are published to the registry with an immutable tag/digest.

### Kubernetes and CD

- [ ] Namespace, Deployments, Services, and Ingress are configured.
- [ ] Readiness/liveness probes are configured for `/api/health`.
- [ ] Requests, limits, RBAC, and security context are configured.
- [ ] The Kustomize base and environment overlays render successfully.
- [ ] The Flux source and Kustomization are healthy.
- [ ] The staging rollout has been successfully verified.
- [ ] The production approval and rollback process is documented.

### Final validation

- [ ] The frontend URL loads over HTTPS.
- [ ] The frontend can successfully call the backend API.
- [ ] `/api/health` returns the expected response.
- [ ] There are no blocking errors in the browser console or network tab.
- [ ] Pod logs contain no unexpected errors.
- [ ] Flux and deployment status are healthy.
- [ ] The release commit, image digest, and verification evidence are recorded.
