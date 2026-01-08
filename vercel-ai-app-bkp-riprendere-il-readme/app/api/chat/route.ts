import { VercelAIProvider } from "@mem0/vercel-ai-provider";
import { VercelAIMemory } from "@mem0/vercel-ai-memory";
import { VercelAIEmbeddings } from "@mem0/vercel-ai-embeddings";

export const runtime = "edge"; // Edge Function

// Inizializza provider e memory/embedding store
const memory = new VercelAIMemory({ namespace: "chat-memory" });
const embeddings = new VercelAIEmbeddings({ namespace: "docs" });
const ai = new VercelAIProvider({ model: "cohere-command-a-03-2025" });

// Pre-caricamento documenti
(async () => {
  await embeddings.upsertDocument("doc1", "Neo4j is a graph database for connected data.");
  await embeddings.upsertDocument("doc2", "Next.js is a React framework by Vercel.");
  await embeddings.upsertDocument("doc3", "Redis is a fast in-memory key-value store.");
})();

export async function POST(req: Request) {
  const { messages } = await req.json();
  const userText = messages.at(-1)?.content?.trim();
  if (!userText) {
    return new Response(JSON.stringify({ error: "No user message provided." }), { status: 400 });
  }

  // Recupera ultimi messaggi per chat memory
  const contextMessages = await memory.load({ userId: "user1", topK: 5 });

  // Recupera documenti simili
  const docs = await embeddings.similaritySearch(userText, 3);

  // Componi prompt combinando memoria + documenti
  const prompt = [
    { role: "system", content: "Sei un assistente AI utile." },
    ...contextMessages,
    { role: "user", content: userText + "\n\n" + docs.map(d => d.text).join("\n") }
  ];

  // Genera risposta AI
  const aiResponse = await ai.chat(prompt);

  // Salva la conversazione
  await memory.save({ userId: "user1", message: userText, response: aiResponse });

  return new Response(JSON.stringify({ response: aiResponse }), { headers: { "Content-Type": "application/json" } });
}
