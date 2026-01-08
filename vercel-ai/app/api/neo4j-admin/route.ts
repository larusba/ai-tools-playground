import { runQuery } from "@/lib/neo4j";

export async function POST(req: Request) {
  const { query } = await req.json();
  const res = await runQuery(query);
  return Response.json({ result: res.map(r => r.toObject()) });
}
