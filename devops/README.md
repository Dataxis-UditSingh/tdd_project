# TDD React TypeScript Project DevOps Documentation

## Project Overview

This repository contains a monorepo setup for the TDD React TypeScript project. The project includes frontend and backend components, along with various DevOps configurations and tools.

## DevOps Architecture

The DevOps architecture is designed to automate CI/CD workflows using Tekton pipelines and manage infrastructure using Flux. Key components include:

- **Tekton Pipelines**: For continuous integration and delivery.
- **Flux**: For GitOps-based Kubernetes cluster management.
- **Docker**: For containerizing frontend and backend applications.
- **Kubernetes**: For running containerized applications.
- **Kyverno**: For policy enforcement in Kubernetes.
- **OpenBAO**: For additional security features.

## Repository and Folder Structure

```
devops/
├── docker/
│   ├── backend/
│   │   └── Dockerfile
│   └── frontend/
│       ├── Dockerfile
│       └── nginx.conf
├── flux/
│   ├── bootstrap/
│   ├── applications/
│   ├── infrastructure/
│   └── kustomization.yaml
├── tekton/
│   ├── config/
│   ├── pipelines/
│   ├── rbac/
│   ├── serviceaccounts/
│   ├── tasks/
│   └── triggers/
└── README.md
```

## Technology Stack and Tools

### CI/CD Pipelines

- **Tekton**: Automates the build, test, and deployment process.
  - Backend Pipeline: `devops/tekton/pipelines/backend-ci.yaml`
  - Frontend Pipeline: `devops/tekton/pipelines/frontend-ci.yaml`

### Docker

- **Backend Dockerfile**: `devops/docker/backend/Dockerfile`
- **Frontend Dockerfile**: `devops/docker/frontend/Dockerfile`

### Kubernetes Deployments

- Backend Deployment: `devops/flux/applications/backend/deployment.yaml`
- Frontend Deployment: `devops/flux/applications/frontend/deployment.yaml`

### Flux Management

- **Flux Bootstrap**: Manages cluster state based on Git repositories.
  - Infrastructure: `devops/flux/bootstrap/infrastructure-kustomization.yaml`
  - KEDA: `devops/flux/bootstrap/keda-kustomization.yaml`
  - Kyverno: `devops/flux/bootstrap/kyverno-kustomization.yaml`
  - OpenBAO: `devops/flux/bootstrap/openbao-kustomization.yaml`
  - Applications: `devops/flux/bootstrap/applications-kustomization.yaml`

### Additional Tools

- **Kyverno**: Policy engine for Kubernetes.
- **OpenBAO**: Security management tool.

## Local Development and Prerequisites

To set up local development, ensure you have the following tools installed:

- Docker
- Kubernetes (e.g., Minikube or Kind)
- Tekton CLI (`tkn`)
- Flux CLI (`flux`)

### Steps to Set Up Local Environment

1. **Clone the Repository**:
   ```sh
   git clone https://github.com/Dataxis-UditSingh/tdd_project.git
   cd tdd_project
   ```

2. **Install Dependencies**:
   ```sh
   npm ci
   ```

3. **Start Docker Containers**:
   ```sh
   docker-compose up -d
   ```

4. **Deploy to Kubernetes** (using Flux):
   ```sh
   flux bootstrap github \
     --owner=Dataxis-UditSingh \
     --repository=tdd_project \
     --branch=main \
     --namespace=flux-system \
     --personal
   ```

## Docker Build and Run Instructions

### Backend

1. **Build the Docker Image**:
   ```sh
   docker build -t uditdataxis12345/tdd-react-backend:latest -f devops/docker/backend/Dockerfile .
   ```

2. **Run the Container**:
   ```sh
   docker run -d -p 3000:3000 --name tdd-backend uditdataxis12345/tdd-react-backend:latest
   ```

### Frontend

1. **Build the Docker Image**:
   ```sh
   docker build -t uditdataxis12345/tdd-react-frontend:latest -f devops/docker/frontend/Dockerfile .
   ```

2. **Run the Container**:
   ```sh
   docker run -d -p 80:80 --name tdd-frontend uditdataxis12345/tdd-react-frontend:latest
   ```

## Kubernetes Deployment Workflow

The deployment workflow is managed by Flux, which synchronizes the cluster state with the Git repository. Key steps include:

1. **Bootstrap Flux**:
   ```sh
   flux bootstrap github \
     --owner=Dataxis-UditSingh \
     --repository=tdd_project \
     --branch=main \
     --namespace=flux-system \
     --personal
   ```

2. **Deploy Applications**:
   - Backend: `devops/flux/applications/backend/deployment.yaml`
   - Frontend: `devops/flux/applications/frontend/deployment.yaml`

## Tekton CI Pipeline

The backend and frontend CI pipelines are defined in the following YAML files:

- **Backend CI**: `devops/tekton/pipelines/backend-ci.yaml`
- **Frontend CI**: `devops/tekton/pipelines/frontend-ci.yaml`

These pipelines perform tasks such as cloning the repository, running tests, building the application, pushing images to Docker Hub, and signing the images.

## FluxCD GitOps Workflow

FluxCD manages the Kubernetes cluster state by syncing with the Git repository. Key configurations include:

- **Bootstrap**: `devops/flux/bootstrap/*.yaml`
- **Applications**: `devops/flux/applications/*.yaml`

## Image Automation

Image automation is handled by Tekton pipelines, which build and push Docker images to Docker Hub.

## Environment Variables and Secrets Handling

Secrets are managed using Kubernetes secrets. For example:

```sh
kubectl create secret generic tdd-backend-secrets --from-literal=OTEL_LOGS_ENDPOINT=http://otel-collector:4317 --from-literal=OTEL_METRICS_ENDPOINT=http://otel-collector:8889 -n tdd-backend
```

## Troubleshooting

- **Check Flux Synchronization**:
  ```sh
  flux get sources git
  flux get kustomizations
  ```

- **View Tekton Pipeline Runs**:
  ```sh
  tkn pipeline list
  tkn pipelinerun list
  ```

- **Check Kubernetes Deployments**:
  ```sh
  kubectl get pods -n tdd-backend
  kubectl get pods -n tdd-frontend
  ```

This README.md file provides an overview of the DevOps setup, configurations, and workflows for the TDD React TypeScript project.