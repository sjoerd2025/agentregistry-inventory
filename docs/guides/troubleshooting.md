# Troubleshooting

Common issues and solutions when running the Agent Registry.

## Agent Issues

### Agent Not Ready

**Symptom**: `kubectl get agentcatalog` shows status `Pending` or `Error`.

**Possible Causes**:
*   Invalid API Key (Google/Jules).
*   Model name is incorrect in `spec.config`.
*   Network connectivity issues to external APIs.

**Debugging**:
Check the controller logs:
```bash
kubectl logs -n agent-system -l control-plane=controller-manager
```

### "No suitable agent found" Error

**Symptom**: Task execution fails immediately with this error.

**Solution**:
*   Ensure at least one agent is registered with the required capability (e.g., `code-generation`).
*   Check if the agent is in a `Ready` state.
*   Verify the `Task.Type` matches the agent's supported types.

## Orchestrator Issues

### Task Timeout

**Symptom**: Task runs for a long time and then fails with `context deadline exceeded`.

**Solution**:
*   Increase the timeout in the Task configuration.
*   For complex tasks, break them down into smaller subtasks.
*   Check if the underlying model `maxTokens` is sufficient for the response size.

## MCP Issues

### Client Connectivity

**Symptom**: Claude Desktop or other client cannot connect to the MCP server.

**Solution**:
*   **Local**: Ensure you are running the `agent-registry` binary with the `mcp` subcommand. Check if `stdio` is not being polluted by log messages (set `LOG_LEVEL=error`).
*   **Remote**: Ensure `kubectl exec` allows stdin/stdout streaming and your network allows the connection.

## Retrieval / ChromaDB

### Empty Results

**Symptom**: Retrieval tasks return no results.

**Solution**:
*   Verify documents have been indexed (`scripts/populate_chroma.py`).
*   Check connection to ChromaDB host.
*   Ensure embedding model matches between indexing and query time.
