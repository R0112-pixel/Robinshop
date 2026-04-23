import { pgTable, text, integer, timestamp, uuid, numeric } from "drizzle-orm/pg-core";
import { storesTable } from "./stores";

export const productsTable = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => storesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url").notNull().default(""),
  source: text("source").notNull().default("ai"),
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ProductRow = typeof productsTable.$inferSelect;
export type InsertProductRow = typeof productsTable.$inferInsert;
