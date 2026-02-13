# Tasks

A `Task` is the primary input to the Orchestrator. It defines the unit of work to be performed.

## Task Structure

A generic task JSON structure looks like this:

```json
{
  "id": "task-12345",
  "type": "complex",
  "description": "Refactor the login module to use OAuth2",
  "input": {
    "repository": "https://github.com/myorg/myapp",
    "constraints": ["Must use Google Auth", "Keep backward compatibility"]
  },
  "config": {
    "timeout": "300s",
    "retries": 3
  }
}
```

## Task Types

The Registry supports distinct task types to route work to the correct agent or pattern.

| Task Type | Value | Description | Best Suited For |
|-----------|-------|-------------|-----------------|
| **Code** | `code` | Code generation, refactoring, analysis | Gemini Agent |
| **Reasoning** | `reasoning` | Planning, architectural decisions | Gemini Agent |
| **Retrieval** | `retrieval` | Searching knowledge base / RAG | Retrieval Agent |
| **Git** | `git` | Git operations (PRs, commits) | Jules Agent |
| **Complex** | `complex` | Multi-step swarms or workflows | Orchestrator (Swarm) |
| **Supervised** | `supervised` | Hierarchical delegation (Manager/Worker) | Orchestrator (Supervisor) |

## Task Lifecycle

1.  **Created**: The task is instantiated from a user request.
2.  **Validated**: Inputs are checked against the required schema for the `type`.
3.  **Pending**: Task is queued for execution (if async).
4.  **Running**: Agents are actively working on it.
5.  **Completed/Failed**: Final state reached.

## Input Schemas

Each task type requires specific input inputs:

### Jules / Git Task (`internal/orchestrator/agents.go`)

```go
type JulesTaskInput struct {
    Repository    string `json:"repository"`
    Instructions  string `json:"instructions"`
    Branch        string `json:"branch,omitempty"`
    PRTemplate    string `json:"pr_template,omitempty"`
}
```

### Retrieval Task

```json
{
  "action": "query", 
  "query": "How do I configure the agent registry?"
}
```
OR
```json
{
  "action": "index",
  "document": "Content to add to knowledge base..."
}
```

### Complex / Swarm Task

```json
{
  "agents": ["gemini", "jules"], // Targeted agents
  "strategy": "vote",            // (Optional) Result aggregation strategy
  "subtasks": ["analyze", "implement"] // Explicit subtasks (optional)
}
```
