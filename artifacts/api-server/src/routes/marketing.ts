import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, storesTable, marketingAssetsTable } from "@workspace/db";
import {
  ListMarketingAssetsParams,
  GenerateMarketingAssetParams,
  GenerateMarketingAssetBody,
  DeleteMarketingAssetParams,
  GetMarketingPackParams,
} from "@workspace/api-zod";
import { requireAuth, type AuthedRequest } from "../lib/auth";
import {
  generateMarketingAsset,
  type LanguageCode,
  type MarketingType,
} from "../lib/ai";
import { aiRateLimit } from "../middlewares/rateLimit";
import { serializeMarketingAsset } from "../lib/serialize";

const router: IRouter = Router();

router.get("/stores/:id/marketing", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const { id } = ListMarketingAssetsParams.parse(req.params);
  const [store] = await db
    .select()
    .from(storesTable)
    .where(and(eq(storesTable.id, id), eq(storesTable.userId, userId)))
    .limit(1);
  if (!store) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const rows = await db
    .select()
    .from(marketingAssetsTable)
    .where(eq(marketingAssetsTable.storeId, id))
    .orderBy(desc(marketingAssetsTable.createdAt));
  res.json(rows.map(serializeMarketingAsset));
});

router.post(
  "/stores/:id/marketing",
  requireAuth,
  aiRateLimit,
  async (req, res) => {
    const userId = (req as AuthedRequest).userId;
    const { id } = GenerateMarketingAssetParams.parse(req.params);
    const body = GenerateMarketingAssetBody.parse(req.body);

    const [store] = await db
      .select()
      .from(storesTable)
      .where(and(eq(storesTable.id, id), eq(storesTable.userId, userId)))
      .limit(1);
    if (!store) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const generated = await generateMarketingAsset(
      body.type as MarketingType,
      {
        name: store.name,
        niche: store.niche,
        description: store.description,
        tagline: store.tagline,
      },
      store.language as LanguageCode,
    );

    const [inserted] = await db
      .insert(marketingAssetsTable)
      .values({
        storeId: store.id,
        type: body.type,
        title: generated.title,
        content: generated.content,
        language: store.language,
      })
      .returning();

    res.status(201).json(serializeMarketingAsset(inserted));
  },
);

router.get("/stores/:id/marketing/pack", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const { id } = GetMarketingPackParams.parse(req.params);
  const [store] = await db
    .select()
    .from(storesTable)
    .where(and(eq(storesTable.id, id), eq(storesTable.userId, userId)))
    .limit(1);
  if (!store) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const assets = await db
    .select()
    .from(marketingAssetsTable)
    .where(eq(marketingAssetsTable.storeId, id))
    .orderBy(desc(marketingAssetsTable.createdAt));

  const TYPE_LABEL: Record<string, string> = {
    tiktok: "TikTok Ad Script",
    instagram: "Instagram Caption",
    email: "Email Sequence",
    seo: "SEO Blog Post",
  };

  const md =
    `# ${store.name} — Marketing Pack\n\n` +
    `Niche: ${store.niche}\nTagline: ${store.tagline}\nLanguage: ${store.language}\nGenerated: ${new Date().toISOString()}\n\n---\n\n` +
    (assets.length === 0
      ? "_No marketing assets generated yet._\n"
      : assets
          .map(
            (a) =>
              `## ${TYPE_LABEL[a.type] ?? a.type} — ${a.title}\n\n_${a.language} · ${a.createdAt.toISOString()}_\n\n${a.content}\n`,
          )
          .join("\n---\n\n"));

  const safeName = store.slug || "store";
  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${safeName}-marketing-pack.md"`,
  );
  res.send(md);
});

router.delete("/marketing/:assetId", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const { assetId } = DeleteMarketingAssetParams.parse(req.params);

  const [asset] = await db
    .select({
      asset: marketingAssetsTable,
      storeUserId: storesTable.userId,
    })
    .from(marketingAssetsTable)
    .innerJoin(storesTable, eq(marketingAssetsTable.storeId, storesTable.id))
    .where(eq(marketingAssetsTable.id, assetId))
    .limit(1);

  if (!asset || asset.storeUserId !== userId) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  await db.delete(marketingAssetsTable).where(eq(marketingAssetsTable.id, assetId));
  res.status(204).send();
});

export default router;
