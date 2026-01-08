import os
from dotenv import load_dotenv
from agents import Agent, Runner, tool
from neo4j import GraphDatabase
from agent.embeddings import create_embedding
from agent.neo4j_session import Neo4jChatMemory

load_dotenv()
NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

@tool
def semantic_search(query: str):
    qemb = create_embedding(query)
    with driver.session() as session:
        rows = session.run("MATCH (d:Document) RETURN d.id as id, d.text as text, d.embedding as embedding")
        results = []
        for r in rows:
            emb = r["embedding"]
            score = sum(a*b for a,b in zip(emb, qemb))
            results.append((score, r["id"], r["text"]))
        results.sort(reverse=True)
        return [f"{id}: {text} (score={score})" for score,id,text in results[:5]]

if __name__ == '__main__':
    memory = Neo4jChatMemory(session_id="demo-session")
    agent = Agent(name="neo4j_demo_agent", instructions='Usa il tool semantic_search e rispondi.', tools=[semantic_search])
    print("Agent ready — scrivi domande, 'exit' per terminare")
    while True:
        user = input("User: ")
        if user.strip().lower() in ('exit', 'quit'):
            break
        result = Runner.run_sync(agent, user, session=memory)
        print("Agent:", result.final_output)
