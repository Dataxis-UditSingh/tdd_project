## 1. Overview

This document records the Falco implementation in the `tdd-react-typescript-app` repository, using the same Flux GitOps workflow and local Kind cluster used during implementation.

### Implemented components

- **Falco Operator** installed by Flux CD through a HelmRelease.
- **Falco instance** declared as a Kubernetes custom resource.
- **Container plugin** retrieved from the Falco Security OCI registry.
- **Official Falco rules** retrieved from the Falco Security OCI registry.
- **Runtime test** using a temporary BusyBox container to verify a shell-spawn detection alert.
- **Kyverno audit finding** observed because Falco's container runs in privileged mode.

### Environment used

| Item | Value |
|---|---|
| Repository | `https://github.com/Dataxis-UditSingh/tdd_project.git` |
| Local project directory | `tdd-react-typescript-app` |
| Git branch | `main` |
| Kubernetes context | `kind-tdd-cicd` |
| Kind node | `tdd-cicd-control-plane` |
| Node OS | Debian GNU/Linux 13 (inside Docker Desktop's LinuxKit VM) |
| Kernel | `6.12.76-linuxkit` |
| Architecture | ARM64 |
| Container runtime | `containerd://2.3.1` |
| Falco Operator Helm chart | `falco-operator` version `0.3.1` |
| Falco Operator application version | `0.4.1` |
| Falco | `0.44.1` |
| Namespace | `falco-operator` |
| Flux Kustomization reconciled | `tdd-infrastructure` in `flux-system` |

> **Environment limitation:** The cluster runs in Kind on Docker Desktop for macOS. The test below demonstrates that the configured Falco rule detected the tested shell event in this environment. It does not prove complete syscall coverage or production readiness on a native Linux host.

---

## 2. Architecture and event flow

```text
GitHub repository (main)
        |
        v
Flux GitRepository: tdd-project
        |
        v
Flux Kustomization: tdd-infrastructure
        |
        v
Kustomize: devops/flux/infrastructure
        |
        v
Namespace + HelmRepository + HelmRelease
        |
        v
Falco Operator
        |
        +---- Falco custom resource
        |         |
        |         v
        |      Falco DaemonSet (one pod per eligible node)
        |
        +---- Plugin custom resource
        |         |
        |         v
        |      container plugin
        |
        +---- Rulesfile custom resource
                  |
                  v
              Official Falco rules

Kernel/syscall event -> modern eBPF probe -> Falco rules -> alert in Falco logs
```

Falco detects configured runtime behavior; it is not a replacement for CI tests, SAST, DAST, or Kubernetes admission policies. The container plugin adds container-related metadata used by applicable rules.

---

## 3. Repository layout

The Falco-related files are under:

```text
devops/
└── flux/
    └── infrastructure/
        ├── kustomization.yaml
        └── falco-operator/
            ├── kustomization.yaml
            ├── namespace.yaml
            ├── helmrepository.yaml
            ├── helmrelease.yaml
            ├── falco.yaml
            ├── plugin-container.yaml
            └── rules-falco.yaml
```

The parent file `devops/flux/infrastructure/kustomization.yaml` includes the `falco-operator` directory as a resource. Keep this directory managed through the existing Flux Kustomization rather than manually applying individual resources to the cluster.

---

## 4. Manifests

### 4.1 `devops/flux/infrastructure/falco-operator/namespace.yaml`

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: falco-operator
  labels:
    app.kubernetes.io/part-of: falco
```

This creates a dedicated namespace for the Falco Operator, Falco instance, plugin, and rules resources.

### 4.2 `devops/flux/infrastructure/falco-operator/helmrepository.yaml`

```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: HelmRepository
metadata:
  name: falcosecurity
  namespace: flux-system
spec:
  interval: 1h
  url: https://falcosecurity.github.io/charts
```

This registers the Falco Security Helm chart repository with Flux.

### 4.3 `devops/flux/infrastructure/falco-operator/helmrelease.yaml`

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: falco-operator
  namespace: falco-operator
  labels:
    app.kubernetes.io/managed-by: flux
spec:
  interval: 30m
  releaseName: falco-operator
  targetNamespace: falco-operator
  storageNamespace: falco-operator
  chart:
    spec:
      chart: falco-operator
      version: "0.3.1"
      interval: 1h
      sourceRef:
        kind: HelmRepository
        name: falcosecurity
        namespace: flux-system
  install:
    createNamespace: true
    remediation:
      retries: 3
  upgrade:
    remediation:
      retries: 3
```

The Helm chart version is pinned to `0.3.1` to make the deployed chart version explicit. The Operator manages Falco-related custom resources.

### 4.4 `devops/flux/infrastructure/falco-operator/falco.yaml`

```yaml
apiVersion: instance.falcosecurity.dev/v1alpha1
kind: Falco
metadata:
  name: falco
  namespace: falco-operator
spec: {}
```

The default Falco custom resource created a DaemonSet running Falco `0.44.1` with the `modern_ebpf` engine in this environment.

### 4.5 `devops/flux/infrastructure/falco-operator/plugin-container.yaml`

```yaml
apiVersion: artifact.falcosecurity.dev/v1alpha1
kind: Plugin
metadata:
  name: container
  namespace: falco-operator
spec:
  ociArtifact:
    image:
      repository: falcosecurity/plugins/plugin/container
      tag: latest
    registry:
      name: ghcr.io
```

The Artifact Operator retrieved the plugin from `ghcr.io` and stored it in the Falco pod at:

```text
/usr/share/falco/plugins/container.so
```

The observed logs reported `Loaded plugin 'container@0.7.5'`.

### 4.6 `devops/flux/infrastructure/falco-operator/rules-falco.yaml`

```yaml
apiVersion: artifact.falcosecurity.dev/v1alpha1
kind: Rulesfile
metadata:
  name: falco-rules
  namespace: falco-operator
spec:
  ociArtifact:
    image:
      repository: falcosecurity/rules/falco-rules
      tag: latest
    registry:
      name: ghcr.io
  priority: 50
```

This declares the official Falco rules OCI artifact. The observed Falco logs confirmed that the generated file below passed schema validation:

```text
/etc/falco/rules.d/50-01-falco-rules-oci.yaml
```

The resource reported `PROGRAMMED=True`.

> **Versioning note:** The plugin and rules use the `latest` tag as implemented. For a more reproducible production setup, pin tested versions or immutable artifact digests and update them deliberately.

### 4.7 `devops/flux/infrastructure/falco-operator/kustomization.yaml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - namespace.yaml
  - helmrepository.yaml
  - helmrelease.yaml
  - falco.yaml
  - plugin-container.yaml
  - rules-falco.yaml
```

### 4.8 Parent infrastructure Kustomization

The existing `devops/flux/infrastructure/kustomization.yaml` must include:

```yaml
resources:
  - envoy-gateway
  - images
  - secrets-store-csi
  - falco-operator
```

Keep any other existing resources in the file. Do not replace unrelated infrastructure resources with this snippet.

---

## 5. Implementation and deployment commands

Run these commands from the repository root on the Mac.

### 5.1 Check the Kubernetes context

```bash
kubectl config current-context
kubectl get nodes -o wide
```

The context used during implementation was `kind-tdd-cicd`.

### 5.2 Render the manifests locally

```bash
kubectl kustomize devops/flux/infrastructure/falco-operator
kubectl kustomize devops/flux/infrastructure
```

Check the rendered output for the `Falco`, `Plugin`, and `Rulesfile` resources before committing.

### 5.3 Commit and push changes

Use a commit message that matches the changes. For example, when all Falco resources are ready:

```bash
git add devops/flux/infrastructure/falco-operator \
        devops/flux/infrastructure/kustomization.yaml
git commit -m "feat(falco): configure runtime security"
git push origin main
```

If the changes have already been committed and pushed, do not create an empty duplicate commit.

### 5.4 Reconcile Flux

```bash
flux reconcile kustomization tdd-infrastructure \
  -n flux-system --with-source
```

Expected result: Flux fetches the latest revision and applies it successfully. A successful reconciliation confirms that the manifests were applied; it does not, by itself, prove runtime event detection.

---

## 6. Verify the deployment

### 6.1 Check the Falco custom resource

```bash
kubectl get falcos.instance.falcosecurity.dev -A
```

Observed successful state:

```text
NAMESPACE        NAME    TYPE        VERSION   DESIRED   READY   RECONCILED   AVAILABLE
falco-operator   falco   DaemonSet   0.44.1    1         1       True         True
```

### 6.2 Check the DaemonSet and pods

```bash
kubectl get daemonset falco -n falco-operator
kubectl get pods -n falco-operator -o wide
```

Observed successful state:

```text
falco-ck62s                       2/2   Running   0
falco-operator-5dd8667fb4-8gqbp   1/1   Running   0
```

Pod names can change after reconciliation or rescheduling. Use the current names returned by `kubectl get pods` rather than assuming these exact names will persist.

### 6.3 Check the plugin resource

```bash
kubectl get plugins.artifact.falcosecurity.dev -n falco-operator
kubectl describe plugin container -n falco-operator
```

Expected: `PROGRAMMED=True`.

### 6.4 Check the rules resource

```bash
kubectl get rulesfiles.artifact.falcosecurity.dev -n falco-operator
kubectl describe rulesfile falco-rules -n falco-operator
```

Expected: `PROGRAMMED=True` and priority `50`.

### 6.5 Check Falco logs

```bash
kubectl logs -n falco-operator \
  -l app.kubernetes.io/name=falco \
  -c falco --since=30m
```

The implementation logs showed:

```text
Loaded plugin 'container@0.7.5' from file /usr/share/falco/plugins/container.so
Loading rules from:
/etc/falco/rules.d/50-01-falco-rules-oci.yaml | schema validation: ok
Loaded event sources: syscall
Enabled event sources: syscall
Opening 'syscall' source with modern BPF probe.
```

The final line indicates the probe is being opened; it should not be treated alone as proof of complete syscall coverage. The runtime alert test in Section 7 provides additional evidence.

---

## 7. Runtime detection test

This is the controlled test performed to verify that a configured Falco rule can detect a shell launched inside a container.

### 7.1 Terminal 1: follow Falco logs

```bash
kubectl logs -f -n falco-operator \
  -l app.kubernetes.io/name=falco \
  -c falco --since=1m
```

Keep this terminal open.

### 7.2 Terminal 2: start a temporary BusyBox shell

```bash
kubectl run falco-shell-test \
  --image=busybox:1.36 \
  --restart=Never \
  -it --rm \
  -- sh
```

Inside the container, run:

```sh
id
ls /
exit
```

The `ls/` command (without a space) is not correct; use `ls /`.

### 7.3 Expected detection

During the test, Falco emitted this alert:

```text
Notice A shell was spawned in a container with an attached terminal
evt_type=execve
user=root
process=sh
parent=containerd-shim
command=sh
container_name=falco-shell-test
container_image_repository=docker.io/library/busybox
container_image_tag=1.36
k8s_pod_name=falco-shell-test
k8s_ns_name=default
```

This is evidence that Falco detected the tested shell-spawn event and attached container and Kubernetes metadata to the alert.

The test pod was deleted after the interactive session exited, using `--rm`. To verify cleanup:

```bash
kubectl get pod falco-shell-test
```

A `NotFound` response is expected after cleanup.

### 7.4 What the test proves—and does not prove

**Proven in this environment:**

- Falco was Ready.
- The container plugin was loaded.
- The official rules artifact was programmed and its generated rules file passed schema validation.
- A shell-spawn alert was observed for the temporary BusyBox pod.
- The alert included container image, pod, and namespace metadata.

**Not proven by this single test:**

- Complete syscall coverage on all workloads.
- Detection of every threat or every rule.
- Production readiness on a native Linux host.
- Alert forwarding to an external SIEM, Slack, or other destination.

The local Kind node uses Docker Desktop's LinuxKit kernel on macOS. Validate kernel event capture and workload coverage in the intended deployment environment before relying on Falco as a production control.

---

## 8. Troubleshooting commands

### Falco pod is not Ready

```bash
kubectl describe pod -n falco-operator <falco-pod-name>
kubectl logs -n falco-operator <falco-pod-name> -c falco --tail=150
kubectl logs -n falco-operator <falco-pod-name> -c artifact-operator --tail=100
kubectl get events -n falco-operator --sort-by=.lastTimestamp
```

Replace `<falco-pod-name>` with the current pod name. Check init/container states, probe errors, image pulls, and Kubernetes events.

### Plugin or rules are not programmed

```bash
kubectl describe plugin container -n falco-operator
kubectl describe rulesfile falco-rules -n falco-operator
kubectl logs -n falco-operator <falco-pod-name> -c artifact-operator --tail=150
```

Confirm the OCI registry, artifact reference, and network access. Check the resource's `Status.Conditions` for its current message.

### Inspect Falco's effective configuration

```bash
kubectl get configmap falco -n falco-operator -o yaml
kubectl exec -n falco-operator <falco-pod-name> -c falco -- \
  sh -c 'ls -la /etc/falco/rules.d; find /etc/falco/rules.d -maxdepth 1 -type f'
```

### Check recent detection output

```bash
kubectl logs -n falco-operator \
  -l app.kubernetes.io/name=falco \
  -c falco --since=10m
```

No alert does not automatically mean the probe is broken. The event must match an enabled rule, and logs must cover the period when the test was run.

---

## 9. Kyverno audit warning and privileged mode

During deployment, Kyverno reported a `PolicyViolation` for the `disallow-privileged-containers` policy because the Falco container has:

```yaml
securityContext:
  privileged: true
```

The policy was configured with:

```yaml
validationFailureAction: Audit
```

Therefore, the observed event was an audit finding, not evidence that admission blocked Falco.

Falco's default deployment uses privileged access in this setup. Do not disable the Kyverno policy globally just to remove this warning. If the deployment continues to require privileged mode, document the justification and use a narrowly scoped exception or a policy design that explicitly accounts for the Falco sensor. Review the actual security context and capabilities before changing either the policy or Falco's privileges.

Useful commands:

```bash
kubectl describe pod -n falco-operator <falco-pod-name>
kubectl get clusterpolicy disallow-privileged-containers -o yaml
```

---

## 10. Operations and maintenance

### Check status

```bash
flux get kustomizations -A
flux get helmreleases -A
kubectl get falcos.instance.falcosecurity.dev -A
kubectl get plugins.artifact.falcosecurity.dev -n falco-operator
kubectl get rulesfiles.artifact.falcosecurity.dev -n falco-operator
kubectl get pods -n falco-operator
```

### Apply future changes

1. Update the relevant manifest in Git.
2. Render it with `kubectl kustomize`.
3. Commit and push the change to `main`.
4. Reconcile the existing Flux Kustomization.
5. Verify the resource status, pod readiness, logs, and detection behavior.

```bash
kubectl kustomize devops/flux/infrastructure
git add devops/flux/infrastructure/falco-operator
git commit -m "chore(falco): update configuration"
git push origin main
flux reconcile kustomization tdd-infrastructure \
  -n flux-system --with-source
```

Only stage files relevant to the intended change. Avoid a generic commit if no actual changes are present.

### Remove Falco

Removal should be done through GitOps, not by deleting live resources while their manifests remain in Git. Remove the Falco resources from the Kustomize configuration (or remove the `falco-operator` resource from its parent configuration if removing the whole installation), commit and push, then reconcile Flux and verify what was pruned. Review finalizers and dependent resources before removing the Operator itself.

---

## 11. Final implementation status

| Item | Result |
|---|---|
| Flux GitOps reconciliation | Successful |
| Falco Operator | Running |
| Falco instance / DaemonSet | Available; 1/1 desired pod ready |
| Container plugin | Programmed and loaded |
| Official rules artifact | Programmed; rules file schema validation passed |
| Shell-spawn runtime alert | Observed |
| Temporary test pod | Removed after test |
| Kyverno privileged-mode audit | Observed; exception/design review still required if the warning is to be resolved |
| Native Linux production validation | Not performed |

### Completion statement

Falco has been deployed to the local Kind cluster through Flux GitOps. The container plugin and official rules artifact were programmed, and a controlled BusyBox test produced a shell-spawn alert containing container and Kubernetes metadata. This validates the tested detection path in the local environment; broader runtime coverage and production validation remain separate tasks.
'''
path = Path("/mnt/data/falco-runtime-security-implementation.md")
path.write_text(content, encoding="utf-8")
print(f"Created: {path}")
