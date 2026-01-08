import { PineconeClient } from "@pinecone-database/pinecone";

const client = new PineconeClient();
await client.init({ apiKey: process.env.PINECONE_API_KEY || "", environment: "us-west1-gcp" });

const index = client.Index("my-index");

export async function POST(req: Request) {
  const { vector, metadata } = await req.json();
  if (!vector) return new Response("Vector missing", { status: 400 });

  await index.upsert({ vectors: [{ id: crypto.randomUUID(), values: vector, metadata }] });
  return new Response(JSON.stringify({ status: "ok" }), { headers: { "Content-Type": "application/json" } });
}
