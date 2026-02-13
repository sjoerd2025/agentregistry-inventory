# CLI Reference

The `agent-registry` binary supports multiple subcommands.

## Usage

```bash
agent-registry [command] [flags]
```

## Commands

### `start` (Default)

Starts the Kubernetes Controller Manager.

**Flags**:
*   `--metrics-bind-address string`: The address the metric endpoint binds to. (default ":8080")
*   `--health-probe-bind-address string`: The address the probe endpoint binds to. (default ":8081")
*   `--leader-elect`: Enable leader election for controller manager.

### `mcp`

Starts the Model Context Protocol (MCP) server.

**Flags**:
*   `--transport string`: The transport to use: `stdio` or `sse`. (default "stdio")
*   `--port int`: Port for SSE transport (if selected).

### `version`

Prints the build version and exit.

## Examples

**Run minimal local controller**:
```bash
agent-registry
```

**Run as MCP server for Claude Desktop**:
```bash
agent-registry mcp
```
