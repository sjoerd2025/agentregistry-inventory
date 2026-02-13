# MCP Resources

Resources in MCP represent read-only data that can be injected into an LLM's context. The Agent Registry exposes the contents of the Agent Catalog and Discovery Configs as resources.

## URI Scheme

All resources are exposed under the `agent://` custom scheme.

| Resource Type | URI Pattern | Description |
|---------------|-------------|-------------|
| **Agent Catalog** | `agent://catalog/agents` | List of all registered agents and their statuses. |
| **Agent Details** | `agent://catalog/agents/{name}` | Detailed configuration for a specific agent. |
| **Discovery Config** | `agent://catalog/discovery` | Active discovery configurations. |

## Usage Examples

### Listing Agents

A client can request `agent://catalog/agents` to see available capabilities:

```json
[
  {
    "metadata": { "name": "gemini-agent" },
    "spec": {
      "type": "gemini",
      "capabilities": ["reasoning", "code"]
    },
    "status": { "phase": "Ready" }
  },
  {
    "metadata": { "name": "jules-agent" },
    "spec": { "type": "jules" }
  }
]
```

### Reading Agent Details

Requesting `agent://catalog/agents/gemini-agent` returns the full CRD YAML/JSON content, allowing the LLM to inspect the agent's configuration.

## Implementation Details

Resources are handled in `internal/mcp/server.go`. The server watches the Kubernetes `AgentCatalog` resources and updates the MCP resource list dynamically.

```go
func (s *MCPServer) ListResources(ctx context.Context, req *mcp.ListResourcesRequest) (*mcp.ListResourcesResult, error) {
    // ... logic to fetch from K8s client ...
}
```
