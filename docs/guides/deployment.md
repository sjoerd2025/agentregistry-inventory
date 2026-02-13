# Deployment Guide

This guide covers how to deploy the Agent Registry to a Kubernetes cluster.

## Prerequisites

*   Kubernetes Cluster (v1.24+)
*   `kubectl` installed
*   `helm` (optional, for package management)
*   Google Cloud Project (for Gemini API)

## Installation Steps

### 1. Secrets Management

Create a secret for your API keys.

```bash
kubectl create secret generic agent-secrets \
  --from-literal=GOOGLE_API_KEY=your-key \
  --from-literal=JULES_API_KEY=your-key \
  --from-literal=CHROMA_HOST=chromadb-service
```

### 2. Deploy Dependencies (ChromaDB)

Deploy a ChromaDB instance for the Retrieval Agent.

```yaml
# chroma-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chromadb
spec:
  replicas: 1
  selector:
    matchLabels:
      app: chromadb
  template:
    metadata:
      labels:
        app: chromadb
    spec:
      containers:
      - name: chromadb
        image: chromadb/chroma:latest
        ports:
        - containerPort: 8000
```

`kubectl apply -f chroma-deployment.yaml`

### 3. Deploy Agent Registry

Apply the controller manifest.

```bash
kubectl apply -f https://github.com/agentregistry-dev/agentregistry/releases/latest/download/install.yaml
```

Or build from source:

```bash
make docker-build docker-push IMG=myregistry/controller:latest
make deploy IMG=myregistry/controller:latest
```

### 4. Verify Installation

Check if the pods are running:

```bash
kubectl get pods -n agent-system
```

## Configuration

Configure the registry using Environment Variables in the Deployment or via ConfigMaps.

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Logging verbosity | `info` |
| `ENABLE_WEBHOOKS` | Enable validating webhooks | `true` |
| `METRICS_ADDR` | Prometheus metrics port | `:8080` |

## Production Best Practices

*   **Resource Limits**: Always set CPU/Memory requests and limits for the controller.
*   **HA**: Run multiple replicas of the controller for high availability (requires Leader Election enabled).
*   **Security**: Use Workload Identity for Google Cloud authentication instead of long-lived API keys.
*   **Monitoring**: Scrape the `:8080/metrics` endpoint with Prometheus/Grafana.
