# langgraph-neo4j

`langgraph-neo4j` is a proposed integration that brings **Neo4j as a first-class backend for LangGraph**, extending what already exists in **LangChain–Neo4j** and **LangGraph checkpoint backends**.

Even though Neo4j is already well supported in **LangChain**, this project exists because **LangGraph and LangChain solve different problems**, and Neo4j unlocks *additional capabilities specifically at the LangGraph level*.

---

## Why does this exist if Neo4j is already supported in LangChain?

LangChain’s Neo4j integrations focus on:

- Retrieval (vector search, GraphRAG)
- Knowledge graph construction
- Memory abstractions
- Querying Neo4j as a data source

LangGraph, instead, is about:

- **Execution control**
- **State machines**
- **Loops and conditionals**
- **Agent orchestration**
- **Checkpointing and recovery**

> **LangChain uses Neo4j as data.  
> LangGraph can use Neo4j as runtime state.**

`langgraph-neo4j` lives **one level lower** in the stack.

---

## The Missing Layer

Today:

| Layer | Neo4j Support |
|----|----|
| Data / Retrieval (LangChain) | ✅ Yes |
| Knowledge Graphs | ✅ Yes |
| Vector Stores | ✅ Yes |
| Agent Memory (LangChain) | ✅ Yes |
| **Workflow State (LangGraph)** | ❌ No |
| **Checkpointing (LangGraph)** | ❌ No |
| **Execution Graph Persistence** | ❌ No |
| **Multi-agent orchestration backend** | ❌ No |

`langgraph-neo4j` fills this gap.

---

## Why not just reuse LangChain memory?

LangChain memory:
- Is typically **append-only**
- Is often **per-agent**
- Does not represent execution flow
- Does not model control decisions

LangGraph state:
- Evolves step-by-step
- Drives conditional routing
- Requires checkpoints
- Must be resumable and inspectable

Neo4j is uniquely suited to model **state + transitions + decisions**.

---

## Checkpointing

LangGraph supports pluggable checkpoint backends.

Existing implementations include:
- In-memory
- SQLite
- Postgres
- Redis

### In-Memory Example

```python
from langgraph.checkpoint.memory import InMemorySaver

agent = create_react_agent(
    "openai:gpt-4.1",
    tools,
    checkpointer=InMemorySaver(),
)
````

### Redis Example

```python
from langgraph.checkpoint.redis import RedisSaver

with RedisSaver.from_conn_string(REDIS_URI) as checkpointer:
    checkpointer.setup()
    graph = create_react_agent(model, tools=tools, checkpointer=checkpointer)
```

### SQLite / Postgres

* SQLite:
  [https://github.com/langchain-ai/langgraph/blob/main/libs/checkpoint-sqlite](https://github.com/langchain-ai/langgraph/blob/main/libs/checkpoint-sqlite)
* Postgres:
  [https://github.com/langchain-ai/langgraph/tree/main/libs/checkpoint-postgres](https://github.com/langchain-ai/langgraph/tree/main/libs/checkpoint-postgres)

---

## Neo4j Checkpointing (Proposed)

`langgraph-neo4j` would implement the same LangGraph `Checkpointer` interface, but persist **state and execution as a graph**.

```python
from langgraph.checkpoint.neo4j import Neo4jSaver

with Neo4jSaver.from_uri(
    uri="bolt://localhost:7687",
    user="neo4j",
    password="password",
    namespace="agent-runtime"
) as checkpointer:
    checkpointer.setup()

    graph = create_react_agent(
        model,
        tools=tools,
        checkpointer=checkpointer
    )
```

---

## Why Neo4j instead of Redis or SQL?

Redis / SQL store:

* Key–value snapshots
* Flat rows
* Limited relationships

Neo4j stores:

* State
* Transitions
* Decisions
* Dependencies
* Causality

Example:

```text
(:Session)
  └─[:HAS_STEP]->(:Step)
        └─[:USED_TOOL]->(:Tool)
        └─[:ROUTED_TO]->(:Agent)
        └─[:PRODUCED]->(:State)
```

This enables:

* Full execution replay
* Graph-level debugging
* Auditing and explainability
* Visualization of agent behavior

---

## Agent Memory (Beyond LangChain Memory)

LangChain memory answers:

> “What did we say before?”

Neo4j-backed LangGraph memory answers:

> “Why did the agent do this?”

Memory types:

* Episodic (sessions, steps)
* Semantic (vector embeddings)
* Procedural (routing patterns)

---

## GraphRAG as a First-Class Workflow Pattern

LangChain already supports GraphRAG.

`langgraph-neo4j` makes GraphRAG **part of the control flow**:

1. Vector search on `Chunk`
2. Traverse to `Document`
3. Traverse related entities
4. Route execution based on results

```text
(:Chunk)-[:PART_OF]->(:Document)-[:MENTIONS]->(:Entity)
```

The graph is both **knowledge** and **control plane**.

---

## Dynamic Routing via Neo4j

Routing logic does not need to live in Python.

```cypher
MATCH (a:Agent)-[:CAPABLE_OF]->(t:Task {name:$intent})
RETURN a.name
ORDER BY a.priority DESC
LIMIT 1
```

Neo4j decides:

* Which agent runs
* Which tool is used
* Whether to loop or stop

LangGraph executes the decision.

---

## Multi-Agent Orchestration

Agents become nodes in Neo4j:

```text
(:Agent {name, capabilities, priority})
```

LangGraph orchestrates execution.
Neo4j coordinates behavior.

Benefits:

* Clear separation of concerns
* Data-driven agent selection
* Transparent execution graphs
* Easier debugging and evolution

---

## Streaming-Friendly by Design

* LangGraph controls flow
* LLMs stream tokens
* Neo4j checkpoints asynchronously

Works naturally with:

* FastAPI SSE
* WebSockets
* React / React Native clients

---

## Observability and Replay

Because everything is a graph:

* Inspect agent decisions
* Replay sessions
* Debug loops and failures
* Build visual dashboards (Neo4j Bloom)

This is impossible with key-value stores.

---

## Summary

`langgraph-neo4j` exists **not because Neo4j is missing in LangChain**, but because:

* LangChain and LangGraph solve different problems
* Neo4j is uniquely suited for **workflow state and control**
* Checkpoints are more than snapshots
* Agent systems need **explainability and auditability**

> **LangChain + Neo4j = knowledge**
> **LangGraph + Neo4j = runtime intelligence**

---

## Status

🚧 Concept / design proposal

---

## Related Projects

* LangGraph
  [https://github.com/langchain-ai/langgraph](https://github.com/langchain-ai/langgraph)
* LangChain Neo4j integrations
  [https://neo4j.com/labs/genai-ecosystem/langchain/](https://neo4j.com/labs/genai-ecosystem/langchain/)
* langgraph-redis
  [https://github.com/redis-developer/langgraph-redis](https://github.com/redis-developer/langgraph-redis)

```

