## TODO


- there is a typescript SDK client, but it hasn't yet MCP client and other stuff, it just a wrapper to execute RestAPI calls

### Vector store

Claude Agent SDK non è un vector database né un servizio di storage vettoriale (embedding DB).
Puoi integrare un vector store esterno (es. Pinecone, Milvus) tramite MCP o strumenti personalizzati, ma lo SDK di per sé non funge da vector store. 
Reddit

👉 In altre parole:

Non memorizza embeddings in modo nativo

Non fornisce query semantiche su vettori
Devi collegare un vector DB tu stesso se ti serve RAG o retrieval.






### 🔹 2. MCP (Model Context Protocol)

### 🔹 3. Chat Memory


### 🔹 4. GraphRAG
Claude Agent SDK non è un framework di GraphRAG (non costruisce grafi di conoscenza internamente).
GraphRAG richiede tipicamente: