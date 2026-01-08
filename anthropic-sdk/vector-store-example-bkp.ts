import { Agent, Tool } from "@anthropic/claude-agent-sdk";
import { PineconeClient } from "@pinecone-database/pinecone";

// Configura il client Pinecone
const pinecone = new PineconeClient();
await pinecone.init({ apiKey: process.env.PINECONE_API_KEY!, environment: "us-west1-gcp" });
const index = pinecone.Index("my-index");

// Tool personalizzato per retrieval dal vector store
const vectorSearchTool: Tool = {
  name: "vector-search",
  description: "Esegui una ricerca semantica su Pinecone.",
  run: async (query: string) => {
    const embedding = await getEmbedding(query); // funzione che genera embedding con modello
    const results = await index.query({
      vector: embedding,
      topK: 5,
      includeMetadata: true,
    });
    return results.matches.map(m => m.metadata.text).join("\n");
  },
};

// Crea l’agente Claude con lo strumento
const agent = new Agent({
  tools: [vectorSearchTool],
});

// Usa l’agente
const response = await agent.run("Trova le informazioni più rilevanti sul mio documento");
console.log(response);

// TODO ----> https://chatgpt.com/c/69529530-5714-832d-9686-0360e0856db9
