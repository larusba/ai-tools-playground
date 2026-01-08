# AI Tools Playground

This repository contains READMEs and example code describing missing or advanced features for various AI tools integrated with **Neo4j**, along with concrete usage examples.

The goal of this project is to document common gaps encountered when building AI systems on top of Neo4j and to provide practical reference implementations for those features.


## Overview

AI Tools Playground focuses on real-world integration patterns between:

- Large Language Models (LLMs)
- Neo4j knowledge graphs
- Vector databases and semantic search
- Retrieval-augmented generation (RAG)
- Agent-style workflows and memory

Each directory typically contains a README explaining the problem, the missing feature, and one or more implementation approaches.


## Covered Features

This repository documents and demonstrates the following core capabilities:

### Vector Store

Examples showing how to store embeddings in external vector stores or in Neo4j, including:
- Embedding creation
- Indexing strategies
- Update and deletion patterns


### Vector Search

Examples of semantic similarity search using vectors, including:
- Query embedding generation
- Nearest-neighbor retrieval
- Integration with LLMs for downstream reasoning


### GraphRAG with Retrieval Statements

Graph-augmented Retrieval-Augmented Generation patterns using Neo4j, including:
- Retrieval statements expressed in natural language
- Cypher-based graph retrieval
- Combining vector retrieval with graph constraints
- Supplying structured graph context to LLMs


### Chat Memory

Patterns for persistent conversational memory backed by Neo4j or other databases, including:
- Storing conversation facts
- Recalling past user information
- Using graph structures as long-term memory


### Text2Cypher

Examples demonstrating how to convert natural language queries into Cypher queries, including:
- Prompt patterns for reliable Cypher generation
- Validation and safety considerations
- Executing generated queries against Neo4j


## Repository Structure

```

ai-tools-playground/
├── text2cypher/
├── vector-store/
├── vector-search/
├── graph-rag/
├── chat-memory/
├── neo4j-mcp-examples/
└── README.md

```


## Purpose

This repository is intended as a reference and experimentation space for developers building AI systems that rely on Neo4j for structured knowledge, retrieval, and memory.

The examples are not production-ready but are meant to highlight design patterns, limitations, and implementation strategies.
