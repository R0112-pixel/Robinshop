import { logger } from "./logger";

export type AffiliateSource = "amazon" | "aliexpress" | "ebay";

const TAGS = {
  amazon: process.env.AMAZON_ASSOCIATE_TAG || "robinshop-20",
  aliexpress: process.env.ALIEXPRESS_AFFILIATE_ID || "robinshop",
  ebay: process.env.EBAY_CAMPAIGN_ID || "robinshop",
};

export const COMMISSION_RATE: Record<AffiliateSource, number> = {
  amazon: 0.05,
  aliexpress: 0.07,
  ebay: 0.04,
};

export function extractProductId(
  url: string,
  source: AffiliateSource,
): string | null {
  try {
    if (source === "amazon") {
      const m =
        url.match(/\/dp\/([A-Z0-9]{10})/) ||
        url.match(/\/gp\/product\/([A-Z0-9]{10})/) ||
        url.match(/\/([A-Z0-9]{10})(?:[/?]|$)/);
      return m ? m[1] : null;
    }
    if (source === "aliexpress") {
      const m = url.match(/item\/(\d+)/);
      return m ? m[1] : null;
    }
    if (source === "ebay") {
      const m = url.match(/itm\/(?:[\w-]+\/)?(\d+)/) || url.match(/itm\/(\d+)/);
      return m ? m[1] : null;
    }
    return null;
  } catch {
    return null;
  }
}

export function buildAffiliateUrl(
  productId: string,
  source: AffiliateSource,
  userId: string,
): string {
  const safeUser = encodeURIComponent(userId);
  if (source === "amazon") {
    return `https://www.amazon.com/dp/${productId}?tag=${TAGS.amazon}&ref=robinshop_${safeUser}`;
  }
  if (source === "aliexpress") {
    return `https://www.aliexpress.com/item/${productId}.html?aff_id=${TAGS.aliexpress}&user_id=${safeUser}`;
  }
  return `https://www.ebay.com/itm/${productId}?mkcid=1&mkrid=${TAGS.ebay}&userId=${safeUser}`;
}

export interface FetchedProductData {
  title: string;
  description: string;
  image: string;
  price: number;
}

export async function fetchProductData(
  productId: string,
  source: AffiliateSource,
): Promise<FetchedProductData | null> {
  const rapidKey = process.env.RAPIDAPI_KEY;

  try {
    if (source === "amazon" && rapidKey) {
      const r = await fetch(
        `https://real-time-amazon-data.p.rapidapi.com/product-details?asin=${productId}&country=US`,
        {
          headers: {
            "X-RapidAPI-Key": rapidKey,
            "X-RapidAPI-Host": "real-time-amazon-data.p.rapidapi.com",
          },
        },
      );
      if (r.ok) {
        const j: any = await r.json();
        const d = j?.data ?? {};
        const priceStr = String(d.product_price ?? "0").replace(/[^0-9.]/g, "");
        return {
          title: d.product_title || "Imported product",
          description: d.product_description || d.about_product?.join("\n") || "",
          image: d.product_photo || d.product_main_image_url || "",
          price: Number(priceStr) || 0,
        };
      }
    }
  } catch (err) {
    logger.warn({ err, productId, source }, "fetchProductData failed");
  }

  return null;
}
