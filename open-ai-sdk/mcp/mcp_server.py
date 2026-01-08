from fastapi import FastAPI
from pydantic import BaseModel
from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

class CypherQuery(BaseModel):
    query: str

@app.post("/run_cypher")
async def run_cypher(payload: CypherQuery):
    with driver.session() as session:
        res = session.run(payload.query)
        rows = [r.data() for r in res]
        return {"rows": rows}

if __name__ == '__main__':
    import uvicorn
    port = int(os.getenv("MCP_SERVER_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
