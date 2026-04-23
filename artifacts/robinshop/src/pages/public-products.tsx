import { useParams, Link } from "wouter";
import { useGetPublicStore, getGetPublicStoreQueryKey } from "@workspace/api-client-react";
import { ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export default function PublicStoreProductsPage() {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: payload, isLoading } = useGetPublicStore(slug!, {
    query: { enabled: !!slug, queryKey: getGetPublicStoreQueryKey(slug!) }
  });

  if (isLoading || !payload) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const { store, products } = payload;

  return (
    <div 
      className="min-h-[100dvh] flex flex-col font-sans bg-background"
      style={{
        '--store-primary': store.primaryColor || '#000',
        '--store-accent': store.accentColor || '#333',
      } as React.CSSProperties}
    >
      <header className="container mx-auto px-4 h-20 flex items-center justify-between border-b">
        <Link href={`/s/${store.slug}`} className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div 
            className="w-8 h-8 rounded flex items-center justify-center text-white"
            style={{ backgroundColor: 'var(--store-primary)' }}
          >
            <ShoppingBag size={18} />
          </div>
          {store.name}
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href={`/s/${store.slug}`} className="text-muted-foreground hover:text-foreground">Home</Link>
          <Link href={`/s/${store.slug}/products`}>Shop</Link>
        </nav>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">All Products</h1>
          <p className="text-muted-foreground">Browse our complete collection.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product, i) => (
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
                    <h3 className="font-medium text-lg mb-1">{product.name}</h3>
                    <div className="font-bold mt-auto pt-4" style={{ color: 'var(--store-primary)' }}>
                      ${(product.price / 100).toFixed(2)}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 border-t mt-auto text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} {store.name}.
      </footer>
    </div>
  );
}
