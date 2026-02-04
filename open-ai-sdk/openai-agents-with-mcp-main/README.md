# OpenAI Agents + Neo4j MCP: Dual Server Architecture

This project demonstrates how to build an advanced AI Agent using the **OpenAI Python SDK** that connects to **Neo4j** using the **Model Context Protocol (MCP)**.

It implements a **Dual Server Architecture**:
1.  **Standard Server (`neo4j-mcp`)**: Provides out-of-the-box tools for schema exploration and basic read/write operations.
2.  **Custom Server (`my_advanced_tools.py`)**: Implements custom logic (e.g., GraphRAG, Vector Search, complex traversals) using `FastMCP`.

## Prerequisites

* Python 3.10+
* [uv](https://docs.astral.sh/uv/) (Recommended for dependency management)
* A Neo4j Database (AuraDB or Local)
* OpenAI API Key

## Installation

1.  **Clone the repository** and navigate to the folder.

2.  **Install dependencies** using `uv`:
    ```bash
    uv add openai-agents mcp neo4j fastmcp python-dotenv
    ```
    *(Or use `pip install ...` if not using uv)*

3.  **Ensure the standard MCP server is installed**:
    ```bash
    uv pip install mcp-neo4j-cypher
    # or ensure "neo4j-mcp" command is available in your path
    ```

## Configuration

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o

# Neo4j Credentials
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password
NEO4J_DATABASE=neo4j  # or your specific database name

```

## Architecture Overview

### 1. `interactive_main.py` (The Agent)

This is the entry point. It configures the **OpenAI Agent** with two MCP connections:

* It launches the standard `neo4j-mcp` toolset via `uvx` or command line.
* It launches the custom Python script (`my_advanced_tools.py`) as a subprocess.
* It orchestrates the conversation, allowing the LLM to choose between standard schema inspection and advanced analysis.

### 2. `my_advanced_tools.py` (Custom Logic)

This file uses `FastMCP` to expose specific Python functions as tools.

* **`graph_rag_search`**: A tool designed for complex queries. Instead of letting the LLM write arbitrary Cypher (which can be error-prone for vectors), this tool encapsulates the logic (Embedding + Vector Index Search + Graph Traversal) in a safe, controlled function.

## Usage

Run the interactive agent:

```bash
uv run python interactive_main.py

```

You will see a prompt: `User:`. The agent is now ready.

## Example Prompts

Here are some questions to test if the Agent is correctly switching between the two servers.

### Discovery (Uses Standard Server)

*These prompts force the agent to look at the database structure.*

* "Show me the database schema and list all relationship types."
* "How many nodes labeled 'Company' are currently in the database?"
* "List the properties available on the 'Company' nodes."

### Analysis (Uses Custom GraphRAG Tool)

*These prompts force the agent to use your custom Python logic.*

* "Use the advanced search tool to find companies related to 'cloud services' and list their competitors."
* "Analyze the competitors of 'Google' using the GraphRAG logic and tell me who they are."
* "Find companies similar to 'Apple' based on their description and show their connections."

### Hybrid (Uses Both)

*The agent must explore first, then analyze.*

* "First, check if a company named 'Salesforce' exists. If yes, use the advanced tool to find its main competitors."
* "I want to compare 'Google' and 'Microsoft'. Run the advanced analysis for both and summarize the common competitors."

## Troubleshooting

* **`ModuleNotFoundError: No module named 'fastmcp'`**:
Ensure you ran `uv add fastmcp` and that `interactive_main.py` is using `sys.executable` in the command parameters.
* **`Connection closed` error**:
This usually means the `my_advanced_tools.py` script crashed on startup. Try running it manually to see the error: `uv run python my_advanced_tools.py`.
