from agents import Agent, Runner
from agents.mcp import MCPServerStdio
from dotenv import load_dotenv
import asyncio
import os
import sys # Necessario per il server custom

load_dotenv()

async def interactive_main():
    
    # --- SERVER 1: IL TUO ORIGINALE (Standard) ---
    # Questo è il blocco esatto che avevi all'inizio e che funzionava.
    async with MCPServerStdio(
        name="neo4j_standard",
        cache_tools_list=True,
        params={
            "type": "stdio",
            "command": "neo4j-mcp",  # <--- Il tuo comando originale
            "args": [],              # <--- I tuoi argomenti originali
            "env": {
                "NEO4J_URI": "neo4j+s://demo.neo4jlabs.com:7687",
                "NEO4J_USERNAME": "companies",
                "NEO4J_PASSWORD": "companies",
                "NEO4J_DATABASE": "companies"
            }
        },
    ) as standard_server:

        # --- SERVER 2: IL NUOVO CUSTOM (GraphRAG) ---
        # Questo aggiunge le funzioni extra descritte nel PDF
        async with MCPServerStdio(
            name="neo4j_custom",
            params={
                "type": "stdio",
                "command": sys.executable, # Usa lo stesso python dell'ambiente
                "args": [
                    os.path.join(os.path.dirname(__file__), "my_advanced_tools.py")
                ], 
                "env": {
                    # Passiamo le stesse variabili anche al server custom
                    "NEO4J_URI": "neo4j+s://demo.neo4jlabs.com:7687",
                    "NEO4J_USERNAME": "companies",
                    "NEO4J_PASSWORD": "companies",
                    "NEO4J_DATABASE": "companies",
                    "OPENAI_API_KEY": os.environ.get("OPENAI_API_KEY") 
                }
            }
        ) as custom_server:

            # --- AGENTE UNIFICATO ---
            agent = Agent(
                name="OpenAI + MCP Agent",
                instructions=(
                    "Sei un esperto di dati aziendali. "
                    "Per esplorare il database o fare query semplici, usa i tool standard. "
                    "Se l'utente fa domande complesse, vaghe o che richiedono ragionamento (es. GraphRAG), "
                    "usa il tool 'graph_rag_search' dal server custom."
                ),
                # Qui passiamo ENTRAMBI i server
                mcp_servers=[standard_server, custom_server],
                model=os.environ.get("OPENAI_MODEL"),
            )

            print("\nType your request (or 'exit' to quit):")
            while True:
                user_input = input("👶 You: ").strip()
                if user_input.lower() in {"exit", "quit"}:
                    print("Exiting interactive session.")
                    break
                try:
                    result = await Runner.run(starting_agent=agent, input=user_input)
                    print(f"\n🤖 Agent: {result.final_output}\n")
                except Exception as e:
                    print(f"\nError processing request: {str(e)}\n")

if __name__ == "__main__":
    asyncio.run(interactive_main())