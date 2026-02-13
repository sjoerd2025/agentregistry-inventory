# MCP Prompts

Prompts in MCP allow servers to provide reusable templates to clients. The Agent Registry provides standardized prompts to help users interact with agents effectively.

## Available Prompts

### 1. `orchestrate_task`

A prompt to help users formulate a request for the Orchestrator.

*   **Arguments**:
    *   `goal` (string, required): What do you want to achieve?
    *   `context` (string, optional): Additional background info.

*   **Template**:
    ```text
    You are an expert user of the Agent Registry.
    Help the user create a task to achieve the following goal: {{goal}}
    
    Context: {{context}}
    
    Format the output as a valid 'orchestrate_complex_task' tool call.
    ```

### 2. `describe_agent`

A prompt to inspect an agent's capabilities.

*   **Arguments**:
    *   `agent_name` (string, required): The name of the agent.

*   **Template**:
    ```text
    Retrieve the details for agent '{{agent_name}}' using the 'list_agents' tool 
    and explain its capabilities and best use cases.
    ```

## Usage

In an MCP client (like Claude Desktop), users can select these prompts from a menu. The client then fills in the arguments and sends the resulting text to the LLM.

## Implementation Details

Prompts are defined in `internal/mcp/prompts.go` (planned).

```go
func (s *MCPServer) ListPrompts(ctx context.Context, req *mcp.ListPromptsRequest) (*mcp.ListPromptsResult, error) {
    return &mcp.ListPromptsResult{
        Prompts: []mcp.Prompt{
            {
                Name: "orchestrate_task",
                Description: "Helper to create orchestration tasks",
                Arguments: []mcp.PromptArgument{...},
            },
        },
    }, nil
}
```
