# HTTP API Reference

The Agent Registry provides a RESTful HTTP API for interacting with the system programmatically.

## Base URL

By default, the API is served at `http://localhost:8080`.

## Endpoints

### Agents

#### List Agents
`GET /api/v1/agents`

Returns a list of all registered agents.

**Response**:
```json
{
  "items": [
    {
      "name": "gemini-agent",
      "status": "Ready",
      "capabilities": ["code", "reasoning"]
    }
  ]
}
```

#### Get Agent Details
`GET /api/v1/agents/{name}`

Returns detailed configuration for a specific agent.

### Tasks

#### Submit Task
`POST /api/v1/tasks`

Submit a new task for execution.

**Request**:
```json
{
  "type": "code",
  "description": "Generate a hello world function",
  "input": { "language": "python" }
}
```

**Response**:
```json
{
  "id": "task-abc-123",
  "status": "pending"
}
```

#### Get Task Status
`GET /api/v1/tasks/{id}`

Poll for the result of a submitted task.

### Skill & Models

#### List Skills
`GET /api/v1/skills`

#### List Models
`GET /api/v1/models`

## Error Handling

Standard HTTP status codes are used:
*   `200 OK`: Success
*   `400 Bad Request`: Invalid input
*   `404 Not Found`: Resource not found
*   `500 Internal Server Error`: Server processing failed
