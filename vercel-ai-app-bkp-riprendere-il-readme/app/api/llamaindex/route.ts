import { SimpleNode, DocumentStore } from "llamaindex";

const store = new DocumentStore();

export async function POST(req: Request) {
  const { text } = await req.json();
  if (!text) return new Response("Missing text", { status: 400 });

  const node = new SimpleNode({ text });
  store.addNode(node);

  return new Response(JSON.stringify({ status: "ingested", nodeId: node.id }), { headers: { "Content-Type": "application/json" } });
}
