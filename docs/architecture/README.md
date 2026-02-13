# Architecture Overview

Agent Registry is a Kubernetes-native platform for orchestrating multiple AI agents with different capabilities.

## System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        CLI[CLI Client]
        HTTP[HTTP Client]
        K8S[Kubernetes Client]
    end
    
    subgraph "API Layer"
        MCP[MCP Server<br/>Port 3000]
        HTTPAPI[HTTP API<br/>Port 8080]
    end
    
    subgraph "Control Plane"
        Controller[Agent Registry<br/>Controller]
        Orch[Orchestrator]
    end
    
    subgraph "Agent Layer"
        Jules[Jules Agent]
        Gemini[Gemini Agent]
        Retrieval[Retrieval Agent]
    end
    
    subgraph "Backend Services"
        JulesAPI[Jules API]
        ADK[ADK Runtime]
        Chroma[ChromaDB<br/>Knowledge Base]
        VertexAI[Vertex AI /<br/>Gemini API]
    end
    
    CLI --> MCP
    HTTP --> HTTPAPI
    K8S --> Controller
    
    MCP --> Orch
    HTTPAPI --> Controller
    Controller --> Orch
    
    Orch --> Jules
    Orch --> Gemini
    Orch --> Retrieval
    
    Jules --> JulesAPI
    Gemini --> ADK
    Retrieval --> ADK
    
    ADK --> VertexAI
    ADK --> Chroma
    
    style Orch fill:#4CAF50
    style Jules fill:#2196F3
    style Gemini fill:#FF9800
    style Retrieval fill:#9C27B0
    style Chroma fill:#E91E63
```

## Core Components

### 1. Controller

The Kubernetes controller manages the lifecycle of agent resources:

- **AgentCatalog**: Defines available agents and their capabilities
- **AgentDeployment**: Manages agent instances and scaling
- **DiscoveryConfig**: Configures agent discovery mechanisms

**Location**: `cmd/controller/main.go`

### 2. Orchestrator

Coordinates multiple agents to execute complex tasks:

- **Agent Registry**: Manages registered agents
- **Task Router**: Selects appropriate agents for tasks
- **Execution Patterns**: Supervisor, Swarm, Workflow

**Location**: `internal/orchestrator/`

### 3. MCP Server

Model Context Protocol server for agent discovery and interaction:

- **Tools**: Expose agent capabilities as MCP tools
- **Resources**: Provide agent metadata and documentation
- **Prompts**: Offer pre-built prompts for common tasks

**Location**: `internal/mcp/`

### 4. ADK Runtime

Agent Development Kit runtime for Gemini and Retrieval agents:

- **Gemini Integration**: Code generation and research
- **ChromaDB Integration**: Knowledge retrieval and semantic search
- **Multi-step Reasoning**: Complex query processing

**Location**: `internal/adk/`

## Data Flow

### Simple Task Execution

```mermaid
sequenceDiagram
    participant Client
    participant MCP
    participant Orch as Orchestrator
    participant Agent
    participant Backend
    
    Client->>MCP: Execute task
    MCP->>Orch: Route task
    Orch->>Orch: Select agent
    Orch->>Agent: Execute
    Agent->>Backend: API call
    Backend-->>Agent: Response
    Agent-->>Orch: Result
    Orch-->>MCP: Formatted result
    MCP-->>Client: Response
```

### Complex Multi-Agent Task

```mermaid
sequenceDiagram
    participant Client
    participant Orch as Orchestrator
    participant Retrieval
    participant Gemini
    participant Jules
    participant Chroma as ChromaDB
    participant JulesAPI as Jules API
    
    Client->>Orch: Complex task
    
    par Swarm Execution
        Orch->>Retrieval: Research
        Retrieval->>Chroma: Query knowledge
        Chroma-->>Retrieval: Results
        Retrieval-->>Orch: Research output
    and
        Orch->>Gemini: Generate code
        Gemini-->>Orch: Code output
    end
    
    Orch->>Orch: Merge results
    Orch->>Jules: Create PR
    Jules->>JulesAPI: Submit task
    JulesAPI-->>Jules: Session ID
    Jules-->>Orch: PR URL
    Orch-->>Client: Complete result
```

## Key Design Principles

### 1. Kubernetes Native

All components are designed to run in Kubernetes:
- Custom Resource Definitions (CRDs)
- Controller pattern
- Declarative configuration
- Horizontal scaling

### 2. Extensible

Easy to add new agents:
- Agent interface for custom implementations
- Plugin architecture
- Dynamic agent registration

### 3. Observable

Built-in observability:
- Structured logging (zerolog)
- Metrics (Prometheus)
- Tracing (OpenTelemetry)
- Status reporting

### 4. Resilient

Production-ready reliability:
- Retry mechanisms
- Timeout handling
- Error recovery
- Health checks

## Storage

### ChromaDB Knowledge Base

Persistent knowledge storage for the Retrieval agent:

- **Vector Embeddings**: Semantic search capabilities
- **Collections**: Organized knowledge domains
- **Metadata**: Rich document metadata
- **Persistence**: Durable storage with PVCs

**Integration**: `internal/adk/retrieval_agent.go`

### Kubernetes State

Agent and deployment state stored in etcd via Kubernetes API:

- **AgentCatalogs**: Agent definitions
- **AgentDeployments**: Deployment specifications
- **DiscoveryConfigs**: Discovery settings

## Security

### Authentication

- **Jules API**: API key authentication
- **Google Cloud**: Service account or API key
- **MCP Server**: Optional authentication (configurable)

### Authorization

- **Kubernetes RBAC**: Controller permissions
- **Agent Capabilities**: Capability-based access control

### Secrets Management

- **Kubernetes Secrets**: API keys and credentials
- **Environment Variables**: Runtime configuration

## Scalability

### Horizontal Scaling

- **Controller**: Multiple replicas with leader election
- **MCP Server**: Stateless, can scale horizontally
- **Agents**: Concurrent execution support

### Performance

- **Parallel Execution**: Swarm pattern for concurrent tasks
- **Caching**: Result caching in orchestrator
- **Connection Pooling**: Efficient backend connections

## Next Steps

- **[Orchestrator](orchestrator.md)**: Deep dive into orchestration
- **[Agents](agents.md)**: Agent system design
- **[MCP Server](mcp-server.md)**: MCP integration details
