# RobinShop AI

AI-powered SaaS for instantly generating online stores. Users sign up, describe a niche, and the system auto-generates branding, homepage copy, and 5–10 products with images, descriptions, and prices. Each store gets a public storefront at `/s/:slug` plus an admin dashboard with analytics and product management.

## Tech stack
- pnpm monorepo (artifacts: `robinshop` web, `api-server` Express)
- React + Vite + Tailwind + shadcn/ui + framer-motion + wouter + react-query
- Express + Drizzle ORM + PostgreSQL
- Clerk (Replit-managed) for auth
- OpenAI via Replit AI Integrations for store/product generation
- OpenAPI + Orval codegen for typed client hooks (`@workspace/api-client-react`)

## Key paths
- `lib/api-spec/openapi.yaml` — API contract (regen client with `pnpm --filter @workspace/api-spec run codegen`)
- `lib/db/src/schema/{stores,products}.ts` — DB schema
- `artifacts/api-server/src/routes/` — stores, products, public, dashboard endpoints
- `artifacts/api-server/src/lib/ai.ts` — OpenAI store generation (with deterministic fallback)
- `artifacts/robinshop/src/App.tsx` — routes + ClerkProvider
- `artifacts/robinshop/src/pages/` — landing, sign-in/up, dashboard, new-store, store-admin, admin-product, public-store, public-products, public-product

## Routes
- `/` landing (signed-out) → `/dashboard` (signed-in)
- `/sign-in`, `/sign-up`
- `/dashboard`, `/stores/new`, `/stores/:id`, `/stores/:id/products/:productId`
- `/s/:slug`, `/s/:slug/products`, `/s/:slug/products/:productId`

## Notes
- Product images use `picsum.photos` seeded URLs (no image-gen costs).
- Prices stored as numeric strings; serialized to numbers on the client via `lib/serialize.ts`.
- Analytics: `stores.visits` and `products.views` incremented via public POST endpoints from storefront.
- Multi-language: stores have a `language` field (`en | fr | es | ar | sw`); all AI generations (store, product regen, marketing, dropshipping) prompt in that language.
- Products have a `source` field: `ai | manual | dropship`. Manual CRUD lives at `POST/PATCH/DELETE /products`; AI regen lives at `/stores/:id/products/regenerate` and only deletes `source='ai'` rows so manual + dropship products are preserved.
- Marketing engine (`/stores/:id/marketing`) generates TikTok scripts, Instagram captions, email sequences, and SEO blog posts; rate limited per user.
- Dropshipping (`/stores/:id/dropshipping`) returns AI-suggested trending products, filtered by region (auto-detect via headers or `?region=` query). Region → platform map (Amazon/eBay/Jumia) lives in `artifacts/api-server/src/lib/ai.ts`.
- Rate limiting: simple in-memory limiters in `artifacts/api-server/src/middlewares/rateLimit.ts` — `apiRateLimit` per IP, `aiRateLimit` per user on AI-generation endpoints.
