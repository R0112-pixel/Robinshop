import { useState, useMemo } from "react";
import { useParams, Link } from "wouter";
import { useGetPublicStore, getGetPublicStoreQueryKey } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { StoreHeader } from "@/components/store-header";
import { Badge } from "@/components/ui/badge";

export default function PublicStoreProductsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const { data: payload, isLoading } = useGetPublicStore(slug!, {
    query: { enabled: !!slug, queryKey: getGetPublicStoreQueryKey(slug!) },
  });

  const categories = useMemo(() => {
    if (!payload) return [];
    const set = new Set<string>();
    payload.products.forEach((p) => {
      if (p.category && p.category.trim()) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [payload]);

  if (isLoading || !payload) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const { store, products } = payload;
  const filtered =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div
      className="min-h-[100dvh] flex flex-col font-sans bg-background"
      style={{
        '--store-primary': store.primaryColor || '#000',
        '--store-accent': store.accentColor || '#333',
      } as React.CSSProperties}
    >
      <StoreHeader slug={store.slug} storeName={store.name} />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">All Products</h1>
          <p className="text-muted-foreground">Browse our complete collection.</p>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Badge
              variant={activeCategory === "all" ? "default" : "outline"}
              className="cursor-pointer px-3 py-1.5 text-sm"
              style={activeCategory === "all" ? { backgroundColor: "var(--store-primary)" } : undefined}
              onClick={() => setActiveCategory("all")}
            >
              All
            </Badge>
            {categories.map((c) => (
              <Badge
                key={c}
                variant={activeCategory === c ? "default" : "outline"}
                className="cursor-pointer px-3 py-1.5 text-sm capitalize"
                style={activeCategory === c ? { backgroundColor: "var(--store-primary)" } : undefined}
                onClick={() => setActiveCategory(c)}
              >
                {c}
              </Badge>
            ))}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Link href={`/s/${store.slug}/products/${product.id}`} className="group block">
                <div className="bg-background rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-all h-full flex flex-col">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    {product.category && (
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{product.category}</div>
                    )}
                    <h3 className="font-medium text-lg mb-1">{product.name}</h3>
                    <div className="font-bold mt-auto pt-4" style={{ color: 'var(--store-primary)' }}>
                      ${product.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-12">
              No products in this category.
            </p>
          )}
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 border-t mt-auto text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} {store.name}.
      </footer>
    </div>
  );
}
