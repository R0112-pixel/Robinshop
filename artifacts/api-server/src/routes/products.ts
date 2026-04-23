import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, storesTable, productsTable } from "@workspace/db";
import {
  ListStoreProductsParams,
  CreateProductParams,
  CreateProductBody,
  RegenerateStoreProductsParams,
  GetProductParams,
  UpdateProductParams,
  UpdateProductBody,
  DeleteProductParams,
  TrackProductViewParams,
  TrackProductClickParams,
  ImproveProductParams,
} from "@workspace/api-zod";
import { requireAuth, type AuthedRequest } from "../lib/auth";
import { generateProductsOnly, improveProductCopy, type LanguageCode } from "../lib/ai";
import { aiRateLimit } from "../middlewares/rateLimit";
import { serializeProduct, productImageUrl } from "../lib/serialize";

const router: IRouter = Router();

async function ownStore(userId: string, storeId: string) {
  const [store] = await db
    .select()
    .from(storesTable)
    .where(and(eq(storesTable.id, storeId), eq(storesTable.userId, userId)))
    .limit(1);
  return store ?? null;
}

async function ownProduct(userId: string, productId: string) {
  const [row] = await db
    .select({
      product: productsTable,
      storeUserId: storesTable.userId,
    })
    .from(productsTable)
    .innerJoin(storesTable, eq(productsTable.storeId, storesTable.id))
    .where(eq(productsTable.id, productId))
    .limit(1);
  if (!row || row.storeUserId !== userId) return null;
  return row.product;
}

router.get("/stores/:id/products", async (req, res) => {
  const { id } = ListStoreProductsParams.parse(req.params);
  const rows = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.storeId, id));
  res.json(rows.map(serializeProduct));
});

router.post("/stores/:id/products", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const { id } = CreateProductParams.parse(req.params);
  const body = CreateProductBody.parse(req.body);

  const store = await ownStore(userId, id);
  if (!store) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const [inserted] = await db
    .insert(productsTable)
    .values({
      storeId: store.id,
      name: body.name,
      description: body.description,
      price: body.price.toFixed(2),
      imageUrl:
        body.imageUrl && body.imageUrl.length > 0
          ? body.imageUrl
          : productImageUrl(`${store.slug}-${body.name}`, Date.now() % 1000),
      source: body.source ?? "manual",
      category: body.category ?? "",
    })
    .returning();

  res.status(201).json(serializeProduct(inserted));
});

router.post(
  "/stores/:id/products/regenerate",
  requireAuth,
  aiRateLimit,
  async (req, res) => {
    const userId = (req as AuthedRequest).userId;
    const { id } = RegenerateStoreProductsParams.parse(req.params);

    const store = await ownStore(userId, id);
    if (!store) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const products = await generateProductsOnly(
      store.name,
      store.niche,
      store.description,
      store.language as LanguageCode,
    );

    await db
      .delete(productsTable)
      .where(
        and(
          eq(productsTable.storeId, store.id),
          eq(productsTable.source, "ai"),
        ),
      );

    const inserted = await db
      .insert(productsTable)
      .values(
        products.map((p, i) => ({
          storeId: store.id,
          name: p.name,
          description: p.description,
          price: p.price.toFixed(2),
          imageUrl: productImageUrl(
            `${store.slug}-regen-${Date.now()}-${p.name}`,
            i,
          ),
          source: "ai",
        })),
      )
      .returning();

    res.json(inserted.map(serializeProduct));
  },
);

router.get("/products/:productId", async (req, res) => {
  const { productId } = GetProductParams.parse(req.params);
  const [row] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(serializeProduct(row));
});

router.patch("/products/:productId", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const { productId } = UpdateProductParams.parse(req.params);
  const body = UpdateProductBody.parse(req.body);

  const product = await ownProduct(userId, productId);
  if (!product) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const [updated] = await db
    .update(productsTable)
    .set({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.price !== undefined && { price: body.price.toFixed(2) }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      ...(body.source !== undefined && { source: body.source }),
      ...(body.category !== undefined && { category: body.category }),
    })
    .where(eq(productsTable.id, productId))
    .returning();

  res.json(serializeProduct(updated));
});

router.delete("/products/:productId", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const { productId } = DeleteProductParams.parse(req.params);

  const product = await ownProduct(userId, productId);
  if (!product) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await db.delete(productsTable).where(eq(productsTable.id, productId));
  res.status(204).send();
});

router.post("/products/:productId/improve", requireAuth, aiRateLimit, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const { productId } = ImproveProductParams.parse(req.params);

  const product = await ownProduct(userId, productId);
  if (!product) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const [store] = await db
    .select()
    .from(storesTable)
    .where(eq(storesTable.id, product.storeId))
    .limit(1);
  if (!store) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const improved = await improveProductCopy(
    {
      name: product.name,
      description: product.description,
      price: Number(product.price),
      category: product.category,
    },
    { name: store.name, niche: store.niche },
    store.language as LanguageCode,
  );

  const [updated] = await db
    .update(productsTable)
    .set({
      description: improved.description,
      conversionScore: improved.conversionScore,
    })
    .where(eq(productsTable.id, productId))
    .returning();

  res.json(serializeProduct(updated));
});

router.post("/products/:productId/click", async (req, res) => {
  const { productId } = TrackProductClickParams.parse(req.params);
  const [updated] = await db
    .update(productsTable)
    .set({ clicks: sql`${productsTable.clicks} + 1` })
    .where(eq(productsTable.id, productId))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ count: updated.clicks });
});

router.post("/products/:productId/view", async (req, res) => {
  const { productId } = TrackProductViewParams.parse(req.params);
  const [updated] = await db
    .update(productsTable)
    .set({ views: sql`${productsTable.views} + 1` })
    .where(eq(productsTable.id, productId))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ count: updated.views });
});

export default router;
