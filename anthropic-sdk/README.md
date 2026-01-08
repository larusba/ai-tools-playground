## Anthropic (Claude) SDK + Neo4j

This document summarizes how **Anthropic Claude (Agent SDK + MCP)** can be integrated with **Neo4j**, clarifying what is supported natively, what is not, and which external tools (MCP servers) enable advanced use cases such as GraphRAG and persistent graph memory.

---

## Anthropic SDK

- Anthropic provides a **TypeScript SDK client** for Claude.
- At the time of writing, the standard SDK is primarily a **wrapper around REST API calls**.
- It does **not** natively include:
  - an MCP client implementation,
  - vector storage,
  - persistent memory abstractions,
  - or GraphRAG primitives.

Those capabilities are enabled via **Model Context Protocol (MCP)** and external tools.

---

## Vector Store

Claude / Claude Agent SDK **is not a vector database** and **does not provide embedding storage**.

Key points:
- No native storage of embeddings.
- No native semantic or similarity search over vectors.
- No built-in RAG or retrieval layer.

If you need RAG or semantic retrieval:
- You must integrate an **external vector store** (e.g. Pinecone, Milvus, Weaviate, Chroma).
- Integration is typically done via:
  - MCP servers, or
  - custom tools exposed to the agent.

Claude acts as the **reasoning and orchestration layer**, not as the data store.

---

## MCP (Model Context Protocol)

**MCP is the key integration mechanism** for extending Claude with external systems.

What MCP provides:
- A standard protocol to expose tools (databases, APIs, services) to AI agents.
- Transport options such as:
  - `stdio` (local tools),
  - `http` (remote microservices).
- Tool discovery, invocation, and structured responses.

With MCP, Claude can:
- Query databases,
- Execute actions,
- Read/write structured data,
- Combine multiple tools in multi-step reasoning.

Anthropic Claude (including Claude Agent SDK and Claude Desktop) can connect to **existing MCP servers** without writing custom clients.

---

## Chat Memory

Claude provides **context management**, but **not persistent memory**.

What is supported:
- Short-term conversational context within the model’s context window.
- Automatic context compression and management in agent loops.

What is NOT supported natively:
- Long-term or cross-session memory.
- User or entity memory persisted to a database.

To implement chat memory:
- Use an **external store** (SQL, NoSQL, vector DB, or graph DB).
- Expose it via MCP as a tool (e.g. `store_memory`, `retrieve_memory`).
- Let the agent decide when to read/write memory.

---

## GraphRAG

Claude Agent SDK **is not a GraphRAG framework**.

GraphRAG typically requires:
- A **knowledge graph** (entities + relationships),
- Optional embeddings for hybrid (graph + vector) retrieval,
- A retriever that combines relational and semantic context,
- An LLM to generate answers.

Claude provides:
- Reasoning,
- Tool orchestration,
- Natural-language understanding.

Claude does **not** provide:
- Graph construction,
- Graph storage,
- Graph traversal primitives.

These must be implemented externally and connected via MCP.

---

## Neo4j + MCP

### mcp-neo4j

The project **`mcp-neo4j`** (https://github.com/neo4j-contrib/mcp-neo4j) provides **ready-to-use MCP servers for Neo4j**.

It exposes Neo4j as MCP tools that Claude can use directly.

Main components:
- **mcp-neo4j-cypher**
  - Natural language → Cypher
  - Read and write operations on the graph
- **mcp-neo4j-memory**
  - Persistent graph-based memory
  - Entities and relationships stored over time
- **mcp-neo4j-data-modeling**
  - Graph modeling and schema exploration
- **mcp-neo4j-cloud-aura-api**
  - Management of Neo4j Aura instances

Supported transports:
- `stdio` (local development, Claude Desktop),
- `http` (production, remote agents).

---

## Using Neo4j MCP with Claude

High-level flow:

1. Start a Neo4j MCP server (e.g. `mcp-neo4j-cypher`).
2. Configure Claude / Claude Agent SDK to connect to that MCP server.
3. Claude discovers Neo4j tools automatically.
4. Claude decides when to:
   - run Cypher queries,
   - create or update nodes/relationships,
   - retrieve graph context for answers.

Example capabilities:
- “Find all people connected to Alice via `WORKS_WITH`.”
- “Create a Project node and link Bob as owner.”
- “Retrieve the subgraph related to this topic and summarize it.”

---

## Neo4j as Graph Memory

Using `mcp-neo4j-memory`, Neo4j can act as:
- Long-term **agent memory**,
- A structured representation of facts, users, concepts, and relationships,
- A foundation for **GraphRAG-style architectures**.

Typical pattern:
- Claude extracts entities and relations from conversations or documents.
- The agent stores them in Neo4j via MCP.
- Future queries retrieve relevant subgraphs as context.
- Claude generates responses grounded in graph data.

---

## Summary Table

| Capability      | Native in Claude | Via MCP + Neo4j |
|-----------------|------------------|-----------------|
| Vector Store    | ❌               | ❌ (external DB required) |
| MCP Support     | ✅               | ✅ |
| Chat Memory     | ⚠️ (short-term) | ✅ (persistent graph memory) |
| GraphRAG        | ❌               | ✅ (custom architecture) |

---

## Key Takeaway

Anthropic Claude is best viewed as:
- **The reasoning engine**
- **The agent orchestrator**

Neo4j (via MCP) provides:
- **Structured knowledge**
- **Persistent memory**
- **Graph-based retrieval**

Together, Claude + Neo4j MCP enable powerful agent architectures, including **GraphRAG**, without Claude needing to natively manage graphs or storage.
