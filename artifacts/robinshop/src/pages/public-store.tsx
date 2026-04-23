import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useGetPublicStore, getGetPublicStoreQueryKey, useTrackStoreVisit } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { StoreHeader } from "@/components/store-header";

export default function PublicStoreHomePage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: payload, isLoading } = useGetPublicStore(slug!, {
    query: { enabled: !!slug, queryKey: getGetPublicStoreQueryKey(slug!) },
  });

  const trackVisit = useTrackStoreVisit();

  useEffect(() => {
    if (payload?.store?.id) {
      trackVisit.mutate({ id: payload.store.id });
    }
  }, [payload?.store?.id]);

  if (isLoading || !payload) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  const { store, products } = payload;
  const featuredProducts = products.slice(0, 3);

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        '--store-primary': store.primaryColor || '#000',
        '--store-accent': store.accentColor || '#333',
      } as React.CSSProperties}
    >
      <StoreHeader slug={store.slug} storeName={store.name} />

      <main>
        <section className="py-24 md:py-32 px-4 relative overflow-hidden">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-8"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--store-primary) 15%, transparent)',
                  color: 'var(--store-primary)',
                }}
              >
                {store.themeName}
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                {store.homepageHeadline}
              </h1>

              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                {store.homepageBody}
              </p>

              <Link href={`/s/${store.slug}/products`}>
                <Button
                  size="lg"
                  className="h-14 px-8 text-white text-base shadow-lg"
                  style={{ backgroundColor: 'var(--store-primary)' }}
                >
                  Shop Collection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Featured Collection</h2>
              <Link href={`/s/${store.slug}/products`} className="text-sm font-medium hover:underline" style={{ color: 'var(--store-primary)' }}>
                View all products
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <Link href={`/s/${store.slug}/products/${product.id}`} className="group block">
                    <div className="bg-background rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition-all">
                      <div className="aspect-square bg-muted relative overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                          {product.description}
                        </p>
                        <div className="font-bold text-lg" style={{ color: 'var(--store-primary)' }}>
                          ${product.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 py-12 border-t mt-auto text-center text-muted-foreground">
        <div className="font-bold text-foreground mb-2">{store.name}</div>
        <p className="text-sm">{store.tagline}</p>
        <p className="text-xs mt-8 opacity-50">Powered by RobinShop AI</p>
      </footer>
    </div>
  );
}
