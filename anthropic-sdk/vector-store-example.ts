import Anthropic from "@anthropic-ai/sdk";
import neo4j, { Driver } from "neo4j-driver";
import { Neo4jContainer } from "@testcontainers/neo4j";
import { Wait } from "testcontainers";
import { ContentBlock, TextBlock } from "@anthropic-ai/sdk/resources/messages.mjs";

// --------------------
// Embedding stub
// --------------------
async function getEmbedding(text: string): Promise<number[]> {
  return Array(1536).fill(0).map(() => Math.random());
}

// --------------------
// Main
// --------------------
(async () => {
  // ---- Neo4j container
  const neo4jContainer = await new Neo4jContainer("neo4j:5.26.16")
    .withWaitStrategy(Wait.forLogMessage("Started."))
    .start();

  const driver: Driver = neo4j.driver(
    neo4jContainer.getBoltUri(),
    neo4j.auth.basic(
      neo4jContainer.getUsername(),
      neo4jContainer.getPassword()
    )
  );

  const session = driver.session();

  // ---- Vector index
  await session.run(`
    CREATE VECTOR INDEX document_embedding_index IF NOT EXISTS
    FOR (d:Document)
    ON (d.embedding)
    OPTIONS {
      indexConfig: {
        \`vector.dimensions\`: 1536,
        \`vector.similarity_function\`: 'cosine'
      }
    }
  `);

  await session.run(
    `
    CREATE (:Document {
      text: $text,
      embedding: $embedding
    })
    `,
    {
      text: "Neo4j supporta vector search nativa per costruire RAG e agenti.",
      embedding: await getEmbedding("neo4j vector search"),
    }
  );

  await session.close();

  // --------------------
  // Tool implementation
  // --------------------
  async function vectorSearch(query: string): Promise<string> {
    const embedding = await getEmbedding(query);
    const session = driver.session();

    try {
      const res = await session.run(
        `
        CALL db.index.vector.queryNodes(
          'document_embedding_index',
          5,
          $embedding
        )
        YIELD node, score
        RETURN node.text AS text
        ORDER BY score DESC
        `,
        { embedding }
      );

      return res.records.map(r => r.get("text")).join("\n");
    } finally {
      await session.close();
    }
  }

  // --------------------
  // Claude client
  // --------------------
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  // --------------------
  // Agent loop
  // --------------------
  const userQuestion = "Come posso usare Neo4j per un RAG?";

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 800,
    tools: [
      {
        name: "vector_search",
        description: "Ricerca semantica su Neo4j",
        input_schema: {
          type: "object",
          properties: {
            query: { type: "string" }
          },
          required: ["query"]
        }
      }
    ],
    messages: [
      { role: "user", content: userQuestion }
    ]
  });

  const toolCall = response.content.find(
    (c: any) => c.type === "tool_use"
  ) as TextBlock;

  let finalAnswer = "";

  if (toolCall) {
    const toolResult = await vectorSearch(toolCall.text);

    const followUp = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 800,
      messages: [
        { role: "user", content: userQuestion },
        { role: "assistant", content: response.content },
        // {
        //   role: "tool",
        //   tool_name: "vector_search",
        //   content: toolResult
        // }
      ]
    });

    finalAnswer = followUp.content
      .map((c: any) => c.text)
      .join("");
  }

  console.log("\n🧠 Claude answer:\n");
  console.log(finalAnswer);

  await driver.close();
  await neo4jContainer.stop();
})();
