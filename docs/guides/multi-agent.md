# Multi-Agent Workflows

This guide explains how to design and implement effective workflows using multiple agents.

## What is a Multi-Agent Workflow?

A multi-agent workflow combines the strengths of different agents to solve problems that are too complex for a single model.

**Example**: A "Feature Implementation" workflow might involve:
1.  **Analyst (Gemini)**: Reads requirements and plans the change.
2.  **Coder (Gemini)**: Writes the implementation code.
3.  **Reviewer (Gemini)**: Critiques the code for bugs.
4.  **Integrator (Jules)**: Pushes the code to a branch.

## designing a Workflow

### 1. Identify Subtasks

Break your goal down into distinct steps.
*   *Idea*: "Build a landing page."
*   *Steps*: design HTML structure, write CSS, add JS interactivity.

### 2. Assign Roles

Decide which agent type is best for each step.
*   *Structure*: Gemini (Reasoning model)
*   *CSS*: Gemini (Creative model)
*   *Deployment*: Jules (Git operations)

### 3. Choose a Pattern

*   **Sequential**: Step A -> Step B -> Step C. (Good for linear tasks)
*   **Swarm**: Agent A, B, and C work in parallel and vote. (Good for brainstorming)
*   **Supervisor**: A Manager agent delegates to Workers. (Good for large, complex projects)

## Implementation Example: The "Review & Fix" Loop

This workflow uses a **Supervisor** pattern to improve code quality iteratively.

```go
// Define the Critic Agent
critic := orchestrator.NewGeminiAgent(...)
critic.SystemInstructions = "You are a harsh code reviewer. Focus on security and performance."

// Define the Coder Agent
coder := orchestrator.NewGeminiAgent(...)
coder.SystemInstructions = "You are a senior Golang developer. Fix the issues identified by the critic."

// Orchestrate
for i := 0; i < 3; i++ {
    // 1. Critic reviews current code
    review := critic.Execute(code)
    
    // 2. Coder fixes code
    code = coder.Execute(code, review)
    
    // 3. Test (if tests pass, break)
}
```

## Best Practices

*   **Clear Handoffs**: Ensure the output of Agent A is correctly formatted for the input of Agent B.
*   **Shared Context**: Use the Orchestrator's context object to pass global information (like repository URL or coding standards) to all agents.
*   **Fail Fast**: If an early step fails (e.g., "Requirement analysis returned empty"), stop the workflow to save tokens.
