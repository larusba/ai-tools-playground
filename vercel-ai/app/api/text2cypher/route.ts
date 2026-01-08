import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const { query } = await req.json();
  const res = await generateText({
    model: openai("gpt-4o"),
    prompt: "Transform this natural language into Neo4j Cypher. ONLY output Cypher: " + query
  });
  return Response.json({ cypher: res.text });
}
