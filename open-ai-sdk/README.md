-- # TODO

- [ ] TODO: permette di fare dei custom tools
- [ ] /Users/giuseppevillani/Documents/Projects/vercel-ai-sdk/open-ai-sdk
- [ ] https://milvus.io/docs/openai_agents_milvus.md	
- [ ] MCP: https://github.com/lastmile-ai/openai-agents-mcp
- [ ] https://openai.github.io/openai-agents-python/tools/
- [ ] vector store qdrant: https://github.com/openai/openai-knowledge-retrieval?utm_source=chatgpt.com
- [ ] https://github.com/openai/openai-agents-python/blob/main/examples/memory/redis_session_example.py
- [ ] https://github.com/openai/openai-knowledge-retrieval
- [ ] https://github.com/openai/openai-agents-python
- [ ] https://github.com/rafaelpierre/openai-agents-redis
    - [ ] simile a https://github.com/neo4j-contrib/mcp-neo4j
-     
- [ ] https://github.dev/jalakoo/openai-agents-with-mcp
- [ ] https://docs.google.com/document/d/1_g8r5qp0CXNv6B7H829gUlKN5wU_IAo4wXprYZuZuiQ/edit?tab=t.0#heading=h.wlhmggl3qhhv
- [ ] https://github.com/neo4j-contrib/mcp-neo4j/tree/main/servers/mcp-neo4j-cypher
- [ ] https://dev.to/composiodev/openai-agents-sdk-a-step-by-step-guide-to-building-real-world-mcp-agents-with-composio-4f92
- [ ] fare un file tipo questo: https://github.com/neo4j-examples/neo4j-gcp-vertex-ai-langchain/blob/main/toolbox-companies/tools.yaml
- 


----> As a reminder - Agent tools can be Python functions, or Vertex AI Extensions, or MCP Server tools.


# TODO - STEPS TO DO:
- https://github.com/neo4j-contrib/mcp-neo4j/tree/main/servers/mcp-neo4j-cypher#multiple-database-example


# TODO - STEPS DONE:
- git clone https://github.com/neo4j/mcp.git


# TODO - scrivere sull'excel
- questo non va, ci vuole npx invece di uvx come invece detto su TODO
```
"neo4j-database": {
      "command": "uvx",
      "args": [ "mcp-neo4j-cypher@0.5.2", "--transport", "stdio"  ],
      "env": {
        "NEO4J_URI": "bolt://localhost:7687",
        "NEO4J_USERNAME": "neo4j",
        "NEO4J_PASSWORD": "<your-password>",
        "NEO4J_DATABASE": "neo4j"
      }
    }
```


# OpenAI Agents + Neo4j Full Demo

## MISSING THINGS:

- [ ] Text2Cypher: could be used neo4j-graphrag-python package instead
- [ ] GraphRAG concept: could be used neo4j-graphrag-python package instead
- [ ] Chat memory: could be used neo4j-graphrag-python package instead
- [ ] Knowledge Graph Construction: could be used neo4j-graphrag-python package instead (https://neo4j.com/docs/neo4j-graphrag-python/current/user_guide_rag.html#text2cypher-retriever-user-guide)


## Project Structure

```
demo_full_functional/
├── README.md                 # This file
├── docker-compose.yml        # Services configuration: Neo4j + Python app
├── Dockerfile                # Dockerfile for building the Python app
├── .env.example              # Required environment variables
├── requirements.txt          # Python dependencies
├── ingest/ingest.py          # Script to import documents and generate embeddings
├── agent/agent_app.py        # CLI Agent using tools and chat memory
├── agent/neo4j_session.py    # Chat memory class persisted in Neo4j
├── agent/embeddings.py       # Functions to generate OpenAI embeddings
├── mcp/mcp_server.py         # FastAPI server exposing Neo4j as a tool (MCP)
└── sample_data/docs.jsonl    # Example documents for ingestion
```

## Examples

* **Vector Retrieval / RAG**: semantic search on documents using OpenAI embeddings
* **GraphRAG**: query entities and relationships via Neo4j
* **Chat Memory**: sessions persisted in Neo4j
* **MCP Server**: FastAPI server exposing an endpoint to execute Cypher queries from agents
* **CLI Agent**: multi-turn interaction using integrated tools

## Quick Setup

1. Copy `.env.example` to `.env` and add your OpenAI API key:

```bash
cp .env.example .env
```

2. Start Neo4j and the Python app using Docker Compose:

```bash
docker compose up --build
```

3. Ingest the example documents:

```bash
docker compose exec app python ingest/ingest.py
```

4. Start the MCP server:

```bash
docker compose exec app python mcp/mcp_server.py &
```

5. Start the CLI Agent:

```bash
docker compose exec app python agent/agent_app.py
```

Type your questions; the `semantic_search` tool will be used to provide answers based on the documents.

## Notes

* All components are containerized with Docker for easy startup and isolation.
* The ingestion script generates embeddings for Vector-RAG using the model specified in `.env`.
* Chat sessions are persisted in Neo4j for multi-turn conversations.
* The MCP Server allows agents to dynamically execute Cypher queries.
