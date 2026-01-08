import { runQuery } from "@/lib/neo4j";

export async function POST(req: Request) {
  const { query } = await req.json();
  const parts = query.split(" ");
  const [s, rel, o] = parts;
  await runQuery(
    "MERGE (a:Entity {name:$s}) MERGE (b:Entity {name:$o}) MERGE (a)-[r:" + rel.toUpperCase() + "]->(b)",
    { s, o }
  );
  return Response.json({ status: "created" });
}
