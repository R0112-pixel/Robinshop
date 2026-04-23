import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, storesTable, productsTable } from "@workspace/db";
import {
  ListStoreProductsParams,
  RegenerateStoreProductsParams,
  GetProductParams,
  TrackProductViewParams,
} from "@workspace/api-zod";
import { requireAuth, type AuthedRequest } from "../lib/auth";
import { generateProductsOnly } from "../lib/ai";
import { serializeProduct, productImageUrl } from "../lib/serialize";

const router: IRouter = Router();

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
  const { id } = RegenerateStoreProductsParams.parse(req.params);

  const [store] = await db
    .select()
    .from(storesTable)
    .where(and(eq(storesTable.id, id), eq(storesTable.userId, userId)))
    .limit(1);
  if (!store) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const products = await generateProductsOnly(
    store.name,
    store.niche,
    store.description,
  );

  await db.delete(productsTable).where(eq(productsTable.storeId, store.id));

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
      })),
    )
    .returning();

  res.json(inserted.map(serializeProduct));
});

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
