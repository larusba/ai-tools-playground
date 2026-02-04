from agents import Agent, Runner
from agents.mcp import MCPServerStdio
from dotenv import load_dotenv
import asyncio
import os
import sys

load_dotenv()

async def interactive_main():
    
    # --- SERVER 1: STANDARD NEO4J SERVER ---
    # Used for general exploration (schema, basic Cypher queries).
    async with MCPServerStdio(
        name="neo4j_standard",
        cache_tools_list=True,
        params={
            "type": "stdio",
            "command": "neo4j-mcp",  # Ensure this is installed via pip/uv
            "args": [],
            "env": {
                "NEO4J_URI": os.environ.get("NEO4J_URI"),
                "NEO4J_USERNAME": os.environ.get("NEO4J_USERNAME"),
                "NEO4J_PASSWORD": os.environ.get("NEO4J_PASSWORD"),
                "NEO4J_DATABASE": os.environ.get("NEO4J_DATABASE", "neo4j"),
            }
        },
    ) as standard_server:

        # --- SERVER 2: CUSTOM PYTHON SERVER (GraphRAG) ---
        # Used for advanced logic, vector search, and complex traversals.
        async with MCPServerStdio(
            name="neo4j_custom",
            params={
                "type": "stdio",
                "command": sys.executable, # Uses the current Python environment
                "args": [
                    os.path.join(os.path.dirname(__file__), "my_advanced_tools.py")
                ], 
                "env": {
                    "NEO4J_URI": os.environ.get("NEO4J_URI"),
                    "NEO4J_USERNAME": os.environ.get("NEO4J_USERNAME"),
                    "NEO4J_PASSWORD": os.environ.get("NEO4J_PASSWORD"),
                    "NEO4J_DATABASE": os.environ.get("NEO4J_DATABASE", "neo4j"),
                    "OPENAI_API_KEY": os.environ.get("OPENAI_API_KEY") 
                }
            }
        ) as custom_server:

            # --- UNIFIED AGENT ---
            agent = Agent(
                name="OpenAI + Neo4j Advanced Agent",
                instructions=(
                    "You are an expert business data analyst using a Neo4j Knowledge Graph. "
                    "You have access to two sets of tools:\n"
                    "1. Standard Tools: Use these to explore the database schema, check node labels, or run simple queries.\n"
                    "2. Advanced Tools: Use 'graph_rag_search' when the user asks complex, vague, or semantic questions "
                    "(e.g., 'find similar companies', 'analyze competitors').\n"
                    "Always choose the most appropriate tool for the specific task."
                ),
                mcp_servers=[standard_server, custom_server],
                model=os.environ.get("OPENAI_MODEL", "gpt-4o"),
            )

            print("\nType your request (or 'exit' to quit):")
            
            while True:
                user_input = input("User: ").strip()

                if user_input.lower() in {"exit", "quit"}:
                    print("Exiting interactive session.")
                    break

                try:
                    result = await Runner.run(starting_agent=agent, input=user_input)
                    print(f"\nAgent: {result.final_output}\n")
                except Exception as e:
                    print(f"\nError processing request: {str(e)}\n")

if __name__ == "__main__":
    asyncio.run(interactive_main())