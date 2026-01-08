// app/api/chat/route.ts
import Redis from "ioredis";

const redis = new Redis(6379);

async function embed(text: string): Promise<number[]> {
  // Embedding dummy: map chars to charCode
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

// Preload some sample docs
(async () => {
  await upsertDocument("doc1", "Neo4j is a graph database for connected data.");
  await upsertDocument("doc2", "Next.js is a React framework by Vercel.");
  await upsertDocument("doc3", "Redis is a fast in-memory key-value store.");
})();

export async function POST(req: Request) {
  const { message } = await req.json();
  if (!message) {
    return new Response(JSON.stringify({ error: "No message provided" }), { status: 400 });
  }

  const context = (await searchDocuments(message)).map(d => d.text).join("\n");

  const systemPrompt = `
You are a helpful AI assistant.
Use the following context if relevant:

${context}
`;

  const cohereApiKey = 'sJW80K4LetHCDZeF33JCF63k9y414p4CsurC1K08';

  const res = await fetch("https://api.cohere.com/v2/chat", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${cohereApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "command-a-03-2025",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ]
    }),
  });

  const data = await res.json();
  console.log("Cohere response data:", data);
  console.log("Cohere response data content:", data?.message?.content);
  console.log("Cohere response data content text:", data?.message?.content[0]?.text);

  // Prendi il testo finale in maniera leggibile
  const reply = data?.message?.content[0]?.text ?? "No answer";

  return new Response(JSON.stringify({ reply }), {
    headers: { "Content-Type": "application/json" },
  });
}
