# Orchestration Examples

This page provides concrete examples of how to use the various orchestration patterns to solve real-world problems.

## 1. Feature Implementation Swarm

**Goal**: Implement a new feature "Dark Mode" across a frontend codebase.

**Pattern**: `TaskTypeComplex` (Swarm)

**Strategy**:
1.  **Agent A (Design)**: Analyzes the CSS structure and proposes variables.
2.  **Agent B (Implementation)**: Modifies the React components to use the new variables.
3.  **Agent C (Review)**: Checks against accessibility guidelines.

**Request**:

```json
{
  "task": {
    "type": "complex",
    "description": "Implement Dark Mode support for the main dashboard",
    "input": {
      "repository": "https://github.com/myorg/dashboard",
      "files": ["src/App.css", "src/components/Dashboard.tsx"]
    }
  }
}
```

## 2. Recursive Code Refactoring

**Goal**: Refactor a legacy Python module and ensure tests pass.

**Pattern**: `TaskTypeSupervised`

**Strategy**:
1.  **Supervisor (Manager)**: Breaks the module into functions.
2.  **Worker (Gemini)**: Refactors one function at a time.
3.  **Worker (Gemini)**: Writes unit tests for the new function.

**Code (Go)**:

```go
task := &orchestrator.Task{
    Type: orchestrator.TaskTypeSupervised,
    Description: "Refactor user_manager.py to use async/await",
    Input: map[string]interface{}{
        "target_file": "user_manager.py",
        "iterations": 3 // Review cycles
    }
}
result, err := orchestrator.ExecuteTask(ctx, task)
```

## 3. RAG-Enriched Coding

**Goal**: Write a Kubernetes Controller that follows internal best practices.

**Pattern**: Workflow (Retrieval -> Code Gen)

**Strategy**:
1.  **Retrieval Agent**: Fetches "Internal K8s coding standards" from ChromaDB.
2.  **Gemini Agent**: Uses the retrieved context to generate the boilerplate code.

**MCP Tool Call**:

```javascript
call_tool("orchestrate_complex_task", {
  "description": "Create a K8s controller for 'MyCRD'",
  "context": {
    "use_rag": true,
    "rag_query": "kubernetes controller best practices"
  }
})
```

## 4. Documentation Update Pipeline

**Goal**: Update documentation after a code change.

**Pattern**: `TaskTypeGit` (Jules) + `TaskTypeRetrieval`

**Strategy**:
1.  **Jules Agent**: Detects changes in the `main` branch.
2.  **Gemini Agent**: Generates updated documentation markdown.
3.  **Jules Agent**: Commits the docs to a `docs/` folder.
4.  **Retrieval Agent**: Indexes the new docs into ChromaDB.
