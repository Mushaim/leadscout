import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { product, candidate } = await req.json();
  if (!candidate) return NextResponse.json({ error: "Pick a candidate." }, { status: 400 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "Server missing ANTHROPIC_API_KEY." }, { status: 503 });

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const res = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 700,
    system: "You write warm, specific, non-spammy B2B creator outreach. No fake flattery, no 'I hope this finds you well'. Lead with their work, then a clear, low-friction ask.",
    messages: [{
      role: "user",
      content:
        `Write a first DM and one follow-up (sent 3 days later if no reply) to this creator about a possible partnership. ` +
        `Keep each under 90 words. Reference their focus and use the suggested angle.\n\n` +
        `Product: ${product}\nCreator: @${candidate.handle} on ${candidate.platform} — ${candidate.focus}\nAngle: ${candidate.angle}\n\n` +
        `Format exactly as:\nDM:\n<message>\n\nFOLLOW-UP:\n<message>`,
    }],
  });
  const text = res.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("\n");
  return NextResponse.json({ text });
}
