import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/chatdb",
});

export async function POST(req: Request) {
  const { user, message } = await req.json();
  if (!user || !message) return new Response("Missing user or message", { status: 400 });

  const client = await pool.connect();
  try {
    await client.query(
      "INSERT INTO messages (user_id, content) VALUES ($1, $2)",
      [user, message]
    );
    const res = await client.query("SELECT * FROM messages ORDER BY created_at DESC LIMIT 10");
    return new Response(JSON.stringify({ messages: res.rows }), { headers: { "Content-Type": "application/json" } });
  } finally {
    client.release();
  }
}
