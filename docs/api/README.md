# API Reference

The Agent Registry exposes its functionality through multiple interfaces to support different use cases and integration patterns.

## Available APIs

| Interface | Description | Primary Use Case |
|-----------|-------------|------------------|
| **[HTTP API](http-api.md)** | RESTful endpoints | Frontend UIs, Webhooks, Curling |
| **[Kubernetes CRDs](kubernetes.md)** | Custom Resources | GitOps, Infrastructure-as-Code |
| **[Go Packages](go-packages.md)** | Go SDKs | Building custom controllers or agents |
| **[MCP](mcp/README.md)** | Model Context Protocol | connecting AI Assistants / IDEs |

## Authentication

*   **HTTP API**: Currently open (planned: Bearer tokens).
*   **Kubernetes**: Uses standard K8s RBAC.
*   **MCP**: Local execution / Trusted constraints.
