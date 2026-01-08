# OpenAI Agents + Neo4j Full Demo

# TODO
CHECK OTHER STUFF, AND MISSING STUFF
- https://chatgpt.com/c/693c391c-6040-832b-b66e-1b217dfb5a46


This project is a complete demo integrating the OpenAI Agents Python SDK with Neo4j, featuring **Vector-RAG**, **GraphRAG**, **Chat Memory**, and an **MCP Server**.

TODO --> says that we can use neo4j-graphrag-python package instead: https://github.com/neo4j/neo4j-graphrag-python

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

## Features

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
