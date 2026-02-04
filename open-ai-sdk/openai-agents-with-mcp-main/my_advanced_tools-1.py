from fastmcp import FastMCP
from neo4j import GraphDatabase
import os

# Definiamo il server
mcp = FastMCP("Neo4j Advanced Tools")

# Funzione helper per ottenere il driver solo quando serve
def get_driver():
    uri = os.getenv("NEO4J_URI")
    user = os.getenv("NEO4J_USERNAME")
    password = os.getenv("NEO4J_PASSWORD")

    print(f"Connessione a Neo4j con URI: {uri}", file=os.sys.stderr)  # Log su stderr
    print(f"Utente Neo4j: {user}", file=os.sys.stderr)  # Log su stderr
    print(f"Password Neo4j: {password}", file=os.sys.stderr)  # Log su stderr

    if not uri or not user or not password:
        raise ValueError("Variabili d'ambiente NEO4J mancanti")
        
    return GraphDatabase.driver(uri, auth=(user, password))

@mcp.tool
def graph_rag_search(question: str) -> str:
    """Esegue una ricerca complessa su Neo4j."""
    try:
        # Ottieni il driver qui dentro, così se fallisce non crasha l'intero server all'avvio
        driver = get_driver()
        
        cypher = """
        MATCH (n:Company) 
        WHERE n.description CONTAINS $keyword
        RETURN n.name as Azienda
        LIMIT 3
        """
        keyword = question.split()[-1] if question else ""
        
        with driver.session() as session:
            result = session.run(cypher, keyword=keyword)
            data = [dict(r) for r in result]
            return str(data)
            
    except Exception as e:
        return f"Errore durante l'esecuzione: {str(e)}"

if __name__ == "__main__":
    # IMPORTANTE: A volte FastMCP prova a lanciare un server HTTP se non specificato.
    # Forziamo stdio per essere sicuri che funzioni con l'agente.
    print("Avvio server MCP Custom...", file=os.sys.stderr) # Stampa su stderr per non rompere il protocollo
    mcp.run(transport="stdio")