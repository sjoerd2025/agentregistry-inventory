# Environment Variables

This reference lists all environment variables used by the Agent Registry components.

## Controller Manager

The main controller process.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_API_KEY` | Yes* | - | API key for Gemini models. Required if using API keys. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Yes* | - | Path to service account JSON. Required if using ADC. |
| `JULES_API_KEY` | Yes | - | API key for Jules API access. |
| `JULES_API_URL` | No | `https://api.jules.ai` | Base URL for Jules API. |
| `CHROMA_HOST` | No | `localhost` | Hostname of ChromaDB service. |
| `CHROMA_PORT` | No | `8000` | Port of ChromaDB service. |
| `CHROMA_COLLECTION` | No | `agent_docs` | Name of the vector collection. |
| `LOG_LEVEL` | No | `info` | Log verbosity (`debug`, `info`, `warn`, `error`). |
| `METRICS_ADDR` | No | `:8080` | Bind address for Prometheus metrics. |
| `PROBE_ADDR` | No | `:8081` | Bind address for health probes. |
| `ENABLE_LEADER_ELECTION` | No | `false` | Enable leader election for HA. |

## MCP Server

When running in MCP mode (`agent-registry mcp`).

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MCP_PORT` | No | `stdio` | Port to listen on (if SSE enabled). Defaults to stdio. |
