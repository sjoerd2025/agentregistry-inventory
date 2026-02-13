# Glossary

Definitions of common terms used in the Agent Registry.

## A

**ADK (Agent Development Kit)**
A library provided by Google for building AI agents. We use the ADK Runtime to interface with Gemini models.

**Agent**
An autonomous entity capable of performing tasks. Includes Gemini (LLM), Jules (Git), and Retrieval agents.

**AgentCatalog**
A Kubernetes Custom Resource (CRD) that defines an available agent type and its configuration.

## C

**ChromaDB**
An open-source vector database used by the Retrieval Agent to store and query documentation embeddings.

**Context Window**
The maximum amount of text (tokens) an LLM can process in a single request.

## J

**Jules**
An AI-powered Git agent that can autonomously modify code, create PRs, and manage repository state.

## M

**MCP (Model Context Protocol)**
An open standard for connecting AI models to external tools and data. The Registry acts as an MCP Server.

## O

**Orchestrator**
The central component that manages task lifecycle, selects agents, and implements execution patterns.

## P

**Pattern**
A specific way of coordinating multiple agents. Examples: Supervisor, Swarm, Workflow.

## S

**Swarm**
A group of agents working together on a single task, often in parallel or with a voting mechanism.

**Supervisor**
An orchestration pattern where a single "Manager" agent delegates subtasks to "Worker" agents.

## T

**Task**
A unit of work submit to the orchestrator. Contains a type, description, and input data.
