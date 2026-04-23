import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, storesTable } from "@workspace/db";
import { GetDropshipSuggestionsParams } from "@workspace/api-zod";
import { requireAuth, type AuthedRequest } from "../lib/auth";
import {
  generateDropshipSuggestions,
  platformsForRegion,
  type LanguageCode,
} from "../lib/ai";
import { aiRateLimit } from "../middlewares/rateLimit";

const router: IRouter = Router();

function detectRegion(req: import("express").Request): string {
  const explicit = (req.query.region as string | undefined)?.toUpperCase();
  if (explicit) return explicit;
  const header =
    (req.headers["cf-ipcountry"] as string | undefined) ||
    (req.headers["x-vercel-ip-country"] as string | undefined) ||
    (req.headers["x-region"] as string | undefined);
  if (header) return header.toUpperCase();
  return "US";
}

router.get(
  "/stores/:id/dropshipping",
  requireAuth,
  aiRateLimit,
  async (req, res) => {
    const userId = (req as AuthedRequest).userId;
    const { id } = GetDropshipSuggestionsParams.parse(req.params);

    const [store] = await db
      .select()
      .from(storesTable)
      .where(and(eq(storesTable.id, id), eq(storesTable.userId, userId)))
      .limit(1);
    if (!store) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const region = detectRegion(req);
    const platforms = platformsForRegion(region);
    const items = await generateDropshipSuggestions(
      store.niche,
      region,
      store.language as LanguageCode,
    );

    res.json({
      region,
      platforms,
      items,
    });
  },
);

export default router;
