from agents import Session, Message
from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

load_dotenv()
NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

class Neo4jChatMemory(Session):
    def __init__(self, session_id: str):
        self.session_id = session_id

    def append_message(self, message: Message):
        with driver.session() as session:
            session.run(
                "MERGE (s:Session {id:$sid}) "
                "CREATE (m:Message {id: randomUUID(), role:$role, content:$content, ts:timestamp()}) "
                "MERGE (s)-[:HAS_MESSAGE]->(m)",
                sid=self.session_id, role=message.role, content=message.content,
            )

    def get_messages(self):
        with driver.session() as session:
            res = session.run(
                "MATCH (s:Session {id:$sid})-[:HAS_MESSAGE]->(m:Message) "
                "RETURN m.role AS role, m.content AS content "
                "ORDER BY m.ts ASC",
                sid=self.session_id,
            )
            return [Message(role=r["role"], content=r["content"]) for r in res]
