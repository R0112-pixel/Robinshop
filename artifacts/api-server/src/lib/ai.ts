import OpenAI from "openai";
import { logger } from "./logger";

const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

const openai =
  baseURL && apiKey ? new OpenAI({ baseURL, apiKey }) : null;

export interface GeneratedStoreContent {
  tagline: string;
  themeName: string;
  themeStyle: string;
  primaryColor: string;
  accentColor: string;
  homepageHeadline: string;
  homepageBody: string;
  products: Array<{
    name: string;
    description: string;
    price: number;
  }>;
}

const FALLBACK_PALETTES = [
  ["#0f172a", "#6366f1"],
  ["#1f2937", "#10b981"],
  ["#111827", "#f59e0b"],
  ["#0c4a6e", "#06b6d4"],
  ["#3b0764", "#a855f7"],
  ["#7c2d12", "#f97316"],
];

function fallback(name: string, niche: string, description: string): GeneratedStoreContent {
  const [primary, accent] =
    FALLBACK_PALETTES[Math.floor(Math.random() * FALLBACK_PALETTES.length)];
  return {
    tagline: `${name} — curated ${niche} for the bold.`,
    themeName: "Modern Minimal",
    themeStyle: "Clean, contemporary, and confident.",
    primaryColor: primary,
    accentColor: accent,
    homepageHeadline: `Discover ${name}`,
    homepageBody: description || `Welcome to ${name}, your destination for ${niche}.`,
    products: Array.from({ length: 6 }).map((_, i) => ({
      name: `${niche} Essential ${i + 1}`,
      description: `Premium ${niche} item crafted for everyday excellence. A staple of the ${name} collection.`,
      price: Math.round((19 + Math.random() * 180) * 100) / 100,
    })),
  };
}

export async function generateStoreContent(
  name: string,
  niche: string,
  description: string,
): Promise<GeneratedStoreContent> {
  if (!openai) {
    return fallback(name, niche, description);
  }

  const prompt = `You are a senior brand strategist and copywriter. A user is launching a new online store.

Store name: ${name}
Niche: ${niche}
Their description: ${description}

Generate a complete store identity as STRICT JSON (no markdown fencing, no commentary) with this exact shape:

{
  "tagline": "short 4-8 word tagline",
  "themeName": "name of the visual theme (e.g. 'Velvet Noir', 'Coastal Linen')",
  "themeStyle": "one sentence describing the aesthetic",
  "primaryColor": "#hex (deep, brand-defining color)",
  "accentColor": "#hex (vibrant accent that pops on primary)",
  "homepageHeadline": "compelling 5-10 word storefront hero headline",
  "homepageBody": "2-3 sentence storefront hero subcopy that sells the brand promise",
  "products": [ /* exactly 8 products */
    { "name": "specific product name", "description": "1-2 sentence sales-focused description", "price": 39.99 }
  ]
}

Make products diverse, niche-specific, and realistic. Prices in USD between 9.99 and 299.99.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You output strict JSON. No markdown." },
        { role: "user", content: prompt },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw) as Partial<GeneratedStoreContent>;
    if (
      !parsed.products ||
      !Array.isArray(parsed.products) ||
      parsed.products.length === 0
    ) {
      throw new Error("invalid AI response");
    }
    const f = fallback(name, niche, description);
    return {
      tagline: parsed.tagline ?? f.tagline,
      themeName: parsed.themeName ?? f.themeName,
      themeStyle: parsed.themeStyle ?? f.themeStyle,
      primaryColor: parsed.primaryColor ?? f.primaryColor,
      accentColor: parsed.accentColor ?? f.accentColor,
      homepageHeadline: parsed.homepageHeadline ?? f.homepageHeadline,
      homepageBody: parsed.homepageBody ?? f.homepageBody,
      products: parsed.products.slice(0, 10).map((p) => ({
        name: String(p.name ?? "Untitled"),
        description: String(p.description ?? ""),
        price: Number(p.price ?? 0) || 0,
      })),
    };
  } catch (err) {
    logger.warn({ err }, "AI generation failed, using fallback");
    return fallback(name, niche, description);
  }
}

export async function generateProductsOnly(
  name: string,
  niche: string,
  description: string,
): Promise<GeneratedStoreContent["products"]> {
  const full = await generateStoreContent(name, niche, description);
  return full.products;
}
