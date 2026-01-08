// app/api/chat/route.ts
// Redis Vector Store + Cohere + RAG
// Uses AIStream + StreamingTextResponse (ai@2.1.2)

import Redis from "ioredis";
import { AIStream, StreamingTextResponse } from "ai";

// -----------------------
// 1. Redis setup
// -----------------------
const redis = new Redis(6379);

async function embed(text: string): Promise<number[]> {
  return text.split("").map((c) => c.charCodeAt(0));
}

async function upsertDocument(id: string, text: string) {
  const vector = await embed(text);
  await redis.set(`doc:${id}`, JSON.stringify({ text, vector }));
}

async function searchDocuments(query: string, topK = 3) {
  const qVec = await embed(query);
  const keys = await redis.keys("doc:*");
  const docs: { text: string; score: number }[] = [];

  for (const key of keys) {
    const raw = await redis.get(key);
    if (!raw) continue;
    const data = JSON.parse(raw) as { text: string; vector: number[] };
    const score = data.vector.filter((v: number, i: number) => v === qVec[i]).length;
    docs.push({ text: data.text, score });
  }

  return docs.sort((a, b) => b.score - a.score).slice(0, topK);
}

// Preload sample documents
(async () => {
  await upsertDocument("doc1", "Neo4j is a graph database for connected data.");
  await upsertDocument("doc2", "Next.js is a React framework by Vercel.");
  await upsertDocument("doc3", "Redis is a fast in-memory key-value store.");
})();

// -----------------------
// 2. API Route
// -----------------------
export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages.at(-1)?.content ?? "";

  const context = (await searchDocuments(lastMessage)).map(d => d.text).join("\n");

  const systemPrompt = `
You are a helpful AI assistant.
Use the following context if relevant:

${context}
`;

  const cohereApiKey = "sJW80K4LetHCDZeF33JCF63k9y414p4CsurC1K08";

  const payload = {
    model: "command-xlarge", 
    prompt: `${systemPrompt}\nUser: ${lastMessage}\nAssistant:`,
    max_tokens: 300
  };

  const response = await fetch("https://api.cohere.com/v1/chat", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${cohereApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  // Leggi il JSON completo (non streaming)
  const data = await response.json();
  console.log("Cohere response data:", data);

  // Cohere ritorna in data.generations[0].text
  const text = data.generations?.[0]?.text ?? "";

  return new Response(JSON.stringify({ text }), {
    headers: { "Content-Type": "application/json" }
  });
}

