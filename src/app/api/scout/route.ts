import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { product, niche, platform, audience } = await req.json();
  if (!product) return NextResponse.json({ error: "Describe your product first." }, { status: 400 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "Server missing ANTHROPIC_API_KEY." }, { status: 503 });

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const res = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1800,
    tools: [{
      name: "candidates",
      description: "Return scored B2B creator/influencer candidates that fit the product.",
      input_schema: {
        type: "object",
        properties: {
          candidates: {
            type: "array",
            description: "6 realistic but FICTIONAL example creators (no real people).",
            items: {
              type: "object",
              properties: {
                handle: { type: "string", description: "plausible @handle" },
                platform: { type: "string" },
                followers: { type: "string", description: "e.g. '48k'" },
                focus: { type: "string", description: "what they post about" },
                matchScore: { type: "number", description: "0-100 fit with the product/ICP" },
                why: { type: "string", description: "one line: why they fit (or don't)" },
                angle: { type: "string", description: "the best hook to reach out with" },
              },
              required: ["handle", "platform", "followers", "focus", "matchScore", "why", "angle"],
            },
          },
        },
        required: ["candidates"],
      },
    }],
    tool_choice: { type: "tool", name: "candidates" },
    messages: [{
      role: "user",
      content:
        `Act as a B2B influencer-discovery agent. For this product, propose 6 FICTIONAL but realistic example ` +
        `creators who'd be strong partners, and score each 0-100 on fit. Be honest — vary the scores.\n\n` +
        `Product: ${product}\nIdeal niche: ${niche || "(infer)"}\nPlatform: ${platform || "any"}\nAudience size: ${audience || "any"}`,
    }],
  });

  const tool = res.content.find((b) => b.type === "tool_use") as { input?: { candidates: unknown[] } } | undefined;
  if (!tool?.input) return NextResponse.json({ error: "No candidates returned." }, { status: 500 });
  const candidates = (tool.input.candidates as { matchScore: number }[]).sort((a, b) => b.matchScore - a.matchScore);
  return NextResponse.json({ candidates });
}
