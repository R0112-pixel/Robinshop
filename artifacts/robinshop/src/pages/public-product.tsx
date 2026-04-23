import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useGetPublicStore, getGetPublicStoreQueryKey, useTrackProductView } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function PublicProductPage() {
  const { slug, productId } = useParams<{ slug: string, productId: string }>();
  
  const { data: payload, isLoading } = useGetPublicStore(slug!, {
    query: { enabled: !!slug, queryKey: getGetPublicStoreQueryKey(slug!) }
  });

  const trackView = useTrackProductView();

  useEffect(() => {
    if (productId) {
      trackView.mutate({ productId });
    }
  }, [productId]);

  if (isLoading || !payload) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const { store, products } = payload;
  const product = products.find(p => p.id === productId);

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found</div>;
  }

  const handleBuy = () => {
    toast("Demo store", { description: "Checkout coming soon in phase 2." });
  };

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

      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <Link href={`/s/${store.slug}/products`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="aspect-square bg-muted rounded-3xl overflow-hidden border shadow-sm"
          >
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{product.name}</h1>
              <div className="text-3xl font-medium" style={{ color: 'var(--store-primary)' }}>
                ${(product.price / 100).toFixed(2)}
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert">
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="pt-6 border-t">
              <Button 
                size="lg" 
                className="w-full h-14 text-lg text-white shadow-lg"
                style={{ backgroundColor: 'var(--store-primary)' }}
                onClick={handleBuy}
              >
                Buy Now
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
                <ShoppingBag size={14} /> Secure checkout powered by RobinShop
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 border-t mt-auto text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} {store.name}.
      </footer>
    </div>
  );
}
