from agents import Agent, Runner
from agents.mcp import MCPServerStdio
from dotenv import load_dotenv
import asyncio
import os

load_dotenv()

print("dotenv NEO4J_URI", os.environ.get("NEO4J_URI"))
print("dotenv NEO4J_USERNAME", os.environ.get("NEO4J_USERNAME"))
print("dotenv NEO4J_PASSWORD", os.environ.get("NEO4J_PASSWORD"))
print("dotenv OPENAI_API_KEY", os.environ.get("OPENAI_API_KEY"))

async def interactive_main():
    # --- SERVER 1: Standard (Neo4j Ufficiale) ---
    async with MCPServerStdio(
        name="neo4j_standard",
        params={
            "type": "stdio",
            "command": "uvx", # Oppure il percorso diretto all'eseguibile se preferisci
            "args": ["mcp-neo4j-cypher", "--transport", "stdio"],
            "env": {
                "NEO4J_URI": os.environ.get("NEO4J_URI"),
                "NEO4J_USERNAME": os.environ.get("NEO4J_USERNAME"),
                "NEO4J_PASSWORD": os.environ.get("NEO4J_PASSWORD"),
            }
        }
    ) as standard_server:

        # --- SERVER 2: Custom (Il tuo script Python) ---
        # Nota: Assicurati che 'my_advanced_tools.py' sia nella stessa cartella
        # o fornisci il percorso assoluto.
        async with MCPServerStdio(
            name="neo4j_custom",
            params={
                "type": "stdio",
                "command": "python",  # Usiamo python per lanciare il tuo script
                "args": ["my_advanced_tools.py"], 
                "env": {
                    "NEO4J_URI": os.environ.get("NEO4J_URI"),
                    "NEO4J_USERNAME": os.environ.get("NEO4J_USERNAME"),
                    "NEO4J_PASSWORD": os.environ.get("NEO4J_PASSWORD"),
                    "OPENAI_API_KEY": os.environ.get("OPENAI_API_KEY") 
                }
            }
        ) as custom_server:

            # Creiamo l'agente con ENTRAMBI i server
            agent = Agent(
                name="Neo4j Super Agent",
                instructions=(
                    "Sei un assistente esperto di Neo4j. "
                    "Per esplorare lo schema o query semplici, usa i tool standard. "
                    "Per analisi complesse o GraphRAG, usa il tool 'graph_rag_search'."
                ),
                mcp_servers=[standard_server, custom_server], 
                model=os.environ.get("OPENAI_MODEL"),
            )

            print("\nType your request (or 'exit' to quit):")
            
            while True:
                user_input = input("👶 You: ").strip()
                if user_input.lower() in {"exit", "quit"}: break
                try:
                    result = await Runner.run(starting_agent=agent, input=user_input)
                    print(f"\n🤖 Agent: {result.final_output}\n")
                except Exception as e:
                    print(f"\nError: {str(e)}\n")

if __name__ == "__main__":
    asyncio.run(interactive_main())