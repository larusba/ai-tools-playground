import { runQuery } from "@/lib/neo4j";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const { message } = await req.json();
  await runQuery("CREATE (:Message {role:'user', text:$m})", { m: message });

  const history = await runQuery("MATCH (m:Message) RETURN m.role AS role, m.text AS text");
  const chat = history.map(r => `${r.get("role")}: ${r.get("text")}`).join("\n");

  const res = await generateText({
    model: openai("gpt-4o"),
    prompt: chat
  });

  return Response.json({ response: res.text });
}
