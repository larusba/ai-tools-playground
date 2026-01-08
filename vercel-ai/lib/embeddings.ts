import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function embed(text: string): Promise<number[]> {
  const result = await generateText({
    model: openai("text-embedding-3-small"),
    prompt: text
  });
  return Array.from(result.text).map(c => c.charCodeAt(0));
}

export function cosineSim(a: number[], b: number[]): number {
  const dot = a.reduce((acc, val, i) => acc + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((acc, val) => acc + val*val, 0));
  const magB = Math.sqrt(b.reduce((acc, val) => acc + val*val, 0));
  return dot / (magA * magB);
}
