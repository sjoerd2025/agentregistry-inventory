# Quick Start

Get started with Agent Registry in minutes.

## Prerequisites

- Kubernetes cluster (1.24+)
- `kubectl` configured
- (Optional) Jules API key for Jules agent
- (Optional) Google Cloud credentials for Gemini agent

## Installation

### Option 1: Quick Install

```bash
kubectl apply -f https://github.com/agentregistry-dev/agentregistry/releases/latest/download/install.yaml
```

### Option 2: Helm Chart

```bash
helm repo add agentregistry https://agentregistry.dev/charts
helm install agent-registry agentregistry/agent-registry
```

### Option 3: From Source

```bash
git clone https://github.com/agentregistry-dev/agentregistry.git
cd agentregistry
make deploy
```

## Verify Installation

```bash
# Check controller is running
kubectl get pods -n agentregistry-system

# Check CRDs are installed
kubectl get crds | grep agentregistry
```

## Deploy Your First Agent

Create a Gemini agent:

```yaml
apiVersion: agentregistry.dev/v1alpha1
kind: AgentCatalog
metadata:
  name: gemini-code-gen
spec:
  displayName: "Gemini Code Generator"
  agentType: "gemini"
  capabilities:
    - code_generation
    - research
  configuration:
    model: "gemini-2.0-flash"
```

Apply it:

```bash
kubectl apply -f gemini-agent.yaml
```

## Use the MCP Server

Connect to the MCP server to discover and use agents:

```bash
# Port-forward the MCP server
kubectl port-forward -n agentregistry-system svc/mcp-server 3000:3000

# List available agents
curl http://localhost:3000/mcp/tools/list_agents
```

## Execute a Task

Use the orchestrator to execute a task:

```bash
# Execute a complex task using multiple agents
curl -X POST http://localhost:3000/mcp/tools/orchestrate_complex_task \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Analyze the authentication module and suggest improvements",
    "context": "Focus on security best practices"
  }'
```

## Next Steps

- **[Configuration](configuration.md)**: Configure agents and orchestrator
- **[Architecture](../architecture/README.md)**: Understand the system design
- **[Orchestration Patterns](../orchestration/patterns.md)**: Learn coordination patterns
- **[MCP Tools](../mcp/tools.md)**: Explore available MCP tools
