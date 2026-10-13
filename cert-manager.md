## TDD React TypeScript App — Local Kind Kubernetes Environment

**Status:** Implemented and tested locally  
**Deployment method:** Flux CD GitOps  
**Certificate authority used:** SelfSigned Issuers  
**Gateway:** Envoy Gateway (`tdd-gateway`)  
**Environment:** Local Kind cluster on Docker Desktop for macOS  
**Last verified:** 13 October 2026

---

## 1. Executive Summary

cert-manager has been installed in the local Kubernetes cluster and managed through Flux GitOps. The installation was verified by checking the cert-manager controllers and custom resource definitions (CRDs), issuing a test certificate, and using a second certificate to enable HTTPS on the existing Envoy Gateway.

The local HTTPS test succeeded:

- `https://localhost:8443/` returned **HTTP 200** and served the frontend.
- The TLS handshake succeeded using **TLS 1.3**.
- `https://localhost:8443/api` reached the backend Express application, which returned **HTTP 404 `Cannot GET /api`**. This is an application route result, not a TLS failure.
- The self-signed certificate is not publicly trusted. The test used `curl -k`, which bypasses certificate trust validation for this local test.

The overall Gateway resource still reports `Programmed=False` with reason `AddressNotAssigned`, because the local LoadBalancer Service has no external IP. However, the HTTPS listener itself reports `Accepted=True`, `Programmed=True`, and `ResolvedRefs=True`, and the local port-forward test successfully reached the application.

**Final assessment:** cert-manager is implemented and tested for local certificate issuance and local HTTPS termination. Public HTTPS / Let's Encrypt was not configured because this project currently has no public domain or public endpoint.

---

## 2. Environment and Existing Architecture

The project repository is:

`https://github.com/Dataxis-UditSingh/tdd_project.git`

The local project directory used during implementation was:

`/Users/uditsingh/DataxisLabs/tdd-react-typescript-app`

The Kubernetes context used in the project is `kind-tdd-cicd`, with the Kind node:

`tdd-cicd-control-plane`

The relevant architecture is:

```text
GitHub repository (main)
        |
        v
Flux GitRepository: tdd-project
        |
        v
Flux Kustomization: tdd-infrastructure
        |
        +------------------------------+
        |                              |
        v                              v
cert-manager resources          Envoy Gateway resources
namespace: cert-manager         namespace: envoy-gateway-system
        |                              |
        v                              v
Issuer -> Certificate           tdd-gateway
        |                       HTTP :80 / HTTPS :443
        v                              |
Kubernetes TLS Secret <---------------+
                                       |
                       +---------------+---------------+
                       |                               |
                       v                               v
                tdd-frontend                      tdd-backend
                Service :80                      Service :4000
                PathPrefix /                    PathPrefix /api
```

Flux is the source of truth for the committed infrastructure resources. Changes were committed to `main`, pushed to GitHub, and reconciled with Flux rather than applied directly using `kubectl apply`.

### Existing routes preserved

Two HTTPRoutes were already configured and remained in place:

- `tdd-frontend` in namespace `tdd-frontend`: path prefix `/` to Service `tdd-frontend:80`.
- `tdd-backend` in namespace `tdd-backend`: path prefix `/api` to Service `tdd-backend:4000`.

Both routes were reported as accepted with references resolved.

---

## 3. What cert-manager Does in This Project

cert-manager automates certificate lifecycle management in Kubernetes. In this implementation it:

1. Runs its controller, webhook, and CA injector.
2. Installs certificate-related CRDs.
3. Watches `Issuer` and `Certificate` resources.
4. Requests and issues certificates from the configured Issuer.
5. Creates Kubernetes TLS Secrets containing the certificate and private key.
6. Maintains certificate status and renewal scheduling.
7. Provides a TLS Secret for the Envoy Gateway HTTPS listener.

For the local implementation, a `SelfSigned` Issuer was used. It is suitable for validating the workflow but does not create a certificate trusted by browsers or public clients.

---

## 4. Files Added or Modified

All paths below are relative to the repository root.

### Added: `devops/flux/infrastructure/cert-manager/namespace.yaml`

Creates the dedicated `cert-manager` namespace.

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: cert-manager
```

### Added: `devops/flux/infrastructure/cert-manager/ocirepository.yaml`

Defines the OCI Helm chart source used by Flux.

```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: OCIRepository
metadata:
  name: cert-manager
  namespace: cert-manager
spec:
  interval: 12h
  url: oci://quay.io/jetstack/charts/cert-manager
  layerSelector:
    mediaType: "application/vnd.cncf.helm.chart.content.v1.tar+gzip"
    operation: copy
  ref:
    semver: "1.21.x"
```

During verification, Flux resolved the chart to version `1.21.2`.

### Added: `devops/flux/infrastructure/cert-manager/helmrelease.yaml`

Installs cert-manager through Flux Helm Controller.

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: cert-manager
  namespace: cert-manager
spec:
  interval: 30m
  releaseName: cert-manager
  chartRef:
    kind: OCIRepository
    name: cert-manager
  values:
    crds:
      enabled: true
      keep: true
    config:
      gatewayAPI:
        enabled: true
```

Important configuration:

- `crds.enabled: true`: installs the cert-manager CRDs through the Helm chart.
- `crds.keep: true`: configures the chart to retain CRDs when uninstalling the chart.
- `config.gatewayAPI.enabled: true`: enables cert-manager's Gateway API integration feature for future Gateway API certificate automation. The local HTTPS listener in this implementation was configured explicitly with a `Certificate` and TLS Secret; the ACME Gateway HTTP-01 solver was not configured.

### Added: `devops/flux/infrastructure/cert-manager/kustomization.yaml`

The final Kustomization includes all cert-manager-related resources:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - namespace.yaml
  - ocirepository.yaml
  - helmrelease.yaml
  - selfsigned-issuer.yaml
  - certificate-test.yaml
  - gateway-selfsigned-issuer.yaml
  - gateway-certificate.yaml
```

### Added: `devops/flux/infrastructure/cert-manager/selfsigned-issuer.yaml`

Creates the first SelfSigned Issuer for a smoke-test certificate in the `cert-manager` namespace.

```yaml
apiVersion: cert-manager.io/v1
kind: Issuer
metadata:
  name: local-selfsigned-issuer
  namespace: cert-manager
spec:
  selfSigned: {}
```

### Added: `devops/flux/infrastructure/cert-manager/certificate-test.yaml`

Requests a test certificate for `cert-manager-test.local`.

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: cert-manager-smoke-test
  namespace: cert-manager
spec:
  secretName: cert-manager-smoke-test-tls
  commonName: cert-manager-test.local
  subject:
    organizations:
      - TDD Project Local Testing
  dnsNames:
    - cert-manager-test.local
  issuerRef:
    name: local-selfsigned-issuer
    kind: Issuer
    group: cert-manager.io
  privateKey:
    algorithm: ECDSA
    size: 256
  duration: 2160h
  renewBefore: 360h
```

Certificate settings:

- Requested validity: `2160h` (90 days).
- Renewal window: `360h` (15 days before expiry).
- Private key algorithm: ECDSA, 256-bit.
- Secret: `cert-manager-smoke-test-tls`.

Observed status showed the certificate as ready, with an expiry of **11 January 2027** and scheduled renewal on **27 December 2026**.

### Added: `devops/flux/infrastructure/cert-manager/gateway-selfsigned-issuer.yaml`

Creates a separate Issuer in the same namespace as the Gateway. Kubernetes Secrets are namespace-scoped, so the Gateway's certificate Secret must be available in `envoy-gateway-system`.

```yaml
apiVersion: cert-manager.io/v1
kind: Issuer
metadata:
  name: gateway-selfsigned-issuer
  namespace: envoy-gateway-system
spec:
  selfSigned: {}
```

### Added: `devops/flux/infrastructure/cert-manager/gateway-certificate.yaml`

Requests a certificate for local HTTPS testing.

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: tdd-gateway-local-tls
  namespace: envoy-gateway-system
spec:
  secretName: tdd-gateway-local-tls
  commonName: localhost
  dnsNames:
    - localhost
  ipAddresses:
    - 127.0.0.1
  issuerRef:
    name: gateway-selfsigned-issuer
    kind: Issuer
    group: cert-manager.io
  privateKey:
    algorithm: ECDSA
    size: 256
```

The certificate covers `localhost` and IP address `127.0.0.1`. It is intended only for local testing.

### Modified: `devops/flux/infrastructure/kustomization.yaml`

The infrastructure Kustomization was updated to include cert-manager:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - envoy-gateway
  - images
  - secrets-store-csi
  - falco-operator
  - cert-manager
```

The existing resources were preserved.

### Modified: `devops/flux/infrastructure/envoy-gateway/config/gateway.yaml`

The original HTTP listener was retained and an HTTPS listener was added:

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
    - name: https
      protocol: HTTPS
      port: 443
      hostname: localhost
      tls:
        mode: Terminate
        certificateRefs:
          - kind: Secret
            name: tdd-gateway-local-tls
      allowedRoutes:
        namespaces:
          from: All
```

Key details:

- HTTP port `80` remains enabled.
- HTTPS port `443` uses TLS termination.
- The listener hostname is `localhost`.
- The referenced Secret is `tdd-gateway-local-tls`, in `envoy-gateway-system`.
- Existing HTTPRoutes were not rewritten.

---

## 5. Deployment Procedure Used

### Step 1: Validate manifests locally

```bash
kubectl kustomize devops/flux/infrastructure
git diff --check
git status --short
```

The Kustomize render succeeded and `git diff --check` returned no whitespace errors.

### Step 2: Commit and push the cert-manager installation

Commit:

`6dd92e2` — `feat: add cert-manager through Flux GitOps`

```bash
git add devops/flux/infrastructure/kustomization.yaml devops/flux/infrastructure/cert-manager/
git commit -m "feat: add cert-manager through Flux GitOps"
git push origin main
```

### Step 3: Reconcile Flux

```bash
flux reconcile source git tdd-project -n flux-system
flux reconcile kustomization tdd-infrastructure -n flux-system --with-source
```

Flux fetched revision `6dd92e204240280386d5b9f31e2126efc2768f8e` and applied the infrastructure Kustomization.

### Step 4: Add and deploy the smoke-test certificate

Commit:

`0d2ecf3` — `feat: add local cert-manager test certificate`

```bash
git add devops/flux/infrastructure/cert-manager/
git commit -m "feat: add local cert-manager test certificate"
git push origin main
```

Flux was reconciled again and applied revision `0d2ecf3eba341b28b55da6200debe722e0ba8e5c`.

### Step 5: Add HTTPS to Envoy Gateway

Commit:

`de1eec0` — `feat: add local HTTPS to Envoy Gateway`

```bash
git add devops/flux/infrastructure/cert-manager/ devops/flux/infrastructure/envoy-gateway/config/gateway.yaml
git commit -m "feat: add local HTTPS to Envoy Gateway"
git push origin main
```

Flux was reconciled again and applied revision `de1eec0c09ac9f4300d0ebce5e82bf6035326a2f`.

**Note:** These are the commits recorded during implementation. The final repository revision may have changed if more commits have since been added.

---

## 6. Verification Performed

### 6.1 cert-manager installation

Commands:

```bash
kubectl get ocirepository,helmrelease -n cert-manager
kubectl get pods -n cert-manager
kubectl get crds | grep cert-manager.io
```

Observed results:

- OCIRepository `cert-manager`: `READY=True`.
- Resolved chart: `cert-manager@1.21.2`.
- HelmRelease `cert-manager`: `READY=True`, status `Helm install succeeded`.
- `cert-manager` controller: `1/1 Running`.
- `cert-manager-webhook`: `1/1 Running`.
- `cert-manager-cainjector`: `1/1 Running`.

Installed CRDs included:

- `certificaterequests.cert-manager.io`
- `certificates.cert-manager.io`
- `challenges.acme.cert-manager.io`
- `clusterissuers.cert-manager.io`
- `issuers.cert-manager.io`
- `orders.acme.cert-manager.io`

### 6.2 Smoke-test certificate

Commands:

```bash
kubectl get issuer,certificate,certificaterequest -n cert-manager
kubectl get secret cert-manager-smoke-test-tls -n cert-manager
kubectl describe certificate cert-manager-smoke-test -n cert-manager
```

Observed results:

- Issuer `local-selfsigned-issuer`: `READY=True`.
- Certificate `cert-manager-smoke-test`: `READY=True`.
- CertificateRequest `cert-manager-smoke-test-1`: approved and ready.
- Secret `cert-manager-smoke-test-tls`: exists, type `kubernetes.io/tls`, 3 data entries.
- Certificate issuance event: `The certificate has been successfully issued`.
- Expiry: `2027-01-11T07:50:57Z`.
- Scheduled renewal: `2026-12-27T07:50:57Z`.

### 6.3 Gateway certificate

Commands:

```bash
kubectl get issuer,certificate -n envoy-gateway-system
kubectl get secret tdd-gateway-local-tls -n envoy-gateway-system
```

Observed results:

- Issuer `gateway-selfsigned-issuer`: `READY=True`.
- Certificate `tdd-gateway-local-tls`: `READY=True`.
- Secret `tdd-gateway-local-tls`: exists, type `kubernetes.io/tls`, 3 data entries.

### 6.4 Gateway listener status

Commands:

```bash
kubectl get gateway tdd-gateway -n envoy-gateway-system
kubectl describe gateway tdd-gateway -n envoy-gateway-system
```

Observed listener conditions for HTTPS:

- `Accepted=True`
- `Programmed=True`
- `ResolvedRefs=True`
- Certificate reference successfully resolved.
- Two HTTPRoutes remained attached.

**Important nuance:** The top-level Gateway condition remained `Programmed=False` with reason `AddressNotAssigned`, because the local LoadBalancer Service has no external IP. This is separate from the listener configuration status. The local HTTPS request still succeeded through port-forwarding.

### 6.5 Envoy Service and pods

Commands:

```bash
kubectl get svc -n envoy-gateway-system
kubectl get endpointslices -n envoy-gateway-system
kubectl get pods -n envoy-gateway-system
```

Observed results:

- Gateway Service type: `LoadBalancer`.
- Service ports: `80:31601/TCP` and `443:31664/TCP`.
- External IP: `<pending>`.
- EndpointSlice had endpoint `10.244.0.183` and internal ports `10443,10080`.
- Envoy data-plane pod: `2/2 Running`.
- Envoy Gateway controller pod: `1/1 Running`.

---

## 7. Local HTTPS Test Results

The request was tested against `https://localhost:8443/` while a local port-forward exposed the Gateway Service's HTTPS port.

### Frontend request

Command:

```bash
curl -vk https://localhost:8443/
```

Observed:

- TLS handshake completed successfully.
- Negotiated TLS version: TLS 1.3.
- Certificate subject: `CN=localhost`.
- Certificate issuer: `CN=localhost` (self-signed).
- HTTP response: `200`.
- Server header: `nginx/1.31.6`.
- Frontend HTML for **TDD Challenge Lab** was returned.

**Result:** PASS — TLS terminated at Envoy and the frontend responded successfully.

### Backend request

Command:

```bash
curl -vk https://localhost:8443/api
```

Observed:

- TLS handshake completed successfully.
- The response included `x-powered-by: Express`.
- HTTP response: `404`.
- Body: `Cannot GET /api`.

**Result:** PASS for TLS and request delivery to the backend. The `404` indicates the Express application did not have a matching `GET /api` handler at that path. It is not a certificate issuance or TLS failure. If the backend API is expected at a different path, inspect its route definitions separately.

### Why `-k` was used

The `-k` option tells curl to continue despite certificate trust validation failure. This was intentional because the certificate was generated by a SelfSigned Issuer.

Do not use `-k` as a production security workaround. For a local trusted development setup, a local CA can be configured and its root certificate trusted on the client device.

---

## 8. How the Certificate Flow Works

### Smoke-test certificate

1. Flux applies `local-selfsigned-issuer`.
2. Flux applies `cert-manager-smoke-test`.
3. cert-manager observes the Certificate resource.
4. cert-manager creates a CertificateRequest and generates the key material.
5. The SelfSigned Issuer issues the certificate.
6. cert-manager creates the `cert-manager-smoke-test-tls` Secret.
7. The Certificate status changes to `Ready=True`.

### Gateway HTTPS certificate

1. Flux applies `gateway-selfsigned-issuer` in `envoy-gateway-system`.
2. Flux applies `tdd-gateway-local-tls`.
3. cert-manager issues a certificate for `localhost` and `127.0.0.1`.
4. cert-manager creates the `tdd-gateway-local-tls` Secret in `envoy-gateway-system`.
5. The Gateway's HTTPS listener references that Secret.
6. Envoy Gateway resolves the reference and programs the HTTPS listener.
7. Requests sent through the local port-forward complete TLS and reach the HTTPRoutes.

---

## 9. Current Limitations and Scope

This implementation was deliberately limited to local testing.

### Completed

- cert-manager installed using Flux GitOps.
- CRDs installed.
- Controller, webhook and CA injector running.
- Local SelfSigned Issuers working.
- Test certificate issued and TLS Secret created.
- Envoy Gateway HTTPS listener configured.
- Local HTTPS frontend request returned HTTP 200.
- Backend route received an HTTPS request and returned its Express 404 response.

### Not implemented

- Let's Encrypt or another public certificate authority.
- Public domain or subdomain.
- Public DNS records.
- Publicly reachable Kubernetes Gateway endpoint.
- ACME HTTP-01 or DNS-01 challenge configuration.
- Automatic HTTP-to-HTTPS redirect.
- A trusted local CA for browsers.
- Public production TLS validation.

### Why no public certificate?

The project currently has no domain or public endpoint. The Gateway's LoadBalancer Service showed `EXTERNAL-IP: <pending>`. A public ACME certificate would require a real domain with suitable DNS and a challenge endpoint reachable by the certificate authority, or a valid DNS-01 setup.

### Why the top-level Gateway still says `Programmed=False`

The Gateway status reports `AddressNotAssigned` because no address was assigned to the LoadBalancer. Its individual HTTP and HTTPS listeners showed `Accepted=True`, `Programmed=True`, and `ResolvedRefs=True`. Local HTTPS worked through port-forwarding, but that does not prove public reachability.

---

## 10. Useful Troubleshooting Commands

### Check cert-manager pods and release

```bash
kubectl get pods -n cert-manager
kubectl get helmrelease,ocirepository -n cert-manager
```

### Check certificate readiness

```bash
kubectl get issuer,certificate,certificaterequest -n cert-manager
kubectl describe certificate cert-manager-smoke-test -n cert-manager
kubectl get secret cert-manager-smoke-test-tls -n cert-manager
```

### Check Gateway certificate and listener

```bash
kubectl get issuer,certificate -n envoy-gateway-system
kubectl get secret tdd-gateway-local-tls -n envoy-gateway-system
kubectl describe gateway tdd-gateway -n envoy-gateway-system
```

### Check routes and Envoy resources

```bash
kubectl get httproute -A
kubectl get svc -n envoy-gateway-system
kubectl get endpointslices -n envoy-gateway-system
kubectl get pods -n envoy-gateway-system
```

### Reconcile GitOps

```bash
flux reconcile source git tdd-project -n flux-system
flux reconcile kustomization tdd-infrastructure -n flux-system --with-source
```

### Render infrastructure before committing

```bash
kubectl kustomize devops/flux/infrastructure > /tmp/tdd-infrastructure-rendered.yaml
git diff --check
```

---

## 11. Final Conclusion

cert-manager is **implemented and tested for the local Kind environment**. The installation is managed through Flux, both test certificates were issued successfully, the TLS Secret was created in the correct namespace, the Envoy HTTPS listener resolved its certificate reference, and the local frontend returned HTTP 200 over HTTPS.

The backend HTTPS request reached Express, which returned `404 Cannot GET /api`; this is an application route result and should be investigated only if that endpoint is expected to exist.

The implementation should be documented as:

> **cert-manager: Implemented and Tested — Local Environment (SelfSigned TLS)**

It should not be described as public production TLS, because no public domain, publicly trusted certificate, or externally reachable Gateway endpoint has been configured.
"""
out = "/mnt/data/cert-manager-implementation-and-testing-guide.md"
pypandoc.convert_text(content, to="md", format="md", outputfile=out, extra_args=["--standalone"])
print(f"Created: {out}\nSize: {os.path.getsize(out):,} bytes")
