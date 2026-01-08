import { runQuery } from "@/lib/neo4j";
import { embed, cosineSim } from "@/lib/embeddings";

export async function POST(req: Request) {
  const { query, topK = 3 } = await req.json();
  const qVec = await embed(query);

  const res = await runQuery(
    "MATCH (d:Doc) RETURN d.text AS text, d.embedding AS embedding"
  );

  const scored = res.map(r => {
    const text = r.get("text");
    const embedding = JSON.parse(r.get("embedding") || "[]");
    return { text, score: cosineSim(qVec, embedding) };
  });

  const top = scored.sort((a,b) => b.score - a.score).slice(0, topK);
  return Response.json({ query, results: top });
}
