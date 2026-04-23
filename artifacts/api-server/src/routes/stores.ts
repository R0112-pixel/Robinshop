import { Router, type IRouter } from "express";
import { eq, and, desc, sql } from "drizzle-orm";
import { db, storesTable, productsTable } from "@workspace/db";
import {
  CreateStoreBody,
  UpdateStoreBody,
  UpdateStoreParams,
  GetStoreParams,
  DeleteStoreParams,
  TrackStoreVisitParams,
} from "@workspace/api-zod";
import { requireAuth, type AuthedRequest } from "../lib/auth";
import { generateStoreContent, type LanguageCode, SUPPORTED_LANGUAGES } from "../lib/ai";
import { aiRateLimit } from "../middlewares/rateLimit";
import {
  serializeStore,
  serializeProduct,
  slugify,
  productImageUrl,
} from "../lib/serialize";

const router: IRouter = Router();

router.get("/stores", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const rows = await db
    .select()
    .from(storesTable)
    .where(eq(storesTable.userId, userId))
    .orderBy(desc(storesTable.createdAt));

  const counts = await db
    .select({
      storeId: productsTable.storeId,
      count: sql<number>`count(*)::int`,
    })
    .from(productsTable)
    .groupBy(productsTable.storeId);
  const countMap = new Map(counts.map((c) => [c.storeId, Number(c.count)]));

  res.json(rows.map((r) => serializeStore(r, countMap.get(r.id) ?? 0)));
});

router.get("/stores/dashboard-summary", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const stores = await db
    .select()
    .from(storesTable)
    .where(eq(storesTable.userId, userId))
    .orderBy(desc(storesTable.visits));

  const storeIds = stores.map((s) => s.id);
  let totalProducts = 0;
  let totalProductViews = 0;
  let recentProducts: Array<typeof productsTable.$inferSelect> = [];

  if (storeIds.length > 0) {
    const products = await db
      .select()
      .from(productsTable)
      .orderBy(desc(productsTable.createdAt));
    const userProducts = products.filter((p) => storeIds.includes(p.storeId));
    totalProducts = userProducts.length;
    totalProductViews = userProducts.reduce((acc, p) => acc + p.views, 0);
    recentProducts = userProducts.slice(0, 6);
  }

  const totalVisits = stores.reduce((acc, s) => acc + s.visits, 0);

  const countByStore = new Map<string, number>();
  if (storeIds.length > 0) {
    const counts = await db
      .select({
        storeId: productsTable.storeId,
        count: sql<number>`count(*)::int`,
      })
      .from(productsTable)
      .groupBy(productsTable.storeId);
    counts.forEach((c) => countByStore.set(c.storeId, Number(c.count)));
  }

  res.json({
    totalStores: stores.length,
    totalProducts,
    totalVisits,
    totalProductViews,
    topStores: stores
      .slice(0, 5)
      .map((s) => serializeStore(s, countByStore.get(s.id) ?? 0)),
    recentProducts: recentProducts.map(serializeProduct),
  });
});

router.post("/stores", requireAuth, aiRateLimit, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const body = CreateStoreBody.parse(req.body);
  const language: LanguageCode = SUPPORTED_LANGUAGES.includes(
    (body.language ?? "en") as LanguageCode,
  )
    ? ((body.language ?? "en") as LanguageCode)
    : "en";

  const ai = await generateStoreContent(
    body.name,
    body.niche,
    body.description,
    language,
  );

  const baseSlug = slugify(body.name);
  let slug = baseSlug;
  for (let i = 0; i < 50; i++) {
    const existing = await db
      .select()
      .from(storesTable)
      .where(eq(storesTable.slug, slug))
      .limit(1);
    if (existing.length === 0) break;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const [store] = await db
    .insert(storesTable)
    .values({
      userId,
      slug,
      name: body.name,
      niche: body.niche,
      description: body.description,
      language,
      tagline: ai.tagline,
      themeName: ai.themeName,
      themeStyle: ai.themeStyle,
      primaryColor: ai.primaryColor,
      accentColor: ai.accentColor,
      homepageHeadline: ai.homepageHeadline,
      homepageBody: ai.homepageBody,
    })
    .returning();

  await db.insert(productsTable).values(
    ai.products.map((p, i) => ({
      storeId: store.id,
      name: p.name,
      description: p.description,
      price: p.price.toFixed(2),
      imageUrl: productImageUrl(`${slug}-${p.name}`, i),
    })),
  );

  res.status(201).json(serializeStore(store, ai.products.length));
});

router.get("/stores/:id", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const { id } = GetStoreParams.parse(req.params);
  const [store] = await db
    .select()
    .from(storesTable)
    .where(and(eq(storesTable.id, id), eq(storesTable.userId, userId)))
    .limit(1);
  if (!store) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productsTable)
    .where(eq(productsTable.storeId, store.id));
  res.json(serializeStore(store, Number(count)));
});

router.patch("/stores/:id", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const { id } = UpdateStoreParams.parse(req.params);
  const body = UpdateStoreBody.parse(req.body);

  const [existing] = await db
    .select()
    .from(storesTable)
    .where(and(eq(storesTable.id, id), eq(storesTable.userId, userId)))
    .limit(1);
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const [updated] = await db
    .update(storesTable)
    .set({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.niche !== undefined && { niche: body.niche }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.language !== undefined && { language: body.language }),
      ...(body.tagline !== undefined && { tagline: body.tagline }),
      ...(body.themeName !== undefined && { themeName: body.themeName }),
      ...(body.themeStyle !== undefined && { themeStyle: body.themeStyle }),
      ...(body.primaryColor !== undefined && { primaryColor: body.primaryColor }),
      ...(body.accentColor !== undefined && { accentColor: body.accentColor }),
      ...(body.homepageHeadline !== undefined && {
        homepageHeadline: body.homepageHeadline,
      }),
      ...(body.homepageBody !== undefined && { homepageBody: body.homepageBody }),
    })
    .where(eq(storesTable.id, id))
    .returning();

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productsTable)
    .where(eq(productsTable.storeId, updated.id));
  res.json(serializeStore(updated, Number(count)));
});

router.delete("/stores/:id", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const { id } = DeleteStoreParams.parse(req.params);
  await db
    .delete(storesTable)
    .where(and(eq(storesTable.id, id), eq(storesTable.userId, userId)));
  res.status(204).send();
});

router.post("/stores/:id/visit", async (req, res) => {
  const { id } = TrackStoreVisitParams.parse(req.params);
  const [updated] = await db
    .update(storesTable)
    .set({ visits: sql`${storesTable.visits} + 1` })
    .where(eq(storesTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ count: updated.visits });
});

export default router;
