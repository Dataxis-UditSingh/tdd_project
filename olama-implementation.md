
> **Purpose:** This document records the DevOps implementation work discussed for `tdd-react-typescript-app`, from the initial local setup through Kubernetes deployment, GitOps, image automation, security work, and staging-oriented validation.
>
> **Accuracy note:** This is a consolidated implementation history based on the project details and command outputs shared during the work. It distinguishes verified results from attempted or unfinished work. Before treating it as the definitive repository runbook, compare paths and current manifests against the latest GitHub checkout.

## 1. Project Scope

The project is a React + TypeScript application with a backend service, packaged and deployed as containers. The DevOps work has focused on:

- Local Docker builds and container execution.
- Kubernetes cluster and namespace setup.
- Tekton-based CI pipelines.
- Docker Hub image publishing.
- FluxCD GitOps reconciliation.
- Kustomize-based manifest organization.
- Envoy Gateway in place of the earlier NGINX ingress approach.
- Automated image discovery and tag updates through Flux image automation.
- Application observability dependencies and test setup.
- Image signing with Cosign.
- Kubernetes backup/restore experimentation with Velero.
- Staging-oriented validation and documentation.

### Main application components

| Component | Known implementation |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js/TypeScript service; project runtime uses port `4000` in the TDD app setup |
| Frontend container | Served through a container image; Kubernetes Service exposes port `80` |
| Backend container | Kubernetes Service exposes port `4000` |
| Container registry | Docker Hub |
| CI | Tekton Pipelines |
| GitOps/CD | FluxCD |
| Manifest customization | Kustomize |
| Gateway | Envoy Gateway |
| Tests | Vitest; Playwright end-to-end scripts are present in the frontend package manifest |
| Logging/telemetry libraries | LogLayer and OpenTelemetry packages are present in the frontend package manifest |

The exact backend API surface, production secrets, external dependencies, and final ingress hostname should be verified against the current repository and cluster.

---

## 2. Implementation Timeline and Stages

## Stage 1 — Local development and application verification

### Work performed

- Set up and worked on the `tdd-react-typescript-app` project on macOS.
- Used a React + TypeScript frontend and a Node.js/TypeScript backend.
- Added/used Vitest for frontend tests.
- Resolved a coverage dependency issue involving `@vitest/coverage-v8`.
- Confirmed that the test command could run successfully in the development workflow.
- Added Playwright-related scripts for end-to-end testing in the frontend package manifest.

### Frontend scripts observed in `frontend/package.json`

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:report": "playwright show-report"
}
```

The observed frontend package name was `tdd-challenge-frontend`. These values were returned by running `cat frontend/package.json` in the workspace.

### Validation commands

```bash
cd frontend
npm run test
npm run build
```

End-to-end scripts are configured, but their presence alone does not prove that every Playwright test has passed in CI.

---

## Stage 2 — Docker image builds and local container testing

### Work performed

- Created/used Dockerfiles for the frontend and backend.
- Built frontend and backend container images locally.
- Tested the frontend container locally.
- Deferred the Docker Hub image push to the Tekton workflow rather than relying solely on manual pushes.

A previously successful frontend build/run pattern was:

```bash
docker build -t tdd-react-frontend:local .
docker run --rm -p 8080:80 tdd-react-frontend:local
```

> These commands are illustrative local examples. Use the actual Dockerfile directory and current image names from the repository. Earlier project commands also used the name `application1-frontend`; do not mix those older application names with the current TDD project.

### Docker Hub

The registry namespace used during the project was:

```text
uditdataxis12345
```

Later Kubernetes manifests referenced images in this namespace, including:

```text
docker.io/uditdataxis12345/tdd-react-frontend:<tag>
docker.io/uditdataxis12345/tdd-react-backend:<tag>
```

The project moved toward immutable, timestamp-plus-commit tags rather than relying only on a mutable tag such as `latest`.

---

## Stage 3 — Kubernetes local cluster and namespace setup

### Work performed

- Worked with a local Kubernetes cluster.
- Used `kubectl` to inspect cluster context, namespaces, workloads, Services, and pipeline resources.
- Created application namespaces and the `tekton-pipelines` namespace as needed.
- Organized the application around separate frontend and backend workloads.
- Used Kubernetes Deployments and ClusterIP Services for application components.

During the project, the current context at one point was:

```text
kind-velero-restore-test
```

This is evidence of a local `kind` cluster being used for Velero restore testing; it should not be assumed to be the only or final cluster context.

### Application networking observed

| Workload | Kubernetes Service port |
|---|---:|
| `tdd-frontend` | `80` |
| `tdd-backend` | `4000` |

The backend Service is internal to the cluster unless an explicit Gateway/route exposes it. Confirm the current Service and route manifests before relying on this table for a deployment.

### Useful inspection commands

```bash
kubectl config current-context
kubectl get namespaces
kubectl get deployments -A
kubectl get pods -A
kubectl get services -A
kubectl get events -A --sort-by=.lastTimestamp
```

### Important lessons from troubleshooting

- A Pod can remain Pending when a required PersistentVolumeClaim does not exist.
- `ImagePullBackOff` can indicate that a referenced image tag or manifest is missing.
- A Deployment being created does not prove the application is healthy; inspect Pod events, readiness, and logs.

---

## Stage 4 — Tekton CI pipeline implementation

### Goal

Build a repeatable Kubernetes-native CI flow that clones source, builds application images, and pushes the resulting images to Docker Hub.

### Work performed

- Created Tekton Task and Pipeline YAMLs for application builds.
- Added/used a Git-clone Task.
- Added/used an image-build Task based on Buildah.
- Created application Pipeline and PipelineRun manifests.
- Configured a pipeline ServiceAccount.
- Created a Docker registry Secret named `dockerhub-secret`.
- Used a workspace PVC for source/workspace sharing.
- Ran PipelineRuns and inspected task results and events.

### Resources and names observed during troubleshooting

- `tekton-pipelines` namespace
- `pipeline-serviceaccount`
- `dockerhub-secret`
- `tekton-workspace-pvc`
- `app1-backend-pipeline`
- `app1-backend-pipelinerun`
- `app2-frontend-pipeline`
- `app2-frontend-pipelinerun`

Some names above originated in an earlier multi-application setup and may not all be current TDD project resource names. Verify the current YAML before copying them into commands.

### Issues encountered and resolved/diagnosed

1. **`CouldntGetTask`** — a PipelineRun referenced a Task that was not present in the cluster. The required Task needed to be installed in the expected namespace.
2. **Missing ServiceAccount** — the PipelineRun referenced `pipeline-serviceaccount`; a corresponding ServiceAccount manifest was created.
3. **Missing registry Secret** — the `dockerhub-secret` Secret was created for registry authentication.
4. **Missing workspace PVC** — a PipelineRun Pod was Pending because `tekton-workspace-pvc` was not found. A workspace PVC manifest existed under the infrastructure repository.
5. **Buildah Dockerfile path issue** — an earlier pipeline run failed because it expected `/workspace/source/devops/docker/frontend/Dockerfile`, but the cloned workspace did not contain the file at that location. The workspace mount and actual Dockerfile path must match.
6. **Image pull failure** — a workload referenced `uditdataxis12345/application1-backend:1`, but the registry reported that the manifest/tag did not exist. The image reference in the Deployment must exactly match a tag that was successfully pushed.

### Verification commands

```bash
kubectl get tasks -A
kubectl get pipelines -A
kubectl get pipelineruns -A
kubectl describe pipelinerun <pipelinerun-name> -n <namespace>
kubectl get pods -n tekton-pipelines
kubectl logs -n tekton-pipelines <pod-name> -c step-<step-name>
```

A successful PipelineRun was observed for an earlier `app1-backend-pipelinerun`. An `app2-frontend-pipelinerun` was also observed in a Succeeded state during the earlier work. Those results are historical and do not establish the state of the latest pipeline revision.

---

## Stage 5 — GitOps repository and Kustomize organization

### Work performed

- Organized infrastructure and GitOps manifests into a repository structure.
- Created Flux-related templates and application deployment manifests.
- Used Kustomize to compose Kubernetes resources.
- Kept application configuration in Git so Flux could reconcile cluster state from the repository.
- Pushed changes to the GitHub repository:

```text
https://github.com/Dataxis-UditSingh/tdd_project.git
```

The project context also refers to the local application workspace `tdd-react-typescript-app`; verify whether the GitHub repository above is the canonical DevOps/GitOps repository or a related application repository before documenting it as the only source of truth.

### Manifest areas discussed

- `devops/flux/`
- `devops/flux/infrastructure/`
- `devops/flux/infrastructure/envoy-gateway/`
- `devops/flux/infrastructure/images/`
- Application-specific GitOps paths for frontend and backend deployments.
- Flux image repository, image policy, and image update automation manifests.

The exact current folder tree should be confirmed using `find devops -maxdepth ... -type f` or by inspecting the latest repository checkout.

### Kustomize validation

The following command was used to render composed manifests:

```bash
kubectl kustomize devops/flux
```

Rendered output included Envoy Gateway infrastructure resources and the `tdd-frontend` and `tdd-backend` application Services/Deployments.

### FluxCD status

A Flux Kustomization named `tdd-project` was reported as Ready and applied at:

```text
main@sha1:2dad42f1
```

This confirms that Flux had reconciled that revision at the time of the reported status. It does not guarantee that the current branch or cluster remains at that revision.

Useful commands:

```bash
flux get sources all -A
flux get kustomizations -A
flux reconcile source git <source-name> -n flux-system
flux reconcile kustomization tdd-project -n flux-system
kubectl get kustomizations.kustomize.toolkit.fluxcd.io -A
```

Replace names/namespaces with those found in the current cluster.

---

## Stage 6 — Envoy Gateway migration

### Work performed

- Removed the earlier NGINX-based approach from the intended architecture.
- Added an `envoy-gateway` directory under `devops/flux/infrastructure/`.
- Rendered Envoy Gateway-related manifests through Kustomize.
- Included the Gateway infrastructure alongside application Services and Deployments.

### Validation performed

The rendered Kustomize output included a namespace named `envoy-gateway-system` and application Services/Deployments.

### Items to verify before calling this production-ready

- Envoy Gateway controller Pod readiness.
- GatewayClass and Gateway status conditions.
- HTTPRoute parent references and route acceptance.
- DNS and TLS configuration, if required.
- End-to-end access to frontend and backend routes.

Example checks:

```bash
kubectl get pods -n envoy-gateway-system
kubectl get gatewayclass
kubectl get gateway -A
kubectl get httproute -A
kubectl describe gateway <gateway-name> -n <namespace>
kubectl describe httproute <route-name> -n <namespace>
```

The presence of manifests alone does not prove that external routing, DNS, or TLS was fully validated.

---

## Stage 7 — Flux image automation

### Goal

Allow Flux to discover new images and update Git-managed deployment references when a new eligible tag is published.

### Work performed

Created or discussed manifests for:

- `ImageRepository`
- `ImagePolicy`
- `ImageUpdateAutomation`

for frontend and backend images under the DevOps Flux infrastructure image configuration.

The image tag filter used was:

```regex
^[0-9]{14}-[a-f0-9]{7}$
```

This pattern matches a 14-digit timestamp followed by a hyphen and a seven-character lowercase hexadecimal Git commit prefix. It was intended to select timestamp/commit-based tags.

### Example image tags observed

```text
docker.io/uditdataxis12345/tdd-react-backend:20260901082133-3b4deef
docker.io/uditdataxis12345/tdd-react-frontend:20260902065933-1feb6d4
```

These are historical observed tags, not necessarily the newest tags currently in the registry.

### Expected flow

1. Tekton builds an image.
2. The pipeline pushes the image to Docker Hub with the timestamp/commit tag.
3. Flux `ImageRepository` scans the registry.
4. `ImagePolicy` selects a tag matching the filter and ordering policy.
5. `ImageUpdateAutomation` writes the selected image reference into the GitOps repository.
6. Flux reconciles the changed Git revision to the cluster.

### Validation commands

```bash
flux get image repository -A
flux get image policy -A
flux get image update automation -A
kubectl get imagerepositories,imagepolicies,imageupdateautomations -A
```

Confirm the installed CRDs and exact command syntax for the Flux version in use.

### Important distinction

Creating the automation YAMLs is not sufficient by itself. Confirm the registry scan, selected policy tag, Git commit generated by image automation, and subsequent successful reconciliation before marking the full automatic release loop as verified.

---

## Stage 8 — Testing and observability

### Testing

The frontend package manifest includes:

- Vitest unit tests
- Vitest watch mode
- Vitest coverage
- Playwright end-to-end test and UI/report commands

Observed scripts:

```bash
npm run test
npm run test:watch
npm run test:coverage
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:report
```

The existence of scripts should not be treated as proof that every suite runs successfully in CI. Record actual command results in the pipeline logs.

### Logging and telemetry

The frontend package includes LogLayer and OpenTelemetry dependencies, including packages for logs, metrics, traces, and fetch instrumentation. This indicates application-level instrumentation dependencies are present, but it does not prove that a collector, backend, dashboards, or alerting stack is deployed.

Verify the current code and manifests for:
- Instrumentation initialization.
- OTLP endpoint configuration.
- Collector deployment and service.
- Export success and runtime telemetry.

---

## Stage 9 — Image signing with Cosign

### Work performed

- Configured a Cosign signing Task and executed a standalone signing operation.
- A `cosign-sign-image` TaskRun was reported as successful after moving Docker configuration to `/docker-config`.
- A frontend image was signed and its signature was verified using the repository key.

Observed image:

```text
docker.io/uditdataxis12345/tdd-react-frontend:20261015050328-b29feae
```

Reported digest began with:

```text
sha256:b2ae8ec...
```

The full digest should be taken from the original Cosign output rather than reconstructed from this abbreviated record.

A transparency log index was reported:

```text
3260396700
```

### Incomplete item

The end-to-end pipeline integration was **not yet fully verified** in the recorded history. The remaining work noted was:

- Commit and push the corrected Task YAML.
- Prefer signing the immutable image digest rather than a mutable tag.
- Run a fresh frontend PipelineRun with the signing step integrated.
- Verify that the complete pipeline, signature publication, and signature verification all succeed.

Therefore, the accurate status is: **standalone signing/verification succeeded for one image; full automatic build-and-sign pipeline integration remained pending confirmation.**

---

## Stage 10 — Velero backup and restore experimentation

### Work performed

- Created or used a local `kind` cluster for restore testing.
- Inspected the current Kubernetes context.
- Created a `velero` namespace.
- Prepared a `cloud-credentials` Secret from a local cloud credentials file.
- Worked through Velero installation/configuration and backup/restore troubleshooting.

A command pattern used during setup was:

```bash
kubectl config current-context
kubectl create namespace velero
kubectl create secret generic cloud-credentials \
  --namespace velero \
  --from-file=cloud="$HOME/.config/<provider-credentials-file>"
```

The provider-specific credentials filename and complete Velero install arguments must be taken from the actual local configuration. Do not paste secret contents into documentation or commit them to Git.

### Status boundary

The context confirms Velero setup and restore testing were in progress, but does not establish a final successful backup and restore of the entire application. Verify backup status, restore status, restored resources, and application health before calling disaster recovery fully validated.

Useful checks:

```bash
kubectl get pods -n velero
velero backup get
velero restore get
velero backup describe <backup-name> --details
velero restore describe <restore-name> --details
```

---

## Stage 11 — Staging and release validation

The implementation used a GitOps approach in which Git is the desired-state source and Flux reconciles Kubernetes resources. A reliable staging promotion process should be recorded and followed consistently.

### Staging workflow

1. Develop a change on a feature branch.
2. Run frontend build and tests locally.
3. Build and test container images.
4. Open/merge the change into the staging branch according to the repository's branch policy.
5. Allow Tekton to clone the intended commit, build the frontend/backend images, tag them, and push them to Docker Hub.
6. Confirm that the published image tags exist in the registry.
7. Confirm that Flux image automation selects the intended tag, if automatic image updates are enabled for staging.
8. Review the resulting GitOps diff/commit.
9. Confirm Flux reconciles the expected revision.
10. Verify Deployments, Pods, Services, Gateway/HTTPRoutes, application health, and logs.
11. Run smoke tests and relevant automated tests.
12. Promote the verified release to the production branch only through the intended review process.

### Useful staging checks

```bash
git status
git branch --show-current
git log -5 --oneline

kubectl get deployments,pods,services -A
kubectl get events -A --sort-by=.lastTimestamp

flux get kustomizations -A
flux get image repository -A
flux get image policy -A
flux get image update automation -A
```

Use the correct cluster context and namespace before running deployment commands.

### Important staging caveat

The recorded context contains successful individual components and Flux reconciliation, but it does **not** prove that every step above has been completed as one uninterrupted, end-to-end staging release on the latest commit. Treat the list as the release validation checklist and mark each step from fresh command output.

---

## 3. Common Troubleshooting Reference

| Symptom | Likely area to inspect | Useful checks |
|---|---|---|
| Tekton `CouldntGetTask` | Task missing or wrong namespace/name | `kubectl get tasks -A`, `kubectl describe pipelinerun ...` |
| Pipeline Pod Pending | Workspace PVC, scheduling, permissions | `kubectl describe pod ...`, `kubectl get pvc -A` |
| Build step cannot find Dockerfile | Clone/workspace path mismatch | Inspect workspace mount and `find` output in the cloned source |
| `ImagePullBackOff` | Wrong image name/tag, registry auth, missing manifest | `kubectl describe pod ...`, inspect registry tag |
| Flux not applying changes | Git source, Kustomization, build errors | `flux get sources all -A`, `flux get kustomizations -A` |
| Image automation does not update Git | Registry scan, tag filter, policy, write permissions, update path | Inspect ImageRepository, ImagePolicy, ImageUpdateAutomation status |
| Gateway route unavailable | GatewayClass/Gateway/HTTPRoute status, listeners, DNS/TLS | `kubectl get gatewayclass,gateway,httproute -A` |
| Cosign verification fails | Wrong digest, key, signature reference, or registry access | Verify the immutable digest and use the matching public key |
| Velero restore incomplete | Backup contents, storage location, permissions, restore errors | `velero backup describe ... --details`, `velero restore describe ... --details` |

---

## 4. Security and Reliability Practices

- Store registry credentials in Kubernetes Secrets or an approved secret-management system; never commit credentials.
- Avoid printing secrets in CI logs.
- Prefer immutable image tags and deploy by digest where practical.
- Sign the exact image digest that is deployed.
- Verify signatures using the expected trusted key or identity.
- Restrict ServiceAccount permissions to the minimum needed by the pipeline.
- Keep staging and production configuration clearly separated.
- Require a successful build, tests, registry push, GitOps diff review, and rollout health checks before promotion.
- Keep backup credentials outside the repository and test restores, not only backups.
- Record the exact Git commit, image tag/digest, and Flux-applied revision for each release.

---

## 5. Current Status Summary

| Area | Recorded status | What is still needed to claim full completion |
|---|---|---|
| Local frontend tests | Vitest setup used; tests were reported green in development | Re-run current test and build commands |
| Docker images | Local builds and container tests performed | Confirm latest images/tags and reproducibility |
| Tekton CI | Tasks, Pipelines, credentials, workspace, and successful historical PipelineRuns | Fresh successful run on the current staging commit |
| Kustomize | Manifest rendering was performed | Render current checkout and validate all resources |
| FluxCD GitOps | `tdd-project` was reported Ready at a specific historical revision | Confirm current source and Kustomization are Ready |
| Envoy Gateway | Manifests were added/rendered | Confirm controller, Gateway, routes, DNS/TLS, and smoke test |
| Flux image automation | Repository, policy, and automation manifests created/discussed | Confirm a new tag is selected, committed, and deployed automatically |
| Cosign | Standalone signing and verification succeeded for one frontend image | Finish and verify full pipeline-integrated digest signing |
| Velero | Setup and restore experimentation performed | Prove a complete backup and successful restore with application health |
| Staging release | Workflow and validation steps documented | Capture fresh evidence for the complete release on the intended staging branch |

---

## 6. Final End-to-End Acceptance Checklist

Use this checklist before declaring the DevOps implementation complete:

- [ ] Current Git commit and staging branch confirmed.
- [ ] Frontend build succeeds.
- [ ] Unit tests and relevant end-to-end tests pass.
- [ ] Frontend and backend images build successfully.
- [ ] Images are pushed with the expected immutable tags.
- [ ] Registry contains the expected tags and digests.
- [ ] Tekton PipelineRun succeeds on the intended commit.
- [ ] Image signing succeeds against the image digest, if enabled.
- [ ] Cosign verification succeeds using the trusted verification material.
- [ ] Flux source and Kustomization are Ready.
- [ ] Image automation selects and commits the intended tag, if enabled.
- [ ] The expected GitOps revision is applied.
- [ ] Kubernetes Deployments roll out successfully.
- [ ] Pods are Ready and have no unresolved image pull or scheduling errors.
- [ ] Services and Envoy Gateway routes are healthy.
- [ ] Staging smoke tests pass.
- [ ] Logs and telemetry are checked for startup/runtime errors.
- [ ] A Velero restore test is completed if disaster recovery is in scope.
- [ ] Release evidence (Git commit, image tag/digest, PipelineRun, Flux revision, smoke-test result) is recorded.

## 7. Source-of-Truth Rule

This file is a consolidated implementation record, not a replacement for the repository's live manifests. When details differ, the current checked-out code, Kubernetes resources, Tekton/Flux status, registry metadata, and actual command output are authoritative. Update this document whenever a pipeline, image naming convention, branch strategy, gateway route, or deployment workflow changes.
'''
out = "/mnt/data/DEVOPS_IMPLEMENTATION.md"
pypandoc.convert_text(content, "md", format="md", outputfile=out, extra_args=["--standalone"])
print(f"Created: {out}\nBytes: {os.path.getsize(out)}\nLines: {len(content.splitlines())}")
