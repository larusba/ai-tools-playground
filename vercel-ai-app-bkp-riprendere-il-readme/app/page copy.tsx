'use client';

import { useState } from "react";

type Message = { role: string; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // chiamata backend
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, userMsg] }),
    });

    if (!res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let assistantMsg = { role: "assistant", content: "" };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      assistantMsg.content += decoder.decode(value);
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = assistantMsg;
        return copy;
      });
    }

    setMessages((prev) => [...prev, assistantMsg]);
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1>RAG Chat Example</h1>
      <div style={{ border: "1px solid #ccc", padding: "1rem", height: "300px", overflow: "auto" }}>
        {messages.map((msg, i) => (
          <div key={i}><strong>{msg.role}:</strong> {msg.content}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={e => setInput(e.target.value)} style={{ width: "80%", marginRight: "1rem" }} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
