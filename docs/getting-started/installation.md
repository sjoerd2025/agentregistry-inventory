# Installation

Detailed installation instructions for Agent Registry.

## System Requirements

- **Kubernetes**: 1.24 or later
- **Go**: 1.21+ (for building from source)
- **kubectl**: Configured to access your cluster
- **Memory**: 2GB minimum for controller
- **CPU**: 2 cores minimum

## Installation Methods

### Kubernetes Deployment

#### 1. Install CRDs

```bash
kubectl apply -f https://github.com/agentregistry-dev/agentregistry/releases/latest/download/crds.yaml
```

#### 2. Install Controller

```bash
kubectl apply -f https://github.com/agentregistry-dev/agentregistry/releases/latest/download/controller.yaml
```

#### 3. Install MCP Server

```bash
kubectl apply -f https://github.com/agentregistry-dev/agentregistry/releases/latest/download/mcp-server.yaml
```

### Helm Installation

```bash
# Add repository
helm repo add agentregistry https://agentregistry.dev/charts
helm repo update

# Install with default values
helm install agent-registry agentregistry/agent-registry

# Install with custom values
helm install agent-registry agentregistry/agent-registry \
  --set controller.replicas=2 \
  --set mcp.enabled=true
```

### Local Development

For local development and testing:

```bash
# Clone repository
git clone https://github.com/agentregistry-dev/agentregistry.git
cd agentregistry

# Install dependencies
go mod download

# Run locally (outside cluster)
make run

# Or deploy to cluster
make deploy
```

## Configuration

### Environment Variables

Set these environment variables for the controller:

```bash
# Jules API configuration
export JULES_API_KEY="your-jules-api-key"
export JULES_API_URL="https://api.jules.google.com/v1"

# Google Cloud / Gemini configuration
export GOOGLE_API_KEY="your-google-api-key"
# OR
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials.json"

# ChromaDB configuration (for Retrieval agent)
export CHROMA_HOST="localhost"
export CHROMA_PORT="8000"
```

### Kubernetes Secrets

Create secrets for sensitive configuration:

```bash
# Jules API key
kubectl create secret generic jules-api-key \
  --from-literal=api-key=your-jules-api-key \
  -n agentregistry-system

# Google Cloud credentials
kubectl create secret generic google-credentials \
  --from-file=credentials.json=/path/to/credentials.json \
  -n agentregistry-system
```

## Verification

### Check Installation

```bash
# Verify CRDs
kubectl get crds | grep agentregistry.dev

# Expected output:
# agentcatalogs.agentregistry.dev
# agentdeployments.agentregistry.dev
# discoveryconfigs.agentregistry.dev
```

### Check Controller

```bash
# Check controller pod
kubectl get pods -n agentregistry-system

# View controller logs
kubectl logs -n agentregistry-system -l app=agent-registry-controller
```

### Check MCP Server

```bash
# Port-forward MCP server
kubectl port-forward -n agentregistry-system svc/mcp-server 3000:3000

# Test MCP endpoint
curl http://localhost:3000/health
```

## Troubleshooting

### Controller Not Starting

Check logs for errors:

```bash
kubectl logs -n agentregistry-system -l app=agent-registry-controller --tail=100
```

Common issues:
- Missing environment variables
- Invalid credentials
- Insufficient RBAC permissions

### MCP Server Connection Issues

Verify service is running:

```bash
kubectl get svc -n agentregistry-system mcp-server
kubectl describe svc -n agentregistry-system mcp-server
```

### Agent Registration Failures

Check agent catalog status:

```bash
kubectl get agentcatalogs
kubectl describe agentcatalog <agent-name>
```

## Next Steps

- **[Configuration](configuration.md)**: Configure agents and settings
- **[Architecture](../architecture/README.md)**: Understand the system
- **[Deployment Guide](../guides/deployment.md)**: Production deployment
