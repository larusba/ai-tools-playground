import os
import json
from dotenv import load_dotenv
from neo4j import GraphDatabase
from agent.embeddings import create_embedding

load_dotenv()

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

def ensure_constraints():
    with driver.session() as session:
        session.run("CREATE CONSTRAINT doc_id_unique IF NOT EXISTS FOR (d:Document) REQUIRE d.id IS UNIQUE")

def store_document(doc):
    emb = create_embedding(doc["text"])
    with driver.session() as session:
        session.run(
            "MERGE (d:Document {id:$id}) SET d.text = $text, d.embedding = $embedding",
            id=doc["id"], text=doc["text"], embedding=emb,
        )

if __name__ == '__main__':
    ensure_constraints()
    with open("../sample_data/docs.jsonl") as fh:
        for line in fh:
            doc = json.loads(line)
            store_document(doc)
    print("Ingest complete")
