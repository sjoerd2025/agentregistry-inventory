# Kubernetes CRDs

The Agent Registry is built as a Kubernetes Operator. It uses Custom Resource Definitions (CRDs) to define the state of the system.

## AgentCatalog

Defines an available agent type and its capabilities.

```yaml
apiVersion: agent.dev/v1alpha1
kind: AgentCatalog
metadata:
  name: gemini-agent
spec:
  displayName: "Gemini AI"
  description: "Google's Gemini model"
  type: "gemini"
  config:
    model: "gemini-1.5-pro"
    maxTokens: 8192
  capabilities:
    - code-generation
    - reasoning
```

## MCPServerCatalog

Defines an MCP Server instance that exposes agents.

```yaml
apiVersion: agent.dev/v1alpha1
kind: MCPServerCatalog
metadata:
  name: default-server
spec:
  port: 8080
  logLevel: "info"
  agents:
    - gemini-agent
    - jules-agent
```

## DiscoveryConfig

Configures how agents are discovered from external sources.

```yaml
apiVersion: agent.dev/v1alpha1
kind: DiscoveryConfig
metadata:
  name: github-discovery
spec:
  source: github
  repository: "myorg/agents"
  path: "manifests/"
  interval: "5m"
```

## Applying Changes

Use `kubectl` to manage these resources:

```bash
# Register a new agent
kubectl apply -f config/samples/agentcatalog_gemini.yaml

# Check status
kubectl get agentcatalog
```
