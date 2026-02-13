# Agent Architecture

Agents in the Agent Registry are autonomous units of execution that wrap specific LLM capabilities or external services. They share a common interface but implement diverse behaviors.

## The Agent Interface

All agents must implement the `Agent` interface defined in the orchestrator:

```go
type Agent interface {
    // Unique identifier for the agent instance
    Name() string
    
    // The class of agent (e.g., "gemini", "jules", "retrieval")
    Type() AgentType
    
    // List of capability strings this agent supports
    Capabilities() []string
    
    // Boolean check if the agent can handle a specific task
    CanHandle(task *Task) bool
    
    // Main execution entry point
    Execute(ctx context.Context, task *Task) (*Result, error)
}
```

This polymorphism allows the Orchestrator to treat a Gemini model, a Git bot, and a vector database retrieval tool uniformly.

## Agent Types

### 1. Gemini Agent (`internal/orchestrator/agents.go`)

The general-purpose reasoning engine.

*   **Backend**: Google Gemini Models via ADK Runtime.
*   **Capabilities**: `code-generation`, `reasoning`, `conversation`.
*   **State**: Maintains conversation history within the task context (stateless between unrelated tasks unless external memory is used).
*   **Key Logic**:
    *   Constructs prompts based on task description and context.
    *   Support for "System Instructions" via the ADK.
    *   Handles streaming (optional).

### 2. Jules Agent (`internal/orchestrator/agents.go`)

The specialized Git automation agent.

*   **Backend**: Jules API.
*   **Capabilities**: `git-operations`.
*   **Tasks**: `TaskTypeGit`, `TaskTypeSupervised`.
*   **Key Logic**:
    *   Translates generic `Task` inputs into `JulesTaskInput` (Repository, Branch, Instructions).
    *   Creates and polls Jules Sessions.
    *   Returns PR URLs and session metadata.
    *   **Orchestrator Awareness**: Can be injected with an Orchestrator instance to act as a "Supervisor" in the `TaskTypeSupervised` pattern, effectively managing its own swarm of Gemini sub-agents.

### 3. Retrieval Agent (`internal/orchestrator/agents.go`)

The knowledge integration agent.

*   **Backend**: ChromaDB (Vector Store).
*   **Capabilities**: `knowledge-retrieval`.
*   **Tasks**: `TaskTypeRetrieval`.
*   **Key Logic**:
    *   **Query**: Embeds the query string and performs a similarity search in ChromaDB.
    *   **Index**: Adds new documents to the vector store (used for learning).
    *   Returns context chunks that can be injected into other agents' prompts.

## Lifecycle

1.  **Registration**: Agents are instantiated at startup (in `main.go`) and registered with the Orchestrator.
2.  **Selection**: For every request, the Orchestrator iterates through registered agents calling `CanHandle`.
3.  **Execution**: The selected agent's `Execute` method is called.
4.  **Result**: The agent returns a standardized `Result` object containing the output (text, JSON, objects) and metadata.

## Custom Agents

The architecture is designed to be extensible. To add a new agent (e.g., a "Slack Agent"):

1.  Create a struct that satisfies the `Agent` interface.
2.  Implement the backend logic (API calls to Slack).
3.  Define its capabilities (`communication`).
4.  Register it in `cmd/controller/main.go`.

No changes to the core Orchestrator logic are required to add new agent types.
