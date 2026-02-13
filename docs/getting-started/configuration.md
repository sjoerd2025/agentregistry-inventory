# Configuration

Configure Agent Registry for your environment.

## Controller Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `JULES_API_KEY` | Jules API authentication key | For Jules agent | - |
| `JULES_API_URL` | Jules API endpoint | No | `https://api.jules.google.com/v1` |
| `GOOGLE_API_KEY` | Google API key for Gemini | For Gemini agent | - |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to GCP credentials JSON | Alternative to API key | - |
| `CHROMA_HOST` | ChromaDB host for knowledge retrieval | For Retrieval agent | `localhost` |
| `CHROMA_PORT` | ChromaDB port | No | `8000` |
| `CHROMA_COLLECTION` | ChromaDB collection name | No | `agent_knowledge` |
| `MCP_PORT` | MCP server port | No | `3000` |
| `LOG_LEVEL` | Logging level (debug, info, warn, error) | No | `info` |

### Kubernetes ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: agent-registry-config
  namespace: agentregistry-system
data:
  JULES_API_URL: "https://api.jules.google.com/v1"
  CHROMA_HOST: "chromadb.default.svc.cluster.local"
  CHROMA_PORT: "8000"
  CHROMA_COLLECTION: "agent_knowledge"
  MCP_PORT: "3000"
  LOG_LEVEL: "info"
```

### Kubernetes Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: agent-registry-secrets
  namespace: agentregistry-system
type: Opaque
stringData:
  JULES_API_KEY: "your-jules-api-key"
  GOOGLE_API_KEY: "your-google-api-key"
```

## Agent Configuration

### Gemini Agent

Configure the Gemini agent for code generation and research:

```yaml
apiVersion: agentregistry.dev/v1alpha1
kind: AgentCatalog
metadata:
  name: gemini-agent
spec:
  displayName: "Gemini AI Agent"
  agentType: "gemini"
  capabilities:
    - code_generation
    - research
  configuration:
    model: "gemini-2.0-flash"
    temperature: 0.7
    maxTokens: 8192
```

### Jules Agent

Configure the Jules agent for Git operations:

```yaml
apiVersion: agentregistry.dev/v1alpha1
kind: AgentCatalog
metadata:
  name: jules-agent
spec:
  displayName: "Jules Git Agent"
  agentType: "jules"
  capabilities:
    - git_operations
    - autonomous_pr
  configuration:
    defaultBranch: "main"
    autoMerge: false
```

### Retrieval Agent (ChromaDB)

Configure the Retrieval agent for knowledge queries:

```yaml
apiVersion: agentregistry.dev/v1alpha1
kind: AgentCatalog
metadata:
  name: retrieval-agent
spec:
  displayName: "Knowledge Retrieval Agent"
  agentType: "retrieval"
  capabilities:
    - knowledge_query
    - semantic_search
    - recommendations
  configuration:
    chromaHost: "chromadb.default.svc.cluster.local"
    chromaPort: 8000
    collection: "agent_knowledge"
    embeddingModel: "text-embedding-004"
```

## ChromaDB Knowledge Base Setup

### Deploy ChromaDB

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chromadb
  namespace: default
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
        volumeMounts:
        - name: data
          mountPath: /chroma/chroma
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: chromadb-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: chromadb
  namespace: default
spec:
  selector:
    app: chromadb
  ports:
  - port: 8000
    targetPort: 8000
```

### Initialize Knowledge Base

```bash
# Port-forward ChromaDB
kubectl port-forward svc/chromadb 8000:8000

# Create collection
curl -X POST http://localhost:8000/api/v1/collections \
  -H "Content-Type: application/json" \
  -d '{
    "name": "agent_knowledge",
    "metadata": {"description": "Agent Registry knowledge base"}
  }'

# Add documents
curl -X POST http://localhost:8000/api/v1/collections/agent_knowledge/add \
  -H "Content-Type: application/json" \
  -d '{
    "documents": ["Your knowledge content here"],
    "metadatas": [{"source": "documentation"}],
    "ids": ["doc1"]
  }'
```

## Orchestrator Configuration

### Execution Patterns

Configure default orchestration behavior:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: orchestrator-config
  namespace: agentregistry-system
data:
  defaultPattern: "supervisor"  # supervisor, swarm, or workflow
  swarmParallelism: "3"
  taskTimeout: "300s"
  retryAttempts: "3"
```

## MCP Server Configuration

### Enable/Disable Tools

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mcp-config
  namespace: agentregistry-system
data:
  enabledTools: |
    - list_agents
    - orchestrate_complex_task
    - execute_agent_swarm
    - execute_supervised_task
    - execute_jules_git_task
  enableAuth: "false"
  corsOrigins: "*"
```

## Next Steps

- **[Architecture](../architecture/README.md)**: Understand the system design
- **[Agents](../agents/README.md)**: Learn about available agents
- **[Orchestration](../orchestration/README.md)**: Explore coordination patterns
