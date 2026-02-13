# Gemini Agent

The Gemini Agent provides access to Google's Gemini AI models through the ADK (Agent Development Kit) runtime. It excels at complex reasoning, code generation, and multi-turn conversations.

## Overview

The Gemini Agent is a versatile AI agent that can handle a wide range of tasks including:

- **Code Generation**: Writing, reviewing, and refactoring code
- **Complex Reasoning**: Analyzing problems and proposing solutions
- **Multi-turn Conversations**: Maintaining context across interactions
- **Swarm Coordination**: Working with other agents in parallel

## Configuration

### Environment Variables

```bash
# Google AI API Key (for Gemini API)
GOOGLE_API_KEY=your-api-key-here

# Or use Google Cloud credentials
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

### Agent Catalog Definition

```yaml
apiVersion: agent.dev/v1alpha1
kind: AgentCatalog
metadata:
  name: gemini-agent
spec:
  displayName: "Gemini AI Agent"
  description: "Google Gemini AI agent for complex reasoning and code generation"
  type: "gemini"
  capabilities:
    - code-generation
    - reasoning
    - conversation
  config:
    model: "gemini-2.0-flash-exp"
    temperature: 0.7
    maxTokens: 8192
```

## Capabilities

### Task Types

The Gemini Agent can handle the following task types:

| Task Type | Description | Use Case |
|-----------|-------------|----------|
| `code` | Code generation and analysis | Writing functions, reviewing code |
| `reasoning` | Complex problem solving | Architecture decisions, debugging |
| `conversation` | Multi-turn dialogue | Interactive assistance |
| `complex` | Swarm coordination | Part of multi-agent workflows |

### Supported Models

- `gemini-2.0-flash-exp` - Latest experimental model (recommended)
- `gemini-1.5-pro` - Production-ready model
- `gemini-1.5-flash` - Fast responses
- `gemini-1.0-pro` - Stable baseline

## Usage Examples

### Direct Task Execution

```json
{
  "task": {
    "id": "task-001",
    "type": "code",
    "description": "Write a function to validate email addresses",
    "input": {
      "language": "go",
      "requirements": [
        "RFC 5322 compliant",
        "Return error for invalid emails"
      ]
    }
  }
}
```

### Via MCP Tools

```javascript
// Using the orchestrate_complex_task tool
{
  "name": "orchestrate_complex_task",
  "arguments": {
    "description": "Implement user authentication system",
    "context": {
      "framework": "Go",
      "requirements": ["JWT tokens", "password hashing", "session management"]
    }
  }
}
```

### In Agent Swarms

```json
{
  "task": {
    "type": "complex",
    "description": "Refactor authentication module",
    "agents": ["gemini", "gemini", "gemini"],
    "subtasks": [
      "Review current implementation",
      "Identify security issues",
      "Propose refactoring plan"
    ]
  }
}
```

## Integration with ADK Runtime

The Gemini Agent uses the ADK Runtime for execution:

```go
// Initialize ADK Runtime
adkRuntime, err := adk.NewADKRuntime(mgr.GetClient(), logger)
if err != nil {
    return err
}

// Register Gemini Agent
geminiAgent := orchestrator.NewGeminiAgent(adkRuntime, logger)
orch.RegisterAgent(geminiAgent)

// Execute task
result, err := geminiAgent.Execute(ctx, task)
```

## Advanced Features

### Context Management

The Gemini Agent maintains conversation context:

```go
type Task struct {
    ID          string
    Type        TaskType
    Description string
    Input       interface{}
    Context     map[string]interface{} // Conversation history
}
```

### Streaming Responses

For long-running tasks, the agent supports streaming:

```go
// Enable streaming in task configuration
task.Config = map[string]interface{}{
    "stream": true,
    "onChunk": func(chunk string) {
        fmt.Print(chunk)
    },
}
```

### Tool Calling

Gemini can use tools during execution:

```go
// Define tools for the agent
tools := []adk.Tool{
    {
        Name:        "search_codebase",
        Description: "Search for code patterns",
        Parameters:  searchSchema,
    },
}

// Execute with tools
result, err := adkRuntime.ExecuteWithTools(ctx, task, tools)
```

## Best Practices

### 1. Task Descriptions

Provide clear, specific task descriptions:

```go
// ❌ Bad
task.Description = "Fix the code"

// ✅ Good
task.Description = "Refactor the authentication middleware to use context-based timeout handling instead of global timeouts"
```

### 2. Model Selection

Choose the right model for your use case:

- **Development/Experimentation**: `gemini-2.0-flash-exp`
- **Production**: `gemini-1.5-pro`
- **High-volume/Low-latency**: `gemini-1.5-flash`

### 3. Temperature Settings

Adjust temperature based on task type:

```yaml
# Creative tasks (code generation)
temperature: 0.7

# Deterministic tasks (code review)
temperature: 0.2

# Exploratory tasks (brainstorming)
temperature: 0.9
```

### 4. Error Handling

Always handle agent errors gracefully:

```go
result, err := geminiAgent.Execute(ctx, task)
if err != nil {
    logger.Error().Err(err).Msg("Gemini agent execution failed")
    // Fallback to alternative agent or retry
    return handleAgentFailure(task, err)
}

if !result.Success {
    logger.Warn().
        Str("agent", result.AgentName).
        Interface("error", result.Error).
        Msg("Agent task failed")
}
```

## Monitoring and Debugging

### Logging

Enable detailed logging:

```bash
LOG_LEVEL=debug
```

### Metrics

Monitor agent performance:

```go
// Track execution time
start := time.Now()
result, err := geminiAgent.Execute(ctx, task)
duration := time.Since(start)

logger.Info().
    Str("task_id", task.ID).
    Dur("duration", duration).
    Bool("success", result.Success).
    Msg("Gemini agent execution completed")
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `API key not found` | Missing `GOOGLE_API_KEY` | Set environment variable |
| `Rate limit exceeded` | Too many requests | Implement exponential backoff |
| `Context length exceeded` | Input too large | Chunk input or use summarization |
| `Model not found` | Invalid model name | Check supported models list |

## Performance Optimization

### 1. Caching

Enable response caching for repeated queries:

```go
task.Config = map[string]interface{}{
    "cache": true,
    "cacheTTL": "1h",
}
```

### 2. Batching

Batch similar tasks together:

```go
tasks := []orchestrator.Task{task1, task2, task3}
results, err := orch.ExecuteSwarm(ctx, &orchestrator.Task{
    Type:     orchestrator.TaskTypeComplex,
    Subtasks: tasks,
})
```

### 3. Parallel Execution

Use swarm pattern for parallel processing:

```go
// Execute 3 Gemini agents in parallel
result, err := orch.ExecuteTask(ctx, &orchestrator.Task{
    Type:        orchestrator.TaskTypeComplex,
    Description: "Analyze codebase for security issues",
    Input: map[string]interface{}{
        "agents": []string{"gemini", "gemini", "gemini"},
    },
})
```

## See Also

- [Agent Overview](README.md) - All available agents
- [Orchestration Patterns](../orchestration/patterns.md) - Using Gemini in swarms
- [MCP Tools](../mcp/tools.md) - Triggering Gemini via MCP
- [ADK Runtime](../architecture/README.md#adk-runtime) - Technical details
