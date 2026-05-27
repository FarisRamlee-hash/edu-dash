import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { topic } = await req.json();
  if (!topic) return NextResponse.json({ error: "topic required" }, { status: 400 });

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are helping a Malaysian school teacher create an English vocabulary worksheet.

Generate exactly 5 vocabulary words related to the topic: "${topic}"

Respond with valid JSON only, no markdown, no explanation:
{
  "words": [
    { "word": "...", "definition": "..." },
    { "word": "...", "definition": "..." },
    { "word": "...", "definition": "..." },
    { "word": "...", "definition": "..." },
    { "word": "...", "definition": "..." }
  ],
  "sentences": [
    "...",
    "...",
    "...",
    "...",
    "..."
  ]
}

Rules:
- Words should be appropriate for secondary school (Form 1-5) students
- Definitions should be simple and clear
- Each sentence must use one of the 5 vocabulary words naturally
- Sentences should be educational and relate to the topic`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  try {
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }
}
