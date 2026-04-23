import { useParams, Link, useLocation } from "wouter";
import { useGetPublicStore, getGetPublicStoreQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { StoreHeader } from "@/components/store-header";
import { useCart } from "@/lib/cart";

export default function PublicCartPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { data: payload, isLoading } = useGetPublicStore(slug!, {
    query: { enabled: !!slug, queryKey: getGetPublicStoreQueryKey(slug!) },
  });
  const cart = useCart(slug!);

  if (isLoading || !payload) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const { store } = payload;
  const shipping = cart.subtotal > 0 ? 4.99 : 0;
  const tax = +(cart.subtotal * 0.08).toFixed(2);
  const total = cart.subtotal + shipping + tax;

  return (
    <div
      className="min-h-[100dvh] flex flex-col font-sans bg-background"
      style={{
        '--store-primary': store.primaryColor || '#000',
        '--store-accent': store.accentColor || '#333',
      } as React.CSSProperties}
    >
      <StoreHeader slug={store.slug} storeName={store.name} />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Your Cart</h1>

        {cart.items.length === 0 ? (
          <div className="border-2 border-dashed rounded-2xl py-20 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Your cart is empty</p>
            <p className="text-muted-foreground mb-6">Browse the shop to add some items.</p>
            <Link href={`/s/${store.slug}/products`}>
              <Button style={{ backgroundColor: 'var(--store-primary)' }} className="text-white">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 p-4 border rounded-xl bg-card"
                  data-testid={`cart-item-${item.productId}`}
                >
                  <Link
                    href={`/s/${store.slug}/products/${item.productId}`}
                    className="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0"
                  >
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-3">
                      <Link href={`/s/${store.slug}/products/${item.productId}`} className="font-semibold hover:underline">
                        {item.name}
                      </Link>
                      <button
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => cart.remove(item.productId)}
                        aria-label="Remove"
                        data-testid={`button-remove-${item.productId}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="inline-flex items-center border rounded-md">
                        <button
                          className="px-2 py-1 hover:bg-muted"
                          onClick={() => cart.updateQty(item.productId, item.qty - 1)}
                          aria-label="Decrease"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-sm font-medium min-w-[2rem] text-center">{item.qty}</span>
                        <button
                          className="px-2 py-1 hover:bg-muted"
                          onClick={() => cart.updateQty(item.productId, item.qty + 1)}
                          aria-label="Increase"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="font-bold text-lg" style={{ color: 'var(--store-primary)' }}>
                        ${(item.qty * item.price).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="border rounded-xl p-6 bg-card h-fit space-y-4 lg:sticky lg:top-6">
              <h2 className="font-bold text-lg">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <Button
                size="lg"
                className="w-full text-white"
                style={{ backgroundColor: 'var(--store-primary)' }}
                onClick={() => setLocation(`/s/${store.slug}/checkout`)}
                data-testid="button-checkout"
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Link
                href={`/s/${store.slug}/products`}
                className="block text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </main>

      <footer className="container mx-auto px-4 py-8 border-t mt-auto text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} {store.name}.
      </footer>
    </div>
  );
}
