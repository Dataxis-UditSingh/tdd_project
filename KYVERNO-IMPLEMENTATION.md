# Kyverno Policy Management — Complete Implementation Guide

## 1. Overview

This document describes the complete implementation of **Kyverno Policy Management** in the TDD React TypeScript application's Kubernetes/GitOps environment.

The implementation covers:

- Kyverno installation
- FluxCD integration
- HelmRepository
- HelmRelease
- Kyverno CRDs
- GitOps-based policy management
- Resource validation policy
- Standard-label validation policy
- Privileged-container security policy
- Audit-mode policy validation
- Policy testing
- Kyverno health checks
- Flux reconciliation
- Troubleshooting
- Resource cleanup
- Adding/removing policies
- Switching policies from Audit to Enforce
- Final architecture

---

# 2. What is Kyverno?

Kyverno is a Kubernetes-native policy engine.

It allows the platform team to define rules that Kubernetes resources must follow.

Kyverno can be used to:

- Validate Kubernetes resources
- Mutate Kubernetes resources
- Generate Kubernetes resources
- Verify container images
- Enforce security rules
- Standardize labels
- Enforce resource requests and limits
- Prevent insecure configurations

In this project, Kyverno is being used primarily as a **policy validation and security layer**.

---

# 3. Why Kyverno Was Added

Before Kyverno, Kubernetes resources could be deployed without centralized policy validation.

For example, a Deployment could potentially:

- Have no CPU requests
- Have no memory limits
- Miss standard labels
- Run privileged containers

Kyverno adds a policy layer between Kubernetes resource creation and acceptance.

The conceptual flow is:

```text
Developer
    |
    | Git Push
    v
GitHub
    |
    v
FluxCD
    |
    | Applies Kubernetes manifests
    v
Kubernetes API Server
    |
    | Admission validation
    v
Kyverno
    |
    +--------------------+
    |                    |
    v                    v
Policy Pass          Policy Violation
    |                    |
    v                    v
 Allow                 Audit
                       / Enforce
```

---

# 4. Project Context

The project uses:

- Kubernetes
- Kind
- FluxCD
- Kustomize
- Helm
- KEDA
- Kyverno
- Envoy Gateway
- GitHub
- Docker Hub

Current Kubernetes cluster:

```text
tdd-cicd-control-plane
```

Current project repository:

```text
https://github.com/Dataxis-UditSingh/tdd_project.git
```

The GitOps configuration is stored under:

```text
devops/flux/
```

---

# 5. Final Architecture

The final platform architecture is:

```text
                           GitHub
                             |
                             |
                             v
                        FluxCD
                             |
             +---------------+---------------+
             |               |               |
             v               v               v
       Infrastructure      KEDA           Kyverno
             |               |               |
             |               |               v
             |               |        Kyverno Policies
             |               |
             |               v
             |          Autoscaling
             |
             v
      Kubernetes Cluster
             |
     +-------+--------+
     |                |
     v                v
 Applications     Envoy Gateway
     |
     +-----------------------+
     |                       |
     v                       v
 TDD Frontend           TDD Backend
```

Kyverno specifically sits on the policy/admission side:

```text
                         Kubernetes API
                               |
                               v
                           Kyverno
                               |
          +--------------------+--------------------+
          |                    |                    |
          v                    v                    v
   Resource Policy       Label Policy       Security Policy
          |                    |                    |
          v                    v                    v
     CPU/Memory          app/environment      privileged=false
```

---

# 6. Kyverno + FluxCD Architecture

Kyverno itself is deployed through FluxCD.

The GitOps flow is:

```text
GitHub
   |
   v
Flux GitRepository
   |
   v
Flux Kustomization
   |
   v
HelmRepository
   |
   v
HelmRelease
   |
   v
Kyverno
```

Policies are managed separately:

```text
GitHub
   |
   v
Flux
   |
   v
kyverno-policies
   |
   +-- require-resources.yaml
   +-- require-labels.yaml
   +-- disallow-privileged.yaml
```

This means Kyverno and its policies are not manually maintained in the cluster.

The desired state is stored in Git.

---

# 7. Directory Structure

The Kyverno implementation uses the following structure:

```text
devops/
└── flux/
    ├── kustomization.yaml
    │
    ├── bootstrap/
    │   ├── infrastructure-kustomization.yaml
    │   ├── keda-kustomization.yaml
    │   ├── kyverno-kustomization.yaml
    │   └── applications-kustomization.yaml
    │
    └── infrastructure/
        └── kyverno/
            ├── helmrepository.yaml
            ├── helmrelease.yaml
            ├── kustomization.yaml
            │
            └── policies/
                ├── kustomization.yaml
                ├── require-resources.yaml
                ├── require-labels.yaml
                └── disallow-privileged.yaml
```

---

# 8. Step 1 — Kyverno HelmRepository

File:

```text
devops/flux/infrastructure/kyverno/helmrepository.yaml
```

Content:

```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: HelmRepository
metadata:
  name: kyverno
  namespace: flux-system
spec:
  interval: 1h
  url: https://kyverno.github.io/kyverno/
```

## Purpose

This tells Flux where the Kyverno Helm chart is located.

Flux will periodically check:

```text
https://kyverno.github.io/kyverno/
```

for the chart.

---

# 9. Step 2 — Kyverno HelmRelease

File:

```text
devops/flux/infrastructure/kyverno/helmrelease.yaml
```

Content:

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: kyverno
  namespace: flux-system
spec:
  interval: 10m

  releaseName: kyverno

  targetNamespace: kyverno

  chart:
    spec:
      chart: kyverno
      version: "3.6.2"

      sourceRef:
        kind: HelmRepository
        name: kyverno
        namespace: flux-system

      interval: 1h

  install:
    createNamespace: true
    crds: CreateReplace

  upgrade:
    crds: CreateReplace
```

## Important settings

### Helm chart

```yaml
chart: kyverno
```

### Version

```yaml
version: "3.6.2"
```

### Target namespace

```yaml
targetNamespace: kyverno
```

### Automatic namespace creation

```yaml
createNamespace: true
```

### CRDs

```yaml
crds: CreateReplace
```

This allows the Kyverno CRDs to be installed and replaced during upgrades when required.

---

# 10. Step 3 — Kyverno Kustomization

File:

```text
devops/flux/infrastructure/kyverno/kustomization.yaml
```

Content:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - helmrepository.yaml
  - helmrelease.yaml
  - policies
```

This connects the Helm configuration and policies into one Kustomize package.

---

# 11. Step 4 — Policy Kustomization

File:

```text
devops/flux/infrastructure/kyverno/policies/kustomization.yaml
```

Content:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - require-resources.yaml
  - require-labels.yaml
  - disallow-privileged.yaml
```

This allows all Kyverno policies to be managed together.

---

# 12. Policy 1 — Require CPU and Memory Resources

File:

```text
devops/flux/infrastructure/kyverno/policies/require-resources.yaml
```

Content:

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy

metadata:
  name: require-pod-resources

  annotations:
    policies.kyverno.io/title: Require CPU and Memory Resources
    policies.kyverno.io/category: Best Practices
    policies.kyverno.io/description: Require containers to define CPU and memory requests and limits.

spec:
  validationFailureAction: Audit

  background: true

  rules:
    - name: validate-resources

      match:
        any:
          - resources:
              kinds:
                - Pod

      validate:
        message: "CPU and memory requests and limits are required."

        pattern:
          spec:
            containers:
              - resources:
                  requests:
                    cpu: "?*"
                    memory: "?*"
                  limits:
                    cpu: "?*"
                    memory: "?*"
```

---

# 13. What Policy 1 Does

It checks Pods for:

```yaml
resources:
  requests:
    cpu:
    memory:

  limits:
    cpu:
    memory:
```

A compliant container:

```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi

  limits:
    cpu: 500m
    memory: 256Mi
```

A non-compliant container:

```yaml
containers:
  - name: app
    image: example/app:latest
```

The second example does not specify CPU or memory resources.

Because the policy is currently in `Audit` mode, Kyverno reports the violation instead of blocking the workload.

---

# 14. Policy 2 — Require Standard Labels

File:

```text
devops/flux/infrastructure/kyverno/policies/require-labels.yaml
```

Content:

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy

metadata:
  name: require-standard-labels

  annotations:
    policies.kyverno.io/title: Require Standard Labels
    policies.kyverno.io/category: Best Practices
    policies.kyverno.io/description: Require application and environment labels on Deployments.

spec:
  validationFailureAction: Audit

  background: true

  rules:
    - name: validate-deployment-labels

      match:
        any:
          - resources:
              kinds:
                - Deployment

      validate:
        message: "Deployments must have app and environment labels."

        pattern:
          metadata:
            labels:
              app: "?*"
              environment: "?*"
```

---

# 15. What Policy 2 Does

A compliant Deployment:

```yaml
metadata:
  labels:
    app: tdd-backend
    environment: production
```

A Deployment without these labels produces a Kyverno policy violation.

The purpose is to standardize application metadata.

---

# 16. Policy 3 — Disallow Privileged Containers

File:

```text
devops/flux/infrastructure/kyverno/policies/disallow-privileged.yaml
```

Content:

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy

metadata:
  name: disallow-privileged-containers

  annotations:
    policies.kyverno.io/title: Disallow Privileged Containers
    policies.kyverno.io/category: Pod Security
    policies.kyverno.io/description: Prevent containers from running in privileged mode.

spec:
  validationFailureAction: Audit

  background: true

  rules:
    - name: validate-privileged

      match:
        any:
          - resources:
              kinds:
                - Pod

      validate:
        message: "Privileged containers are not allowed."

        pattern:
          spec:
            containers:
              - securityContext:
                  privileged: "false"
```

---

# 17. What Policy 3 Does

It checks for privileged containers.

Unsafe example:

```yaml
securityContext:
  privileged: true
```

Compliant example:

```yaml
securityContext:
  privileged: false
```

The goal is to prevent workloads from using privileged container execution.

---

# 18. Step 5 — Flux Bootstrap Kustomization

File:

```text
devops/flux/bootstrap/kyverno-kustomization.yaml
```

Content:

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization

metadata:
  name: kyverno
  namespace: flux-system

spec:
  interval: 1m

  path: ./devops/flux/infrastructure/kyverno

  prune: true

  sourceRef:
    kind: GitRepository
    name: tdd-project

  wait: true
```

---

# 19. What This Flux Kustomization Does

Flux watches:

```text
./devops/flux/infrastructure/kyverno
```

from the GitRepository:

```text
tdd-project
```

When Git changes, Flux reconciles the desired state.

The important settings are:

```yaml
prune: true
```

and:

```yaml
wait: true
```

`prune: true` means resources removed from the Git-managed configuration can also be removed from the cluster during reconciliation.

`wait: true` makes Flux wait for resources to become ready where applicable.

---

# 20. Root Flux Kustomization

The root file:

```text
devops/flux/kustomization.yaml
```

contains:

```yaml
resources:
  - bootstrap/infrastructure-kustomization.yaml
  - bootstrap/keda-kustomization.yaml
  - bootstrap/kyverno-kustomization.yaml
  - bootstrap/applications-kustomization.yaml
```

This makes Kyverno part of the overall GitOps configuration.

---

# 21. GitOps Deployment Flow

After the implementation, the deployment process is:

```text
Developer
    |
    | git push
    v
GitHub main
    |
    v
Flux GitRepository
    |
    v
Flux Kustomization
    |
    +-----------------------+
    |                       |
    v                       v
Kyverno HelmRelease    Kyverno Policies
    |                       |
    v                       v
Kyverno                 ClusterPolicies
```

The cluster continuously reconciles toward Git state.

---

# 22. Initial Deployment

The initial implementation was validated locally before allowing Flux to deploy it.

First render the Kustomize configuration:

```bash
kubectl kustomize devops/flux/infrastructure/kyverno
```

This verifies that all referenced resources can be rendered.

The expected resources include:

```text
HelmRepository
HelmRelease
ClusterPolicy
ClusterPolicy
ClusterPolicy
```

---

# 23. Git Commit

The Kyverno implementation was committed to Git.

Example:

```bash
git add devops/flux
git commit -m "feat: add Kyverno policy management"
git push origin main
```

The implementation was then picked up by Flux.

---

# 24. Verify Flux GitRepository

Check:

```bash
kubectl get gitrepository -n flux-system
```

Expected:

```text
tdd-project
```

You can also reconcile it manually:

```bash
flux reconcile source git tdd-project -n flux-system
```

---

# 25. Verify Kyverno HelmRepository

Run:

```bash
kubectl get helmrepository -n flux-system
```

Expected:

```text
kyverno
```

Detailed check:

```bash
kubectl describe helmrepository kyverno -n flux-system
```

---

# 26. Verify Kyverno HelmRelease

Run:

```bash
kubectl get helmrelease kyverno -n flux-system
```

Healthy result:

```text
NAME      READY
kyverno   True
```

A successful status looks like:

```text
Helm upgrade succeeded for release kyverno/kyverno.v2
with chart kyverno@3.6.2
```

---

# 27. Verify Kyverno Namespace

Run:

```bash
kubectl get namespace kyverno
```

Expected:

```text
kyverno
```

---

# 28. Verify Kyverno Pods

Run:

```bash
kubectl get pods -n kyverno
```

The current implementation has four Kyverno controller pods:

```text
kyverno-admission-controller
kyverno-background-controller
kyverno-cleanup-controller
kyverno-reports-controller
```

All should be:

```text
1/1 Running
```

---

# 29. Verify Kyverno Deployments

Run:

```bash
kubectl get deployments -n kyverno
```

Expected deployments:

```text
kyverno-admission-controller
kyverno-background-controller
kyverno-cleanup-controller
kyverno-reports-controller
```

---

# 30. Verify Admission Controller

Run:

```bash
kubectl get deployment kyverno-admission-controller -n kyverno
```

The healthy state observed during implementation was:

```text
READY   UP-TO-DATE   AVAILABLE
1/1     1            1
```

This confirmed that the admission controller was fully available.

---

# 31. Verify Kyverno Services

Run:

```bash
kubectl get svc -n kyverno
```

You should see services such as:

```text
kyverno-svc
kyverno-svc-metrics
kyverno-background-controller-metrics
kyverno-cleanup-controller
kyverno-cleanup-controller-metrics
kyverno-reports-controller-metrics
```

---

# 32. Verify Kyverno CRDs

Run:

```bash
kubectl get crd | grep kyverno
```

Kyverno installs multiple CRDs required for:

- ClusterPolicy
- Policy
- PolicyException
- Reports
- UpdateRequests
- Other Kyverno functionality

---

# 33. Verify Policies

Run:

```bash
kubectl get clusterpolicy
```

Expected policies:

```text
require-pod-resources
require-standard-labels
disallow-privileged-containers
```

Detailed check:

```bash
kubectl describe clusterpolicy require-pod-resources
```

```bash
kubectl describe clusterpolicy require-standard-labels
```

```bash
kubectl describe clusterpolicy disallow-privileged-containers
```

---

# 34. Verify Policy Status

Run:

```bash
kubectl get clusterpolicy
```

This gives a quick view of the policy resources.

For detailed policy information:

```bash
kubectl get clusterpolicy require-pod-resources -o yaml
```

Repeat for the other policies.

---

# 35. Verify Flux Kustomizations

Run:

```bash
kubectl get kustomization -n flux-system
```

The final healthy state achieved in the implementation was:

```text
NAME                 READY
keda                 True
kyverno              True
kyverno-policies     True
tdd-applications     True
tdd-infrastructure   True
tdd-project          True
```

This confirms the complete Flux chain is healthy.

---

# 36. Final Flux Reconciliation

Manual reconciliation can be performed with:

```bash
flux reconcile kustomization kyverno -n flux-system
```

Then:

```bash
flux reconcile kustomization kyverno-policies -n flux-system
```

Finally:

```bash
flux reconcile kustomization tdd-project -n flux-system --with-source
```

A successful result looks like:

```text
✔ applied revision main@sha1:<commit>
```

---

# 37. Incident During Implementation

During the initial Kyverno deployment, the HelmRelease reported:

```text
Helm install failed for release kyverno/kyverno
timeout waiting for:
Deployment/kyverno/kyverno-admission-controller
status: 'InProgress'
```

At that point the Deployment later showed:

```text
READY   UP-TO-DATE   AVAILABLE
1/1     1            1
```

The Kyverno pods were also running.

The underlying issue was temporary resource/API pressure in the local Kubernetes environment.

The Kind control-plane container was under significant resource pressure, while other local containers such as:

```text
nestedpipeline
minikube
```

were also consuming resources.

---

# 38. Resource Pressure Resolution

The unnecessary resource-consuming containers were stopped:

```bash
docker stop nestedpipeline minikube
```

After this, the Kubernetes API health check succeeded:

```bash
kubectl get --raw='/readyz?verbose'
```

The Kubernetes API returned:

```text
readyz check passed
```

Metrics also became available again:

```bash
kubectl top nodes
```

The Kind control-plane resource usage was significantly lower.

---

# 39. Kyverno Recovery

The original HelmRelease had entered a stalled state:

```text
Stalled: True
Ready: False
RetriesExceeded
```

The successful recovery command was:

```bash
flux reconcile helmrelease kyverno -n flux-system --force
```

The result:

```text
✔ applied revision 3.6.2
```

The final HelmRelease state became:

```text
kyverno   True
```

with:

```text
Helm upgrade succeeded for release kyverno/kyverno.v2
with chart kyverno@3.6.2
```

This confirmed that the Kyverno installation itself was healthy.

---

# 40. Why `--force` Was Used

The original Helm installation had already failed and Flux had marked the release as stalled.

The cluster resources were healthy by that time, but Flux/Helm still had the previous failed release state.

The command:

```bash
flux reconcile helmrelease kyverno -n flux-system --force
```

forced a fresh reconciliation of the HelmRelease.

This successfully changed the release from the previous failed installation state to a successful Helm upgrade/reconciliation.

---

# 41. Policy Mode — Audit

All three policies currently use:

```yaml
validationFailureAction: Audit
```

This is intentional.

Audit mode means:

```text
Resource
   |
   v
Kyverno
   |
   +-- Pass ------> Allowed
   |
   +-- Violation -> Audit/Report
                     |
                     v
                 Resource can continue
```

This allows the platform team to observe violations before enforcing them.

---

# 42. Audit vs Enforce

## Audit

```yaml
validationFailureAction: Audit
```

Behavior:

```text
Violation
   |
   v
Report
   |
   v
Deployment continues
```

## Enforce

```yaml
validationFailureAction: Enforce
```

Behavior:

```text
Violation
   |
   v
Request rejected
   |
   v
Deployment blocked
```

---

# 43. Why Audit Was Used Initially

Audit mode provides a safer rollout.

Before enabling enforcement, existing applications can be checked for policy violations.

Recommended progression:

```text
Phase 1
Audit
  |
  v
Observe violations
  |
  v
Fix applications
  |
  v
Validate compliance
  |
  v
Phase 2
Enforce
```

---

# 44. How to Check Kyverno Reports

Depending on the Kyverno report resources available in the cluster, inspect:

```bash
kubectl get policyreports -A
```

and:

```bash
kubectl get clusterpolicyreports
```

Detailed information:

```bash
kubectl get clusterpolicyreports -o yaml
```

These reports can show policy results and violations.

---

# 45. How to Check Specific Policy

For example:

```bash
kubectl get clusterpolicy require-pod-resources -o yaml
```

Check:

```yaml
spec:
  validationFailureAction: Audit
```

Similarly:

```bash
kubectl get clusterpolicy require-standard-labels -o yaml
```

and:

```bash
kubectl get clusterpolicy disallow-privileged-containers -o yaml
```

---

# 46. Testing Policy 1

Create a temporary invalid Deployment.

Example:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kyverno-test-no-resources
spec:
  replicas: 1

  selector:
    matchLabels:
      app: kyverno-test

  template:
    metadata:
      labels:
        app: kyverno-test

    spec:
      containers:
        - name: nginx
          image: nginx:latest
```

Apply:

```bash
kubectl apply -f kyverno-test-no-resources.yaml
```

Because the policy is in Audit mode, the Deployment may still be created.

Check:

```bash
kubectl get deployment kyverno-test-no-resources
```

Then inspect reports:

```bash
kubectl get policyreports -A
```

or:

```bash
kubectl get clusterpolicyreports
```

---

# 47. Testing Policy 2

Create a Deployment without:

```yaml
app:
environment:
```

For example:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kyverno-test-labels

spec:
  replicas: 1

  selector:
    matchLabels:
      app: kyverno-test-labels

  template:
    metadata:
      labels:
        app: kyverno-test-labels

    spec:
      containers:
        - name: nginx
          image: nginx:latest
```

Apply:

```bash
kubectl apply -f kyverno-test-labels.yaml
```

Check the resulting policy report.

---

# 48. Testing Policy 3

Create a test Pod with:

```yaml
securityContext:
  privileged: true
```

Example:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: kyverno-test-privileged

spec:
  containers:
    - name: nginx
      image: nginx:latest

      securityContext:
        privileged: true
```

Apply:

```bash
kubectl apply -f kyverno-test-privileged.yaml
```

Because the policy is currently Audit:

```text
Policy violation
       |
       v
Audit
       |
       v
Pod may still be admitted
```

Check the policy report.

---

# 49. Cleanup Test Resources

After testing:

```bash
kubectl delete deployment kyverno-test-no-resources
```

```bash
kubectl delete deployment kyverno-test-labels
```

```bash
kubectl delete pod kyverno-test-privileged
```

---

# 50. Switching a Policy to Enforce

Once you are confident that workloads comply, change:

```yaml
validationFailureAction: Audit
```

to:

```yaml
validationFailureAction: Enforce
```

Example:

```yaml
spec:
  validationFailureAction: Enforce
```

Commit:

```bash
git add devops/flux/infrastructure/kyverno/policies
git commit -m "chore: enforce Kyverno policies"
git push origin main
```

Then reconcile:

```bash
flux reconcile kustomization kyverno-policies -n flux-system
```

Verify:

```bash
kubectl get clusterpolicy
```

---

# 51. Testing Enforce Mode

With:

```yaml
validationFailureAction: Enforce
```

try applying an invalid resource.

For example, a Deployment without resources.

```bash
kubectl apply -f invalid-deployment.yaml
```

Kyverno should reject the admission request.

The important difference is:

```text
Audit:

Invalid resource
      |
      v
Kyverno
      |
      v
Violation recorded
      |
      v
Resource allowed


Enforce:

Invalid resource
      |
      v
Kyverno
      |
      v
Violation
      |
      v
Resource rejected
```

---

# 52. How to Add a New Policy

Create a new file:

```text
devops/flux/infrastructure/kyverno/policies/my-policy.yaml
```

Example:

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy

metadata:
  name: my-policy

spec:
  validationFailureAction: Audit

  background: true

  rules:
    - name: my-rule

      match:
        any:
          - resources:
              kinds:
                - Pod

      validate:
        message: "Policy violation."

        pattern:
          spec:
            containers:
              - name: "?*"
```

Then add it to:

```text
devops/flux/infrastructure/kyverno/policies/kustomization.yaml
```

Example:

```yaml
resources:
  - require-resources.yaml
  - require-labels.yaml
  - disallow-privileged.yaml
  - my-policy.yaml
```

Validate locally:

```bash
kubectl kustomize devops/flux/infrastructure/kyverno
```

Then:

```bash
git add devops/flux/infrastructure/kyverno
git commit -m "feat: add Kyverno policy"
git push origin main
```

Reconcile:

```bash
flux reconcile kustomization kyverno-policies -n flux-system
```

Verify:

```bash
kubectl get clusterpolicy
```

---

# 53. How to Remove a Policy

Remove the policy from:

```text
policies/kustomization.yaml
```

For example, remove:

```yaml
- my-policy.yaml
```

Then remove the file from Git.

Commit:

```bash
git add -A
git commit -m "chore: remove Kyverno policy"
git push origin main
```

Because the Flux Kustomization uses:

```yaml
prune: true
```

the resource removed from the desired Git state can be pruned from the cluster during reconciliation.

Then verify:

```bash
flux reconcile kustomization kyverno-policies -n flux-system
```

and:

```bash
kubectl get clusterpolicy
```

---

# 54. How to Modify a Policy

Edit the relevant YAML file.

For example:

```text
require-resources.yaml
```

Change the desired policy configuration.

Then:

```bash
kubectl kustomize devops/flux/infrastructure/kyverno
```

If rendering succeeds:

```bash
git add devops/flux/infrastructure/kyverno
git commit -m "chore: update Kyverno policy"
git push origin main
```

Then:

```bash
flux reconcile kustomization kyverno-policies -n flux-system
```

---

# 55. How to Upgrade Kyverno

The Kyverno chart version is defined in:

```text
devops/flux/infrastructure/kyverno/helmrelease.yaml
```

Current version:

```yaml
version: "3.6.2"
```

To upgrade:

```yaml
version: "<new-version>"
```

Then:

```bash
git add devops/flux/infrastructure/kyverno/helmrelease.yaml
git commit -m "chore: upgrade Kyverno"
git push origin main
```

Reconcile:

```bash
flux reconcile helmrelease kyverno -n flux-system
```

Check:

```bash
kubectl get helmrelease kyverno -n flux-system
```

Then:

```bash
kubectl get pods -n kyverno
```

---

# 56. How to Check Kyverno Logs

Admission controller:

```bash
kubectl logs -n kyverno deployment/kyverno-admission-controller
```

Background controller:

```bash
kubectl logs -n kyverno deployment/kyverno-background-controller
```

Cleanup controller:

```bash
kubectl logs -n kyverno deployment/kyverno-cleanup-controller
```

Reports controller:

```bash
kubectl logs -n kyverno deployment/kyverno-reports-controller
```

Follow logs:

```bash
kubectl logs -f -n kyverno deployment/kyverno-admission-controller
```

---

# 57. How to Check All Kyverno Resources

```bash
kubectl get all -n kyverno
```

Policies:

```bash
kubectl get clusterpolicy
```

CRDs:

```bash
kubectl get crd | grep kyverno
```

Reports:

```bash
kubectl get policyreports -A
```

Cluster reports:

```bash
kubectl get clusterpolicyreports
```

HelmRelease:

```bash
kubectl get helmrelease kyverno -n flux-system
```

Flux Kustomization:

```bash
kubectl get kustomization kyverno -n flux-system
```

---

# 58. Complete Health Check

A complete Kyverno health check can be performed with:

```bash
kubectl get pods -n kyverno
```

```bash
kubectl get deployments -n kyverno
```

```bash
kubectl get svc -n kyverno
```

```bash
kubectl get clusterpolicy
```

```bash
kubectl get helmrelease kyverno -n flux-system
```

```bash
kubectl get kustomization kyverno -n flux-system
```

```bash
kubectl get kustomization kyverno-policies -n flux-system
```

```bash
kubectl get kustomization tdd-project -n flux-system
```

Healthy final state:

```text
Kyverno pods                    1/1 Running
Kyverno deployments             Available
HelmRelease                     True
Kyverno Kustomization           True
Kyverno Policies Kustomization  True
TDD Project                     True
```

---

# 59. Complete Flux Health Check

Run:

```bash
kubectl get kustomization -n flux-system
```

The expected final state for this project is:

```text
NAME                 READY
keda                 True
kyverno              True
kyverno-policies     True
tdd-applications     True
tdd-infrastructure   True
tdd-project          True
```

This means the entire GitOps chain is reconciled.

---

# 60. Troubleshooting — HelmRelease False

If:

```bash
kubectl get helmrelease kyverno -n flux-system
```

shows:

```text
READY False
```

check:

```bash
kubectl describe helmrelease kyverno -n flux-system
```

Then:

```bash
kubectl get pods -n kyverno
```

Then:

```bash
kubectl get deployment kyverno-admission-controller -n kyverno
```

If the Deployment is healthy:

```text
1/1 Available
```

try:

```bash
flux reconcile helmrelease kyverno -n flux-system --force
```

Then:

```bash
kubectl get helmrelease kyverno -n flux-system
```

---

# 61. Troubleshooting — Kyverno Pod Not Running

Run:

```bash
kubectl get pods -n kyverno
```

Then:

```bash
kubectl describe pod <pod-name> -n kyverno
```

Check logs:

```bash
kubectl logs <pod-name> -n kyverno
```

Also check:

```bash
kubectl get events -n kyverno --sort-by=.lastTimestamp
```

---

# 62. Troubleshooting — Kubernetes API Problems

Check:

```bash
kubectl get --raw='/readyz?verbose'
```

The final result should contain:

```text
readyz check passed
```

If the local cluster is overloaded, inspect Docker:

```bash
docker stats --no-stream
```

Also:

```bash
kubectl top nodes
```

and:

```bash
kubectl top pods -A
```

---

# 63. Important Local Development Consideration

This project runs Kubernetes locally using Kind.

Therefore, other heavy local containers can affect Kubernetes performance.

During the original Kyverno installation problem, resource pressure affected:

```text
Kubernetes API
etcd
Helm reconciliation
Kyverno controller communication
```

This resulted in Helm timing out while waiting for the Kyverno admission controller.

Therefore, before troubleshooting Kyverno configuration, always check cluster health.

---

# 64. Recommended Troubleshooting Order

If Kyverno fails:

```text
1. Check Kubernetes API
       |
       v
2. Check node resources
       |
       v
3. Check Kyverno pods
       |
       v
4. Check Kyverno Deployment
       |
       v
5. Check HelmRelease
       |
       v
6. Check Flux Kustomization
       |
       v
7. Check policy resources
       |
       v
8. Check policy reports
```

Commands:

```bash
kubectl get --raw='/readyz?verbose'
```

```bash
kubectl top nodes
```

```bash
kubectl get pods -n kyverno
```

```bash
kubectl get deployment -n kyverno
```

```bash
kubectl get helmrelease kyverno -n flux-system
```

```bash
kubectl get kustomization -n flux-system
```

```bash
kubectl get clusterpolicy
```

---

# 65. How to Completely Remove Kyverno from GitOps

If Kyverno must be removed completely, first remove:

```text
bootstrap/kyverno-kustomization.yaml
```

from:

```text
devops/flux/kustomization.yaml
```

Remove:

```yaml
- bootstrap/kyverno-kustomization.yaml
```

Then remove the Kyverno infrastructure directory:

```text
devops/flux/infrastructure/kyverno/
```

Commit:

```bash
git add -A
git commit -m "chore: remove Kyverno"
git push origin main
```

Then reconcile the root:

```bash
flux reconcile kustomization tdd-project -n flux-system --with-source
```

However, Kyverno CRDs and generated resources should be reviewed before a complete removal.

Do not blindly delete CRDs if historical policy reports or other Kyverno resources need to be preserved.

---

# 66. How to Temporarily Disable a Policy

The safest GitOps approach is to remove it from:

```text
policies/kustomization.yaml
```

For example:

```yaml
resources:
  - require-resources.yaml
  - require-labels.yaml
```

Remove:

```yaml
- disallow-privileged.yaml
```

Then commit and push.

Flux will reconcile the desired state.

---

# 67. How to Disable Enforcement Without Removing a Policy

If a policy is in:

```yaml
validationFailureAction: Enforce
```

and you want to temporarily make it non-blocking:

```yaml
validationFailureAction: Audit
```

Then commit and push.

This keeps the policy installed while changing its behavior from:

```text
Block
```

to:

```text
Report
```

---

# 68. Current Policy Configuration

The current implementation uses:

```text
Policy 1:
require-pod-resources
Mode: Audit

Policy 2:
require-standard-labels
Mode: Audit

Policy 3:
disallow-privileged-containers
Mode: Audit
```

Therefore:

```text
Kyverno = Active
Policies = Active
Enforcement = Audit
```

---

# 69. Why Kyverno and KEDA Are Different

KEDA and Kyverno solve different problems.

### KEDA

KEDA answers:

> When should the application scale?

Example:

```text
CPU > threshold
      |
      v
Increase replicas
```

### Kyverno

Kyverno answers:

> Is this Kubernetes resource compliant with platform policy?

Example:

```text
Privileged container
      |
      v
Kyverno
      |
      v
Policy violation
```

Therefore:

```text
KEDA    = Runtime scaling
Kyverno = Policy/security governance
```

They complement each other.

---

# 70. Kyverno and Envoy Gateway

Envoy Gateway handles traffic routing:

```text
User
 |
 v
Envoy Gateway
 |
 +----> Frontend
 |
 +----> Backend
```

Kyverno handles Kubernetes resource governance:

```text
Kubernetes Resource
 |
 v
Kyverno
 |
 v
Policy validation
```

Therefore they operate at different layers.

---

# 71. Complete Platform Architecture

The current project architecture can be represented as:

```text
                              GitHub
                                |
                                v
                             FluxCD
                                |
              +-----------------+------------------+
              |                 |                  |
              v                 v                  v
        Infrastructure         KEDA             Kyverno
              |                 |                  |
              |                 |           +------+------+
              |                 |           |      |      |
              |                 |           v      v      v
              |                 |       Resource Labels Security
              |                 |
              |                 v
              |            Autoscaling
              |
              v
       Kubernetes / Kind
              |
       +------+-------+
       |              |
       v              v
 Envoy Gateway    Applications
                     |
             +-------+-------+
             |               |
             v               v
         Frontend         Backend
```

---

# 72. Final GitOps Dependency Model

Current Flux resources:

```text
tdd-project
    |
    +-- tdd-infrastructure
    |
    +-- keda
    |
    +-- kyverno
    |      |
    |      +-- HelmRelease
    |      |
    |      +-- Kyverno Controllers
    |
    +-- kyverno-policies
    |      |
    |      +-- require-pod-resources
    |      +-- require-standard-labels
    |      +-- disallow-privileged-containers
    |
    +-- tdd-applications
```

All are currently:

```text
READY=True
```

---

# 73. Current Final Status

The completed implementation currently has:

```text
Kubernetes
    |
    +-- Envoy Gateway             ✅
    |
    +-- FluxCD                    ✅
    |
    +-- KEDA                      ✅
    |
    +-- Kyverno                   ✅
         |
         +-- HelmRelease          ✅
         +-- Controllers          ✅
         +-- CRDs                 ✅
         +-- Policies             ✅
         +-- Audit mode           ✅
```

Flux status:

```text
keda                 True
kyverno              True
kyverno-policies     True
tdd-applications     True
tdd-infrastructure   True
tdd-project          True
```

---

# 74. Implementation Completion Checklist

## Installation

- [x] Kyverno HelmRepository created
- [x] Kyverno HelmRelease created
- [x] Kyverno namespace created
- [x] Kyverno CRDs installed
- [x] Kyverno controllers running

## GitOps

- [x] Flux integration
- [x] Flux Kustomization
- [x] GitHub source
- [x] Automatic reconciliation
- [x] Pruning enabled

## Policies

- [x] CPU/memory resource policy
- [x] Standard label policy
- [x] Privileged-container policy
- [x] Policy Kustomization

## Testing

- [x] Kustomize rendering
- [x] HelmRelease validation
- [x] Kyverno pod health check
- [x] Kyverno Deployment health check
- [x] Flux reconciliation
- [x] Policy resources verification
- [x] Kubernetes API health verification
- [x] Resource pressure troubleshooting
- [x] Recovery through Flux reconciliation

## Current Mode

- [x] Policies deployed
- [x] Policies active
- [x] Policies currently in Audit mode
- [ ] Enforcement mode — optional future hardening

---

# 75. Useful Command Cheat Sheet

## Kyverno

```bash
kubectl get pods -n kyverno
```

```bash
kubectl get deployment -n kyverno
```

```bash
kubectl get svc -n kyverno
```

```bash
kubectl get clusterpolicy
```

```bash
kubectl get crd | grep kyverno
```

```bash
kubectl get policyreports -A
```

```bash
kubectl get clusterpolicyreports
```

---

## Helm

```bash
kubectl get helmrelease kyverno -n flux-system
```

```bash
kubectl describe helmrelease kyverno -n flux-system
```

```bash
flux reconcile helmrelease kyverno -n flux-system
```

If the release is stalled after a previous failed attempt:

```bash
flux reconcile helmrelease kyverno -n flux-system --force
```

---

## Flux

```bash
kubectl get kustomization -n flux-system
```

```bash
flux reconcile kustomization kyverno -n flux-system
```

```bash
flux reconcile kustomization kyverno-policies -n flux-system
```

```bash
flux reconcile kustomization tdd-project -n flux-system --with-source
```

---

## Kubernetes Health

```bash
kubectl get --raw='/readyz?verbose'
```

```bash
kubectl top nodes
```

```bash
kubectl top pods -A
```

---

## Logs

```bash
kubectl logs -n kyverno deployment/kyverno-admission-controller
```

```bash
kubectl logs -n kyverno deployment/kyverno-background-controller
```

```bash
kubectl logs -n kyverno deployment/kyverno-reports-controller
```

---

# 76. Final Conclusion

Kyverno has been fully integrated into the project's GitOps architecture.

The final implementation provides a Kubernetes-native policy layer that is:

- Git-managed
- Flux-managed
- Helm-managed
- Kubernetes-native
- Auditable
- Extendable
- Suitable for future enforcement

The current policy lifecycle is:

```text
GitHub
   |
   v
FluxCD
   |
   v
Kyverno
   |
   v
ClusterPolicy
   |
   v
Kubernetes Admission
   |
   +---- Compliant ------> Allow
   |
   +---- Violation ------> Audit
```

The project currently uses **Audit mode** intentionally.

The next optional hardening stage is:

```text
Audit
  |
  v
Observe violations
  |
  v
Fix workloads
  |
  v
Verify compliance
  |
  v
Enforce
```

The Kyverno implementation itself is complete and successfully reconciled through FluxCD.

Final verified state:

```text
KEDA                 True
Kyverno              True
Kyverno Policies     True
TDD Applications     True
TDD Infrastructure   True
TDD Project          True
```

Therefore the complete Kyverno implementation is considered **successfully deployed, GitOps-managed, policy-configured, tested, and operational**.