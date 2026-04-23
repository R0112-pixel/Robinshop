import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { storesTable } from "./stores";

export const marketingAssetsTable = pgTable("marketing_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => storesTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  language: text("language").notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type MarketingAssetRow = typeof marketingAssetsTable.$inferSelect;
export type InsertMarketingAssetRow = typeof marketingAssetsTable.$inferInsert;
