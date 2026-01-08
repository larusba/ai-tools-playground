"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [chatOutput, setChatOutput] = useState<string>("");
  const [neoOutput, setNeoOutput] = useState<string>("");
  const [pgOutput, setPgOutput] = useState<string>("");
  const [pineconeOutput, setPineconeOutput] = useState<string>("");
  const [llamaOutput, setLlamaOutput] = useState<string>("");

  const callApi = async (url: string, body: any, setter: (data: string) => void) => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setter(JSON.stringify(data, null, 2));
    } catch (err) {
      setter("Error: " + err);
    }
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Scrivi qualcosa..."
        style={{ padding: 8, fontSize: 16, width: "100%" }}
      />

      <button onClick={() => callApi("/api/chat", { messages: [{ content: input }] }, setChatOutput)}>
        Chat (Redis + Cohere)
      </button>
      <pre>{chatOutput}</pre>

      <button onClick={() => callApi("/api/neo4j", { query: "MATCH (n) RETURN n LIMIT 5" }, setNeoOutput)}>
        Neo4j Query
      </button>
      <pre>{neoOutput}</pre>

      <button onClick={() => callApi("/api/postgres", { user: "user1", message: input }, setPgOutput)}>
        Postgres Chat
      </button>
      <pre>{pgOutput}</pre>

      <button
        onClick={() => {
          const vector = input.split("").map((c) => c.charCodeAt(0));
          callApi("/api/pinecone", { vector, metadata: { text: input } }, setPineconeOutput);
        }}
      >
        Pinecone Vector
      </button>
      <pre>{pineconeOutput}</pre>

      <button onClick={() => callApi("/api/llamaindex", { text: input }, setLlamaOutput)}>
        LlamaIndex Ingest
      </button>
      <pre>{llamaOutput}</pre>
    </div>
  );
}
