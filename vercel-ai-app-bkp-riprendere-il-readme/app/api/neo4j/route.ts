import { driver as neo4jDriver } from "neo4j-driver";

const driver = neo4jDriver(
  process.env.NEO4J_URI || "neo4j://localhost:7687",
  neo4jDriver.auth.basic(
    process.env.NEO4J_USER || "neo4j",
    process.env.NEO4J_PASSWORD || "password"
  )
);

export async function POST(req: Request) {
  const { query } = await req.json();
  if (!query) return new Response("No query provided", { status: 400 });

  const session = driver.session();
  try {
    const result = await session.run(query);
    const records = result.records.map(r => r.toObject());
    return new Response(JSON.stringify({ records }), { headers: { "Content-Type": "application/json" } });
  } finally {
    await session.close();
  }
}
