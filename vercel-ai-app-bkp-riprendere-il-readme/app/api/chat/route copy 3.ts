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

export async function POST(req: Request) {
  const { messages } = await req.json();

  const lastMessageObj = messages.at(-1);
  const userText = lastMessageObj?.content?.trim();

  if (!userText) {
    return new Response(
      JSON.stringify({ error: "No user message provided." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const context = (await searchDocuments(userText))
    .map((d) => d.text)
    .join("\n");

  const systemPrompt = `
You are a helpful AI assistant.
Use the following context if relevant:

${context}
`;

  const cohereApiKey = "cohereApiKey";

  const response = await fetch("https://api.cohere.com/v2/chat", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${cohereApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "command-a-03-2025",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userText }
      ],
      stream: true
    }),
  });

  const stream = AIStream(response, (event) => event);
  return new StreamingTextResponse(stream);
}
