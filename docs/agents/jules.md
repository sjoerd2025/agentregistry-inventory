# Jules Agent

The Jules Agent provides autonomous Git workflow capabilities, enabling AI-driven code changes, pull request creation, and repository management through the Jules API.

## Overview

Jules is a specialized agent for Git-based development workflows:

- **Autonomous Code Changes**: AI-driven code modifications
- **Pull Request Management**: Automated PR creation and updates
- **Repository Operations**: Clone, branch, commit, and push
- **Session Monitoring**: Track long-running Git operations

## Configuration

### Environment Variables

```bash
# Jules API Configuration
JULES_API_KEY=your-jules-api-key
JULES_API_URL=https://api.jules.ai

# Optional: Custom timeout settings
JULES_TIMEOUT=300s
JULES_POLL_INTERVAL=5s
```

### Agent Catalog Definition

```yaml
apiVersion: agent.dev/v1alpha1
kind: AgentCatalog
metadata:
  name: jules-agent
spec:
  displayName: "Jules Git Agent"
  description: "Autonomous Git workflow agent for code changes and PR management"
  type: "jules"
  capabilities:
    - git-operations
    - pr-creation
    - code-modification
  config:
    apiUrl: "https://api.jules.ai"
    defaultBranch: "main"
    autoCommit: true
```

## Capabilities

### Task Types

| Task Type | Description | Output |
|-----------|-------------|--------|
| `git` | Git operations | Session with PR URL |
| `supervised` | Coordinate Gemini swarm | Merged swarm results |

### Supported Operations

- **Repository Management**: Clone, fork, branch
- **Code Modifications**: File edits, additions, deletions
- **Commit & Push**: Automated commits with AI-generated messages
- **Pull Requests**: Create PRs with descriptions
- **Session Tracking**: Monitor long-running operations

## Usage Examples

### Direct Git Task

```json
{
  "task": {
    "id": "task-002",
    "type": "git",
    "description": "Add user authentication to the API",
    "input": {
      "repository": "https://github.com/myorg/myrepo",
      "branch": "feature/auth",
      "instructions": "Implement JWT-based authentication middleware"
    }
  }
}
```

### Via MCP Tools

```javascript
// Using execute_jules_git_task
{
  "name": "execute_jules_git_task",
  "arguments": {
    "repository": "https://github.com/myorg/myrepo",
    "instructions": "Refactor error handling to use custom error types",
    "branch": "refactor/errors"
  }
}
```

### Supervised Pattern

Jules can coordinate a Gemini agent swarm:

```javascript
{
  "name": "execute_supervised_task",
  "arguments": {
    "description": "Implement user profile feature",
    "context": {
      "repository": "https://github.com/myorg/myrepo",
      "requirements": ["CRUD operations", "validation", "tests"]
    }
  }
}
```

## Session Management

### Creating a Session

```go
session, err := julesClient.CreateSession(ctx, orchestrator.JulesTaskInput{
    Repository:   "https://github.com/myorg/myrepo",
    Instructions: "Add logging to all API endpoints",
    Branch:       "feature/logging",
})
```

### Monitoring Session Status

```go
// Poll for completion
for {
    status, err := julesClient.GetSessionStatus(ctx, session.ID)
    if err != nil {
        return err
    }
    
    switch status.State {
    case "completed":
        fmt.Printf("PR created: %s\n", status.PRUrl)
        return nil
    case "failed":
        return fmt.Errorf("session failed: %s", status.Error)
    case "running":
        time.Sleep(5 * time.Second)
        continue
    }
}
```

### Session Object

```go
type JulesSession struct {
    ID         string
    Status     string
    PRUrl      string
    Repository string
    Branch     string
    CreatedAt  time.Time
    UpdatedAt  time.Time
}
```

## Integration Patterns

### 1. Standalone Git Operations

Use Jules for direct repository changes:

```go
task := &orchestrator.Task{
    Type:        orchestrator.TaskTypeGit,
    Description: "Update dependencies",
    Input: orchestrator.JulesTaskInput{
        Repository:   "https://github.com/myorg/myrepo",
        Instructions: "Update all Go dependencies to latest versions",
        Branch:       "chore/update-deps",
    },
}

result, err := julesAgent.Execute(ctx, task)
```

### 2. Supervised Swarm Coordination

Jules coordinates multiple Gemini agents:

```mermaid
graph LR
    A[Jules Agent] --> B[Gemini Agent 1]
    A --> C[Gemini Agent 2]
    A --> D[Gemini Agent 3]
    B --> E[Merged Result]
    C --> E
    D --> E
    E --> F[Git Commit]
```

```go
task := &orchestrator.Task{
    Type:        orchestrator.TaskTypeSupervised,
    Description: "Implement feature with tests",
    Input: map[string]interface{}{
        "repository": "https://github.com/myorg/myrepo",
        "subtasks": []string{
            "Write implementation",
            "Write unit tests",
            "Write integration tests",
        },
    },
}

result, err := julesAgent.Execute(ctx, task)
```

### 3. Workflow Integration

Combine Jules with other agents:

```go
// Step 1: Gemini analyzes requirements
analysisResult, _ := geminiAgent.Execute(ctx, analysisTask)

// Step 2: Jules implements changes
implementTask := &orchestrator.Task{
    Type: orchestrator.TaskTypeGit,
    Input: orchestrator.JulesTaskInput{
        Repository:   repo,
        Instructions: analysisResult.Output.(string),
    },
}
julesResult, _ := julesAgent.Execute(ctx, implementTask)

// Step 3: Retrieval agent updates knowledge base
updateTask := &orchestrator.Task{
    Type: orchestrator.TaskTypeRetrieval,
    Input: map[string]interface{}{
        "action":   "index",
        "document": julesResult.Metadata["pr_url"],
    },
}
retrievalAgent.Execute(ctx, updateTask)
```

## Best Practices

### 1. Repository Access

Ensure Jules has proper repository access:

```bash
# For public repos
REPOSITORY=https://github.com/myorg/myrepo

# For private repos (use token)
REPOSITORY=https://oauth2:${GITHUB_TOKEN}@github.com/myorg/myrepo
```

### 2. Branch Naming

Use descriptive branch names:

```go
// ❌ Bad
branch := "fix"

// ✅ Good
branch := "feature/user-authentication"
branch := "bugfix/memory-leak-in-cache"
branch := "chore/update-dependencies"
```

### 3. Clear Instructions

Provide specific, actionable instructions:

```go
// ❌ Bad
instructions := "Make it better"

// ✅ Good
instructions := `
Refactor the authentication middleware to:
1. Use context-based timeouts instead of global timeouts
2. Add request ID logging
3. Implement exponential backoff for retries
4. Add unit tests for all error cases
`
```

### 4. Session Timeout Handling

Always implement timeout handling:

```go
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
defer cancel()

session, err := julesClient.CreateSession(ctx, input)
if err != nil {
    if errors.Is(err, context.DeadlineExceeded) {
        // Handle timeout
        return fmt.Errorf("Jules session timed out")
    }
    return err
}
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `authentication failed` | Invalid API key | Check `JULES_API_KEY` |
| `repository not found` | Invalid repo URL | Verify repository exists |
| `permission denied` | Insufficient access | Check repository permissions |
| `session timeout` | Operation too long | Increase timeout or simplify task |
| `merge conflict` | Conflicting changes | Resolve manually or retry |

### Retry Logic

Implement exponential backoff:

```go
func executeWithRetry(ctx context.Context, task *orchestrator.Task) (*orchestrator.Result, error) {
    maxRetries := 3
    backoff := time.Second
    
    for i := 0; i < maxRetries; i++ {
        result, err := julesAgent.Execute(ctx, task)
        if err == nil {
            return result, nil
        }
        
        if !isRetryable(err) {
            return nil, err
        }
        
        time.Sleep(backoff)
        backoff *= 2
    }
    
    return nil, fmt.Errorf("max retries exceeded")
}
```

## Monitoring and Debugging

### Session Logs

Enable detailed session logging:

```bash
LOG_LEVEL=debug
JULES_DEBUG=true
```

### Metrics

Track Jules performance:

```go
type JulesMetrics struct {
    SessionsCreated   int
    SessionsCompleted int
    SessionsFailed    int
    AverageDuration   time.Duration
    PRsCreated        int
}
```

### Debugging Tips

1. **Check API connectivity**:
   ```bash
   curl -H "Authorization: Bearer $JULES_API_KEY" $JULES_API_URL/health
   ```

2. **Verify repository access**:
   ```bash
   git ls-remote $REPOSITORY
   ```

3. **Monitor session status**:
   ```bash
   curl -H "Authorization: Bearer $JULES_API_KEY" \
        $JULES_API_URL/sessions/$SESSION_ID
   ```

## Advanced Features

### Custom Commit Messages

Override default commit messages:

```go
input := orchestrator.JulesTaskInput{
    Repository:    repo,
    Instructions:  instructions,
    Branch:        branch,
    CommitMessage: "feat: add user authentication\n\nImplements JWT-based auth",
}
```

### Multi-file Operations

Jules can modify multiple files:

```go
instructions := `
1. Update api/handlers/auth.go to add JWT middleware
2. Create api/middleware/jwt.go with token validation
3. Update api/routes.go to use the new middleware
4. Add tests in api/handlers/auth_test.go
`
```

### PR Templates

Use PR description templates:

```go
input := orchestrator.JulesTaskInput{
    Repository:   repo,
    Instructions: instructions,
    PRTemplate: `
## Changes
- {{ changes }}

## Testing
- {{ testing }}

## Checklist
- [ ] Tests added
- [ ] Documentation updated
`,
}
```

## See Also

- [Agent Overview](README.md) - All available agents
- [Orchestration Patterns](../orchestration/patterns.md) - Supervised pattern
- [MCP Tools](../mcp/tools.md) - Jules MCP tools
- [Jules API Documentation](https://docs.jules.ai) - Official API docs
