import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, storesTable, productsTable } from "@workspace/db";
import { GetPublicStoreParams } from "@workspace/api-zod";
import { serializeStore, serializeProduct } from "../lib/serialize";

const router: IRouter = Router();

router.get("/public/stores/:slug", async (req, res) => {
  const { slug } = GetPublicStoreParams.parse(req.params);
  const [store] = await db
    .select()
    .from(storesTable)
    .where(eq(storesTable.slug, slug))
    .limit(1);
  if (!store) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.storeId, store.id));
  res.json({
    store: serializeStore(store, products.length),
    products: products.map(serializeProduct),
  });
});

export default router;
