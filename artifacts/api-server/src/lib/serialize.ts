import type { ProductRow, StoreRow, MarketingAssetRow } from "@workspace/db";

export function serializeStore(row: StoreRow, productCount: number) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    niche: row.niche,
    description: row.description,
    language: row.language,
    tagline: row.tagline,
    themeName: row.themeName,
    themeStyle: row.themeStyle,
    primaryColor: row.primaryColor,
    accentColor: row.accentColor,
    homepageHeadline: row.homepageHeadline,
    homepageBody: row.homepageBody,
    visits: row.visits,
    productCount,
    createdAt: row.createdAt.toISOString(),
  };
}

export function serializeProduct(row: ProductRow) {
  return {
    id: row.id,
    storeId: row.storeId,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    imageUrl: row.imageUrl,
    source: row.source,
    category: row.category,
    affiliateUrl: row.affiliateUrl,
    affiliateSource: row.affiliateSource,
    conversionScore: row.conversionScore,
    views: row.views,
    clicks: row.clicks,
    createdAt: row.createdAt.toISOString(),
  };
}

export function serializeMarketingAsset(row: MarketingAssetRow) {
  return {
    id: row.id,
    storeId: row.storeId,
    type: row.type,
    title: row.title,
    content: row.content,
    language: row.language,
    createdAt: row.createdAt.toISOString(),
  };
}

export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || "store";
}

export function productImageUrl(seed: string, idx: number): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}-${idx}/800/800`;
}
