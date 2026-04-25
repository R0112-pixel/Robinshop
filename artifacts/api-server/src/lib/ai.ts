import OpenAI from "openai";
import { logger } from "./logger";

const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ?? "https://api.groq.com/openai/v1";
const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

const openai =
  baseURL && apiKey ? new OpenAI({ baseURL, apiKey }) : null;

export const SUPPORTED_LANGUAGES = ["en", "fr", "es", "ar", "sw"] as const;
export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_NAME: Record<LanguageCode, string> = {
  en: "English",
  fr: "French",
  es: "Spanish",
  ar: "Arabic",
  sw: "Swahili",
};

export const MARKETING_TYPES = ["tiktok", "instagram", "email", "seo"] as const;
export type MarketingType = (typeof MARKETING_TYPES)[number];

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

function fallbackStore(
  name: string,
  niche: string,
  description: string,
): GeneratedStoreContent {
  const [primary, accent] =
    FALLBACK_PALETTES[Math.floor(Math.random() * FALLBACK_PALETTES.length)];
  return {
    tagline: `${name} — curated ${niche} for the bold.`,
    themeName: "Modern Minimal",
    themeStyle: "Clean, contemporary, and confident.",
    primaryColor: primary,
    accentColor: accent,
    homepageHeadline: `Discover ${name}`,
    homepageBody:
      description || `Welcome to ${name}, your destination for ${niche}.`,
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
  language: LanguageCode = "en",
): Promise<GeneratedStoreContent> {
  if (!openai) return fallbackStore(name, niche, description);

  const langName = LANGUAGE_NAME[language];
  const prompt = `You are a senior brand strategist and copywriter. A user is launching a new online store.

Store name: ${name}
Niche: ${niche}
Description: ${description}
Target language: ${langName}

Write ALL human-readable text fields (tagline, themeName, themeStyle, homepageHeadline, homepageBody, product name and description) in ${langName}. Output strict JSON, no markdown, no commentary, with this shape:

{
  "tagline": "short 4-8 word tagline",
  "themeName": "name of the visual theme",
  "themeStyle": "one sentence describing the aesthetic",
  "primaryColor": "#hex (deep, brand-defining color)",
  "accentColor": "#hex (vibrant accent that pops on primary)",
  "homepageHeadline": "compelling 5-10 word storefront hero headline",
  "homepageBody": "2-3 sentence storefront hero subcopy",
  "products": [ /* exactly 8 products */
    { "name": "specific product name", "description": "1-2 sentence sales description", "price": 39.99 }
  ]
}

Prices in USD between 9.99 and 299.99.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      max_completion_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You output strict JSON. No markdown." },
        { role: "user", content: prompt },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw) as Partial<GeneratedStoreContent>;
    if (!parsed.products || !Array.isArray(parsed.products) || parsed.products.length === 0) {
      throw new Error("invalid AI response");
    }
    const f = fallbackStore(name, niche, description);
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
    return fallbackStore(name, niche, description);
  }
}

export async function generateProductsOnly(
  name: string,
  niche: string,
  description: string,
  language: LanguageCode = "en",
): Promise<GeneratedStoreContent["products"]> {
  const full = await generateStoreContent(name, niche, description, language);
  return full.products;
}

export interface GeneratedMarketingAsset {
  title: string;
  content: string;
}

const MARKETING_BRIEFS: Record<MarketingType, string> = {
  tiktok:
    "Write a viral 30-45 second TikTok ad script with: HOOK (first 3 seconds), PROBLEM, REVEAL, PROOF, CTA. Use punchy short lines, trending tone, no emojis. Format as labeled sections.",
  instagram:
    "Write an Instagram caption (max ~150 words) plus a separate line of 12-18 high-performing hashtags. Include a strong opener, value, and CTA. Format: caption first, then a line starting with 'Hashtags:' followed by the hashtags.",
  email:
    "Write a 3-email welcome / launch sequence. Each email needs Subject and Body. Email 1: warm welcome + brand story. Email 2: best-selling product showcase + social proof. Email 3: limited-time offer with urgency. Label clearly EMAIL 1, EMAIL 2, EMAIL 3.",
  seo: "Write an SEO blog post (~600-800 words) optimized for the store's niche. Include H1 title, 3-5 H2 sections, meta description (~150 chars labeled 'Meta Description:'), and 5 target keywords (labeled 'Keywords:'). Use markdown headings.",
};

const MARKETING_TITLES: Record<MarketingType, string> = {
  tiktok: "TikTok Ad Script",
  instagram: "Instagram Caption + Hashtags",
  email: "Email Welcome Sequence",
  seo: "SEO Blog Post",
};

function fallbackMarketing(
  type: MarketingType,
  storeName: string,
  niche: string,
): GeneratedMarketingAsset {
  const title = `${MARKETING_TITLES[type]} — ${storeName}`;
  const content =
    type === "tiktok"
      ? `HOOK: Stop scrolling. ${storeName} just changed ${niche} forever.\nPROBLEM: Tired of overpriced ${niche} that disappoints?\nREVEAL: Meet ${storeName} — handpicked ${niche} essentials.\nPROOF: Loved by thousands. Reviewed everywhere.\nCTA: Tap the link. Your new favorite is waiting.`
      : type === "instagram"
        ? `${storeName} is where ${niche} gets a glow-up. Discover handpicked pieces that turn heads and earn double-taps. New drops weekly. Link in bio.\n\nHashtags: #${niche.replace(/\s+/g, "")} #${storeName.replace(/\s+/g, "")} #shopnow #aesthetic #musthave #newin #curated #style #trending #ootd #lifestyle #design #brand #shopsmall #qualitymatters`
        : type === "email"
          ? `EMAIL 1\nSubject: Welcome to ${storeName}\nBody: We're so glad you're here. ${storeName} was built to bring you the best of ${niche} — curated, quality-first, and made to be loved.\n\nEMAIL 2\nSubject: The pieces everyone is talking about\nBody: These are the ${niche} bestsellers our community can't stop reordering. See why.\n\nEMAIL 3\nSubject: 48 hours only — your welcome offer\nBody: A small gift for joining: 15% off your first order. Ends in 48 hours.`
          : `# Why ${storeName} Is Redefining ${niche} in 2026\n\nMeta Description: Discover how ${storeName} is reshaping the ${niche} space with curation, quality, and craft.\n\nKeywords: ${niche}, ${storeName}, best ${niche}, premium ${niche}, online ${niche} store\n\n## The State of ${niche}\nLorem ipsum...\n\n## What ${storeName} Does Differently\nLorem ipsum...\n\n## The Curation Process\nLorem ipsum...\n\n## What Customers Are Saying\nLorem ipsum...\n\n## Where to Start\nLorem ipsum...`;
  return { title, content };
}

export async function generateMarketingAsset(
  type: MarketingType,
  store: { name: string; niche: string; description: string; tagline: string },
  language: LanguageCode = "en",
): Promise<GeneratedMarketingAsset> {
  if (!openai) return fallbackMarketing(type, store.name, store.niche);

  const langName = LANGUAGE_NAME[language];
  const brief = MARKETING_BRIEFS[type];
  const prompt = `You are a senior performance-marketing copywriter for an e-commerce brand.

Brand: ${store.name}
Niche: ${store.niche}
Tagline: ${store.tagline}
Brand description: ${store.description}
Output language: ${langName}

Task: ${brief}

Write all output in ${langName}. Return STRICT JSON: { "title": "short label", "content": "the full asset text" }. No markdown fencing.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      max_completion_tokens: 2048,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You output strict JSON. No markdown fencing." },
        { role: "user", content: prompt },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw) as Partial<GeneratedMarketingAsset>;
    if (!parsed.content) throw new Error("empty marketing content");
    return {
      title: parsed.title ?? `${MARKETING_TITLES[type]} — ${store.name}`,
      content: parsed.content,
    };
  } catch (err) {
    logger.warn({ err }, "marketing AI failed, using fallback");
    return fallbackMarketing(type, store.name, store.niche);
  }
}

// Quality / improvement engine ----------------------------------------------

export interface ImprovedProduct {
  description: string;
  conversionScore: number;
}

function fallbackImproveProduct(
  name: string,
  description: string,
): ImprovedProduct {
  const len = description.trim().length;
  const hasNumbers = /\d/.test(description);
  const hasCTA = /\b(buy|shop|order|get|grab|today|now)\b/i.test(description);
  let score = 40;
  if (len > 80) score += 15;
  if (len > 160) score += 10;
  if (hasNumbers) score += 10;
  if (hasCTA) score += 15;
  score = Math.max(20, Math.min(95, score + Math.floor(Math.random() * 10)));
  const punchier =
    description.length > 0
      ? `${description} Designed to be your new favorite — get yours today.`
      : `${name} — crafted for everyday excellence. Order yours today.`;
  return { description: punchier, conversionScore: score };
}

export async function improveProductCopy(
  product: { name: string; description: string; price: number; category: string },
  storeContext: { name: string; niche: string },
  language: LanguageCode = "en",
): Promise<ImprovedProduct> {
  if (!openai) return fallbackImproveProduct(product.name, product.description);

  const langName = LANGUAGE_NAME[language];
  const prompt = `You are a senior e-commerce conversion copywriter.

Brand: ${storeContext.name} (niche: ${storeContext.niche})
Product: ${product.name}
Category: ${product.category || "general"}
Current description: ${product.description}
Price: $${product.price.toFixed(2)}
Output language: ${langName}

Rewrite the description to maximize conversion: lead with the customer benefit, include a specific feature, social proof or sensory detail, and end with a soft CTA. Keep it 2-3 short sentences.

Then score the REWRITTEN description's conversion potential 0-100 (consider clarity, specificity, emotional appeal, and CTA strength).

Return STRICT JSON: { "description": "...", "conversionScore": 87 }`;

  try {
    const completion = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      max_completion_tokens: 600,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You output strict JSON. No markdown." },
        { role: "user", content: prompt },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw) as Partial<ImprovedProduct>;
    if (!parsed.description) throw new Error("empty");
    return {
      description: String(parsed.description),
      conversionScore: Math.max(
        0,
        Math.min(100, Number(parsed.conversionScore ?? 70) || 70),
      ),
    };
  } catch (err) {
    logger.warn({ err }, "improve product AI failed, using fallback");
    return fallbackImproveProduct(product.name, product.description);
  }
}

// Dropshipping suggestions ---------------------------------------------------

export interface DropshipSuggestion {
  name: string;
  description: string;
  estimatedPrice: number;
  trendScore: number;
  platform: "amazon" | "ebay" | "jumia";
  platformUrl: string;
}

const REGION_PLATFORMS: Record<string, Array<DropshipSuggestion["platform"]>> = {
  US: ["amazon", "ebay"],
  CA: ["amazon", "ebay"],
  GB: ["amazon", "ebay"],
  EU: ["amazon", "ebay"],
  NG: ["jumia", "amazon"],
  KE: ["jumia"],
  GH: ["jumia"],
  CI: ["jumia"],
  EG: ["jumia", "amazon"],
  ZA: ["amazon", "ebay"],
  DEFAULT: ["amazon", "ebay"],
};

export function platformsForRegion(
  region: string | undefined,
): Array<DropshipSuggestion["platform"]> {
  if (!region) return REGION_PLATFORMS.DEFAULT;
  return REGION_PLATFORMS[region.toUpperCase()] ?? REGION_PLATFORMS.DEFAULT;
}

function fallbackDropship(
  niche: string,
  platforms: Array<DropshipSuggestion["platform"]>,
): DropshipSuggestion[] {
  const ideas = [
    "Trending Mini Kit",
    "Compact Pro Tool",
    "Everyday Essentials Bundle",
    "Smart Travel Companion",
    "Premium Gift Set",
    "Viral Best-Seller",
  ];
  return ideas.map((name, i) => {
    const platform = platforms[i % platforms.length];
    const slug = encodeURIComponent(`${niche} ${name}`);
    const platformUrl =
      platform === "amazon"
        ? `https://www.amazon.com/s?k=${slug}`
        : platform === "ebay"
          ? `https://www.ebay.com/sch/i.html?_nkw=${slug}`
          : `https://www.jumia.com.ng/catalog/?q=${slug}`;
    return {
      name: `${niche} ${name}`,
      description: `Trending ${niche} pick — high search volume on ${platform}.`,
      estimatedPrice: Math.round((14 + Math.random() * 90) * 100) / 100,
      trendScore: Math.round(60 + Math.random() * 40),
      platform,
      platformUrl,
    };
  });
}

export async function generateDropshipSuggestions(
  niche: string,
  region: string | undefined,
  language: LanguageCode = "en",
): Promise<DropshipSuggestion[]> {
  const platforms = platformsForRegion(region);
  if (!openai) return fallbackDropship(niche, platforms);

  const langName = LANGUAGE_NAME[language];
  const prompt = `You are an e-commerce trend analyst. Suggest 6 trending dropshipping product ideas for the niche "${niche}" that would sell well on these platforms: ${platforms.join(", ")}.

Write product names and descriptions in ${langName}. Return STRICT JSON:
{
  "items": [
    {
      "name": "product name",
      "description": "1-2 sentence sales description",
      "estimatedPrice": 24.99,
      "trendScore": 87,
      "platform": "amazon" | "ebay" | "jumia"
    }
  ]
}

Pick the most fitting platform from the allowed list for each item. trendScore is 0-100. Prices in USD.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      max_completion_tokens: 1500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You output strict JSON. No markdown." },
        { role: "user", content: prompt },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw) as { items?: DropshipSuggestion[] };
    if (!parsed.items?.length) throw new Error("empty");
    return parsed.items.slice(0, 8).map((it) => {
      const platform = platforms.includes(it.platform) ? it.platform : platforms[0];
      const slug = encodeURIComponent(`${niche} ${it.name}`);
      const platformUrl =
        platform === "amazon"
          ? `https://www.amazon.com/s?k=${slug}`
          : platform === "ebay"
            ? `https://www.ebay.com/sch/i.html?_nkw=${slug}`
            : `https://www.jumia.com.ng/catalog/?q=${slug}`;
      return {
        name: String(it.name ?? "Trending product"),
        description: String(it.description ?? ""),
        estimatedPrice: Number(it.estimatedPrice ?? 19.99) || 19.99,
        trendScore: Math.max(0, Math.min(100, Number(it.trendScore ?? 70))),
        platform,
        platformUrl,
      };
    });
  } catch (err) {
    logger.warn({ err }, "dropship AI failed, using fallback");
    return fallbackDropship(niche, platforms);
  }
}
