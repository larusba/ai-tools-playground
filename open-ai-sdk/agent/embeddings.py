import os
from dotenv import load_dotenv
load_dotenv()
import openai

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
openai.api_key = OPENAI_API_KEY

def create_embedding(text: str) -> list:
    resp = openai.Embedding.create(model=EMBEDDING_MODEL, input=text)
    return resp["data"][0]["embedding"]
