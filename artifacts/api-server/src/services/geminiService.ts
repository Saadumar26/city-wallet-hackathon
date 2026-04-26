import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../lib/logger";
import type { ContextState, MerchantRules } from "@workspace/api-zod";

interface GeneratedOffer {
  headline: string;
  subtext: string;
  discountPercent: number;
  expiryMinutes: number;
  tone: string;
  ctaText: string;
}

const FALLBACK: GeneratedOffer = {
  headline: "Warm up with a cappuccino",
  subtext: "Cold outside, quiet café nearby",
  discountPercent: 15,
  expiryMinutes: 20,
  tone: "warm",
  ctaText: "Claim offer",
};

export async function generateOffer(
  context: ContextState,
  rules: MerchantRules,
): Promise<GeneratedOffer> {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    logger.warn("GEMINI_API_KEY not set, returning fallback offer");
    return FALLBACK;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const eventsHint = context.events?.hasNearbyEvent
      ? `\nNearby event: "${context.events.eventName}" (~${context.events.distanceMeters}m away, expected footfall: ${context.events.expectedFootfall}). When relevant, you may subtly reference this event in the headline or subtext.`
      : "";

    const prompt = `You are an AI offer generator for a city wallet app.
Generate a hyper-personalized offer based on this context.
Respond ONLY with a valid JSON object, no markdown, no explanation.

Context: ${JSON.stringify(context)}
Merchant rules: ${JSON.stringify(rules)}${eventsHint}

Return exactly this JSON structure:
{
  "headline": "max 8 words, emotional and situational",
  "subtext": "max 12 words, explains why this offer right now",
  "discountPercent": number, within merchant maxDiscountPercent,
  "expiryMinutes": number between 10 and 25,
  "tone": "warm" | "urgent" | "playful",
  "ctaText": "max 4 words"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    // Strip markdown code fences if present
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();
    const parsed = JSON.parse(cleaned) as Partial<GeneratedOffer>;

    const offer: GeneratedOffer = {
      headline: String(parsed.headline ?? FALLBACK.headline),
      subtext: String(parsed.subtext ?? FALLBACK.subtext),
      discountPercent: Math.min(
        Number(parsed.discountPercent ?? FALLBACK.discountPercent),
        rules.maxDiscountPercent,
      ),
      expiryMinutes: Math.max(
        10,
        Math.min(25, Number(parsed.expiryMinutes ?? FALLBACK.expiryMinutes)),
      ),
      tone: String(parsed.tone ?? rules.preferredTone),
      ctaText: String(parsed.ctaText ?? FALLBACK.ctaText),
    };
    return offer;
  } catch (err) {
    logger.warn({ err }, "Gemini generation failed, using fallback offer");
    return FALLBACK;
  }
}
