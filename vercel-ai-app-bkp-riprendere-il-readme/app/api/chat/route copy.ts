// // app/api/chat/route.ts
// // Redis + RAG example using ai@2.1.2 StreamingTextResponse

// import Redis from "ioredis";
// import { OpenAIStream, StreamingTextResponse } from "ai";

// // Initialize Redis
// const redis = new Redis(6379);

// async function embed(text: string): Promise<number[]> {
//   return text.split("").map((c) => c.charCodeAt(0));
// }

// async function upsertDocument(id: string, text: string) {
//   const vector = await embed(text);
//   await redis.set(`doc:${id}`, JSON.stringify({ text, vector }));
// }

// async function searchDocuments(query: string, topK = 3) {
//   const qVec = await embed(query);
//   const keys = await redis.keys("doc:*");
//   const docs: { text: string; score: number }[] = [];

//   for (const key of keys) {
//     const raw = await redis.get(key);
//     if (!raw) continue;
//     const data = JSON.parse(raw) as { text: string; vector: number[] };
//     const score = data.vector.filter((v: number, i: number) => v === qVec[i]).length;
//     docs.push({ text: data.text, score });
//   }

//   return docs.sort((a, b) => b.score - a.score).slice(0, topK);
// }

// // Preload some docs
// (async () => {
//   await upsertDocument("doc1", "Neo4j is a graph database for connected data.");
//   await upsertDocument("doc2", "Next.js is a React framework by Vercel.");
//   await upsertDocument("doc3", "Redis is a fast in-memory key-value store.");
// })();

// export async function POST(req: Request) {
//   const { messages } = await req.json();
//   const lastMessage = messages.at(-1)?.content ?? "";

//   const context = (await searchDocuments(lastMessage)).map((d) => d.text).join("\n");

//   const systemPrompt = `
// You are a helpful AI assistant.
// Use the following context if relevant:

// ${context}
// `;

//   // Call OpenAI API directly
//   const payload = {
//     model: "gpt-4o-mini",
//     messages: [
//       { role: "system", content: systemPrompt },
//       ...messages,
//     ],
//     stream: true,
//   };

//   const response = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer dummy_key` // hardcoded key for local testing
//     },
//     body: JSON.stringify(payload),
//   });

//   const stream = OpenAIStream(response);
//   return new StreamingTextResponse(stream);
// }
