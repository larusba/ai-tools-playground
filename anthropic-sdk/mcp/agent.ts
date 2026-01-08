import { Agent } from "@anthropic-ai/agent-sdk";

export const agent = new Agent({
  model: "claude-4.1",
  mcpServers: [
    {
      name: "neo4j",
      url: "http://127.0.0.1:8080/api/mcp" // MCP Neo4j locale collegato al database companies
    }
  ]
});
