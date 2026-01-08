"use client";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  async function call(endpoint: string) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: input, message: input })
    });
    const json = await res.json();
    setOutput(JSON.stringify(json, null, 2));
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Neo4j AI + OpenAI Examples</h1>
      <textarea
        rows={3}
        style={{ width: "100%" }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <br /><br />

      <button onClick={() => call("/api/vector-rag")}>Vector RAG</button>
      <button onClick={() => call("/api/chat-memory")}>Chat Memory</button>
      <button onClick={() => call("/api/text2cypher")}>Text2Cypher</button>
      <button onClick={() => call("/api/kg-write")}>KG Write</button>
      <button onClick={() => call("/api/neo4j-admin")}>Neo4j Admin</button>

      <pre style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>{output}</pre>
    </main>
  );
}
