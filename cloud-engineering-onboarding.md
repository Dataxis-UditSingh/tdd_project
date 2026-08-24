# Cloud Engineering Onboarding: TDD React TypeScript App

This document explains how cloud infrastructure would be designed, implemented, deployed, operated, and verified for this project. It is documentation only; no cloud or application resources are being created.

The application contains a React/TypeScript/Vite frontend, a Node.js/Express/TypeScript backend, Vitest tests, React Testing Library, Supertest, REST endpoints, and in-memory data with no database.

## 1. Introduction & Cloud Engineering Overview

Cloud engineering should provide reproducible infrastructure, secure environment isolation, reliable deployment, automatic scaling, observability, controlled cost, and documented recovery procedures.

### Target architecture

```text
Users -> DNS -> Load Balancer -> NGINX Ingress
                                      |
                         +------------+------------+
                         v                         v
                   Frontend Service          Backend Service
                   React static files        Express API
                                      |
                              Kubernetes Cluster
                                      |
                       Terraform-managed cloud resources
```

### Implementation lifecycle

1. Define availability, security, scaling, cost, and recovery requirements.
2. Select the cloud region, Kubernetes service, registry, DNS provider, and secret manager.
3. Design network, identity, compute, and observability boundaries.
4. Provision infrastructure with Terraform.
5. Configure Kubernetes and Karpenter.
6. Package the frontend and backend with Helm.
7. Deploy to `dev`, `staging`, and `prod`.
8. Run functional, security, performance, and resilience checks.
9. Monitor the system and document ownership.

## 2. Kubernetes Fundamentals

Understand clusters, namespaces, pods, Deployments, Services, Ingress, ConfigMaps, Secrets, ServiceAccounts, RBAC, labels, selectors, probes, resource requests, and resource limits.

### Cluster setup

1. Create the cloud account/project boundary and billing alerts.
2. Create the managed Kubernetes cluster in the selected region.
3. Configure private worker networking, authentication, and access control.
4. Install an ingress controller, metrics server, logging, and monitoring.
5. Create environment namespaces and default resource policies.
6. Apply Pod Security standards, NetworkPolicies, and RBAC.
7. Verify nodes, system pods, DNS, metrics, and ingress readiness.

```bash
kubectl cluster-info
kubectl get nodes
kubectl get pods -A
kubectl get namespaces
kubectl get storageclass
```

## 3. Kubernetes Application Deployment

Create separate production images:

- Build the Vite frontend in a Node.js stage and serve `dist` with NGINX.
- Compile the backend TypeScript and run the generated Node.js server.
- Pin Node.js and NGINX versions.
- Use a non-root runtime user and minimal runtime images.
- Add `.dockerignore` files for dependencies, coverage, local files, and secrets.
- Log to stdout/stderr and use immutable Git SHA or release image tags.

Implement frontend and backend Deployments and Services, ConfigMaps, Secret references, probes, resource limits, rolling updates, pod disruption settings, Ingress, TLS, ServiceAccounts, RBAC, and NetworkPolicies.

Use `/api/health` for backend readiness and liveness checks. Validate before rollout:

```bash
kubectl apply --dry-run=server -f deploy/
kubectl get deployments,services,ingress -n <namespace>
kubectl rollout status deployment/frontend -n <namespace>
kubectl rollout status deployment/backend -n <namespace>
kubectl get events -n <namespace> --sort-by=.lastTimestamp
```

## 4. Helm

Helm packages Kubernetes resources so the same application can be configured for multiple environments without duplicating manifests.

```text
charts/tdd-challenge-app/
  Chart.yaml
  values.yaml
  values-dev.yaml
  values-staging.yaml
  values-prod.yaml
  templates/
    frontend-deployment.yaml
    backend-deployment.yaml
    services.yaml
    ingress.yaml
    configmap.yaml
```

Implementation process:

1. Create a chart with clear application and chart versions.
2. Template images, immutable tags, replicas, resources, ports, probes, and hosts.
3. Keep safe defaults in `values.yaml`.
4. Store environment-specific values separately.
5. Do not place plaintext secrets in chart values.
6. Add linting and template rendering to CI.
7. Install into a temporary namespace before staging promotion.

```bash
helm lint charts/tdd-challenge-app
helm template tdd-challenge-app charts/tdd-challenge-app -f charts/tdd-challenge-app/values-dev.yaml
helm upgrade --install tdd-challenge-app charts/tdd-challenge-app \
  --namespace <namespace> --create-namespace \
  -f charts/tdd-challenge-app/values-dev.yaml --dry-run
```

## 5. Terraform

Terraform should manage cloud resources, while Helm and Kubernetes manage application deployment. Terraform may manage the VPC, subnets, routing, NAT, security groups, managed Kubernetes cluster, IAM, workload identity, container registry, DNS, TLS certificates, monitoring, logging, billing alerts, and Karpenter prerequisites.

```text
infrastructure/terraform/
  modules/
    network/
    kubernetes/
    registry/
    observability/
  environments/
    dev/
    staging/
    prod/
```

Implementation process:

1. Configure remote encrypted state with locking.
2. Pin Terraform and provider versions.
3. Define variables, outputs, tags, naming, and ownership standards.
4. Create reusable modules and isolate environment state.
5. Run formatting, validation, planning, and security scans in CI.
6. Review plans through pull requests.
7. Apply only after approval with controlled credentials.
8. Record the commit, Terraform version, outputs, and result.

```bash
terraform fmt -check -recursive
terraform init
terraform validate
terraform plan -var-file=environments/dev/dev.tfvars
terraform apply -var-file=environments/dev/dev.tfvars
```

Never commit `.tfstate`, credentials, private keys, or secret values.

## 6. Karpenter

Karpenter provisions right-sized Kubernetes nodes when pods cannot be scheduled. It should be introduced after the cluster and workload resource requests are defined.

Implementation process:

1. Provision IAM roles, instance profiles, subnets, and security groups with Terraform.
2. Install Karpenter with its supported Helm chart.
3. Define a `NodePool` with approved zones, architectures, capacity types, instance families, and limits.
4. Define the provider-specific `NodeClass` or node configuration.
5. Configure disruption and consolidation safeguards.
6. Test scale-out in development before production consolidation.
7. Monitor provisioning time, utilization, evictions, scheduling failures, and cost.

Use taints/tolerations, priority classes, disruption budgets, aggregate CPU/memory limits, and an emergency pause procedure where appropriate.

```bash
kubectl get nodepools
kubectl get nodeclaims
kubectl describe nodeclaim <nodeclaim-name>
kubectl get pods -A -o wide
```

## 7. NGINX

Use a multi-stage frontend image:

1. Install dependencies and run `npm run build` in the Node.js stage.
2. Copy `dist` into the NGINX runtime image.
3. Configure SPA fallback to `index.html`.
4. Configure cache headers for versioned assets.
5. Add compatible security headers.
6. Disable unnecessary server version disclosure.

Route the public frontend hostname to the frontend Service and `/api` to the backend Service. Configure TLS, HTTP-to-HTTPS redirect, request limits, timeouts, rate limits, and restricted CORS origins.

```bash
kubectl get ingress -n <namespace>
curl -I https://<frontend-host>
curl https://<frontend-host>/api/health
```

## 8. Networking

Design the cloud network with public subnets only for load balancers, private subnets for nodes and internal services, controlled outbound NAT, least-privilege firewall rules, cluster DNS, NetworkPolicies, and private registry/secret-manager access where supported.

```text
Client -> DNS -> Load Balancer -> NGINX Ingress
                                  |       |
                                  v       v
                            Frontend   Backend API
                            Service    Service
```

Allow only required paths: HTTPS users to the load balancer, ingress to application Services, backend to approved cloud services, and monitoring agents to required endpoints. Avoid open administrative SSH access.

```bash
kubectl get ingress,svc,endpoints -n <namespace>
kubectl get networkpolicy -n <namespace>
kubectl describe ingress <ingress-name> -n <namespace>
```

Validate DNS, TLS, frontend loading, API routing, CORS, and blocked unauthorized paths.

## 9. NPS / Cloud Infrastructure Concepts

Treat NPS as the operational view of networking, platform, and services.

- **Networking:** regions, availability zones, VPCs/virtual networks, subnets, routes, NAT, load balancers, DNS, TLS, firewalls, and Kubernetes networking.
- **Platform:** managed Kubernetes, nodes, pods, scheduling, autoscaling, registries, IAM, workload identity, namespaces, RBAC, and admission policies.
- **Services:** databases, object storage, queues, secret managers, monitoring, logging, backups, and service quotas. This project currently has no database, but future features may need persistent services.

Define measurable availability, recovery, latency, traffic, scaling, compliance, backup, security, audit, and cost requirements. Every infrastructure decision needs an owner and an observable success signal.

## 10. Infrastructure Operations

### Day-one checks

1. Verify Terraform state and the latest approved plan.
2. Verify cluster, nodes, namespaces, ingress, and Helm release status.
3. Check application health, errors, latency, resources, and events.
4. Confirm dashboards and alerts receive data.
5. Confirm backups, certificate monitoring, and secret rotation schedules.

### Change management

Make infrastructure changes through pull requests. Run Terraform plan, Helm rendering, Kubernetes validation, and security scans before approval. Record the reason, approver, commit, plan, result, and rollback procedure.

### Observability

Monitor frontend availability, backend `/api/health`, API latency, HTTP errors, pod readiness, restarts, CPU, memory, node capacity, scheduling failures, Karpenter activity, ingress 4xx/5xx responses, TLS expiry, cloud health, and cost.

### Incident and recovery process

1. Confirm the alert and affected environment.
2. Check recent Git, Terraform, Helm, and image changes.
3. Inspect ingress, Service, pod, node, and application logs.
4. Reduce impact with rollback, traffic control, or scaling.
5. Restore the last known-good state.
6. Validate frontend, backend, health endpoint, and critical flows.
7. Record the timeline, root cause, impact, and preventive action.

Keep Terraform state backed up, retain image and chart versions, document cluster recreation, test restoration outside production, and define recovery ownership and recovery time objectives.

## 11. Cloud Engineering Onboarding Checklist

### Planning and access

- [ ] Cloud account/project, region, environments, ownership, and billing alerts are documented.
- [ ] Availability, scaling, security, cost, and recovery requirements are documented.
- [ ] Least-privilege cloud and Kubernetes access is available.

### Terraform and infrastructure

- [ ] Remote encrypted Terraform state and locking are configured.
- [ ] Terraform and provider versions are pinned.
- [ ] Network, IAM, registry, Kubernetes, monitoring, and Karpenter resources are defined as code.
- [ ] Format, validate, plan, and security scans pass.
- [ ] Infrastructure changes are reviewed before apply.

### Kubernetes and application deployment

- [ ] Cluster nodes, namespaces, DNS, metrics, and ingress are healthy.
- [ ] Frontend and backend production images build successfully.
- [ ] Images use immutable tags and non-root runtime users.
- [ ] Helm linting and template rendering pass.
- [ ] Deployments, Services, probes, resources, RBAC, and NetworkPolicies are configured.
- [ ] `/api/health` works through the required internal and public routes.

### Scaling and networking

- [ ] Karpenter NodePool and node configuration are tested.
- [ ] Scaling limits, disruption rules, and cost controls are configured.
- [ ] DNS, TLS, load balancing, NGINX routing, and CORS are verified.
- [ ] Unauthorized network paths are blocked.

### Final verification

- [ ] Dashboards and alerts cover application, Kubernetes, node, ingress, and cloud health.
- [ ] Logs and metrics can be queried in every environment.
- [ ] Rollback and disaster recovery procedures are documented and tested.
- [ ] Certificates, secrets, images, dependencies, and Terraform state have ownership and rotation plans.
- [ ] The frontend loads over HTTPS and reaches the backend API.
- [ ] Health checks, critical user flows, and error handling pass.
- [ ] No unexpected pod restarts, scheduling failures, or blocking browser errors remain.
- [ ] Release commit, image digest, Helm revision, Terraform apply, and verification evidence are recorded.
