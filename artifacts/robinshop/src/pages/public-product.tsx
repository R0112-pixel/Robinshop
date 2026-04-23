import { useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import {
  useGetPublicStore,
  getGetPublicStoreQueryKey,
  useTrackProductView,
  useTrackProductClick,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { StoreHeader } from "@/components/store-header";
import { useCart } from "@/lib/cart";
import { basePath } from "@/App";

export default function PublicProductPage() {
  const { slug, productId } = useParams<{ slug: string; productId: string }>();
  const [, setLocation] = useLocation();

  const { data: payload, isLoading } = useGetPublicStore(slug!, {
    query: { enabled: !!slug, queryKey: getGetPublicStoreQueryKey(slug!) },
  });

  const trackView = useTrackProductView();
  const trackClick = useTrackProductClick();
  const cart = useCart(slug!);

  useEffect(() => {
    if (productId) {
      trackView.mutate({ productId });
    }
  }, [productId]);

  if (isLoading || !payload) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const { store, products } = payload;
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found</div>;
  }

  const inCart = cart.items.some((i) => i.productId === product.id);

  const handleAddToCart = () => {
    cart.add({
      productId: product.id,
      storeSlug: store.slug,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    trackClick.mutate({ productId: product.id });
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    if (!inCart) {
      cart.add({
        productId: product.id,
        storeSlug: store.slug,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      });
    }
    trackClick.mutate({ productId: product.id });
    setLocation(`${basePath}/s/${store.slug}/checkout`.replace(basePath, ""));
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col font-sans bg-background"
      style={{
        '--store-primary': store.primaryColor || '#000',
        '--store-accent': store.accentColor || '#333',
      } as React.CSSProperties}
    >
      <StoreHeader slug={store.slug} storeName={store.name} />

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
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-8"
          >
            <div>
              {product.category && (
                <div className="text-sm uppercase tracking-wider text-muted-foreground mb-2">{product.category}</div>
              )}
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{product.name}</h1>
              <div className="text-3xl font-medium" style={{ color: 'var(--store-primary)' }}>
                ${product.price.toFixed(2)}
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert">
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <div className="pt-6 border-t space-y-3">
              <Button
                size="lg"
                className="w-full h-14 text-lg text-white shadow-lg"
                style={{ backgroundColor: 'var(--store-primary)' }}
                onClick={handleBuyNow}
                data-testid="button-buy-now"
              >
                Buy Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full h-14 text-lg"
                onClick={handleAddToCart}
                data-testid="button-add-to-cart"
              >
                {inCart ? (
                  <>
                    <Check className="mr-2 h-5 w-5" /> Added — Add Another
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                  </>
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Secure checkout powered by RobinShop
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
