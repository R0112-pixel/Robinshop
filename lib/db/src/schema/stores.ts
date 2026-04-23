import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";

export const storesTable = pgTable("stores", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  niche: text("niche").notNull(),
  description: text("description").notNull(),
  tagline: text("tagline").notNull().default(""),
  themeName: text("theme_name").notNull().default(""),
  themeStyle: text("theme_style").notNull().default(""),
  primaryColor: text("primary_color").notNull().default("#111111"),
  accentColor: text("accent_color").notNull().default("#6366f1"),
  homepageHeadline: text("homepage_headline").notNull().default(""),
  homepageBody: text("homepage_body").notNull().default(""),
  visits: integer("visits").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type StoreRow = typeof storesTable.$inferSelect;
export type InsertStoreRow = typeof storesTable.$inferInsert;
