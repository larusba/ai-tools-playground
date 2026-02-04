from fastmcp import FastMCP
from neo4j import GraphDatabase
import os
import sys

# Initialize the Custom MCP Server
mcp = FastMCP("Neo4j Advanced Tools")

def get_driver():
    """Lazily initializes the Neo4j driver to avoid startup crashes."""
    uri = os.getenv("NEO4J_URI")
    user = os.getenv("NEO4J_USERNAME")
    password = os.getenv("NEO4J_PASSWORD")
    
    if not uri or not user or not password:
        raise ValueError("Missing Neo4j environment variables (URI, USERNAME, or PASSWORD).")
        
    return GraphDatabase.driver(uri, auth=(user, password))

@mcp.tool
def graph_rag_search(question: str) -> str:
    """
    Executes a GraphRAG (Graph Retrieval-Augmented Generation) search.
    Use this tool for complex analysis, finding similar entities, or exploring 
    competitor landscapes where simple lookups are insufficient.
    """
    try:
        driver = get_driver()
        db_name = os.getenv("NEO4J_DATABASE", "neo4j")
        
        # NOTE: In a real production scenario, you would generate embeddings here 
        # using the 'question' and OpenAI API, then use vector search in Neo4j.
        
        # Simulated complex logic for demonstration:
        cypher_query = """
        MATCH (c:Company) 
        WHERE toLower(c.name) CONTAINS toLower($keyword) 
           OR toLower(c.description) CONTAINS toLower($keyword)
        
        OPTIONAL MATCH (c)-[:COMPETES_WITH]->(competitor)
        
        RETURN c.name AS Company, 
               c.description AS Description, 
               collect(competitor.name) AS Competitors
        LIMIT 5
        """
        
        # Simple keyword extraction for simulation purposes
        keyword = question.split()[-1] if question else ""
        
        with driver.session(database=db_name) as session:
            result = session.run(cypher_query, keyword=keyword)
            data = [dict(record) for record in result]
            
        if not data:
            return f"No results found in the graph for keyword: '{keyword}'."
            
        return str(data)
            
    except Exception as e:
        return f"Error executing GraphRAG search: {str(e)}"

if __name__ == "__main__":
    # Force stdio transport for compatibility with the OpenAI Python SDK agent
    mcp.run(transport="stdio")