# Envoy Gateway with Flux CD

## 1. About

This document describes the complete implementation of **Envoy Gateway with Flux CD** for the TDD React TypeScript application running on Kubernetes.

The implementation replaces Kubernetes NGINX Ingress as the application routing layer with **Envoy Gateway**.

The deployment is completely managed through **GitOps using Flux CD**.

The final traffic flow is:

```text
Client
   |
   v
Envoy Gateway
   |
   +-------------------------+
   |                         |
   v                         v
/                           /api/*
   |                         |
   v                         v
tdd-frontend:80          tdd-backend:4000
   |                         |
   v                         v
NGINX                     Express API
   |                         |
   v                         v
React Application         Backend API
```

> **Important:** NGINX is still used inside the frontend container to serve the React static files. However, Kubernetes application routing is handled by Envoy Gateway, not Kubernetes NGINX Ingress.

---

# 2. Objectives

The main objectives of this implementation are:

* Deploy Envoy Gateway through Flux CD.
* Manage all Gateway resources using GitOps.
* Replace Kubernetes NGINX Ingress routing with Gateway API resources.
* Route frontend traffic through Envoy Gateway.
* Route backend API traffic through Envoy Gateway.
* Keep frontend and backend in separate namespaces.
* Verify HTTPRoute configuration.
* Verify Envoy Gateway data-plane functionality.
* Test real frontend and backend traffic through Envoy Gateway.
* Keep the entire configuration reproducible from Git.

---

# 3. Existing Application Architecture

The application contains two main workloads:

### Frontend

```text
Namespace: tdd-frontend
Service:   tdd-frontend
Port:      80
```

The frontend is a React + TypeScript application served by NGINX inside the container.

### Backend

```text
Namespace: tdd-backend
Service:   tdd-backend
Port:      4000
```

The backend is an Express API.

Important backend endpoints:

```text
GET /api/health
GET /api/challenges
GET /api/challenges/:id
```

---

# 4. Why Envoy Gateway

Previously, Kubernetes ingress routing could be implemented using an ingress controller such as NGINX Ingress.

In this implementation, Envoy Gateway is used as the Kubernetes Gateway/API routing layer.

The architecture uses the Kubernetes Gateway API resources:

```text
GatewayClass
Gateway
HTTPRoute
```

This separates:

* Gateway infrastructure
* Listener configuration
* Application routing rules

The result is a cleaner Gateway API based architecture.

---

# 5. Final Architecture

```text
                         GitHub
                           |
                           v
                       Flux CD
                           |
                           v
                Kubernetes Resources
                           |
                           v
                +---------------------+
                |    Envoy Gateway    |
                |                     |
                |    GatewayClass      |
                |         |           |
                |       Gateway        |
                +---------+-----------+
                          |
                  HTTP Listener :80
                          |
             +------------+-------------+
             |                          |
          HTTPRoute                  HTTPRoute
          Frontend                   Backend
             |                          |
          Path: /                  Path: /api
             |                          |
             v                          v
      tdd-frontend Service       tdd-backend Service
             |                          |
             v                          v
       Frontend Pod               Backend Pod
             |                          |
          NGINX                    Express
             |                          |
             v                          v
           React                    API
```

---

# 6. Repository Structure

The Envoy Gateway implementation is located under the Flux configuration:

```text
devops/
└── flux/
    ├── bootstrap/
    │   ├── gitrepository.yaml
    │   └── kustomization.yaml
    │
    ├── applications/
    │   ├── frontend/
    │   │   ├── deployment.yaml
    │   │   ├── service.yaml
    │   │   ├── httproute.yaml
    │   │   └── kustomization.yaml
    │   │
    │   ├── backend/
    │   │   ├── deployment.yaml
    │   │   ├── service.yaml
    │   │   ├── httproute.yaml
    │   │   └── kustomization.yaml
    │   │
    │   └── kustomization.yaml
    │
    ├── infrastructure/
    │   ├── envoy-gateway/
    │   │   ├── namespace.yaml
    │   │   ├── ocirepository.yaml
    │   │   ├── helmrelease.yaml
    │   │   ├── kustomization.yaml
    │   │   │
    │   │   └── config/
    │   │       ├── gatewayclass.yaml
    │   │       └── gateway.yaml
    │   │
    │   ├── images/
    │   └── kustomization.yaml
    │
    └── kustomization.yaml
```

---

# 7. Flux Root Kustomization

The root Flux Kustomization loads the application and infrastructure resources.

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - applications
  - infrastructure
```

This means Flux manages both:

```text
applications/
infrastructure/
```

---

# 8. Envoy Gateway Namespace

Envoy Gateway is deployed in its own namespace:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: envoy-gateway-system
```

This keeps Gateway infrastructure separate from application namespaces.

---

# 9. Envoy Gateway OCI Repository

The Envoy Gateway Helm chart is pulled from the Envoy Gateway OCI repository.

```yaml
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: OCIRepository
metadata:
  name: gateway-helm
  namespace: envoy-gateway-system

spec:
  interval: 10m
  url: oci://docker.io/envoyproxy/gateway-helm
  ref:
    tag: v1.7.3
```

The implementation uses:

```text
Envoy Gateway version: v1.7.3
```

Flux is responsible for retrieving the Helm chart.

---

# 10. HelmRelease

Envoy Gateway is installed through a Flux `HelmRelease`.

The important configuration includes:

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease

metadata:
  name: envoy-gateway
  namespace: envoy-gateway-system

spec:
  chart:
    spec:
      chart: gateway-helm
      sourceRef:
        kind: OCIRepository
        name: gateway-helm
        namespace: envoy-gateway-system
```

The Gateway controller uses:

```text
gateway.envoyproxy.io/gatewayclass-controller
```

The implementation also defines Kubernetes provider configuration and controller resource limits/requests.

---

# 11. GatewayClass

The GatewayClass connects the Kubernetes Gateway API to Envoy Gateway.

File:

```text
devops/flux/infrastructure/envoy-gateway/config/gatewayclass.yaml
```

Configuration:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass

metadata:
  name: envoy-gateway

spec:
  controllerName: gateway.envoyproxy.io/gatewayclass-controller
```

The controller name is important because it tells Envoy Gateway:

> This GatewayClass is managed by the Envoy Gateway controller.

Verification:

```bash
kubectl get gatewayclass
```

Expected:

```text
NAME            CONTROLLER                                      ACCEPTED
envoy-gateway   gateway.envoyproxy.io/gatewayclass-controller   True
```

---

# 12. Gateway

The actual Gateway is:

```text
Name:      tdd-gateway
Namespace: envoy-gateway-system
```

File:

```text
devops/flux/infrastructure/envoy-gateway/config/gateway.yaml
```

Configuration:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway

metadata:
  name: tdd-gateway
  namespace: envoy-gateway-system

spec:
  gatewayClassName: envoy-gateway

  listeners:
    - name: http
      protocol: HTTP
      port: 80

      allowedRoutes:
        namespaces:
          from: All
```

This creates an HTTP listener on port `80`.

The Gateway allows HTTPRoutes from the application namespaces:

```text
tdd-frontend
tdd-backend
```

---

# 13. Frontend HTTPRoute

The frontend route is:

```text
devops/flux/applications/frontend/httproute.yaml
```

Configuration:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute

metadata:
  name: tdd-frontend
  namespace: tdd-frontend

spec:
  parentRefs:
    - name: tdd-gateway
      namespace: envoy-gateway-system

  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /

      backendRefs:
        - name: tdd-frontend
          port: 80
```

The routing rule is:

```text
/  →  tdd-frontend:80
```

---

# 14. Backend HTTPRoute

The backend route is:

```text
devops/flux/applications/backend/httproute.yaml
```

Configuration:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute

metadata:
  name: tdd-backend
  namespace: tdd-backend

spec:
  parentRefs:
    - name: tdd-gateway
      namespace: envoy-gateway-system

  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /api

      backendRefs:
        - name: tdd-backend
          port: 4000
```

The routing rule is:

```text
/api/*  →  tdd-backend:4000
```

No path rewrite is required because the backend application itself exposes routes under `/api`.

---

# 15. Why ReferenceGrant Is Not Required

The HTTPRoutes exist in:

```text
tdd-frontend
tdd-backend
```

The Gateway exists in:

```text
envoy-gateway-system
```

The HTTPRoutes reference the Gateway across namespaces.

This is allowed because the Gateway has:

```yaml
allowedRoutes:
  namespaces:
    from: All
```

The backend references are:

```text
tdd-frontend HTTPRoute → tdd-frontend Service
tdd-backend HTTPRoute  → tdd-backend Service
```

The Services are in the same namespace as their HTTPRoutes.

Therefore, no `ReferenceGrant` is required for these backend Service references.

---

# 16. Kustomization Configuration

The frontend Kustomization includes:

```yaml
resources:
  - deployment.yaml
  - service.yaml
  - httproute.yaml
```

The backend Kustomization includes:

```yaml
resources:
  - deployment.yaml
  - service.yaml
  - httproute.yaml
```

This ensures the HTTPRoutes are included when Flux renders the application manifests.

---

# 17. Validate Kustomize Before Commit

Before committing changes, validate the complete Flux configuration:

```bash
kubectl kustomize devops/flux
```

Also validate each application:

```bash
kubectl kustomize devops/flux/applications/frontend
```

```bash
kubectl kustomize devops/flux/applications/backend
```

If these commands render successfully, the Kustomize structure is valid.

---

# 18. Git Validation

Before committing:

```bash
git diff --check
```

Then:

```bash
git status
```

Stage the Envoy HTTPRoute changes:

```bash
git add \
  devops/flux/applications/backend/kustomization.yaml \
  devops/flux/applications/backend/httproute.yaml \
  devops/flux/applications/frontend/kustomization.yaml \
  devops/flux/applications/frontend/httproute.yaml
```

Commit:

```bash
git commit -m "feat: add envoy gateway http routes"
```

Push:

```bash
git push origin main
```

---

# 19. Flux Reconciliation

After pushing to GitHub, force reconciliation:

```bash
flux reconcile kustomization tdd-project \
  -n flux-system \
  --with-source
```

Successful reconciliation should show that Flux fetched the latest Git revision and applied it.

Example:

```text
fetched revision main@sha1:<commit>
applied revision main@sha1:<commit>
```

---

# 20. Verify HTTPRoutes

Check all HTTPRoutes:

```bash
kubectl get httproute -A
```

Expected:

```text
NAMESPACE       NAME
tdd-backend     tdd-backend
tdd-frontend    tdd-frontend
```

Check frontend:

```bash
kubectl describe httproute tdd-frontend -n tdd-frontend
```

Check backend:

```bash
kubectl describe httproute tdd-backend -n tdd-backend
```

The important conditions are:

```text
Accepted:     True
ResolvedRefs: True
```

This means Envoy Gateway has accepted the route and successfully resolved its referenced resources.

---

# 21. Verify Gateway

Run:

```bash
kubectl get gateway tdd-gateway \
  -n envoy-gateway-system
```

For detailed information:

```bash
kubectl get gateway tdd-gateway \
  -n envoy-gateway-system \
  -o yaml
```

Look for:

```yaml
attachedRoutes: 2
```

The listener should report:

```text
Programmed:    True
Accepted:      True
ResolvedRefs:  True
```

The implementation verified:

```text
attachedRoutes: 2
```

which means both application HTTPRoutes are attached to the HTTP listener.

---

# 22. Verify Envoy Gateway Pods

Run:

```bash
kubectl get pods -n envoy-gateway-system -o wide
```

Expected components include:

```text
envoy-gateway-...
envoy-envoy-gateway-system-tdd-gateway-...
```

The Envoy data-plane pod should be:

```text
2/2 Running
```

The Envoy Gateway controller should be:

```text
1/1 Running
```

---

# 23. Verify Envoy Gateway Services

Run:

```bash
kubectl get svc -n envoy-gateway-system
```

The generated Gateway Service is a:

```text
LoadBalancer
```

For the local kind/Docker environment, the external IP may remain:

```text
<pending>
```

This is expected because the local cluster does not automatically provide a cloud LoadBalancer address.

The generated Service exposes a NodePort.

Example:

```text
80:31329/TCP
```

---

# 24. Local kind/Docker Networking

The Kubernetes cluster in this implementation uses a Docker-based kind-style node.

The node showed:

```text
INTERNAL-IP: 172.20.0.2
```

However, directly accessing:

```text
http://172.20.0.2:31329
```

from the Mac failed.

This does **not** mean Envoy Gateway routing is broken.

The issue is local Docker/kind networking between the host and the Kubernetes NodePort.

For reliable local testing, use `kubectl port-forward`.

---

# 25. Recommended Local Testing Method

Start a port-forward:

```bash
kubectl port-forward \
  -n envoy-gateway-system \
  svc/envoy-envoy-gateway-system-tdd-gateway-9cd59708 \
  8080:80
```

Expected output:

```text
Forwarding from 127.0.0.1:8080 -> 10080
Forwarding from [::1]:8080 -> 10080
```

Keep this terminal running.

Open another terminal for testing.

---

# 26. Test Frontend Through Envoy Gateway

Run:

```bash
curl -i http://127.0.0.1:8080/
```

Expected:

```text
HTTP/1.1 200 OK
```

The response should contain the React application's HTML.

Example:

```html
<!doctype html>
<html lang="en">
```

This proves:

```text
Mac
 ↓
kubectl port-forward
 ↓
Envoy Gateway
 ↓
HTTPRoute /
 ↓
tdd-frontend Service
 ↓
Frontend Pod
 ↓
NGINX
 ↓
React
```

---

# 27. Test Backend Health Through Envoy Gateway

Run:

```bash
curl -i http://127.0.0.1:8080/api/health
```

Expected:

```text
HTTP/1.1 200 OK
```

Expected response:

```json
{"status":"ok"}
```

This proves:

```text
/api
 ↓
Backend HTTPRoute
 ↓
tdd-backend Service
 ↓
Express
```

---

# 28. Test Backend API Through Envoy Gateway

Run:

```bash
curl -i http://127.0.0.1:8080/api/challenges
```

Expected:

```text
HTTP/1.1 200 OK
```

The response should contain the challenge data.

This confirms that actual backend API traffic is successfully passing through Envoy Gateway.

---

# 29. Final Testing Results

The implementation was tested successfully using:

### Frontend

```text
GET /
```

Result:

```text
HTTP 200 OK
```

### Backend health

```text
GET /api/health
```

Result:

```text
HTTP 200 OK
```

Response:

```json
{"status":"ok"}
```

### Backend challenges

```text
GET /api/challenges
```

Result:

```text
HTTP 200 OK
```

The actual challenge data was returned successfully.

---

# 30. Verify Application Services

Frontend:

```bash
kubectl get svc tdd-frontend -n tdd-frontend
```

Expected:

```text
tdd-frontend   ClusterIP   ...   80/TCP
```

Backend:

```bash
kubectl get svc tdd-backend -n tdd-backend
```

Expected:

```text
tdd-backend   ClusterIP   ...   4000/TCP
```

---

# 31. Verify Running Pods

Frontend:

```bash
kubectl get pods -n tdd-frontend -o wide
```

Backend:

```bash
kubectl get pods -n tdd-backend -o wide
```

Both application pods should show:

```text
READY   STATUS
1/1     Running
```

---

# 32. Verify the Actual Images Running

Frontend:

```bash
kubectl get deployment tdd-frontend \
  -n tdd-frontend \
  -o jsonpath='{.spec.template.spec.containers[*].image}{"\n"}'
```

Backend:

```bash
kubectl get deployment tdd-backend \
  -n tdd-backend \
  -o jsonpath='{.spec.template.spec.containers[*].image}{"\n"}'
```

To verify the actual running pod:

```bash
kubectl get pod <frontend-pod> \
  -n tdd-frontend \
  -o jsonpath='{.status.containerStatuses[*].image}{"\n"}'
```

```bash
kubectl get pod <backend-pod> \
  -n tdd-backend \
  -o jsonpath='{.status.containerStatuses[*].image}{"\n"}'
```

The pod image should match the Deployment image.

---

# 33. Flux Image Automation Verification

Although Image Automation is a separate part of the overall GitOps system, it should be checked when validating the application deployment.

Check ImageRepositories:

```bash
flux get image repository -A
```

Check ImagePolicies:

```bash
flux get image policy -A
```

Check ImageUpdateAutomations:

```bash
flux get image update -A
```

The resources should report:

```text
READY: True
```

If ImageUpdateAutomation says:

```text
repository up-to-date
```

it means there is currently no newer matching image tag that needs to be committed.

It does **not** mean Image Automation is broken.

---

# 34. Complete GitOps Flow

The final deployment flow is:

```text
Developer
    |
    | git push
    v
GitHub
    |
    v
Flux GitRepository
    |
    v
Flux Kustomization
    |
    +-----------------------------+
    |                             |
    v                             v
Applications                 Infrastructure
    |                             |
    |                             v
    |                      Envoy Gateway
    |                             |
    |                             v
    |                         GatewayClass
    |                             |
    |                             v
    |                           Gateway
    |                             |
    |                             v
    |                         HTTPRoutes
    |                             |
    +-------------+---------------+
                  |
                  v
              Kubernetes
```

---

# 35. Request Flow

### Frontend request

```text
Browser
  |
  | GET /
  v
Envoy Gateway
  |
  | HTTPRoute: /
  v
tdd-frontend Service
  |
  v
Frontend Pod
  |
  v
NGINX
  |
  v
React static files
```

### Backend request

```text
Browser / Frontend
  |
  | GET /api/health
  v
Envoy Gateway
  |
  | HTTPRoute: /api
  v
tdd-backend Service
  |
  v
Backend Pod
  |
  v
Express
  |
  v
{"status":"ok"}
```

---

# 36. Troubleshooting

## HTTPRoute is not Accepted

Check:

```bash
kubectl describe httproute tdd-frontend -n tdd-frontend
```

and:

```bash
kubectl describe httproute tdd-backend -n tdd-backend
```

Look for:

```text
Accepted: True
ResolvedRefs: True
```

If `Accepted=False`, verify:

* Gateway name
* Gateway namespace
* GatewayClass
* `allowedRoutes`
* listener configuration

---

## GatewayClass is not Accepted

Run:

```bash
kubectl get gatewayclass
```

Then:

```bash
kubectl describe gatewayclass envoy-gateway
```

Verify the controller:

```text
gateway.envoyproxy.io/gatewayclass-controller
```

---

## Gateway shows `AddressNotAssigned`

Run:

```bash
kubectl get gateway tdd-gateway \
  -n envoy-gateway-system
```

If you see:

```text
PROGRAMMED   False
AddressNotAssigned
```

and are running a local kind/Docker cluster, check:

```bash
kubectl get svc -n envoy-gateway-system
```

If the generated LoadBalancer Service has:

```text
EXTERNAL-IP   <pending>
```

this may simply be because the local cluster has no cloud LoadBalancer implementation.

For local testing, use:

```bash
kubectl port-forward \
  -n envoy-gateway-system \
  svc/<envoy-gateway-service> \
  8080:80
```

Then test:

```bash
curl -i http://127.0.0.1:8080/
```

---

## Frontend works but backend doesn't

Check:

```bash
kubectl get svc tdd-backend -n tdd-backend
```

Then:

```bash
kubectl get endpoints tdd-backend -n tdd-backend
```

Check the backend pod:

```bash
kubectl get pods -n tdd-backend
```

Then test:

```bash
curl -i http://127.0.0.1:8080/api/health
```

---

## Flux has not applied the changes

Run:

```bash
flux reconcile kustomization tdd-project \
  -n flux-system \
  --with-source
```

Then:

```bash
kubectl get httproute -A
```

Also check:

```bash
flux get kustomizations -A
```

---

# 37. Important Configuration Rule

Do not manually apply the Gateway or HTTPRoute manifests if they are already managed by Flux.

Avoid:

```bash
kubectl apply -f gateway.yaml
kubectl apply -f httproute.yaml
```

The desired workflow is:

```text
Git change
   ↓
git push
   ↓
Flux
   ↓
Kubernetes
```

This maintains Git as the source of truth.

---

# 38. How a New User Can Check Envoy Gateway

A new developer/operator can use the following checklist.

### Step 1 — Check GatewayClass

```bash
kubectl get gatewayclass
```

Expected:

```text
envoy-gateway
```

### Step 2 — Check Gateway

```bash
kubectl get gateway -n envoy-gateway-system
```

Expected:

```text
tdd-gateway
```

### Step 3 — Check HTTPRoutes

```bash
kubectl get httproute -A
```

Expected:

```text
tdd-backend    tdd-backend
tdd-frontend   tdd-frontend
```

### Step 4 — Check Envoy Pods

```bash
kubectl get pods -n envoy-gateway-system
```

Expected:

```text
envoy-gateway...                              Running
envoy-envoy-gateway-system-tdd-gateway...    Running
```

### Step 5 — Check route status

```bash
kubectl describe httproute tdd-frontend -n tdd-frontend
```

```bash
kubectl describe httproute tdd-backend -n tdd-backend
```

Expected:

```text
Accepted: True
ResolvedRefs: True
```

### Step 6 — Test actual traffic

Start:

```bash
kubectl port-forward \
  -n envoy-gateway-system \
  svc/<envoy-gateway-service> \
  8080:80
```

Then:

```bash
curl -i http://127.0.0.1:8080/
```

and:

```bash
curl -i http://127.0.0.1:8080/api/health
```

and:

```bash
curl -i http://127.0.0.1:8080/api/challenges
```

If these return `HTTP 200`, the Envoy Gateway routing is working.

---

# 39. Quick Verification Commands

For day-to-day checking, the following commands are enough:

```bash
kubectl get gatewayclass
```

```bash
kubectl get gateway -n envoy-gateway-system
```

```bash
kubectl get httproute -A
```

```bash
kubectl get pods -n envoy-gateway-system
```

```bash
kubectl get svc -n envoy-gateway-system
```

```bash
flux get kustomizations -A
```

And for actual traffic:

```bash
kubectl port-forward \
  -n envoy-gateway-system \
  svc/<envoy-gateway-service> \
  8080:80
```

Then:

```bash
curl -i http://127.0.0.1:8080/
curl -i http://127.0.0.1:8080/api/health
curl -i http://127.0.0.1:8080/api/challenges
```

---

# 40. Implementation Status

| Component                     | Status   |
| ----------------------------- | -------- |
| Envoy Gateway installation    | Complete |
| Envoy Gateway managed by Flux | Complete |
| OCIRepository                 | Complete |
| HelmRelease                   | Complete |
| GatewayClass                  | Complete |
| Gateway                       | Complete |
| Frontend HTTPRoute            | Complete |
| Backend HTTPRoute             | Complete |
| Flux reconciliation           | Verified |
| Envoy data plane              | Running  |
| Frontend routing              | Tested   |
| Backend routing               | Tested   |
| `/api/health`                 | HTTP 200 |
| `/api/challenges`             | HTTP 200 |
| GitOps configuration          | Complete |

---

# 41. Final Architecture Summary

The project is now using **Envoy Gateway as the Kubernetes application routing layer**.

The final setup is:

```text
                         GitHub
                           |
                           v
                         Flux CD
                           |
            +--------------+--------------+
            |                             |
            v                             v
       Applications                 Infrastructure
            |                             |
            |                       Envoy Gateway
            |                             |
            |                         GatewayClass
            |                             |
            |                           Gateway
            |                             |
            |                    +--------+--------+
            |                    |                 |
            |               HTTPRoute          HTTPRoute
            |               Frontend           Backend
            |                    |                 |
            |                    v                 v
            |             tdd-frontend       tdd-backend
            |                  :80               :4000
            |                    |                 |
            |                    v                 v
            |                  NGINX            Express
            |                    |                 |
            |                    v                 v
            |                 React               API
            |
            +---------------------------------------------+
```

## Final Result

**Envoy Gateway is successfully deployed and managed through Flux CD, both frontend and backend HTTPRoutes are attached and resolved, and real application traffic has been successfully tested through the Envoy data plane.**

The frontend's internal NGINX remains only as the web server for React static assets; it is **not the Kubernetes ingress/routing layer**.
