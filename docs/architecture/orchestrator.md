# Orchestrator Architecture

The Orchestrator is the central nervous system of the Agent Registry, responsible for managing the lifecycle of tasks, coordinating multiple agents, and ensuring robust execution patterns.

## Core Responsibilities

1.  **Task Management**: Receiving, validating, and persisting tasks.
2.  **Agent Selection**: Identifying the most suitable agent(s) for a given task based on capabilities and availability.
3.  **Pattern Execution**: Implementing various orchestration patterns (Supervisor, Swarm, Workflow, Supervised).
4.  **State Management**: Tracking the state of long-running tasks and agent interactions.
5.  **Result Aggregation**: combining outputs from multiple agents into a coherent result.

## Internal Components

### 1. Task Engine

The Task Engine is the entry point for all operations. It processes incoming requests and converts them into internal `Task` objects.

```go
type Task struct {
    ID          string
    Type        TaskType
    Description string
    Input       interface{}
    // ... metadata and config
}
```

Supported Task Types:
*   `TaskTypeCode`: Code generation and analysis.
*   `TaskTypeReasoning`: Complex problem solving.
*   `TaskTypeRetrieval`: Knowledge base queries.
*   `TaskTypeGit`: Jules Git operations.
*   `TaskTypeComplex`: Multi-agent swarms.
*   `TaskTypeSupervised`: Hierarchical delegation.

### 2. Pattern Implementations

The Orchestrator implements specific logic for each orchestration pattern:

*   **Supervisor**: A single lead agent breaks down a task and delegates to workers.
*   **Swarm**: Multiple agents work in parallel on the same task context, often with voting or consensus mechanisms.
*   **Workflow**: A simplified, linear sequence of tasks (DAG execution is planned for future versions).
*   **Supervised**: A hierarchical structure where a 'manager' agent oversees a 'worker' swarm.

#### Execution Flow (Swarm Example)

1.  **Analysis**: The inputs are analyzed to determine the required agent capabilities.
2.  **Selection**: `selectAgents` filters the registered agents registry.
3.  **Parallel Execution**: The Orchestrator spins up goroutines for each agent.
4.  **Aggregation**: Results are collected, and conflicts are resolved (currently via simple aggregation, future: LLM-based synthesis).

### 3. Agent Registry

The internal Agent Registry maintains the set of active, registered agents.

```go
type Agent interface {
    Name() string
    Type() AgentType
    Capabilities() []string
    CanHandle(task *Task) bool
    Execute(ctx context.Context, task *Task) (*Result, error)
}
```

The Orchestrator holds a map of these agents and queries them during the selection phase.

## Integration Points

### ADK Runtime
The Orchestrator relies on the `ADKRuntime` to communicate with the underlying LLM models (Gemini, etc.). It abstracts the model specifics, allowing the Orchestrator to focus on logic and flow control.

### Jules API
For Git-based tasks, the Orchestrator delegates to the `JulesAgent`, which wraps the Jules API client. This allows seamless integration of code modification tasks into broader workflows.

### MCP Server
The Orchestrator exposes its capabilities via the Model Context Protocol (MCP). The `tools_orchestrator.go` file defines tools like `orchestrate_complex_task` that map external MCP calls to internal Orchestrator methods.

## Error Handling & Resiliency

*   **Context Propagation**: Go `context` is used everywhere for timeouts and cancellation.
*   **Retries**: Configurable retry logic for transient failures (implemented in individual agents).
*   **Graceful Degradation**: If a swarm member fails, the Orchestrator can optionally proceed with partial results.

## Future Roadmap

*   **Persistent State Store**: Moving from in-memory state to a database (Redis/Postgres) to support long-running, asynchronous workflows that survive restarts.
*   **Dynamic Planner**: Using an LLM to generate the execution plan dynamically instead of relying on hardcoded patterns.
*   **Human-in-the-Loop**: First-class support for pausing execution to wait for user approval.
