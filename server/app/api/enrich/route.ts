/**
 * POST /api/enrich
 * Server-side enrichment using Jina Reader (scrape) + Groq (structure).
 * Keeps API keys on the server and returns a normalized enrichment payload.
 */

import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import {
  buildJinaUrl,
  safeParseJson,
  trimText,
  validateUrl,
} from "../../../lib/api-utils";
import type { EnrichmentResult } from "../../../lib/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | { url?: unknown }
      | null;

    const url = typeof body?.url === "string" ? body.url.trim() : "";

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    if (!validateUrl(url)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const jinaUrl = buildJinaUrl(url);
    const scrapeRes = await fetch(jinaUrl, {
      headers: { Accept: "text/plain" },
    }).catch(() => null);

    if (!scrapeRes || !scrapeRes.ok) {
      return NextResponse.json(
        { error: "Failed to scrape website" },
        { status: 502 }
      );
    }

    const scraped = trimText(await scrapeRes.text(), 8000);

    const systemPrompt =
      "You are a VC analyst assistant. Extract structured data from company website content. \nReturn valid JSON only with no markdown, no code fences, no explanation.";

    const userPrompt = `Analyze this website and return ONLY a JSON object with exactly these fields:
{
  "summary": "1-2 sentence description of what the company does",
  "what_they_do": ["3 to 6 specific bullet points about their product or service"],
  "keywords": ["5 to 10 relevant keywords or tags"],
  "signals": ["2 to 4 signals inferred from the page such as: careers page found, 
                  recent blog post detected, changelog present, open source repo linked, 
                  pricing page exists, recently updated content"]
}
Website content: [scraped text here]

Website content: [${scraped}]`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    } as any);

    const raw = completion.choices?.[0]?.message?.content ?? "";
    const parsed = safeParseJson(raw);

    if (!parsed) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const now = new Date().toISOString();

    const result: EnrichmentResult = {
      summary: (parsed as any).summary ?? "",
      what_they_do: Array.isArray((parsed as any).what_they_do)
        ? (parsed as any).what_they_do
        : [],
      keywords: Array.isArray((parsed as any).keywords) ? (parsed as any).keywords : [],
      signals: Array.isArray((parsed as any).signals) ? (parsed as any).signals : [],
      sources: [{ url: jinaUrl, timestamp: now }],
      cached_at: now,
    };

    return NextResponse.json(result);
  } catch (err) {
    // Prefer returning the Groq error message payload when available.
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as any).message)
        : err instanceof Error
          ? err.message
          : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
