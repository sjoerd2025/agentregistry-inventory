# MCP Tools Reference

Complete reference for all MCP tools provided by Agent Registry.

## Agent Management

### list_agents

List all registered agents in the orchestrator.

**Parameters**: None

**Returns**:
```json
{
  "agents": [
    {"name": "gemini", "type": "gemini"},
    {"name": "jules", "type": "jules"},
    {"name": "retrieval", "type": "retrieval"}
  ]
}
```

**Example**:
```bash
curl http://localhost:3000/mcp/tools/list_orchestrator_agents
```

## Orchestration Tools

### orchestrate_complex_task

Execute a complex task using multiple agents in swarm pattern.

**Parameters**:
- `description` (required): Natural language task description
- `context` (optional): Additional context

**Returns**:
```json
{
  "task_id": "complex-1234567890",
  "description": "Analyze codebase",
  "status": "success",
  "output": {
    "gemini": "Code analysis results...",
    "retrieval": "Best practices..."
  },
  "metadata": {
    "agents_used": ["gemini", "retrieval"],
    "execution_time_ms": 5432
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/mcp/tools/orchestrate_complex_task \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Analyze authentication module and suggest security improvements",
    "context": "Focus on OAuth2 implementation"
  }'
```

### execute_agent_swarm

Execute a task across specific agents in parallel.

**Parameters**:
- `task_description` (required): Task for all agents
- `agent_types` (required): Comma-separated agent types (e.g., "gemini,retrieval")

**Returns**:
```json
{
  "task_id": "swarm-1234567890",
  "agents": ["gemini", "retrieval"],
  "results": {
    "gemini": {"success": true, "output": "..."},
    "retrieval": {"success": true, "output": "..."}
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/mcp/tools/execute_agent_swarm \
  -H "Content-Type: application/json" \
  -d '{
    "task_description": "Review API security",
    "agent_types": "gemini,retrieval"
  }'
```

### execute_supervised_task

Execute a task using supervised pattern (Jules coordinates Gemini swarm).

**Parameters**:
- `description` (required): Task description

**Returns**:
```json
{
  "task_id": "supervised-1234567890",
  "description": "Implement new feature",
  "status": "success",
  "output": {
    "session_id": "jules-session-123",
    "pr_url": "https://github.com/owner/repo/pull/456"
  },
  "metadata": {
    "swarm_results": {...},
    "git_operations": {...}
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/mcp/tools/execute_supervised_task \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Research best practices and implement rate limiting"
  }'
```

## Jules Tools

### execute_jules_git_task

Execute a Git operation using the Jules agent.

**Parameters**:
- `repository` (required): GitHub repository (format: "owner/repo")
- `prompt` (required): Natural language description of Git task
- `branch` (optional): Target branch (default: "main")
- `wait` (optional): Wait for completion (default: false)

**Returns**:
```json
{
  "session_id": "jules-abc123",
  "status": "in_progress",
  "pr_url": "https://github.com/owner/repo/pull/123",
  "repository": "owner/repo"
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/mcp/tools/execute_jules_git_task \
  -H "Content-Type: application/json" \
  -d '{
    "repository": "myorg/myrepo",
    "prompt": "Add unit tests for the authentication module",
    "branch": "main",
    "wait": true
  }'
```

## Catalog Management

### list_catalog_items

List all agent catalog items.

**Parameters**:
- `namespace` (optional): Kubernetes namespace
- `labels` (optional): Label selector

**Returns**:
```json
{
  "items": [
    {
      "name": "gemini-agent",
      "namespace": "default",
      "agentType": "gemini",
      "capabilities": ["code_generation", "research"]
    }
  ]
}
```

### get_catalog_item

Get details of a specific catalog item.

**Parameters**:
- `name` (required): Catalog item name
- `namespace` (optional): Kubernetes namespace (default: "default")

**Returns**:
```json
{
  "name": "gemini-agent",
  "namespace": "default",
  "spec": {
    "displayName": "Gemini AI Agent",
    "agentType": "gemini",
    "capabilities": ["code_generation", "research"],
    "configuration": {...}
  },
  "status": {
    "phase": "Ready",
    "conditions": [...]
  }
}
```

## Deployment Management

### list_deployments

List all agent deployments.

**Parameters**:
- `namespace` (optional): Kubernetes namespace
- `labels` (optional): Label selector

**Returns**:
```json
{
  "deployments": [
    {
      "name": "gemini-deployment",
      "namespace": "default",
      "catalogRef": "gemini-agent",
      "replicas": 1,
      "status": "Running"
    }
  ]
}
```

### create_deployment

Create a new agent deployment.

**Parameters**:
- `name` (required): Deployment name
- `catalogRef` (required): Reference to AgentCatalog
- `namespace` (optional): Kubernetes namespace
- `replicas` (optional): Number of replicas

**Returns**:
```json
{
  "name": "my-deployment",
  "namespace": "default",
  "status": "Created"
}
```

## Knowledge Base Tools

### query_knowledge

Query the ChromaDB knowledge base via Retrieval agent.

**Parameters**:
- `query` (required): Natural language query
- `top_k` (optional): Number of results (default: 5)
- `filters` (optional): Metadata filters

**Returns**:
```json
{
  "results": [
    {
      "document": "Content...",
      "metadata": {"source": "docs", "category": "architecture"},
      "similarity": 0.92
    }
  ],
  "query": "How does orchestration work?"
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/mcp/tools/query_knowledge \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the orchestration patterns?",
    "top_k": 3
  }'
```

## Error Responses

All tools return errors in this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {...}
}
```

Common error codes:
- `INVALID_INPUT`: Invalid parameters
- `NOT_FOUND`: Resource not found
- `EXECUTION_FAILED`: Task execution failed
- `TIMEOUT`: Operation timed out
- `UNAUTHORIZED`: Authentication required

## Rate Limiting

MCP tools are rate-limited:
- **Default**: 100 requests per minute per client
- **Burst**: 20 requests

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

## Next Steps

- **[Resources](resources.md)**: MCP resources
- **[Prompts](prompts.md)**: Pre-built prompts
- **[Orchestration Examples](../orchestration/examples.md)**: Usage examples
